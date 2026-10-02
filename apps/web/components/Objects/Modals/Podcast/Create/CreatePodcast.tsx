'use client'
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import FormLayout, {
  FormField,
  FormLabelAndMessage,
} from '@components/Objects/StyledElements/Form/Form'
import * as Form from '@radix-ui/react-form'
import { createPodcast } from '@services/podcasts/podcasts'
import { getUserGroups, linkResourcesToUserGroup } from '@services/usergroups/usergroups'
import { asArray } from '@services/utils/ts/requests'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { useUpgradeModal } from '@components/Dashboard/Shared/PlanRestricted/UpgradeModalContext'
import { getOrganizationContextInfoWithoutCredentials } from '@services/organizations/orgs'
import React, { useEffect } from 'react'
import { BarLoader } from 'react-spinners'
import { revalidateTags } from '@services/utils/ts/requests'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import toast from 'react-hot-toast'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { UploadCloud, Globe, GraduationCap } from 'lucide-react'
import AIImageButton from '@components/Objects/AI/AIImageButton'
import FormTagInput from "@components/Objects/StyledElements/Form/TagInput"
import { useTranslation } from "react-i18next"

function CreatePodcastModal({ closeModal, orgslug }: any) {
  const { t } = useTranslation()
  const router = useRouter()
  const session = useLHSession() as any
  const queryClient = useQueryClient()
  const { track } = useLHAnalytics('learner')
  const { handlePlanLimit } = useUpgradeModal()
  const [orgId, setOrgId] = React.useState<number | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const accessToken = session?.data?.tokens?.access_token

  // Fetch classes in organization
  const { data: rawUserGroups } = useQuery({
    queryKey: queryKeys.usergroups.list(orgId || 0),
    queryFn: () => getUserGroups(orgId, accessToken),
    enabled: !!(orgId && accessToken),
  })
  const usergroups = asArray<any>(rawUserGroups?.data || rawUserGroups)

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('podcasts.podcast_name_required'))
      .max(100, 'Must be 100 characters or less'),
    description: Yup.string()
      .max(1000, 'Must be 1000 characters or less'),
    tags: Yup.string(),
    targetType: Yup.string().oneOf(['all', 'specific']),
    targetUsergroupIds: Yup.array().when('targetType', {
      is: 'specific',
      then: (schema) => schema.min(1, 'Lütfen en az bir sınıf seçiniz'),
      otherwise: (schema) => schema.optional(),
    }),
    thumbnail: Yup.mixed().nullable()
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      targetType: 'all',
      targetUsergroupIds: [] as (string | number)[],
      tags: '',
      thumbnail: null
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toast_loading = toast.loading(t('podcasts.creating_podcast'))
      const isPublic = values.targetType === 'all'

      try {
        const res = await createPodcast(
          String(orgId),
          {
            name: values.name,
            description: values.description,
            tags: values.tags,
            public: isPublic
          },
          values.thumbnail,
          session.data?.tokens?.access_token
        )

        if (res.success) {
          track(AnalyticsEvent.PodcastCreated, {
            is_public: isPublic,
            has_thumbnail: !!values.thumbnail,
            source: 'create_modal',
          })

          // Link to specific classrooms if selected
          if (values.targetType === 'specific' && values.targetUsergroupIds?.length > 0 && res.data?.podcast_uuid) {
            for (const ugId of values.targetUsergroupIds) {
              try {
                await linkResourcesToUserGroup(
                  Number(ugId),
                  res.data.podcast_uuid,
                  orgId!,
                  session.data?.tokens?.access_token
                )
              } catch (err) {
                console.error('Failed to link podcast to class:', err)
              }
            }
          }

          await revalidateTags(['podcasts'], orgslug)
          queryClient.invalidateQueries({ queryKey: queryKeys.podcasts.list(orgslug) })
          toast.dismiss(toast_loading)
          toast.success(t('podcasts.podcast_created_success'))

          closeModal()
          // Redirect to the podcast dashboard
          const podcastId = res.data.podcast_uuid?.replace('podcast_', '') || res.data.podcast_uuid
          router.push(`/dash/podcasts/podcast/${podcastId}/general`)
        } else {
          toast.dismiss(toast_loading)
          // Podcasts are gated on the free plan → offer an upgrade at the
          // moment of value rather than a dead-end error toast.
          if (handlePlanLimit(res, { source: 'podcast_create', feature: 'podcasts', requiredPlan: 'standard' })) {
            closeModal()
          } else {
            const errorMessage = typeof res.data?.detail === 'string'
              ? res.data.detail
              : Array.isArray(res.data?.detail)
                ? res.data.detail.map((e: any) => e.msg).join(', ')
                : t('podcasts.failed_to_create_podcast')
            toast.error(errorMessage)
          }
        }
      } catch (_error) {
        toast.dismiss(toast_loading)
        toast.error(t('podcasts.failed_to_create_podcast'))
      } finally {
        setSubmitting(false)
      }
    }
  })

  const getOrgMetadata = async () => {
    const org = await getOrganizationContextInfoWithoutCredentials(orgslug, {
      revalidate: 360,
      tags: ['organizations'],
    })
    setOrgId(org.id)
  }

  useEffect(() => {
    if (orgslug) {
      getOrgMetadata()
    }
  }, [orgslug])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      formik.setFieldValue('thumbnail', file)
    }
  }

  const handleRemoteImageSelect = async (imageUrl: string) => {
    setIsUploading(true)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'ai_image.jpg', { type: 'image/jpeg' })
      formik.setFieldValue('thumbnail', file)
    } catch (_error) {
      toast.error('Failed to load the generated image')
    }
    setIsUploading(false)
  }

  const handleAIImageFile = async (file: File) => {
    formik.setFieldValue('thumbnail', file)
  }

  return (
    <FormLayout onSubmit={formik.handleSubmit} >
      <FormField name="name">
        <FormLabelAndMessage
          label={t('podcasts.podcast_name')}
          message={formik.errors.name}
        />
        <Form.Control asChild>
          <Input
            onChange={formik.handleChange}
            value={formik.values.name}
            type="text"
            required
          />
        </Form.Control>
      </FormField>

      <FormField name="description">
        <FormLabelAndMessage
          label={t('library.description')}
          message={formik.errors.description}
        />
        <Form.Control asChild>
          <Textarea
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </Form.Control>
      </FormField>

      <FormField name="thumbnail">
        <FormLabelAndMessage
          label={t('podcasts.podcast_thumbnail')}
          message={formik.errors.thumbnail}
        />
        <div className="w-auto bg-gray-50 rounded-xl outline outline-1 outline-gray-200 h-[200px] shadow-sm">
          <div className="flex flex-col justify-center items-center h-full">
            <div className="flex flex-col justify-center items-center">
              {formik.values.thumbnail ? (
                <img
                  src={URL.createObjectURL(formik.values.thumbnail)}
                  className={`${isUploading ? 'animate-pulse' : ''} shadow-sm w-[200px] h-[100px] rounded-md object-cover`}
                />
              ) : (
                <img
                  src="/empty_thumbnail.png"
                  className="shadow-sm w-[200px] h-[100px] rounded-md bg-gray-200"
                />
              )}
              <div className="flex justify-center items-center space-x-2">
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
                <button
                  type="button"
                  className="font-bold antialiased items-center text-gray text-sm rounded-md px-4 mt-6 flex"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <UploadCloud size={16} className="me-2" />
                  <span>{t('courses.upload_image')}</span>
                </button>
                <AIImageButton
                  onSelect={handleRemoteImageSelect}
                  onSelectFile={handleAIImageFile}
                  className="font-bold antialiased items-center text-gray text-sm rounded-md px-4 mt-6 flex gap-2"
                />
              </div>
            </div>
          </div>
        </div>
      </FormField>

      <FormField name="tags">
        <FormLabelAndMessage
          label={t('podcasts.podcast_tags')}
          message={formik.errors.tags}
        />
        <FormTagInput
          placeholder={t('courses.enter_to_add')}
          value={formik.values.tags}
          onChange={(value) => formik.setFieldValue('tags', value)}
          error={formik.errors.tags}
        />
      </FormField>

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
              checked={formik.values.targetType === 'all'}
              onChange={() => {
                formik.setFieldValue('targetType', 'all')
                formik.setFieldValue('targetUsergroupIds', [])
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
              checked={formik.values.targetType === 'specific'}
              onChange={() => {
                formik.setFieldValue('targetType', 'specific')
                if (usergroups.length > 0 && formik.values.targetUsergroupIds.length === 0) {
                  formik.setFieldValue('targetUsergroupIds', [usergroups[0].id])
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

        {formik.values.targetType === 'specific' && (
          <div className="pt-2 space-y-2">
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

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-4 py-2 bg-black text-white text-sm font-bold rounded-md"
        >
          {formik.isSubmitting ? (
            <BarLoader
              cssOverride={{ borderRadius: 60 }}
              width={60}
              color="#ffffff"
            />
          ) : (
            t('podcasts.create_podcast_btn')
          )}
        </button>
      </div>
    </FormLayout>
  )
}

export default CreatePodcastModal
