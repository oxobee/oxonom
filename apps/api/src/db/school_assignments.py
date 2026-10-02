from typing import List, Optional, Dict, Any
from enum import Enum
from sqlalchemy import Column, ForeignKey, Integer, String, Text, JSON, Boolean
from sqlmodel import Field, SQLModel


class GradeCategoryEnum(str, Enum):
    PRIMARY = "İlkokul (1-4)"
    MIDDLE = "Ortaokul (5-8)"
    HIGH = "Lise (9-12)"


class AssignmentToolTypeEnum(str, Enum):
    WHITEBOARD = "WHITEBOARD"      # İnteraktif Akıllı Tahta
    WORKSHEET = "WORKSHEET"        # Çalışma Kağıdı / Metin & Dosya
    QUIZ = "QUIZ"                  # İnteraktif Test / Alıştırma
    READING = "READING"            # Okuma & Sesli Anlatım / Özet
    PROJECT = "PROJECT"            # Proje & Araştırma Görevi


class SubmissionStatusEnum(str, Enum):
    PENDING = "PENDING"            # Henüz teslim edilmedi / Bekliyor
    SUBMITTED = "SUBMITTED"        # Teslim edildi / İnceleniyor
    GRADED = "GRADED"              # Öğretmen tarafından puanlandı ve değerlendirildi
    LATE = "LATE"                  # Geç teslim edildi


# ==========================================
# SchoolAssignment Database Models
# ==========================================

class SchoolAssignmentBase(SQLModel):
    title: str
    description: Optional[str] = None
    grade_level: str = "10. Sınıf"
    grade_category: str = GradeCategoryEnum.HIGH
    subject: str = "Matematik"
    tool_type: str = AssignmentToolTypeEnum.WHITEBOARD
    tool_data: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    board_uuid: Optional[str] = None
    usergroup_ids: Optional[List[int]] = Field(default_factory=list, sa_column=Column(JSON))
    due_date: Optional[str] = None
    max_score: int = 100
    published: bool = True


class SchoolAssignment(SchoolAssignmentBase, table=True):
    __tablename__ = "school_assignments"

    id: Optional[int] = Field(default=None, primary_key=True)
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"), index=True)
    )
    assignment_uuid: str = Field(default="", index=True)
    created_by: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    )
    creation_date: str = ""
    update_date: str = ""


# ==========================================
# SchoolAssignmentSubmission Database Models
# ==========================================

class SchoolAssignmentSubmission(SQLModel, table=True):
    __tablename__ = "school_assignment_submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: int = Field(
        sa_column=Column(Integer, ForeignKey("school_assignments.id", ondelete="CASCADE"), index=True)
    )
    org_id: int = Field(
        sa_column=Column(Integer, ForeignKey("organization.id", ondelete="CASCADE"), index=True)
    )
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), index=True)
    )
    usergroup_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("usergroup.id", ondelete="SET NULL"), nullable=True, index=True)
    )
    status: str = Field(default=SubmissionStatusEnum.PENDING)
    submission_date: Optional[str] = None
    student_content: Optional[Dict[str, Any]] = Field(default_factory=dict, sa_column=Column(JSON))
    score: Optional[int] = None
    teacher_feedback: Optional[str] = None
    graded_at: Optional[str] = None
    graded_by: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    )
    creation_date: str = ""
    update_date: str = ""


# ==========================================
# Pydantic Request / Response Schemas
# ==========================================

class SchoolAssignmentCreate(SQLModel):
    title: str
    description: Optional[str] = None
    grade_level: str = "10. Sınıf"
    grade_category: str = GradeCategoryEnum.HIGH
    subject: str = "Matematik"
    tool_type: str = AssignmentToolTypeEnum.WHITEBOARD
    tool_data: Optional[Dict[str, Any]] = None
    board_uuid: Optional[str] = None
    create_new_board: Optional[bool] = False
    new_board_name: Optional[str] = None
    usergroup_ids: List[int] = []
    due_date: Optional[str] = None
    max_score: int = 100
    published: bool = True


class SchoolAssignmentUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    grade_level: Optional[str] = None
    grade_category: Optional[str] = None
    subject: Optional[str] = None
    tool_type: Optional[str] = None
    tool_data: Optional[Dict[str, Any]] = None
    board_uuid: Optional[str] = None
    usergroup_ids: Optional[List[int]] = None
    due_date: Optional[str] = None
    max_score: Optional[int] = None
    published: Optional[bool] = None


class StudentSubmissionSubmit(SQLModel):
    student_content: Dict[str, Any]
    usergroup_id: Optional[int] = None


class TeacherSubmissionGrade(SQLModel):
    score: int
    teacher_feedback: Optional[str] = None
