from typing import List

from fastapi import APIRouter, Cookie, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from app.utils import generate_standard_response

from ..auth import verify_token
from ..database import Asset, UserGroupRelation, db

router = APIRouter()

class AssetSchema(BaseModel):
    name: str
    asset_type: str
    currency: str
    owner_group_id: int

class DeleteAssetSchema(BaseModel):
    id: List[int]


@router.get("/assets/", tags=["assets"], response_class=JSONResponse)
async def get_all_assets(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    user_groups = select(UserGroupRelation.group_id).filter(UserGroupRelation.user_id == user_id).scalar_subquery()
    assets = db.query(Asset).filter(Asset.owner_group_id.in_(user_groups)).all()

    result = generate_standard_response(assets, db_type=Asset, db=db)
    return JSONResponse(result)


@router.post("/assets/", tags=["assets"], response_class=JSONResponse)
async def create_asset(asset_info: AssetSchema, token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    group_relation = db.query(UserGroupRelation).filter(UserGroupRelation.group_id == asset_info.owner_group_id, UserGroupRelation.user_id == user_id).first()
    if not group_relation:
        raise HTTPException(status_code=403, detail="You do not have permission to create an asset for this group")

    asset = Asset(
        name=asset_info.name,
        asset_type=asset_info.asset_type,
        currency=asset_info.currency,
        owner_group_id=asset_info.owner_group_id
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return JSONResponse(content={"result": "OK"})


@router.delete("/assets/", tags=["assets"], response_class=JSONResponse)
async def delete_asset(targets: DeleteAssetSchema, token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    # Get assets and check if user has permission to delete them
    assets = db.query(Asset).filter(Asset.id.in_(targets.id)).all()
    if not assets:
        raise HTTPException(status_code=400, detail="No assets found")

    for asset in assets:
        group_relation = db.query(UserGroupRelation).filter(UserGroupRelation.group_id == asset.owner_group_id, UserGroupRelation.user_id == user_id).first()
        if not group_relation:
            raise HTTPException(status_code=403, detail=f"You do not have permission to delete the asset: {asset.name}")

    db.query(Asset).filter(Asset.id.in_(targets.id)).delete(synchronize_session=False)
    db.commit()

    return JSONResponse(content={"result": "OK"})
