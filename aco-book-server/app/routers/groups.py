from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import select

from app.utils import convert_general_format

from ..auth import verify_token
from ..database import Currency, FinancialRecord, User, UserGroup, UserGroupRelation, db

router = APIRouter()


class GroupSchema(BaseModel):
    name: str


@router.get("/groups/", tags=["groups"], response_class=JSONResponse)
async def get_all_groups(token: str = Cookie(None), db: Session = Depends(db.get_db)):
    user_id = verify_token(token)

    groups = (
        db.query(UserGroup)
        .join(UserGroupRelation, UserGroupRelation.group_id == UserGroup.id)
        .filter(UserGroupRelation.user_id == user_id)
        .all()
    )

    response_body = {
        "data": convert_general_format(groups),
    }

    return response_body


@router.post("/groups/", tags=["groups"], response_class=JSONResponse)
async def create_group(
    group_info: GroupSchema, token: str = Cookie(None), db: Session = Depends(db.get_db)
):
    user_id = verify_token(token)

    group = UserGroup(name=group_info.name)
    relation = UserGroupRelation(
        user_id=user_id, group_id=group.id, admin=True, approved=True
    )
    db.add(group)
    db.add(relation)
    db.commit()
    db.refresh(group)
    db.refresh(relation)

    return {"result": "OK"}


@router.get("/groups/{group_id}/members", tags=["groups"], response_class=JSONResponse)
async def get_group_users_info(
    group_id: int, token: str = Cookie(None), db: Session = Depends(db.get_db)
):
    user_id = verify_token(token)

    # Check if the group exists
    group = db.query(UserGroup).filter(UserGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the user is a member of the group
    member_check = (
        db.query(UserGroupRelation)
        .filter(
            UserGroupRelation.group_id == group_id, UserGroupRelation.user_id == user_id
        )
        .first()
    )
    if not member_check:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this group's members",
        )

    # Query to get group members
    members_query = (
        db.query(
            UserGroup.id.label("group_id"),
            UserGroup.name.label("group_name"),
            User.nickname,
            UserGroupRelation.admin,
            UserGroupRelation.approved,
        )
        .join(UserGroupRelation, UserGroupRelation.group_id == UserGroup.id)
        .join(User, User.id == UserGroupRelation.user_id)
        .filter(UserGroup.id == group_id)
    )

    results = members_query.all()
    members = [
        {
            "group_id": row.group_id,
            "group_name": row.group_name,
            "nickname": row.nickname,
            "admin": row.admin,
            "approved": row.approved,
        }
        for row in results
    ]

    return {"data": members}
