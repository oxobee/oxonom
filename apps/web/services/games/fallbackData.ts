import { GameCategory, GameItem, GamesStoreResponse, GamePlayResponse } from './games'
import {
  SYNCED_CATEGORIES,
  SYNCED_GAMES,
  getSyncedGamesStore,
  getSyncedGamePlay,
} from '../demo/databaseSync'

export const FALLBACK_GAME_CATEGORIES: GameCategory[] = SYNCED_CATEGORIES
export const FALLBACK_GAMES: GameItem[] = SYNCED_GAMES

/**
 * Retrieves the full list of deleted game IDs / UUIDs / slugs
 * from both localStorage and document.cookie.
 */
export function getDeletedGameUuids(): string[] {
  const set = new Set<string>()

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('admin_deleted_game_uuids')
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => id && set.add(String(id)))
        }
      }
    } catch (_) {}

    try {
      const cookies = document.cookie.split(';')
      for (const c of cookies) {
        const [name, val] = c.trim().split('=')
        if (name === 'oxonom_deleted_games' && val) {
          const parsed = JSON.parse(decodeURIComponent(val))
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => id && set.add(String(id)))
          }
        }
      }
    } catch (_) {}
  }

  return Array.from(set)
}

/**
 * Marks a game ID/UUID/slug as permanently deleted across localStorage and cookies.
 */
export function markGameAsDeleted(uuidOrId: string): void {
  if (!uuidOrId || typeof window === 'undefined') return
  const idStr = String(uuidOrId)
  const existing = getDeletedGameUuids()
  if (!existing.includes(idStr)) {
    existing.push(idStr)
  }

  try {
    localStorage.setItem('admin_deleted_game_uuids', JSON.stringify(existing))
  } catch (_) {}

  try {
    const encoded = encodeURIComponent(JSON.stringify(existing))
    document.cookie = `oxonom_deleted_games=${encoded}; path=/; max-age=31536000; SameSite=Lax`
  } catch (_) {}

  // Also purge it from admin_synced_games in localStorage
  try {
    const localStr = localStorage.getItem('admin_synced_games')
    if (localStr) {
      const list: GameItem[] = JSON.parse(localStr)
      if (Array.isArray(list)) {
        const filtered = list.filter(
          (g) =>
            g.game_uuid !== idStr &&
            String(g.id) !== idStr &&
            g.slug !== idStr
        )
        localStorage.setItem('admin_synced_games', JSON.stringify(filtered))
      }
    }
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
}

/**
 * Returns clean live games merging SYNCED_GAMES with localStorage admin_synced_games
 * and strictly excluding any game in getDeletedGameUuids().
 */
export function getEffectiveLiveGames(): GameItem[] {
  const deleted = getDeletedGameUuids()

  let baseGames: GameItem[] = [...SYNCED_GAMES]
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('admin_synced_games')
      if (localStr) {
        const localGames: GameItem[] = JSON.parse(localStr)
        if (Array.isArray(localGames) && localGames.length > 0) {
          baseGames = localGames
        }
      }
    } catch (_) {}
  }

  return baseGames.filter(
    (g) =>
      !deleted.includes(g.game_uuid) &&
      !deleted.includes(String(g.id)) &&
      (!g.slug || !deleted.includes(g.slug))
  )
}

/**
 * Merges server-provided games with authoritative client games from localStorage,
 * permanently purging any deleted game tombstones.
 */
export function mergeWithLocalGames(serverGames: GameItem[]): GameItem[] {
  const deleted = getDeletedGameUuids()

  // 1. Purge deleted games from serverGames
  let cleanServer = Array.isArray(serverGames)
    ? serverGames.filter(
        (g) =>
          !deleted.includes(g.game_uuid) &&
          !deleted.includes(String(g.id)) &&
          (!g.slug || !deleted.includes(g.slug))
      )
    : []

  if (typeof window === 'undefined') {
    return cleanServer
  }

  // 2. Fetch local games
  let localGames: GameItem[] = []
  try {
    const localStr = localStorage.getItem('admin_synced_games')
    if (localStr) {
      const parsed = JSON.parse(localStr)
      if (Array.isArray(parsed)) {
        localGames = parsed.filter(
          (g) =>
            !deleted.includes(g.game_uuid) &&
            !deleted.includes(String(g.id)) &&
            (!g.slug || !deleted.includes(g.slug))
        )
      }
    }
  } catch (_) {}

  if (localGames.length === 0) {
    return cleanServer
  }

  // 3. Merge: local games take priority for modified/added games
  const result: GameItem[] = [...localGames]
  const localKeys = new Set(
    localGames.flatMap((g) => [g.game_uuid, String(g.id), g.slug].filter(Boolean))
  )

  for (const sg of cleanServer) {
    if (
      !localKeys.has(sg.game_uuid) &&
      !localKeys.has(String(sg.id)) &&
      (!sg.slug || !localKeys.has(sg.slug))
    ) {
      result.push(sg)
    }
  }

  return result
}

export function getFallbackGamesStore(
  orgSlugOrIdOrParams?: string | number | { category_slug?: string; grade_level?: string; search?: string },
  categorySlugOrParams?: string | { category_slug?: string; grade_level?: string; search?: string }
): GamesStoreResponse {
  let params: any = {}
  if (typeof orgSlugOrIdOrParams === 'object' && orgSlugOrIdOrParams !== null) {
    params = { ...params, ...orgSlugOrIdOrParams }
  }
  if (typeof categorySlugOrParams === 'object' && categorySlugOrParams !== null) {
    params = { ...params, ...categorySlugOrParams }
  } else if (typeof categorySlugOrParams === 'string') {
    params.category_slug = categorySlugOrParams
  }

  const liveGames = getEffectiveLiveGames()
  let filtered = liveGames.filter((g) => g.status === 'published')

  if (params.category_slug && params.category_slug !== 'all') {
    const cat = SYNCED_CATEGORIES.find((c: any) => c.slug === params.category_slug)
    if (cat) {
      filtered = filtered.filter(
        (g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)
      )
    }
  }

  if (params.grade_level && params.grade_level !== 'all') {
    const gl = String(params.grade_level).trim().toLowerCase()
    filtered = filtered.filter((g) => {
      if (!g.grade_levels || !Array.isArray(g.grade_levels)) return true
      return g.grade_levels.some((lvl) => String(lvl).toLowerCase().includes(gl))
    })
  }

  if (params.search) {
    const s = params.search.trim().toLowerCase()
    filtered = filtered.filter(
      (g) =>
        g.title?.toLowerCase().includes(s) ||
        g.description?.toLowerCase().includes(s) ||
        g.learning_objectives?.toLowerCase().includes(s)
    )
  }

  const featured = filtered.filter((g) => g.is_featured)
  const sliders = SYNCED_CATEGORIES.map((cat: any) => {
    const catGames = filtered.filter(
      (g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)
    )
    return {
      category: cat,
      games: catGames,
    }
  }).filter((s) => s.games.length > 0)

  return {
    categories: SYNCED_CATEGORIES,
    featured: featured.length > 0 ? featured : filtered.slice(0, 5),
    sliders,
    all_games: filtered,
    total_count: filtered.length,
  }
}

export function getFallbackGamePlay(identifier: string): GamePlayResponse {
  const liveGames = getEffectiveLiveGames()
  const matched = liveGames.find(
    (g) =>
      g.game_uuid === identifier ||
      g.slug === identifier ||
      String(g.id) === identifier
  )

  if (matched) {
    return {
      game: matched,
      html_content:
        (matched as any).html_content ||
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${matched.title}</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#090d16;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}h1{font-size:26px;color:#38bdf8}p{max-width:500px;line-height:1.6;color:#94a3b8;font-size:15px}.btn{margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer}</style></head><body><h1>🎮 ${matched.title}</h1><p>${matched.description || 'Eğitici HTML5 oyunu'}</p><button class="btn" onclick="alert('Oyun başlatıldı!')">Oyuna Başla</button></body></html>`,
    }
  }

  return getSyncedGamePlay(identifier)
}
