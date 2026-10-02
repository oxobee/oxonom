'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { createPodcast } from '@services/podcasts/podcasts'
import { getUserGroups, linkResourcesToUserGroup } from '@services/usergroups/usergroups'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { revalidateTags, asArray } from '@services/utils/ts/requests'
import Modal from '@components/Objects/StyledElements/Modal/Modal'
import { Loader2, Globe, GraduationCap } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@services/utils/ts/errorMessage'
import { useUpgradeModal } from '@components/Dashboard/Shared/PlanRestricted/UpgradeModalContext'

interface CreatePodcastModalProps {
  isOpen: boolean
  onClose: () => void
  orgId: number
  orgSlug: string
}

export function CreatePodcastModal({
  isOpen,
  onClose,
  orgId,
  orgSlug,
}: CreatePodcastModalProps) {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const router = useRouter()
  const queryClient = useQueryClient()
  const { track } = useLHAnalytics('learner')
  const { handlePlanLimit } = useUpgradeModal()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessToken = session?.data?.tokens?.access_token

  // Fetch school classes for targeting
  const { data: rawUserGroups } = useQuery({
    queryKey: queryKeys.usergroups.list(orgId),
    queryFn: () => getUserGroups(orgId, accessToken),
    enabled: !!(orgId && accessToken && isOpen),
  })
  const usergroups = asArray<any>(rawUserGroups?.data || rawUserGroups)

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('podcasts.form.name_required'))
      .min(3, t('podcasts.form.name_min_length'))
      .max(100, t('podcasts.form.name_max_length')),
    description: Yup.string()
      .max(500, t('podcasts.form.description_max_length')),
    targetType: Yup.string().oneOf(['all', 'specific']),
    targetUsergroupIds: Yup.array().when('targetType', {
      is: 'specific',
      then: (schema) => schema.min(1, 'Lütfen en az bir sınıf seçiniz'),
      otherwise: (schema) => schema.optional(),
    }),
  })

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true)
    const isPublic = values.targetType === 'all'
    try {
      const result = await createPodcast(
        String(orgId),
        {
          name: values.name,
          description: values.description || '',
          public: isPublic,
        },
        null,
        accessToken
      )

      if (result?.success) {
        // Link to specific classrooms if chosen
        if (values.targetType === 'specific' && values.targetUsergroupIds?.length > 0) {
          for (const ugId of values.targetUsergroupIds) {
            try {
              await linkResourcesToUserGroup(
                ugId,
                result.data.podcast_uuid,
                orgId,
                accessToken
              )
            } catch (linkErr) {
              console.error('Failed to link podcast to class:', linkErr)
            }
          }
        }

        track(AnalyticsEvent.PodcastCreated, {
          is_public: isPublic,
          has_thumbnail: false,
          source: 'quick_modal',
        })
        await revalidateTags(['podcasts'], orgSlug)
        queryClient.invalidateQueries({ queryKey: queryKeys.podcasts.list(orgSlug) })
        toast.success(t('podcasts.podcast_created_success', 'Podcast başarıyla oluşturuldu'))
        onClose()
        const podcastId = result.data.podcast_uuid?.replace('podcast_', '') || result.data.podcast_uuid
        router.push(`/dash/podcasts/podcast/${podcastId}/general`)
      } else if (handlePlanLimit(result, { source: 'podcast_create', feature: 'podcasts', requiredPlan: 'standard' })) {
        onClose()
      } else {
        toast.error(getErrorMessage(result?.data?.detail, t('podcasts.failed_to_create_podcast')))
      }
    } catch (error) {
      console.error('Failed to create podcast:', error)
      toast.error(t('podcasts.failed_to_create_podcast'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isDialogOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      dialogTitle={t('podcasts.modals.create.title')}
      dialogDescription={t('podcasts.modals.create.description')}
      minWidth="lg"
      dialogContent={
        <Formik
          initialValues={{
            name: '',
            description: '',
            targetType: 'all',
            targetUsergroupIds: [] as (string | number)[],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isValid, dirty }) => (
            <Form className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('podcasts.modals.create.form.name_label')} *
                </label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  placeholder={t('podcasts.modals.create.form.name_placeholder')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-transparent outline-none transition-all"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('podcasts.modals.create.form.description_label')}
                </label>
                <Field
                  as="textarea"
                  name="description"
                  id="description"
                  rows={2}
                  placeholder={t('podcasts.modals.create.form.description_placeholder')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-transparent outline-none transition-all resize-none"
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              {/* Class Targeting / Audience Selection */}
              <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-3.5 space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hedef Kitle & Sınıf Erişimi
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                      type="radio"
                      name="targetType"
                      value="all"
                      checked={values.targetType === 'all'}
                      onChange={() => {
                        setFieldValue('targetType', 'all')
                        setFieldValue('targetUsergroupIds', [])
                      }}
                      className="mt-0.5 text-black focus:ring-black"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Globe size={13} className="text-emerald-600" />
                        <span>Tüm Okula / Sınıflara Açık</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Tüm sınıflardaki öğrenciler bu podcasti dinleyebilir.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                    <input
                      type="radio"
                      name="targetType"
                      value="specific"
                      checked={values.targetType === 'specific'}
                      onChange={() => {
                        setFieldValue('targetType', 'specific')
                        if (usergroups.length > 0 && values.targetUsergroupIds.length === 0) {
                          setFieldValue('targetUsergroupIds', [usergroups[0].id])
                        }
                      }}
                      className="mt-0.5 text-black focus:ring-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <GraduationCap size={14} className="text-purple-600" />
                        <span>Belirli Sınıflara Özel</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Yalnızca seçilen sınıflardaki öğrenciler erişebilir (birden fazla seçilebilir).
                      </p>
                    </div>
                  </label>
                </div>

                {values.targetType === 'specific' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-700">
                        Erişebilecek Sınıfları Seçiniz *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFieldValue('targetUsergroupIds', usergroups.map((ug: any) => ug.id))}
                          className="text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Tümünü Seç
                        </button>
                        <span className="text-gray-300 text-[11px]">|</span>
                        <button
                          type="button"
                          onClick={() => setFieldValue('targetUsergroupIds', [])}
                          className="text-[11px] text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Temizle
                        </button>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                      {usergroups.map((ug: any) => {
                        const isChecked = values.targetUsergroupIds?.includes(ug.id)
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
                                const current = values.targetUsergroupIds || []
                                if (isChecked) {
                                  setFieldValue(
                                    'targetUsergroupIds',
                                    current.filter((id: any) => id !== ug.id)
                                  )
                                } else {
                                  setFieldValue('targetUsergroupIds', [...current, ug.id])
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
                    <ErrorMessage
                      name="targetUsergroupIds"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  {t('podcasts.modals.create.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !dirty}
                  className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {t('podcasts.modals.create.submit')}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      }
    />
  )
}

export default CreatePodcastModal
