import os
import uuid
from typing import Optional, List
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlmodel import select, col, or_, and_
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.events.database import get_db_session
from src.security.auth import get_current_user
from src.services.users.users import PublicUser
from src.db.educational_resources import ResourceFolder, ResourceItem, ResourceAccessLog
from src.db.usergroups import UserGroup
from src.db.usergroup_user import UserGroupUser

router = APIRouter()

STORAGE_DIR = os.path.abspath(os.path.join(os.getcwd(), "content", "resources"))


# --- Pydantic Schemas ---
class CreateFolderRequest(BaseModel):
    org_id: int
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    icon: str = "folder"
    color: str = "#3b82f6"
    is_locked: bool = False
    pin: Optional[str] = None
    target_type: str = "all"  # 'all', 'classrooms', 'students'
    target_ids: Optional[dict] = None


class UpdateFolderRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_locked: Optional[bool] = None
    pin: Optional[str] = None
    target_type: Optional[str] = None
    target_ids: Optional[dict] = None


class CreateResourceRequest(BaseModel):
    org_id: int
    title: str
    description: Optional[str] = None
    folder_id: Optional[int] = None
    resource_type: str = "pdf"
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    external_url: Optional[str] = None
    subject: Optional[str] = None
    is_downloadable: bool = True
    is_locked: bool = False
    pin: Optional[str] = None
    target_type: str = "all"
    target_ids: Optional[dict] = None


class UpdateResourceRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    folder_id: Optional[int] = None
    resource_type: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    external_url: Optional[str] = None
    subject: Optional[str] = None
    is_downloadable: Optional[bool] = None
    is_locked: Optional[bool] = None
    pin: Optional[str] = None
    target_type: Optional[str] = None
    target_ids: Optional[dict] = None


class TrackActionRequest(BaseModel):
    action: str  # 'view' | 'download'


def _detect_resource_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return "pdf"
    if ext in [".doc", ".docx", ".odt", ".txt", ".rtf"]:
        return "document"
    if ext in [".xls", ".xlsx", ".csv"]:
        return "spreadsheet"
    if ext in [".ppt", ".pptx", ".key"]:
        return "presentation"
    if ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
        return "image"
    if ext in [".mp4", ".mov", ".webm", ".avi", ".mkv"]:
        return "video"
    if ext in [".mp3", ".wav", ".ogg", ".m4a"]:
        return "audio"
    return "document"


# --- Folders API ---
@router.get("/folders", summary="List folders in organization")
async def list_folders(
    org_id: int = Query(...),
    parent_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    query = select(ResourceFolder).where(ResourceFolder.org_id == org_id)
    if parent_id is not None:
        query = query.where(ResourceFolder.parent_id == parent_id)
    else:
        query = query.where(ResourceFolder.parent_id == None)

    folders = (await db.execute(query)).scalars().all()
    return folders


@router.post("/folders", summary="Create resource folder")
async def create_folder(
    req: CreateFolderRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    folder = ResourceFolder(
        folder_uuid=f"folder_{uuid.uuid4().hex[:12]}",
        org_id=req.org_id,
        parent_id=req.parent_id,
        name=req.name.strip(),
        description=req.description,
        icon=req.icon,
        color=req.color,
        is_locked=req.is_locked,
        pin=req.pin if req.is_locked else None,
        target_type=req.target_type,
        target_ids=req.target_ids,
        created_by=current_user.id,
        creation_date=datetime.now(timezone.utc).isoformat(),
        update_date=datetime.now(timezone.utc).isoformat(),
    )
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return folder


@router.put("/folders/{folder_uuid}", summary="Update resource folder")
async def update_folder(
    folder_uuid: str,
    req: UpdateFolderRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    folder = (
        await db.execute(select(ResourceFolder).where(ResourceFolder.folder_uuid == folder_uuid))
    ).scalars().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if req.name is not None:
        folder.name = req.name.strip()
    if req.description is not None:
        folder.description = req.description
    if req.icon is not None:
        folder.icon = req.icon
    if req.color is not None:
        folder.color = req.color
    if req.is_locked is not None:
        folder.is_locked = req.is_locked
        folder.pin = req.pin if req.is_locked else None
    elif req.pin is not None:
        folder.pin = req.pin
    if req.target_type is not None:
        folder.target_type = req.target_type
    if req.target_ids is not None:
        folder.target_ids = req.target_ids

    folder.update_date = datetime.now(timezone.utc).isoformat()
    await db.commit()
    await db.refresh(folder)
    return folder


@router.delete("/folders/{folder_uuid}", summary="Delete resource folder")
async def delete_folder(
    folder_uuid: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    folder = (
        await db.execute(select(ResourceFolder).where(ResourceFolder.folder_uuid == folder_uuid))
    ).scalars().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Also delete child resources or subfolders
    child_items = (
        await db.execute(select(ResourceItem).where(ResourceItem.folder_id == folder.id))
    ).scalars().all()
    for it in child_items:
        await db.delete(it)

    await db.delete(folder)
    await db.commit()
    return {"status": "ok", "deleted_folder_uuid": folder_uuid}


# --- Resources API ---
@router.get("/items", summary="List educational resources")
async def list_resources(
    org_id: int = Query(...),
    folder_id: Optional[int] = Query(None),
    subject: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    query = select(ResourceItem).where(ResourceItem.org_id == org_id)

    # Check locked folders
    locked_folders_subquery = select(ResourceFolder.id).where(
        ResourceFolder.org_id == org_id,
        ResourceFolder.is_locked == True,
    )
    locked_folder_ids = (await db.execute(locked_folders_subquery)).scalars().all()

    if folder_id is not None:
        if folder_id == 0:
            query = query.where(ResourceItem.folder_id.is_(None))
        else:
            query = query.where(ResourceItem.folder_id == folder_id)
    else:
        # Root view: only show files that do not belong to any folder
        if not (search and search.strip()):
            query = query.where(ResourceItem.folder_id.is_(None))

    # Never leak items from locked folders into search or root views
    if locked_folder_ids and (folder_id is None or folder_id not in locked_folder_ids):
        query = query.where(
            or_(
                ResourceItem.folder_id.is_(None),
                ~ResourceItem.folder_id.in_(locked_folder_ids),
            )
        )


    if subject and subject != "all":
        query = query.where(ResourceItem.subject == subject)

    if resource_type and resource_type != "all":
        query = query.where(ResourceItem.resource_type == resource_type)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                col(ResourceItem.title).ilike(term),
                col(ResourceItem.description).ilike(term),
                col(ResourceItem.uploader_name).ilike(term),
            )
        )

    # Order by update date desc
    query = query.order_by(col(ResourceItem.update_date).desc())
    items = (await db.execute(query)).scalars().all()

    # Filter based on target_type if student
    # Note: teachers/admins can see all resources
    user_role = getattr(current_user, "role_name", "") or "student"
    is_teacher_or_admin = (
        current_user.is_superadmin
        or user_role in ["admin", "teacher", "owner", "manager", "instructor"]
    )

    if is_teacher_or_admin:
        return items

    # Student visibility filtering
    user_classes = (
        await db.execute(
            select(UserGroupUser.usergroup_id).where(UserGroupUser.user_id == current_user.id)
        )
    ).scalars().all()
    user_class_set = set(user_classes)

    filtered = []
    for it in items:
        if it.target_type == "all":
            filtered.append(it)
        elif it.target_type == "classrooms":
            t_ids = (it.target_ids or {}).get("classroom_ids", [])
            if any(cid in user_class_set for cid in t_ids):
                filtered.append(it)
        elif it.target_type == "students":
            s_ids = (it.target_ids or {}).get("student_ids", [])
            if current_user.id in s_ids:
                filtered.append(it)
        else:
            filtered.append(it)

    return filtered


@router.post("/items", summary="Create educational resource")
async def create_resource(
    req: CreateResourceRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    role = getattr(current_user, "role_name", "") or ("Öğretmen" if not current_user.is_superadmin else "Yönetici")
    uploader_name = (
        f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
        or current_user.username
    )

    item = ResourceItem(
        resource_uuid=f"res_{uuid.uuid4().hex[:12]}",
        org_id=req.org_id,
        folder_id=req.folder_id,
        title=req.title.strip(),
        description=req.description,
        resource_type=req.resource_type,
        file_url=req.file_url,
        file_name=req.file_name,
        file_size=req.file_size,
        external_url=req.external_url,
        subject=req.subject,
        is_downloadable=req.is_downloadable,
        is_locked=req.is_locked,
        pin=req.pin if req.is_locked else None,
        target_type=req.target_type,
        target_ids=req.target_ids,
        created_by=current_user.id,
        uploader_name=uploader_name,
        uploader_role=role,
        views_count=0,
        downloads_count=0,
        creation_date=datetime.now(timezone.utc).isoformat(),
        update_date=datetime.now(timezone.utc).isoformat(),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/items/{resource_uuid}", summary="Update educational resource")
async def update_resource(
    resource_uuid: str,
    req: UpdateResourceRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    item = (
        await db.execute(select(ResourceItem).where(ResourceItem.resource_uuid == resource_uuid))
    ).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    if req.title is not None:
        item.title = req.title.strip()
    if req.description is not None:
        item.description = req.description
    if req.folder_id is not None:
        item.folder_id = req.folder_id if req.folder_id != 0 else None
    if req.resource_type is not None:
        item.resource_type = req.resource_type
    if req.file_url is not None:
        item.file_url = req.file_url
    if req.file_name is not None:
        item.file_name = req.file_name
    if req.file_size is not None:
        item.file_size = req.file_size
    if req.external_url is not None:
        item.external_url = req.external_url
    if req.subject is not None:
        item.subject = req.subject
    if req.is_downloadable is not None:
        item.is_downloadable = req.is_downloadable
    if req.is_locked is not None:
        item.is_locked = req.is_locked
        item.pin = req.pin if req.is_locked else None
    elif req.pin is not None:
        item.pin = req.pin
    if req.target_type is not None:
        item.target_type = req.target_type
    if req.target_ids is not None:
        item.target_ids = req.target_ids

    item.update_date = datetime.now(timezone.utc).isoformat()
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/items/{resource_uuid}", summary="Delete educational resource")
async def delete_resource(
    resource_uuid: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    item = (
        await db.execute(select(ResourceItem).where(ResourceItem.resource_uuid == resource_uuid))
    ).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Also clean up access logs
    logs = (
        await db.execute(select(ResourceAccessLog).where(ResourceAccessLog.resource_id == item.id))
    ).scalars().all()
    for l in logs:
        await db.delete(l)

    await db.delete(item)
    await db.commit()
    return {"status": "ok", "deleted_resource_uuid": resource_uuid}


# --- Access Tracking & Logs ---
@router.post("/items/{resource_uuid}/track", summary="Track view or download")
async def track_resource_access(
    resource_uuid: str,
    req: TrackActionRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    item = (
        await db.execute(select(ResourceItem).where(ResourceItem.resource_uuid == resource_uuid))
    ).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    user_role = getattr(current_user, "role_name", "") or "Öğrenci"
    user_name = (
        f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
        or current_user.username
    )

    action = "download" if req.action.lower() == "download" else "view"

    if action == "view":
        item.views_count += 1
    else:
        item.downloads_count += 1

    log = ResourceAccessLog(
        resource_id=item.id,
        org_id=item.org_id,
        user_id=current_user.id,
        user_name=user_name,
        user_role=user_role,
        action=action,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    db.add(log)
    await db.commit()
    return {"status": "ok", "views": item.views_count, "downloads": item.downloads_count}


@router.get("/items/{resource_uuid}/logs", summary="Get view/download access history for resource")
async def get_resource_access_logs(
    resource_uuid: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: PublicUser = Depends(get_current_user),
):
    item = (
        await db.execute(select(ResourceItem).where(ResourceItem.resource_uuid == resource_uuid))
    ).scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")

    logs = (
        await db.execute(
            select(ResourceAccessLog)
            .where(ResourceAccessLog.resource_id == item.id)
            .order_by(col(ResourceAccessLog.timestamp).desc())
            .limit(200)
        )
    ).scalars().all()

    return {
        "resource_uuid": resource_uuid,
        "title": item.title,
        "views_count": item.views_count,
        "downloads_count": item.downloads_count,
        "logs": logs,
    }


# --- File Upload & Serving ---
@router.post("/upload", summary="Upload educational resource file")
async def upload_resource_file(
    file: UploadFile = File(...),
    org_id: int = Form(...),
    current_user: PublicUser = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    target_dir = os.path.join(STORAGE_DIR, str(org_id))
    os.makedirs(target_dir, exist_ok=True)

    clean_name = Path(file.filename).name.replace(" ", "_")
    unique_prefix = uuid.uuid4().hex[:8]
    stored_name = f"{unique_prefix}_{clean_name}"
    dest_path = os.path.join(target_dir, stored_name)

    content = await file.read()
    file_size = len(content)

    with open(dest_path, "wb") as f:
        f.write(content)

    detected_type = _detect_resource_type(file.filename)
    file_url = f"/api/v1/resources/files/{stored_name}?org_id={org_id}"

    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_size": file_size,
        "resource_type": detected_type,
    }


@router.get("/files/{file_name}", summary="Serve resource file")
async def serve_resource_file(
    file_name: str,
    org_id: int = Query(...),
    download: bool = Query(False),
):
    # Prevent traversal
    safe_name = os.path.basename(file_name)
    file_path = os.path.join(STORAGE_DIR, str(org_id), safe_name)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    ext = Path(safe_name).suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    original_name = safe_name.split("_", 1)[-1] if "_" in safe_name else safe_name

    headers = {}
    if download:
        headers["Content-Disposition"] = f'attachment; filename="{original_name}"'
    else:
        headers["Content-Disposition"] = f'inline; filename="{original_name}"'

    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers=headers,
        filename=original_name if download else None,
    )
