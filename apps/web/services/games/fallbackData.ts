import { GameCategory, GameItem, GamesStoreResponse, GamePlayResponse } from './games'
import {
  SYNCED_CATEGORIES,
  SYNCED_GAMES,
  getSyncedGamesStore,
  getSyncedGamePlay,
} from '../demo/databaseSync'

export const FALLBACK_GAME_CATEGORIES: GameCategory[] = SYNCED_CATEGORIES
export const FALLBACK_GAMES: GameItem[] = SYNCED_GAMES

const LS_GAMES_KEY = 'admin_synced_games'
const LS_DELETED_KEY = 'admin_deleted_game_uuids'
const COOKIE_DELETED_KEY = 'oxonom_deleted_games'

// ─── Tombstone (Silme Listesi) Yönetimi ───────────────────────────────────────

/**
 * Silinen oyunların UUID/ID/slug listesini döndürür.
 * Hem localStorage hem cookie'den okur.
 */
export function getDeletedGameUuids(): string[] {
  const set = new Set<string>()
  if (typeof window === 'undefined') return []

  try {
    const local = localStorage.getItem(LS_DELETED_KEY)
    if (local) {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => id && set.add(String(id)))
      }
    }
  } catch (_) {}

  try {
    document.cookie.split(';').forEach((c) => {
      const [name, val] = c.trim().split('=')
      if (name === COOKIE_DELETED_KEY && val) {
        try {
          const parsed = JSON.parse(decodeURIComponent(val))
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => id && set.add(String(id)))
          }
        } catch (_) {}
      }
    })
  } catch (_) {}

  return Array.from(set)
}

/**
 * Bir oyunu kalıcı olarak sil.
 * localStorage + cookie'ye kayıt eder.
 */
export function markGameAsDeleted(uuidOrId: string): void {
  if (!uuidOrId || typeof window === 'undefined') return
  const idStr = String(uuidOrId)
  const existing = getDeletedGameUuids()
  if (!existing.includes(idStr)) existing.push(idStr)

  // localStorage tombstone
  try {
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify(existing))
  } catch (_) {}

  // Cookie tombstone
  try {
    const encoded = encodeURIComponent(JSON.stringify(existing))
    document.cookie = `${COOKIE_DELETED_KEY}=${encoded}; path=/; max-age=31536000; SameSite=Lax`
  } catch (_) {}

  // admin_synced_games'ten de temizle
  _purgeFromSyncedGames(idStr)

  window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
}

/**
 * admin_synced_games localStorage listesinden verilen id'yi temizler.
 */
function _purgeFromSyncedGames(idStr: string) {
  try {
    const localStr = localStorage.getItem(LS_GAMES_KEY)
    if (!localStr) return
    const list: GameItem[] = JSON.parse(localStr)
    if (!Array.isArray(list)) return
    const filtered = list.filter(
      (g) =>
        g.game_uuid !== idStr &&
        String(g.id) !== idStr &&
        g.slug !== idStr
    )
    localStorage.setItem(LS_GAMES_KEY, JSON.stringify(filtered))
  } catch (_) {}
}

/**
 * Bir oyun listesini tombstone'lara göre filtreler.
 */
export function filterOutDeleted(games: GameItem[]): GameItem[] {
  const deleted = getDeletedGameUuids()
  if (deleted.length === 0) return games
  return games.filter(
    (g) =>
      !deleted.includes(g.game_uuid) &&
      !deleted.includes(String(g.id)) &&
      (!g.slug || !deleted.includes(g.slug))
  )
}

// ─── Tek Kaynak: getEffectiveLiveGames ────────────────────────────────────────

/**
 * TÜM oyun okumalarında kullanılan tek kaynak.
 *
 * Öncelik sırası:
 *   1. localStorage admin_synced_games  (en yetkili, admin tarafından yazılır)
 *   2. SYNCED_GAMES seed verisi          (fallback)
 *
 * Her durumda tombstone ile filtrelenir.
 */
export function getEffectiveLiveGames(): GameItem[] {
  let games: GameItem[] = []

  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem(LS_GAMES_KEY)
      if (localStr) {
        const parsed = JSON.parse(localStr)
        if (Array.isArray(parsed) && parsed.length > 0) {
          games = parsed
        }
      }
    } catch (_) {}
  }

  // Eğer localStorage boşsa seed'e dön
  if (games.length === 0) {
    games = [...SYNCED_GAMES]
  }

  return filterOutDeleted(games)
}

// ─── Superadmin & Store için Merge ────────────────────────────────────────────

/**
 * Server'dan gelen oyunları localStorage kayıtlı oyunlarla birleştirir.
 * localStorage her zaman kazanır (admin eklemeleri/düzenlemeleri korunur).
 * Tombstone listesindeki oyunlar kesinlikle çıkarılır.
 */
export function mergeWithLocalGames(serverGames: GameItem[]): GameItem[] {
  // Server oyunlarını filtrele
  const cleanServer = filterOutDeleted(Array.isArray(serverGames) ? serverGames : [])

  if (typeof window === 'undefined') return cleanServer

  // LocalStorage oyunlarını al ve filtrele
  let localGames: GameItem[] = []
  try {
    const localStr = localStorage.getItem(LS_GAMES_KEY)
    if (localStr) {
      const parsed = JSON.parse(localStr)
      if (Array.isArray(parsed)) {
        localGames = filterOutDeleted(parsed)
      }
    }
  } catch (_) {}

  // LocalStorage boşsa: server oyunlarını localStorage'a yaz ve döndür
  if (localGames.length === 0) {
    if (cleanServer.length > 0) {
      try {
        localStorage.setItem(LS_GAMES_KEY, JSON.stringify(cleanServer))
      } catch (_) {}
    }
    return cleanServer
  }

  // Local var: önce local oyunları al, server'dan ekler olanlara izin ver
  const result: GameItem[] = [...localGames]
  const localKeys = new Set<string>(
    localGames.flatMap((g) => [g.game_uuid, String(g.id), g.slug].filter(Boolean) as string[])
  )

  for (const sg of cleanServer) {
    const alreadyInLocal =
      localKeys.has(sg.game_uuid) ||
      localKeys.has(String(sg.id)) ||
      (sg.slug && localKeys.has(sg.slug))
    if (!alreadyInLocal) {
      result.push(sg)
    }
  }

  return result
}

// ─── Fallback Store (API başarısız olduğunda kullanılır) ──────────────────────

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

  const currentCategories = _getEffectiveCategories()

  if (params.category_slug && params.category_slug !== 'all') {
    const cat = currentCategories.find((c: any) => c.slug === params.category_slug)
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
  const sliders = currentCategories.map((cat: any) => {
    const catGames = filtered.filter(
      (g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)
    )
    return { category: cat, games: catGames }
  }).filter((s: any) => s.games.length > 0)

  return {
    categories: currentCategories,
    featured: featured.length > 0 ? featured : filtered.slice(0, 5),
    sliders,
    all_games: filtered,
    total_count: filtered.length,
  }
}

/**
 * Kategorileri önce localStorage'dan, yoksa SYNCED_CATEGORIES'den döndürür.
 */
function _getEffectiveCategories(): GameCategory[] {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('admin_synced_categories')
      if (localStr) {
        const parsed = JSON.parse(localStr)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_) {}
  }
  return SYNCED_CATEGORIES
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
