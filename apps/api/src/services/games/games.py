import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.games import (
    Game,
    GameCategory,
    GameCategoryCreate,
    GameCategoryRead,
    GameCategoryUpdate,
    GameCreate,
    GameRead,
    GameReview,
    GameReviewCreate,
    GameReviewReadAdmin,
    GameRatingSummary,
    GameReviewUserSummary,
    GameUpdate,
)
from src.db.organizations import Organization
from src.db.users import PublicUser, User


def _now() -> str:
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()


def _slugify(text: str) -> str:
    text = text.lower()
    turkish_map = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
    }
    for tr, en in turkish_map.items():
        text = text.replace(tr, en)
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text or "game"


async def format_game_read(db_session: AsyncSession, game: Game) -> GameRead:
    cat_name = None
    cat_icon = None
    if game.category_id:
        cat = (await db_session.execute(
            select(GameCategory).where(GameCategory.id == game.category_id)
        )).scalars().first()
        if cat:
            cat_name = cat.name
            cat_icon = cat.icon

    # Rating calculations
    reviews_stmt = select(GameReview.rating).where(GameReview.game_id == game.id)
    ratings = (await db_session.execute(reviews_stmt)).scalars().all()
    ratings_count = len(ratings)
    avg_rating = round(sum(ratings) / ratings_count, 1) if ratings_count > 0 else 5.0

    return GameRead(
        id=game.id,
        game_uuid=game.game_uuid,
        category_id=game.category_id,
        category_ids=game.category_ids,
        is_3d_simulation=bool(game.is_3d_simulation),
        category_name=cat_name,
        category_icon=cat_icon,
        title=game.title,
        slug=game.slug,
        description=game.description,
        thumbnail_image=game.thumbnail_image,
        banner_image=game.banner_image,
        has_html_content=bool(game.html_content),
        grade_levels=game.grade_levels or [],
        age_range=game.age_range,
        learning_objectives=game.learning_objectives,
        status=game.status,
        is_featured=game.is_featured,
        featured_order=game.featured_order,
        target_org_ids=game.target_org_ids,
        play_count=game.play_count,
        version=game.version or "1.0.0",
        file_name=game.file_name,
        file_size_bytes=game.file_size_bytes,
        average_rating=avg_rating,
        ratings_count=ratings_count,
        creation_date=game.creation_date,
        update_date=game.update_date,
    )


# ── Categories ──

async def list_categories(
    db_session: AsyncSession,
    org_id: Optional[int] = None,
) -> List[GameCategoryRead]:
    stmt = select(GameCategory).where(GameCategory.is_active == True).order_by(GameCategory.display_order.asc(), GameCategory.id.asc())
    cats = (await db_session.execute(stmt)).scalars().all()
    
    result: List[GameCategoryRead] = []
    for c in cats:
        # If org_id is provided, check category school access
        if org_id is not None:
            if c.target_org_ids and len(c.target_org_ids) > 0 and org_id not in c.target_org_ids:
                continue

        result.append(
            GameCategoryRead(
                id=c.id,
                category_uuid=c.category_uuid,
                name=c.name,
                slug=c.slug,
                icon=c.icon,
                description=c.description,
                display_order=c.display_order,
                is_active=c.is_active,
                target_org_ids=c.target_org_ids,
            )
        )
    return result


async def create_category(db_session: AsyncSession, payload: GameCategoryCreate) -> GameCategoryRead:
    base_slug = _slugify(payload.name)
    slug = base_slug
    counter = 1
    while True:
        existing = (await db_session.execute(
            select(GameCategory).where(GameCategory.slug == slug)
        )).scalars().first()
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    cat = GameCategory(
        category_uuid=str(uuid.uuid4()),
        name=payload.name,
        slug=slug,
        icon=payload.icon or "🎮",
        description=payload.description,
        display_order=payload.display_order or 0,
        target_org_ids=payload.target_org_ids,
        is_active=True,
        creation_date=_now(),
    )
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return GameCategoryRead(
        id=cat.id,
        category_uuid=cat.category_uuid,
        name=cat.name,
        slug=cat.slug,
        icon=cat.icon,
        description=cat.description,
        display_order=cat.display_order,
        is_active=cat.is_active,
        target_org_ids=cat.target_org_ids,
    )


async def update_category(
    db_session: AsyncSession,
    category_id: int,
    payload: GameCategoryUpdate,
) -> GameCategoryRead:
    cat = (await db_session.execute(
        select(GameCategory).where(GameCategory.id == category_id)
    )).scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    update_dict = payload.model_dump(exclude_unset=True)
    if "name" in update_dict and update_dict["name"]:
        cat.name = update_dict["name"]
        cat.slug = _slugify(update_dict["name"])

    for field in ["icon", "description", "display_order", "target_org_ids", "is_active"]:
        if field in update_dict:
            setattr(cat, field, update_dict[field])

    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return GameCategoryRead(
        id=cat.id,
        category_uuid=cat.category_uuid,
        name=cat.name,
        slug=cat.slug,
        icon=cat.icon,
        description=cat.description,
        display_order=cat.display_order,
        is_active=cat.is_active,
        target_org_ids=cat.target_org_ids,
    )


async def delete_category(db_session: AsyncSession, category_id: int) -> Dict[str, Any]:
    cat = (await db_session.execute(
        select(GameCategory).where(GameCategory.id == category_id)
    )).scalars().first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    # Unlink games from this category
    games = (await db_session.execute(
        select(Game).where(Game.category_id == category_id)
    )).scalars().all()
    for g in games:
        g.category_id = None
        db_session.add(g)

    await db_session.delete(cat)
    await db_session.commit()
    return {"success": True, "message": "Kategori ve bağlantıları başarıyla silindi"}


# ── Public Games Store ──

async def list_public_games_for_org(
    db_session: AsyncSession,
    org_id: int,
    category_slug: Optional[str] = None,
    grade_level: Optional[str] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    # 1. Fetch Categories accessible to this org
    categories = await list_categories(db_session, org_id=org_id)
    accessible_cat_ids = {c.id for c in categories}

    # 2. Build games query
    stmt = select(Game).where(Game.status == "published")

    if search:
        search_term = f"%{search}%"
        stmt = stmt.where(or_(Game.title.ilike(search_term), Game.description.ilike(search_term)))

    stmt = stmt.order_by(Game.is_featured.desc(), Game.featured_order.asc(), Game.id.desc())
    all_games = (await db_session.execute(stmt)).scalars().all()

    # 3. Filter by school accessibility (target_org_ids is None/empty -> all schools, else must include org_id)
    # AND if game is in a category, the category itself must be accessible to this org
    accessible_games: List[Game] = []
    for g in all_games:
        # Check game target_org_ids
        if g.target_org_ids and len(g.target_org_ids) > 0 and org_id not in g.target_org_ids:
            continue
        # Check category accessibility
        if g.category_id and g.category_id not in accessible_cat_ids:
            continue
        accessible_games.append(g)

    # 4. Optional category filter
    if category_slug and category_slug != "all":
        target_cat = next((c for c in categories if c.slug == category_slug), None)
        if target_cat:
            if target_cat.slug == "3d-simulasyon":
                accessible_games = [
                    g for g in accessible_games
                    if g.is_3d_simulation
                    or (g.category_ids and target_cat.id in g.category_ids)
                    or g.category_id == target_cat.id
                ]
            else:
                accessible_games = [
                    g for g in accessible_games
                    if g.category_id == target_cat.id
                    or (g.category_ids and target_cat.id in g.category_ids)
                ]

    # 5. Optional grade filter
    if grade_level and grade_level != "all":
        accessible_games = [g for g in accessible_games if grade_level in (g.grade_levels or [])]

    # Format
    formatted_games = [await format_game_read(db_session, g) for g in accessible_games]
    featured_games = [g for g in formatted_games if g.is_featured]

    # Group by category for horizontal sliders
    categorized_sliders = []
    if category_slug == "3d-simulasyon":
        # Group 3D simulations by subject categories
        for cat in categories:
            if cat.slug == "3d-simulasyon":
                continue
            cat_games = [
                g for g in formatted_games
                if g.category_id == cat.id or (g.category_ids and cat.id in g.category_ids)
            ]
            if cat_games:
                cat_dict = cat.model_dump()
                cat_dict["name"] = f"{cat.name} (3D)"
                categorized_sliders.append({
                    "category": cat_dict,
                    "games": cat_games,
                })
        # If any 3d games were not caught by subject categories, place in general 3D slider
        grouped_ids = {g.id for slider in categorized_sliders for g in slider["games"]}
        remaining_3d = [g for g in formatted_games if g.id not in grouped_ids]
        if remaining_3d:
            target_3d_cat = next((c for c in categories if c.slug == "3d-simulasyon"), None)
            if target_3d_cat:
                categorized_sliders.append({
                    "category": target_3d_cat.model_dump(),
                    "games": remaining_3d,
                })
    else:
        for cat in categories:
            cat_games = [
                g for g in formatted_games
                if g.category_id == cat.id or (g.category_ids and cat.id in g.category_ids)
            ]
            if cat_games:
                categorized_sliders.append({
                    "category": cat.model_dump(),
                    "games": cat_games,
                })

    return {
        "categories": [c.model_dump() for c in categories],
        "featured": featured_games,
        "sliders": categorized_sliders,
        "all_games": formatted_games,
        "total_count": len(formatted_games),
    }


async def get_game_play_data(
    db_session: AsyncSession,
    game_uuid: str,
    increment_play: bool = True,
) -> Dict[str, Any]:
    stmt = select(Game).where(Game.game_uuid == game_uuid)
    game = (await db_session.execute(stmt)).scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="Oyun bulunamadı")

    if increment_play:
        game.play_count += 1
        db_session.add(game)
        await db_session.commit()
        await db_session.refresh(game)

    read_data = await format_game_read(db_session, game)
    return {
        "game": read_data.model_dump(),
        "html_content": game.html_content,
    }


# ── Ratings & Reviews (Student Feedback) ──

async def submit_game_review(
    db_session: AsyncSession,
    game_uuid: str,
    user: PublicUser,
    org_id: Optional[int],
    payload: GameReviewCreate,
) -> Dict[str, Any]:
    stmt = select(Game).where(Game.game_uuid == game_uuid)
    game = (await db_session.execute(stmt)).scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="Oyun bulunamadı")

    # Clamping rating to 1..5
    rating = max(1, min(5, payload.rating))
    comment_clean = payload.comment.strip() if payload.comment else None

    # Check for existing review by this user
    rev_stmt = select(GameReview).where(
        GameReview.game_id == game.id,
        GameReview.user_id == user.id,
    )
    existing_rev = (await db_session.execute(rev_stmt)).scalars().first()

    if existing_rev:
        existing_rev.rating = rating
        existing_rev.comment = comment_clean
        if org_id:
            existing_rev.org_id = org_id
        db_session.add(existing_rev)
    else:
        new_rev = GameReview(
            review_uuid=str(uuid.uuid4()),
            game_id=game.id,
            user_id=user.id,
            org_id=org_id,
            rating=rating,
            comment=comment_clean,
            creation_date=_now(),
        )
        db_session.add(new_rev)

    await db_session.commit()
    return {"success": True, "message": "Değerlendirmeniz ve geri bildiriminiz kaydedildi."}


async def get_game_rating_summary(
    db_session: AsyncSession,
    game_uuid: str,
    user: Optional[PublicUser] = None,
) -> GameRatingSummary:
    stmt = select(Game).where(Game.game_uuid == game_uuid)
    game = (await db_session.execute(stmt)).scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="Oyun bulunamadı")

    reviews_stmt = select(GameReview).where(GameReview.game_id == game.id)
    reviews = (await db_session.execute(reviews_stmt)).scalars().all()

    ratings = [r.rating for r in reviews]
    count = len(ratings)
    avg = round(sum(ratings) / count, 1) if count > 0 else 5.0

    my_review = None
    if user and getattr(user, "id", None):
        user_rev = next((r for r in reviews if r.user_id == user.id), None)
        if user_rev:
            my_review = GameReviewUserSummary(
                rating=user_rev.rating,
                comment=user_rev.comment,
            )

    return GameRatingSummary(
        average_rating=avg,
        ratings_count=count,
        my_review=my_review,
    )


# ── Superadmin Operations ──

async def list_admin_games(
    db_session: AsyncSession,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> List[GameRead]:
    stmt = select(Game)
    if category_id:
        stmt = stmt.where(Game.category_id == category_id)
    if status and status != "all":
        stmt = stmt.where(Game.status == status)
    if search:
        term = f"%{search}%"
        stmt = stmt.where(or_(Game.title.ilike(term), Game.description.ilike(term)))

    stmt = stmt.order_by(Game.id.desc())
    games = (await db_session.execute(stmt)).scalars().all()
    return [await format_game_read(db_session, g) for g in games]


async def create_game(db_session: AsyncSession, payload: GameCreate) -> GameRead:
    base_slug = _slugify(payload.title)
    slug = base_slug
    counter = 1
    while True:
        existing = (await db_session.execute(
            select(Game).where(Game.slug == slug)
        )).scalars().first()
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    game = Game(
        game_uuid=str(uuid.uuid4()),
        category_id=payload.category_id,
        category_ids=payload.category_ids or ([payload.category_id] if payload.category_id else []),
        is_3d_simulation=payload.is_3d_simulation or False,
        title=payload.title,
        slug=slug,
        description=payload.description,
        thumbnail_image=payload.thumbnail_image,
        banner_image=payload.banner_image,
        html_content=payload.html_content,
        grade_levels=payload.grade_levels or [],
        age_range=payload.age_range,
        learning_objectives=payload.learning_objectives,
        status=payload.status or "published",
        is_featured=payload.is_featured or False,
        featured_order=payload.featured_order or 0,
        target_org_ids=payload.target_org_ids,
        play_count=0,
        version=payload.version or "1.0.0",
        file_name=payload.file_name,
        file_size_bytes=payload.file_size_bytes or (len(payload.html_content.encode("utf-8")) if payload.html_content else None),
        creation_date=_now(),
        update_date=_now(),
    )
    db_session.add(game)
    await db_session.commit()
    await db_session.refresh(game)
    return await format_game_read(db_session, game)


async def update_game(
    db_session: AsyncSession,
    game_uuid: str,
    payload: GameUpdate,
) -> GameRead:
    stmt = select(Game).where(Game.game_uuid == game_uuid)
    game = (await db_session.execute(stmt)).scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="Oyun bulunamadı")

    update_dict = payload.model_dump(exclude_unset=True)
    if "title" in update_dict and update_dict["title"]:
        game.title = update_dict["title"]
        game.slug = _slugify(update_dict["title"])

    # If new html_content is uploaded, manage versioning and clean old files on disk
    if "html_content" in update_dict and update_dict["html_content"] and update_dict["html_content"] != game.html_content:
        # Auto-increment version if not explicitly supplied
        if "version" not in update_dict or not update_dict["version"]:
            try:
                parts = (game.version or "1.0.0").split(".")
                parts[-1] = str(int(parts[-1]) + 1)
                game.version = ".".join(parts)
            except Exception:
                game.version = "1.0.1"
        else:
            game.version = update_dict["version"]

        # Clean up old game files in disk folder if present
        game_storage_dir = os.path.join(os.getcwd(), "content", "games", game.game_uuid)
        if os.path.exists(game_storage_dir):
            try:
                for f in os.listdir(game_storage_dir):
                    fp = os.path.join(game_storage_dir, f)
                    if os.path.isfile(fp):
                        os.remove(fp)
            except Exception:
                pass

        game.file_size_bytes = len(update_dict["html_content"].encode("utf-8"))

    for field in [
        "category_id", "category_ids", "is_3d_simulation", "description",
        "thumbnail_image", "banner_image", "html_content", "grade_levels",
        "age_range", "learning_objectives", "status", "is_featured",
        "featured_order", "target_org_ids", "version", "file_name", "file_size_bytes",
    ]:
        if field in update_dict:
            setattr(game, field, update_dict[field])

    game.update_date = _now()
    db_session.add(game)
    await db_session.commit()
    await db_session.refresh(game)
    return await format_game_read(db_session, game)


async def delete_game(db_session: AsyncSession, game_uuid: str) -> Dict[str, Any]:
    stmt = select(Game).where(Game.game_uuid == game_uuid)
    game = (await db_session.execute(stmt)).scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="Oyun bulunamadı")

    # Also delete associated reviews
    reviews = (await db_session.execute(
        select(GameReview).where(GameReview.game_id == game.id)
    )).scalars().all()
    for r in reviews:
        await db_session.delete(r)

    # Clean up disk files and folder if present
    game_dir = os.path.join(os.getcwd(), "content", "games", game_uuid)
    if os.path.exists(game_dir):
        try:
            import shutil
            shutil.rmtree(game_dir)
        except Exception:
            pass

    await db_session.delete(game)
    await db_session.commit()
    return {"success": True, "message": "Oyun başarıyla silindi"}


async def list_admin_reviews(
    db_session: AsyncSession,
    game_id: Optional[int] = None,
    org_id: Optional[int] = None,
    search: Optional[str] = None,
) -> List[GameReviewReadAdmin]:
    stmt = select(GameReview).order_by(GameReview.id.desc())
    if game_id:
        stmt = stmt.where(GameReview.game_id == game_id)
    if org_id:
        stmt = stmt.where(GameReview.org_id == org_id)

    reviews = (await db_session.execute(stmt)).scalars().all()

    # Pre-fetch games, users, orgs to avoid N+1 queries
    game_ids = {r.game_id for r in reviews}
    user_ids = {r.user_id for r in reviews}
    org_ids = {r.org_id for r in reviews if r.org_id}

    games_map: Dict[int, Game] = {}
    if game_ids:
        games_res = (await db_session.execute(
            select(Game).where(Game.id.in_(game_ids))
        )).scalars().all()
        games_map = {g.id: g for g in games_res}

    users_map: Dict[int, User] = {}
    if user_ids:
        users_res = (await db_session.execute(
            select(User).where(User.id.in_(user_ids))
        )).scalars().all()
        users_map = {u.id: u for u in users_res}

    orgs_map: Dict[int, Organization] = {}
    if org_ids:
        orgs_res = (await db_session.execute(
            select(Organization).where(Organization.id.in_(org_ids))
        )).scalars().all()
        orgs_map = {o.id: o for o in orgs_res}

    result: List[GameReviewReadAdmin] = []
    for r in reviews:
        game_item = games_map.get(r.game_id)
        user_item = users_map.get(r.user_id)
        org_item = orgs_map.get(r.org_id) if r.org_id else None

        user_name = "Bilinmeyen Kullanıcı"
        user_email = ""
        user_avatar = None
        user_role = "Öğrenci"
        if user_item:
            full_name = f"{user_item.first_name or ''} {user_item.last_name or ''}".strip()
            user_name = full_name or user_item.username or user_item.email
            user_email = user_item.email
            user_avatar = getattr(user_item, "avatar_image", None)
            if getattr(user_item, "is_superadmin", False):
                user_role = "Süper Admin"
            elif getattr(user_item, "is_admin", False):
                user_role = "Yönetici"

        game_title = game_item.title if game_item else "Silinmiş Oyun"

        if search:
            search_lower = search.lower()
            if (
                search_lower not in (r.comment or "").lower()
                and search_lower not in user_name.lower()
                and search_lower not in user_email.lower()
                and search_lower not in game_title.lower()
            ):
                continue

        result.append(
            GameReviewReadAdmin(
                id=r.id,
                review_uuid=r.review_uuid,
                game_id=r.game_id,
                game_title=game_title,
                game_icon="🎮",
                user_id=r.user_id,
                user_name=user_name,
                user_email=user_email,
                user_avatar=user_avatar,
                user_role=user_role,
                org_id=r.org_id,
                org_name=org_item.name if org_item else "Genel / Belirtilmemiş",
                rating=r.rating,
                comment=r.comment,
                creation_date=r.creation_date,
            )
        )

    return result


async def delete_admin_review(db_session: AsyncSession, review_id: int) -> Dict[str, Any]:
    stmt = select(GameReview).where(GameReview.id == review_id)
    review = (await db_session.execute(stmt)).scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")

    await db_session.delete(review)
    await db_session.commit()
    return {"success": True, "message": "Geri bildirim başarıyla silindi"}


async def list_schools_for_admin(db_session: AsyncSession) -> List[Dict[str, Any]]:
    stmt = select(Organization).order_by(Organization.name.asc())
    orgs = (await db_session.execute(stmt)).scalars().all()
    return [
        {
            "id": o.id,
            "name": o.name,
            "slug": o.slug,
        }
        for o in orgs
    ]
