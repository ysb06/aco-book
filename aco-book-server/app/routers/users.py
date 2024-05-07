from sqlite3 import IntegrityError
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from sqlalchemy.exc import IntegrityError

from app.database import User, db
from app.auth import hash_password


class UserRequest(BaseModel):
    username: str
    password: str


class UserSignUpRequest(UserRequest):
    email: str
    name: str


router = APIRouter()


@router.get("/users/", tags=["users"])
async def get_users_info():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.post("/users/", tags=["users"])
async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(db.get_db)):
    new_user = User(
        username=user_data.username,
        password=hash_password(user_data.password),
        email=user_data.email,
        full_name=user_data.name,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Username already exists")
    db.refresh(new_user)
    return {"SignUp": "Complete"}


@router.get("/users/{username}", tags=["users"])
async def get_user_info(username: str):
    return {"username": username}
