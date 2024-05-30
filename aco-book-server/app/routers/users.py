from sqlite3 import IntegrityError
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from sqlalchemy.exc import IntegrityError

from app.database import User, db, UserGroup, UserGroupRelation
from app.auth import hash_password


class UserRequest(BaseModel):
    username: str
    password: str


class UserSignUpRequest(UserRequest):
    email: str
    name: str
    nickname: str


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
        nickname=user_data.nickname,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Username already exists")
    db.refresh(new_user)

    # Make base group for new user
    group = UserGroup(name=f"default_{new_user.username}", admin=new_user.id)
    db.add(group)
    db.commit()

    relation = UserGroupRelation(
        user_id=new_user.id, group_id=group.id, approved=True
    )
    db.add(relation)
    db.commit()
    
    db.refresh(group)
    db.refresh(relation)


    return {"Result": "Complete"}


@router.get("/users/{username}", tags=["users"])
async def get_user_info(username: str):
    return {"username": username}
