'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { useCommunity, useCommunityDispatch } from '@components/Contexts/CommunityContext'
import {
  getUserGroups,
  getUserGroupsByResource,
  linkResourcesToUserGroup,
  unLinkResourcesToUserGroup,
} from '@services/usergroups/usergroups'
import { updateCommunity } from '@services/communities/communities'
import { revalidateTags, asArray } from '@services/utils/ts/requests'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { searchMatchesAny } from '@/lib/search/normalize'
import {
  Loader2,
  GraduationCap,
  Unlink,
  Search,
  Plus,
  Check,
  Globe,
  Lock,
  Users,
  KeyRound,
  ShieldAlert,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'

interface UserGroup {
  id: number
  usergroup_uuid: string
  name: string
  description?: string
  join_code?: string
  grade_level?: string
  users_count?: number
}

const CommunityEditClass: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const session = useLHSession() as any
  const org = useOrg() as any
  const communityState = useCommunity()
  const dispatch = useCommunityDispatch()
  const community = communityState?.community
  const accessToken = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  // Fetch all classes for this org
  const { data: rawAllClasses, isLoading: isLoadingAll } = useQuery({
    queryKey: queryKeys.usergroups.list(org?.id),
    queryFn: () => getUserGroups(org.id, accessToken),
    select: (res: any) => asArray<UserGroup>(res),
    enabled: !!(org?.id && accessToken),
    staleTime: 30_000,
  })

  // Fetch classes currently linked to this community
  const {
    data: rawLinkedClasses,
    isLoading: isLoadingLinked,
    refetch: refetchLinked,
  } = useQuery({
    queryKey: ['community_usergroups', community?.community_uuid],
    queryFn: () => getUserGroupsByResource(community?.community_uuid || '', accessToken),
    select: (res: any) => asArray<UserGroup>(res),
    enabled: !!(community?.community_uuid && accessToken),
    staleTime: 10_000,
  })

  const allClasses: UserGroup[] = rawAllClasses || []
  const linkedClasses: UserGroup[] = rawLinkedClasses || []
  const linkedClassIds = useMemo(() => new Set(linkedClasses.map((c) => c.id)), [linkedClasses])

  // Extract grade levels for filtering
  const gradeLevels = useMemo(() => {
    const grades = new Set<string>()
    allClasses.forEach((c) => {
      if (c.grade_level) grades.add(c.grade_level)
    })
    return Array.from(grades).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [allClasses])

  if (!community) return null

  // Classes not yet linked
  const availableClasses = allClasses.filter((c) => !linkedClassIds.has(c.id))

  const filteredAvailableClasses = availableClasses.filter((c) => {
    const matchesSearch = searchMatchesAny([c.name, c.description, c.grade_level, c.join_code], searchQuery)
    const matchesGrade = selectedGrade === 'all' || c.grade_level === selectedGrade
    return matchesSearch && matchesGrade
  })

  const handleLinkClass = async (classItem: UserGroup) => {
    setActionLoadingId(classItem.id)
    const toastId = toast.loading(t('dashboard.courses.communities.class.toasts.linking', { defaultValue: 'Sınıf bağlanıyor...' }))

    try {
      await linkResourcesToUserGroup(classItem.id, community.community_uuid, org.id, accessToken)

      // When first class is linked, automatically ensure public = false (class-specific)
      if (community.public) {
        await updateCommunity(
          community.community_uuid,
          { public: false },
          accessToken
        )
        if (dispatch) {
          dispatch({ type: 'setCommunity', payload: { ...community, public: false } })
        }
      }

      await Promise.all([
        refetchLinked(),
        revalidateTags(['communities'], org.slug),
        queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(community.community_uuid) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.community.list(org.id) }),
      ])

      toast.success(t('dashboard.courses.communities.class.toasts.link_success', { defaultValue: 'Sınıf başarıyla bağlandı' }), { id: toastId })
      router.refresh()
    } catch (error) {
      console.error('Failed to link class:', error)
      toast.error(t('dashboard.courses.communities.class.toasts.link_error', { defaultValue: 'Sınıf bağlanamadı' }), { id: toastId })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleUnlinkClass = async (classItem: UserGroup) => {
    setActionLoadingId(classItem.id)
    const toastId = toast.loading(t('dashboard.courses.communities.class.toasts.unlinking', { defaultValue: 'Sınıf bağlantısı kaldırılıyor...' }))

    try {
      await unLinkResourcesToUserGroup(classItem.id, community.community_uuid, org.id, accessToken)

      // If last class was unlinked, switch back to public = true
      if (linkedClasses.length <= 1) {
        await updateCommunity(
          community.community_uuid,
          { public: true },
          accessToken
        )
        if (dispatch) {
          dispatch({ type: 'setCommunity', payload: { ...community, public: true } })
        }
      }

      await Promise.all([
        refetchLinked(),
        revalidateTags(['communities'], org.slug),
        queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(community.community_uuid) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.community.list(org.id) }),
      ])

      toast.success(t('dashboard.courses.communities.class.toasts.unlink_success', { defaultValue: 'Sınıf bağlantısı kaldırıldı' }), { id: toastId })
      router.refresh()
    } catch (error) {
      console.error('Failed to unlink class:', error)
      toast.error(t('dashboard.courses.communities.class.toasts.unlink_error', { defaultValue: 'Sınıf bağlantısı kaldırılamadı' }), { id: toastId })
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="sm:mx-10 mx-0 bg-white rounded-xl nice-shadow">
      <div className="flex flex-col gap-0">
        {/* Header */}
        <div className="flex flex-col bg-gray-50 -space-y-1 px-5 py-3 mx-3 my-3 rounded-md">
          <h1 className="font-bold text-xl text-gray-800">
            {t('dashboard.courses.communities.class.title', { defaultValue: 'Bağlı Sınıflar' })}
          </h1>
          <h2 className="text-gray-500 text-md">
            {t('dashboard.courses.communities.class.subtitle', {
              defaultValue: 'Forum erişimini belirli sınıflara sınırlandırın veya birden fazla sınıf bağlayın',
            })}
          </h2>
        </div>

        <div className="mx-5 my-5 space-y-6">
          {/* Status Banner */}
          {community.public && linkedClasses.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Globe size={18} className="text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-emerald-950 text-sm">
                  {t('dashboard.courses.communities.scope.all_school_title', { defaultValue: 'Okul Geneli (Tüm Okul)' })}
                </p>
                <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
                  {t('dashboard.courses.communities.class.no_classes_linked', {
                    defaultValue: 'Bu forum şu anda okul geneline açık. Tüm sınıflardaki öğrenciler ve öğretmenler görebilir. Sadece belirli sınıflara özel yapmak için aşağıdaki listeden sınıf bağlayabilirsiniz.',
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={18} className="text-indigo-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-indigo-950 text-sm">
                    {t('dashboard.courses.communities.scope.class_specific_title', { defaultValue: 'Sınıf Bazlı (Belirli Sınıflar)' })}
                  </p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-800">
                    {linkedClasses.length} {t('dashboard.courses.communities.class.title', { defaultValue: 'Sınıf' })}
                  </span>
                </div>
                <p className="text-xs text-indigo-800/80 mt-0.5 leading-relaxed">
                  {t('dashboard.courses.communities.scope.class_specific_desc', {
                    defaultValue: 'Yalnızca bağlı sınıflardaki kayıtlı öğrenciler ve öğretmenler bu foruma erişebilir.',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Currently Linked Classes */}
          {isLoadingLinked ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : linkedClasses.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap size={16} className="text-black" />
                  {t('dashboard.courses.communities.class.currently_linked', { defaultValue: 'Bağlı Sınıflar' })}
                  <span className="text-xs font-normal text-gray-500">({linkedClasses.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {linkedClasses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-gray-50 border border-gray-200/90 rounded-xl flex items-center justify-between gap-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">
                        {item.grade_level ? item.grade_level.replace(/\D/g, '') || 'S' : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                          {item.grade_level && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                              {item.grade_level}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {item.join_code && (
                            <span className="font-mono text-black font-medium flex items-center gap-1">
                              <KeyRound size={11} className="text-gray-400" />
                              {item.join_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUnlinkClass(item)}
                      disabled={actionLoadingId === item.id}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs shrink-0"
                    >
                      {actionLoadingId === item.id ? (
                        <Loader2 size={13} className="animate-spin me-1.5" />
                      ) : (
                        <Unlink size={13} className="me-1.5" />
                      )}
                      {t('dashboard.courses.communities.class.unlink', { defaultValue: 'Bağlantıyı Kaldır' })}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Plus size={16} className="text-black" />
                  {t('dashboard.courses.communities.class.all_classes', { defaultValue: 'Okuldaki Tüm Sınıflar' })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('dashboard.courses.communities.scope.select_classes_label', {
                    defaultValue: 'Bu forumu görüntüleyebilecek sınıfları bağlayın:',
                  })}
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashboard.courses.communities.class.search_placeholder', { defaultValue: 'Sınıf veya şube ara...' })}
                  className="ps-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* Grade level filter pills */}
            {gradeLevels.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedGrade('all')}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                    selectedGrade === 'all'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t('common.all', { defaultValue: 'Tümü' })}
                </button>
                {gradeLevels.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                      selectedGrade === grade
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}

            {/* Available Classes Grid */}
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : allClasses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <GraduationCap size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">
                    {t('dashboard.courses.communities.class.no_classes', { defaultValue: 'Henüz kayıtlı sınıf bulunmuyor' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('dashboard.courses.communities.scope.no_classes_warning', {
                      defaultValue: 'Önce Sınıflar panelinden sınıf oluşturun.',
                    })}
                  </p>
                </div>
              ) : filteredAvailableClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Check size={28} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-medium text-gray-700">
                    {availableClasses.length === 0
                      ? 'Tüm sınıflar bu foruma bağlanmış durumda.'
                      : 'Arama kriterine uygun sınıf bulunamadı.'}
                  </p>
                </div>
              ) : (
                filteredAvailableClasses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        {item.grade_level ? item.grade_level.replace(/\D/g, '') || 'S' : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                          {item.grade_level && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {item.grade_level}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleLinkClass(item)}
                      disabled={actionLoadingId === item.id}
                      size="sm"
                      className="bg-black text-white hover:bg-black/90 text-xs shrink-0 h-8"
                    >
                      {actionLoadingId === item.id ? (
                        <Loader2 size={13} className="animate-spin me-1.5" />
                      ) : (
                        <Plus size={13} className="me-1.5" />
                      )}
                      {t('dashboard.courses.communities.class.link_button', { defaultValue: 'Sınıfı Bağla' })}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityEditClass
