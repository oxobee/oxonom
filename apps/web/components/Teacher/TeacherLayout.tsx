'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  BookOpen,
  Award,
  Tv,
  Sparkles,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  MoreHorizontal,
  X,
  QrCode,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  School,
  ExternalLink,
} from 'lucide-react'
import { TEACHER_MENU_CONFIG, getMenuItemByPath } from '@/lib/teacher/teacherMenuConfig'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { signOut } from '@components/Contexts/AuthContext'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'

interface TeacherLayoutProps {
  children: React.ReactNode
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname() || '/teacher/dashboard'
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const [isConnectBoardModalOpen, setIsConnectBoardModalOpen] = useState(false)

  // Teacher identity details
  const teacherName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Ebru TEKNECİ'
  const teacherBranch = 'Sınıf Öğretmeni & Rehberlik'

  // Mobile Bottom Dock: exactly 5 items per Section 4
  const MOBILE_DOCK_ITEMS = [
    { label: 'Ana Sayfa', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Derslerim', path: '/teacher/schedule', icon: Calendar },
    { label: 'Tahta', path: '/teacher/smartboard', icon: Tv, isCenter: true },
    { label: 'Yapay Zekâ', path: '/teacher/ai-assistant', icon: Sparkles },
    { label: 'Daha Fazla', path: '#more', icon: MoreHorizontal, isMore: true },
  ]

  const isCurrentPathActive = (targetPath: string) => {
    if (targetPath === '/teacher/dashboard') {
      return pathname === '/teacher/dashboard' || pathname === '/teacher'
    }
    return pathname.startsWith(targetPath)
  }

  return (
    <div className={`${theme} min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D15] text-gray-900 dark:text-white font-jakarta flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 shrink-0 bg-white dark:bg-[#0E1526] border-r border-gray-200/80 dark:border-gray-800/80 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black text-lg">
              OX
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Oxonom EDU
              </div>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Öğretmen Portalı
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

        {/* Teacher Identity Box */}
        <div className="p-4 mx-3 my-2 rounded-2xl bg-gradient-to-br from-[#F1F4F9] to-white dark:from-[#131C31] dark:to-[#0F172A] border border-gray-200/60 dark:border-gray-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-500/20">
            {teacherName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {teacherName}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {teacherBranch}
            </div>
          </div>
        </div>

        {/* 14 Navigation Categories (Ordered) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {TEACHER_MENU_CONFIG.map((item) => {
            const Icon = item.icon
            const active = isCurrentPathActive(item.path)
            const isPassive = item.status === 'passive'

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
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
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isPassive
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {isPassive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                    Geliştirme
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
          <button
            type="button"
            onClick={() => setIsConnectBoardModalOpen(true)}
            className="w-full h-10 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <QrCode size={16} />
            <span>Akıllı Tahtaya Bağlan</span>
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full h-9 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Oturumu Kapat</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (<lg) ── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs font-black text-sm">
            OX
          </div>
          <div>
            <div className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
              Oxonom EDU
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              {teacherName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsConnectBoardModalOpen(true)}
            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5"
            title="Tahtaya Bağlan"
          >
            <QrCode size={14} />
            <span>Tahta</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 min-w-0 pb-28 lg:pb-8 flex flex-col">
        {children}
      </main>

      {/* ── MOBILE FLOATING BOTTOM DOCK (5 Items) ── */}
      <nav
        className="lg:hidden fixed safe-dock-bottom left-1/2 -translate-x-1/2 w-[95%] max-w-[390px] bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800/90 rounded-[28px] p-1.5 flex items-center justify-between shadow-2xl z-40 select-none"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        aria-label="Öğretmen alt menü"
      >
        {MOBILE_DOCK_ITEMS.map((item, idx) => {
          const Icon = item.icon
          const isActive = !item.isMore && isCurrentPathActive(item.path)

          if (item.isMore) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setIsMoreSheetOpen(true)}
                className={`relative flex flex-col items-center justify-center w-[52px] h-[48px] rounded-[18px] transition-all cursor-pointer ${
                  isMoreSheetOpen
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">Daha Fazla</span>
              </button>
            )
          }

          if (item.isCenter) {
            return (
              <Link
                key={idx}
                href={item.path}
                className={`relative flex flex-col items-center justify-center w-[54px] h-[50px] rounded-[18px] transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-[#0A0D15] shadow-lg shadow-emerald-500/25 font-black'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                }`}
              >
                <Icon size={21} strokeWidth={2.2} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={idx}
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-[52px] h-[48px] rounded-[18px] transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </Link>
          )
        })}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
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
                    Tüm Öğretmen Modülleri
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    14 kapsamlı çalışma alanı ve araçlar
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
                {TEACHER_MENU_CONFIG.map((item) => {
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
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300'
                          : isPassive
                          ? 'bg-gray-50/50 dark:bg-[#12192B] border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                          : 'bg-white dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : isPassive
                            ? 'bg-gray-200/50 dark:bg-gray-800 text-gray-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          <Icon size={16} />
                        </div>
                        {isPassive && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                            Pasif
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
                  onClick={() => {
                    setIsMoreSheetOpen(false)
                    signOut()
                  }}
                  className="text-xs font-bold text-rose-500 flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>Oturumu Kapat</span>
                </button>
                <div className="text-[10px] text-gray-400">
                  Oxonom Edu v2
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global QR Smartboard Pairing Modal */}
      <ConnectBoardModal
        isOpen={isConnectBoardModalOpen}
        onClose={() => setIsConnectBoardModalOpen(false)}
        theme={theme}
      />
    </div>
  )
}
