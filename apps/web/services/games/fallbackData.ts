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
  return getSyncedGamesStore(orgSlugOrIdOrParams, categorySlugOrParams)
}

export function getFallbackGamePlay(identifier: string): GamePlayResponse {
  return getSyncedGamePlay(identifier)
}
