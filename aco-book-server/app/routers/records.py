from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
import logging

from ..auth import verify_token
from ..database import Currency, FinancialRecord, User, db

logger = logging.getLogger(__name__)
router = APIRouter()


class RecordBaseSchema(BaseModel):
    date: Optional[datetime] = None
    category: Optional[str] = None
    detail: Optional[str] = None
    asset: Optional[str] = None
    payment_amount: Optional[float] = 0.0
    currency: Optional[Currency] = None
    approved_amount: Optional[float] = 0.0
    note: Optional[str] = None

    @validator("date", pre=True, always=True)
    def parse_date(cls, val):
        if isinstance(val, int):
            return datetime.fromtimestamp(val, timezone.utc)

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


class RecordChangeSchema(RecordBaseSchema):
    username: Optional[str] = None


class RecordResponseSchema(RecordBaseSchema):
    id: int
    full_name: str


@router.get("/records/", tags=["records"], response_class=JSONResponse)
async def get_record_all(
    res: Response, token: str = Cookie(None), db: Session = Depends(db.get_db)
):
    _, token = verify_token(token)

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

    res.set_cookie(key="token", value=token, httponly=True)
    return {"columns": column_names, "rows": records}


@router.post("/records/", tags=["records"], response_class=JSONResponse)
async def add_record(
    res: Response,
    record: RecordChangeSchema,
    token: str = Cookie(None),
    db: Session = Depends(db.get_db),
):
    user_id, token = verify_token(token)
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

    res.set_cookie(key="token", value=token, httponly=True)
    return dict(list(record.model_dump().items())[1:3])


@router.put("/records/{data_id}/", tags=["records"], response_class=JSONResponse)
async def update_record(
    res: Response,
    data_id: int,
    record: RecordChangeSchema,
    token: str = Cookie(None),
    db: Session = Depends(db.get_db),
):
    _, token = verify_token(token)
    new_data = record.model_dump(exclude_unset=True)
    if record.username is not None:
        del new_data["username"]
        new_data["user_id"] = db.query(User.id).filter(User.username == record.username).first()[0]

    db.query(FinancialRecord).filter(FinancialRecord.id == data_id).update(new_data)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    res.set_cookie(key="token", value=token, httponly=True)
    return {"message": "Record updated successfully"}


# Todo: 추후 구현하기
@router.delete("/records/{data_id}/", tags=["records"], response_class=JSONResponse)
async def delete_record(
    res: Response,
    data_id: int,
    token: str = Cookie(None),
    db: Session = Depends(db.get_db),
):
    _, token = verify_token(token)

    db.query(FinancialRecord).filter(FinancialRecord.id == data_id).delete()

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    res.set_cookie(key="token", value=token, httponly=True)
    return {"message": "Record delete successfully"}
