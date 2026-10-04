import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
} from '@services/utils/ts/requests'

export interface GameCategory {
  id: number
  category_uuid: string
  name: string
  slug: string
  icon: string
  description?: string
  display_order: number
  is_active: boolean
  target_org_ids?: number[] | null
}

export interface GameItem {
  id: number
  game_uuid: string
  category_id?: number
  category_ids?: number[] | null
  is_3d_simulation?: boolean
  category_name?: string
  category_icon?: string
  title: string
  slug: string
  description?: string
  thumbnail_image?: string
  banner_image?: string
  has_html_content: boolean
  grade_levels: string[]
  age_range?: string
  learning_objectives?: string
  status: 'published' | 'draft' | 'coming_soon'
  is_featured: boolean
  featured_order: number
  target_org_ids?: number[] | null
  play_count: number
  version?: string
  file_name?: string | null
  file_size_bytes?: number | null
  average_rating?: number
  ratings_count?: number
  creation_date: string
  update_date: string
}

export interface GamesStoreResponse {
  categories: GameCategory[]
  featured: GameItem[]
  sliders: {
    category: GameCategory
    games: GameItem[]
  }[]
  all_games: GameItem[]
  total_count: number
}

export interface GamePlayResponse {
  game: GameItem
  html_content: string
}

export interface GameRatingSummary {
  average_rating: number
  ratings_count: number
  my_review?: {
    rating: number
    comment?: string | null
  } | null
}

export interface GameReviewAdminItem {
  id: number
  review_uuid: string
  game_id: number
  game_title: string
  game_icon?: string
  user_id: number
  user_name: string
  user_email: string
  user_avatar?: string | null
  user_role?: string | null
  org_id?: number | null
  org_name?: string | null
  rating: number
  comment?: string | null
  creation_date: string
}

export interface SchoolOption {
  id: number
  name: string
  slug: string
}

import {
  FALLBACK_GAME_CATEGORIES,
  getFallbackGamesStore,
  getFallbackGamePlay,
  getDeletedGameUuids,
  mergeWithLocalGames,
} from './fallbackData'

// ── Public Store Endpoints ──

export async function getGamesStore(
  orgId: number,
  params?: {
    category_slug?: string
    grade_level?: string
    search?: string
  }
): Promise<GamesStoreResponse> {
  try {
    const q = new URLSearchParams()
    if (params?.category_slug && params.category_slug !== 'all') {
      q.set('category_slug', params.category_slug)
    }
    if (params?.grade_level && params.grade_level !== 'all') {
      q.set('grade_level', params.grade_level)
    }
    if (params?.search) {
      q.set('search', params.search)
    }

    const url = `${getAPIUrl()}games/org/${orgId}${q.toString() ? '?' + q.toString() : ''}`
    const res = await fetch(url)
    if (!res.ok) {
      return getFallbackGamesStore(params)
    }
    const data: GamesStoreResponse = await errorHandling(res)
    if (!data) return getFallbackGamesStore(params)

    // Merge authoritative local games (and filter out deleted tombstones)
    if (typeof window !== 'undefined') {
      const mergedAll = mergeWithLocalGames(data.all_games || [])
      const deleted = getDeletedGameUuids()
      let filtered = mergedAll.filter((g) => {
        if (g.status !== 'published') return false
        if (deleted.includes(g.game_uuid) || deleted.includes(String(g.id)) || (g.slug && deleted.includes(g.slug))) {
          return false
        }
        return true
      })

      if (params?.category_slug && params.category_slug !== 'all') {
        const cat = data.categories?.find((c) => c.slug === params.category_slug)
        if (cat) {
          filtered = filtered.filter(
            (g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)
          )
        }
      }

      if (params?.grade_level && params.grade_level !== 'all') {
        const gl = String(params.grade_level).trim().toLowerCase()
        filtered = filtered.filter((g) => {
          if (!g.grade_levels || !Array.isArray(g.grade_levels)) return true
          return g.grade_levels.some((lvl) => String(lvl).toLowerCase().includes(gl))
        })
      }

      if (params?.search) {
        const s = params.search.trim().toLowerCase()
        filtered = filtered.filter(
          (g) =>
            g.title?.toLowerCase().includes(s) ||
            g.description?.toLowerCase().includes(s) ||
            g.learning_objectives?.toLowerCase().includes(s)
        )
      }

      const featured = filtered.filter((g) => g.is_featured)
      const categories = data.categories || FALLBACK_GAME_CATEGORIES
      const sliders = categories
        .map((cat) => ({
          category: cat,
          games: filtered.filter((g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)),
        }))
        .filter((s) => s.games.length > 0)

      return {
        categories,
        featured: featured.length > 0 ? featured : filtered.slice(0, 5),
        sliders,
        all_games: filtered,
        total_count: filtered.length,
      }
    }

    return data
  } catch (_err) {
    return getFallbackGamesStore(params)
  }
}

export async function getGamePlay(gameUuid: string): Promise<GamePlayResponse> {
  try {
    const url = `${getAPIUrl()}games/${encodeURIComponent(gameUuid)}/play`
    const res = await fetch(url)
    if (!res.ok) {
      return getFallbackGamePlay(gameUuid)
    }
    const data = await errorHandling(res)
    if (data?.html_content) {
      return data
    }
    return getFallbackGamePlay(gameUuid)
  } catch (_err) {
    return getFallbackGamePlay(gameUuid)
  }
}

export async function getGameCategories(orgId?: number): Promise<GameCategory[]> {
  try {
    const q = orgId ? `?org_id=${orgId}` : ''
    const url = `${getAPIUrl()}games/categories${q}`
    const res = await fetch(url)
    if (!res.ok) {
      return FALLBACK_GAME_CATEGORIES
    }
    const data = await errorHandling(res)
    return data || FALLBACK_GAME_CATEGORIES
  } catch (_err) {
    return FALLBACK_GAME_CATEGORIES
  }
}

export async function getGameRating(
  gameUuid: string,
  accessToken?: string
): Promise<GameRatingSummary> {
  const url = `${getAPIUrl()}games/${gameUuid}/rating`
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  const res = await fetch(url, { headers })
  return errorHandling(res)
}

export async function submitGameReview(
  gameUuid: string,
  payload: { rating: number; comment?: string },
  orgId?: number,
  accessToken?: string
): Promise<{ success: boolean; message: string }> {
  const q = orgId ? `?org_id=${orgId}` : ''
  const url = `${getAPIUrl()}games/${gameUuid}/review${q}`
  const res = await fetch(
    url,
    RequestBodyWithAuthHeader('POST', payload, null, accessToken || '')
  )
  return errorHandling(res)
}

// ── Superadmin Management Endpoints ──

export async function getAdminGames(
  params: {
    category_id?: number | null
    status?: string | null
    search?: string | null
  },
  accessToken: string
): Promise<GameItem[]> {
  const q = new URLSearchParams()
  if (params.category_id) q.set('category_id', String(params.category_id))
  if (params.status && params.status !== 'all') q.set('status', params.status)
  if (params.search) q.set('search', params.search)

  const url = `${getAPIUrl()}games/admin/all${q.toString() ? '?' + q.toString() : ''}`
  const res = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken))
  return errorHandling(res)
}

export async function createAdminGame(
  payload: {
    category_id?: number | null
    category_ids?: number[] | null
    is_3d_simulation?: boolean
    title: string
    description?: string
    thumbnail_image?: string
    banner_image?: string
    html_content: string
    grade_levels?: string[]
    age_range?: string
    learning_objectives?: string
    status?: string
    is_featured?: boolean
    featured_order?: number
    target_org_ids?: number[] | null
    version?: string
    file_name?: string | null
    file_size_bytes?: number | null
  },
  accessToken: string
): Promise<GameItem> {
  const url = `${getAPIUrl()}games/admin/create`
  const res = await fetch(url, RequestBodyWithAuthHeader('POST', payload, null, accessToken))
  return errorHandling(res)
}

export async function updateAdminGame(
  gameUuid: string,
  payload: Partial<{
    id?: number
    game_uuid?: string
    category_id?: number | null
    category_ids?: number[] | null
    is_3d_simulation?: boolean
    title?: string
    description?: string
    thumbnail_image?: string
    banner_image?: string
    html_content?: string
    grade_levels?: string[]
    age_range?: string
    learning_objectives?: string
    status?: string
    is_featured?: boolean
    featured_order?: number
    target_org_ids?: number[] | null
    version?: string
    file_name?: string | null
    file_size_bytes?: number | null
  }>,
  accessToken: string
): Promise<GameItem> {
  const url = `${getAPIUrl()}games/admin/${encodeURIComponent(gameUuid)}`
  const res = await fetch(url, RequestBodyWithAuthHeader('PUT', payload, null, accessToken))
  return errorHandling(res)
}

export async function deleteAdminGame(
  gameUuid: string,
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${getAPIUrl()}games/admin/${encodeURIComponent(gameUuid)}`
    const res = await fetch(url, RequestBodyWithAuthHeader('DELETE', null, null, accessToken))
    return errorHandling(res)
  } catch (_) {
    return { success: true, message: 'Oyun silindi (offline)' }
  }
}

export async function syncAdminGames(
  payload: {
    games?: GameItem[]
    deleted_uuids?: string[]
  },
  accessToken?: string
): Promise<{ success: boolean }> {
  try {
    const url = `${getAPIUrl()}games/sync`
    const res = await fetch(
      url,
      RequestBodyWithAuthHeader('POST', payload, null, accessToken || '')
    )
    return errorHandling(res)
  } catch (_) {
    return { success: false }
  }
}

export async function createAdminCategory(
  payload: {
    name: string
    icon?: string
    description?: string
    display_order?: number
    target_org_ids?: number[] | null
  },
  accessToken: string
): Promise<GameCategory> {
  const url = `${getAPIUrl()}games/admin/categories`
  const res = await fetch(url, RequestBodyWithAuthHeader('POST', payload, null, accessToken))
  return errorHandling(res)
}

export async function updateAdminCategory(
  categoryId: number,
  payload: {
    name?: string
    icon?: string
    description?: string
    display_order?: number
    target_org_ids?: number[] | null
    is_active?: boolean
  },
  accessToken: string
): Promise<GameCategory> {
  const url = `${getAPIUrl()}games/admin/categories/${categoryId}`
  const res = await fetch(url, RequestBodyWithAuthHeader('PUT', payload, null, accessToken))
  return errorHandling(res)
}

export async function deleteAdminCategory(
  categoryId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  const url = `${getAPIUrl()}games/admin/categories/${categoryId}`
  const res = await fetch(url, RequestBodyWithAuthHeader('DELETE', null, null, accessToken))
  return errorHandling(res)
}

export async function getAdminSchools(accessToken: string): Promise<SchoolOption[]> {
  const url = `${getAPIUrl()}games/admin/schools`
  const res = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken))
  return errorHandling(res)
}

export async function getAdminReviews(
  params: {
    game_id?: number | null
    org_id?: number | null
    search?: string | null
  },
  accessToken: string
): Promise<GameReviewAdminItem[]> {
  const q = new URLSearchParams()
  if (params.game_id) q.set('game_id', String(params.game_id))
  if (params.org_id) q.set('org_id', String(params.org_id))
  if (params.search) q.set('search', params.search)

  const url = `${getAPIUrl()}games/admin/reviews${q.toString() ? '?' + q.toString() : ''}`
  const res = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken))
  return errorHandling(res)
}

export async function deleteAdminReview(
  reviewId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  const url = `${getAPIUrl()}games/admin/reviews/${reviewId}`
  const res = await fetch(url, RequestBodyWithAuthHeader('DELETE', null, null, accessToken))
  return errorHandling(res)
}
