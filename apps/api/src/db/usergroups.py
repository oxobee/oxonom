from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, SQLModel


class UserGroupBase(SQLModel):
    name: str
    description: str
    join_code: Optional[str] = None
    grade_level: Optional[str] = None


class UserGroup(UserGroupBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"), nullable=False)
    )
    usergroup_uuid: str = ""
    creation_date: str = ""
    update_date: str = ""


class UserGroupCreate(UserGroupBase):
    org_id: int = Field(default=None, foreign_key="organization.id")
    pass


class UserGroupUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    grade_level: Optional[str] = None
    join_code: Optional[str] = None


class UserGroupRead(UserGroupBase):
    id: int
    org_id: int = Field(default=None, foreign_key="organization.id")
    usergroup_uuid: str
    creation_date: str
    update_date: str
    member_count: Optional[int] = None
    pass


class JoinCodeRequest(BaseModel):
    code: str
    org_id: Optional[int] = None


class JoinCodeResponse(BaseModel):
    status: str
    message: str
    usergroup: Optional[UserGroupRead] = None
