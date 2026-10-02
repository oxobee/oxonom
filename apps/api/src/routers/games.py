from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.events.database import get_db_session
from src.db.games import (
    GameCategoryCreate,
    GameCategoryRead,
    GameCategoryUpdate,
    GameCreate,
    GameRatingSummary,
    GameRead,
    GameReviewCreate,
    GameReviewReadAdmin,
    GameUpdate,
)
from src.db.users import AnonymousUser, PublicUser
from src.security.auth import get_authenticated_user, get_current_user
from src.services.games.games import (
    create_category,
    create_game,
    delete_admin_review,
    delete_category,
    delete_game,
    get_game_play_data,
    get_game_rating_summary,
    list_admin_games,
    list_admin_reviews,
    list_categories,
    list_public_games_for_org,
    list_schools_for_admin,
    submit_game_review,
    update_category,
    update_game,
)

router = APIRouter(prefix="/games", tags=["games"])


# ── Public / Store Endpoints ──

@router.get(
    "/categories",
    response_model=List[GameCategoryRead],
    summary="Tüm Aktif Oyun Kategorileri",
)
async def api_get_categories(
    org_id: Optional[int] = Query(None, description="Okul ID (okula özel kategorileri filtrelemek için)"),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await list_categories(db_session, org_id=org_id)


@router.get(
    "/org/{org_id}",
    summary="Okul İçin Oyun Mağazası (Kategoriler, 3D Slider ve Oyunlar)",
)
async def api_get_games_store(
    org_id: int,
    category_slug: Optional[str] = Query(None, description="Kategori filtresi"),
    grade_level: Optional[str] = Query(None, description="Sınıf seviyesi filtresi"),
    search: Optional[str] = Query(None, description="Arama metni"),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await list_public_games_for_org(
        db_session,
        org_id=org_id,
        category_slug=category_slug,
        grade_level=grade_level,
        search=search,
    )


@router.get(
    "/{game_uuid}/play",
    summary="Oyunu Oyna (HTML İçeriği ve Bilgileri)",
)
async def api_get_game_play(
    game_uuid: str,
    db_session: AsyncSession = Depends(get_db_session),
):
    return await get_game_play_data(db_session, game_uuid, increment_play=True)


@router.get(
    "/{game_uuid}/rating",
    response_model=GameRatingSummary,
    summary="Oyun Puan Özeti (Ortalama Puan ve Sayı)",
)
async def api_get_game_rating(
    game_uuid: str,
    current_user: Union[PublicUser, AnonymousUser] = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    user = current_user if isinstance(current_user, PublicUser) else None
    return await get_game_rating_summary(db_session, game_uuid, user=user)


@router.post(
    "/{game_uuid}/review",
    summary="Oyuna Puan Ver ve Geri Bildirim Gönder",
)
async def api_post_game_review(
    game_uuid: str,
    payload: GameReviewCreate,
    org_id: Optional[int] = Query(None, description="Öğrencinin kayıtlı olduğu okul ID"),
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    return await submit_game_review(
        db_session,
        game_uuid=game_uuid,
        user=current_user,
        org_id=org_id,
        payload=payload,
    )


# ── Superadmin Endpoints ──

def verify_superadmin(user: PublicUser) -> None:
    if not getattr(user, "is_superadmin", False):
        raise HTTPException(
            status_code=403,
            detail="Bu işlem için Süper Admin yetkisi gerekmektedir.",
        )


@router.get(
    "/admin/all",
    response_model=List[GameRead],
    summary="[Süper Admin] Tüm Oyunları Listele",
)
async def api_admin_list_games(
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await list_admin_games(
        db_session,
        category_id=category_id,
        status=status,
        search=search,
    )


@router.post(
    "/admin/create",
    response_model=GameRead,
    summary="[Süper Admin] Yeni Oyun Oluştur",
)
async def api_admin_create_game(
    payload: GameCreate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await create_game(db_session, payload)


@router.put(
    "/admin/{game_uuid}",
    response_model=GameRead,
    summary="[Süper Admin] Oyun Güncelle",
)
async def api_admin_update_game(
    game_uuid: str,
    payload: GameUpdate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await update_game(db_session, game_uuid, payload)


@router.delete(
    "/admin/{game_uuid}",
    summary="[Süper Admin] Oyun Sil",
)
async def api_admin_delete_game(
    game_uuid: str,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await delete_game(db_session, game_uuid)


@router.post(
    "/admin/categories",
    response_model=GameCategoryRead,
    summary="[Süper Admin] Hızlı Kategori Oluştur",
)
async def api_admin_create_category(
    payload: GameCategoryCreate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await create_category(db_session, payload)


@router.put(
    "/admin/categories/{category_id}",
    response_model=GameCategoryRead,
    summary="[Süper Admin] Kategori Güncelle",
)
async def api_admin_update_category(
    category_id: int,
    payload: GameCategoryUpdate,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await update_category(db_session, category_id, payload)


@router.delete(
    "/admin/categories/{category_id}",
    summary="[Süper Admin] Kategori Sil",
)
async def api_admin_delete_category(
    category_id: int,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await delete_category(db_session, category_id)


@router.get(
    "/admin/schools",
    summary="[Süper Admin] Tanımlanabilir Okullar Listesi",
)
async def api_admin_list_schools(
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await list_schools_for_admin(db_session)


@router.get(
    "/admin/reviews",
    response_model=List[GameReviewReadAdmin],
    summary="[Süper Admin] Öğrenci Yorumları ve Geri Bildirimler",
)
async def api_admin_list_reviews(
    game_id: Optional[int] = Query(None),
    org_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await list_admin_reviews(
        db_session,
        game_id=game_id,
        org_id=org_id,
        search=search,
    )


@router.delete(
    "/admin/reviews/{review_id}",
    summary="[Süper Admin] Öğrenci Yorumunu Sil",
)
async def api_admin_delete_review(
    review_id: int,
    current_user: PublicUser = Depends(get_authenticated_user),
    db_session: AsyncSession = Depends(get_db_session),
):
    verify_superadmin(current_user)
    return await delete_admin_review(db_session, review_id)
