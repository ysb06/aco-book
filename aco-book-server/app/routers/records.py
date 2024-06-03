from datetime import datetime, timezone
from typing import List, Optional, Union

import pandas as pd
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from app.utils import generate_standard_response, parse_datetime

from ..auth import verify_token
from ..database import Asset, AssetRecord, UserGroupRelation, db

router = APIRouter()

class AssetRecordSchema(BaseModel):
    asset_id: int
    date: Optional[datetime] = None
    category: Optional[str] = None
    payment_amount: Union[int, float]
    currency: str
    approved_amount: Optional[Union[int, float]] = None

    @validator("date", pre=True, always=True)
    def parse_date(cls, val):
        if val is None:
            return datetime.now().astimezone(tz=timezone.utc)
        else:
            result = parse_datetime(val)
            return result

class DeleteAssetRecordSchema(BaseModel):
    id: List[int]


@router.get("/records/", tags=["records"], response_class=JSONResponse)
async def get_all_records(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    user_groups = select(UserGroupRelation.group_id).filter(UserGroupRelation.user_id == user_id).scalar_subquery()
    records = db.query(AssetRecord).join(Asset, AssetRecord.asset_id == Asset.id).filter(Asset.owner_group_id.in_(user_groups)).all()

    result = generate_standard_response(records, db_type=AssetRecord, db=db)
    
    return JSONResponse(result)


@router.post("/records/", tags=["records"], response_class=JSONResponse)
async def create_record(record_info: AssetRecordSchema, token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    # Verify the user is a member of the group owning the asset
    asset = db.query(Asset).filter(Asset.id == record_info.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    group_relation = db.query(UserGroupRelation).filter(UserGroupRelation.group_id == asset.owner_group_id, UserGroupRelation.user_id == user_id).first()
    if not group_relation:
        raise HTTPException(status_code=403, detail="You do not have permission to create a record for this asset")

    approved_amount = record_info.approved_amount if record_info.approved_amount is not None else record_info.payment_amount
    record = AssetRecord(
        asset_id=record_info.asset_id,
        date=record_info.date,
        category=record_info.category,
        payment_amount=record_info.payment_amount,
        currency=record_info.currency,
        approved_amount=approved_amount
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return JSONResponse(content={"result": "OK"})


@router.delete("/records/", tags=["records"], response_class=JSONResponse)
async def delete_record(targets: DeleteAssetRecordSchema, token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    # Get records and check if user has permission to delete them
    records = db.query(AssetRecord).filter(AssetRecord.id.in_(targets.id)).all()
    if not records:
        raise HTTPException(status_code=400, detail="No records found")

    for record in records:
        asset = db.query(Asset).filter(Asset.id == record.asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")

        group_relation = db.query(UserGroupRelation).filter(UserGroupRelation.group_id == asset.owner_group_id, UserGroupRelation.user_id == user_id).first()
        if not group_relation:
            raise HTTPException(status_code=403, detail=f"You do not have permission to delete the record for asset: {asset.name}")

    db.query(AssetRecord).filter(AssetRecord.id.in_(targets.id)).delete(synchronize_session=False)
    db.commit()

    return JSONResponse(content={"result": "OK"})

# --------------------------------------------

@router.get("/records/export", tags=["records"], response_class=FileResponse)
async def export_data(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    user_groups = select(UserGroupRelation.group_id).filter(UserGroupRelation.user_id == user_id).scalar_subquery()
    records = db.query(AssetRecord).join(Asset, AssetRecord.asset_id == Asset.id).filter(Asset.owner_group_id.in_(user_groups)).all()

    result = generate_standard_response(records, db_type=AssetRecord, db=db)
    df = pd.DataFrame(result["data"])
    
    file_path = f"./output/export_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    df.to_excel(file_path, index=False)

    # 파일을 반환
    return FileResponse(path=file_path, filename=file_path, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
