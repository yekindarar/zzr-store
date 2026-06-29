from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Text
from sqlalchemy import Enum as SAEnum
from datetime import datetime, timezone
import enum
from .database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    owner = "owner"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, default="")
    phone = Column(String, default="")
    role = Column(SAEnum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class OrderStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    items = Column(JSON, default=list)
    total = Column(Float, default=0)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending)
    shipping_name = Column(String, default="")
    shipping_phone = Column(String, default="")
    shipping_address = Column(String, default="")
    shipping_city = Column(String, default="")
    shipping_zip = Column(String, default="")
    payment_method = Column(String, default="")
    tracking_number = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, default="")
    features = Column(JSON, default=list)
    colors = Column(JSON, default=list)
    image = Column(String, default="")
    brand = Column(String, default="ZZR")
