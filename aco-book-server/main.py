from contextlib import asynccontextmanager
from typing import Annotated, Optional, Union
from datetime import datetime, timezone

from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import auth
from database import Database, User, Currency, FinancialRecord


class UserRequest(BaseModel):
    username: str
    password: str


class UserSignUpRequest(UserRequest):
    name: str


class RecordRequest(BaseModel):
    date: Optional[datetime] = None
    income: bool = False
    category: Optional[str] = None
    details: Optional[str] = None
    asset: Optional[str] = None
    payment_amount: float
    currency: Optional[Currency] = None
    approved_amount: Optional[float] = None
    note: Optional[str] = None

    @validator("date", pre=True, always=True)
    def parse_date(cls, val):
        if isinstance(val, int):
            return datetime.utcfromtimestamp(val)

        if isinstance(val, str):
            try:
                return datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
                    tzinfo=timezone.utc
                )
            except ValueError:
                raise ValueError("Invalid date format")
        
        if val is not None:
            raise ValueError("Unknown date format")

        return datetime.now()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.create_tables()
    yield
    db.dispose()


db = Database()
templates = Jinja2Templates(directory="templates")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
def get_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/token/")
async def get_login_token(
    res: Response,
    auth_data: UserRequest,
    db: Session = Depends(db.get_db),
):
    result = db.query(User.password).filter(User.username == auth_data.username).first()
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect username")
    if result[0] != auth.hash_password(auth_data.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = auth.generate_token(auth_data.username)
    res.set_cookie(key="token", value=token, httponly=True)

    return {"Login": "Complete"}


@app.post("/user/")
async def signup_user(
    user_data: UserSignUpRequest,
    db: Session = Depends(db.get_db),
):
    new_user = User(
        username=user_data.username,
        password=auth.hash_password(user_data.password),
        full_name=user_data.name,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Username already exists")
    db.refresh(new_user)
    return {"SignUp": "Complete"}


@app.post("/record/", response_class=JSONResponse)
async def post_record(
    record: RecordRequest,
    token: str = Cookie(None),
    db: Session = Depends(db.get_db),
):
    try:
        user_id = auth.verify_token(token)
        fi_rec = FinancialRecord(
            date=record.date,
            user_id=user_id,  # 유저 ID 설정
            in_out=record.income,
            category=record.category,
            details=record.details,
            asset=record.asset,
            payment_amount=record.payment_amount,
            currency=record.currency,
            approved_amount=record.approved_amount,
            note=record.note,
        )

        db.add(fi_rec)
        db.commit()
        db.refresh(fi_rec)

        return dict(list(record.model_dump().items())[:2])
    except auth.VerificationFailedError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except ValueError:
        raise HTTPException(status_code=400, detail="DateTime format may not correct")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/book/", response_class=JSONResponse)
async def get_book(request: Request, token: str = Cookie(None)):
    if auth.verify_token(token):
        return {"Result": "OK"}
    else:
        raise HTTPException(status_code=401, detail="Not Verified Token")
