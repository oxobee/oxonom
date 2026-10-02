'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { useCommunity, useCommunityDispatch } from '@components/Contexts/CommunityContext'
import { updateCommunity } from '@services/communities/communities'
import {
  getUserGroups,
  getUserGroupsByResource,
  linkResourcesToUserGroup,
  unLinkResourcesToUserGroup,
} from '@services/usergroups/usergroups'
import { revalidateTags, asArray } from '@services/utils/ts/requests'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { searchMatchesAny } from '@/lib/search/normalize'
import {
  Loader2,
  Globe,
  Lock,
  GraduationCap,
  Search,
  Check,
  KeyRound,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Label } from '@components/ui/label'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
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

const CommunityEditGeneral: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const session = useLHSession() as any
  const org = useOrg() as any
  const communityState = useCommunity()
  const dispatch = useCommunityDispatch()
  const community = communityState?.community
  const accessToken = session?.data?.tokens?.access_token

  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [hasInitializedClasses, setHasInitializedClasses] = useState(false)
  const [classSearch, setClassSearch] = useState('')
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

  // Initialize selectedClassIds once linked classes are loaded
  useEffect(() => {
    if (!hasInitializedClasses && rawLinkedClasses) {
      setSelectedClassIds(rawLinkedClasses.map((c: UserGroup) => c.id))
      setHasInitializedClasses(true)
    }
  }, [rawLinkedClasses, hasInitializedClasses])

  // Extract unique grade levels for quick filter
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

  const filteredClasses = useMemo(() => {
    return allClasses.filter((c) => {
      const matchesSearch = searchMatchesAny([c.name, c.description, c.grade_level, c.join_code], classSearch)
      const matchesGrade = selectedGrade === 'all' || c.grade_level === selectedGrade
      return matchesSearch && matchesGrade
    })
  }, [allClasses, classSearch, selectedGrade])

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('dashboard.courses.communities.general.form.name_required'))
      .min(3, t('dashboard.courses.communities.general.form.name_min_length'))
      .max(100, t('dashboard.courses.communities.general.form.name_max_length')),
    description: Yup.string().max(500, t('dashboard.courses.communities.general.form.description_max_length')),
    public: Yup.boolean(),
  })

  if (!community) return null

  const initialValues = {
    name: community.name,
    description: community.description || '',
    public: community.public,
  }

  const toggleClassSelection = (classId: number) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    )
  }

  const selectAllFiltered = () => {
    const allFilteredIds = filteredClasses.map((c) => c.id)
    setSelectedClassIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])))
  }

  const deselectAllFiltered = () => {
    const allFilteredIds = new Set(filteredClasses.map((c) => c.id))
    setSelectedClassIds((prev) => prev.filter((id) => !allFilteredIds.has(id)))
  }

  const handleSubmit = async (values: typeof initialValues) => {
    // If class-specific is chosen, validate that at least one class is selected
    if (!values.public && selectedClassIds.length === 0) {
      toast.error(
        t('dashboard.courses.communities.scope.must_select_class', {
          defaultValue: 'Lütfen en az bir sınıf seçin veya Okul Geneli seçeneğini tercih edin.',
        })
      )
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading(t('dashboard.courses.communities.general.toasts.updating'))

    try {
      // 1. Update basic community info (name, description, public status)
      const result = await updateCommunity(
        community.community_uuid,
        {
          name: values.name,
          description: values.description || null,
          public: values.public,
        },
        accessToken
      )

      // 2. Sync linked classes based on scope
      const initialLinkedIds = new Set(linkedClasses.map((c) => c.id))

      if (values.public) {
        // If switched to school-wide (public), unlink all previously linked classes
        await Promise.all(
          linkedClasses.map((c) =>
            unLinkResourcesToUserGroup(c.id, community.community_uuid, org.id, accessToken)
          )
        )
      } else {
        // Link newly selected classes
        const classesToAdd = selectedClassIds.filter((id) => !initialLinkedIds.has(id))
        const classesToRemove = linkedClasses
          .filter((c) => !selectedClassIds.includes(c.id))
          .map((c) => c.id)

        await Promise.all([
          ...classesToAdd.map((classId) =>
            linkResourcesToUserGroup(classId, community.community_uuid, org.id, accessToken)
          ),
          ...classesToRemove.map((classId) =>
            unLinkResourcesToUserGroup(classId, community.community_uuid, org.id, accessToken)
          ),
        ])
      }

      if (result) {
        await Promise.all([
          refetchLinked(),
          revalidateTags(['communities'], org.slug),
          queryClient.invalidateQueries({ queryKey: queryKeys.community.list(org.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(community.community_uuid) }),
          queryClient.invalidateQueries({ queryKey: ['community_usergroups', community.community_uuid] }),
        ])

        if (dispatch) {
          dispatch({ type: 'setCommunity', payload: { ...community, ...values } })
        }

        toast.success(t('dashboard.courses.communities.general.toasts.update_success'), { id: loadingToast })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update community:', error)
      toast.error(t('dashboard.courses.communities.general.toasts.update_error'), { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if class selections have changed
  const currentLinkedIds = useMemo(() => new Set(linkedClasses.map((c) => c.id)), [linkedClasses])
  const hasClassChanges = useMemo(() => {
    if (selectedClassIds.length !== currentLinkedIds.size) return true
    return selectedClassIds.some((id) => !currentLinkedIds.has(id))
  }, [selectedClassIds, currentLinkedIds])

  return (
    <div className="space-y-6">
      <div className="sm:mx-10 mx-0 bg-white rounded-xl nice-shadow">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, errors, touched, setFieldValue, isValid, dirty }) => {
            const isSaveDisabled = isSubmitting || !isValid || (!dirty && !hasClassChanges)

            return (
              <Form>
                <div className="flex flex-col gap-0">
                  {/* Header */}
                  <div className="flex flex-col bg-gray-50 -space-y-1 px-5 py-3 mx-3 my-3 rounded-md">
                    <h1 className="font-bold text-xl text-gray-800">
                      {t('dashboard.courses.communities.general.title')}
                    </h1>
                    <h2 className="text-gray-500 text-md">
                      {t('dashboard.courses.communities.general.subtitle')}
                    </h2>
                  </div>

                  <div className="flex flex-col space-y-6 mx-5 my-5">
                    {/* Basic Fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">
                          {t('dashboard.courses.communities.general.form.name_label')} *
                          <span className="text-gray-500 text-sm ms-2">
                            ({t('dashboard.courses.communities.general.form.characters_left', {
                              count: 100 - (values.name?.length || 0),
                            })})
                          </span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          placeholder={t('dashboard.courses.communities.general.form.name_placeholder')}
                          maxLength={100}
                        />
                        {touched.name && errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">
                          {t('dashboard.courses.communities.general.form.description_label')}
                          <span className="text-gray-500 text-sm ms-2">
                            ({t('dashboard.courses.communities.general.form.characters_left', {
                              count: 500 - (values.description?.length || 0),
                            })})
                          </span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          placeholder={t('dashboard.courses.communities.general.form.description_placeholder')}
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        {touched.description && errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Scope Selector: Okul Geneli vs Sınıf Bazlı */}
                    <div className="pt-2 border-t border-gray-100 space-y-4">
                      <div>
                        <Label className="text-base font-bold text-gray-900">
                          {t('dashboard.courses.communities.scope.title', { defaultValue: 'Forum Görünürlük Kapsamı' })}
                        </Label>
                        <p className="text-sm text-gray-500">
                          {t('dashboard.courses.communities.scope.subtitle', {
                            defaultValue: 'Bu forumun tüm okula mı yoksa sadece seçtiğiniz sınıflara mı açık olduğunu belirleyin.',
                          })}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Option 1: Okul Geneli */}
                        <div
                          onClick={() => setFieldValue('public', true)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                            values.public
                              ? 'border-black bg-gray-50/70 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  values.public ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <Globe size={18} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {t('dashboard.courses.communities.scope.all_school_title', {
                                    defaultValue: 'Okul Geneli (Tüm Okul)',
                                  })}
                                </h3>
                                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  {t('dashboard.courses.communities.general.form.public_label', {
                                    defaultValue: 'Herkese Açık',
                                  })}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                values.public ? 'border-black bg-black text-white' : 'border-gray-300'
                              }`}
                            >
                              {values.public && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                            {t('dashboard.courses.communities.scope.all_school_desc', {
                              defaultValue:
                                'Tüm öğrenci, öğretmen ve okul üyeleri bu foruma erişebilir ve mesaj paylaşabilir.',
                            })}
                          </p>
                        </div>

                        {/* Option 2: Sınıf Bazlı */}
                        <div
                          onClick={() => setFieldValue('public', false)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                            !values.public
                              ? 'border-black bg-gray-50/70 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  !values.public ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <GraduationCap size={18} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {t('dashboard.courses.communities.scope.class_specific_title', {
                                    defaultValue: 'Sınıf Bazlı (Belirli Sınıflar)',
                                  })}
                                </h3>
                                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                  {selectedClassIds.length > 0
                                    ? t('dashboard.courses.communities.scope.selected_count', {
                                        count: selectedClassIds.length,
                                        defaultValue: `${selectedClassIds.length} sınıf seçildi`,
                                      })
                                    : 'Kısıtlı Erişim'}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                !values.public ? 'border-black bg-black text-white' : 'border-gray-300'
                              }`}
                            >
                              {!values.public && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                            {t('dashboard.courses.communities.scope.class_specific_desc', {
                              defaultValue:
                                'Yalnızca seçilen sınıflardaki öğrenciler ve yetkili öğretmenler bu forumu görebilir.',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Class Selection Box (only active when Sınıf Bazlı is chosen) */}
                      {!values.public && (
                        <div className="mt-4 p-4 bg-gray-50/90 border border-gray-200 rounded-xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <Label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <GraduationCap size={16} />
                                {t('dashboard.courses.communities.scope.select_classes_label', {
                                  defaultValue: 'Erişimi olan sınıfları seçin:',
                                })}
                              </Label>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {t('dashboard.courses.communities.scope.selected_count', {
                                  count: selectedClassIds.length,
                                  defaultValue: `${selectedClassIds.length} sınıf seçildi`,
                                })}
                              </p>
                            </div>

                            {/* Quick Select Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={selectAllFiltered}
                                className="text-xs h-8 bg-white"
                              >
                                {t('dashboard.courses.communities.scope.select_all', { defaultValue: 'Tümünü Seç' })}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={deselectAllFiltered}
                                className="text-xs h-8 bg-white text-gray-600"
                              >
                                {t('dashboard.courses.communities.scope.deselect_all', {
                                  defaultValue: 'Seçimi Temizle',
                                })}
                              </Button>
                            </div>
                          </div>

                          {/* Search and Filters */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                              <Search
                                size={15}
                                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                              <Input
                                type="text"
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                placeholder={t('dashboard.courses.communities.scope.search_placeholder', {
                                  defaultValue: 'Sınıf ara...',
                                })}
                                className="ps-9 h-9 text-xs bg-white"
                              />
                            </div>

                            {/* Grade pills */}
                            {gradeLevels.length > 0 && (
                              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedGrade('all')}
                                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                                    selectedGrade === 'all'
                                      ? 'bg-black text-white'
                                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {t('common.all', { defaultValue: 'Tümü' })}
                                </button>
                                {gradeLevels.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setSelectedGrade(g)}
                                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                                      selectedGrade === g
                                        ? 'bg-black text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Class list with Checkboxes */}
                          <div className="max-h-72 overflow-y-auto border border-gray-200 bg-white rounded-lg divide-y divide-gray-100">
                            {isLoadingAll || isLoadingLinked ? (
                              <div className="flex items-center justify-center py-10">
                                <Loader2 size={24} className="animate-spin text-gray-400" />
                              </div>
                            ) : allClasses.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <AlertCircle size={28} className="mx-auto mb-2 text-amber-500" />
                                <p className="text-xs font-semibold text-gray-700">
                                  {t('dashboard.courses.communities.scope.no_classes_warning', {
                                    defaultValue:
                                      'Okulda tanımlı sınıf bulunamadı. Önce Sınıflar panelinden sınıf oluşturun.',
                                  })}
                                </p>
                              </div>
                            ) : filteredClasses.length === 0 ? (
                              <div className="p-6 text-center text-gray-400 text-xs">
                                {t('dashboard.courses.communities.class.no_courses', {
                                  defaultValue: 'Sınıf bulunamadı',
                                })}
                              </div>
                            ) : (
                              filteredClasses.map((item) => {
                                const isSelected = selectedClassIds.includes(item.id)
                                return (
                                  <label
                                    key={item.id}
                                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleClassSelection(item.id)}
                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                      />
                                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {item.grade_level ? item.grade_level.replace(/\D/g, '') || 'S' : 'S'}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-semibold text-gray-900 text-xs truncate">
                                            {item.name}
                                          </p>
                                          {item.grade_level && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                                              {item.grade_level}
                                            </span>
                                          )}
                                        </div>
                                        {item.description && (
                                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {item.join_code && (
                                      <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 shrink-0">
                                        <KeyRound size={11} className="text-gray-400" />
                                        {item.join_code}
                                      </div>
                                    )}
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row-reverse mt-0 mx-5 mb-5">
                    <Button
                      type="submit"
                      disabled={isSaveDisabled}
                      className="bg-black text-white hover:bg-black/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin me-2" />
                          {t('common.saving')}
                        </>
                      ) : (
                        t('common.save_changes')
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
    </div>
  )
}

export default CommunityEditGeneral
