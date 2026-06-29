from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import hashlib, secrets

from .database import engine, Base, get_db
from .models import User, Order, Product, UserRole, OrderStatus
from .schemas import (
    RegisterRequest, LoginRequest, SendCodeRequest, ResetPasswordRequest,
    UpdateProfileRequest, AdminUpdateUserRequest, AdminCreateUserRequest,
    CreateOrderRequest, UpdateOrderStatusRequest,
    CreateProductRequest, UpdateProductRequest,
    RegisterWithCodeRequest,
)
from .email_utils import send_verification_code, verify_code

# --- 配置 ---
JWT_SECRET = "zzr-store-jwt-secret-2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30
# ---

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZZR Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 工具函数 ---

def _hash_password(pw: str) -> str:
    salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + pw).encode()).hexdigest()
    return f'{salt}${h}'


def _verify_password(pw: str, hashed: str) -> bool:
    salt, h = hashed.split('$', 1)
    return hashlib.sha256((salt + pw).encode()).hexdigest() == h


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """从 Authorization header 获取当前用户"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "登录已过期")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "用户不存在")
    return user


def require_admin(user: User = Depends(get_current_user)):
    if user.role not in (UserRole.admin, UserRole.owner):
        raise HTTPException(403, "需要管理员权限")
    return user


def require_owner(user: User = Depends(get_current_user)):
    if user.role != UserRole.owner:
        raise HTTPException(403, "需要老板权限")
    return user


# ==================== 认证 ====================

@app.post("/api/auth/register")
def register(req: RegisterWithCodeRequest, db: Session = Depends(get_db)):
    if not verify_code(req.email, req.code):
        raise HTTPException(400, "验证码错误或已过期")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "该邮箱已被注册")
    user = User(
        id="u" + str(int(datetime.now().timestamp() * 1000)),
        email=req.email,
        password_hash=_hash_password(req.password),
        name=req.name,
        role=UserRole.user,
    )
    db.add(user)
    db.commit()
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role.value}}


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not _verify_password(req.password, user.password_hash):
        raise HTTPException(400, "邮箱或密码错误")
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role.value}}


@app.post("/api/auth/send-code")
def send_code(req: SendCodeRequest):
    ok = send_verification_code(req.email)
    if not ok:
        raise HTTPException(500, "验证码发送失败，请检查邮箱地址或稍后重试")
    return {"message": "验证码已发送"}


@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if not verify_code(req.email, req.code):
        raise HTTPException(400, "验证码错误或已过期")
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(404, "该邮箱未注册")
    user.password_hash = _hash_password(req.new_password)
    db.commit()
    return {"message": "密码已重置"}


@app.get("/api/auth/me")
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)):
    try:
        user = get_current_user(authorization, db)
    except HTTPException:
        return {"user": None}
    return {"user": {"id": user.id, "email": user.email, "name": user.name, "phone": user.phone, "role": user.role.value}}


# ==================== 用户 ====================

@app.put("/api/user/profile")
def update_profile(req: UpdateProfileRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    if req.name is not None:
        user.name = req.name
    if req.phone is not None:
        user.phone = req.phone
    db.commit()
    return {"message": "已更新"}


# ==================== 管理员 - 用户管理 ====================

@app.get("/api/admin/users")
def admin_list_users(_=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": [{"id": u.id, "email": u.email, "name": u.name, "phone": u.phone, "role": u.role.value, "created_at": u.created_at.isoformat()} for u in users]}


@app.post("/api/admin/users")
def admin_create_user(req: AdminCreateUserRequest, _=Depends(require_admin), db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "该邮箱已被注册")
    user = User(
        id="u" + str(int(datetime.now().timestamp() * 1000)),
        email=req.email,
        password_hash=_hash_password(req.password),
        name=req.name,
        role=UserRole(req.role) if req.role else UserRole.user,
    )
    db.add(user)
    db.commit()
    return {"message": "已创建", "id": user.id}


@app.put("/api/admin/users/{user_id}")
def admin_update_user(user_id: str, req: AdminUpdateUserRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "用户不存在")
    if user.role in (UserRole.admin, UserRole.owner) and current_user.role != UserRole.owner:
        raise HTTPException(403, "无权修改管理员账号")
    if req.role is not None and current_user.role != UserRole.owner:
        raise HTTPException(403, "无权修改角色")
    if req.name is not None:
        user.name = req.name
    if req.phone is not None:
        user.phone = req.phone
    if req.role is not None:
        user.role = UserRole(req.role)
    db.commit()
    return {"message": "已更新"}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "用户不存在")
    # Admin can only delete regular users; owner can delete anyone except owner
    if user.role == UserRole.owner:
        raise HTTPException(400, "不能删除老板账号")
    if current_user.role != UserRole.owner and user.role == UserRole.admin:
        raise HTTPException(403, "无权删除管理员账号")
    db.delete(user)
    db.commit()
    return {"message": "已删除"}


# ==================== 订单 ====================

@app.post("/api/orders")
def create_order(req: CreateOrderRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    order = Order(
        id="ORD" + str(int(datetime.now().timestamp() * 1000)),
        user_id=user.id,
        items=req.items,
        total=req.total,
        shipping_name=req.shipping_name,
        shipping_phone=req.shipping_phone,
        shipping_address=req.shipping_address,
        shipping_city=req.shipping_city,
        shipping_zip=req.shipping_zip,
        payment_method=req.payment_method,
    )
    db.add(order)
    db.commit()
    return {"order_id": order.id}


@app.get("/api/orders/mine")
def get_my_orders(authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return {"orders": [{"id": o.id, "items": o.items, "total": o.total, "status": o.status.value, "tracking_number": o.tracking_number, "shipping": {"name": o.shipping_name, "phone": o.shipping_phone, "address": o.shipping_address, "city": o.shipping_city, "zip": o.shipping_zip}, "payment_method": o.payment_method, "created_at": o.created_at.isoformat(), "updated_at": o.updated_at.isoformat() if o.updated_at else None} for o in orders]}


@app.put("/api/orders/{order_id}/confirm-delivery")
def confirm_delivery(order_id: str, authorization: str = Header(None), db: Session = Depends(get_db)):
    user = get_current_user(authorization, db)
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(404, "订单不存在")
    if order.status != OrderStatus.shipped:
        raise HTTPException(400, "仅已发货的订单可以确认收货")
    order.status = OrderStatus.delivered
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "已确认收货"}


# ==================== 管理员 - 订单管理 ====================

@app.get("/api/admin/orders")
def admin_list_orders(_=Depends(require_admin), db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return {"orders": [{"id": o.id, "user_id": o.user_id, "items": o.items, "total": o.total, "status": o.status.value, "tracking_number": o.tracking_number, "shipping": {"name": o.shipping_name, "phone": o.shipping_phone, "address": o.shipping_address, "city": o.shipping_city, "zip": o.shipping_zip}, "payment_method": o.payment_method, "created_at": o.created_at.isoformat(), "updated_at": o.updated_at.isoformat() if o.updated_at else None} for o in orders]}


@app.put("/api/admin/orders/{order_id}/status")
def admin_update_order_status(order_id: str, req: UpdateOrderStatusRequest, _=Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "订单不存在")
    order.status = OrderStatus(req.status)
    if req.tracking_number:
        order.tracking_number = req.tracking_number
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "状态已更新"}


# ==================== 商品 ====================

@app.get("/api/products")
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return {"products": [{"id": p.id, "name": p.name, "category": p.category, "price": p.price, "description": p.description, "features": p.features, "colors": p.colors, "image": p.image, "brand": p.brand} for p in products]}


@app.post("/api/admin/products")
def admin_create_product(req: CreateProductRequest, _=Depends(require_admin), db: Session = Depends(get_db)):
    product = Product(
        id="p" + str(int(datetime.now().timestamp() * 1000)),
        name=req.name,
        category=req.category,
        price=req.price,
        description=req.description,
        features=req.features,
        colors=req.colors,
        image=req.image,
        brand=req.brand,
    )
    db.add(product)
    db.commit()
    return {"message": "已创建", "id": product.id}


@app.put("/api/admin/products/{product_id}")
def admin_update_product(product_id: str, req: UpdateProductRequest, _=Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "商品不存在")
    for field in ["name", "category", "price", "description", "features", "colors", "image", "brand"]:
        val = getattr(req, field, None)
        if val is not None:
            setattr(product, field, val)
    db.commit()
    return {"message": "已更新"}


@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(product_id: str, _=Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "商品不存在")
    db.delete(product)
    db.commit()
    return {"message": "已删除"}


# ==================== 种子数据 ====================

@app.on_event("startup")
def seed_data():
    from .database import SessionLocal
    from .email_utils import start_cleanup
    start_cleanup()
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "zzr2282328134@126.com").first():
            db.add(User(
                id="u0", email="zzr2282328134@126.com",
                password_hash=_hash_password("zzr123456"),
                name="老板", role=UserRole.owner,
            ))

        if not db.query(User).filter(User.email == "admin@zzr.com").first():
            db.add(User(
                id="u1", email="admin@zzr.com",
                password_hash=_hash_password("admin123"),
                name="管理员", role=UserRole.admin,
            ))

        if db.query(Product).count() == 0:
            default_products = [
                Product(id="m1", name="Z1", category="mouse", price=699, description="人体工学无线鼠标。贴合手掌的自然弧度，长时间使用不疲劳。", features=["人体工学设计", "PAW3395 传感器", "80小时续航", "USB-C 快充", "三模连接"], colors=["#1a1a1a", "#f5f5f0", "#c0a060"], image="/zzr-store/images/mouse-m2.svg", brand="ZZR"),
                Product(id="m2", name="R1", category="mouse", price=549, description="对称式无线鼠标。左右手通用，轻量化设计，精准操控。", features=["对称设计", "59g 超轻量", "PAW3311 传感器", "60小时续航", "RGB 灯效"], colors=["#f5f5f0", "#1a1a1a", "#e8d5c0"], image="/zzr-store/images/mouse-m1.svg", brand="ZZR"),
                Product(id="p1", name="MP1", category="mousepad", price=249, description="900×400mm 超大桌面垫。细腻针织表面，兼顾操控与顺滑。", features=["900×400mm", "针织表面", "5mm 橡胶底", "防水涂层", "防滑底纹"], colors=["#1a1a1a", "#f5f5f0", "#2d2d2d"], image="/zzr-store/images/pad-p1.svg", brand="ZZR"),
            ]
            for p in default_products:
                db.add(p)

        db.commit()
    finally:
        db.close()
