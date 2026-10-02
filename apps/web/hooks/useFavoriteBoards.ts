'use client'
import { useState, useEffect, useCallback } from 'react'
import { flyStarToAcademicTrail } from '@/lib/animations/flyToTrail'

export interface FavoriteBoard {
  board_uuid: string
  name: string
  description?: string
  thumbnail_image?: string
  member_count?: number
  category?: string
  favorited_at: string // ISO date string
  created_at?: string
}

export function detectBoardCategory(name: string = '', desc: string = ''): string {
  const text = `${name} ${desc}`.toLowerCase()
  if (text.includes('mat') || text.includes('geometri') || text.includes('sayı') || text.includes('cebir')) {
    return 'Matematik'
  }
  if (text.includes('fizik') || text.includes('kimya') || text.includes('biyo') || text.includes('fen') || text.includes('laboratuvar')) {
    return 'Fen Bilimleri'
  }
  if (text.includes('tarih') || text.includes('coğrafya') || text.includes('sosyal') || text.includes('vatandaşlık')) {
    return 'Sosyal Bilgiler'
  }
  if (text.includes('türkçe') || text.includes('edebiyat') || text.includes('dil bilgisi') || text.includes('yazım')) {
    return 'Türkçe & Edebiyat'
  }
  if (text.includes('ingilizce') || text.includes('english') || text.includes('almanca') || text.includes('fransızca')) {
    return 'Yabancı Dil'
  }
  if (text.includes('resim') || text.includes('müzik') || text.includes('sanat') || text.includes('kodlama') || text.includes('bilişim')) {
    return 'Sanat & Bilişim'
  }
  return 'Genel Konular'
}

export function useFavoriteBoards(orgId?: number | string) {
  const storageKey = `oxonom_fav_boards_${orgId || 'default'}`
  const [favorites, setFavorites] = useState<FavoriteBoard[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const defaultSchoolFavorites: FavoriteBoard[] = [
    {
      board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
      name: '10-A Matematik: Fonksiyon Grafikleri & Parabol Çizimleri',
      description: 'Parabol tepe noktası, kökler ve fonksiyon dönüşümleri ders anlatım tahtası.',
      category: 'Matematik',
      favorited_at: new Date().toISOString(),
    },
    {
      board_uuid: 'board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e',
      name: 'Fizik Laboratuvarı: Elektrik Devreleri & Eşdeğer Direnç',
      description: 'Seri-paralel bağlama devre şemaları, Kirchoff kuralları akıllı tahta çizimleri.',
      category: 'Fen Bilimleri',
      favorited_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      board_uuid: 'board_93a22f1c-4071-4fbc-b42a-82411a2a9faf',
      name: '10-A Haftalık Ders Programı, Nöbetçi Listesi ve Duyuru Panosu',
      description: 'Sınav takvimi, nöbet listesi, okul kulüp etkinlikleri ve haftalık ödev hatırlatıcıları.',
      category: 'Genel Konular',
      favorited_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      board_uuid: 'board_2ec16e01-3744-4a40-93dc-228016b8a937',
      name: 'Kimya: Periyodik Tablo ve Lewis Yapıları Çizim Tahtası',
      description: 'İyonik ve kovalent bağ modelleri, atom yarıçapı trend grafikleri.',
      category: 'Fen Bilimleri',
      favorited_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ]

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.board_uuid) {
          setFavorites(parsed)
        } else {
          setFavorites(defaultSchoolFavorites)
          localStorage.setItem(storageKey, JSON.stringify(defaultSchoolFavorites))
        }
      } else {
        setFavorites(defaultSchoolFavorites)
        localStorage.setItem(storageKey, JSON.stringify(defaultSchoolFavorites))
      }
    } catch {
      setFavorites(defaultSchoolFavorites)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey])

  // Save to localStorage
  const saveFavorites = (newFavs: FavoriteBoard[]) => {
    setFavorites(newFavs)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFavs))
        // Dispatch window storage event so other components update synchronously
        window.dispatchEvent(new Event('oxonom-favorites-updated'))
      } catch {}
    }
  }

  // Listen to cross-component updates
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) setFavorites(JSON.parse(raw))
      } catch {}
    }
    window.addEventListener('oxonom-favorites-updated', handleUpdate)
    return () => window.removeEventListener('oxonom-favorites-updated', handleUpdate)
  }, [storageKey])

  const isFavorite = useCallback(
    (boardUuid: string) => {
      if (!boardUuid) return false
      return favorites.some((f) => f.board_uuid === boardUuid)
    },
    [favorites]
  )

  const toggleFavorite = useCallback(
    (board: any, sourceElementOrEvent?: any) => {
      if (!board || !board.board_uuid) return false
      const exists = favorites.some((f) => f.board_uuid === board.board_uuid)
      if (exists) {
        const next = favorites.filter((f) => f.board_uuid !== board.board_uuid)
        saveFavorites(next)
        return false // removed
      } else {
        const newFav: FavoriteBoard = {
          board_uuid: board.board_uuid,
          name: board.name || 'Ders Panosu',
          description: board.description || '',
          thumbnail_image: board.thumbnail_image || '',
          member_count: board.member_count || 1,
          category: detectBoardCategory(board.name, board.description),
          favorited_at: new Date().toISOString(),
          created_at: board.created_at || new Date().toISOString(),
        }
        const next = [newFav, ...favorites]
        saveFavorites(next)
        if (sourceElementOrEvent) {
          flyStarToAcademicTrail(sourceElementOrEvent)
        }
        return true // added
      }
    },
    [favorites, storageKey]
  )

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded,
  }
}
