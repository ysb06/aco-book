from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, Form, HTTPException, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import User, Database
import jwt


class AuthReq(BaseModel):
    token: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.create_tables()
    yield
    db.dispose()


FormInputType = Annotated[str, Form()]
db = Database()


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@app.get("/", response_class=HTMLResponse)
def get_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


def hash_password(password: str):
    # https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/
    # 위 사이트를 참고해서 좀 더 보안을 고려한
    return password


@app.post("/token/")
async def get_login_token(
    res: Response,
    username: FormInputType,
    password: FormInputType,
    db: Session = Depends(db.get_db),
):
    result = (
        db.query(User.username, User.password).filter(User.username == username).first()
    )
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect username")
    user, hashed_pw = result
    if hashed_pw != hash_password(password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = jwt.generate_token()
    res.set_cookie(key="token", value=token, httponly=True)

    return {"Login": "Complete"}


@app.post("/user/")
async def signup_user(
    username: FormInputType,
    password: FormInputType,
    name: FormInputType,
    db: Session = Depends(db.get_db),
):
    new_user = User(username=username, password=password, full_name=name)
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Username already exists")
    db.refresh(new_user)
    return {"username": username, "name": name}


@app.get("/book/", response_class=JSONResponse)
def get_book(request: Request, item: AuthReq = Depends()):
    return {"token": item.token}


@app.post("/book/", response_class=JSONResponse)
async def get_book(request: Request, token: str = Cookie(None)):
    if jwt.verify_token(token):
        return {"Result": "OK"}
    else:
        raise HTTPException(status_code=401, detail="Not Verified Token")
