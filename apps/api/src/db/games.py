from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from sqlalchemy import JSON, Column, Text
from sqlmodel import Field, SQLModel


def _now() -> str:
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()


class GameCategory(SQLModel, table=True):
    __tablename__ = "game_categories"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    category_uuid: str = Field(default="", index=True, unique=True)
    name: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    icon: str = Field(default="🎮")
    description: Optional[str] = None
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    target_org_ids: Optional[List[int]] = Field(default=None, sa_column=Column(JSON))
    creation_date: str = Field(default_factory=_now)


class Game(SQLModel, table=True):
    __tablename__ = "games"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    game_uuid: str = Field(default="", index=True, unique=True)
    category_id: Optional[int] = Field(default=None, foreign_key="game_categories.id", index=True)
    category_ids: Optional[List[int]] = Field(default=None, sa_column=Column(JSON)) # Multiple category IDs
    is_3d_simulation: bool = Field(default=False, index=True) # 3D simulation tag
    title: str = Field(index=True)
    slug: str = Field(index=True)
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None  # 1:1 square cover (media path or base64 data url)
    banner_image: Optional[str] = None     # Wide banner for 3D/featured carousel
    html_content: str = Field(default="", sa_column=Column(Text))  # Full playable HTML5/JS/Canvas/WebGL code
    grade_levels: List[str] = Field(default_factory=list, sa_column=Column(JSON))  # e.g. ["1. Sınıf", "2. Sınıf"]
    age_range: Optional[str] = None        # e.g. "6-10 Yaş"
    learning_objectives: Optional[str] = None # Kazanımlar
    status: str = Field(default="published", index=True) # "published", "draft", "coming_soon"
    is_featured: bool = Field(default=False) # shows in top 3D carousel
    featured_order: int = Field(default=0)
    target_org_ids: Optional[List[int]] = Field(default=None, sa_column=Column(JSON)) # None/empty = all schools
    play_count: int = Field(default=0)
    version: str = Field(default="1.0.0")  # e.g. "1.0.0"
    file_name: Optional[str] = None        # e.g. "game_v1.html"
    file_size_bytes: Optional[int] = None
    creation_date: str = Field(default_factory=_now)
    update_date: str = Field(default_factory=_now)


class GameReview(SQLModel, table=True):
    __tablename__ = "game_reviews"
    __table_args__ = {"extend_existing": True}

    id: Optional[int] = Field(default=None, primary_key=True)
    review_uuid: str = Field(default="", index=True, unique=True)
    game_id: int = Field(foreign_key="games.id", index=True)
    user_id: int = Field(index=True)
    org_id: Optional[int] = Field(default=None, index=True)
    rating: int = Field(default=5)  # 1 to 5 stars
    comment: Optional[str] = Field(default=None, sa_column=Column(Text))
    creation_date: str = Field(default_factory=_now)


# Pydantic Request / Response Schemas
class GameCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "🎮"
    description: Optional[str] = None
    display_order: Optional[int] = 0
    target_org_ids: Optional[List[int]] = None


class GameCategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    target_org_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None


class GameCategoryRead(BaseModel):
    id: int
    category_uuid: str
    name: str
    slug: str
    icon: str
    description: Optional[str] = None
    display_order: int
    is_active: bool
    target_org_ids: Optional[List[int]] = None


class GameCreate(BaseModel):
    category_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    is_3d_simulation: Optional[bool] = False
    title: str
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    banner_image: Optional[str] = None
    html_content: str
    grade_levels: List[str] = []
    age_range: Optional[str] = None
    learning_objectives: Optional[str] = None
    status: str = "published"
    is_featured: bool = False
    featured_order: int = 0
    target_org_ids: Optional[List[int]] = None
    version: Optional[str] = "1.0.0"
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None


class GameUpdate(BaseModel):
    category_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    is_3d_simulation: Optional[bool] = None
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    banner_image: Optional[str] = None
    html_content: Optional[str] = None
    grade_levels: Optional[List[str]] = None
    age_range: Optional[str] = None
    learning_objectives: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    featured_order: Optional[int] = None
    target_org_ids: Optional[List[int]] = None
    version: Optional[str] = None
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None


class GameRead(BaseModel):
    id: int
    game_uuid: str
    category_id: Optional[int] = None
    category_ids: Optional[List[int]] = None
    is_3d_simulation: bool = False
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    title: str
    slug: str
    description: Optional[str] = None
    thumbnail_image: Optional[str] = None
    banner_image: Optional[str] = None
    has_html_content: bool = True
    grade_levels: List[str] = []
    age_range: Optional[str] = None
    learning_objectives: Optional[str] = None
    status: str
    is_featured: bool
    featured_order: int
    target_org_ids: Optional[List[int]] = None
    play_count: int
    version: str = "1.0.0"
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    average_rating: float = 5.0
    ratings_count: int = 0
    creation_date: str
    update_date: str


class GameReviewCreate(BaseModel):
    rating: int = 5
    comment: Optional[str] = None


class GameReviewUserSummary(BaseModel):
    rating: int
    comment: Optional[str] = None


class GameRatingSummary(BaseModel):
    average_rating: float = 5.0
    ratings_count: int = 0
    my_review: Optional[GameReviewUserSummary] = None


class GameReviewReadAdmin(BaseModel):
    id: int
    review_uuid: str
    game_id: int
    game_title: str
    game_icon: Optional[str] = "🎮"
    user_id: int
    user_name: str
    user_email: str
    user_avatar: Optional[str] = None
    user_role: Optional[str] = None
    org_id: Optional[int] = None
    org_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    creation_date: str
