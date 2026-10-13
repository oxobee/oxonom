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
} from 'lucide-react'
import { STUDENT_MENU_CONFIG, type StudentMenuItem } from '@/lib/student/studentMenuConfig'
import { signOut } from '@components/Contexts/AuthContext'
import { DEFAULT_STUDENT_PROFILE, type StudentProfile } from '@/lib/student/studentData'
import HeaderLiveClock from '@components/Common/HeaderLiveClock'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

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

  // Load student profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_student_profile')
        if (saved) {
          setProfile(JSON.parse(saved))
        }
      } catch (_) {}
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
      activeIconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      inactiveBg: 'bg-gray-100 dark:bg-gray-800',
      inactiveText: 'text-gray-700 dark:text-gray-300',
    },
    {
      id: 'courses',
      label: 'Derslerim',
      path: '/student/courses',
      icon: GraduationCap,
      activeIconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      inactiveBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      inactiveText: 'text-indigo-600 dark:text-indigo-300',
    },
    {
      id: 'assignments',
      label: 'Ödevlerim',
      path: '/student/assignments',
      icon: BookOpen,
      activeIconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      inactiveBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      inactiveText: 'text-emerald-600 dark:text-emerald-300',
    },
    {
      id: 'learn',
      label: 'Keşfet',
      path: '/student/learn',
      icon: Sparkles,
      activeIconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      inactiveBg: 'bg-amber-50 dark:bg-amber-950/60',
      inactiveText: 'text-amber-600 dark:text-amber-300',
    },
  ]

  // Secondary items under "Daha Fazla"
  const MORE_ITEMS = STUDENT_MENU_CONFIG.filter(
    (item) => !['dashboard', 'courses', 'assignments', 'learn'].includes(item.id)
  )

  return (
    <div className={`${theme} min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15] text-gray-900 dark:text-white font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#0E1526] border-r border-gray-200/80 dark:border-gray-800/80 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Öğrenci Portalı
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Student Identity Card */}
        <div className="p-4 mx-3 my-2 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#F0F9FF] dark:from-[#0c1e2e] dark:to-[#0F172A] border border-cyan-200/60 dark:border-cyan-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
            {profile.firstName.slice(0, 1)}
            {profile.lastName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{profile.name}</span>
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {profile.className} Şubesi · No: {profile.studentNo}
            </div>
            <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <Award size={10} />
              <span>Sınıf 1.'si · Ort: {profile.gpa}</span>
            </div>
          </div>
        </div>

        {/* 10 Ordered Navigation Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {STUDENT_MENU_CONFIG.map((item) => {
            const Icon = item.icon
            const active = isCurrentPathActive(item.path)
            const isPassive = item.status === 'passive'

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : isPassive
                    ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      active
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : isPassive
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {isPassive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                    Yakında
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
          <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Devamlılık Oranı:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">%{profile.attendanceRate}</span>
          </div>

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
            className="w-full h-9 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header Bar (lg+) */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-[#0E1526]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Öğrenci Portalı</span>
              <ChevronRight size={13} className="text-gray-400" />
              <span className="font-extrabold text-gray-900 dark:text-white">
                {currentMenuItem?.label || 'Derslerim & Ödevler'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock & Date matching theme (Cyan) */}
            <HeaderLiveClock theme="cyan" variant="desktop" />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Öğrenci Aktif</span>
            </div>

            <Link
              href="/student/planner"
              className="h-9 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-gray-200/60 dark:border-gray-700/60"
            >
              <Calendar size={13} />
              <span>Ders Programı</span>
            </Link>

            <Link
              href="/student/assignments"
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shadow-cyan-500/20"
            >
              <FileCheck size={14} />
              <span>Ödevlerim</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── MOBILE HEADER (<lg) ── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xs font-black text-sm">
              OX
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {profile.name} ({profile.className})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Clock & Date matching theme (Mobile Compact) */}
            <HeaderLiveClock theme="cyan" variant="mobile" />

            <Link
              href="/student/communication"
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center"
              title="Duyurular"
            >
              <Bell size={15} />
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center"
              title="Temayı Değiştir"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-8 flex flex-col">
          {children}
        </main>
      </div>

      {/* ── MOBILE FLOATING BOTTOM DOCK (5 Items) ── */}
      <nav
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-xl border border-gray-200/90 dark:border-gray-800/90 rounded-full px-2 py-1.5 flex items-center justify-between gap-1 shadow-2xl z-40 select-none"
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
                className="h-11 px-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center gap-2 font-bold text-xs shadow-md shrink-0 transition-all"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.activeIconBg}`}>
                  <Icon size={15} strokeWidth={2.4} />
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
              <Icon size={19} strokeWidth={2.2} />
            </Link>
          )
        })}

        {/* 5th Item: "Daha Fazla" Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsMoreSheetOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95 ${
            isMoreSheetOpen
              ? 'bg-[#FDE68A] text-[#B45309] font-bold'
              : 'bg-[#FFF4E5] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300'
          }`}
          title="Daha Fazla Modül"
        >
          <LayoutGrid size={19} strokeWidth={2.2} />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-t-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="p-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Öğrenci Modülleri
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Sınavlar, kütüphane, gelişim ve planlayıcı
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
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
                      className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        active
                          ? 'bg-cyan-50/70 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/80 text-cyan-700 dark:text-cyan-300'
                          : isPassive
                          ? 'bg-gray-50/50 dark:bg-[#12192B] border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                          : 'bg-white dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            active
                              ? 'bg-cyan-600 text-white'
                              : isPassive
                              ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {isPassive && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
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
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
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
                  className="text-xs font-bold text-rose-500 flex items-center gap-1.5 cursor-pointer"
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
