'use client'
import React, { useState, useMemo } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { asArray } from '@services/utils/ts/requests'
import {
  GraduationCap,
  KeyRound,
  School,
  Presentation,
  ArrowRight,
  Star,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  MessageSquare,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getMyClasses, getUserGroups } from '@services/usergroups/usergroups'
import { getClassroomBoards } from '@services/boards/boards'
import { getUriWithOrg } from '@services/config/config'
import JoinClassModal from '@components/Dashboard/Classrooms/JoinClassModal'
import { useFavoriteBoards, FavoriteBoard } from '@/hooks/useFavoriteBoards'
import { getBoardThumbnailMediaDirectory } from '@services/media/media'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'
import toast from 'react-hot-toast'
import Link from 'next/link'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import {
  getStudentAssignments,
  SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import DoAssignmentModal from '@components/Dashboard/Assignments/DoAssignmentModal'
import { PenTool } from 'lucide-react'

export default function Trail(params: any) {
  const { t, i18n } = useTranslation()
  const orgslug = params.orgslug
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const org = useOrg() as any
  const orgID = org?.id
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false)
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const queryClient = useQueryClient()

  const { isAdmin } = useAdminStatus()

  // Favorite Boards hook
  const { favorites, toggleFavorite, isLoaded: favsLoaded } = useFavoriteBoards(orgID)

  // Filters for Favorite Boards
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'az'>('newest')

  // Fetch student's enrolled class (usually 1 class)
  const { data: rawMyClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['my-classes', orgID],
    queryFn: () => getMyClasses(orgID, access_token),
    enabled: !!(orgID && access_token && !isAdmin),
  })
  const myClasses = asArray<any>(rawMyClasses)

  // Fetch teacher's classes
  const { data: rawTeacherClasses, isLoading: teacherClassesLoading } = useQuery({
    queryKey: ['teacher-classes', orgID],
    queryFn: () => getUserGroups(orgID, access_token),
    enabled: !!(orgID && access_token && isAdmin),
  })
  const teacherClasses = asArray<any>(rawTeacherClasses)

  const activeClass = myClasses.length > 0 ? myClasses[0] : null

  // Fetch boards specifically belonging to the active class
  const { data: rawClassBoards = [] } = useQuery({
    queryKey: ['classroom-boards', activeClass?.id],
    queryFn: () => getClassroomBoards(activeClass?.id, access_token),
    enabled: !!(activeClass?.id && access_token),
  })
  const classBoards = asArray<any>(rawClassBoards)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success('Sınıf kodu kopyalandı!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Categories available in favorites
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    favorites.forEach((f) => {
      if (f.category) set.add(f.category)
    })
    return ['all', ...Array.from(set)]
  }, [favorites])

  // Filtered & sorted favorite boards
  const processedFavorites = useMemo(() => {
    let list = [...favorites]
    if (selectedCategory !== 'all') {
      list = list.filter((f) => f.category === selectedCategory)
    }
    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime())
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.favorited_at).getTime() - new Date(b.favorited_at).getTime())
    } else if (sortOrder === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [favorites, selectedCategory, sortOrder])

  // Real Student School Assignments
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedAssignmentForDo, setSelectedAssignmentForDo] = useState<SchoolAssignmentItem | null>(null)

  const { data: realStudentAssignments = [], refetch: refetchStudentAssignments } = useQuery({
    queryKey: ['trail-student-assignments', orgID],
    queryFn: () => getStudentAssignments(orgID, access_token),
    enabled: !!(orgID && access_token),
  })

  const assignmentsList = useMemo(() => {
    return realStudentAssignments.filter((a) => {
      const isGraded = a.submission?.status === 'GRADED'
      const isPending = (a.submission?.status || 'PENDING') === 'PENDING'
      if (assignmentFilter === 'pending') return isPending
      if (assignmentFilter === 'completed') return isGraded
      return true
    })
  }, [realStudentAssignments, assignmentFilter])

  return (
    <GeneralWrapperStyled>
      <div className="flex flex-col space-y-8 pb-16">
        {/* Header: Academic Workspace */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                    Öğrenci Akademik Portalı
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {org?.name}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Akademik Durum & Çalışma Portalı
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-xl leading-relaxed">
                  Kayıtlı sınıfınız, favorilere eklediğiniz akıllı tahta panolarınız ve ders ödevleriniz.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsJoinClassOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <KeyRound size={15} className="text-yellow-400" />
                  <span>Sınıf Koduyla Katıl</span>
                </button>
              )}
              <Link
                href={getUriWithOrg(orgslug, '/boards')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Presentation size={15} className="text-indigo-600" />
                <span>Tüm Panolar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1 (PRIMARY): Ödevlerim & Ders Görevlerim - Göz Alıcı Üst Tasarım */}
        <div className="bg-white rounded-2xl border-2 border-purple-200/80 shadow-md overflow-hidden relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500" />
          
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 tracking-tight">
                    <span>Ödevlerim & Ders Görevlerim</span>
                    <span className="bg-purple-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      {assignmentsList.length} Ödev
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Öğretmenleriniz tarafından verilen ders görevleri, akıllı tahta ödevleri ve teslim durumları.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => setAssignmentFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      assignmentFilter === 'all' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      assignmentFilter === 'pending' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Bekleyenler
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentFilter('completed')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      assignmentFilter === 'completed' ? 'bg-white text-purple-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Tamamlananlar
                  </button>
                </div>

                <Link
                  href={getUriWithOrg(orgslug, '/dash/assignments')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-black text-purple-800 transition-colors"
                >
                  <span>Tümünü Gör</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Assignments Grid */}
            {assignmentsList.length === 0 ? (
              <div className="text-center py-10 bg-purple-50/40 rounded-2xl border border-dashed border-purple-200">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-bold text-gray-800">Harika! Bekleyen hiçbir ödeviniz yok.</p>
                <p className="text-xs text-gray-500 mt-0.5">Yeni bir ders görevi verildiğinde burada anında görünecektir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                {assignmentsList.map((assignment) => {
                  const sub = assignment.submission
                  const isGraded = sub?.status === 'GRADED'
                  const isSubmitted = sub?.status === 'SUBMITTED'

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-2xl border border-purple-100/90 shadow-xs p-4 flex flex-col justify-between hover:shadow-lg hover:border-purple-300 transition-all duration-200 group relative"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md">
                              {assignment.subject}
                            </span>
                            {assignment.tool_type === 'WHITEBOARD' && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <PenTool size={11} /> Tahta
                              </span>
                            )}
                          </div>

                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={11} /> Not: {sub?.score} Puan
                            </span>
                          ) : isSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              <Clock size={11} /> İnceleniyor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 animate-pulse">
                              <Clock size={11} /> Bekliyor
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-purple-700 transition-colors leading-snug">
                          {assignment.title}
                        </h3>

                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-purple-500" />
                          <span>Son Teslim: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400">
                          {assignment.grade_level}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAssignmentForDo(assignment)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isGraded
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : isSubmitted
                              ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs hover:shadow-md'
                          }`}
                        >
                          <span>{isGraded ? 'İncele' : isSubmitted ? 'Teslimi Gör' : 'Ödevi Çöz'}</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 2 (SECONDARY): Bağlı Sınıf & Şubelerim - Sade, İkincil Tasarım */}
        <div className="bg-gray-50/70 rounded-2xl border border-gray-200/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <School size={16} className="text-gray-500" />
              <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                {isAdmin ? 'Bağlı Sınıflarım & Şubelerim' : 'Bağlı Sınıfım & Şubem'}
              </h2>
            </div>
            {!isAdmin && activeClass && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Kayıtlı & Aktif
              </span>
            )}
          </div>

          {classesLoading || (isAdmin && teacherClassesLoading) ? (
            <div className="h-12 bg-white rounded-xl animate-pulse" />
          ) : isAdmin ? (
            teacherClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {teacherClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200/70 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {cls.name?.slice(0, 4) || '10-A'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-gray-800 truncate">{cls.name}</h3>
                        {cls.invitation_code && (
                          <span className="text-[9px] font-mono text-gray-400">
                            Kod: {cls.invitation_code}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={getUriWithOrg(orgslug, '/boards')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
                    >
                      Pano →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-gray-500">
                Henüz bağlı sınıf bulunmuyor.
              </div>
            )
          ) : activeClass ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                  {activeClass.name?.slice(0, 4) || '10-A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">{activeClass.name}</h3>
                    {activeClass.invitation_code && (
                      <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        Kod: {activeClass.invitation_code}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {activeClass.description || 'Ders materyalleri ve günlük akıllı tahta panoları.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={getUriWithOrg(orgslug, '/boards')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                >
                  Sınıf Panosu
                </Link>
                <button
                  type="button"
                  onClick={() => setIsClassDetailOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Detay
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/70">
              <p className="text-xs text-gray-500">Henüz bir sınıfa kayıtlı değilsiniz.</p>
              <button
                type="button"
                onClick={() => setIsJoinClassOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
              >
                Sınıf Kodu Gir
              </button>
            </div>
          )}
        </div>

        {/* Section 1: Favori Akıllı Tahta & Ders Panolarım */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                <Star size={18} className="fill-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>Favori Akıllı Tahta & Ders Panolarım</span>
                  {favorites.length > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-500">
                  Yıldızlayıp favorilere eklediğiniz ders panoları kategorisel ve tarihsel olarak listelenir.
                </p>
              </div>
            </div>

            {/* Tarihsel Sıralama Seçimi */}
            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Sırala:</span>
                <select
                  value={sortOrder}
                  onChange={(e: any) => setSortOrder(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="newest">En Yeni Eklenenler</option>
                  <option value="oldest">Eskiye Göre</option>
                  <option value="az">A-Z İsim</option>
                </select>
              </div>
            )}
          </div>

          {/* Kategorisel Filtre Butonları */}
          {favorites.length > 0 && availableCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'Tüm Kategoriler' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Favori Panolar Listesi */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 shadow-xs">
                <Star size={24} className="fill-amber-400 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Henüz Favori Panonuz Bulunmuyor
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-md">
                Akıllı Tahta & Panolar sayfasında ders panolarının üzerindeki yıldız (<Star size={12} className="inline fill-amber-400 text-amber-400" />) simgesine tıklayarak favorilerinize ekleyebilirsiniz.
              </p>
              <Link
                href={getUriWithOrg(orgslug, '/boards')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Presentation size={14} />
                <span>Ders Panolarını Keşfet & Favorile</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {processedFavorites.map((fav: any, idx: number) => {
                const boardUuid = fav.board_uuid || fav.uuid || ''
                const boardId = boardUuid ? boardUuid.replace(/^board_/, '') : (fav.id ? String(fav.id) : '')
                const boardHref = boardId ? `/board/${boardId}` : getUriWithOrg(orgslug, '/boards')
                const thumbnailImage = fav.thumbnail_image && boardUuid
                  ? getBoardThumbnailMediaDirectory(org?.org_uuid, boardUuid, fav.thumbnail_image)
                  : '/empty_thumbnail.png'
                let formattedDate = 'Yeni'
                try {
                  if (fav.favorited_at) {
                    formattedDate = new Date(fav.favorited_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  }
                } catch (_e) {}

                return (
                  <div
                    key={boardUuid || `fav-${idx}`}
                    className="group relative flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={boardHref}
                      className="block relative aspect-video overflow-hidden bg-gray-50"
                    >
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${thumbnailImage})` }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                      {/* Category Badge */}
                      <span className="absolute top-2 start-2 text-[10px] font-bold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md">
                        {fav.category || 'Genel'}
                      </span>

                      {/* Favorite button (remove toggle) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(fav)
                          toast('Pano favorilerden çıkarıldı', { icon: '🗑️' })
                        }}
                        title="Favorilerden Çıkar"
                        className="absolute top-2 end-2 p-1.5 rounded-full bg-amber-400 text-white shadow-xs hover:bg-amber-500 transition-colors cursor-pointer"
                      >
                        <Star size={13} className="fill-white text-white" />
                      </button>
                    </Link>

                    {/* Content */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
                      <div>
                        <Link
                          href={boardHref}
                          className="font-bold text-gray-900 text-sm hover:text-black line-clamp-1 transition-colors"
                        >
                          {fav.name || 'Ders Panosu'}
                        </Link>
                        {fav.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {fav.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formattedDate}</span>
                        </span>
                        <Link
                          href={boardHref}
                          className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider"
                        >
                          Panoyu Aç →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Join Class Modal */}
        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-classes', orgID] })
          }}
        />

        {/* Student Class Detail Modal */}
        {activeClass && (
          <Dialog open={isClassDetailOpen} onOpenChange={setIsClassDetailOpen}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-extrabold text-lg border border-white/20">
                      {activeClass.name?.slice(0, 4) || '10-A'}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-white tracking-tight">
                        {activeClass.name}
                      </DialogTitle>
                      <DialogDescription className="text-white/80 text-xs mt-0.5">
                        {org?.name || 'Oxonom Edu'} &bull; Kayıtlı Sınıfım
                      </DialogDescription>
                    </div>
                  </div>
                  {activeClass.invitation_code && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeClass.invitation_code)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-mono font-bold transition-all cursor-pointer border border-white/30"
                      title="Sınıf kodunu kopyala"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{activeClass.invitation_code}</span>
                    </button>
                  )}
                </div>
                {activeClass.description && (
                  <p className="text-xs text-white/90 mt-4 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 leading-relaxed">
                    {activeClass.description}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Sınıf Akıllı Tahta & Panoları */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Presentation size={16} className="text-emerald-600" />
                      <span>Sınıf Akıllı Tahtaları & Ders Panoları</span>
                    </h4>
                    <span className="text-xs text-gray-400 font-medium">
                      {classBoards.length} Pano
                    </span>
                  </div>

                  {classBoards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {classBoards.map((b: any) => (
                        <Link
                          key={b.id || b.board_uuid}
                          href={getUriWithOrg(orgslug, `/board/${b.board_uuid}`)}
                          target="_blank"
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/40 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <Presentation size={15} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                                {b.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {b.category || 'Akıllı Tahta Dersi'}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 opacity-80 group-hover:opacity-100 transition-opacity">
                            <span>Tahtayı Aç</span>
                            <ExternalLink size={12} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Presentation size={24} className="mx-auto text-gray-300 mb-1.5" />
                      <p className="text-xs text-gray-500 font-medium">Bu sınıfa ait henüz tahta panosu bulunmuyor.</p>
                      <Link
                        href={getUriWithOrg(orgslug, '/boards')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        <span>Genel Panolara Göz At</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Hızlı Erişim: Veli ve Sınıf Forumu */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link
                    href={getUriWithOrg(orgslug, '/communities')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
                  >
                    <MessageSquare size={14} />
                    <span>Sınıf Forumuna Git</span>
                  </Link>
                  <Link
                    href={getUriWithOrg(orgslug, '/boards')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Presentation size={14} />
                    <span>Tüm Panoları Gör</span>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Do Assignment Modal */}
        <DoAssignmentModal
          isOpen={!!selectedAssignmentForDo}
          onClose={() => setSelectedAssignmentForDo(null)}
          onSuccess={() => refetchStudentAssignments()}
          assignment={selectedAssignmentForDo}
          accessToken={access_token}
        />
      </div>
    </GeneralWrapperStyled>
  )
}
