'use client'
import React from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import {
  updateOrganization,
  updateOrgFooterTextConfig,
  updateOrgEmailSenderNameConfig,
  updateOrgDefaultLanguageConfig,
} from '@services/settings/org'
import { AVAILABLE_LANGUAGES } from '@/lib/languages'
import { revalidateTags } from '@services/utils/ts/requests'
import { useRouter } from 'next/navigation'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { toast } from 'react-hot-toast'
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Button } from "@components/ui/button"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useTranslation } from 'react-i18next'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'

const ORG_LABELS = [
  { value: 'languages', emoji: '🌐', labelKey: 'dashboard.organization.settings.categories.languages', fallback: 'Diller & Yabancı Dil' },
  { value: 'business', emoji: '💰', labelKey: 'dashboard.organization.settings.categories.business', fallback: 'İş & Yönetim' },
  { value: 'ecommerce', emoji: '🛍', labelKey: 'dashboard.organization.settings.categories.ecommerce', fallback: 'E-Ticaret' },
  { value: 'gaming', emoji: '🎮', labelKey: 'dashboard.organization.settings.categories.gaming', fallback: 'Oyun Geliştirme' },
  { value: 'music', emoji: '🎸', labelKey: 'dashboard.organization.settings.categories.music', fallback: 'Müzik' },
  { value: 'sports', emoji: '⚽', labelKey: 'dashboard.organization.settings.categories.sports', fallback: 'Beden Eğitimi & Spor' },
  { value: 'cars', emoji: '🚗', labelKey: 'dashboard.organization.settings.categories.cars', fallback: 'Otomotiv & Ulaşım' },
  { value: 'sales_marketing', emoji: '🚀', labelKey: 'dashboard.organization.settings.categories.sales_marketing', fallback: 'Pazarlama & Satış' },
  { value: 'tech', emoji: '💻', labelKey: 'dashboard.organization.settings.categories.tech', fallback: 'Bilişim & Yazılım' },
  { value: 'photo_video', emoji: '📸', labelKey: 'dashboard.organization.settings.categories.photo_video', fallback: 'Fotoğrafçılık & Medya' },
  { value: 'pets', emoji: '🐕', labelKey: 'dashboard.organization.settings.categories.pets', fallback: 'Veterinerlik & Hayvan Bakımı' },
  { value: 'personal_development', emoji: '📚', labelKey: 'dashboard.organization.settings.categories.personal_development', fallback: 'Kişisel Gelişim & Rehberlik' },
  { value: 'real_estate', emoji: '🏠', labelKey: 'dashboard.organization.settings.categories.real_estate', fallback: 'Gayrimenkul' },
  { value: 'beauty_fashion', emoji: '👠', labelKey: 'dashboard.organization.settings.categories.beauty_fashion', fallback: 'Moda & Tasarım' },
  { value: 'travel', emoji: '✈️', labelKey: 'dashboard.organization.settings.categories.travel', fallback: 'Turizm & Seyahat' },
  { value: 'productivity', emoji: '⏳', labelKey: 'dashboard.organization.settings.categories.productivity', fallback: 'Verimlilik & Çalışma' },
  { value: 'health_fitness', emoji: '🍎', labelKey: 'dashboard.organization.settings.categories.health_fitness', fallback: 'Sağlık & Beden Gelişimi' },
  { value: 'finance', emoji: '📈', labelKey: 'dashboard.organization.settings.categories.finance', fallback: 'Ekonomi & Finans' },
  { value: 'arts_crafts', emoji: '🎨', labelKey: 'dashboard.organization.settings.categories.arts_crafts', fallback: 'El Sanatları & Tasarım' },
  { value: 'education', emoji: '📚', labelKey: 'dashboard.organization.settings.categories.education', fallback: 'Genel Eğitim' },
  { value: 'stem', emoji: '🔬', labelKey: 'dashboard.organization.settings.categories.stem', fallback: 'STEM (Fen, Teknoloji, Matematik)' },
  { value: 'humanities', emoji: '📖', labelKey: 'dashboard.organization.settings.categories.humanities', fallback: 'Sosyal & Beşeri Bilimler' },
  { value: 'professional_skills', emoji: '💼', labelKey: 'dashboard.organization.settings.categories.professional_skills', fallback: 'Mesleki Beceriler' },
  { value: 'digital_skills', emoji: '💻', labelKey: 'dashboard.organization.settings.categories.digital_skills', fallback: 'Dijital Okuryazarlık' },
  { value: 'creative_arts', emoji: '🎨', labelKey: 'dashboard.organization.settings.categories.creative_arts', fallback: 'Görsel & Sahne Sanatları' },
  { value: 'social_sciences', emoji: '🌍', labelKey: 'dashboard.organization.settings.categories.social_sciences', fallback: 'Sosyal Bilgiler & Tarih' },
  { value: 'test_prep', emoji: '✍️', labelKey: 'dashboard.organization.settings.categories.test_prep', fallback: 'Sınav Hazırlık (LGS / YKS)' },
  { value: 'vocational', emoji: '🔧', labelKey: 'dashboard.organization.settings.categories.vocational', fallback: 'Mesleki ve Teknik Eğitim' },
  { value: 'early_education', emoji: '🎯', labelKey: 'dashboard.organization.settings.categories.early_education', fallback: 'Okul Öncesi & İlkokul' },
] as const

// Mirrors MAX_SENDER_NAME_LENGTH in apps/api/src/services/email/sender.py, which
// re-validates (and sanitizes) every submitted value server-side.
const MAX_EMAIL_SENDER_NAME_LENGTH = 64

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(60, 'Organization name must be 60 characters or less'),
  description: Yup.string()
    .required('Short description is required')
    .max(100, 'Short description must be 100 characters or less'),
  about: Yup.string()
    .optional()
    .max(400, 'About text must be 400 characters or less'),
  label: Yup.string().required('Organization label is required'),
})

interface OrganizationValues {
  name: string
  description: string
  about: string
  label: string
}

const OrgEditGeneral: React.FC = () => {
  const { t } = useTranslation()
  const _router = useRouter()
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const org = useOrg() as any
  const queryClient = useQueryClient()
  const { track } = useLHAnalytics('dashboard')

  // Footer text state
  const [footerText, setFooterText] = React.useState<string>(org?.config?.config?.customization?.general?.footer_text || org?.config?.config?.general?.footer_text || '')
  const [_isFooterSaving, _setIsFooterSaving] = React.useState(false)

  // Email sender display name state
  const [emailSenderName, setEmailSenderName] = React.useState<string>(
    org?.config?.config?.customization?.general?.email_sender_name ||
    org?.config?.config?.general?.email_sender_name ||
    ''
  )

  // Default language state
  const [defaultLanguage, setDefaultLanguage] = React.useState<string>(
    org?.config?.config?.customization?.general?.default_language ||
    org?.config?.config?.general?.default_language ||
    'en'
  )

  // Games visibility state
  const [gamesEnabled, setGamesEnabled] = React.useState<boolean>(
    org?.config?.config?.features?.games?.enabled !== false
  )

  const initialValues: OrganizationValues = {
    name: org?.name,
    description: org?.description || '',
    about: org?.about || '',
    label: org?.label || '',
  }

  const updateOrg = async (values: OrganizationValues) => {
    const loadingToast = toast.loading(t('dashboard.organization.settings.updating'))
    try {
      await updateOrganization(org.id, values, access_token)
      // Also save footer text
      await updateOrgFooterTextConfig(org.id, footerText, access_token)
      // Save the email sender display name (name only — the sending address is
      // always the platform's)
      await updateOrgEmailSenderNameConfig(org.id, emailSenderName, access_token)
      // Save default language
      await updateOrgDefaultLanguageConfig(org.id, defaultLanguage, access_token)
      await revalidateTags(['organizations'], org.slug)
      queryClient.invalidateQueries({ queryKey: queryKeys.org.detail(org.slug) })
      track(AnalyticsEvent.OrgGeneralSettingsUpdated, { default_language: defaultLanguage })
      toast.success(t('dashboard.organization.settings.update_success'), { id: loadingToast })
    } catch (_err) {
      toast.error(t('dashboard.organization.settings.update_error'), { id: loadingToast })
    }
  }

  return (
    <div className="sm:mx-10 mx-0 bg-white rounded-xl nice-shadow ">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            setSubmitting(false)
            updateOrg(values)
          }, 400)
        }}
      >
        {({ isSubmitting, values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <div className="flex flex-col gap-0">
              <div className="flex flex-col bg-gray-50 -space-y-1 px-5 py-3 mx-3 my-3 rounded-md">
                <h1 className="font-bold text-xl text-gray-800">
                  {t('dashboard.organization.settings.title')}
                </h1>
                <h2 className="text-gray-500 text-md">
                  {t('dashboard.organization.settings.subtitle')}
                </h2>
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-8 mt-0 mx-5 my-5">
                <div className="w-full space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">
                        {t('dashboard.organization.settings.name')}
                        <span className="text-gray-500 text-sm ms-2">
                          ({60 - (values.name?.length || 0)} characters left)
                        </span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder={t('dashboard.organization.settings.name_placeholder')}
                        maxLength={60}
                      />
                      {touched.name && errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">
                        {t('dashboard.organization.settings.short_description')}
                        <span className="text-gray-500 text-sm ms-2">
                          ({100 - (values.description?.length || 0)} characters left)
                        </span>
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        placeholder={t('dashboard.organization.settings.short_description_placeholder')}
                        maxLength={100}
                      />
                      {touched.description && errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="label">{t('dashboard.organization.settings.label')}</Label>
                      <Select
                        value={values.label}
                        onValueChange={(value) => setFieldValue('label', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('dashboard.organization.settings.label_placeholder')}>
                            {(() => {
                              const selected = ORG_LABELS.find((item) => item.value === values.label)
                              return selected ? `${selected.emoji} ${t(selected.labelKey, { defaultValue: selected.fallback })}` : undefined
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ORG_LABELS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.emoji} {t(type.labelKey, { defaultValue: type.fallback })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touched.label && errors.label && (
                        <p className="text-red-500 text-sm mt-1">{errors.label}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="about">
                        {t('dashboard.organization.settings.about')}
                        <span className="text-gray-500 text-sm ms-2">
                          ({400 - (values.about?.length || 0)} characters left)
                        </span>
                      </Label>
                      <Textarea
                        id="about"
                        name="about"
                        value={values.about}
                        onChange={handleChange}
                        placeholder={t('dashboard.organization.settings.about_placeholder')}
                        className="min-h-[250px]"
                        maxLength={400}
                      />
                      {touched.about && errors.about && (
                        <p className="text-red-500 text-sm mt-1">{errors.about}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="footerText">
                        {t('dashboard.organization.settings.footer_text')}
                        <span className="text-gray-500 text-sm ms-2">
                          ({100 - (footerText?.length || 0)} characters left)
                        </span>
                      </Label>
                      <Input
                        id="footerText"
                        name="footerText"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder={t('dashboard.organization.settings.footer_text_placeholder')}
                        maxLength={100}
                      />
                      <p className="text-gray-500 text-sm mt-1">{t('dashboard.organization.settings.footer_text_desc')}</p>
                    </div>

                    <div>
                      <Label htmlFor="emailSenderName">
                        {t('dashboard.organization.settings.email_sender_name', { defaultValue: 'E-posta Gönderici Adı' })}
                        <span className="text-gray-500 text-sm ms-2">
                          ({MAX_EMAIL_SENDER_NAME_LENGTH - (emailSenderName?.length || 0)} {t('common.characters_left', { defaultValue: 'karakter kaldı' })})
                        </span>
                      </Label>
                      <Input
                        id="emailSenderName"
                        name="emailSenderName"
                        value={emailSenderName}
                        onChange={(e) => setEmailSenderName(e.target.value)}
                        placeholder={t('dashboard.organization.settings.email_sender_name_placeholder', { defaultValue: 'Okulunuzun / Kurumunuzun Adı' })}
                        maxLength={MAX_EMAIL_SENDER_NAME_LENGTH}
                      />
                      <p className="text-gray-500 text-sm mt-1">{t('dashboard.organization.settings.email_sender_name_desc', { defaultValue: 'Bu okul için gönderilen e-postalarda alıcıların göreceği isim.' })}</p>
                    </div>

                    <div>
                      <Label htmlFor="defaultLanguage">
                        {t('dashboard.organization.settings.default_language')}
                      </Label>
                      <Select
                        value={defaultLanguage}
                        onValueChange={setDefaultLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="flex items-center space-x-2">
                                <span className="text-xs font-mono text-gray-400 w-6">{lang.code.toUpperCase()}</span>
                                <span>{lang.nativeName}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-gray-500 text-sm mt-1">{t('dashboard.organization.settings.default_language_desc')}</p>
                    </div>

                    {/* Eğitici Oyunlar Menüsü Görünürlüğü */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <Label htmlFor="gamesEnabled" className="font-bold text-gray-900 cursor-pointer">
                          Eğitici Oyunlar Menüsü
                        </Label>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Öğretmen ve öğrenciler için üst menüde ve mobilde "Oyunlar" mağazasının görünmesini sağlar.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="gamesEnabled"
                        checked={gamesEnabled}
                        onChange={(e) => {
                          setGamesEnabled(e.target.checked)
                          toast.success(e.target.checked ? 'Oyunlar menüsü aktif edildi' : 'Oyunlar menüsü gizlendi')
                        }}
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                      />
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex flex-row-reverse mt-0 mx-5 mb-5">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isSubmitting ? t('dashboard.organization.settings.saving') : t('dashboard.organization.settings.save_changes')}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default OrgEditGeneral
