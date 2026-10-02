from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, Integer, JSON
from sqlmodel import Field, SQLModel


class ResourceFolder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    folder_uuid: str = Field(default="", index=True)
    org_id: int = Field(index=True)
    parent_id: Optional[int] = Field(default=None, index=True)
    name: str
    description: Optional[str] = None
    icon: str = Field(default="folder")
    color: str = Field(default="#3b82f6")
    is_locked: bool = Field(default=False)
    pin: Optional[str] = None
    target_type: str = Field(default="all")  # 'all', 'classrooms', 'students'
    target_ids: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    created_by: int = Field(index=True)
    creation_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    update_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ResourceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_uuid: str = Field(default="", index=True)
    org_id: int = Field(index=True)
    folder_id: Optional[int] = Field(default=None, index=True)
    title: str
    description: Optional[str] = None
    resource_type: str = Field(default="pdf")  # 'pdf', 'document', 'spreadsheet', 'presentation', 'image', 'video', 'audio', 'link', 'youtube'
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    external_url: Optional[str] = None
    subject: Optional[str] = None
    is_downloadable: bool = Field(default=True)
    is_locked: bool = Field(default=False)
    pin: Optional[str] = None
    target_type: str = Field(default="all")  # 'all', 'classrooms', 'students'
    target_ids: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    created_by: int = Field(index=True)
    uploader_name: Optional[str] = None
    uploader_role: Optional[str] = None
    views_count: int = Field(default=0)
    downloads_count: int = Field(default=0)
    creation_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    update_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ResourceAccessLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resource_id: int = Field(index=True)
    org_id: int = Field(index=True)
    user_id: int = Field(index=True)
    user_name: str
    user_role: str = Field(default="student")  # 'student', 'teacher', 'admin'
    action: str = Field(default="view")  # 'view', 'download'
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
