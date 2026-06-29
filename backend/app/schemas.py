from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class RegisterWithCodeRequest(BaseModel):
    email: str
    password: str
    name: str
    code: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SendCodeRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class AdminUpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class AdminCreateUserRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "user"


class CreateOrderRequest(BaseModel):
    items: list
    total: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_zip: str
    payment_method: str


class UpdateOrderStatusRequest(BaseModel):
    status: str
    tracking_number: Optional[str] = None


class CreateProductRequest(BaseModel):
    name: str
    category: str
    price: float
    description: str = ""
    features: list = []
    colors: list = []
    image: str = ""
    brand: str = "ZZR"


class UpdateProductRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    features: Optional[list] = None
    colors: Optional[list] = None
    image: Optional[str] = None
    brand: Optional[str] = None
