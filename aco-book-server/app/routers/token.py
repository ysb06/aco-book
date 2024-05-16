import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Cookie, Depends, Request, Response
from sqlalchemy.orm import Session

from ..database import User, db
from ..auth import hash_password, generate_token, verify_token
from .users import UserRequest
import urllib.parse

router = APIRouter()

@router.get("/token/")
async def check_token(token: str = Cookie(None)):
    verify_token(token)
    return {"state": "valid"}


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
    # Todo: 추후 서버를 외부 서버로 배포할 때, samesite='none' 부분을 수정해야 함.
    info = {"nickname": result[2]}
    json_info = json.dumps(info)
    encoded_info = urllib.parse.quote(json_info)
    
    res.set_cookie(key="token", value=token, samesite='none', secure=True)
    res.set_cookie(key="userinfo", value=encoded_info, samesite='none', secure=True)

    return {"state": "success"}
