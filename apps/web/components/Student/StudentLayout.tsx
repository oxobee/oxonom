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

// Cute Oxo Bird Mascot Icon matching the Lingora design aesthetic
export function OxoMascotIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Soft Circular Body */}
        <circle cx="50" cy="50" r="45" fill="url(#oxoGrad)" />
        {/* White Belly */}
        <ellipse cx="50" cy="64" rx="28" ry="24" fill="#FFFFFF" opacity="0.94" />
        {/* Aviator Goggles & Glasses */}
        <rect x="22" y="32" width="24" height="20" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
        <rect x="54" y="32" width="24" height="20" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
        <line x1="46" y1="42" x2="54" y2="42" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        {/* Eye pupils with reflection */}
        <circle cx="34" cy="42" r="5" fill="#38BDF8" />
        <circle cx="36" cy="40" r="2" fill="#FFFFFF" />
        <circle cx="66" cy="42" r="5" fill="#38BDF8" />
        <circle cx="68" cy="40" r="2" fill="#FFFFFF" />
        {/* Cute Beak */}
        <polygon points="50,48 43,58 57,58" fill="#F97316" />
        {/* Rosy Cheeks */}
        <ellipse cx="23" cy="59" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
        <ellipse cx="77" cy="59" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
        {/* Golden Scarf */}
        <path d="M28 72 C42 80, 58 80, 72 72 C68 84, 32 84, 28 72 Z" fill="#EAB308" />
        <defs>
          <linearGradient id="oxoGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#1D77FF" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
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
      className={`${theme} min-h-screen bg-[#F4F7FC] dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 font-jakarta flex flex-col lg:flex-row transition-colors duration-200 antialiased`}
    >
      {/* ── DESKTOP SIDEBAR (lg+) — Lingora Claymorphic SaaS Style ── */}
      <aside className="hidden lg:flex flex-col w-[270px] xl:w-[280px] h-screen sticky top-0 shrink-0 bg-white dark:bg-[#111A2E] border-r border-blue-100/70 dark:border-blue-950/50 z-30 select-none shadow-[2px_0_24px_rgba(29,119,255,0.03)]">
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

        {/* 10 Navigation Items — Pill Design with Soft Active State */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar">
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

        {/* Oxonom Plus / PRO Promo Card (matching Lingora Plus) */}
        <div className="px-4 pb-2">
          <div className="p-3.5 rounded-3xl bg-gradient-to-b from-[#FFF9EE] via-[#F4F8FF] to-[#EDF4FF] dark:from-[#19243E] dark:to-[#121B30] border border-amber-200/50 dark:border-blue-900/40 relative overflow-hidden shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                <Crown size={14} className="fill-amber-400 text-amber-500" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                Oxonom Plus
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mb-2.5">
              Tüm ders kayıtları, soru havuzları ve yapay zeka rehberliği elinin altında!
            </p>
            <Link
              href="/student/learn"
              className="w-full py-2 rounded-xl bg-[#1D77FF] hover:bg-blue-600 text-white font-extrabold text-[11px] text-center block shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Keşfet & Yükselt
            </Link>
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) — Lingora Style with Search & Gamified Badges */}
        <header className="hidden lg:flex items-center justify-between h-20 px-8 border-b border-blue-100/60 dark:border-blue-950/40 bg-white/70 dark:bg-[#111A2E]/70 backdrop-blur-xl sticky top-0 z-20 select-none">
          {/* Rounded Pill Search Input */}
          <div className="relative w-80 xl:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders, ödev, konu veya sınav ara..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F4F7FC] dark:bg-[#16233F] border border-blue-100/80 dark:border-blue-900/50 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D77FF]/30 transition-all"
            />
          </div>

          {/* Right Status Counters & Badges (Streak 🔥, Gems 💎, Notifications 🔔, Clock) */}
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <HeaderLiveClock theme="cyan" variant="desktop" />

            {/* Streak Counter 🔥 */}
            <div
              className="h-10 px-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 shadow-xs cursor-default hover:scale-105 transition-transform"
              title="Aktif Günlük Seri"
            >
              <Flame size={17} className="fill-amber-500 text-amber-500" />
              <span>12 Gün</span>
            </div>

            {/* Diamonds / XP Points 💎 */}
            <div
              className="h-10 px-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 flex items-center gap-2 text-xs font-black text-[#1D77FF] dark:text-sky-400 shadow-xs cursor-default hover:scale-105 transition-transform"
              title="Toplam Akademik Puan"
            >
              <Gem size={16} className="fill-sky-400 text-[#1D77FF]" />
              <span>{studentXp} Puan</span>
            </div>

            {/* Notification Bell 🔔 */}
            <Link
              href="/student/communication"
              className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#16233F] border border-blue-100/80 dark:border-blue-900/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#1D77FF] dark:hover:text-[#1D77FF] transition-colors shadow-xs"
              title="Duyurular & Bildirimler"
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#111A2E]" />
            </Link>

            {/* Quick Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#16233F] border border-blue-100/80 dark:border-blue-900/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-yellow-400 transition-colors shadow-xs cursor-pointer"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* ── MOBILE HEADER (<lg) — Modernized with Oxo Brand & Quick Badges ── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#111A2E]/90 backdrop-blur-xl border-b border-blue-100/70 dark:border-blue-950/50 px-4 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <OxoMascotIcon className="w-8 h-8" />
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Oxonom Edu
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {profile.name} ({profile.className})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Clock compact */}
            <HeaderLiveClock theme="cyan" variant="mobile" />

            {/* Streak compact */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 text-[11px] font-black">
              <Flame size={13} className="fill-amber-500 text-amber-500" />
              <span>12</span>
            </div>

            {/* XP compact */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#1D77FF] dark:text-sky-400 border border-sky-200/50 text-[11px] font-black">
              <Gem size={13} className="fill-sky-400 text-[#1D77FF]" />
              <span>{studentXp}</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-12 flex flex-col">
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
              <div className="p-5 border-b border-blue-50 dark:border-blue-950/50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Öğrenci Modülleri
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sınavlar, kütüphane, gelişim ve planlayıcı
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

              {/* Modules Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 custom-scrollbar">
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
    </div>
  )
}
