from typing import Optional
from sqlalchemy import Column, Integer, Text, JSON
from sqlmodel import Field, SQLModel


class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    message: str = Field(sa_column=Column(Text, nullable=False))
    reaction: Optional[str] = None  # 'happy', 'neutral', 'sad'
    category: Optional[str] = None  # 'Hata', 'Öneri', 'İçerik', 'Diğer'
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    org_name: Optional[str] = None
    org_slug: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    page_url: Optional[str] = None
    attachments: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    created_at: str = ""
