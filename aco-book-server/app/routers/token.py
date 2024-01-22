from fastapi import APIRouter, HTTPException
from fastapi import Depends, HTTPException, Response
from sqlalchemy.orm import Session
from users import UserRequest

from app.database import User
from auth import hash_password, generate_token

router = APIRouter()


@router.post("/token/")
async def get_login_token(
    res: Response, auth_data: UserRequest, db: Session = Depends(db.get_db)
):
    result = (
        db.query(User.id, User.password)
        .filter(User.username == auth_data.username)
        .first()
    )
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect username")
    if result[1] != hash_password(auth_data.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = generate_token(result[0])
    res.set_cookie(key="token", value=token, httponly=True)

    return {"Login": "Complete"}
