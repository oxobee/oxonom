'use client'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, Mail, Ticket, UserPlus, X } from 'lucide-react'
import { useOrg } from '@components/Contexts/OrgContext'
import UserAvatar from '@components/Objects/UserAvatar'
import OpenSignUpComponent from './OpenSignup'
import InviteOnlySignUpComponent from './InviteOnlySignUp'
import { useRouter, useSearchParams } from 'next/navigation'
import { validateInviteCode } from '@services/organizations/invites'
import { joinOrg } from '@services/organizations/orgs'
import { getUriWithOrg } from '@services/config/config'
import { getErrorMessage } from '@services/utils/ts/errorMessage'
import { useTranslation } from 'react-i18next'
import AuthLayout from '@components/Auth/AuthLayout'
import FormLayout, {
  FormField,
} from '@components/Objects/StyledElements/Form/Form'
import * as Form from '@radix-ui/react-form'

interface SignUpClientProps {
  org: any
}

function SignUpClient(props: SignUpClientProps) {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const router = useRouter()
  const [joinMethod, setJoinMethod] = React.useState('open')
  const [inviteCode, setInviteCode] = React.useState('')
  const searchParams = useSearchParams()
  const inviteCodeParam = searchParams.get('inviteCode')

  const isAuthenticated = session.status === 'authenticated'
  // There is only an org to JOIN when we actually resolved one (a subdomain or an
  // invite). On the org-less apex (`learnhouse.io/signup`) props.org is null, so a
  // signed-in visitor has nothing to sign up for and no org to join → send them to
  // the hub instead of a broken "Join <nothing>" screen.
  const hasOrgToJoin = !!props.org

  useEffect(() => {
    if (isAuthenticated && !hasOrgToJoin) {
      router.replace('/home')
    }
  }, [isAuthenticated, hasOrgToJoin, router])

  useEffect(() => {
    // On the org-less apex (learn.io/signup) props.org is null — guard it and
    // fall back to open signup instead of crashing.
    if (props.org?.config) {
      const config = props.org?.config?.config
      const isV2 = config?.config_version?.startsWith('2')
      const signupMode = isV2
        ? config?.admin_toggles?.members?.signup_mode
        : config?.features?.members?.signup_mode
      setJoinMethod(signupMode || 'open')
    }
    if (inviteCodeParam) {
      setInviteCode(inviteCodeParam)
    }
  }, [props.org, inviteCodeParam])

  return (
    <AuthLayout
      org={props.org}
      welcomeText={t('auth.invited_to_join')}
      title={t('auth.image_title_signup', { defaultValue: 'Start teaching with LearnHouse.' })}
      subtitle={t('auth.image_subtitle_signup', {
        defaultValue: 'Create your account and launch your first course in minutes.',
      })}
    >
      {session.status === 'loading' && (
        // Don't flash the open/invite signup form while the session is still
        // resolving — a logged-in user would otherwise briefly see it.
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
          <Loader2 size={22} className="animate-spin text-black/30" />
        </div>
      )}
      {session.status !== 'loading' && (joinMethod === 'open' || searchParams.get('join_code')) &&
        (isAuthenticated ? (
          hasOrgToJoin ? (
            <LoggedInJoinScreen inviteCode={inviteCode} org={props.org} />
          ) : (
            // Signed in on the org-less apex — the effect above redirects to /home.
            <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
              <Loader2 size={22} className="animate-spin text-black/30" />
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
            <OpenSignUpComponent org={props.org} />
          </div>
        ))}
      {session.status !== 'loading' && joinMethod === 'inviteOnly' && !searchParams.get('join_code') &&
        (inviteCode ? (
          session.status === 'authenticated' ? (
            <LoggedInJoinScreen inviteCode={inviteCode} org={props.org} />
          ) : (
            <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
              <InviteOnlySignUpComponent inviteCode={inviteCode} org={props.org} />
            </div>
          )
        ) : (
          <NoTokenScreen org={props.org} />
        ))}
    </AuthLayout>
  )
}

interface JoinScreenProps {
  inviteCode: string
  org: any
}

const LoggedInJoinScreen = ({ inviteCode, org }: JoinScreenProps) => {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const contextOrg = useOrg() as any
  const activeOrg = contextOrg || org
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const router = useRouter()
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current)
  }, [])

  const join = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    setShowMessage(false)

    try {
      const res = await joinOrg(
        { org_id: activeOrg.id, user_id: session?.data?.user?.user_uuid, invite_code: inviteCode },
        null,
        session.data?.tokens?.access_token
      )

      if (res.success) {
        setSuccess(typeof res.data === 'string' ? res.data : t('auth.join_organization_success'))
        setShowMessage(true)
        // Refresh session so the new org membership appears in session.data.roles
        await session.update?.(true)
        redirectTimeoutRef.current = setTimeout(() => {
          router.push(getUriWithOrg(activeOrg.slug, '/'))
        }, 2000)
      } else {
        setError(getErrorMessage(res.data?.detail, t('common.something_went_wrong')))
        setShowMessage(true)
      }
    } catch (err) {
      // A network/session throw must not leave the button spinning forever.
      setError(getErrorMessage((err as any)?.detail, t('common.something_went_wrong')))
      setShowMessage(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Message Top Bar */}
      {showMessage && (error || success) && (
        <div className={`
          mx-6 md:mx-12 lg:mx-20 mt-6 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200
          ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}
        `}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {error ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle size={18} className="shrink-0" />}
            <span className="text-sm font-medium">{error || success}</span>
          </div>
          <button
            onClick={() => setShowMessage(false)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-[420px] py-10">
          {/* Header */}
          <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">{t('auth.join_organization')}</h1>
          <p className="mt-2 text-black/45 text-[15px] font-medium">{t('auth.join_organization_desc')}</p>

          {/* Join Card */}
          <div className="mt-8 flex flex-col items-center gap-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <UserAvatar rounded="rounded-xl" border="border-2" width={48} />
              <div>
                <p className="font-semibold text-black">{session.data?.user?.first_name} {session.data?.user?.last_name}</p>
                <p className="text-sm text-black/45">@{session.data?.user?.username}</p>
              </div>
            </div>

            {/* Organization Info */}
            <div className="w-full text-center py-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-black/45 mb-1">{t('auth.joining')}</p>
              <p className="font-semibold text-black text-lg">{activeOrg?.name}</p>
            </div>

            {/* Join Button or Verification Warning */}
            {session.data?.user?.email_verified === false ? (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <Mail size={24} className="mx-auto mb-2 text-amber-600" />
                <p className="font-semibold text-amber-800 mb-1">{t('auth.email_verification_required')}</p>
                <p className="text-sm text-amber-700">{t('auth.email_verification_required_join')}</p>
              </div>
            ) : (
              <button
                onClick={join}
                disabled={isSubmitting}
                className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none transition-all disabled:opacity-50 gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    {t('auth.join_organization')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

interface NoTokenScreenProps {
  org: any
}

const NoTokenScreen = ({ org }: NoTokenScreenProps) => {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const contextOrg = useOrg() as any
  const activeOrg = contextOrg || org
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMessage, setShowMessage] = useState(false)

  const validateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    // No org context (e.g. the org-less apex) → there is nothing to validate an
    // invite against. Guard the undefined org id instead of silently failing.
    if (!activeOrg?.id) {
      setError(t('auth.invite_code_invalid'))
      setShowMessage(true)
      return
    }
    // A whitespace-only code isn't a real invite — treat it as empty.
    const trimmedCode = inviteCode.trim()
    if (!trimmedCode) {
      setError(t('auth.invite_code_invalid'))
      setShowMessage(true)
      return
    }
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    setShowMessage(false)

    try {
      // 1. First check if it's a student classroom join code (OX-XXXX)
      const cleanCode = trimmedCode.toUpperCase()
      const classRes = await fetch(`/api/v1/usergroups/verify-code/${encodeURIComponent(cleanCode)}`)
      if (classRes.ok) {
        const classData = await classRes.json()
        setSuccess(`Sınıf Bulundu: ${classData.usergroup_name} (${classData.grade_level || 'Sınıf'}). Kayda yönlendiriliyorsunuz...`)
        setShowMessage(true)
        setTimeout(() => {
          router.push(`/signup?join_code=${cleanCode}`)
        }, 1200)
        return
      }

      // 2. Otherwise validate as org invite code
      const res = await validateInviteCode(activeOrg.id, trimmedCode, session?.data?.tokens?.access_token)

      if (res.success) {
        setSuccess(t('auth.invite_code_valid'))
        setShowMessage(true)
        setTimeout(() => {
          router.push(`/signup?inviteCode=${trimmedCode}`)
        }, 1500)
      } else {
        setError(getErrorMessage(res.data?.detail, 'Geçersiz davet veya sınıf kodu'))
        setShowMessage(true)
      }
    } catch (err) {
      setError(getErrorMessage((err as any)?.detail, 'Geçersiz davet veya sınıf kodu'))
      setShowMessage(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Message Top Bar */}
      {showMessage && (error || success) && (
        <div className={`
          mx-6 md:mx-12 lg:mx-20 mt-6 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200
          ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}
        `}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {error ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle size={18} className="shrink-0" />}
            <span className="text-sm font-medium">{error || success}</span>
          </div>
          <button
            onClick={() => setShowMessage(false)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 opacity-60 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-[420px] py-10">
          {/* Header */}
          <h1 className="text-[28px] md:text-[32px] font-black text-black tracking-tight leading-tight">{t('auth.invite_required')}</h1>
          <p className="mt-2 text-black/45 text-[15px] font-medium">{t('auth.invite_required_desc', { org: activeOrg?.name })}</p>

          {/* Invite / Class Code Form */}
          <div className="mt-8">
            <FormLayout onSubmit={validateCode}>
              <FormField name="invite_code">
                <div className="flex items-center space-x-2 mb-1.5">
                  <Form.Label className="grow text-[13px] font-semibold text-black/70">Davet Kodu veya Sınıf Kodu (OX-XXXX)</Form.Label>
                </div>
                <Form.Control asChild>
                  <input
                    onChange={(e) => setInviteCode(e.target.value)}
                    value={inviteCode}
                    type="text"
                    placeholder="Örn: OX-1001 veya davet kodu"
                    required
                    className="box-border w-full bg-neutral-50 text-black rounded-lg px-4 border border-neutral-200 inline-flex h-[44px] appearance-none items-center focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all placeholder:text-black/25 text-sm uppercase"
                  />
                </Form.Control>
              </FormField>

              <Form.Submit asChild>
                <button
                  disabled={isSubmitting || !inviteCode.trim()}
                  className="box-border w-full inline-flex h-[44px] rounded-lg items-center justify-center bg-black hover:bg-black/85 text-white px-[15px] font-bold text-[14px] leading-none mt-2 transition-all disabled:opacity-50 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Ticket size={18} />
                      Kodu Doğrula ve Devam Et
                    </>
                  )}
                </button>
              </Form.Submit>
            </FormLayout>

            <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
              <p className="text-xs text-neutral-500 font-medium mb-3">Öğrenci misiniz? Sınıfınızın katılım kodunu girerek doğrudan kayıt olabilirsiniz.</p>
              <button
                type="button"
                onClick={() => router.push('/signup?join_code=true')}
                className="w-full inline-flex h-[42px] items-center justify-center rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition gap-1.5"
              >
                🎓 Öğrenci Kaydı Aç
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUpClient
