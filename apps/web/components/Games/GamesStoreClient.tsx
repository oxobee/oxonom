'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GameController,
  Sparkle,
  Star,
  Play,
  ArrowRight,
  ArrowLeft,
  CaretLeft,
  CaretRight,
  ArrowsOut,
  ArrowsIn,
  ArrowClockwise,
  X,
  MagnifyingGlass,
  GraduationCap,
  Users,
  Eye,
  ChatCircleText,
  CheckCircle,
  PaperPlaneTilt,
  Lock,
  Target,
  Cube,
  Info,
  ShieldCheck,
  Check,
} from '@phosphor-icons/react'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import {
  getGamesStore,
  GameItem,
  GameCategory,
  getGamePlay,
  getGameRating,
  submitGameReview,
  GameRatingSummary,
} from '@services/games/games'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { Breadcrumbs } from '@components/Objects/Breadcrumbs/Breadcrumbs'
import toast from 'react-hot-toast'

export default function GamesStoreClient() {
  const org = useOrg() as any
  const orgId = org?.id || 2
  const orgslug = org?.slug || 'demo'

  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token || ''
  const queryClient = useQueryClient()

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all')
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 3D Elastic Slider state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isSliderHovered, setIsSliderHovered] = useState(false)

  // Game Detail Modal state
  const [selectedGameDetail, setSelectedGameDetail] = useState<GameItem | null>(null)

  // Game Player Modal state
  const [playingGame, setPlayingGame] = useState<GameItem | null>(null)
  const [gameHtmlContent, setGameHtmlContent] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoadingGame, setIsLoadingGame] = useState(false)
  const playerIframeRef = useRef<HTMLIFrameElement>(null)

  // In-Player Feedback Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [userRating, setUserRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [userComment, setUserComment] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Query for games store
  const { data: storeData, isLoading } = useQuery({
    queryKey: ['games-store', orgId, activeCategorySlug, activeGradeFilter, searchTerm],
    queryFn: () =>
      getGamesStore(orgId, {
        category_slug: activeCategorySlug,
        grade_level: activeGradeFilter,
        search: searchTerm,
      }),
    enabled: !!orgId,
    refetchOnWindowFocus: true,
  })

  // Auto-refresh when admin modifies games or categories
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
    }
    window.addEventListener('oxonom-games-updated', handleUpdate)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_synced_games') handleUpdate()
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('oxonom-games-updated', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [queryClient])

  // Query for active game rating
  const { data: currentRatingData } = useQuery({
    queryKey: ['game-rating', playingGame?.game_uuid],
    queryFn: () => getGameRating(playingGame!.game_uuid, token),
    enabled: !!playingGame?.game_uuid,
  })

  // Sync user review when rating data arrives
  useEffect(() => {
    if (currentRatingData?.my_review) {
      setUserRating(currentRatingData.my_review.rating)
      setUserComment(currentRatingData.my_review.comment || '')
    } else {
      setUserRating(5)
      setUserComment('')
    }
  }, [currentRatingData])

  const categories = storeData?.categories || []
  const allGames = storeData?.all_games || []
  const featuredGames = (storeData?.featured && storeData.featured.length > 0)
    ? storeData.featured
    : allGames.filter((g) => g.is_featured).length > 0
    ? allGames.filter((g) => g.is_featured)
    : allGames.slice(0, 4)

  const categorySliders = (storeData?.sliders && storeData.sliders.length > 0)
    ? storeData.sliders
    : categories
        .map((cat) => ({
          category: cat,
          games: allGames.filter((g) => g.category_id === cat.id || g.category_ids?.includes(cat.id)),
        }))
        .filter((s) => s.games.length > 0)

  // Auto-advance 3D slider with pause on hover
  useEffect(() => {
    if (featuredGames.length <= 1 || isSliderHovered) return
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % featuredGames.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [featuredGames.length, isSliderHovered])

  // Open Game in Player
  const handlePlayGame = async (game: GameItem) => {
    setPlayingGame(game)
    setIsLoadingGame(true)
    try {
      if ((game as any).html_content && String((game as any).html_content).trim().length > 0) {
        setGameHtmlContent((game as any).html_content)
      } else {
        const res = await getGamePlay(game.game_uuid)
        setGameHtmlContent(res.html_content)
      }
    } catch (e) {
      console.error('Failed to load game play data:', e)
      toast.error('Oyun yüklenirken bir hata oluştu.')
    } finally {
      setIsLoadingGame(false)
    }
  }

  const handleClosePlayer = () => {
    setPlayingGame(null)
    setGameHtmlContent('')
    setIsFullscreen(false)
    setIsFeedbackModalOpen(false)
  }

  const handleRestartGame = () => {
    if (playerIframeRef.current) {
      playerIframeRef.current.srcdoc = gameHtmlContent
      toast.success('Oyun yeniden başlatıldı.')
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  // Submit Rating & Feedback
  const handleSubmitReview = async () => {
    if (!playingGame) return
    if (!token) {
      toast.error('Geri bildirim göndermek için lütfen giriş yapın.')
      return
    }
    setIsSubmittingReview(true)
    try {
      await submitGameReview(
        playingGame.game_uuid,
        {
          rating: userRating,
          comment: userComment,
        },
        orgId,
        token
      )
      toast.success('Puanınız ve geri bildiriminiz başarıyla iletildi! Teşekkür ederiz.')
      setIsFeedbackModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['game-rating', playingGame.game_uuid] })
      queryClient.invalidateQueries({ queryKey: ['games-store'] })
    } catch (err: any) {
      toast.error(err.message || 'Değerlendirme kaydedilirken hata oluştu.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const gradeOptions = [
    'all',
    'Okul Öncesi',
    '1. Sınıf',
    '2. Sınıf',
    '3. Sınıf',
    '4. Sınıf',
    '5. Sınıf',
    '6. Sınıf',
    '7. Sınıf',
    '8. Sınıf',
    'Lise',
  ]

  const featuredCount = featuredGames.length
  const currentFeatured = featuredGames[activeSlideIndex]

  return (
    <GeneralWrapperStyled>
      <div className="space-y-8 pb-16">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <Breadcrumbs
              items={[
                { label: 'Eğitim Portalı', href: `/orgs/${orgslug}` },
                { label: 'Oyunlar', href: `/orgs/${orgslug}/games` },
              ]}
            />
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1.5 flex items-center gap-2.5">
              <span>Eğitici Oyunlar Dünyası</span>
              <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-extrabold rounded-full border border-amber-200">
                HTML5 Arcade & 3D
              </span>
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Toplam <span className="font-bold text-indigo-600">{allGames.length}</span> interaktif eğitici oyun
          </div>
        </div>

        {/* ── 1. ELASTIC 3D HERO SLIDER WITH CALM PATTERN BACKGROUND ── */}
        {featuredCount > 0 && currentFeatured && (
          <div
            className="relative overflow-hidden rounded-3xl bg-radial from-slate-900 via-indigo-950 to-slate-950 border border-indigo-900/60 p-6 sm:p-10 shadow-2xl text-white"
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
          >
            {/* Eye-friendly calm SVG geometric and dot patterns */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="hero-pattern-dots"
                  width="28"
                  height="28"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.2" fill="#818cf8" />
                </pattern>
                <pattern
                  id="hero-pattern-grid"
                  width="84"
                  height="84"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 84 0 L 0 0 0 84"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern-dots)" />
              <rect width="100%" height="100%" fill="url(#hero-pattern-grid)" />
            </svg>

            {/* Soft calm ambient light without harsh flashing */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              {/* Left Content Side */}
              <div className="flex-1 space-y-4 max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide text-amber-300">
                  <Sparkle size={14} weight="fill" className="text-amber-400" />
                  <span>ÖNE ÇIKAN DERS OYUNU</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="text-white/80">
                    {activeSlideIndex + 1} / {featuredCount}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {currentFeatured.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed font-normal">
                  {currentFeatured.description ||
                    'MEB müfredatına uygun interaktif kazanım odaklı HTML5 eğitici oyun.'}
                </p>

                {/* Tags and Score Pill */}
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap pt-1">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl text-xs font-bold">
                    {currentFeatured.category_icon} {currentFeatured.category_name}
                  </span>
                  {currentFeatured.is_3d_simulation && (
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-sm">
                      <Cube size={13} weight="fill" />
                      <span>3D Simülasyon</span>
                    </span>
                  )}
                  {currentFeatured.age_range && (
                    <span className="px-3 py-1 bg-white/10 text-white rounded-xl text-xs font-bold">
                      {currentFeatured.age_range}
                    </span>
                  )}
                  {/* Rating Badge */}
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black flex items-center gap-1">
                    <Star size={13} weight="fill" className="text-amber-400" />
                    <span>{currentFeatured.average_rating || 5.0}</span>
                    <span className="text-[10px] text-amber-200/70">
                      ({currentFeatured.ratings_count || 0})
                    </span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                  <button
                    onClick={() => handlePlayGame(currentFeatured)}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Play size={18} weight="fill" />
                    <span>Hemen Oyna</span>
                  </button>

                  <button
                    onClick={() => setSelectedGameDetail(currentFeatured)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Info size={18} weight="bold" />
                    <span>Detay & Kazanımlar</span>
                  </button>

                  {/* Manual Controls */}
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/15">
                    <button
                      onClick={() =>
                        setActiveSlideIndex(
                          (prev) => (prev - 1 + featuredCount) % featuredCount
                        )
                      }
                      className="p-2 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                      title="Önceki Oyun"
                    >
                      <CaretLeft size={18} weight="bold" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveSlideIndex((prev) => (prev + 1) % featuredCount)
                      }
                      className="p-2 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                      title="Sonraki Oyun"
                    >
                      <CaretRight size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Elastic 3D Perspective Stage */}
              <div className="relative w-72 sm:w-80 md:w-96 aspect-square shrink-0 perspective-[1000px]">
                {featuredGames.map((game, idx) => {
                  const offset = (idx - activeSlideIndex + featuredCount) % featuredCount
                  let isCenter = offset === 0
                  let isRight = offset === 1 || (featuredCount === 2 && offset === 1)
                  let isLeft = offset === featuredCount - 1

                  if (!isCenter && !isRight && !isLeft) return null

                  let transformStyle = 'scale-90 opacity-0 pointer-events-none'
                  let zIndex = 10

                  if (isCenter) {
                    transformStyle = 'scale-100 opacity-100 rotate-0 translate-x-0'
                    zIndex = 30
                  } else if (isRight) {
                    transformStyle = 'scale-85 opacity-60 rotate-y-[-18deg] translate-x-12 translate-z-[-50px] blur-[0.5px]'
                    zIndex = 20
                  } else if (isLeft) {
                    transformStyle = 'scale-85 opacity-60 rotate-y-[18deg] -translate-x-12 translate-z-[-50px] blur-[0.5px]'
                    zIndex = 20
                  }

                  return (
                    <div
                      key={game.id}
                      onClick={() => (isCenter ? setSelectedGameDetail(game) : setActiveSlideIndex(idx))}
                      style={{
                        transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        zIndex,
                      }}
                      className={`absolute inset-0 rounded-[28px] p-2 cursor-pointer ${transformStyle}`}
                    >
                      <div className="w-full h-full rounded-[26px] bg-gradient-to-br from-indigo-600/90 via-purple-700/80 to-slate-900 p-1.5 shadow-2xl border-2 border-indigo-400/40 flex flex-col justify-between overflow-hidden relative group">
                        {/* Square Cover */}
                        <div className="w-full h-full rounded-[20px] bg-slate-950 overflow-hidden relative flex items-center justify-center">
                          {game.thumbnail_image ? (
                            <img
                              src={game.thumbnail_image}
                              alt={game.title}
                              className="w-full h-full object-contain p-2 rounded-[18px] group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="text-center space-y-2 p-6">
                              <span className="text-7xl block drop-shadow-lg transform group-hover:scale-110 transition-transform">
                                {game.category_icon || '🚀'}
                              </span>
                              <span className="text-xs font-black text-indigo-300 block line-clamp-1">
                                {game.title}
                              </span>
                            </div>
                          )}

                          {/* Bottom Info Strip */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3.5 flex items-center justify-between text-xs">
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <Eye size={13} /> {game.play_count} kez
                            </span>
                            <div className="flex items-center gap-1.5">
                              {game.is_3d_simulation && (
                                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  3D
                                </span>
                              )}
                              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                {game.category_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Slider Navigation Dots */}
            {featuredCount > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {featuredGames.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlideIndex
                        ? 'w-7 bg-amber-400 shadow-sm'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 2. CATEGORY PILLS & FILTERS (100% RESPONSIVE 2-TIER DESIGN) ── */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-3 sm:p-4 shadow-xs space-y-3">
          {/* Row 1: Search & Grade Level Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Oyun adı, ders veya konu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-auto">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-indigo-300 transition">
                  <GraduationCap size={16} className="text-indigo-600 shrink-0" />
                  <select
                    value={activeGradeFilter}
                    onChange={(e) => setActiveGradeFilter(e.target.value)}
                    className="bg-transparent text-gray-700 text-xs font-bold outline-none cursor-pointer pr-2"
                  >
                    <option value="all">Tüm Kademeler</option>
                    {gradeOptions
                      .filter((g) => g !== 'all')
                      .map((gr) => (
                        <option key={gr} value={gr}>
                          {gr}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {(activeCategorySlug !== 'all' || activeGradeFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setActiveCategorySlug('all')
                    setActiveGradeFilter('all')
                    setSearchTerm('')
                  }}
                  className="px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition border border-rose-200/60 shrink-0 cursor-pointer"
                  title="Filtreleri Temizle"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Touch-scrollable Category Tabs */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none scroll-smooth">
              <button
                onClick={() => setActiveCategorySlug('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeCategorySlug === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80'
                }`}
              >
                <span>🎮</span>
                <span>Tüm Oyunlar</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategorySlug === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {allGames.length}
                </span>
              </button>
              {categories.map((cat) => {
                const isActive = activeCategorySlug === cat.slug
                const is3D = cat.slug === '3d-simulasyon'
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategorySlug(cat.slug)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? is3D
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-200'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    {is3D && (
                      <span className={`text-[9px] px-1.5 py-0.2 font-black rounded-md ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                      }`}>
                        3D
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── 3. CATEGORIZED HORIZONTAL SLIDERS & LOADING SCREEN ── */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Captivating educational loading screen */}
            <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-900 via-indigo-950 to-slate-950 border border-indigo-900/60 p-10 sm:p-14 text-center text-white shadow-2xl space-y-5">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px]" />

              {/* Central orbital ring */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-amber-400 animate-spin" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-xl">
                  <GameController size={28} className="text-amber-400" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-black tracking-tight text-white">
                  Eğitici Oyunlar Dünyası Hazırlanıyor
                </h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed font-normal">
                  MEB müfredatına uygun interaktif ders oyunları ve 3D simülasyonlar derleniyor...
                </p>
              </div>

              {/* Shimmering progress bar */}
              <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden relative border border-white/10">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-500 rounded-full animate-pulse" />
              </div>

              <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-medium">
                💡 <strong>Biliyor muydunuz?</strong> Oyun tabanlı öğrenme, öğrencilerin derse olan ilgisini ve kalıcı kavrama oranını 3 katına çıkarır.
              </p>
            </div>

            {/* Skeleton placeholders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-3 border border-gray-100 space-y-3 animate-pulse"
                >
                  <div className="aspect-square bg-gray-100 rounded-2xl" />
                  <div className="h-3 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-2 bg-gray-100 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : categorySliders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto">
              🎮
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Aradığınız kriterlere uygun oyun bulunamadı</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Filtrelerinizi temizleyerek veya farklı bir arama yaparak tekrar deneyin.
            </p>
            <button
              onClick={() => {
                setActiveCategorySlug('all')
                setActiveGradeFilter('all')
                setSearchTerm('')
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {categorySliders.map((slider) => {
              const rowId = `slider-${slider.category.id}`
              return (
                <div key={slider.category.id} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{slider.category.icon}</span>
                      <div>
                        <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                          <span>{slider.category.name}</span>
                          {slider.category.slug === '3d-simulasyon' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-200">
                              3D WebGL
                            </span>
                          )}
                        </h2>
                        {slider.category.description && (
                          <p className="text-[11px] text-gray-500">{slider.category.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Scroll Arrows */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const el = document.getElementById(rowId)
                          if (el) el.scrollBy({ left: -320, behavior: 'smooth' })
                        }}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                        title="Geri"
                      >
                        <CaretLeft size={16} weight="bold" />
                      </button>
                      <button
                        onClick={() => {
                          const el = document.getElementById(rowId)
                          if (el) el.scrollBy({ left: 320, behavior: 'smooth' })
                        }}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer"
                        title="İleri"
                      >
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Game Track */}
                  <div
                    id={rowId}
                    className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth"
                  >
                    {slider.games.map((game) => (
                      <div key={game.id} className="w-56 sm:w-64 shrink-0">
                        <GameCard
                          game={game}
                          onSelect={() => setSelectedGameDetail(game)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 4. GAME DETAIL POPUP MODAL (ITEM 2 REQUIREMENT) ── */}
        {typeof window !== 'undefined' && selectedGameDetail && createPortal(
          <div
            className="fixed inset-0 z-[99990] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedGameDetail(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900 my-auto animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Hero Area with Calm Pattern */}
              <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white overflow-hidden">
                <svg
                  className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="detail-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#818cf8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#detail-dots)" />
                </svg>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedGameDetail(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer z-10"
                >
                  <X size={18} weight="bold" />
                </button>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  {/* Uncropped 1:1 Cover */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-900 border border-white/20 p-2 shadow-2xl flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedGameDetail.thumbnail_image ? (
                      <img
                        src={selectedGameDetail.thumbnail_image}
                        alt={selectedGameDetail.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-5xl">{selectedGameDetail.category_icon || '🎮'}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-200 text-[11px] font-bold border border-white/20">
                        {selectedGameDetail.category_icon} {selectedGameDetail.category_name}
                      </span>
                      {selectedGameDetail.is_3d_simulation && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shadow-sm flex items-center gap-1">
                          <Cube size={12} weight="fill" />
                          <span>3D Simülasyon</span>
                        </span>
                      )}
                      {selectedGameDetail.version && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-mono">
                          v{selectedGameDetail.version}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {selectedGameDetail.title}
                    </h2>

                    <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-white/80 pt-1">
                      <div className="flex items-center gap-1 text-amber-400 font-extrabold">
                        <Star size={14} weight="fill" />
                        <span>{selectedGameDetail.average_rating || 5.0}</span>
                        <span className="text-white/50 text-[10px]">
                          ({selectedGameDetail.ratings_count || 0} puan)
                        </span>
                      </div>
                      <span>&bull;</span>
                      <span className="text-indigo-200 font-medium flex items-center gap-1">
                        <Eye size={13} /> {selectedGameDetail.play_count} kez oynandı
                      </span>
                      {selectedGameDetail.age_range && (
                        <>
                          <span>&bull;</span>
                          <span className="bg-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {selectedGameDetail.age_range}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorized Information Content */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* 1. Açıklama */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Oyun Hakkında
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-normal">
                    {selectedGameDetail.description ||
                      'MEB müfredatına uygun interaktif kazanım odaklı eğitici oyun.'}
                  </p>
                </div>

                {/* 2. Kazanımlar & Pedagojik Çıktılar */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Target size={16} className="text-indigo-600" />
                    <span>Kazanımlar & Pedagojik Hedefler</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {renderOutcomes(selectedGameDetail)}
                  </div>
                </div>

                {/* 3. Hedef Kitle & Sınıf Düzeyi */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-purple-600" />
                    <span>Hedef Kitle & Sınıf Seviyeleri</span>
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedGameDetail.grade_levels && selectedGameDetail.grade_levels.length > 0 ? (
                      selectedGameDetail.grade_levels.map((lvl) => (
                        <span
                          key={lvl}
                          className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-xl text-xs border border-purple-100"
                        >
                          {lvl}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-xl text-xs border border-purple-100">
                        Tüm Kademeler
                      </span>
                    )}
                    {selectedGameDetail.age_range && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-100">
                        Hedef Yaş: {selectedGameDetail.age_range}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Nasıl Oynanır & Kontroller */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <GameController size={18} className="text-amber-500" />
                      <span>Nasıl Oynanır & Kontroller</span>
                    </h4>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      HTML5 Etkileşimli
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Control Methods */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-2xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>🎮</span>
                        <span>Desteklenen Kontroller</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100/60">
                          ⌨️ Klavye Tuşları
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100/60">
                          🖱️ Fare (Tıkla & Sürükle)
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100/60">
                          👆 Dokunmatik Ekran
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Klavyeyle doğrudan yazarak veya ekrandaki butonlara dokunarak oynayabilirsiniz.
                      </p>
                    </div>

                    {/* Platform Support */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-2xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>📱</span>
                        <span>Cihaz & Platform Uyumluluğu</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100/60">
                          🖥️ Akıllı Tahta & PC
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100/60">
                          📱 Tablet & Mobil
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-100/60">
                          🌐 Kurulumsuz Web
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Kurulum gerektirmeden tüm modern tarayıcılarda tam ekran modunda kesintisiz çalışır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer with Prominent Play Button */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedGameDetail(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                >
                  Kapat
                </button>

                <button
                  onClick={() => {
                    const gameToPlay = selectedGameDetail
                    setSelectedGameDetail(null)
                    handlePlayGame(gameToPlay)
                  }}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play size={18} weight="fill" />
                  <span>Hemen Oyna</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── 5. GAME PLAYER MODAL (PORTAL OUT OF NAVBAR CONTEXT) ── */}
        {typeof window !== 'undefined' && playingGame && createPortal(
          <div
            className={`fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex flex-col ${
              isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
            }`}
          >
            {/* Player Header Bar - Fixed Top with No Overlap */}
            <div className="bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between shrink-0 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl shrink-0">
                  {playingGame.category_icon || '🎮'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                      {playingGame.title}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                      {playingGame.category_name}
                    </span>
                    {playingGame.is_3d_simulation && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 hidden sm:inline-block">
                        3D
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    {/* Live Community Rating */}
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={13} weight="fill" />
                      <span>{currentRatingData?.average_rating || playingGame.average_rating || 5.0}</span>
                      <span className="text-slate-500 text-[10px]">
                        ({currentRatingData?.ratings_count || playingGame.ratings_count || 0})
                      </span>
                    </div>
                    {playingGame.age_range && <span>&bull; {playingGame.age_range}</span>}
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2">
                {/* Rate / Feedback Button */}
                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                  title="Puan Ver & Yorum Yap"
                >
                  <Star size={14} weight="fill" className="text-amber-400" />
                  <span className="hidden md:inline">Puan Ver / Yorum Yap</span>
                </button>

                <button
                  onClick={handleRestartGame}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                  title="Yeniden Başlat"
                >
                  <ArrowClockwise size={16} />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                  title="Tam Ekran"
                >
                  {isFullscreen ? <ArrowsIn size={16} /> : <ArrowsOut size={16} />}
                </button>

                <button
                  onClick={handleClosePlayer}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-md"
                  title="Oyundan Çık"
                >
                  <X size={15} />
                  <span>Çıkış</span>
                </button>
              </div>
            </div>

            {/* Iframe Stage - 100% Filled with Professional Glass Loader */}
            <div className="flex-1 bg-black rounded-b-2xl overflow-hidden relative border-x border-b border-slate-800 shadow-2xl">
              {isLoadingGame ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6 text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-amber-400 border-r-indigo-400 animate-spin" />
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-2xl backdrop-blur-md">
                      <span>{playingGame.category_icon || '🚀'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {playingGame.title} Başlatılıyor...
                    </h4>
                    <p className="text-xs text-slate-400">
                      HTML5 simülasyon sahnesi ve pedagojik kaynaklar yükleniyor.
                    </p>
                  </div>

                  <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full animate-pulse" />
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400">
                    <Sparkle size={12} className="text-amber-400" />
                    <span>
                      {playingGame.is_3d_simulation
                        ? '3D WebGL Motoru Aktif'
                        : 'HTML5 Etkileşimli Modül'}
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={playerIframeRef}
                  srcDoc={gameHtmlContent}
                  sandbox="allow-scripts allow-forms allow-pointer-lock allow-downloads"
                  className="w-full h-full border-0 block"
                  title={playingGame.title}
                />
              )}
            </div>

            {/* In-Player Feedback Modal */}
            {isFeedbackModalOpen && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Star size={20} weight="fill" className="text-amber-400" />
                      <h4 className="text-base font-black">Oyunu Değerlendir</h4>
                    </div>
                    <button
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Star Rating Picker */}
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs text-slate-400">Bu oyuna kaç yıldız verirsiniz?</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || userRating) >= star
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setUserRating(star)}
                            className="p-1 text-3xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                          >
                            <Star
                              size={32}
                              weight={active ? 'fill' : 'regular'}
                              className={active ? 'text-amber-400' : 'text-slate-600'}
                            />
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs font-black text-amber-300">
                      {userRating === 5 && '🌟 Harika! Çok Eğlenceli'}
                      {userRating === 4 && '👍 Çok İyi'}
                      {userRating === 3 && '😊 Fena Değil'}
                      {userRating === 2 && '😐 Geliştirilebilir'}
                      {userRating === 1 && '👎 Beğenmedim'}
                    </p>
                  </div>

                  {/* Comment Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Geri Bildiriminiz veya Yorumunuz:
                    </label>
                    <textarea
                      rows={3}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Oyunla ilgili düşünceleriniz veya önerileriniz..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition resize-none"
                    />
                  </div>

                  {/* Privacy Alert */}
                  <div className="flex items-start gap-2 bg-indigo-950/60 border border-indigo-800/40 rounded-xl p-3 text-[11px] text-indigo-300">
                    <Lock size={16} className="shrink-0 text-indigo-400 mt-0.5" />
                    <p>
                      <strong>Gizlilik Güvencesi:</strong> Yıldız puanınız genel ortalamaya yansır.
                      Yorumunuz ve profil bilgileriniz ise <u>yalnızca Süper Admin</u> tarafından
                      incelenir; diğer öğrencilere veya öğretmenlere gösterilmez.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingReview}
                      onClick={handleSubmitReview}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <PaperPlaneTilt size={14} weight="bold" />
                      <span>{isSubmittingReview ? 'Gönderiliyor...' : 'Geri Bildirimi İlet'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
      </div>
    </GeneralWrapperStyled>
  )
}

// ── Single Game Card Component ──
function GameCard({ game, onSelect }: { game: GameItem; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-indigo-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer h-full"
    >
      <div>
        {/* 1:1 Cover Aspect Ratio - Uncropped Square */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center overflow-hidden border-b border-gray-100 p-2">
          {game.thumbnail_image ? (
            <img
              src={game.thumbnail_image}
              alt={game.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-center space-y-1 p-4">
              <span className="text-6xl block group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                {game.category_icon || '🎮'}
              </span>
            </div>
          )}



          {/* Age Tag */}
          {game.age_range && (
            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {game.age_range}
            </div>
          )}

          {/* 3D Simulation Badge */}
          {game.is_3d_simulation && (
            <div className="absolute bottom-2.5 left-2.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Cube size={11} weight="fill" />
              <span>3D</span>
            </div>
          )}

          {/* Rating Badge on Card */}
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-400/30">
            <Star size={11} weight="fill" className="text-amber-400" />
            <span>{game.average_rating || 5.0}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 truncate flex items-center justify-between">
            <span>{game.category_name}</span>
            {game.version && (
              <span className="text-gray-400 font-mono text-[9px]">v{game.version}</span>
            )}
          </div>
          <h3 className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {game.description || 'Eğitici HTML5 oyunu.'}
          </p>
        </div>
      </div>

      <div className="p-3.5 pt-0 flex items-center justify-between mt-2">
        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
          <Eye size={12} /> {game.play_count} kez
        </span>
        <button
          type="button"
          className="px-3 py-1 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1"
        >
          <span>İncele</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}

// Helper: Render Outcomes in clean bullets
function renderOutcomes(game: GameItem) {
  const custom = game.learning_objectives
  if (custom && custom.trim().length > 0) {
    const lines = custom
      .split(/[\n;•\-]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)
    if (lines.length > 0) {
      return lines.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2.5"
        >
          <CheckCircle size={15} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
        </div>
      ))
    }
  }

  // Default pedagogical outcomes
  const defaults = [
    'Müfredat kazanımlarıyla doğrudan uyumlu interaktif pekiştirme',
    'Görsel hafıza ve analitik problem çözme becerisi geliştirme',
    'Kavramsal düşünme ve anlık stratejik karar verme refleksi',
    'Eğlenerek öğrenme ve öğrenmede kalıcılığı artırma',
  ]
  return defaults.map((item, idx) => (
    <div
      key={idx}
      className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2.5"
    >
      <CheckCircle size={15} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
      <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
    </div>
  ))
}
