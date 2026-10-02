'use client'

import React from 'react'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import Link from 'next/link'
import { getUriWithOrg } from '@services/config/config'
import { useTranslation } from 'react-i18next'
import {
  ChalkboardSimple,
  FolderSimple,
  ChatsCircle,
  Cube,
  Headphones,
  Files,
  ArrowRight,
  Sparkle,
  Users,
  SignIn,
  PlusCircle,
  GraduationCap,
  Timer,
  PencilLine,
  ArrowsHorizontal,
  Planet,
  Target,
  GlobeHemisphereWest,
  DeviceMobile,
  CheckCircle,
  Lightning,
  RocketLaunch,
} from '@phosphor-icons/react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { useBoards } from '@/hooks/queries/useBoards'
import { usePlaygrounds } from '@/hooks/queries/usePlaygrounds'
import { getBoardThumbnailMediaDirectory } from '@services/media/media'
import { SafeImage } from '@components/Objects/SafeImage'
import AuthenticatedClientElement from '@components/Security/AuthenticatedClientElement'

interface LandingClassicProps {
  courses?: any[]
  orgslug: string
  org_id: string | number
}

function LandingClassic({ orgslug, org_id }: LandingClassicProps) {
  const { t, i18n } = useTranslation()
  const isTr = i18n?.language?.startsWith('tr') !== false
  const session = useLHSession() as any
  const org = useOrg() as any
  const isAuthenticated = session?.status === 'authenticated'
  const user = session?.data?.user

  const { data: boardsData, isLoading: boardsLoading } = useBoards(Number(org_id))
  const boards: any[] = Array.isArray(boardsData) ? boardsData.filter((b: any) => b.public !== false) : []

  const { data: playgroundsData } = usePlaygrounds(Number(org_id))
  const playgrounds: any[] = Array.isArray(playgroundsData) ? playgroundsData : []

  // 6 Claude Educational Modules
  const featuredModules = [
    {
      key: 'reading',
      matchName: '1 Dk Okuma',
      title: '1 Dk Hızlı Okuma & Kelime Sayacı',
      description: 'Öğrencinin okuma hızını, dakikadaki kelime sayısını ve okuma akıcılığını canlı sayaçla ölçün.',
      badge: '1. Sınıf & Dil',
      badgeBg: 'bg-rose-100 text-rose-700',
      icon: Timer,
      color: 'text-rose-600',
      gradient: 'from-rose-500/10 via-orange-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-rose-50/40',
      border: 'hover:border-rose-300 hover:shadow-rose-100/50',
      iconBg: 'bg-rose-100 text-rose-600',
      tag: 'WPM & Canlı Süre',
    },
    {
      key: 'writing',
      matchName: 'Harf Çizgi',
      title: 'Harf Çizgi & Yazılış Yönü Atölyesi',
      description: 'MEB dik temel harf standartlarına uygun, numaralandırılmış oklar ve adım adım harf çizim animasyonu.',
      badge: 'MEB Standart',
      badgeBg: 'bg-amber-100 text-amber-800',
      icon: PencilLine,
      color: 'text-amber-600',
      gradient: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-amber-50/40',
      border: 'hover:border-amber-300 hover:shadow-amber-100/50',
      iconBg: 'bg-amber-100 text-amber-700',
      tag: 'Adım Adım Çizim',
    },
    {
      key: 'counting',
      matchName: 'Ritmik Sayma',
      title: 'Ritmik Sayma & Sayı Doğrusu Atölyesi',
      description: 'Elastik zıplayan sevimli maskot ve parabolik yay mekaniği ile 1’er, 2’şer, 5’er ve 10’ar ritmik sayma.',
      badge: 'Matematik & Sayılar',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      icon: ArrowsHorizontal,
      color: 'text-emerald-600',
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-emerald-50/40',
      border: 'hover:border-emerald-300 hover:shadow-emerald-100/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      tag: 'Zıplayan Maskot 🐸',
    },
    {
      key: 'solar',
      matchName: 'Güneş Sistemi',
      title: '3D Güneş Sistemi Simülasyonu',
      description: '3 boyutlu Güneş, 8 gezegen, Satürn halkaları, gerçekçi yüzey dokuları, 360° dokunmatik döndürme ve yakınlaşma.',
      badge: 'Uzay & Gezegenler',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      icon: Planet,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500/10 via-violet-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-indigo-50/40',
      border: 'hover:border-indigo-300 hover:shadow-indigo-100/50',
      iconBg: 'bg-indigo-100 text-indigo-700',
      tag: '3 Boyutlu Simülasyon',
    },
    {
      key: 'wheel',
      matchName: 'Sınıf Çarkı',
      title: 'Sınıf Çarkı & Geri Sayım Araçları',
      description: 'Sınıf içi rastgele öğrenci seçimi, soru kuraları ve ses efektli geri sayım zamanlayıcıları.',
      badge: 'Sınıf İçi Etkinlik',
      badgeBg: 'bg-purple-100 text-purple-800',
      icon: Target,
      color: 'text-purple-600',
      gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-purple-50/40',
      border: 'hover:border-purple-300 hover:shadow-purple-100/50',
      iconBg: 'bg-purple-100 text-purple-700',
      tag: 'Kura & Geri Sayım',
    },
    {
      key: 'english',
      matchName: 'İngilizce Kelime',
      title: 'İngilizce Kelime & Görsel Macera',
      description: 'Görsel flashcard kartları, telaffuz seslendirmeleri ve eğlenceli İngilizce kelime eşleştirme.',
      badge: 'Yabancı Dil',
      badgeBg: 'bg-sky-100 text-sky-800',
      icon: GlobeHemisphereWest,
      color: 'text-sky-600',
      gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
      cardBg: 'bg-gradient-to-br from-white to-sky-50/40',
      border: 'hover:border-sky-300 hover:shadow-sky-100/50',
      iconBg: 'bg-sky-100 text-sky-700',
      tag: 'Görsel Flashcard',
    },
  ]

  const getModuleLink = (matchName: string) => {
    if (!Array.isArray(playgrounds)) {
      return getUriWithOrg(orgslug, '/playgrounds')
    }
    const match = playgrounds.find((p: any) =>
      p?.name?.toLowerCase().includes(matchName.toLowerCase())
    )
    if (match) {
      return getUriWithOrg(orgslug, `/playground/${match.playground_uuid}`)
    }
    return getUriWithOrg(orgslug, '/playgrounds')
  }

  // School Core Portal Areas
  const portalModules = [
    {
      title: 'Sınıflar & Şubeler',
      description: 'Sınıf listeleri, 6 haneli katılım kodları ve şube mevcudu takibi',
      icon: GraduationCap,
      color: 'text-rose-600',
      bg: 'bg-rose-50 hover:bg-rose-100/70',
      badge: 'Sınıf Yönetimi',
      badgeBg: 'bg-rose-100 text-rose-700',
      href: '/dash/classrooms',
    },
    {
      title: 'Panolar ve Duyurular',
      description: 'Sınıf duyuruları, etkinlikler, akıllı tahta ve okul panoları',
      icon: ChalkboardSimple,
      color: 'text-rose-600',
      bg: 'bg-rose-50 hover:bg-rose-100/70',
      badge: 'Canlı Panolar',
      badgeBg: 'bg-rose-100 text-rose-700',
      href: '/boards',
    },
    {
      title: 'Ödevler ve Görevler',
      description: 'PDF görüntüleme, ses kaydı ve dosya yükleme destekli ödev takip sistemi',
      icon: Files,
      color: 'text-amber-600',
      bg: 'bg-amber-50 hover:bg-amber-100/70',
      badge: 'Ödev Takip',
      badgeBg: 'bg-amber-100 text-amber-700',
      href: '/dash/assignments',
    },
    {
      title: 'Kaynaklar & Kütüphane',
      description: 'Ders dokümanları, çalışma fasikülleri, testler ve PDF kitaplar',
      icon: FolderSimple,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100/70',
      badge: 'Ders Materyali',
      badgeBg: 'bg-blue-100 text-blue-700',
      href: '/library',
    },
    {
      title: 'Veli & Öğretmen Topluluğu',
      description: 'Veli ve öğretmen iletişim, dayanışma ve soru-cevap alanı',
      icon: ChatsCircle,
      color: 'text-violet-600',
      bg: 'bg-violet-50 hover:bg-violet-100/70',
      badge: 'İletişim & Forum',
      badgeBg: 'bg-violet-100 text-violet-700',
      href: '/communities',
    },
    {
      title: 'Sesli Yayınlar & Podcastler',
      description: 'Okul bültenleri, veli bilgilendirmeleri ve sesli ders özetleri',
      icon: Headphones,
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100/70',
      badge: 'Sesli Yayın',
      badgeBg: 'bg-orange-100 text-orange-700',
      href: '/podcasts',
    },
  ]

  return (
    <div className="w-full pb-20">
      <GeneralWrapperStyled>
        <div className="flex flex-col space-y-12">
          
          {/* ── Modern Hero Section ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-12 shadow-2xl border border-white/10">
            {/* Ambient Lighting Blobs */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-0 -ml-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/95 text-xs font-semibold backdrop-blur-md border border-white/15 mb-5 shadow-sm">
                <Sparkle size={15} weight="fill" className="text-amber-400 animate-pulse" />
                <span>Oxonom Edu • Akıllı Okul Portalı</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {org?.name || 'Oxonom Edu'}
              </h1>

              {/* Description */}
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                {org?.description ||
                  'Öğrenciler, öğretmenler ve veliler için 3D simülasyonlar, interaktif çalışma panoları, MEB uyumlu atölyeler ve yeni nesil ödev takip ekosistemi.'}
              </p>

              {/* Quick Action CTAs */}
              <div className="mt-8 flex items-center gap-3.5 flex-wrap">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={getUriWithOrg(orgslug, '/dash')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all shadow-md active:scale-95"
                    >
                      <span>Yönetim Paneli</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                    <Link
                      href={getUriWithOrg(orgslug, '/playgrounds')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all border border-white/15"
                    >
                      <Cube size={16} weight="fill" className="text-amber-400" />
                      <span>Modüllere Git</span>
                    </Link>
                    <Link
                      href={getUriWithOrg(orgslug, '/boards')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all border border-white/15"
                    >
                      <ChalkboardSimple size={16} weight="fill" className="text-rose-400" />
                      <span>Panolar</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={getUriWithOrg(orgslug, '/login')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                    >
                      <SignIn size={16} weight="bold" />
                      <span>Okul Girişi Yap</span>
                    </Link>
                    <Link
                      href={getUriWithOrg(orgslug, '/playgrounds')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all border border-white/15"
                    >
                      <Cube size={16} weight="fill" className="text-amber-400" />
                      <span>Modülleri Keşfet</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Status Pills Strip */}
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0" />
                  <span>6+ Canlı Modül</span>
                </div>
                <div className="flex items-center gap-2">
                  <DeviceMobile size={16} weight="fill" className="text-blue-400 shrink-0" />
                  <span>%100 Mobil Uyumlu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightning size={16} weight="fill" className="text-amber-400 shrink-0" />
                  <span>MEB Dik Temel Harf</span>
                </div>
                <div className="flex items-center gap-2">
                  <Planet size={16} weight="fill" className="text-purple-400 shrink-0" />
                  <span>3 Boyutlu Uzay Simülasyonu</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 1: Featured 6 Claude Educational Modules ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Cube size={18} weight="fill" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    Öne Çıkan Etkileşimli Modüller
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Müfredata uygun, akıllı tahta ve tabletlerde dokunmatik olarak çalışan zengin öğrenme araçları
                </p>
              </div>
              <Link
                href={getUriWithOrg(orgslug, '/playgrounds')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors shrink-0 group"
              >
                <span>Tüm Modülleri Gör ({playgrounds.length || 6})</span>
                <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredModules.map((module) => {
                const IconComponent = module.icon
                const targetHref = getModuleLink(module.matchName)

                return (
                  <Link
                    key={module.key}
                    href={targetHref}
                    className={`group relative rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${module.cardBg} ${module.border}`}
                  >
                    {/* Top ambient glow */}
                    <div className={`h-24 w-full bg-gradient-to-b ${module.gradient} absolute top-0 left-0 pointer-events-none`} />

                    <div className="p-5 relative z-10 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: Icon + Category Badge */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className={`p-3 rounded-2xl shadow-sm ${module.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                            <IconComponent size={24} weight="duotone" />
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${module.badgeBg}`}>
                            {module.badge}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {module.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {module.description}
                        </p>
                      </div>

                      {/* Bottom Footer Tag + CTA */}
                      <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-500 bg-black/5 px-2 py-0.5 rounded-md">
                          {module.tag}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                          <span>Modülü Aç</span>
                          <ArrowRight size={13} weight="bold" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Section 2: School Core Areas Bento Grid ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                    <ChalkboardSimple size={18} weight="fill" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    Okul Alanları ve Hızlı Erişim
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Ders materyalleri, panolar, veli forumu ve ödev sistemine doğrudan ulaşın
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portalModules.map((module) => {
                const IconComponent = module.icon
                return (
                  <Link
                    key={module.title}
                    href={getUriWithOrg(orgslug, module.href)}
                    className={`group p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 flex flex-col justify-between ${module.bg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-white shadow-sm ${module.color}`}>
                          <IconComponent size={22} weight="fill" />
                        </div>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${module.badgeBg}`}>
                          {module.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-indigo-600">
                      <span>Alana Git</span>
                      <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Section 3: Active School Boards & Announcements Preview ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <RocketLaunch size={18} weight="fill" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    Güncel Panolar ve Duyurular
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Okul ve sınıflar için aktif çalışma ve duyuru panoları
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AuthenticatedClientElement
                  ressourceType="boards"
                  action="create"
                  checkMethod="roles"
                  orgId={org_id}
                >
                  <Link
                    href={getUriWithOrg(orgslug, '/dash/boards?new=true')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/50"
                  >
                    <PlusCircle size={14} weight="bold" />
                    <span>Yeni Pano</span>
                  </Link>
                </AuthenticatedClientElement>
                <Link
                  href={getUriWithOrg(orgslug, '/boards')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Tüm Panolar &rarr;
                </Link>
              </div>
            </div>

            {boardsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-xl mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                  <ChalkboardSimple size={28} weight="duotone" className="text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Henüz yayınlanmış pano bulunmuyor</h3>
                <p className="text-xs text-gray-400 max-w-sm mb-4">
                  Okul yönetimi ve öğretmenler panolar oluşturarak duyuruları ve ders içeriklerini burada paylaşabilir.
                </p>
                <Link
                  href={getUriWithOrg(orgslug, '/boards')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  <ChalkboardSimple size={14} weight="bold" />
                  <span>Panolar Sayfasına Git</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {boards.slice(0, 8).map((board: any) => {
                  const thumbnail = board.thumbnail_image
                    ? getBoardThumbnailMediaDirectory(org?.org_uuid, board.board_uuid, board.thumbnail_image)
                    : null
                  return (
                    <Link
                      key={board.board_uuid}
                      href={getUriWithOrg(orgslug, `/board/${board.board_uuid}`)}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
                    >
                      <div className="h-32 bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 overflow-hidden relative flex items-center justify-center">
                        {thumbnail ? (
                          <SafeImage
                            src={thumbnail}
                            alt={board.name}
                            width={300}
                            height={150}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ChalkboardSimple size={36} weight="duotone" className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />
                        )}
                        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-700 shadow-xs backdrop-blur-xs">
                          Pano
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                            {board.name}
                          </h4>
                          {board.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Users size={12} />
                            {board.member_count || 1} Katılımcı
                          </span>
                          <span className="text-rose-600 font-bold group-hover:underline">
                            Görüntüle &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </GeneralWrapperStyled>
    </div>
  )
}

export default LandingClassic
