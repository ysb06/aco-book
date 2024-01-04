from contextlib import asynccontextmanager
from typing import Optional
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
    detail: Optional[str] = None
    asset: Optional[str] = None
    payment_amount: float
    currency: Optional[Currency] = None
    approved_amount: Optional[float] = None
    note: Optional[str] = None

    @validator("date", pre=True, always=True)
    def parse_date(cls, val):
        if isinstance(val, int):
            return datetime.utcfromtimestamp(val).astimezone(tz=timezone.utc)

        if isinstance(val, str):
            try:
                return datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
                    tzinfo=timezone.utc
                )
            except ValueError:
                raise ValueError("Invalid date format")

        if val is not None:
            raise ValueError("Unknown date format")

        return datetime.now().astimezone(tz=timezone.utc)


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
    res: Response, auth_data: UserRequest, db: Session = Depends(db.get_db)
):
    result = (
        db.query(User.id, User.password)
        .filter(User.username == auth_data.username)
        .first()
    )
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect username")
    if result[1] != auth.hash_password(auth_data.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = auth.generate_token(result[0])
    res.set_cookie(key="token", value=token, httponly=True)

    return {"Login": "Complete"}


@app.post("/user/")
async def signup_user(user_data: UserSignUpRequest, db: Session = Depends(db.get_db)):
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


@app.get("/record/", response_class=JSONResponse)
async def get_record_all(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    _ = auth.verify_token(token)

    results = (
        db.query(FinancialRecord, User.full_name)
        .join(User, FinancialRecord.user_id == User.id)
        .all()
    )

    col_names = list(FinancialRecord.get_columns())
    col_names.remove("user_id")
    data = {
        "columns": col_names,
        "rows": [
            [getattr(result, col_name) for col_name in col_names] + [full_name]
            for result, full_name in results
        ],
    }
    data["columns"].append("full_name")
    return data


@app.post("/record/", response_class=JSONResponse)
async def post_record(
    record: RecordRequest, token: str = Cookie(None), db: Session = Depends(db.get_db)
):
    user_id = auth.verify_token(token)
    try:
        fi_rec = FinancialRecord(
            date=record.date,
            user_id=user_id,  # 유저 ID 설정
            in_out=record.income,
            category=record.category,
            detail=record.detail,
            asset=record.asset,
            payment_amount=record.payment_amount,
            currency=record.currency,
            approved_amount=record.approved_amount,
            note=record.note,
        )

        db.add(fi_rec)
        db.commit()
        db.refresh(fi_rec)
    except ValueError:
        raise HTTPException(status_code=400, detail="DateTime format may not correct")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return dict(list(record.model_dump().items())[:2])


@app.put("/record/", response_class=JSONResponse)
async def update_record(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    auth.verify_token(token)
    return
