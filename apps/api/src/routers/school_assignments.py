from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Request, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.events.database import get_db_session
from src.security.auth import get_current_user
from src.db.users import PublicUser
from src.db.school_assignments import (
    SchoolAssignmentCreate,
    SchoolAssignmentUpdate,
    StudentSubmissionSubmit,
    TeacherSubmissionGrade,
)
from src.services.school_assignments.school_assignments import (
    create_school_assignment,
    get_school_assignments,
    get_school_assignment_by_uuid,
    get_student_assignments,
    submit_school_assignment,
    grade_school_assignment_submission,
    get_assignment_submissions,
)

router = APIRouter()


@router.post(
    "/org/{org_id}",
    summary="Yeni Okul Ödevi Oluştur",
    tags=["school_assignments"],
)
async def api_create_school_assignment(
    org_id: int,
    payload: SchoolAssignmentCreate,
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await create_school_assignment(db_session, current_user, org_id, payload)


@router.get(
    "/org/{org_id}",
    summary="Okul Ödevlerini Listele (Kategorisel & Sınıfsal)",
    tags=["school_assignments"],
)
async def api_get_school_assignments(
    org_id: int,
    usergroup_id: Optional[int] = Query(None, description="Sınıf ID filtresi"),
    grade_level: Optional[str] = Query(None, description="Sınıf seviyesi (1-12. Sınıf)"),
    grade_category: Optional[str] = Query(None, description="Kademe (İlkokul, Ortaokul, Lise)"),
    subject: Optional[str] = Query(None, description="Ders / Branş"),
    tool_type: Optional[str] = Query(None, description="Ödev stili (WHITEBOARD, WORKSHEET, vb.)"),
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_school_assignments(
        db_session,
        org_id,
        usergroup_id=usergroup_id,
        grade_level=grade_level,
        grade_category=grade_category,
        subject=subject,
        tool_type=tool_type,
    )


@router.get(
    "/student/my_assignments",
    summary="Öğrencinin Kayıtlı Sınıflarındaki Ödevleri",
    tags=["school_assignments"],
)
async def api_get_student_assignments(
    org_id: int = Query(..., description="Okul ID"),
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_student_assignments(db_session, current_user, org_id)


@router.get(
    "/{assignment_uuid}",
    summary="Ödev Detayı",
    tags=["school_assignments"],
)
async def api_get_school_assignment_detail(
    assignment_uuid: str,
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_school_assignment_by_uuid(db_session, assignment_uuid)


@router.post(
    "/{assignment_uuid}/submit",
    summary="Öğrenci Ödevini Teslim Et (Tahta, Metin, Test)",
    tags=["school_assignments"],
)
async def api_submit_school_assignment(
    assignment_uuid: str,
    payload: StudentSubmissionSubmit,
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await submit_school_assignment(db_session, current_user, assignment_uuid, payload)


@router.get(
    "/{assignment_uuid}/submissions",
    summary="Öğretmen Sınıfsal Teslim İnceleme Listesi",
    tags=["school_assignments"],
)
async def api_get_assignment_submissions(
    assignment_uuid: str,
    usergroup_id: Optional[int] = Query(None, description="Filtrelenecek sınıf ID"),
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_assignment_submissions(db_session, assignment_uuid, usergroup_id=usergroup_id)


@router.post(
    "/submissions/{submission_id}/grade",
    summary="Öğretmen Teslim Değerlendirme & Puanlama",
    tags=["school_assignments"],
)
async def api_grade_submission(
    submission_id: int,
    payload: TeacherSubmissionGrade,
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await grade_school_assignment_submission(db_session, current_user, submission_id, payload)
