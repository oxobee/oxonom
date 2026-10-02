'use client'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { canManageOrgFromSession } from '@components/Hooks/useAdminStatus'
import { useLHAnalytics } from '@services/analytics/useLHAnalytics'
import { AnalyticsEvent } from '@services/analytics/events'
import DemoEntryCard from '@components/Objects/Demo/DemoEntryCard'
import UserAvatar from '@components/Objects/UserAvatar'
import { getAPIUrl, getUriWithOrg, getLEARNHOUSE_PLATFORM_URL_VAL } from '@services/config/config'
import { apiFetch } from '@services/utils/ts/requests'
import { signOut } from '@components/Contexts/AuthContext'
import OrgSquareLogo from '@components/Objects/Org/OrgSquareLogo'
import { deleteOrganizationFromBackend, leaveOrg } from '@services/organizations/orgs'
import {
  ChevronRight,
  Languages,
  Check,
  LogOut,
  Settings,
  LogIn,
  Plus,
  MoreVertical,
  CreditCard,
  Trash2,
  AlertTriangle,
  GraduationCap,
  KeyRound,
  Shield,
  Building2,
  Search,
  ArrowRight,
  Crown,
  Sparkles,
  School,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/lib/i18n'
import JoinClassModal from '@components/Dashboard/Classrooms/JoinClassModal'
import TcKimlikModal from '@components/Objects/TcKimlikModal'
import DemoClassSwitcher from '@components/Objects/DemoClassSwitcher'
import { getMyClasses } from '@services/usergroups/usergroups'
import { asArray } from '@services/utils/ts/requests'
import { CopyrightFooter } from '@components/Footers/LegalFooters'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import { AVAILABLE_LANGUAGES } from '@/lib/languages'

function HomeClient() {
  const { t, i18n } = useTranslation()
  const session = useLHSession() as any
  const router = useRouter()
  const access_token = session?.data?.tokens?.access_token
  const isAuthenticated = session?.status === 'authenticated'
  const isLoading = session?.status === 'loading'
  const platformUrl = getLEARNHOUSE_PLATFORM_URL_VAL()
  const queryClient = useQueryClient()
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false)
  const [isTcModalOpen, setIsTcModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Roles calculation
  const email = (session?.data?.user?.email || '').toLowerCase()
  const isSuperAdmin = session?.data?.user?.is_superadmin === true
  const roles: any[] = session?.data?.roles || []
  const isTeacher =
    email.includes('ogretmen') ||
    roles.some(
      (r: any) =>
        r?.role?.id === 3 ||
        r?.role?.name?.toLowerCase() === 'instructor' ||
        r?.role?.name?.toLowerCase() === 'teacher' ||
        r?.role?.name?.toLowerCase() === 'öğretmen'
    )
  const isAdmin =
    !email.includes('ogrenci') &&
    (isSuperAdmin ||
      email.includes('idare') ||
      email.includes('admin') ||
      roles.some(
        (r: any) =>
          r?.role?.id === 1 ||
          r?.role?.id === 2 ||
          r?.role?.name?.toLowerCase() === 'admin' ||
          r?.role?.name?.toLowerCase() === 'owner' ||
          r?.role?.name?.toLowerCase() === 'yönetici' ||
          r?.role?.rights?.organizations?.action_create === true
      ))
  const isStudent = !isAdmin && !isTeacher

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ['orgs', 'user'],
    queryFn: () => apiFetch(`${getAPIUrl()}orgs/user/page/1/limit/50`, access_token),
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // A brand-new staff user has no orgs yet — send them to create their first org.
  // A brand-new student is prompted to join a class by code instead.
  useEffect(() => {
    if (isAuthenticated && Array.isArray(orgs) && orgs.length === 0) {
      if (!isStudent) {
        router.replace('/new')
      } else {
        setIsJoinClassOpen(true)
      }
    }
  }, [isAuthenticated, orgs, router, isStudent])

  // Filter organizations by search
  const filteredOrgs = useMemo(() => {
    if (!Array.isArray(orgs)) return []
    if (!searchQuery.trim()) return orgs
    const q = searchQuery.toLowerCase().trim()
    return orgs.filter(
      (o: any) =>
        o?.name?.toLowerCase().includes(q) ||
        o?.slug?.toLowerCase().includes(q) ||
        o?.description?.toLowerCase().includes(q)
    )
  }, [orgs, searchQuery])

  const currentLangCode = (i18n.language || 'tr').split('-')[0].toUpperCase()

  // Profile-specific styling & headers
  const profileInfo = useMemo(() => {
    if (isSuperAdmin) {
      return {
        badge: '⚡ Platform Süper Admin',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        title: 'Okul Yönetim Portalı',
        subtitle: 'Sisteme bağlı tüm okulları denetleyin, yönetim panellerine geçin veya yeni bir okul ekleyin.',
      }
    }
    if (isAdmin) {
      return {
        badge: '🛡️ Okul Yöneticisi / İdare',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
        title: 'Okul Yönetim Portalı',
        subtitle: 'Yetkili olduğunuz okulları görüntüleyin, yönetim paneline erişin veya yeni bir okul ekleyin.',
      }
    }
    if (isTeacher) {
      return {
        badge: '👨‍🏫 Öğretmen Kadrosu',
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        title: 'Öğretmen Portalı',
        subtitle: 'Ders verdiğiniz sınıfları, akıllı tahta panolarınızı ve öğrenci yoklama listelerinizi yönetmek için okulunuzu seçin.',
      }
    }
    return {
      badge: '🎓 Öğrenci',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Öğrenci Portalı',
      subtitle: 'Derslerinize, akıllı tahtalarınıza ve ödevlerinize erişmek için okulunuzu seçin veya katılım kodu ile sınıfa kaydolun.',
    }
  }, [isSuperAdmin, isAdmin, isTeacher])

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] overflow-y-auto">
      <div className="relative min-h-screen pb-16">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)',
          }}
        />

        {/* Top Navbar */}
        <header className="relative z-10 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-950 text-white flex items-center justify-center shadow-xs">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                  Oxonom Edu
                </span>
                <span className="text-[11px] font-medium text-gray-600 mt-0.5">
                  Okul Yönetim & Eğitim Portalı
                </span>
              </div>
            </div>

            {/* Right Controls */}
            {isAuthenticated && (
              <div className="flex items-center gap-2.5">
                {/* T.C. Kimlik Doğrulama Button */}
                <button
                  type="button"
                  onClick={() => setIsTcModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition-colors shadow-2xs cursor-pointer"
                >
                  <Shield size={14} className="text-emerald-700" />
                  <span className="hidden sm:inline">T.C. Doğrulama</span>
                  <span className="sm:hidden">T.C.</span>
                </button>

                {/* Language Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer">
                      <Languages size={14} className="text-gray-500" />
                      <span>{currentLangCode}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 z-[200]" align="end">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-medium">
                      {t('common.language', { defaultValue: 'Dil Seçimi' })}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {AVAILABLE_LANGUAGES.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        onClick={() => {
                          try {
                            localStorage.setItem('i18nextLng_userPicked', '1')
                          } catch {}
                          changeLanguage(language.code)
                        }}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-medium">{language.nativeName}</span>
                        {i18n.language?.split('-')[0] === language.code && (
                          <Check size={14} className="text-gray-900" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 p-1.5 pe-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                      <UserAvatar border="border-2" rounded="rounded-full" width={28} />
                      <div className="flex flex-col text-start">
                        <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[120px]">
                          {session?.data?.user?.first_name || session?.data?.user?.username}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 z-[200]" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-gray-900">
                          {session?.data?.user?.first_name} {session?.data?.user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{session?.data?.user?.email}</p>
                        <span className={`inline-flex items-center w-fit mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${profileInfo.badgeBg}`}>
                          {profileInfo.badge}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isSuperAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 text-xs font-semibold text-amber-700 cursor-pointer">
                          <Crown size={14} />
                          <span>Süper Admin Paneli</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account/general" className="flex items-center gap-2 text-xs cursor-pointer">
                        <Settings size={14} />
                        <span>{t('common.settings', { defaultValue: 'Hesap Ayarları' })}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
                      className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>{t('user.sign_out', { defaultValue: 'Çıkış Yap' })}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          {/* Hero Welcome Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${profileInfo.badgeBg}`}>
                    {profileInfo.badge}
                  </span>
                  <span className="text-xs text-gray-600 font-medium">
                    {session?.data?.user?.email}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {profileInfo.title}
                </h1>
                <p className="mt-1.5 text-sm text-gray-700 max-w-xl leading-relaxed">
                  {profileInfo.subtitle}
                </p>
              </div>

              {/* Action Buttons for Management / Admin */}
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-xs"
                    >
                      <Crown size={15} className="text-amber-600" />
                      <span>Süper Admin Paneli</span>
                    </Link>
                  )}
                  <Link
                    href="/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <Plus size={15} className="text-white" />
                    <span>+ Yeni Okul Oluştur</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Student-Only Banner: Sınıf Seçici & Katılım Koduyla Katıl */}
            {isStudent && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                {/* 58 Classrooms Switcher specifically for Demo Student */}
                <DemoClassSwitcher />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-teal-50/60 border border-emerald-200/80">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-emerald-950">
                        Sınıf Katılım Kodu ile Katıl & Kimlik Doğrulama
                      </h2>
                      <p className="text-xs text-emerald-700/90 mt-0.5">
                        Öğretmeninizin size ilettiği 6 haneli kod ile sınıfınıza hemen katılın veya T.C. Kimlik ile kütük kaydınızı sorgulayın.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTcModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                    >
                      <Shield size={14} className="text-emerald-700" />
                      <span>T.C. Kimlik Sorgula</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsJoinClassOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0"
                    >
                      <KeyRound size={14} />
                      <span>Sınıf Kodu Gir</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Schools List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-gray-900">
                  {isAdmin ? 'Yönetiminizdeki Okullar' : isTeacher ? 'Görevli Olduğunuz Okullar' : 'Kayıtlı Okullarınız'}
                </h2>
                {Array.isArray(orgs) && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200/80 text-gray-700">
                    {orgs.length}
                  </span>
                )}
              </div>

              {/* Search Filter when multiple orgs exist */}
              {Array.isArray(orgs) && orgs.length > 2 && (
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Okul ara..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Loading skeletons */}
            {(isLoading || (isAuthenticated && orgsLoading)) && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full rounded-2xl bg-white border border-gray-200/60 p-4 animate-pulse flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-100 rounded" />
                      <div className="h-3 w-64 bg-gray-50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty States */}
            {!orgsLoading && isAuthenticated && Array.isArray(orgs) && orgs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <School size={28} />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {isAdmin ? 'Henüz Bir Okul Kaydınız Bulunmuyor' : 'Henüz Bir Sınıfa veya Okula Kayıtlı Değilsiniz'}
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm">
                  {isAdmin
                    ? 'Eğitim kurumunuzu hemen dijitalleştirmek ve sınıflarınızı oluşturmak için yeni bir okul ekleyin.'
                    : 'Öğretmeninizden aldığınız 6 haneli katılım kodu ile sınıfınıza anında dahil olabilirsiniz.'}
                </p>
                <div className="mt-5">
                  {isAdmin ? (
                    <Link
                      href="/new"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <Plus size={15} />
                      <span>Yeni Okul Oluştur</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsJoinClassOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <KeyRound size={15} />
                      <span>Sınıf Kodu Gir</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* School Cards Grid */}
            {!orgsLoading && filteredOrgs.length > 0 && (
              <div className="space-y-3">
                {filteredOrgs.map((org: any) => (
                  <OrgRow
                    key={org.id ?? org.slug}
                    org={org}
                    access_token={access_token}
                    isStudent={isStudent}
                    isAdmin={isAdmin}
                    isTeacher={isTeacher}
                  />
                ))}
              </div>
            )}

            {/* No search results */}
            {!orgsLoading && Array.isArray(orgs) && orgs.length > 0 && filteredOrgs.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
                Aramanızla eşleşen bir okul bulunamadı.
              </div>
            )}

            {/* Demo Sandbox Entry */}
            {isAuthenticated && (
              <div className="pt-2">
                <DemoEntryCard />
              </div>
            )}
          </div>

          {/* Join Class Modal for Students */}
          <JoinClassModal
            isOpen={isJoinClassOpen}
            onClose={() => setIsJoinClassOpen(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['orgs', 'user'] })
              queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            }}
          />

          {/* TC Kimlik Verification Modal */}
          <TcKimlikModal
            isOpen={isTcModalOpen}
            onClose={() => setIsTcModalOpen(false)}
          />

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <span>Altyapı:</span>
              <span className="font-bold tracking-tight text-gray-800">Oxonom Edu</span>
            </div>
            <CopyrightFooter year={new Date().getFullYear()} className="mt-3 pt-0" />
          </div>
        </main>
      </div>
    </div>
  )
}

function OrgRow({
  org,
  access_token,
  isStudent,
  isAdmin,
  isTeacher,
}: {
  org: any
  access_token: string
  isStudent?: boolean
  isAdmin?: boolean
  isTeacher?: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const orgSession = useLHSession() as any
  const { track } = useLHAnalytics('hub')
  const canManageOrg = canManageOrgFromSession(orgSession, org?.id)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const initial = (org.name || org.slug || '?').trim().charAt(0).toUpperCase()
  const canDelete = confirmText.trim() === org.slug

  const { data: rawMyClasses } = useQuery({
    queryKey: ['my-classes', org?.id],
    queryFn: () => getMyClasses(org.id, access_token),
    enabled: !!(org?.id && access_token && isStudent),
  })
  const myClasses = asArray<any>(rawMyClasses)

  const handleDelete = async () => {
    if (!canDelete || deleting) return
    setDeleting(true)
    setError(null)
    track(AnalyticsEvent.OrgDeleteInitiated, { slug: org.slug })
    try {
      await deleteOrganizationFromBackend(org.id, access_token)
      track(AnalyticsEvent.OrgDeleted, { slug: org.slug })
      await queryClient.invalidateQueries({ queryKey: ['orgs', 'user'] })
      setConfirmOpen(false)
      setConfirmText('')
    } catch {
      setError(
        t('common.delete_organization_error', {
          defaultValue: 'Bu okul silinemedi. Lütfen tekrar deneyiniz.',
        })
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleLeave = async () => {
    if (leaving) return
    setLeaving(true)
    setError(null)
    try {
      await leaveOrg(org.id, access_token)
      await queryClient.invalidateQueries({ queryKey: ['orgs', 'user'] })
      setLeaveOpen(false)
    } catch (e: any) {
      setError(
        e?.data?.detail ||
          t('common.leave_organization_error', {
            defaultValue: 'Okuldan ayrılınamadı. Lütfen tekrar deneyin.',
          })
      )
    } finally {
      setLeaving(false)
    }
  }

  const destinationHref = (isAdmin || isTeacher)
    ? `/orgs/${org.slug}/dash`
    : `/orgs/${org.slug}`

  const isPrimary = org.slug === 'neclagorer' || org.id === 10
  const gradeLabel = isPrimary ? '1 - 4. Sınıflar (İlkokul)' : '5 - 8. Sınıflar (Ortaokul)'
  const branchCount = isPrimary ? '28 Şube' : '30 Şube'
  const teacherCount = isPrimary ? '28 Sınıf Öğretmeni' : '30 Branş Öğretmeni'

  return (
    <div className="relative flex flex-col p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all group">
      {/* Clickable Area */}
      <Link href={destinationHref} className="flex items-center w-full min-w-0">
        {/* School Logo */}
        <div className="w-13 h-13 rounded-2xl bg-gray-50 border border-gray-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-xs group-hover:border-gray-300 transition-colors">
          <OrgSquareLogo
            org={org}
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-extrabold text-lg">
                {initial}
              </div>
            }
          />
        </div>

        {/* School Details */}
        <div className="ms-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-gray-900 text-base tracking-tight truncate group-hover:text-black transition-colors">
              {org.name}
            </span>
            <span className="shrink-0 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
              {gradeLabel}
            </span>
            {isAdmin && (
              <span className="shrink-0 rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                Yönetici Erişimi
              </span>
            )}
          </div>

          {/* Subtitle / Classes description */}
          {isStudent && myClasses && myClasses.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[11px] font-semibold text-gray-600">Kayıtlı Sınıfınız:</span>
              {myClasses.map((cls: any) => (
                <span
                  key={cls.id}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg"
                >
                  <GraduationCap size={12} className="text-emerald-600" />
                  <span>{cls.name}</span>
                </span>
              ))}
            </div>
          ) : org.description ? (
            <p className="text-xs text-gray-600 truncate mt-1">{org.description}</p>
          ) : (
            <p className="text-xs text-gray-600 font-mono truncate mt-1">{org.slug}</p>
          )}
        </div>

        {/* Action button indicator */}
        <div className="ms-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/60 text-xs font-bold text-gray-700 group-hover:bg-gray-900 group-hover:text-white group-hover:border-transparent transition-all shrink-0">
          <span>{isAdmin || isTeacher ? 'Yönetim Paneli' : 'Giriş Yap'}</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Sub-navigation Chips */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
        <Link
          href={`/orgs/${org.slug}/dash/classrooms`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>{branchCount}</span>
        </Link>
        <Link
          href={`/orgs/${org.slug}/dash/teachers`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>{teacherCount}</span>
        </Link>
        <Link
          href={`/orgs/${org.slug}/dash/assignments`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>Ödevler & Takip</span>
        </Link>
        <Link
          href={`/orgs/${org.slug}/boards`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>Akıllı Tahtalar</span>
        </Link>
        <Link
          href={`/orgs/${org.slug}/dash/students`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>Öğrenci Kütüğü</span>
        </Link>
      </div>

      {/* Admin 3-dots actions menu */}
      {!isStudent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t('common.org_actions', { defaultValue: 'Okul İşlemleri' })}
              className="ms-2 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 z-[200]" align="end">
            {canManageOrg && (
              <DropdownMenuItem asChild>
                <Link href={`/billing?org=${org.slug}`} className="flex items-center gap-2 text-xs cursor-pointer">
                  <CreditCard size={14} />
                  <span>Plan & Faturalandırma</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href={getUriWithOrg(org.slug, '/dash/org/settings/general')}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <Settings size={14} />
                <span>Okul Ayarları</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canManageOrg ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setError(null)
                  setConfirmText('')
                  setConfirmOpen(true)
                }}
                className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Okulu Sil</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setError(null)
                  setLeaveOpen(true)
                }}
                className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Okuldan Ayrıl</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (deleting) return
          setConfirmOpen(open)
          if (!open) {
            setConfirmText('')
            setError(null)
          }
        }}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 text-red-600 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <DialogTitle>
                Okulu Kalıcı Olarak Sil
              </DialogTitle>
            </div>
            <DialogDescription className="mt-3 text-xs text-gray-500">
              Bu işlem <strong>{org.name}</strong> okulunu ve tüm sınıflarını, öğrencilerini ve verilerini kalıcı olarak siler. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Onaylamak için <span className="font-mono font-bold text-gray-900">{org.slug}</span> yazınız:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={org.slug}
              autoComplete="off"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>

          <DialogFooter className="mt-5 gap-2">
            <button
              type="button"
              onClick={() => {
                if (deleting) return
                setConfirmOpen(false)
                setConfirmText('')
                setError(null)
              }}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {deleting ? 'Siliniyor...' : 'Okulu Sil'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirmation dialog */}
      <Dialog
        open={leaveOpen}
        onOpenChange={(open) => {
          if (leaving) return
          setLeaveOpen(open)
          if (!open) setError(null)
        }}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 text-red-600 shrink-0">
                <LogOut size={16} />
              </div>
              <DialogTitle className="text-base">
                Okuldan Ayrılmak İstediğinize Emin Misiniz?
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-xs text-gray-500 mt-2">
            {org.name || org.slug} okulundan ayrılacaksınız ve üyelik yetkileriniz sonlandırılacaktır.
          </p>
          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
          <DialogFooter className="mt-5 gap-2">
            <button
              onClick={() => setLeaveOpen(false)}
              disabled={leaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {leaving ? 'Ayrılınıyor...' : 'Okuldan Ayrıl'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HomeClient
