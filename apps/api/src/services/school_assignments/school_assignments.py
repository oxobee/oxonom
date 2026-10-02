import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_, or_, func
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status

from src.db.school_assignments import (
    SchoolAssignment,
    SchoolAssignmentSubmission,
    SchoolAssignmentCreate,
    SchoolAssignmentUpdate,
    StudentSubmissionSubmit,
    TeacherSubmissionGrade,
    SubmissionStatusEnum,
)
from src.db.boards import Board
from src.db.usergroups import UserGroup
from src.db.usergroup_user import UserGroupUser
from src.db.users import User, PublicUser


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def create_school_assignment(
    db_session: AsyncSession,
    current_user: PublicUser,
    org_id: int,
    payload: SchoolAssignmentCreate,
) -> Dict[str, Any]:
    # Check if a new whiteboard should be created automatically
    board_uuid = payload.board_uuid
    if payload.tool_type == "WHITEBOARD" and (payload.create_new_board or not board_uuid):
        new_board_uuid = f"board_{uuid.uuid4().hex[:12]}"
        board_name = payload.new_board_name or f"{payload.title} — Ödev Tahtası"
        new_board = Board(
            org_id=org_id,
            board_uuid=new_board_uuid,
            name=board_name,
            description=payload.description or "Ödev için hazırlanan interaktif akıllı tahta.",
            created_by=current_user.id,
            usergroup_id=payload.usergroup_ids[0] if payload.usergroup_ids else None,
            public=True,
            creation_date=_now(),
            update_date=_now(),
        )
        db_session.add(new_board)
        await db_session.flush()
        board_uuid = new_board_uuid

    asg_uuid = f"sch_asg_{uuid.uuid4().hex[:12]}"
    assignment = SchoolAssignment(
        org_id=org_id,
        assignment_uuid=asg_uuid,
        title=payload.title,
        description=payload.description,
        grade_level=payload.grade_level,
        grade_category=payload.grade_category,
        subject=payload.subject,
        tool_type=payload.tool_type,
        tool_data=payload.tool_data or {},
        board_uuid=board_uuid,
        usergroup_ids=payload.usergroup_ids or [],
        due_date=payload.due_date,
        max_score=payload.max_score,
        published=payload.published,
        created_by=current_user.id,
        creation_date=_now(),
        update_date=_now(),
    )
    db_session.add(assignment)
    await db_session.commit()
    await db_session.refresh(assignment)

    return await format_assignment_dict(db_session, assignment)


async def get_school_assignments(
    db_session: AsyncSession,
    org_id: int,
    usergroup_id: Optional[int] = None,
    grade_level: Optional[str] = None,
    grade_category: Optional[str] = None,
    subject: Optional[str] = None,
    tool_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    stmt = select(SchoolAssignment).where(SchoolAssignment.org_id == org_id)

    if grade_category and grade_category != "all":
        stmt = stmt.where(SchoolAssignment.grade_category == grade_category)
    if grade_level and grade_level != "all":
        stmt = stmt.where(SchoolAssignment.grade_level == grade_level)
    if subject and subject != "all":
        stmt = stmt.where(SchoolAssignment.subject == subject)
    if tool_type and tool_type != "all":
        stmt = stmt.where(SchoolAssignment.tool_type == tool_type)

    stmt = stmt.order_by(SchoolAssignment.id.desc())
    result = await db_session.execute(stmt)
    assignments = result.scalars().all()

    items = []
    for asg in assignments:
        # Check usergroup filter if specified
        if usergroup_id and usergroup_id != 0:
            if asg.usergroup_ids and usergroup_id not in asg.usergroup_ids:
                continue

        item = await format_assignment_dict(db_session, asg)
        items.append(item)

    return items


async def get_school_assignment_by_uuid(
    db_session: AsyncSession,
    assignment_uuid: str,
) -> Dict[str, Any]:
    stmt = select(SchoolAssignment).where(SchoolAssignment.assignment_uuid == assignment_uuid)
    result = await db_session.execute(stmt)
    asg = result.scalar_one_or_none()
    if not asg:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")
    return await format_assignment_dict(db_session, asg)


async def get_student_assignments(
    db_session: AsyncSession,
    current_user: PublicUser,
    org_id: int,
) -> List[Dict[str, Any]]:
    # 1. Find usergroups student is in
    ug_stmt = select(UserGroupUser.usergroup_id).where(
        UserGroupUser.user_id == current_user.id
    )
    ug_result = await db_session.execute(ug_stmt)
    student_ug_ids = ug_result.scalars().all()

    # 2. Get all published assignments in org
    stmt = select(SchoolAssignment).where(
        SchoolAssignment.org_id == org_id,
        SchoolAssignment.published == True,
    ).order_by(SchoolAssignment.id.desc())
    result = await db_session.execute(stmt)
    all_asgs = result.scalars().all()

    # 3. Filter assignments that target any of student's classes (or target all if empty)
    targeted_asgs = []
    if current_user.is_superadmin or not student_ug_ids:
        targeted_asgs = list(all_asgs)
    else:
        for asg in all_asgs:
            if not asg.usergroup_ids or any(ug_id in (asg.usergroup_ids or []) for ug_id in student_ug_ids):
                targeted_asgs.append(asg)
        if not targeted_asgs:
            targeted_asgs = list(all_asgs)

    # 4. Fetch submissions for this student
    items = []
    for asg in targeted_asgs:
        sub_stmt = select(SchoolAssignmentSubmission).where(
            SchoolAssignmentSubmission.assignment_id == asg.id,
            SchoolAssignmentSubmission.user_id == current_user.id,
        )
        sub_result = await db_session.execute(sub_stmt)
        submission = sub_result.scalar_one_or_none()

        data = await format_assignment_dict(db_session, asg)
        data["submission"] = {
            "id": submission.id if submission else None,
            "status": submission.status if submission else SubmissionStatusEnum.PENDING,
            "submission_date": submission.submission_date if submission else None,
            "student_content": submission.student_content if submission else {},
            "score": submission.score if submission else None,
            "teacher_feedback": submission.teacher_feedback if submission else None,
            "graded_at": submission.graded_at if submission else None,
        }
        items.append(data)

    return items


async def submit_school_assignment(
    db_session: AsyncSession,
    current_user: PublicUser,
    assignment_uuid: str,
    payload: StudentSubmissionSubmit,
) -> Dict[str, Any]:
    stmt = select(SchoolAssignment).where(SchoolAssignment.assignment_uuid == assignment_uuid)
    result = await db_session.execute(stmt)
    asg = result.scalar_one_or_none()
    if not asg:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")

    # Find existing submission or create new
    sub_stmt = select(SchoolAssignmentSubmission).where(
        SchoolAssignmentSubmission.assignment_id == asg.id,
        SchoolAssignmentSubmission.user_id == current_user.id,
    )
    sub_result = await db_session.execute(sub_stmt)
    submission = sub_result.scalar_one_or_none()

    usergroup_id = payload.usergroup_id
    if not usergroup_id:
        ug_stmt = select(UserGroupUser.usergroup_id).where(UserGroupUser.user_id == current_user.id)
        ug_res = await db_session.execute(ug_stmt)
        usergroup_id = ug_res.scalars().first()

    if not submission:
        submission = SchoolAssignmentSubmission(
            assignment_id=asg.id,
            org_id=asg.org_id,
            user_id=current_user.id,
            usergroup_id=usergroup_id,
            status=SubmissionStatusEnum.SUBMITTED,
            submission_date=_now(),
            student_content=payload.student_content,
            creation_date=_now(),
            update_date=_now(),
        )
        db_session.add(submission)
    else:
        submission.status = SubmissionStatusEnum.SUBMITTED
        submission.submission_date = _now()
        submission.student_content = payload.student_content
        if usergroup_id:
            submission.usergroup_id = usergroup_id
        submission.update_date = _now()
        db_session.add(submission)

    await db_session.commit()
    await db_session.refresh(submission)

    return {
        "success": True,
        "submission_id": submission.id,
        "status": submission.status,
        "submission_date": submission.submission_date,
    }


async def grade_school_assignment_submission(
    db_session: AsyncSession,
    current_user: PublicUser,
    submission_id: int,
    payload: TeacherSubmissionGrade,
) -> Dict[str, Any]:
    stmt = select(SchoolAssignmentSubmission).where(SchoolAssignmentSubmission.id == submission_id)
    result = await db_session.execute(stmt)
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Teslim kaydı bulunamadı.")

    submission.score = payload.score
    submission.teacher_feedback = payload.teacher_feedback
    submission.status = SubmissionStatusEnum.GRADED
    submission.graded_at = _now()
    submission.graded_by = current_user.id
    submission.update_date = _now()

    db_session.add(submission)
    await db_session.commit()
    await db_session.refresh(submission)

    return {
        "success": True,
        "submission_id": submission.id,
        "score": submission.score,
        "teacher_feedback": submission.teacher_feedback,
        "status": submission.status,
    }


async def get_assignment_submissions(
    db_session: AsyncSession,
    assignment_uuid: str,
    usergroup_id: Optional[int] = None,
) -> Dict[str, Any]:
    asg_stmt = select(SchoolAssignment).where(SchoolAssignment.assignment_uuid == assignment_uuid)
    asg_res = await db_session.execute(asg_stmt)
    asg = asg_res.scalar_one_or_none()
    if not asg:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı.")

    # Determine which usergroups to query
    target_ug_ids = [usergroup_id] if usergroup_id else (asg.usergroup_ids or [])
    if not target_ug_ids:
        # Default all in org
        all_ug = await db_session.execute(select(UserGroup.id).where(UserGroup.org_id == asg.org_id))
        target_ug_ids = all_ug.scalars().all()

    # Get students in target usergroups
    students_stmt = (
        select(User, UserGroup.name.label("classroom_name"), UserGroup.id.label("classroom_id"))
        .join(UserGroupUser, UserGroupUser.user_id == User.id)
        .join(UserGroup, UserGroup.id == UserGroupUser.usergroup_id)
        .where(UserGroup.id.in_(target_ug_ids))
    )
    students_res = await db_session.execute(students_stmt)
    students_rows = students_res.all()

    # Get existing submissions
    sub_stmt = select(SchoolAssignmentSubmission).where(
        SchoolAssignmentSubmission.assignment_id == asg.id
    )
    sub_res = await db_session.execute(sub_stmt)
    submissions = {s.user_id: s for s in sub_res.scalars().all()}

    student_items = []
    seen_user_ids = set()
    for row in students_rows:
        u: User = row[0]
        c_name = row[1]
        c_id = row[2]
        if u.id in seen_user_ids:
            continue
        seen_user_ids.add(u.id)

        sub: Optional[SchoolAssignmentSubmission] = submissions.get(u.id)
        student_items.append({
            "user_id": u.id,
            "name": f"{u.first_name} {u.last_name}".strip() or u.username,
            "username": u.username,
            "avatar_image": u.avatar_image,
            "classroom_name": c_name,
            "classroom_id": c_id,
            "submission_id": sub.id if sub else None,
            "status": sub.status if sub else SubmissionStatusEnum.PENDING,
            "submission_date": sub.submission_date if sub else None,
            "student_content": sub.student_content if sub else {},
            "score": sub.score if sub else None,
            "teacher_feedback": sub.teacher_feedback if sub else None,
            "graded_at": sub.graded_at if sub else None,
        })

    return {
        "assignment": await format_assignment_dict(db_session, asg),
        "total_students": len(student_items),
        "submitted_count": sum(1 for s in student_items if s["status"] in (SubmissionStatusEnum.SUBMITTED, SubmissionStatusEnum.GRADED)),
        "graded_count": sum(1 for s in student_items if s["status"] == SubmissionStatusEnum.GRADED),
        "students": student_items,
    }


async def format_assignment_dict(db_session: AsyncSession, asg: SchoolAssignment) -> Dict[str, Any]:
    # Lookup class names
    class_names = []
    if asg.usergroup_ids:
        ug_stmt = select(UserGroup.id, UserGroup.name, UserGroup.join_code).where(
            UserGroup.id.in_(asg.usergroup_ids)
        )
        ug_res = await db_session.execute(ug_stmt)
        class_names = [{"id": r[0], "name": r[1], "code": r[2]} for r in ug_res.all()]

    # Count submissions
    sub_count_stmt = select(
        func.count(SchoolAssignmentSubmission.id).label("total"),
        func.count(func.nullif(SchoolAssignmentSubmission.status == SubmissionStatusEnum.GRADED, False)).label("graded"),
        func.avg(SchoolAssignmentSubmission.score).label("avg_score")
    ).where(SchoolAssignmentSubmission.assignment_id == asg.id)
    sub_stats = (await db_session.execute(sub_count_stmt)).one_or_none()

    # Teacher name
    teacher_name = "Öğretmen"
    if asg.created_by:
        t_stmt = select(User.first_name, User.last_name, User.username).where(User.id == asg.created_by)
        t_res = (await db_session.execute(t_stmt)).one_or_none()
        if t_res:
            teacher_name = f"{t_res[0]} {t_res[1]}".strip() or t_res[2]

    return {
        "id": asg.id,
        "assignment_uuid": asg.assignment_uuid,
        "title": asg.title,
        "description": asg.description,
        "grade_level": asg.grade_level,
        "grade_category": asg.grade_category,
        "subject": asg.subject,
        "tool_type": asg.tool_type,
        "tool_data": asg.tool_data or {},
        "board_uuid": asg.board_uuid,
        "usergroup_ids": asg.usergroup_ids or [],
        "classes": class_names,
        "due_date": asg.due_date,
        "max_score": asg.max_score,
        "published": asg.published,
        "created_by": asg.created_by,
        "teacher_name": teacher_name,
        "creation_date": asg.creation_date,
        "total_submissions": sub_stats[0] if sub_stats else 0,
        "graded_submissions": sub_stats[1] if sub_stats else 0,
        "average_score": round(float(sub_stats[2]), 1) if (sub_stats and sub_stats[2] is not None) else None,
    }
