from fastapi import APIRouter
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.database import Currency, Database, FinancialRecord, User, lifespan
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, validator

from sqlalchemy.orm import Session

import app.auth as auth


class RecordRequest(BaseModel):
    username: Optional[str] = None
    date: Optional[datetime] = None
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


class RecordResponseSchema(BaseModel):
    id: int
    date: str
    category: str
    detail: str
    asset: str
    payment_amount: float
    currency: str
    approved_amount: float
    note: str
    full_name: str


router = APIRouter()


@router.get("/records/", response_class=JSONResponse)
async def get_record_all(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    _ = auth.verify_token(token)

    results = (
        db.query(FinancialRecord, User.full_name)
        .join(User, FinancialRecord.user_id == User.id)
        .all()
    )

    column_names = list(RecordResponseSchema.model_fields.keys())
    records = [
        [
            getattr(record, col) if hasattr(record, col) else full_name
            for col in column_names
        ]
        for record, full_name in results
    ]

    return {"columns": column_names, "rows": records}


@app.post("/record/", response_class=JSONResponse)
async def post_record(
    record: RecordRequest, token: str = Cookie(None), db: Session = Depends(db.get_db)
):
    user_id = auth.verify_token(token)
    if record.username is not None:
        user_id = db.query(User.id).filter(User.username == record.username).first()[0]

    try:
        fi_rec = FinancialRecord(
            date=record.date,
            user_id=user_id,  # 유저 ID 설정
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

    return dict(list(record.model_dump().items())[1:3])


@app.put("/record/", response_class=JSONResponse)
async def update_record(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    auth.verify_token(token)
    return
