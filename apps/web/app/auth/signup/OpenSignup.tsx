'use client'
import { useFormik } from 'formik'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import FormLayout, {
  FormField,
} from '@components/Objects/StyledElements/Form/Form'
import * as Form from '@radix-ui/react-form'
import { AlertTriangle, Info, Mail, User, GraduationCap, Check, Sparkles, Phone, Plus, Trash2, Building, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { signup, resendVerificationEmail } from '@services/auth/auth'
import { useOrg } from '@components/Contexts/OrgContext'
import { signIn } from '@components/Contexts/AuthContext'
import { getLEARNHOUSE_TOP_DOMAIN_VAL, isOnCustomDomain, getAPIUrl } from '@services/config/config'
import { getErrorMessage } from '@services/utils/ts/errorMessage'
import { useTranslation } from 'react-i18next'
import { PasswordStrengthIndicator, validatePasswordStrength } from '@components/Auth/PasswordStrengthIndicator'
import TurnstileWidget, { useTurnstileRequired, type TurnstileWidgetHandle } from '@components/Auth/TurnstileWidget'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { getAllowedAuthMethods } from '@services/auth/authMethods'
import CustomSignupFields, {
  initialCustomFieldValues,
  validateCustomFields,
} from '@components/Auth/CustomSignupFields'
import { readSignupFields, type SignupFieldItem } from '@services/settings/org'
import { validateTcKimlik, lookupTcRecord } from '@services/demo/schoolDirectory'
import TcKimlikModal from '@components/Objects/TcKimlikModal'
import toast from 'react-hot-toast'

const validate = (values: any, t: any, customFields: SignupFieldItem[]) => {
  const errors: any = {}

  if (!values.email) {
    errors.email = t('validation.required')
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = t('validation.invalid_email')
  }

  if (!values.password) {
    errors.password = t('validation.required')
  } else {
    const passwordValidation = validatePasswordStrength(values.password)
    if (!passwordValidation.isValid) {
      errors.password = t('auth.password_requirements_not_met')
    }
  }

  if (!values.username) {
    errors.username = t('validation.required')
  } else if (values.username.length < 4) {
    errors.username = t('validation.username_min_length')
  }

  // Bio is optional - no validation required

  // The org's admin-defined fields. Client-side only; the server revalidates.
  const customFieldErrors = validateCustomFields(customFields, values.custom_fields, t)
  if (Object.keys(customFieldErrors).length > 0) {
    errors.custom_fields = customFieldErrors
  }

  return errors
}

interface OpenSignUpComponentProps {
  // On the org-less apex the OrgContext is empty, so the signup page resolves
  // the instance default org server-side and passes it down here. Prefer it over
  // the (possibly null) context so the POST always targets a real org_id.
  org?: any
}

function OpenSignUpComponent({ org: propOrg }: OpenSignUpComponentProps = {}) {
  const { t } = useTranslation()
  const { track } = useLHAnalytics('public')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const contextOrg = useOrg() as any
  const org = (contextOrg && (contextOrg.id || contextOrg.slug)) ? contextOrg : propOrg
  const _router = useRouter()
  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState<{ email_verified: boolean } | null>(null)
  const [resendState, setResendState] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const turnstileRef = React.useRef<TurnstileWidgetHandle>(null)
  const turnstileRequired = useTurnstileRequired()

  // The org's allowed sign-in methods also govern how an account may be
  // created: minting a password account for an org that refuses password
  // sign-in produces an account that can never be used. The backend refuses
  // both, so offering them here would only surface a 403.
  const allowedMethods = React.useMemo(() => getAllowedAuthMethods(org), [org])
  const passwordAllowed = allowedMethods.has('password')
  const googleAllowed = allowedMethods.has('google')

  // Field definitions ship with the org config the page already loaded, so no
  // extra request is needed to render them.
  const customFields = React.useMemo<SignupFieldItem[]>(
    () => readSignupFields(org),
    [org],
  )

  // Sınıf Katılım Kodu (Oxonom Edu)
  const [joinCodeInput, setJoinCodeInput] = React.useState('')
  const [verifiedClass, setVerifiedClass] = React.useState<any>(null)
  const [verifyingCode, setVerifyingCode] = React.useState(false)
  const [codeError, setCodeError] = React.useState('')

  // Student Extra & Multi-Parent Information
  const [tcNo, setTcNo] = React.useState('')
  const [isTcModalOpen, setIsTcModalOpen] = React.useState(false)
  const [tcStatus, setTcStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle')
  const [tcError, setTcError] = React.useState('')

  const handleTcVerified = (record: any) => {
    if (!record) return
    setTcStatus('valid')
    setTcError('')
    if (record.first_name && !formik.values.first_name) formik.setFieldValue('first_name', record.first_name)
    if (record.last_name && !formik.values.last_name) formik.setFieldValue('last_name', record.last_name)
    if (record.motherName || record.fatherName) {
      setParents([
        { name: record.motherName || 'Ebru UĞURLU', relation: 'Anne', phone: '+90 532 999 1100', occupation: 'Mimar', email: '' },
        { name: record.fatherName || 'Uğur UĞURLU', relation: 'Baba', phone: '+90 532 999 2200', occupation: 'Yazılım Mühendisi', email: '' },
      ])
    }
  }

  const handleTcChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11)
    setTcNo(clean)
    if (clean.length === 11) {
      const check = validateTcKimlik(clean)
      if (!check.valid) {
        setTcStatus('invalid')
        setTcError(check.message || 'Geçersiz T.C. Kimlik No')
        setIsTcModalOpen(true)
      } else {
        setTcStatus('valid')
        setTcError('')
        const found = lookupTcRecord(clean)
        if (found) {
          handleTcVerified(found)
          toast.success(`✨ T.C. Kimlik Doğrulandı: ${found.name}`)
        }
      }
    } else {
      setTcStatus('idle')
      setTcError('')
    }
  }

  const [birthDate, setBirthDate] = React.useState('')
  const [bloodType, setBloodType] = React.useState('A Rh+')
  const [address, setAddress] = React.useState('')
  const [parents, setParents] = React.useState<any[]>([
    { name: '', relation: 'Anne', phone: '', occupation: '', email: '' },
  ])

  const handleAddParent = () => {
    setParents((prev) => [
      ...prev,
      { name: '', relation: 'Baba', phone: '', occupation: '', email: '' },
    ])
  }

  const handleRemoveParent = (idx: number) => {
    setParents((prev) => {
      const filtered = prev.filter((_, i) => i !== idx)
      return filtered.length > 0 ? filtered : [{ name: '', relation: 'Anne', phone: '', occupation: '', email: '' }]
    })
  }

  const handleParentChange = (idx: number, field: string, val: string) => {
    setParents((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: val }
      return copy
    })
  }

  const handleVerifyCode = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toUpperCase()
    if (!trimmed) {
      setVerifiedClass(null)
      setCodeError('')
      formik.setFieldValue('join_code', '')
      return
    }
    setVerifyingCode(true)
    setCodeError('')
    try {
      const res = await fetch(`${getAPIUrl()}usergroups/verify-code/${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        const data = await res.json()
        setVerifiedClass(data)
        setCodeError('')
        formik.setFieldValue('join_code', data.join_code)
      } else {
        const err = await res.json().catch(() => ({}))
        setVerifiedClass(null)
        formik.setFieldValue('join_code', '')
        setCodeError(err.detail || 'Geçersiz sınıf katılım kodu')
      }
    } catch {
      setVerifiedClass(null)
      setCodeError('Kod doğrulanamadı')
    } finally {
      setVerifyingCode(false)
    }
  }

  const formik = useFormik({
    initialValues: {
      org_slug: org?.slug,
      org_id: org?.id,
      email: '',
      password: '',
      username: '',
      bio: '',
      first_name: '',
      last_name: '',
      join_code: '',
      custom_fields: initialCustomFieldValues(customFields),
      turnstileToken: null as string | null,
    },
    validate: (values) => validate(values, t, customFields),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setError('')
      setMessage(null)
      if (tcNo.trim()) {
        const check = validateTcKimlik(tcNo.trim())
        if (!check.valid) {
          setTcStatus('invalid')
          setTcError(check.message || 'Geçersiz T.C. Kimlik Numarası.')
          setIsTcModalOpen(true)
          return
        }
      }
      setIsSubmitting(true)
      track(AnalyticsEvent.SignupSubmitted, { invite_code_present: false, has_bio: !!values.bio })
      try {
        let res = await signup(values)
        let message = await res.json().catch(() => ({}))
        if (res.status == 200) {
          track(AnalyticsEvent.SignupSucceeded, { email_verified: message.email_verified })
          setMessage(message)

          // Persist student record into oxonom_students so school management sees them immediately in Student Dossier
          try {
            const targetOrgId = verifiedClass?.org_id || org?.id || 1
            const storageKey = `oxonom_students_${targetOrgId}`
            const existingStr = localStorage.getItem(storageKey)
            const existingList = existingStr ? JSON.parse(existingStr) : []
            const newStudent = {
              id: Date.now(),
              studentNo: `2026-${Math.floor(100 + Math.random() * 900)}`,
              tcNo: tcNo.trim() || '—',
              name: `${values.first_name} ${values.last_name}`.trim() || values.username,
              email: values.email,
              gender: 'Kız',
              birthDate: birthDate.trim() || '2010',
              bloodType: bloodType || 'A Rh+',
              address: address.trim() || 'Adres bilgisi girilmedi',
              classroomId: verifiedClass?.usergroup_id || 1,
              classroomName: verifiedClass?.usergroup_name || 'Sınıf',
              mentorTeacher: 'Atanmadı',
              status: 'active',
              parentName: parents[0]?.name?.trim() || 'Veli Bilgisi',
              parentPhone: parents[0]?.phone?.trim() || '—',
              parentRelation: parents[0]?.relation || 'Veli',
              parentOccupation: parents[0]?.occupation?.trim() || 'Belirtilmedi',
              secondParentName: parents[1]?.name?.trim() || undefined,
              secondParentPhone: parents[1]?.phone?.trim() || undefined,
              parents: parents,
              emergencyContact: parents[0]?.name?.trim() || 'Veli',
              emergencyPhone: parents[0]?.phone?.trim() || '—',
              enrollmentDate: new Date().toLocaleDateString('tr-TR'),
              gpa: 85.0,
              attendanceRate: 100,
              excusedDays: 0,
              unexcusedDays: 0,
              assignmentsDone: 0,
              assignmentsTotal: 0,
              notes: `Sınıf Katılım Kodu (${verifiedClass?.join_code || values.join_code}) ile öğrenci kaydı oluşturuldu.`,
              disciplineStatus: 'Temiz Sicil',
              guidanceNotes: [
                {
                  id: `gn-${Date.now()}`,
                  date: new Date().toLocaleDateString('tr-TR'),
                  author: 'Sistem',
                  category: 'Akademik',
                  content: `${verifiedClass?.usergroup_name || 'Sınıf'} şubesine katılım koduyla kayıt yapıldı.`,
                },
              ],
              grades: [],
            }
            localStorage.setItem(storageKey, JSON.stringify([newStudent, ...existingList]))
          } catch (e) {
            console.error('Failed to sync student to local storage', e)
          }
        } else {
          // Surface the backend's actual error detail for ANY non-2xx
          track(AnalyticsEvent.SignupFailed, { status_code: res.status })
          const detail = message?.detail || ''
          if (typeof detail === 'string' && detail.toLowerCase().includes('already in use')) {
            setError('Bu e-posta adresi veya kullanıcı adı zaten kayıtlı. Lütfen mevcut hesabınızla giriş yapın.')
          } else {
            setError(getErrorMessage(message?.detail, t('common.something_went_wrong')))
          }
          turnstileRef.current?.reset()
        }
      } catch (err) {
        const detail = (err as any)?.detail || ''
        if (typeof detail === 'string' && detail.toLowerCase().includes('already in use')) {
          setError('Bu e-posta adresi veya kullanıcı adı zaten kayıtlı. Lütfen mevcut hesabınızla giriş yapın.')
        } else {
          setError(getErrorMessage((err as any)?.detail, t('common.something_went_wrong')))
        }
        turnstileRef.current?.reset()
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useEffect(() => { }, [org])

  // Honor a sanitized ?next / ?redirect destination through the
  // cross-domain /redirect_from_auth handoff; default to /home.
  const buildCallbackUrl = () => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('next') ?? params.get('redirect')
    const dest = raw && /^\/(?!\/)/.test(raw) ? raw : '/home'
    return `${window.location.origin}/redirect_from_auth?next=${encodeURIComponent(dest)}`
  }

  const handleGoogleSignIn = () => {
    track(AnalyticsEvent.SignupGoogleClicked)
    // Store org context in cookies before OAuth redirect
    if (org?.slug) {
      const topDomain = getLEARNHOUSE_TOP_DOMAIN_VAL();
      const isSecure = window.location.protocol === 'https:';
      const secureAttr = isSecure ? '; secure' : '';
      const baseAttributes = `; path=/; SameSite=Lax${secureAttr}`;
      // Host-only on custom domains (a .{platformTopDomain} cookie can't be set
      // from learn.acme.org → browser drops it → callback loses org context).
      const domainAttr = (topDomain === 'localhost' || isOnCustomDomain()) ? '' : `; domain=.${topDomain}`;
      document.cookie = `LH_oauth_orgslug=${org.slug}${baseAttributes}${domainAttr}`;
      document.cookie = `LH_oauth_org_id=${org.id}${baseAttributes}${domainAttr}`;
    }
    // Use absolute URL with current origin for custom domain support
    signIn('google', { callbackUrl: buildCallbackUrl() });
  };

  return (
    <div className="w-full max-w-[420px] py-10">
      {/* Header */}
      <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">{t('auth.create_account')}</h1>
      <p className="mt-2 text-black/45 text-[15px] font-medium">{t('auth.fill_in_details')}</p>

      <div className="mt-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50/90 rounded-2xl text-red-700 p-4 mb-6 border border-red-200 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div className="font-medium text-sm leading-relaxed">{error}</div>
            </div>
            {(error.includes('zaten kayıtlı') || error.toLowerCase().includes('already in use')) && (
              <div className="pt-2 border-t border-red-100 flex items-center justify-end">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <User size={13} />
                  <span>Mevcut Hesabınızla Giriş Yapın →</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {message && message.email_verified === false && (
          <div className="flex flex-col gap-4 bg-green-50 rounded-xl text-green-700 p-4 mb-6 border border-green-100">
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <div className="font-semibold text-sm">{t('auth.check_email_for_verification')}</div>
            </div>
            <p className="text-xs text-green-600">
              {t('auth.verification_email_sent_message')}
            </p>
            {/* Resend, so a user whose email doesn't arrive isn't stuck. */}
            {resendState === 'sent' ? (
              <p className="text-xs font-medium text-green-700">
                {t('auth.verification_email_resent', { defaultValue: 'Verification email sent again — check your inbox.' })}
              </p>
            ) : (
              <button
                type="button"
                disabled={resendState === 'sending'}
                onClick={async () => {
                  setResendState('sending')
                  // org?.id is undefined on the org-less apex — that's fine, the
                  // backend resends by email without an org.
                  const res = await resendVerificationEmail(formik.values.email, org?.id)
                  setResendState(res.success ? 'sent' : 'error')
                }}
                className="text-xs font-semibold text-green-800 hover:underline disabled:opacity-50 text-start w-fit"
              >
                {resendState === 'sending'
                  ? t('common.loading', { defaultValue: 'Sending…' })
                  : t('auth.resend_verification', { defaultValue: "Didn't get it? Resend email" })}
              </button>
            )}
            {resendState === 'error' && (
              <p className="text-xs text-red-500">{t('auth.resend_verification_failed', { defaultValue: 'Could not resend. Please try again shortly.' })}</p>
            )}
            <hr className="border-green-100" />
            <Link className="flex items-center gap-2 text-sm font-medium hover:underline" href="/login">
              <User size={14} />
              <span>{t('auth.login')}</span>
            </Link>
          </div>
        )}

        {message && message.email_verified && (
          <div className="flex flex-col gap-4 bg-green-50 rounded-xl text-green-700 p-4 mb-6 border border-green-100">
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <div className="font-semibold text-sm">{t('auth.account_created_success')}</div>
            </div>
            <hr className="border-green-100" />
            <Link className="flex items-center gap-2 text-sm font-medium hover:underline" href="/login">
              <User size={14} />
              <span>{t('auth.login')}</span>
            </Link>
          </div>
        )}

        {passwordAllowed && (
        <FormLayout onSubmit={formik.handleSubmit}>
          {/* Sınıf Katılım Kodu - Oxonom Edu Öğrenci Girişi */}
          <div className="mb-5 p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-purple-50/40">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-bold text-indigo-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Sınıf Katılım Kodu (Öğrenciler İçin)</span>
              </label>
              <span className="text-[11px] text-indigo-500 font-medium">Opsiyonel</span>
            </div>
            <p className="text-[12px] text-gray-500 mb-2">
              Öğretmeninizin paylaştığı 6 haneli kodu girerek doğrudan sınıfınıza bağlanabilirsiniz.
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Örn: OX-1001"
                value={joinCodeInput}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase()
                  setJoinCodeInput(val)
                  if (val.length >= 4) {
                    handleVerifyCode(val)
                  } else {
                    setVerifiedClass(null)
                    setCodeError('')
                    formik.setFieldValue('join_code', '')
                  }
                }}
                className="box-border w-full uppercase font-mono tracking-wider bg-white text-black rounded-lg px-4 border border-indigo-200 inline-flex h-[42px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 placeholder:normal-case placeholder:font-sans text-sm font-semibold"
              />
              {verifyingCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 animate-pulse">
                  Kontrol ediliyor...
                </div>
              )}
            </div>

            {/* Doğrulanmış Sınıf Rozeti */}
            {verifiedClass && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{verifiedClass.usergroup_name}</span>
                    {verifiedClass.grade_level && (
                      <span className="px-1.5 py-0.5 bg-emerald-200/60 rounded text-[10px] text-emerald-800">
                        {verifiedClass.grade_level}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-700 truncate">
                    {verifiedClass.org_name} • Kod: <span className="font-mono font-bold">{verifiedClass.join_code}</span>
                  </div>
                </div>
              </div>
            )}

            {codeError && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <Info size={12} />
                <span>{codeError}</span>
              </div>
            )}

            {/* Öğrenci Kimlik ve Çoklu Veli Bilgileri (Katılım Kodu veya İsteğe Bağlı) */}
            <div className="mt-4 pt-3 border-t border-indigo-100/80">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Öğrenci & Veli Bilgileri</span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Öğrenci Dosyası İçin</span>
              </div>

              <div className="space-y-3 bg-white/70 p-3 rounded-lg border border-indigo-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-600">T.C. Kimlik No</label>
                      <button
                        type="button"
                        onClick={() => setIsTcModalOpen(true)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                      >
                        T.C. Doğrula
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="11 haneli T.C. No"
                        value={tcNo}
                        onChange={(e) => handleTcChange(e.target.value)}
                        className={`w-full text-xs px-2.5 py-1.5 rounded-md border font-mono transition-colors focus:outline-none focus:ring-1 ${
                          tcStatus === 'valid'
                            ? 'border-emerald-400 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-500'
                            : tcStatus === 'invalid'
                            ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:ring-rose-500'
                            : 'border-gray-200 focus:ring-indigo-500'
                        }`}
                      />
                      {tcStatus === 'valid' && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold">
                          ✓ Onaylı
                        </span>
                      )}
                      {tcStatus === 'invalid' && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-rose-600 font-bold">
                          Geçersiz
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Doğum Tarihi</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Kan Grubu</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="A Rh+">A Rh+</option>
                      <option value="A Rh-">A Rh-</option>
                      <option value="B Rh+">B Rh+</option>
                      <option value="B Rh-">B Rh-</option>
                      <option value="AB Rh+">AB Rh+</option>
                      <option value="AB Rh-">AB Rh-</option>
                      <option value="0 Rh+">0 Rh+</option>
                      <option value="0 Rh-">0 Rh-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ev / İkametgah Adresi</label>
                    <input
                      type="text"
                      placeholder="Mahalle, Cadde, No, İlçe/İl"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Veli Bilgileri - Dinamik Çoklu Veli */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-bold text-gray-700 flex items-center gap-1">
                      <span>Veli / İletişim Bilgileri</span>
                      <span className="text-[10px] text-gray-400 font-normal">({parents.length} Veli Kayıtlı)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddParent}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Veli Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {parents.map((parent, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-gray-50/80 rounded-lg border border-gray-200/70 text-xs relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-gray-600 text-[11px]">
                            {pIdx + 1}. Veli Bilgisi
                          </span>
                          {parents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveParent(pIdx)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded"
                              title="Veliyi Kaldır"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">Yakınlık</label>
                            <select
                              value={parent.relation || 'Anne'}
                              onChange={(e) => handleParentChange(pIdx, 'relation', e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                            >
                              <option value="Anne">Anne</option>
                              <option value="Baba">Baba</option>
                              <option value="Vasi">Vasi</option>
                              <option value="Ağabey/Abla">Ağabey / Abla</option>
                              <option value="Diğer">Diğer</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-500 mb-0.5">Veli Adı Soyadı</label>
                            <input
                              type="text"
                              placeholder="Örn: Ayşe Yılmaz"
                              value={parent.name || ''}
                              onChange={(e) => handleParentChange(pIdx, 'name', e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded border border-gray-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">Telefon Numarası</label>
                            <input
                              type="tel"
                              placeholder="05XX XXX XX XX"
                              value={parent.phone || ''}
                              onChange={(e) => handleParentChange(pIdx, 'phone', e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded border border-gray-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-0.5">Meslek (İsteğe Bağlı)</label>
                            <input
                              type="text"
                              placeholder="Örn: Mühendis, Esnaf..."
                              value={parent.occupation || ''}
                              onChange={(e) => handleParentChange(pIdx, 'occupation', e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded border border-gray-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FormField name="email">
            <div className="flex items-center space-x-2 mb-1.5">
              <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('auth.email')}</Form.Label>
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-500 text-xs flex items-center space-x-1">
                  <Info size={11} />
                  <span>{formik.errors.email}</span>
                </span>
              )}
            </div>
            <Form.Control asChild>
              <input
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                type="email"
                required
                className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
              />
            </Form.Control>
          </FormField>

          <div className="flex flex-row space-x-2">
            <FormField name="first_name">
              <div className="flex items-center space-x-2 mb-1.5">
                <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('user.first_name')}</Form.Label>
                {formik.touched.first_name && formik.errors.first_name && (
                  <span className="text-red-500 text-xs flex items-center space-x-1">
                    <Info size={11} />
                    <span>{formik.errors.first_name}</span>
                  </span>
                )}
              </div>
              <Form.Control asChild>
                <input
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.first_name}
                  type="text"
                  className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
                />
              </Form.Control>
            </FormField>
            <FormField name="last_name">
              <div className="flex items-center space-x-2 mb-1.5">
                <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('user.last_name')}</Form.Label>
                {formik.touched.last_name && formik.errors.last_name && (
                  <span className="text-red-500 text-xs flex items-center space-x-1">
                    <Info size={11} />
                    <span>{formik.errors.last_name}</span>
                  </span>
                )}
              </div>
              <Form.Control asChild>
                <input
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.last_name}
                  type="text"
                  className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
                />
              </Form.Control>
            </FormField>
          </div>

          <FormField name="password">
            <div className="flex items-center space-x-2 mb-1.5">
              <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('auth.password')}</Form.Label>
              {formik.touched.password && formik.errors.password && (
                <span className="text-red-500 text-xs flex items-center space-x-1">
                  <Info size={11} />
                  <span>{formik.errors.password}</span>
                </span>
              )}
            </div>
            <Form.Control asChild>
              <input
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                type="password"
                autoComplete="new-password"
                required
                className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
              />
            </Form.Control>
            <PasswordStrengthIndicator password={formik.values.password} />
          </FormField>

          <FormField name="username">
            <div className="flex items-center space-x-2 mb-1.5">
              <Form.Label className="grow text-[13px] font-semibold text-black/70">{t('user.username')}</Form.Label>
              {formik.touched.username && formik.errors.username && (
                <span className="text-red-500 text-xs flex items-center space-x-1">
                  <Info size={11} />
                  <span>{formik.errors.username}</span>
                </span>
              )}
            </div>
            <Form.Control asChild>
              <input
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                type="text"
                required
                className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm"
              />
            </Form.Control>
          </FormField>

          <FormField name="bio">
            <div className="flex items-center space-x-2 mb-1.5">
              <Form.Label className="grow text-[13px] font-semibold text-black/70">{`${t('user.bio')} (${t('common.optional')})`}</Form.Label>
            </div>
            <Form.Control asChild>
              <textarea
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.bio}
                placeholder={t('user.bio_placeholder')}
                className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 py-3 border border-neutral-200 appearance-none focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm resize-none min-h-[80px]"
              />
            </Form.Control>
          </FormField>

          <CustomSignupFields fields={customFields} formik={formik} />

          <TurnstileWidget
            ref={turnstileRef}
            onToken={(token) => formik.setFieldValue('turnstileToken', token)}
            className="mt-2 flex justify-center"
          />

          <Form.Submit asChild>
            <button
              disabled={isSubmitting || !!message || (turnstileRequired && !formik.values.turnstileToken)}
              className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none mt-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </span>
              ) : (
                t('auth.create_account')
              )}
            </button>
          </Form.Submit>
        </FormLayout>
        )}

        {/* Divider — only earns its place between two sets of options. */}
        {passwordAllowed && googleAllowed && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 text-black/30 bg-white text-xs font-medium">{t('common.or')}</span>
            </div>
          </div>
        )}

        {/* Google Sign In */}
        {googleAllowed && (
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="flex justify-center items-center w-full bg-white hover:bg-neutral-50 text-black space-x-3 font-medium p-3 rounded-lg border border-neutral-200 transition-all text-sm disabled:opacity-50"
        >
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="" className="w-4 h-4" />
          <span>{t('auth.sign_in_with_google')}</span>
        </button>
        )}

        {!passwordAllowed && !googleAllowed && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 flex items-start gap-3">
            <Info size={16} className="shrink-0 mt-0.5 text-black/40" />
            <p className="text-sm text-black/60">
              {t('auth.no_sign_up_method_available', {
                defaultValue:
                  'This organization has restricted how members sign in, so accounts can’t be created here. Contact an administrator.',
              })}
            </p>
          </div>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-black/35 mt-6">
          {t('auth.already_have_account')}{' '}
          <Link href="/login" className="text-black font-semibold hover:underline">
            {t('auth.login')}
          </Link>
        </p>

        {/* T.C. Kimlik Verification Modal */}
        <TcKimlikModal
          isOpen={isTcModalOpen}
          onClose={() => setIsTcModalOpen(false)}
          initialTc={tcNo}
          onVerified={handleTcVerified}
        />
      </div>
    </div>
  )
}

export default OpenSignUpComponent
