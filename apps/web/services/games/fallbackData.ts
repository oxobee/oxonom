import { GameCategory, GameItem, GamesStoreResponse, GamePlayResponse } from './games'
import {
  SYNCED_CATEGORIES,
  SYNCED_GAMES,
  getSyncedGamesStore,
  getSyncedGamePlay,
} from '../demo/databaseSync'

export const FALLBACK_GAME_CATEGORIES: GameCategory[] = SYNCED_CATEGORIES
export const FALLBACK_GAMES: GameItem[] = SYNCED_GAMES

export function getFallbackGamesStore(
  orgSlugOrIdOrParams?: string | number | { category_slug?: string; grade_level?: string; search?: string },
  categorySlugOrParams?: string | { category_slug?: string; grade_level?: string; search?: string }
): GamesStoreResponse {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('admin_synced_games')
      if (localStr) {
        const localGames: GameItem[] = JSON.parse(localStr)
        if (Array.isArray(localGames) && localGames.length > 0) {
          let params: any = {}
          if (typeof orgSlugOrIdOrParams === 'object' && orgSlugOrIdOrParams !== null) {
            params = { ...params, ...orgSlugOrIdOrParams }
          }
          if (typeof categorySlugOrParams === 'object' && categorySlugOrParams !== null) {
            params = { ...params, ...categorySlugOrParams }
          } else if (typeof categorySlugOrParams === 'string') {
            params.category_slug = categorySlugOrParams
          }

          let filtered = localGames.filter((g) => g.status === 'published')
          if (params.category_slug && params.category_slug !== 'all') {
            const cat = SYNCED_CATEGORIES.find((c: any) => c.slug === params.category_slug)
            if (cat) {
              filtered = filtered.filter((g) => g.category_id === cat.id || g.category_ids?.includes(cat.id))
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
            filtered = filtered.filter((g) =>
              g.title?.toLowerCase().includes(s) ||
              g.description?.toLowerCase().includes(s) ||
              g.learning_objectives?.toLowerCase().includes(s)
            )
          }

          const featured = filtered.filter((g) => g.is_featured)
          const sliders = SYNCED_CATEGORIES.map((cat: any) => {
            const catGames = filtered.filter((g) => g.category_id === cat.id || g.category_ids?.includes(cat.id))
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
      }
    } catch (_) {}
  }
  return getSyncedGamesStore(orgSlugOrIdOrParams, categorySlugOrParams)
}

export function getFallbackGamePlay(identifier: string): GamePlayResponse {
  if (typeof window !== 'undefined') {
    try {
      const localStr = localStorage.getItem('admin_synced_games')
      if (localStr) {
        const localGames: GameItem[] = JSON.parse(localStr)
        if (Array.isArray(localGames)) {
          const matched = localGames.find((g) => g.game_uuid === identifier || g.slug === identifier || String(g.id) === identifier)
          if (matched) {
            return {
              game: matched,
              html_content: (matched as any).html_content || `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${matched.title}</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#090d16;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}h1{font-size:26px;color:#38bdf8}p{max-width:500px;line-height:1.6;color:#94a3b8;font-size:15px}.btn{margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer}</style></head><body><h1>🎮 ${matched.title}</h1><p>${matched.description || 'Eğitici HTML5 oyunu'}</p><button class="btn" onclick="alert('Oyun başlatıldı!')">Oyuna Başla</button></body></html>`,
            }
          }
        }
      }
    } catch (_) {}
  }
  return getSyncedGamePlay(identifier)
}
