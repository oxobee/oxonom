'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GameController,
  Plus,
  Trash,
  PencilSimple,
  Sparkle,
  Eye,
  CheckCircle,
  Clock,
  Archive,
  Star,
  MagnifyingGlass,
  UploadSimple,
  X,
  Buildings,
  Smiley,
  ChatCircleText,
  User,
  ListPlus,
  Check,
  Globe,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import {
  GameItem,
  GameCategory,
  GameReviewAdminItem,
  SchoolOption,
  getAdminGames,
  getGameCategories,
  createAdminGame,
  updateAdminGame,
  deleteAdminGame,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminSchools,
  getAdminReviews,
  deleteAdminReview,
  syncAdminGames,
} from '@services/games/games'
import {
  getDeletedGameUuids,
  markGameAsDeleted,
  mergeWithLocalGames,
} from '@services/games/fallbackData'
import {
  saveCustomGameHtml,
  getCustomGameHtml,
  removeCustomGameHtml,
} from '@services/games/gameStorage'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import toast from 'react-hot-toast'

const ALL_GRADE_LEVELS = [
  'Okul Öncesi',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  'Lise (9-12)',
]

const EMOJI_CATEGORIES = [
  {
    name: 'Oyun & Zeka',
    emojis: ['🎮', '🕹️', '🧠', '🧩', '🎲', '♟️', '🎯', '🔮', '🃏', '👾'],
  },
  {
    name: 'Matematik & Sayılar',
    emojis: ['📐', '🔢', '➕', '➖', '✖️', '➗', '📊', '📈', '🧮', '📏'],
  },
  {
    name: 'Fen, Uzay & Doğa',
    emojis: ['🚀', '🪐', '🌍', '☀️', '🌕', '🔭', '🔬', '🧪', '⚡', '🌱'],
  },
  {
    name: 'Dil & Edebiyat',
    emojis: ['📚', '📖', '✍️', '📝', '🔤', '🗣️', '🎓', '🏷️', '📜', '💭'],
  },
  {
    name: 'Sanat, Müzik & Tasarım',
    emojis: ['🎨', '🎵', '🎹', '🎸', '🖌️', '🎭', '📷', '🎬', '🌈', '✨'],
  },
  {
    name: 'Spor & Macera',
    emojis: ['⚽', '🏀', '🎾', '🏆', '🥇', '🚴', '🏊', '🏹', '🧗', '🧭'],
  },
]

export default function GamesAdminClient() {
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token || ''
  const queryClient = useQueryClient()

  // Active Main Tab: 'games' | 'categories' | 'reviews'
  const [activeTab, setActiveTab] = useState<'games' | 'categories' | 'reviews'>('games')

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null)
  const [reviewSearchTerm, setReviewSearchTerm] = useState('')

  // Modals
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<GameItem | null>(null)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<GameCategory | null>(null)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  // Game Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null)
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formHtmlContent, setFormHtmlContent] = useState('')
  const [formGradeLevels, setFormGradeLevels] = useState<string[]>([])
  const [formAgeRange, setFormAgeRange] = useState('')
  const [formObjectivesList, setFormObjectivesList] = useState<string[]>([])
  const [newObjectiveInput, setNewObjectiveInput] = useState('')
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'coming_soon'>('published')
  const [formIsFeatured, setFormIsFeatured] = useState(false)
  const [formTargetAllOrgs, setFormTargetAllOrgs] = useState(true)
  const [formSelectedOrgIds, setFormSelectedOrgIds] = useState<number[]>([])
  const [formSecondaryCatId, setFormSecondaryCatId] = useState<number | null>(null)
  const [formIs3dSimulation, setFormIs3dSimulation] = useState(false)
  const [formVersion, setFormVersion] = useState('1.0.0')
  const [formFileName, setFormFileName] = useState('')
  const [formFileSize, setFormFileSize] = useState<number | null>(null)

  // Category Form State
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('🎮')
  const [catDesc, setCatDesc] = useState('')
  const [catTargetAllOrgs, setCatTargetAllOrgs] = useState(true)
  const [catSelectedOrgIds, setCatSelectedOrgIds] = useState<number[]>([])

  // Queries
  const { data: rawSchools = [] } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => getAdminSchools(token),
    enabled: true,
  })
  const schools = Array.isArray(rawSchools) ? rawSchools : []

  const { data: rawCategories = [] } = useQuery({
    queryKey: ['admin-game-categories'],
    queryFn: () => getGameCategories(),
  })
  const categories = Array.isArray(rawCategories) ? rawCategories : []

  const { data: rawGames = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ['admin-games', selectedCatId, selectedStatus, searchTerm],
    queryFn: async () => {
      // 1. Önce localStorage'daki oyunları oku (en yetkili kaynak)
      let localGames: GameItem[] = []
      if (typeof window !== 'undefined') {
        try {
          const localStr = localStorage.getItem('admin_synced_games')
          if (localStr) {
            const parsed = JSON.parse(localStr)
            if (Array.isArray(parsed)) localGames = parsed
          }
        } catch (_) {}
      }

      // 2. Server'dan oyunları çek (arka plan sync için)
      let serverGames: GameItem[] = []
      try {
        serverGames = await getAdminGames({ category_id: null, status: 'all', search: '' }, token)
      } catch (_) {}

      // 3. Birleştir: localStorage öncelikli, server yalnızca eksik oyunları ekler
      const mergedList = mergeWithLocalGames(Array.isArray(serverGames) ? serverGames : [])
      const deletedUuids = getDeletedGameUuids()

      // 4. Tombstone-filtered listeyi localStorage'a yaz
      if (typeof window !== 'undefined' && mergedList.length > 0) {
        try {
          localStorage.setItem('admin_synced_games', JSON.stringify(mergedList))
        } catch (_) {}
        syncAdminGames({ games: mergedList, deleted_uuids: deletedUuids }, token).catch(() => {})
      }

      // 5. UI filtrelerini uygula
      let filtered = mergedList
      if (selectedCatId) {
        filtered = filtered.filter(
          (g: any) => g.category_id === selectedCatId || g.category_ids?.includes(selectedCatId)
        )
      }
      if (selectedStatus && selectedStatus !== 'all') {
        filtered = filtered.filter((g: any) => g.status === selectedStatus)
      }
      if (searchTerm) {
        const s = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (g: any) =>
            g.title?.toLowerCase().includes(s) ||
            g.description?.toLowerCase().includes(s) ||
            g.learning_objectives?.toLowerCase().includes(s)
        )
      }
      return filtered
    },
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const games = Array.isArray(rawGames) ? rawGames : []

  const { data: rawReviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['admin-reviews', reviewSearchTerm],
    queryFn: () => getAdminReviews({ search: reviewSearchTerm }, token),
    enabled: activeTab === 'reviews',
  })
  const reviews = Array.isArray(rawReviews) ? rawReviews : []

  // Open Create Game Modal
  const handleOpenCreateGame = () => {
    setEditingGame(null)
    setFormTitle('')
    setFormDescription('')
    setFormCategoryId(categories[0]?.id || null)
    setFormSecondaryCatId(null)
    setFormIs3dSimulation(false)
    setFormVersion('1.0.0')
    setFormFileName('')
    setFormFileSize(null)
    setFormThumbnail('')
    setFormHtmlContent('')
    setFormGradeLevels(['1. Sınıf', '2. Sınıf'])
    setFormAgeRange('7-12 Yaş')
    setFormObjectivesList(['Görsel hafıza ve dikkat', 'Hızlı karar verme'])
    setNewObjectiveInput('')
    setFormStatus('published')
    setFormIsFeatured(false)
    setFormTargetAllOrgs(true)
    setFormSelectedOrgIds([])
    setIsGameModalOpen(true)
  }

  // Open Edit Game Modal
  const handleOpenEditGame = (game: GameItem) => {
    let existingHtml = (game as any)?.html_content || ''
    if (!existingHtml && typeof window !== 'undefined') {
      try {
        const localStr = localStorage.getItem('admin_synced_games')
        if (localStr) {
          const list = JSON.parse(localStr)
          const matched = list.find(
            (g: any) =>
              (game.game_uuid && g.game_uuid === game.game_uuid) ||
              (game.id && String(g.id) === String(game.id)) ||
              (game.slug && g.slug === game.slug)
          )
          if (matched?.html_content) existingHtml = matched.html_content
        }
      } catch (_) {}
    }

    setEditingGame({ ...game, html_content: existingHtml } as any)

    if (!existingHtml) {
      getCustomGameHtml([game.game_uuid, game.slug, String(game.id)]).then((customHtml) => {
        if (customHtml && customHtml.trim().length > 0) {
          setEditingGame((prev: any) => (prev ? { ...prev, html_content: customHtml } : prev))
        }
      }).catch(() => {})
    }
    setFormTitle(game.title)
    setFormDescription(game.description || '')
    setFormCategoryId(game.category_id || null)
    const secondary = game.category_ids?.find((id) => id !== game.category_id) || null
    setFormSecondaryCatId(secondary)
    setFormIs3dSimulation(!!game.is_3d_simulation)
    setFormVersion(game.version || '1.0.0')
    setFormFileName(game.file_name || '')
    setFormFileSize(game.file_size_bytes || null)
    setFormThumbnail(game.thumbnail_image || '')
    setFormHtmlContent('') // Keep existing unless user uploads new file
    setFormGradeLevels(game.grade_levels || [])
    setFormAgeRange(game.age_range || '')

    // Parse objectives into array
    const rawObj = game.learning_objectives || ''
    const lines = rawObj
      .split('\n')
      .map((l) => l.replace(/^•\s*/, '').trim())
      .filter(Boolean)
    setFormObjectivesList(lines.length > 0 ? lines : ['Analitik düşünme becerisi'])
    setNewObjectiveInput('')

    setFormStatus(game.status)
    setFormIsFeatured(game.is_featured)
    const hasOrgRestrictions = game.target_org_ids && game.target_org_ids.length > 0
    setFormTargetAllOrgs(!hasOrgRestrictions)
    setFormSelectedOrgIds(game.target_org_ids || [])
    setIsGameModalOpen(true)
  }

  // Open Create Category Modal
  const handleOpenCreateCategory = () => {
    setEditingCategory(null)
    setCatName('')
    setCatIcon('🎮')
    setCatDesc('')
    setCatTargetAllOrgs(true)
    setCatSelectedOrgIds([])
    setIsCategoryModalOpen(true)
  }

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: GameCategory) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatIcon(cat.icon || '🎮')
    setCatDesc(cat.description || '')
    const hasOrgRestrictions = cat.target_org_ids && cat.target_org_ids.length > 0
    setCatTargetAllOrgs(!hasOrgRestrictions)
    setCatSelectedOrgIds(cat.target_org_ids || [])
    setIsCategoryModalOpen(true)
  }

  // HTML File Upload
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setFormHtmlContent(text)
      setFormFileName(file.name)
      setFormFileSize(file.size)
      if (editingGame) {
        try {
          const parts = (formVersion || '1.0.0').split('.')
          parts[parts.length - 1] = String(Number(parts[parts.length - 1]) + 1)
          setFormVersion(parts.join('.'))
        } catch {
          setFormVersion('1.0.1')
        }
      }
      toast.success(`${file.name} dosyası seçildi! Eski dosya silinerek bu sürüm kaydedilecektir.`)
    }
    reader.readAsText(file)
  }

  // 1:1 Thumbnail Image Upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setFormThumbnail(base64)
      toast.success('1:1 Kare kapak görseli başarıyla seçildi!')
    }
    reader.readAsDataURL(file)
  }

  // Objectives List Helpers
  const handleAddObjective = () => {
    if (!newObjectiveInput.trim()) return
    setFormObjectivesList((prev) => [...prev, newObjectiveInput.trim()])
    setNewObjectiveInput('')
  }

  const handleRemoveObjective = (idx: number) => {
    setFormObjectivesList((prev) => prev.filter((_, i) => i !== idx))
  }

  // Save Game Mutation
  const saveGameMutation = useMutation({
    mutationFn: async () => {
      if (!formTitle.trim()) throw new Error('Oyun adı zorunludur.')
      if (!editingGame && !formHtmlContent.trim()) {
        throw new Error('Lütfen bir HTML oyun dosyası yükleyin.')
      }

      const formattedObjectives = formObjectivesList.map((m) => `• ${m}`).join('\n')
      const catIds = [formCategoryId, formSecondaryCatId].filter(
        (id): id is number => typeof id === 'number' && id > 0
      )
      const selectedCat = categories.find((c) => c.id === formCategoryId)

      const targetUuid = editingGame?.game_uuid || (editingGame?.id ? String(editingGame.id) : '')
      const payload: any = {
        id: editingGame?.id,
        game_uuid: editingGame?.game_uuid,
        category_id: formCategoryId,
        category_ids: catIds.length > 0 ? catIds : null,
        category_name: selectedCat?.name || 'Genel',
        category_icon: selectedCat?.icon || '🎮',
        is_3d_simulation: formIs3dSimulation,
        title: formTitle,
        description: formDescription,
        thumbnail_image: formThumbnail,
        grade_levels: formGradeLevels,
        age_range: formAgeRange,
        learning_objectives: formattedObjectives,
        status: formStatus,
        is_featured: formIsFeatured,
        target_org_ids: formTargetAllOrgs ? null : formSelectedOrgIds,
        version: formVersion,
        file_name: formFileName || undefined,
        file_size_bytes: formFileSize || undefined,
      }
      const finalHtml = formHtmlContent.trim() ? formHtmlContent : ((editingGame as any)?.html_content || '')
      if (finalHtml) {
        payload.html_content = finalHtml
        const preKeys = [targetUuid, editingGame?.slug, editingGame?.id ? String(editingGame.id) : null].filter(Boolean) as string[]
        await saveCustomGameHtml(preKeys, finalHtml).catch(() => {})
      }

      if (editingGame) {
        return updateAdminGame(targetUuid, payload, token)
      } else {
        return createAdminGame(payload, token)
      }
    },
    onSuccess: async (savedResult: any) => {
      if (typeof window !== 'undefined') {
        const catIds = [formCategoryId, formSecondaryCatId].filter(
          (id): id is number => typeof id === 'number' && id > 0
        )
        const selectedCat = categories.find((c) => c.id === formCategoryId)
        const effectiveHtml = formHtmlContent.trim() ? formHtmlContent : ((editingGame as any)?.html_content || undefined)

        // Save custom HTML to IndexedDB & local storage
        if (effectiveHtml) {
          const keysToSave = [
            savedResult?.game_uuid,
            editingGame?.game_uuid,
            savedResult?.slug,
            editingGame?.slug,
            savedResult?.id ? String(savedResult.id) : null,
            editingGame?.id ? String(editingGame.id) : null,
          ].filter(Boolean) as string[]
          await saveCustomGameHtml(keysToSave, effectiveHtml).catch(() => {})
        }

        const localPayload = {
          category_id: formCategoryId,
          category_ids: catIds.length > 0 ? catIds : null,
          category_name: selectedCat?.name || 'Genel',
          category_icon: selectedCat?.icon || '🎮',
          is_3d_simulation: formIs3dSimulation,
          title: formTitle,
          description: formDescription,
          thumbnail_image: formThumbnail,
          grade_levels: formGradeLevels,
          age_range: formAgeRange,
          learning_objectives: formObjectivesList.map((m) => `• ${m}`).join('\n'),
          status: formStatus,
          is_featured: formIsFeatured,
          target_org_ids: formTargetAllOrgs ? null : formSelectedOrgIds,
          version: formVersion,
          file_name: formFileName || undefined,
          file_size_bytes: formFileSize || undefined,
          html_content: effectiveHtml,
          has_html_content: true,
        }

        try {
          const stored = localStorage.getItem('admin_synced_games')
          let currentList = stored ? JSON.parse(stored) : [...games]
          if (!Array.isArray(currentList)) currentList = [...games]

          if (editingGame) {
            let matched = false
            currentList = currentList.map((g: any) => {
              const isMatch =
                (editingGame.game_uuid && g.game_uuid === editingGame.game_uuid) ||
                (editingGame.id && String(g.id) === String(editingGame.id)) ||
                (savedResult?.game_uuid && g.game_uuid === savedResult.game_uuid) ||
                (savedResult?.id && String(g.id) === String(savedResult.id))
              if (isMatch) {
                matched = true
                return {
                  ...g,
                  ...savedResult,
                  ...localPayload,
                  id: g.id || savedResult?.id || editingGame.id,
                  game_uuid: g.game_uuid || savedResult?.game_uuid || editingGame.game_uuid,
                  update_date: new Date().toISOString(),
                }
              }
              return g
            })
            if (!matched) {
              currentList.unshift({
                id: savedResult?.id || editingGame.id || Date.now(),
                game_uuid: savedResult?.game_uuid || editingGame.game_uuid || `game_${Date.now()}`,
                creation_date: (editingGame as any)?.creation_date || new Date().toISOString(),
                update_date: new Date().toISOString(),
                ...localPayload,
              })
            }
          } else {
            const newG = {
              id: savedResult?.id || Date.now(),
              game_uuid: savedResult?.game_uuid || `game_${Date.now()}`,
              creation_date: new Date().toISOString(),
              update_date: new Date().toISOString(),
              ...localPayload,
            }
            currentList = [newG, ...currentList]
          }

          // Try saving to localStorage; if quota exceeded due to large html strings, trim inline html
          try {
            localStorage.setItem('admin_synced_games', JSON.stringify(currentList))
          } catch (quotaErr) {
            try {
              const trimmed = currentList.map((g: any) => {
                if (g.html_content && g.html_content.length > 5000) {
                  const { html_content, ...rest } = g
                  return { ...rest, has_html_content: true }
                }
                return g
              })
              localStorage.setItem('admin_synced_games', JSON.stringify(trimmed))
            } catch (_) {}
          }
        } catch (_) {}

        window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
        syncAdminGames({ games: [savedResult || localPayload], deleted_uuids: getDeletedGameUuids() }, token).catch(() => {})
      }
      toast.success(editingGame ? 'Oyun güncellendi!' : 'Yeni oyun başarıyla oluşturuldu!')
      setIsGameModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-games'] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
      queryClient.invalidateQueries({ queryKey: ['admin-game-categories'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Oyun kaydedilirken hata oluştu.')
    },
  })

  // Delete Game Mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (uuid: string) => {
      // localStorage ve cookie'ye hemen tombstone ekle (API'den bağımsız)
      markGameAsDeleted(uuid)
      removeCustomGameHtml([uuid]).catch(() => {})
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('admin_synced_games')
          let currentList = stored ? JSON.parse(stored) : []
          if (Array.isArray(currentList)) {
            currentList = currentList.filter(
              (g: any) => g.game_uuid !== uuid && String(g.id) !== String(uuid) && g.slug !== uuid
            )
            localStorage.setItem('admin_synced_games', JSON.stringify(currentList))
          }
        } catch (_) {}
        window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
      }
      // API'ye de gönder (başarısız olsa bile tombstone korunur)
      try {
        await deleteAdminGame(uuid, token)
      } catch (_) {}
      return uuid
    },
    onSuccess: (uuid: string) => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('admin_synced_games')
          const currentList = stored ? JSON.parse(stored) : []
          syncAdminGames({ games: currentList, deleted_uuids: getDeletedGameUuids() }, token).catch(() => {})
        } catch (_) {}
      }
      toast.success('Oyun kalıcı olarak silindi.')
      setIsGameModalOpen(false)
      setEditingGame(null)
      queryClient.invalidateQueries({ queryKey: ['admin-games'] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Oyun silinirken hata oluştu.')
    },
  })

  // Save Category Mutation (Create or Update)
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!catName.trim()) throw new Error('Kategori adı zorunludur.')
      const payload = {
        name: catName,
        icon: catIcon,
        description: catDesc,
        target_org_ids: catTargetAllOrgs ? null : catSelectedOrgIds,
      }
      if (editingCategory) {
        return updateAdminCategory(editingCategory.id, payload, token)
      } else {
        return createAdminCategory(payload, token)
      }
    },
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
      }
      toast.success(editingCategory ? 'Kategori güncellendi!' : 'Kategori oluşturuldu!')
      setIsCategoryModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-game-categories'] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
      queryClient.invalidateQueries({ queryKey: ['admin-games'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Kategori kaydedilemedi.')
    },
  })

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (catId: number) => deleteAdminCategory(catId, token),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('oxonom-games-updated'))
      }
      toast.success('Kategori silindi.')
      queryClient.invalidateQueries({ queryKey: ['admin-game-categories'] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
      queryClient.invalidateQueries({ queryKey: ['admin-games'] })
      setIsCategoryModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Kategori silinemedi.')
    },
  })

  // Delete Review Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteAdminReview(reviewId, token),
    onSuccess: () => {
      toast.success('Öğrenci yorumu silindi.')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
    },
  })

  const toggleGrade = (grade: string) => {
    setFormGradeLevels((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    )
  }

  const toggleOrgSelection = (orgId: number, isCategory: boolean = false) => {
    if (isCategory) {
      setCatSelectedOrgIds((prev) =>
        prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
      )
    } else {
      setFormSelectedOrgIds((prev) =>
        prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
      )
    }
  }

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* ── TOP HEADER (DARK SLATE THEME) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161618] border border-[#27272a] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shrink-0">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Oyun Yönetim Merkezi
              </h1>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Süper Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Platforma HTML5 oyunları yükleyin, kategorileri düzenleyin, okullara özel atamalar yapın
              ve öğrencilerin bıraktığı gizli geri bildirimleri inceleyin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenCreateCategory}
            className="px-4 py-2.5 bg-[#202024] hover:bg-[#28282c] text-slate-200 border border-[#2e2e34] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Kategori Ekle</span>
          </button>
          <button
            onClick={handleOpenCreateGame}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} weight="bold" />
            <span>Yeni Oyun Yükle</span>
          </button>
        </div>
      </div>

      {/* ── MAIN TABS ── */}
      <div className="flex items-center gap-2 border-b border-[#27272a] pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'games'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[#18181b] text-slate-400 hover:text-slate-200 border border-[#27272a]'
          }`}
        >
          <GameController size={16} />
          <span>Oyunlar ({games.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-[#18181b] text-slate-400 hover:text-slate-200 border border-[#27272a]'
          }`}
        >
          <Archive size={16} />
          <span>Kategoriler & Okul İzinleri ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'bg-[#18181b] text-slate-400 hover:text-slate-200 border border-[#27272a]'
          }`}
        >
          <ChatCircleText size={16} />
          <span>Öğrenci Yorumları & Puanlar</span>
          {reviews.length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {reviews.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: OYUNLAR LİSTESİ
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {/* Filter Bar (Dark Slate) */}
          <div className="bg-[#161618] border border-[#27272a] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full md:w-80">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Oyun adı veya açıklamasında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#202024] border border-[#2e2e34] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Category Filter */}
              <select
                value={selectedCatId || ''}
                onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : null)}
                className="bg-[#202024] border border-[#2e2e34] text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#202024] border border-[#2e2e34] text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
                <option value="coming_soon">Yakında</option>
              </select>
            </div>
          </div>

          {/* Games Grid */}
          {isLoadingGames ? (
            <div className="h-64 bg-[#161618] rounded-2xl border border-[#27272a] animate-pulse flex items-center justify-center text-xs text-slate-500 font-bold">
              Oyunlar Yükleniyor...
            </div>
          ) : games.length === 0 ? (
            <div className="bg-[#161618] rounded-3xl border border-[#27272a] p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl mx-auto border border-indigo-500/20">
                🎮
              </div>
              <h2 className="text-base font-extrabold text-white">Henüz oyun bulunamadı</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Yeni bir HTML5 oyunu yükleyerek sistemi zenginleştirin veya arama filtrelerinizi kontrol edin.
              </p>
              <button
                onClick={handleOpenCreateGame}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                İlk Oyunu Yükle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-[#161618] rounded-2xl border border-[#27272a] shadow-md overflow-hidden flex flex-col justify-between hover:border-indigo-500/60 transition group"
                >
                  <div>
                    {/* 1:1 SQUARE UNCROPPED COVER */}
                    <div className="relative aspect-square bg-[#0f0f10] flex items-center justify-center overflow-hidden border-b border-[#27272a] p-3">
                      {game.thumbnail_image ? (
                        <img
                          src={game.thumbnail_image}
                          alt={game.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-6xl block drop-shadow-md">{game.category_icon || '🎮'}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                            {game.category_name || 'Oyun'}
                          </span>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-xs ${
                            game.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : game.status === 'draft'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {game.status === 'published'
                            ? 'Yayında'
                            : game.status === 'draft'
                            ? 'Taslak'
                            : 'Yakında'}
                        </span>
                        <span className="bg-black/60 text-slate-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/10">
                          v{game.version || '1.0.0'}
                        </span>
                        {game.is_featured && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                            <Star size={10} weight="fill" /> Öne Çıkan
                          </span>
                        )}
                      </div>

                      {/* Rating & Play Count Pill */}
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-2 border border-white/10">
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Star size={10} weight="fill" /> {game.average_rating || 5.0}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-300 flex items-center gap-0.5">
                          <Eye size={11} /> {game.play_count}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-indigo-400 flex items-center gap-1">
                          <span>{game.category_icon}</span>
                          <span>{game.category_name}</span>
                        </span>
                        {game.age_range && <span className="text-slate-400">{game.age_range}</span>}
                      </div>

                      <h3 className="font-extrabold text-white text-sm leading-snug group-hover:text-indigo-400 transition">
                        {game.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {game.description || 'Açıklama belirtilmemiş.'}
                      </p>

                      {/* Kazanımlar / Bullets Preview */}
                      {game.learning_objectives && (
                        <div className="pt-1 text-[11px] text-slate-300 space-y-0.5 line-clamp-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Kazanımlar:
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {game.learning_objectives.split('\n').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      )}

                      {/* School Access Tag */}
                      <div className="pt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Buildings size={12} className="text-amber-400 shrink-0" />
                        <span>
                          {!game.target_org_ids || game.target_org_ids.length === 0
                            ? 'Tüm Okullara Açık'
                            : `${game.target_org_ids.length} Belirli Okul`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-[#111113] border-t border-[#27272a] flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditGame(game)}
                      className="px-3 py-1.5 bg-[#202024] hover:bg-[#28282c] text-slate-200 border border-[#2e2e34] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <PencilSimple size={13} />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`'${game.title}' oyununu silmek istediğinize emin misiniz?`)) {
                          deleteGameMutation.mutate(game.game_uuid || String(game.id))
                        }
                      }}
                      className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                      title="Oyunu Sil"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: KATEGORİLER & HEDEF OKULLAR
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Kategorileri düzenleyebilir, emoji kütüphanesinden simge seçebilir veya belirli okullara tanımlayabilirsiniz.
            </p>
            <button
              onClick={handleOpenCreateCategory}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Yeni Kategori</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const hasOrgLimits = cat.target_org_ids && cat.target_org_ids.length > 0
              return (
                <div
                  key={cat.id}
                  className="bg-[#161618] border border-[#27272a] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#202024] border border-[#2e2e34] flex items-center justify-center text-3xl">
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{cat.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {cat.description || 'Açıklama yok'}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">slug: {cat.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 hover:bg-[#28282c] text-slate-300 rounded-lg transition cursor-pointer"
                        title="Kategoriyi Düzenle"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `'${cat.name}' kategorisini silmek istediğinize emin misiniz? Bu kategoriye bağlı oyunlar silinmez, kategorisiz kalır.`
                            )
                          ) {
                            deleteCategoryMutation.mutate(cat.id)
                          }
                        }}
                        className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                        title="Kategoriyi Sil"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* School Access Tag */}
                  <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Buildings size={14} className="text-amber-400" />
                      {!hasOrgLimits
                        ? 'Tüm Okullarda Aktif'
                        : `${cat.target_org_ids!.length} Okula Tanımlı`}
                    </span>
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      Okul Yetkilerini Değiştir &rarr;
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: ÖĞRENCİ YORUMLARI & GERİ BİLDİRİMLER (SÜPER ADMİN ÖZEL)
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#161618] border border-[#27272a] rounded-2xl p-4">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Star size={16} weight="fill" className="text-amber-400" />
                <span>Öğrenci Puanları ve Gizli Geri Bildirimleri</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bu yorumlar yalnızca Süper Admin tarafından görülebilir; öğrencilerin profil ve okul bilgileriyle listelenir.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <MagnifyingGlass size={15} className="absolute left-3.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Öğrenci, oyun veya yorumda ara..."
                value={reviewSearchTerm}
                onChange={(e) => setReviewSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#202024] border border-[#2e2e34] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="h-48 bg-[#161618] rounded-2xl border border-[#27272a] animate-pulse flex items-center justify-center text-xs text-slate-500 font-bold">
              Yorumlar Yükleniyor...
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#161618] rounded-3xl border border-[#27272a] p-12 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center text-2xl mx-auto border border-amber-400/20">
                💬
              </div>
              <h3 className="text-sm font-bold text-white">Henüz geri bildirim bulunmuyor</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Öğrenciler oyunları oynayıp değerlendirme ve yorum yaptıkça burada profil detaylarıyla görüntülenecektir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#161618] border border-[#27272a] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="space-y-2 flex-1">
                    {/* User profile & Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {rev.user_avatar ? (
                          <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full object-cover" />
                        ) : (
                          rev.user_name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{rev.user_name}</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                            {rev.user_role || 'Öğrenci'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.user_email}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-[#202024] px-2.5 py-1 rounded-lg border border-[#2e2e34]">
                        <Buildings size={12} className="text-amber-400" />
                        <span>{rev.org_name || 'Okul Belirtilmemiş'}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-[#202024] px-2.5 py-1 rounded-lg border border-[#2e2e34]">
                        <GameController size={12} className="text-indigo-400" />
                        <span className="font-bold text-slate-200">{rev.game_title}</span>
                      </div>
                    </div>

                    {/* Comment & Stars */}
                    <div className="flex items-start gap-3 bg-[#111113] border border-[#222226] rounded-xl p-3">
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            weight={rev.rating >= s ? 'fill' : 'regular'}
                            className={rev.rating >= s ? 'text-amber-400' : 'text-slate-700'}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {rev.comment ? `"${rev.comment}"` : <span className="text-slate-500 italic">Yorum yazılmadı, sadece yıldız puanı verildi.</span>}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Date */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rev.creation_date?.slice(0, 10)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                          deleteReviewMutation.mutate(rev.id)
                        }
                      }}
                      className="px-2.5 py-1 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash size={13} />
                      <span>Yorumu Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 1: OYUN EKLE / DÜZENLE MODALI
      ══════════════════════════════════════════════════════════ */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#161618] border border-[#27272a] rounded-3xl p-6 max-w-2xl w-full text-white shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                  🎮
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingGame ? 'Oyunu Düzenle' : 'Yeni HTML5 Oyun Yükle'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Oyun bilgilerini, 1:1 kare kapak görselini, kazanımları ve hedef okulları belirleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGameModalOpen(false)}
                className="p-1.5 hover:bg-[#202024] text-slate-400 hover:text-white rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Title & Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Oyun Adı *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: Uzay Macerası Matematik"
                    className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Ana Kategori *</label>
                  <select
                    value={formCategoryId || ''}
                    onChange={(e) => setFormCategoryId(Number(e.target.value))}
                    className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Category (Ek Kategori & 3D Simülasyon Seçeneği) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#1b1b1e] border border-[#27272a] rounded-2xl">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span>Ek Kategori / 2. Kategori</span>
                    <span className="text-[10px] text-slate-500">(İsteğe Bağlı)</span>
                  </label>
                  <select
                    value={formSecondaryCatId || ''}
                    onChange={(e) => setFormSecondaryCatId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Yok (Sadece Ana Kategori)</option>
                    {categories
                      .filter((c) => c.id !== formCategoryId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col justify-center space-y-1.5 pt-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span>Gelişmiş Simülasyon</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIs3dSimulation}
                      onChange={(e) => setFormIs3dSimulation(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-[#202024] border-[#2e2e34] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-semibold">
                      🪐 Gelişmiş simülasyon modu
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Kısa Açıklama</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Oyunun hikayesi ve ne öğrettiği hakkında kısa bilgi..."
                  className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* 1:1 Square Cover Upload & Preview */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>1:1 Kare Kapak Görseli (Kırpılmadan Gösterilir)</span>
                  <span className="text-[10px] text-slate-500">PNG, JPG, SVG veya Base64</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#202024] border border-dashed border-[#2e2e34] hover:border-indigo-500 rounded-xl cursor-pointer transition">
                    <UploadSimple size={16} className="text-indigo-400" />
                    <span className="text-slate-300 font-bold">Kare Görsel Seç</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                  {formThumbnail && (
                    <div className="w-12 h-12 rounded-xl bg-black border border-[#27272a] p-1 shrink-0 overflow-hidden">
                      <img src={formThumbnail} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* HTML5 Game File Upload & Versioning */}
              <div className="space-y-2 bg-[#1b1b1e] border border-[#27272a] rounded-2xl p-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-slate-300 flex items-center gap-2">
                    <span>HTML5 Oyun Dosyası (.html) *</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30">
                      Sürüm: v{formVersion}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Versiyon:</span>
                    <input
                      type="text"
                      value={formVersion}
                      onChange={(e) => setFormVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-20 bg-[#202024] border border-[#2e2e34] rounded-lg px-2 py-1 text-center text-xs font-bold text-amber-400 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <label className="flex items-center justify-center gap-2 p-3 bg-[#202024] border border-dashed border-[#2e2e34] hover:border-amber-400 rounded-xl cursor-pointer transition">
                  <UploadSimple size={16} className="text-amber-400" />
                  <span className="text-slate-300 font-bold">
                    {formHtmlContent ? 'Yeni Dosya Seç (Eski Dosya Değiştirilir)' : '.html Dosyası Yükle'}
                  </span>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleHtmlFileUpload}
                    className="hidden"
                  />
                </label>

                {formFileName && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between bg-[#202024] px-3 py-1.5 rounded-xl border border-[#2e2e34]">
                    <span className="text-slate-300 font-medium">📄 {formFileName}</span>
                    {formFileSize && (
                      <span className="text-slate-500 font-bold">
                        {Math.round(formFileSize / 1024)} KB
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-amber-300/80 leading-relaxed">
                  💡 Yeni dosya seçtiğinizde sunucudaki eski dosya silinerek en güncel sürüm geçerli olacaktır.
                </p>
              </div>

              {/* Kazanımlar (Maddeler Halinde Düzenli Liste) */}
              <div className="space-y-2 bg-[#1b1b1e] border border-[#27272a] rounded-2xl p-3.5">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Öğrenme Kazanımları (Maddeler Halinde)</span>
                  <span className="text-[10px] text-slate-500">Öğrencinin elde edeceği beceriler</span>
                </label>

                {/* Bullets List */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {formObjectivesList.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 bg-[#202024] px-3 py-1.5 rounded-xl border border-[#2e2e34]"
                    >
                      <span className="text-slate-200 text-xs flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{obj}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                        title="Maddeyi Sil"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Bullet Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Yeni bir kazanım maddesi yazın..."
                    value={newObjectiveInput}
                    onChange={(e) => setNewObjectiveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddObjective()
                      }
                    }}
                    className="flex-1 bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ListPlus size={14} />
                    <span>Madde Ekle</span>
                  </button>
                </div>
              </div>

              {/* Sınıf Seviyeleri */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Hedef Sınıf Kademeleri</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ALL_GRADE_LEVELS.map((gr) => {
                    const active = formGradeLevels.includes(gr)
                    return (
                      <button
                        key={gr}
                        type="button"
                        onClick={() => toggleGrade(gr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#202024] text-slate-400 hover:text-white border border-[#2e2e34]'
                        }`}
                      >
                        {gr}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hedef Okullar Tanımlama */}
              <div className="space-y-2 bg-[#1b1b1e] border border-[#27272a] rounded-2xl p-3.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Buildings size={15} className="text-amber-400" />
                    <span>Okul Yetkilendirmesi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={formTargetAllOrgs}
                      onChange={(e) => setFormTargetAllOrgs(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Tüm Okullara Açık</span>
                  </label>
                </div>

                {!formTargetAllOrgs && (
                  <div className="space-y-1.5 pt-2 border-t border-[#27272a]">
                    <p className="text-[11px] text-slate-400">
                      Bu oyunun sadece seçtiğiniz okullarda görünmesini sağlayın:
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {schools.map((sch) => {
                        const isChecked = formSelectedOrgIds.includes(sch.id)
                        return (
                          <label
                            key={sch.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200'
                                : 'bg-[#202024] border-[#2e2e34] text-slate-400 hover:text-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleOrgSelection(sch.id, false)}
                              className="accent-indigo-500"
                            />
                            <span className="truncate">{sch.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Status & 3D Slider Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Yayın Durumu</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="published">Yayında (Aktif)</option>
                    <option value="draft">Taslak (Gizli)</option>
                    <option value="coming_soon">Yakında (Görüntülenir fakat oynanmaz)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Öne Çıkanlar Vitrininde Göster</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-[#27272a] pt-4">
              <div>
                {editingGame && (
                  <button
                    type="button"
                    disabled={deleteGameMutation.isPending}
                    onClick={() => {
                      if (confirm(`'${editingGame.title}' oyununu kalıcı olarak silmek istediğinize emin misiniz?`)) {
                        deleteGameMutation.mutate(editingGame.game_uuid || String(editingGame.id))
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash size={14} />
                    <span>{deleteGameMutation.isPending ? 'Siliniyor...' : 'Oyunu Sil'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-4 py-2 bg-[#202024] hover:bg-[#28282c] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={saveGameMutation.isPending}
                  onClick={() => saveGameMutation.mutate()}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {saveGameMutation.isPending ? 'Kaydediliyor...' : editingGame ? 'Güncelle' : 'Oyunu Yükle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 2: KATEGORİ TANIMLAMA / DÜZENLEME & EMOJİ KÜTÜPHANESİ
      ══════════════════════════════════════════════════════════ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#161618] border border-[#27272a] rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{catIcon}</span>
                <h3 className="text-base font-black text-white">
                  {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Oyun Kategorisi Ekle'}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 hover:bg-[#202024] text-slate-400 hover:text-white rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="font-bold text-slate-300">Simge</label>
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="w-full h-10 bg-[#202024] border border-[#2e2e34] hover:border-indigo-400 rounded-xl text-2xl flex items-center justify-center transition cursor-pointer"
                    title="Emoji Kütüphanesini Aç"
                  >
                    {catIcon}
                  </button>
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="font-bold text-slate-300">Kategori Adı *</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Örn: Zeka & Mantık"
                    className="w-full h-10 bg-[#202024] border border-[#2e2e34] rounded-xl px-3 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Emoji Picker Popover */}
              {isEmojiPickerOpen && (
                <div className="bg-[#202024] border border-[#2e2e34] rounded-2xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#2e2e34] pb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Smiley size={14} className="text-amber-400" />
                      <span>Eğitici Emoji Kütüphanesi</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {EMOJI_CATEGORIES.map((sec) => (
                      <div key={sec.name} className="space-y-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                          {sec.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sec.emojis.map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => {
                                setCatIcon(em)
                                setIsEmojiPickerOpen(false)
                              }}
                              className="w-8 h-8 rounded-lg bg-[#28282c] hover:bg-indigo-600/40 text-lg flex items-center justify-center transition cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Açıklama</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Kategori altında yer alacak oyunların genel amacı..."
                  className="w-full bg-[#202024] border border-[#2e2e34] rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Okul Sınırlaması */}
              <div className="space-y-2 bg-[#1b1b1e] border border-[#27272a] rounded-2xl p-3.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Buildings size={15} className="text-amber-400" />
                    <span>Hedef Okul Tanımlaması</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={catTargetAllOrgs}
                      onChange={(e) => setCatTargetAllOrgs(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Tüm Okullara Açık</span>
                  </label>
                </div>

                {!catTargetAllOrgs && (
                  <div className="space-y-1.5 pt-2 border-t border-[#27272a]">
                    <p className="text-[11px] text-slate-400">
                      Bu kategoriyi ve içerisindeki oyunları sadece işaretlediğiniz okullara açın:
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {schools.map((sch) => {
                        const isChecked = catSelectedOrgIds.includes(sch.id)
                        return (
                          <label
                            key={sch.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200'
                                : 'bg-[#202024] border-[#2e2e34] text-slate-400 hover:text-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleOrgSelection(sch.id, true)}
                              className="accent-indigo-500"
                            />
                            <span className="truncate">{sch.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions with Category Delete Option */}
            <div className="flex items-center justify-between border-t border-[#27272a] pt-4">
              <div>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`'${editingCategory.name}' kategorisini silmek istediğinize emin misiniz?`)) {
                        deleteCategoryMutation.mutate(editingCategory.id)
                      }
                    }}
                    className="px-3 py-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Kategoriyi Sil</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#202024] hover:bg-[#28282c] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={saveCategoryMutation.isPending}
                  onClick={() => saveCategoryMutation.mutate()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {saveCategoryMutation.isPending
                    ? 'Kaydediliyor...'
                    : editingCategory
                    ? 'Kategoriyi Güncelle'
                    : 'Kategori Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
