'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Tv,
  Users,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  AlertCircle,
  Coffee,
  Utensils,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Bell,
  ArrowRight,
  MapPin,
  Compass,
  Radio,
  SlidersHorizontal,
  Flame,
  Award,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { CANONICAL_9A_SCHEDULE_30, getSynchronizedClassWeeklySchedule } from '@/lib/student/studentData'
import { ScheduleEntry, DayKey } from '@components/Mobile/Admin/MAdminScheduleClient'

// MEB Standard 6-period daily schedule with bell times
export interface PeriodTimeConfig {
  period: number
  startTime: string // "08:30"
  endTime: string // "09:10"
  startMinutes: number // minutes from midnight (510)
  endMinutes: number // minutes from midnight (550)
  durationMinutes: number // 40
  isLunchAfter?: boolean
  breakDurationAfter?: number // 15 or 50
}

export const MEB_PERIOD_CONFIG: PeriodTimeConfig[] = [
  { period: 1, startTime: '08:30', endTime: '09:10', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 10, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 2, startTime: '09:25', endTime: '10:05', startMinutes: 9 * 60 + 25, endMinutes: 10 * 60 + 5, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 3, startTime: '10:20', endTime: '11:00', startMinutes: 10 * 60 + 20, endMinutes: 11 * 60 + 0, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 4, startTime: '11:15', endTime: '11:55', startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 55, durationMinutes: 40, isLunchAfter: true, breakDurationAfter: 50 },
  { period: 5, startTime: '12:45', endTime: '13:25', startMinutes: 12 * 60 + 45, endMinutes: 13 * 60 + 25, durationMinutes: 40, breakDurationAfter: 15 },
  { period: 6, startTime: '13:40', endTime: '14:20', startMinutes: 13 * 60 + 40, endMinutes: 14 * 60 + 20, durationMinutes: 40, breakDurationAfter: 0 },
]

export interface LiveClassRadarProps {
  role?: 'student' | 'teacher' | 'principal'
  initialClassCode?: string
  compact?: boolean
  showClassSelector?: boolean
  className?: string
  titleOverride?: string
}

const CLASS_LIST = ['9-A', '9-B', '10-A', '11-A', '12-A']

// Subject color mapping with vibrant, modern palettes
export function getSubjectColorTheme(subject: string) {
  const sub = (subject || '').toLowerCase()
  if (sub.includes('türk') || sub.includes('edebiyat')) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      border: 'border-blue-400 dark:border-blue-500/40',
      badge: 'bg-blue-600 text-white',
      text: 'text-blue-700 dark:text-blue-300',
      glow: 'shadow-blue-500/20',
      gradient: 'from-blue-600 to-indigo-600',
      accent: '#2563eb',
    }
  }
  if (sub.includes('matematik') || sub.includes('geometri')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      border: 'border-indigo-400 dark:border-indigo-500/40',
      badge: 'bg-indigo-600 text-white',
      text: 'text-indigo-700 dark:text-indigo-300',
      glow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-600 to-violet-600',
      accent: '#4f46e5',
    }
  }
  if (sub.includes('fizik') || sub.includes('kimya') || sub.includes('biyoloji') || sub.includes('fen')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      border: 'border-emerald-400 dark:border-emerald-500/40',
      badge: 'bg-emerald-600 text-white',
      text: 'text-emerald-700 dark:text-emerald-300',
      glow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-600 to-teal-600',
      accent: '#059669',
    }
  }
  if (sub.includes('bilişim') || sub.includes('kodlama') || sub.includes('yazılım')) {
    return {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      border: 'border-cyan-400 dark:border-cyan-500/40',
      badge: 'bg-cyan-600 text-white',
      text: 'text-cyan-700 dark:text-cyan-300',
      glow: 'shadow-cyan-500/20',
      gradient: 'from-cyan-600 to-blue-600',
      accent: '#0891b2',
    }
  }
  if (sub.includes('ingilizce') || sub.includes('yabancı dil') || sub.includes('almanca')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      border: 'border-purple-400 dark:border-purple-500/40',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-700 dark:text-purple-300',
      glow: 'shadow-purple-500/20',
      gradient: 'from-purple-600 to-pink-600',
      accent: '#9333ea',
    }
  }
  if (sub.includes('tarih') || sub.includes('inkılap') || sub.includes('felsefe')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      border: 'border-amber-400 dark:border-amber-500/40',
      badge: 'bg-amber-600 text-white',
      text: 'text-amber-700 dark:text-amber-300',
      glow: 'shadow-amber-500/20',
      gradient: 'from-amber-600 to-orange-600',
      accent: '#d97706',
    }
  }
  if (sub.includes('coğrafya')) {
    return {
      bg: 'bg-teal-500/10 dark:bg-teal-500/15',
      border: 'border-teal-400 dark:border-teal-500/40',
      badge: 'bg-teal-600 text-white',
      text: 'text-teal-700 dark:text-teal-300',
      glow: 'shadow-teal-500/20',
      gradient: 'from-teal-600 to-emerald-600',
      accent: '#0d9488',
    }
  }
  if (sub.includes('beden') || sub.includes('spor')) {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/15',
      border: 'border-orange-400 dark:border-orange-500/40',
      badge: 'bg-orange-600 text-white',
      text: 'text-orange-700 dark:text-orange-300',
      glow: 'shadow-orange-500/20',
      gradient: 'from-orange-600 to-red-600',
      accent: '#ea580c',
    }
  }
  if (sub.includes('müzik') || sub.includes('görsel') || sub.includes('sanat')) {
    return {
      bg: 'bg-pink-500/10 dark:bg-pink-500/15',
      border: 'border-pink-400 dark:border-pink-500/40',
      badge: 'bg-pink-600 text-white',
      text: 'text-pink-700 dark:text-pink-300',
      glow: 'shadow-pink-500/20',
      gradient: 'from-pink-600 to-rose-600',
      accent: '#db2777',
    }
  }
  return {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    border: 'border-slate-400 dark:border-slate-500/40',
    badge: 'bg-slate-700 text-white',
    text: 'text-slate-700 dark:text-slate-300',
    glow: 'shadow-slate-500/20',
    gradient: 'from-slate-700 to-gray-800',
    accent: '#475569',
  }
}

export default function LiveClassRadar({
  role = 'student',
  initialClassCode = '9-A',
  compact = false,
  showClassSelector = false,
  className = '',
  titleOverride,
}: LiveClassRadarProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClassCode)
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Simulation mode allows testing live animations regardless of current computer clock (e.g. night time)
  // Default is 'realtime' (100% authentic clock)
  const [timeMode, setTimeMode] = useState<'realtime' | 'simulated'>('realtime')
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(10 * 60 + 35) // 10:35 default demo (Period 3)

  // 1. Fetch real-time schedule from /api/schedule with fallbacks
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
          setScheduleData(data.schedule)
          return
        }
      }
    } catch (_) {}

    // Fallback to local storage or canonical 9-A
    const local = getSynchronizedClassWeeklySchedule(selectedClass)
    setScheduleData(local)
  }, [selectedClass])

  useEffect(() => {
    fetchSchedule()
    const onScheduleUpdated = () => fetchSchedule()
    window.addEventListener('oxonom_schedule_published', onScheduleUpdated)
    window.addEventListener('oxonom_schedule_updated', onScheduleUpdated)
    window.addEventListener('oxonom_admin_schedule_updated', onScheduleUpdated)

    return () => {
      window.removeEventListener('oxonom_schedule_published', onScheduleUpdated)
      window.removeEventListener('oxonom_schedule_updated', onScheduleUpdated)
      window.removeEventListener('oxonom_admin_schedule_updated', onScheduleUpdated)
    }
  }, [fetchSchedule])

  // 2. Real-time Clock Interval (Tick every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 3. Calculate effective time & day
  const effectiveDayKey: DayKey = useMemo(() => {
    const day = currentTime.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (day === 1) return 'mon'
    if (day === 2) return 'tue'
    if (day === 3) return 'wed'
    if (day === 4) return 'thu'
    if (day === 5) return 'fri'
    // Weekend default to Monday for view
    return 'mon'
  }, [currentTime])

  const isWeekend = useMemo(() => {
    const day = currentTime.getDay()
    return day === 0 || day === 6
  }, [currentTime])

  // Minutes from midnight
  const effectiveCurrentMinutes = useMemo(() => {
    if (timeMode === 'simulated') {
      return simulatedMinutes
    }
    return currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60
  }, [timeMode, simulatedMinutes, currentTime])

  // Formatted clock string
  const formattedClock = useMemo(() => {
    if (timeMode === 'simulated') {
      const h = Math.floor(simulatedMinutes / 60).toString().padStart(2, '0')
      const m = Math.floor(simulatedMinutes % 60).toString().padStart(2, '0')
      const s = Math.floor((simulatedMinutes * 60) % 60).toString().padStart(2, '0')
      return `${h}:${m}:${s}`
    }
    return currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [timeMode, simulatedMinutes, currentTime])

  const formattedDateStr = useMemo(() => {
    return currentTime.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [currentTime])

  // 4. Filter today's periods for selected class
  const todayLessons = useMemo(() => {
    const base = scheduleData.length > 0 ? scheduleData : CANONICAL_9A_SCHEDULE_30
    return base
      .filter((s) => s.day === effectiveDayKey && (s.classCode === selectedClass || !s.classCode))
      .sort((a, b) => a.period - b.period)
  }, [scheduleData, effectiveDayKey, selectedClass])

  // 5. Determine active state: which lesson is active, or if in a break / outside hours
  const liveState = useMemo(() => {
    const nowMin = effectiveCurrentMinutes
    const schoolStart = MEB_PERIOD_CONFIG[0].startMinutes // 08:30 = 510
    const schoolEnd = MEB_PERIOD_CONFIG[MEB_PERIOD_CONFIG.length - 1].endMinutes // 14:20 = 860

    // State A: Before School
    if (nowMin < schoolStart) {
      const remainingMin = Math.ceil(schoolStart - nowMin)
      return {
        status: 'before_school' as const,
        activePeriod: null,
        nextPeriod: MEB_PERIOD_CONFIG[0],
        nextLesson: todayLessons.find((l) => l.period === 1) || null,
        remainingMinutes: remainingMin,
        remainingSeconds: Math.ceil((schoolStart - nowMin) * 60),
        elapsedMinutes: 0,
        elapsedPercent: 0,
        label: 'Okul Henüz Başlamadı',
        sublabel: `Ders ziline ${remainingMin} dakika kaldı (08:30)`,
      }
    }

    // State B: After School
    if (nowMin >= schoolEnd) {
      return {
        status: 'after_school' as const,
        activePeriod: null,
        nextPeriod: null,
        nextLesson: null,
        remainingMinutes: 0,
        remainingSeconds: 0,
        elapsedMinutes: schoolEnd - schoolStart,
        elapsedPercent: 100,
        label: 'Bugünkü Tüm Dersler Tamamlandı',
        sublabel: 'İyi dinlenmeler! Yarının ders programını inceleyebilirsiniz.',
      }
    }

    // State C: Inside School Hours - Check each period
    for (let i = 0; i < MEB_PERIOD_CONFIG.length; i++) {
      const p = MEB_PERIOD_CONFIG[i]

      // During active lesson
      if (nowMin >= p.startMinutes && nowMin < p.endMinutes) {
        const elapsedMin = nowMin - p.startMinutes
        const remainingMin = p.endMinutes - nowMin
        const totalDuration = p.durationMinutes
        const percent = Math.min(100, Math.max(0, Math.round((elapsedMin / totalDuration) * 100)))
        const lesson = todayLessons.find((l) => l.period === p.period) || null
        const nextP = i < MEB_PERIOD_CONFIG.length - 1 ? MEB_PERIOD_CONFIG[i + 1] : null
        const nextL = nextP ? todayLessons.find((l) => l.period === nextP.period) || null : null

        return {
          status: 'in_lesson' as const,
          activePeriod: p,
          activeLesson: lesson,
          nextPeriod: nextP,
          nextLesson: nextL,
          remainingMinutes: Math.floor(remainingMin),
          remainingSeconds: Math.floor((p.endMinutes - nowMin) * 60),
          elapsedMinutes: Math.floor(elapsedMin),
          elapsedSeconds: Math.floor(elapsedMin * 60),
          elapsedPercent: percent,
          label: `${p.period}. Ders İşleniyor`,
          sublabel: lesson?.subject || 'Ders Programı',
        }
      }

      // During break after this period
      const nextP = MEB_PERIOD_CONFIG[i + 1]
      if (nextP && nowMin >= p.endMinutes && nowMin < nextP.startMinutes) {
        const breakTotal = nextP.startMinutes - p.endMinutes
        const breakElapsed = nowMin - p.endMinutes
        const breakRemaining = nextP.startMinutes - nowMin
        const percent = Math.min(100, Math.max(0, Math.round((breakElapsed / breakTotal) * 100)))
        const isLunch = p.isLunchAfter
        const nextL = todayLessons.find((l) => l.period === nextP.period) || null

        return {
          status: (isLunch ? 'lunch_break' : 'recess_break') as 'lunch_break' | 'recess_break',
          activePeriod: null,
          prevPeriod: p,
          nextPeriod: nextP,
          nextLesson: nextL,
          breakDuration: breakTotal,
          remainingMinutes: Math.floor(breakRemaining),
          remainingSeconds: Math.floor(breakRemaining * 60),
          elapsedMinutes: Math.floor(breakElapsed),
          elapsedPercent: percent,
          label: isLunch ? 'Öğle Arası Dinlenmesi' : 'Teneffüs Arası',
          sublabel: `${nextP.period}. Ders (${nextL?.subject || 'Sıradaki Ders'}) ${Math.ceil(breakRemaining)} dk sonra başlayacak`,
        }
      }
    }

    // Default safe fallback
    return {
      status: 'after_school' as const,
      activePeriod: null,
      nextPeriod: null,
      nextLesson: null,
      remainingMinutes: 0,
      remainingSeconds: 0,
      elapsedMinutes: 0,
      elapsedPercent: 100,
      label: 'Ders Saati Dışında',
      sublabel: 'Program dışı saat.',
    }
  }, [effectiveCurrentMinutes, todayLessons])

  // Get active subject theme
  const activeSubjectTheme = useMemo(() => {
    if (liveState.status === 'in_lesson' && liveState.activeLesson) {
      return getSubjectColorTheme(liveState.activeLesson.subject)
    }
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      border: 'border-indigo-400 dark:border-indigo-500/40',
      badge: 'bg-indigo-600 text-white',
      text: 'text-indigo-700 dark:text-indigo-300',
      glow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-600 to-cyan-600',
      accent: '#4f46e5',
    }
  }, [liveState])

  // Helpers for formatting remaining mm:ss
  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '00:00'
    const m = Math.floor(totalSec / 60)
    const s = Math.floor(totalSec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Radial progress calculations
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (liveState.elapsedPercent / 100) * circumference

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/90 dark:border-gray-800/90 shadow-md overflow-hidden relative ${className}`}
    >
      {/* ── AMBIENT GRADIENT HEADER BAR ── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 sm:p-5 lg:p-6 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Live Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Canlı Akış & Radar</span>
              </span>

              {isWeekend ? (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hafta Sonu Dinlenmesi
                </span>
              ) : (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-cyan-200 border border-white/15">
                  {formattedDateStr}
                </span>
              )}

              {timeMode === 'simulated' && (
                <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-500/40">
                  Demo Saat Modu ({formattedClock})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Radio className="text-indigo-400 animate-pulse" size={20} />
                <span>{titleOverride || 'Anlık Canlı Ders Takip Radarı'}</span>
              </h2>

              <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {selectedClass} Şubesi
              </span>
            </div>

            <p className="text-xs text-indigo-200/80 max-w-xl">
              MEB 30 saatlik resmi haftalık program senkronizasyonu ile gerçek zamanlı ders süresi, kalan zaman ve akıllı tahta takibi.
            </p>
          </div>

          {/* Clock & Controls Pill */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
            {/* Live Clock Display */}
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 flex items-center gap-2.5 shadow-inner">
              <Clock size={16} className="text-cyan-300" />
              <div className="text-right">
                <div className="text-[9.5px] uppercase font-bold text-cyan-200 leading-none">
                  {timeMode === 'realtime' ? 'Gerçek Saat' : 'Simüle Saat'}
                </div>
                <div className="text-base sm:text-lg font-black font-mono tracking-wider text-white">
                  {formattedClock}
                </div>
              </div>
            </div>

            {/* Principal Classroom Switcher */}
            {(showClassSelector || role === 'principal') && (
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 flex items-center gap-1">
                {CLASS_LIST.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedClass === cls
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-indigo-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}

            {/* Time Mode / Demo Stepper Toggle */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 text-[11px]">
              <button
                onClick={() => setTimeMode('realtime')}
                title="Sistem saatine dön"
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  timeMode === 'realtime'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Gerçek Zaman
              </button>

              <button
                onClick={() => {
                  setTimeMode('simulated')
                  // Toggle presets: 08:45 (P1) -> 10:35 (P3) -> 12:15 (Lunch) -> 13:00 (P5)
                  if (simulatedMinutes === 10 * 60 + 35) {
                    setSimulatedMinutes(12 * 60 + 15) // lunch
                  } else if (simulatedMinutes === 12 * 60 + 15) {
                    setSimulatedMinutes(8 * 60 + 45) // P1
                  } else {
                    setSimulatedMinutes(10 * 60 + 35) // P3
                  }
                }}
                title="Ders akışını farklı saatlerde test et"
                className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  timeMode === 'simulated'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Test Saati</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP GRAPHIC AREA: MEVCUT DERSİN İŞ SÜRESİ & RADAR GÖSTERGESİ ── */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50/70 to-white dark:from-[#0E1526] dark:to-[#121A2F] border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* SOL: RADIAL SVG CIRCULAR GAUGE (İş Süresi & İlerleme Oranı) */}
          <div className="lg:col-span-4 flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
            <div className="relative flex items-center justify-center">
              {/* SVG Radial Meter */}
              <svg className="w-36 h-36 sm:w-44 sm:h-44 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-gray-100 dark:stroke-gray-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Progress Ring with Smooth DashOffset */}
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="transition-all duration-700 ease-out"
                  stroke={
                    liveState.status === 'in_lesson'
                      ? activeSubjectTheme.accent
                      : liveState.status === 'lunch_break' || liveState.status === 'recess_break'
                      ? '#f59e0b'
                      : '#10b981'
                  }
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {liveState.status === 'in_lesson'
                    ? 'İş Süresi'
                    : liveState.status === 'recess_break' || liveState.status === 'lunch_break'
                    ? 'Mola Süresi'
                    : 'Günün Durumu'}
                </span>

                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none my-0.5">
                  %{liveState.elapsedPercent}
                </div>

                <div className="text-[11px] font-mono font-bold text-indigo-600 dark:text-cyan-400">
                  {liveState.status === 'in_lesson'
                    ? `${liveState.elapsedMinutes} / 40 dk`
                    : liveState.status === 'recess_break' || liveState.status === 'lunch_break'
                    ? `${liveState.elapsedMinutes} / ${liveState.breakDuration} dk`
                    : `${liveState.elapsedMinutes} dk`}
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ: MEVCUT DERSİN DETAYLARI, İLERLEME ÇUBUĞU & GERİ SAYIM SAYACI */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header: Status Pill + Countdown Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {liveState.status === 'in_lesson' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>Şu Anda İşleniyor</span>
                  </span>
                ) : liveState.status === 'recess_break' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                    <Coffee size={14} />
                    <span>Teneffüs Arası</span>
                  </span>
                ) : liveState.status === 'lunch_break' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-500 text-white shadow-sm shadow-orange-500/30">
                    <Utensils size={14} />
                    <span>Öğle Arası</span>
                  </span>
                ) : liveState.status === 'before_school' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500 text-white shadow-sm">
                    <Bell size={14} />
                    <span>Ders Öncesi Hazırlık</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-sm">
                    <CheckCircle2 size={14} />
                    <span>Dersler Bitti</span>
                  </span>
                )}

                <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400">
                  {liveState.label}
                </span>
              </div>

              {/* Countdown badge: Ne kadar süre sonra sonraki derse geçileceği */}
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-1.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 shrink-0">
                <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block leading-tight">
                    {liveState.status === 'in_lesson'
                      ? 'Teneffüse Kalan Süre'
                      : liveState.status === 'before_school'
                      ? 'Ders Ziline Kalan'
                      : 'Sonraki Derse Kalan'}
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono text-indigo-950 dark:text-indigo-100">
                    {formatCountdown(liveState.remainingSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Lesson / Break Title & Info */}
            <div className="space-y-1">
              {liveState.status === 'in_lesson' && liveState.activeLesson ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                      {liveState.activeLesson.subject}
                    </h3>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-lg text-white ${activeSubjectTheme.badge}`}
                    >
                      {liveState.activePeriod?.period}. Ders ({liveState.activePeriod?.startTime} -{' '}
                      {liveState.activePeriod?.endTime})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <GraduationCap size={15} className="text-indigo-500" />
                      <span>Öğretmen: {liveState.activeLesson.teacherName}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin size={14} className="text-emerald-500" />
                      <span>{liveState.activeLesson.roomName || `Derslik ${selectedClass}`}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <Tv size={14} />
                      <span>Akıllı Tahta Aktif (PANO-901)</span>
                    </span>
                  </div>
                </>
              ) : liveState.status === 'recess_break' || liveState.status === 'lunch_break' ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    {liveState.status === 'lunch_break' ? <Utensils size={24} /> : <Coffee size={24} />}
                    <span>{liveState.label}</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Sıradaki ders:{' '}
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {liveState.nextPeriod?.period}. Ders {liveState.nextLesson?.subject}
                    </span>{' '}
                    ({liveState.nextPeriod?.startTime}) — Dersliğinize geçmek için hazırlanabilirsiniz.
                  </p>
                </>
              ) : liveState.status === 'before_school' ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                    Sabah Hazırlığı ve Ders Öncesi
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Günün ilk dersi:{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      1. Ders {liveState.nextLesson?.subject || 'Derslik Hazırlığı'}
                    </span>{' '}
                    saat 08:30&apos;da başlayacak.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                    Bugünkü 6 Ders Başarıyla Tamamlandı 🎉
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Tüm dersler MEB müfredatına uygun olarak işlendi. Yarının programını ve ödevlerinizi kontrol edebilirsiniz.
                  </p>
                </>
              )}
            </div>

            {/* Linear Progress Bar with Milestones */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                <span>Geçen: {liveState.elapsedMinutes} dk</span>
                <span className="font-extrabold text-gray-900 dark:text-white">
                  {liveState.status === 'in_lesson' ? 'Ders İlerleme Çubuğu' : 'Zaman Akışı'}
                </span>
                <span>Kalan: {liveState.remainingMinutes} dk</span>
              </div>

              {/* Bar track */}
              <div className="h-3.5 w-full bg-gray-200/80 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 relative">
                <motion.div
                  className={`h-full rounded-full transition-all duration-500 ${
                    liveState.status === 'in_lesson'
                      ? 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 shadow-sm'
                      : liveState.status === 'lunch_break' || liveState.status === 'recess_break'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${liveState.elapsedPercent}%` }}
                />
              </div>

              {/* Milestones labels */}
              <div className="flex justify-between text-[10px] text-gray-400 px-1 font-mono">
                <span>0 dk</span>
                <span>10 dk</span>
                <span>20 dk</span>
                <span>30 dk</span>
                <span>40 dk</span>
              </div>
            </div>

            {/* Quick Action Buttons according to Role */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {role === 'student' && (
                <>
                  <button
                    onClick={() => alert('Akıllı Tahta PANO-901 yayınına bağlanıldı. Notlar senkronize.')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Tv size={14} />
                    <span>Tahtaya Bağlan</span>
                  </button>

                  <Link
                    href="/student/courses"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <BookOpen size={14} />
                    <span>Ders Notları & PDF</span>
                  </Link>

                  <Link
                    href="/student/assignments"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800/60 transition-all"
                  >
                    <CheckCircle2 size={14} />
                    <span>Bugünün Ödevleri</span>
                  </Link>
                </>
              )}

              {role === 'teacher' && (
                <>
                  <Link
                    href="/teacher/attendance"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Users size={14} />
                    <span>Ders Yoklamasını Al</span>
                  </Link>

                  <Link
                    href="/teacher/smartboard"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Tv size={14} />
                    <span>Akıllı Tahtayı Başlat</span>
                  </Link>

                  <Link
                    href="/teacher/schedule"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Calendar size={14} />
                    <span>Haftalık Programım</span>
                  </Link>
                </>
              )}

              {role === 'principal' && (
                <>
                  <Link
                    href="/principal/schedule"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Calendar size={14} />
                    <span>Tüm Okul Ders Programı</span>
                  </Link>

                  <Link
                    href="/principal/curriculum"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Müfredat & Ders Dağıtımı</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── İNFOGRAFİK VE ANİMASYONLU GÜNLÜK AKIŞ STEPPER (1-6. DERSLER & ARALAR) ── */}
      {/* Kural: Geçmiş dersler silik, güncel ders canlı, gelecek dersler farklı renklerde */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={17} className="text-amber-500" />
              <span>Günün Ders Akışı ve Zaman Çizelgesi (MEB 6 Ders Standardı)</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Her ders 40 dakika olup, geçmiş dersler silik, anlık ders canlı animasyonla ve gelecek dersler renkli olarak gösterilir.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-gray-400 hidden sm:inline-block">
            08:30 — 14:20 (Toplam 350 Dk)
          </span>
        </div>

        {/* PERIODS TIMELINE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {MEB_PERIOD_CONFIG.map((periodConfig, idx) => {
            const lesson = todayLessons.find((l) => l.period === periodConfig.period)
            const subject = lesson?.subject || 'Belirlenmedi'
            const teacher = lesson?.teacherName || 'Atanmadı'
            const room = lesson?.roomName || `Derslik ${selectedClass}`
            const colorTheme = getSubjectColorTheme(subject)

            // Determine status for this period
            const nowMin = effectiveCurrentMinutes
            const isPast = nowMin >= periodConfig.endMinutes
            const isCurrent = nowMin >= periodConfig.startMinutes && nowMin < periodConfig.endMinutes
            const isFuture = nowMin < periodConfig.startMinutes

            return (
              <React.Fragment key={periodConfig.period}>
                {/* Period Card */}
                <div
                  className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between space-y-3 ${
                    isPast
                      ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-80 bg-gray-100/70 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-800/60'
                      : isCurrent
                      ? `bg-gradient-to-br from-white via-indigo-50/50 to-white dark:from-[#131C31] dark:via-[#18233C] dark:to-[#131C31] border-2 ${activeSubjectTheme.border} ring-4 ring-indigo-500/15 shadow-xl ${activeSubjectTheme.glow}`
                      : `bg-white dark:bg-[#131C31] border ${colorTheme.border} shadow-xs hover:shadow-md`
                  }`}
                >
                  {/* Top Bar: Period Number & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                          isPast
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : isCurrent
                            ? 'bg-emerald-600 text-white font-black animate-pulse'
                            : colorTheme.badge
                        }`}
                      >
                        {periodConfig.period}. DERS
                      </span>

                      <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                        {periodConfig.startTime} - {periodConfig.endTime}
                      </span>
                    </div>

                    {/* Status indicator */}
                    {isPast && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Tamamlandı</span>
                      </span>
                    )}

                    {isCurrent && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>CANLI İŞLENİYOR</span>
                      </span>
                    )}

                    {isFuture && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border}`}
                      >
                        Gelecek Ders
                      </span>
                    )}
                  </div>

                  {/* Body: Subject Title & Details */}
                  <div className="space-y-1.5">
                    <h4
                      className={`text-sm sm:text-base font-black leading-snug ${
                        isPast
                          ? 'text-gray-600 dark:text-gray-400 line-through'
                          : isCurrent
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {subject}
                    </h4>

                    <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-indigo-500" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {teacher}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-emerald-500" />
                        <span className="truncate">{room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Live Progress / Countdown */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                    {isPast && (
                      <span className="text-gray-400 font-medium">40 dk işlendi · Yoklama alındı</span>
                    )}

                    {isCurrent && (
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-[10.5px] font-bold">
                          <span className="text-indigo-600 dark:text-cyan-400">
                            Geçen: {liveState.elapsedMinutes} dk
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                            {formatCountdown(liveState.remainingSeconds)} kaldı
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                            style={{ width: `${liveState.elapsedPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isFuture && (
                      <div className="flex items-center justify-between w-full text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>
                            {Math.ceil(periodConfig.startMinutes - nowMin)} dk sonra başlayacak
                          </span>
                        </span>
                        <span className="font-bold text-gray-600 dark:text-gray-300">40 Dk</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Break Indicator between periods (e.g. Teneffüs or Öğle Arası) */}
                {periodConfig.isLunchAfter && (
                  <div className="md:col-span-2 xl:col-span-3 py-2 px-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 flex items-center justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
                    <div className="flex items-center gap-2">
                      <Utensils size={16} className="text-orange-500" />
                      <span>🍽️ 4. Ders Sonrası: 50 Dakika Öğle Arası & Yemek Saati (11:55 - 12:45)</span>
                    </div>
                    <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400">
                      50 Dk Dinlenme
                    </span>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
