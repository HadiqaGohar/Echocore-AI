from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from passlib.context import CryptContext
from jose import jwt

from ..database import get_session
from ..models import User
from ..schemas import UserRegister, UserLogin, Token, UserPublic
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/register", response_model=UserPublic)
def register(data: UserRegister, session: Session = Depends(get_session)):
    # Check existing
    existing = session.exec(
        select(User).where((User.username == data.username) | (User.email == data.email))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already taken")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=pwd_context.hash(data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == data.username)).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return Token(access_token=token)
