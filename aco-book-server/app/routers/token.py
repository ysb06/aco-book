from typing import Optional
from fastapi import APIRouter, HTTPException, Cookie, Depends, Request, Response
from sqlalchemy.orm import Session

from ..database import User, db
from ..auth import hash_password, generate_token, verify_token
from .users import UserRequest

router = APIRouter()

@router.get("/token/")
async def check_token(res: Response, token: str = Cookie(None)):
    print("Check token...")
    print(res.headers.raw)
    print(token)
    _, token = verify_token(token)

    res.set_cookie(key="token", value=token, samesite='none', secure=True)
    return {"Result": "OK"}


@router.post("/token/")
async def get_login_token(
    res: Response, auth_data: UserRequest, db: Session = Depends(db.get_db)
):
    result = (
        db.query(User.id, User.password, User.nickname)
        .filter(User.username == auth_data.username)
        .first()
    )
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect username")
    if result[1] != hash_password(auth_data.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = generate_token(result[0])
    # res.set_cookie(key="token", value=token, httponly=True)
    res.set_cookie(key="token", value=token, samesite='none', secure=True)

    return {"nickname": result[2]}
