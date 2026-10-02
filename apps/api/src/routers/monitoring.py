"""Server-side relay so adblockers can't drop Sentry user feedback."""

from typing import Optional
from datetime import datetime

import sentry_sdk
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.events.database import get_db_session
from src.db.feedback import Feedback
from src.security.auth import get_current_user
from src.security.superadmin import is_user_superadmin
from src.db.users import PublicUser

router = APIRouter()


_MAX_ATTACHMENTS = 3
_MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
_MAX_MESSAGE_LENGTH = 4096


@router.post(
    "/feedback",
    summary="Submit user feedback",
    description=(
        "Relay user feedback to Sentry from the server so requests aren't "
        "dropped by client-side ad/tracker blockers."
    ),
    responses={
        204: {"description": "Feedback accepted and forwarded to Sentry."},
        400: {"description": "Empty or invalid feedback payload."},
        503: {"description": "Sentry is not configured on this instance."},
    },
    status_code=204,
)
async def submit_feedback(
    message: str = Form(""),
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    reaction: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    org_name: Optional[str] = Form(None),
    org_slug: Optional[str] = Form(None),
    device: Optional[str] = Form(None),
    browser: Optional[str] = Form(None),
    page_url: Optional[str] = Form(None),
    associated_event_id: Optional[str] = Form(None),
    attachments: list[UploadFile] = File(default=[]),
):
    message = (message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Feedback message is required")
    if len(message) > _MAX_MESSAGE_LENGTH:
        message = message[:_MAX_MESSAGE_LENGTH]

    files = (attachments or [])[:_MAX_ATTACHMENTS]
    loaded: list[tuple[str, bytes, str]] = []
    for upload in files:
        if not upload or not upload.filename:
            continue
        # Bound the read itself: reading the whole upload before truncating
        # would let a single multi-gigabyte attachment exhaust server memory.
        data = await upload.read(_MAX_ATTACHMENT_BYTES + 1)
        if not data:
            continue
        if len(data) > _MAX_ATTACHMENT_BYTES:
            data = data[:_MAX_ATTACHMENT_BYTES]
        loaded.append((upload.filename, data, upload.content_type or "application/octet-stream"))

    if sentry_sdk.get_client().is_active():
        # sentry-sdk 2.x has no capture_feedback; emit the JS SDK's envelope shape so it lands in User Feedback.
        feedback_context: dict[str, str] = {
            "message": message,
            "source": "api",
            "reaction": reaction or "",
            "category": category or "",
            "device": device or "",
            "browser": browser or "",
            "org_name": org_name or "",
        }
        if name:
            feedback_context["name"] = name
        if email:
            feedback_context["contact_email"] = email
        if associated_event_id:
            feedback_context["associated_event_id"] = associated_event_id

        event = {
            "type": "feedback",
            "level": "info",
            "contexts": {"feedback": feedback_context},
        }

        with sentry_sdk.new_scope() as scope:
            for filename, data, content_type in loaded:
                scope.add_attachment(bytes=data, filename=filename, content_type=content_type)
            sentry_sdk.capture_event(event)

    try:
        async for db_session in get_db_session():
            fb = Feedback(
                message=message,
                reaction=reaction,
                category=category,
                user_name=name,
                user_email=email,
                org_name=org_name,
                org_slug=org_slug,
                device=device,
                browser=browser,
                page_url=page_url,
                attachments=[filename for filename, _, _ in loaded] if loaded else None,
                created_at=str(datetime.now()),
            )
            db_session.add(fb)
            await db_session.commit()
            break
    except Exception as e:
        print(f"Error saving feedback to database: {e}")


@router.get("/feedbacks")
async def list_feedbacks(
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    if not current_user.id or not await is_user_superadmin(current_user.id, db_session):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db_session.execute(select(Feedback).order_by(Feedback.id.desc()))
    return result.scalars().all()


@router.delete("/feedbacks/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    current_user: PublicUser = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    if not current_user.id or not await is_user_superadmin(current_user.id, db_session):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db_session.execute(select(Feedback).where(Feedback.id == feedback_id))
    feedback = result.scalar_one_or_none()
    
    if feedback:
        await db_session.delete(feedback)
        await db_session.commit()
        
    return {"status": "ok"}
