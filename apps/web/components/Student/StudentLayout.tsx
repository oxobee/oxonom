'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  MessageSquare,
  Calendar,
  Settings,
  LayoutGrid,
  Sun,
  Moon,
  LogOut,
  X,
  Award,
  ChevronRight,
  ShieldCheck,
  User,
  Bell,
  Search,
  Flame,
  Gem,
  Crown,
} from 'lucide-react'
import { STUDENT_MENU_CONFIG, type StudentMenuItem } from '@/lib/student/studentMenuConfig'
import { signOut } from '@components/Contexts/AuthContext'
import {
  DEFAULT_STUDENT_PROFILE,
  getSynchronizedStudentProfile,
  type StudentProfile,
} from '@/lib/student/studentData'
import HeaderLiveClock from '@components/Common/HeaderLiveClock'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import OxonomPlusModal from '@components/Student/modals/OxonomPlusModal'

// Real 3D Owl Mascot Icon matching user's uploaded corporate mascot
export function OxoMascotIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/oxonom-hero-owl.png"
        alt="Oxonom Maskot"
        className="w-full h-full object-contain drop-shadow-md select-none"
      />
    </div>
  )
}

interface StudentLayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname() || '/student/dashboard'
  const currentMenuItem = STUDENT_MENU_CONFIG.find(
    (m) => m.path === pathname || (m.path !== '/student/dashboard' && pathname.startsWith(m.path))
  )
  const { theme, toggleTheme } = useMobileTheme()

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [searchQuery, setSearchQuery] = useState('')

  // Load student profile synchronized with teacher records
  useEffect(() => {
    const syncProfile = () => {
      setProfile(getSynchronizedStudentProfile())
    }
    syncProfile()

    window.addEventListener('oxonom_student_updated', syncProfile)
    window.addEventListener('oxonom_teacher_profile_updated', syncProfile)
    window.addEventListener('oxonom_attendance_updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncProfile)
      window.removeEventListener('oxonom_teacher_profile_updated', syncProfile)
      window.removeEventListener('oxonom_attendance_updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const isCurrentPathActive = (targetPath: string) => {
    if (targetPath === '/student/dashboard') {
      return pathname === '/student/dashboard' || pathname === '/student'
    }
    return pathname.startsWith(targetPath)
  }

  // Mobile Bottom Dock: 4 Main Items + 1 "Daha Fazla" Drawer Button
  const DOCK_ITEMS = [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      path: '/student/dashboard',
      icon: LayoutDashboard,
      activeIconBg: 'bg-[#1D77FF] text-white',
      inactiveBg: 'bg-white/80 dark:bg-slate-800/80',
      inactiveText: 'text-slate-500 dark:text-slate-400',
    },
    {
      id: 'courses',
      label: 'Derslerim',
      path: '/student/courses',
      icon: GraduationCap,
      activeIconBg: 'bg-indigo-600 text-white',
      inactiveBg: 'bg-white/80 dark:bg-slate-800/80',
      inactiveText: 'text-slate-500 dark:text-slate-400',
    },
    {
      id: 'assignments',
      label: 'Ödevlerim',
      path: '/student/assignments',
      icon: BookOpen,
      activeIconBg: 'bg-emerald-600 text-white',
      inactiveBg: 'bg-white/80 dark:bg-slate-800/80',
      inactiveText: 'text-slate-500 dark:text-slate-400',
    },
    {
      id: 'learn',
      label: 'Keşfet',
      path: '/student/learn',
      icon: Sparkles,
      activeIconBg: 'bg-amber-500 text-white',
      inactiveBg: 'bg-white/80 dark:bg-slate-800/80',
      inactiveText: 'text-slate-500 dark:text-slate-400',
    },
  ]

  // Secondary items under "Daha Fazla"
  const MORE_ITEMS = STUDENT_MENU_CONFIG.filter(
    (item) => !['dashboard', 'courses', 'assignments', 'learn'].includes(item.id)
  )

  // XP calculation based on GPA and attendance
  const studentXp = Math.round(profile.gpa * 10 + profile.attendanceRate * 2.5) || 750

  return (
    <div
      className={`${theme} min-h-screen w-full max-w-full overflow-x-hidden bg-[#F4F7FC] dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 font-jakarta flex flex-col lg:flex-row transition-colors duration-200 antialiased`}
    >
      {/* ── DESKTOP SIDEBAR (lg+) — Lingora Claymorphic SaaS Style ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 w-[270px] xl:w-[280px] h-screen shrink-0 bg-white dark:bg-[#111A2E] border-r border-blue-100/70 dark:border-blue-950/50 z-30 select-none shadow-[2px_0_24px_rgba(29,119,255,0.03)]">
        {/* Brand Header with Oxo Mascot */}
        <div className="p-5 pb-4 flex items-center justify-between border-b border-blue-50/80 dark:border-blue-950/40">
          <Link href="/student/dashboard" className="flex items-center gap-3 group">
            <OxoMascotIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1">
                <span>Oxonom</span>
                <span className="text-[#1D77FF]">.</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide mt-1">
                Learn • Practice • Excel
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Navigation Items — Clean Pill Design without scrollbar */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-none">
          {STUDENT_MENU_CONFIG.map((item) => {
            const Icon = item.icon
            const active = isCurrentPathActive(item.path)
            const isPassive = item.status === 'passive'

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#EAF2FF] dark:bg-[#1A2849] text-[#1D77FF] dark:text-[#5BA0FF] shadow-xs'
                    : isPassive
                    ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? 'bg-[#1D77FF]/10 text-[#1D77FF] dark:text-[#5BA0FF]'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {isPassive && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                    Yakında
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Oxonom Plus / PRO Promo Card (Opens Animated Modal) */}
        <div className="px-4 pb-2">
          <div
            onClick={() => setIsPlusModalOpen(true)}
            className="p-3.5 rounded-3xl bg-gradient-to-b from-[#FFF9EE] via-[#F4F8FF] to-[#EDF4FF] dark:from-[#19243E] dark:to-[#121B30] border border-amber-300/60 dark:border-amber-500/30 relative overflow-hidden shadow-xs cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Crown size={14} className="fill-amber-400 text-amber-500" />
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Oxonom Plus
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black shadow-xs">
                199 ₺
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mb-2.5">
              <span className="line-through text-slate-400">899 ₺</span> yerine tüm ders kitapları, yapay zekâ ve soru havuzu elinin altında!
            </p>
            <button
              type="button"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-[11px] text-center block shadow-sm shadow-orange-500/20 transition-all group-hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              Plus&apos;ı Keşfet
            </button>
          </div>
        </div>

        {/* User Profile Pill at Bottom (Alex Level 12 style) */}
        <div className="p-3 border-t border-blue-50/80 dark:border-blue-950/40">
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-100/50 dark:border-blue-900/30 flex items-center justify-between gap-2.5">
            <Link
              href="/student/settings"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D77FF] to-cyan-400 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {profile.firstName.slice(0, 1)}
                  {profile.lastName.slice(0, 1)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111A2E]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                  {profile.name}
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                  <span>{profile.className}</span>
                  <span>•</span>
                  <span>Seviye {Math.max(1, Math.round(profile.gpa / 10))}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                href="/student/settings"
                className="w-7 h-7 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                title="Ayarlar"
              >
                <Settings size={14} />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  if (typeof window !== 'undefined') {
                    try {
                      localStorage.removeItem('oxonom_student_profile')
                      localStorage.removeItem('oxonom_current_role')
                    } catch (_) {}
                  }
                  await signOut()
                  window.location.href = '/loginv2'
                }}
                className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Oturumu Kapat"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-[270px] xl:pl-[280px]">
        {/* Desktop Top Header Bar (lg+) — Sleek & Minimal */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-blue-100/60 dark:border-blue-950/40 bg-white/80 dark:bg-[#111A2E]/80 backdrop-blur-xl sticky top-0 z-20 select-none">
          {/* Rounded Pill Search Input */}
          <div className="relative w-72 xl:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders, ödev, konu veya kitap ara..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#F4F7FC] dark:bg-[#16233F] border border-blue-100/80 dark:border-blue-900/50 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D77FF]/30 transition-all"
            />
          </div>

          {/* Right Status (Minimal Clock, Notification, Theme, Profile) */}
          <div className="flex items-center gap-2.5">
            <HeaderLiveClock theme="cyan" variant="desktop" />

            {/* Notification Bell */}
            <Link
              href="/student/communication"
              className="relative w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#16233F] border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#1D77FF] dark:hover:text-[#5BA0FF] transition-colors"
              title="Duyurular & Bildirimler"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#111A2E]" />
            </Link>

            {/* Quick Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#16233F] border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-yellow-400 transition-colors cursor-pointer"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* ── MOBILE HEADER (<lg) — Sleek, Minimal, Notch Safe ── */}
        <header
          className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#111A2E]/90 backdrop-blur-xl border-b border-blue-100/70 dark:border-blue-950/50 px-4 pb-2.5 flex items-center justify-between select-none"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
        >
          <div className="flex items-center gap-2">
            <OxoMascotIcon className="w-7 h-7" />
            <div className="text-xs font-black text-slate-900 dark:text-white leading-none">
              Oxonom Edu
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderLiveClock theme="cyan" variant="mobile" />

            <Link
              href="/student/communication"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              title="Bildirimler"
            >
              <Bell size={14} />
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden pb-28 lg:pb-12 flex flex-col">
          {children}
        </main>
      </div>

      {/* ── MOBILE FLOATING BOTTOM DOCK — Lingora Pill Aesthetics ── */}
      <nav
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] bg-white/95 dark:bg-[#121B32]/95 backdrop-blur-2xl border border-blue-100/90 dark:border-blue-900/60 rounded-full px-2 py-1.5 flex items-center justify-between gap-1 shadow-[0_12px_40px_rgba(29,119,255,0.12)] z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        aria-label="Öğrenci alt menü"
      >
        {/* 4 Primary Navigation Items */}
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = isCurrentPathActive(item.path)

          if (isActive) {
            return (
              <Link
                key={item.id}
                href={item.path}
                className="h-11 px-3.5 rounded-full bg-[#1D77FF] text-white flex items-center gap-2 font-black text-xs shadow-md shadow-blue-500/25 shrink-0 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon size={14} strokeWidth={2.6} />
                </div>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${item.inactiveBg} ${item.inactiveText}`}
              title={item.label}
            >
              <Icon size={18} strokeWidth={2.2} />
            </Link>
          )
        })}

        {/* 5th Item: "Daha Fazla" Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${
            isMoreSheetOpen
              ? 'bg-[#1D77FF] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
          title="Daha Fazla Modül"
        >
          <LayoutGrid size={18} strokeWidth={2.2} />
        </button>
      </nav>

      {/* ── MOBILE "DAHA FAZLA" BOTTOM SHEET ── */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center font-jakarta">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111A2E] rounded-t-[32px] shadow-2xl border border-blue-100 dark:border-blue-900/40 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-blue-50 dark:border-blue-950/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Öğrenci Modülleri
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kitaplık, sınavlar, gelişim ve planlayıcı
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Oxonom Plus Promo Card in Drawer */}
              <div className="px-4 pt-3">
                <div
                  onClick={() => {
                    setIsMoreSheetOpen(false)
                    setIsPlusModalOpen(true)
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-blue-500/10 border border-amber-400/50 flex items-center justify-between cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Crown size={18} className="fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Oxonom Plus</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black">
                          199 ₺
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="line-through text-slate-400">899 ₺</span> yerine %78 indirim fırsatı
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={17} className="text-amber-500 shrink-0" />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 scrollbar-none">
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isCurrentPathActive(item.path)
                  const isPassive = item.status === 'passive'

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setIsMoreSheetOpen(false)}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-[#EAF2FF] dark:bg-[#1A2849] border-[#1D77FF]/40 text-[#1D77FF] dark:text-[#5BA0FF]'
                          : isPassive
                          ? 'bg-slate-50 dark:bg-[#15213B] border-slate-100 dark:border-slate-800 text-slate-400'
                          : 'bg-white dark:bg-[#15213B] border-blue-50 dark:border-blue-900/30 text-slate-700 dark:text-slate-300 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            active
                              ? 'bg-[#1D77FF] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon size={17} />
                        </div>
                        {isPassive && (
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                            Yakında
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">
                          {item.label}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Bottom Quick Logout */}
              <div className="p-4 border-t border-blue-50 dark:border-blue-950/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    setIsMoreSheetOpen(false)
                    if (typeof window !== 'undefined') {
                      try {
                        localStorage.removeItem('oxonom_student_profile')
                        localStorage.removeItem('oxonom_current_role')
                      } catch (_) {}
                    }
                    await signOut()
                    window.location.href = '/loginv2'
                  }}
                  className="text-xs font-black text-rose-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Oturumu Kapat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── OXONOM PLUS ANIMATED PROMO MODAL ── */}
      <OxonomPlusModal
        isOpen={isPlusModalOpen}
        onClose={() => setIsPlusModalOpen(false)}
      />
    </div>
  )
}
