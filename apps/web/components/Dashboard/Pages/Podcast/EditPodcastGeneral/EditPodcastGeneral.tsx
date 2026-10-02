'use client'
import React, { useState } from 'react'
import { usePodcast } from '@components/Contexts/PodcastContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { updatePodcast, updatePodcastThumbnail } from '@services/podcasts/podcasts'
import {
  getUserGroups,
  getUserGroupsByResource,
  linkResourcesToUserGroup,
  unLinkResourcesToUserGroup,
} from '@services/usergroups/usergroups'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { getPodcastThumbnailMediaDirectory } from '@services/media/media'
import { revalidateTags, asArray } from '@services/utils/ts/requests'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Loader2, Upload, Trash2, Save, Globe, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import FormLayout, {
  FormField,
  FormLabelAndMessage,
  Input,
  Textarea,
} from '@components/Objects/StyledElements/Form/Form'
import * as Form from '@radix-ui/react-form'

interface EditPodcastGeneralProps {
  orgslug: string
}

function EditPodcastGeneral({ orgslug }: EditPodcastGeneralProps) {
  const { t } = useTranslation()
  const { podcast, refreshPodcast, isLoading } = usePodcast()
  const session = useLHSession() as any
  const org = useOrg() as any
  const queryClient = useQueryClient()
  const { track } = useLHAnalytics('dashboard')
  const [isSaving, setIsSaving] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const accessToken = session?.data?.tokens?.access_token

  // Fetch classes in organization
  const { data: rawUserGroups } = useQuery({
    queryKey: queryKeys.usergroups.list(org?.id),
    queryFn: () => getUserGroups(org?.id, accessToken),
    enabled: !!(org?.id && accessToken),
  })
  const usergroups = asArray<any>(rawUserGroups?.data || rawUserGroups)

  // Fetch currently linked classes for this podcast
  const { data: rawLinkedGroups, refetch: refetchLinkedGroups } = useQuery({
    queryKey: ['podcast-usergroups', podcast?.podcast_uuid],
    queryFn: () => getUserGroupsByResource(podcast!.podcast_uuid, accessToken),
    enabled: !!(podcast?.podcast_uuid && accessToken),
  })
  const linkedGroups = asArray<any>(rawLinkedGroups?.data || rawLinkedGroups)
  const currentlyLinkedGroupIds = linkedGroups.map((g: any) => g.id)

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('podcasts.form.name_required'))
      .min(3, t('podcasts.form.name_min_length'))
      .max(100, t('podcasts.form.name_max_length')),
    description: Yup.string()
      .max(500, t('podcasts.form.description_max_length')),
    about: Yup.string()
      .max(2000, t('podcasts.dashboard.form.about_max_length')),
    tags: Yup.string(),
    targetType: Yup.string().oneOf(['all', 'specific']),
    targetUsergroupIds: Yup.array().when('targetType', {
      is: 'specific',
      then: (schema) => schema.min(1, 'Lütfen en az bir sınıf seçiniz'),
      otherwise: (schema) => schema.optional(),
    }),
    published: Yup.boolean(),
  })

  const formik = useFormik({
    initialValues: {
      name: podcast?.name || '',
      description: podcast?.description || '',
      about: podcast?.about || '',
      tags: podcast?.tags || '',
      targetType: linkedGroups.length > 0 ? 'specific' : (podcast?.public ? 'all' : 'specific'),
      targetUsergroupIds: currentlyLinkedGroupIds as number[],
      published: podcast?.published || false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSaving(true)
      const thumbnailChanged = !!thumbnailFile
      const toastId = toast.loading(t('podcasts.dashboard.saving'))
      const isPublic = values.targetType === 'all'
      try {
        await updatePodcast(
          podcast!.podcast_uuid,
          {
            name: values.name,
            description: values.description,
            about: values.about,
            tags: values.tags,
            public: isPublic,
            published: values.published,
          },
          accessToken
        )
        track(AnalyticsEvent.PodcastUpdated, {
          is_published: values.published,
          thumbnail_changed: thumbnailChanged,
        })

        if (thumbnailFile) {
          const formData = new FormData()
          formData.append('thumbnail', thumbnailFile)
          await updatePodcastThumbnail(podcast!.podcast_uuid, formData, accessToken)
        }

        // Manage classroom links
        if (values.targetType === 'all') {
          for (const g of linkedGroups) {
            try {
              await unLinkResourcesToUserGroup(g.id, podcast!.podcast_uuid, org.id, accessToken)
            } catch (err) {
              console.error('Failed to unlink classroom:', err)
            }
          }
        } else if (values.targetType === 'specific') {
          const selectedIds: number[] = (values.targetUsergroupIds || []).map(Number)
          // Unlink classrooms that are no longer selected
          for (const g of linkedGroups) {
            if (!selectedIds.includes(g.id)) {
              try {
                await unLinkResourcesToUserGroup(g.id, podcast!.podcast_uuid, org.id, accessToken)
              } catch (err) {
                console.error('Failed to unlink classroom:', err)
              }
            }
          }
          // Link newly selected classrooms
          for (const id of selectedIds) {
            if (!linkedGroups.some((g: any) => g.id === id)) {
              try {
                await linkResourcesToUserGroup(id, podcast!.podcast_uuid, org.id, accessToken)
              } catch (err) {
                console.error('Failed to link classroom:', err)
              }
            }
          }
        }

        await refetchLinkedGroups()

        await revalidateTags(['podcasts'], orgslug)
        await refreshPodcast()
        queryClient.invalidateQueries({ queryKey: queryKeys.podcasts.list(orgslug) })
        queryClient.invalidateQueries({ queryKey: queryKeys.podcasts.detail(podcast!.podcast_uuid) })
        toast.success(t('podcasts.dashboard.saved'), { id: toastId })
        setThumbnailFile(null)
        setThumbnailPreview(null)
      } catch (error) {
        console.error('Failed to save podcast:', error)
        toast.error(t('podcasts.dashboard.save_error'), { id: toastId })
      } finally {
        setIsSaving(false)
      }
    },
  })

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  if (isLoading || !podcast) {
    return (
      <div className="h-full">
        <div className="h-6" />
        <div className="px-10 pb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="space-y-6">
              {/* Thumbnail placeholder */}
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="flex items-start space-x-4">
                  <div className="w-40 h-40 bg-gray-200 rounded-lg shrink-0" />
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="h-9 w-36 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-48 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
              {/* Fields */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
              ))}
              {/* Checkboxes */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="h-3.5 w-20 bg-gray-100 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="h-3.5 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentThumbnail = thumbnailPreview || (podcast.thumbnail_image
    ? getPodcastThumbnailMediaDirectory(org?.org_uuid, podcast.podcast_uuid, podcast.thumbnail_image)
    : null)

  return (
    <div className="h-full">
      <div className="h-6" />
      <div className="px-10 pb-10">
        <div className="bg-white rounded-xl shadow-sm">
          <FormLayout onSubmit={formik.handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('podcasts.dashboard.form.thumbnail')}
                </label>
                <div className="flex items-start space-x-4">
                  <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
                    {currentThumbnail ? (
                      <>
                        <img
                          src={currentThumbnail}
                          alt="Podcast thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 end-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Upload size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload size={16} className="me-2" />
                      {t('podcasts.dashboard.form.upload_thumbnail')}
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      {t('podcasts.dashboard.form.thumbnail_hint')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <FormField name="name">
                <FormLabelAndMessage
                  label={t('podcasts.modals.create.form.name_label')}
                  message={formik.errors.name as string}
                />
                <Form.Control asChild>
                  <Input
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    placeholder={t('podcasts.modals.create.form.name_placeholder')}
                  />
                </Form.Control>
              </FormField>

              {/* Description */}
              <FormField name="description">
                <FormLabelAndMessage
                  label={t('podcasts.modals.create.form.description_label')}
                  message={formik.errors.description as string}
                />
                <Form.Control asChild>
                  <Textarea
                    onChange={formik.handleChange}
                    value={formik.values.description}
                    placeholder={t('podcasts.modals.create.form.description_placeholder')}
                    rows={3}
                  />
                </Form.Control>
              </FormField>

              {/* About */}
              <FormField name="about">
                <FormLabelAndMessage
                  label={t('podcasts.dashboard.form.about')}
                  message={formik.errors.about as string}
                />
                <Form.Control asChild>
                  <Textarea
                    onChange={formik.handleChange}
                    value={formik.values.about}
                    placeholder={t('podcasts.dashboard.form.about_placeholder')}
                    rows={5}
                  />
                </Form.Control>
              </FormField>

              {/* Tags */}
              <FormField name="tags">
                <FormLabelAndMessage
                  label={t('podcasts.tags')}
                  message={formik.errors.tags as string}
                />
                <Form.Control asChild>
                  <Input
                    onChange={formik.handleChange}
                    value={formik.values.tags}
                    placeholder={t('podcasts.dashboard.form.tags_placeholder')}
                  />
                </Form.Control>
                <p className="mt-1 text-xs text-gray-500">
                  {t('podcasts.dashboard.form.tags_hint')}
                </p>
              </FormField>

              {/* Visibility & Class Targeting */}
              <div className="border-t border-gray-100 pt-6 space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Hedef Kitle & Sınıf Erişimi
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Podcast içeriğinin hangi sınıflar tarafından dinlenebileceğini belirleyin.
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                      <input
                        type="radio"
                        name="targetType"
                        value="all"
                        checked={formik.values.targetType === 'all'}
                        onChange={() => {
                          formik.setFieldValue('targetType', 'all')
                          formik.setFieldValue('targetUsergroupIds', [])
                        }}
                        className="mt-0.5 text-black focus:ring-black"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Globe size={15} className="text-emerald-600" />
                          <span>Tüm Okula / Sınıflara Açık</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Tüm sınıflardaki öğrenciler bu podcasti dinleyebilir.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                      <input
                        type="radio"
                        name="targetType"
                        value="specific"
                        checked={formik.values.targetType === 'specific'}
                        onChange={() => {
                          formik.setFieldValue('targetType', 'specific')
                          if (usergroups.length > 0 && formik.values.targetUsergroupIds?.length === 0) {
                            formik.setFieldValue('targetUsergroupIds', [usergroups[0].id])
                          }
                        }}
                        className="mt-0.5 text-black focus:ring-black"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <GraduationCap size={16} className="text-purple-600" />
                          <span>Belirli Sınıflara Özel</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Yalnızca seçilen sınıflardaki öğrenciler erişebilir (birden fazla seçilebilir).
                        </p>
                      </div>
                    </label>
                  </div>

                  {formik.values.targetType === 'specific' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-700">
                          Erişebilecek Sınıfları Seçiniz *
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => formik.setFieldValue('targetUsergroupIds', usergroups.map((ug: any) => ug.id))}
                            className="text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Tümünü Seç
                          </button>
                          <span className="text-gray-300 text-[11px]">|</span>
                          <button
                            type="button"
                            onClick={() => formik.setFieldValue('targetUsergroupIds', [])}
                            className="text-[11px] text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Temizle
                          </button>
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                        {usergroups.map((ug: any) => {
                          const isChecked = formik.values.targetUsergroupIds?.includes(ug.id)
                          return (
                            <label
                              key={ug.id}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-purple-50/70 border-purple-300 text-purple-900 font-medium'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const current = formik.values.targetUsergroupIds || []
                                  if (isChecked) {
                                    formik.setFieldValue(
                                      'targetUsergroupIds',
                                      current.filter((id: any) => id !== ug.id)
                                    )
                                  } else {
                                    formik.setFieldValue('targetUsergroupIds', [...current, ug.id])
                                  }
                                }}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                              />
                              <span className="flex-1">{ug.name}</span>
                              {ug.invitation_code && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono font-normal">
                                  {ug.invitation_code}
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>

                      {formik.errors.targetUsergroupIds && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.targetUsergroupIds as string}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Published status */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formik.values.published}
                      onChange={formik.handleChange}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black/20"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {t('podcasts.published')}
                      </span>
                      <p className="text-xs text-gray-500">
                        {t('podcasts.dashboard.form.published_hint')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSaving || !formik.isValid}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="me-2 animate-spin" />
                  ) : (
                    <Save size={16} className="me-2" />
                  )}
                  {t('podcasts.dashboard.save_changes')}
                </button>
              </div>
            </div>
          </FormLayout>
        </div>
      </div>
    </div>
  )
}

export default EditPodcastGeneral
