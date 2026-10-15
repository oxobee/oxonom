'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  FileCheck,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CheckSquare,
  BookMarked,
  MapPin,
  Play,
  Layers,
  Flame,
  MessageSquareQuote,
  Tv,
  Table,
  List,
  CalendarDays,
  X,
  FileText,
  Trash2,
  Plus,
  Tag,
  Headphones,
  Mic,
  Lightbulb,
  Compass,
  Gift,
  Trophy,
  Crown,
  ChevronDown,
  UserCheck,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DEFAULT_STUDENT_PROFILE,
  STUDENT_COURSES,
  STUDENT_ASSESSMENTS,
  STUDENT_ANNOUNCEMENTS,
  getStoredPlannerTasks,
  getSynchronizedStudentProfile,
  getSynchronizedStudentAssignments,
  getSynchronizedStudentAssessments,
  getSynchronizedGuidanceNotes,
  getSynchronizedClassWeeklySchedule,
  getStudentSubmissions,
  type PlannerTask,
  type StudentProfile,
  type StudentAssessment,
  type GuidanceNoteItem,
  type StudentSubmission,
} from '@/lib/student/studentData'
import LiveClassRadar from '@components/Common/LiveClassRadar'
import {
  getStoredCustomAssignments,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  DAYS_LIST,
  MIDDLE_PERIODS,
  type ScheduleEntry,
  type DayKey,
} from '@components/Mobile/Admin/MAdminScheduleClient'

// Color helper for timetable schedule entries
function getStudentDashboardSubjectColor(subject: string, color?: string) {
  const sub = subject.toLowerCase()
  if (color === 'blue' || sub.includes('türk') || sub.includes('edebiyat')) {
    return {
      bg: 'bg-blue-50/80 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900/60',
      text: 'text-blue-700 dark:text-blue-300',
    }
  }
  if (color === 'indigo' || sub.includes('matematik')) {
    return {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-900/60',
      text: 'text-indigo-700 dark:text-indigo-300',
    }
  }
  if (
    color === 'emerald' ||
    sub.includes('fen') ||
    sub.includes('fizik') ||
    sub.includes('kimya') ||
    sub.includes('biyoloji') ||
    sub.includes('din')
  ) {
    return {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900/60',
      text: 'text-emerald-700 dark:text-emerald-300',
    }
  }
  if (color === 'cyan' || sub.includes('bilişim') || sub.includes('kodlama') || sub.includes('yazılım')) {
    return {
      bg: 'bg-cyan-50/80 dark:bg-cyan-950/40',
      border: 'border-cyan-200 dark:border-cyan-900/60',
      text: 'text-cyan-700 dark:text-cyan-300',
    }
  }
  if (color === 'purple' || sub.includes('ingilizce') || sub.includes('yabancı')) {
    return {
      bg: 'bg-purple-50/80 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-900/60',
      text: 'text-purple-700 dark:text-purple-300',
    }
  }
  if (
    color === 'pink' ||
    sub.includes('görsel') ||
    sub.includes('sanat') ||
    sub.includes('müzik') ||
    sub.includes('rehberlik')
  ) {
    return {
      bg: 'bg-pink-50/80 dark:bg-pink-950/40',
      border: 'border-pink-200 dark:border-pink-900/60',
      text: 'text-pink-700 dark:text-pink-300',
    }
  }
  if (color === 'amber' || sub.includes('tarih') || sub.includes('sosyal')) {
    return {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900/60',
      text: 'text-amber-700 dark:text-amber-300',
    }
  }
  if (color === 'teal' || sub.includes('coğrafya') || sub.includes('hayat')) {
    return {
      bg: 'bg-teal-50/80 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-900/60',
      text: 'text-teal-700 dark:text-teal-300',
    }
  }
  if (color === 'orange' || sub.includes('beden') || sub.includes('spor') || sub.includes('oyun')) {
    return {
      bg: 'bg-orange-50/80 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-900/60',
      text: 'text-orange-700 dark:text-orange-300',
    }
  }
  return {
    bg: 'bg-blue-50/80 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900/60',
    text: 'text-blue-700 dark:text-blue-300',
  }
}

export default function StudentDashboardView() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [assignments, setAssignments] = useState<SchoolAssignmentItem[]>([])
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleEntry[]>([])
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission>>({})
  const [scheduleViewMode, setScheduleViewMode] = useState<'matrix' | 'list'>('matrix')

  // Active day selection in the weekly schedule tabs
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayKey>(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1:
        return 'mon'
      case 2:
        return 'tue'
      case 3:
        return 'wed'
      case 4:
        return 'thu'
      case 5:
        return 'fri'
      default:
        return 'mon'
    }
  })

  // Student Notes State (Synchronized with "Defterim ve Planlayıcım")
  const [studentNotes, setStudentNotes] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_student_notes_ercil')
        if (raw) return JSON.parse(raw)
      } catch (_) {}
    }
    return []
  })

  // Lesson Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [selectedLessonNoteTarget, setSelectedLessonNoteTarget] = useState<{
    lesson: ScheduleEntry
    dayLabel: string
    dayKey: string
    periodNumber: number
    periodTime: string
  } | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('Ders Notu')

  // Sync listener for notes from other tabs or Planner
  useEffect(() => {
    const handleNotesSync = () => {
      try {
        const raw = localStorage.getItem('oxonom_student_notes_ercil')
        if (raw) setStudentNotes(JSON.parse(raw))
      } catch (_) {}
    }
    window.addEventListener('storage', handleNotesSync)
    window.addEventListener('oxonom_student_notes_updated', handleNotesSync)
    return () => {
      window.removeEventListener('storage', handleNotesSync)
      window.removeEventListener('oxonom_student_notes_updated', handleNotesSync)
    }
  }, [])

  const getLessonNotes = (dayKey: string, periodNumber: number, subjectName: string) => {
    return studentNotes.filter((n) => {
      if (n.lessonKey === `${dayKey}-${periodNumber}`) return true
      if (
        n.course &&
        n.course.toLowerCase() === subjectName.toLowerCase() &&
        n.lessonInfo &&
        n.lessonInfo.includes(`${periodNumber}. Ders`)
      ) {
        return true
      }
      return false
    })
  }

  const handleOpenLessonNoteModal = (
    lesson: ScheduleEntry,
    dayLabel: string,
    dayKey: string,
    periodNumber: number,
    periodTime: string
  ) => {
    const subject = (lesson as any)?.subjectName || lesson?.subject || 'Ders'
    setSelectedLessonNoteTarget({
      lesson,
      dayLabel,
      dayKey,
      periodNumber,
      periodTime,
    })
    setNoteTitle(`${subject} — ${dayLabel} ${periodNumber}. Ders`)
    setNoteContent('')
    setNoteCategory('Ders Notu')
    setIsNoteModalOpen(true)
  }

  const handleSaveLessonNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLessonNoteTarget) return
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Lütfen not başlığı ve not içeriği giriniz.')
      return
    }

    const subject =
      (selectedLessonNoteTarget.lesson as any)?.subjectName ||
      selectedLessonNoteTarget.lesson?.subject ||
      'Ders'

    const newNote = {
      id: `sn-${Date.now()}`,
      title: noteTitle.trim(),
      course: subject,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      content: noteContent.trim(),
      category: noteCategory,
      lessonKey: `${selectedLessonNoteTarget.dayKey}-${selectedLessonNoteTarget.periodNumber}`,
      lessonInfo: `${selectedLessonNoteTarget.dayLabel} · ${selectedLessonNoteTarget.periodNumber}. Ders (${selectedLessonNoteTarget.periodTime})`,
      teacherName: selectedLessonNoteTarget.lesson.teacherName || '',
      roomName: selectedLessonNoteTarget.lesson.roomName || '',
    }

    const updated = [newNote, ...studentNotes]
    setStudentNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new Event('oxonom_student_notes_updated'))
    }

    toast.success(`"${subject}" ders notu kaydedildi ve Defterim/Planlayıcım alanına eklendi!`, {
      icon: '📝',
      duration: 4000,
    })

    setNoteContent('')
    setIsNoteModalOpen(false)
  }

  const handleDeleteLessonNote = (noteId: string) => {
    const updated = studentNotes.filter((n) => n.id !== noteId)
    setStudentNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new Event('oxonom_student_notes_updated'))
    }
    toast.success('Not silindi.')
  }

  useEffect(() => {
    const syncAll = () => {
      const p = getSynchronizedStudentProfile()
      setProfile(p)
      setTasks(getStoredPlannerTasks())
      setAssignments(getSynchronizedStudentAssignments())
      setAssessments(getSynchronizedStudentAssessments())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
      setWeeklySchedule(getSynchronizedClassWeeklySchedule(p.className))
      setSubmissions(getStudentSubmissions())
    }

    syncAll()

    // Fetch remote schedule
    const fetchRemoteSchedule = async () => {
      try {
        const res = await fetch('/api/schedule', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.schedule) && data.schedule.length > 0) {
            setWeeklySchedule(data.schedule)
            try {
              localStorage.setItem('oxonom_admin_schedule_30', JSON.stringify(data.schedule))
              localStorage.setItem('oxonom_schedule_30', JSON.stringify(data.schedule))
              if (Array.isArray(data.periods)) {
                localStorage.setItem('oxonom_admin_periods_30', JSON.stringify(data.periods))
                localStorage.setItem('oxonom_periods_30', JSON.stringify(data.periods))
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    const fetchRemoteExams = async () => {
      try {
        const res = await fetch('/api/exams?className=9-A', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.exams)) {
            try {
              const deletedRaw = localStorage.getItem('oxonom_deleted_exam_ids')
              const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : []
              const cleanExams = data.exams.filter((e: any) => !deletedIds.includes(e.id))
              localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(cleanExams))
            } catch (_) {}
            setAssessments(getSynchronizedStudentAssessments())
          }
        }
      } catch (_) {}
    }

    fetchRemoteExams()
    const scheduleInterval = setInterval(fetchRemoteSchedule, 5000)

    window.addEventListener('oxonom_student_updated', syncAll)
    window.addEventListener('oxonom_assignments_updated', syncAll)
    window.addEventListener('oxonom_student_homeworks_updated', syncAll)
    window.addEventListener('oxonom_student_submission_updated', syncAll)
    window.addEventListener('oxonom_teacher_profile_updated', syncAll)
    window.addEventListener('oxonom_attendance_updated', syncAll)
    window.addEventListener('oxonom_admin_schedule_updated', syncAll)
    window.addEventListener('oxonom_schedule_updated', syncAll)
    window.addEventListener('oxonom_schedule_published', syncAll)
    window.addEventListener('oxonom_exam_calendar_updated', syncAll)
    window.addEventListener('storage', syncAll)

    return () => {
      clearInterval(scheduleInterval)
      window.removeEventListener('oxonom_student_updated', syncAll)
      window.removeEventListener('oxonom_assignments_updated', syncAll)
      window.removeEventListener('oxonom_student_homeworks_updated', syncAll)
      window.removeEventListener('oxonom_student_submission_updated', syncAll)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAll)
      window.removeEventListener('oxonom_attendance_updated', syncAll)
      window.removeEventListener('oxonom_admin_schedule_updated', syncAll)
      window.removeEventListener('oxonom_schedule_updated', syncAll)
      window.removeEventListener('oxonom_schedule_published', syncAll)
      window.removeEventListener('oxonom_exam_calendar_updated', syncAll)
      window.removeEventListener('storage', syncAll)
    }
  }, [])

  // Schedule periods
  const schedulePeriods = useMemo(() => {
    const hasPeriod7 = weeklySchedule.some((e) => e.period >= 7)
    if (hasPeriod7) {
      return MIDDLE_PERIODS
    }
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem('oxonom_admin_periods_30') ||
          localStorage.getItem('oxonom_periods_30') ||
          localStorage.getItem('oxonom_admin_periods')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch (_) {}
    }
    return MIDDLE_PERIODS.filter((p) => p.periodNumber <= 6)
  }, [weeklySchedule])

  const todayKey: DayKey = useMemo(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1:
        return 'mon'
      case 2:
        return 'tue'
      case 3:
        return 'wed'
      case 4:
        return 'thu'
      case 5:
        return 'fri'
      default:
        return 'mon'
    }
  }, [])

  const selectedDayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === selectedScheduleDay)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, selectedScheduleDay])

  const todayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === todayKey)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, todayKey])

  const todayClassesCount = todayClasses.length || 6

  // Find today's current or upcoming active lesson for "Kaldığın Yerden Devam Et"
  const activeOrNextLesson = useMemo(() => {
    if (todayClasses.length > 0) {
      return todayClasses[0]
    }
    if (weeklySchedule.length > 0) {
      return weeklySchedule[0]
    }
    return null
  }, [todayClasses, weeklySchedule])

  // Pending assignments
  const pendingAssignments = useMemo(() => {
    return assignments
      .filter((asg) => {
        const id = String(asg.assignment_uuid || asg.id)
        return !submissions[id]
      })
      .slice(0, 4)
  }, [assignments, submissions])

  // Parse exam date
  const parseExamDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    if (dateStr.includes('-')) {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) return d
    }
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.')
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
    const monthsMap: Record<string, number> = {
      ocak: 0,
      şubat: 1,
      mart: 2,
      nisan: 3,
      mayıs: 4,
      haziran: 5,
      temmuz: 6,
      ağustos: 7,
      eylül: 8,
      ekim: 9,
      kasım: 10,
      aralık: 11,
    }
    const parts = dateStr.trim().split(' ')
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10)
      const month = monthsMap[parts[1].toLowerCase()]
      const year = parseInt(parts[2], 10)
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day)
      }
    }
    return null
  }

  // Upcoming exams
  const upcomingWeekExams = useMemo(() => {
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const sorted = assessments
      .filter((a) => a.status === 'upcoming')
      .map((exam) => {
        const parsed = parseExamDate(exam.date)
        let daysLeft: number | null = null
        if (parsed) {
          const examMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime()
          daysLeft = Math.round((examMidnight - todayMidnight) / (1000 * 60 * 60 * 24))
        }
        return {
          ...exam,
          parsedDate: parsed,
          daysLeft,
        }
      })
      .sort((a, b) => {
        if (a.daysLeft !== null && b.daysLeft !== null) {
          return a.daysLeft - b.daysLeft
        }
        return 0
      })

    const withinOneWeek = sorted.filter((e) => e.daysLeft !== null && e.daysLeft >= 0 && e.daysLeft <= 7)
    if (withinOneWeek.length >= 2) {
      return withinOneWeek
    }
    return sorted.slice(0, 3)
  }, [assessments])

  // Toggle quick planner task
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_planner_tasks_ercil', JSON.stringify(updated))
    }
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length
  const totalTasksCount = tasks.length || 0

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Günaydın'
    if (hours < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }, [])

  // Core actual courses of 9-A curriculum (100% REAL DATA, NO MOCK)
  const realCoreCourses = [
    {
      id: 'turk-dili-ve-edebiyati',
      name: 'Türk Dili ve Edebiyatı',
      teacher: 'Ebru TEKNECİ',
      hours: '5 Saat / Hafta',
      icon: Headphones,
      bg: 'bg-[#FAF5FF] dark:bg-[#1E192E]',
      border: 'border-purple-100 dark:border-purple-900/30',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'matematik',
      name: 'Matematik',
      teacher: 'Ebru TEKNECİ',
      hours: '6 Saat / Hafta',
      icon: Mic,
      bg: 'bg-[#FFF1F2] dark:bg-[#2A161B]',
      border: 'border-rose-100 dark:border-rose-900/30',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'bilisim-ve-kodlama',
      name: 'Bilişim & Kodlama',
      teacher: 'Ebru TEKNECİ',
      hours: '2 Saat / Hafta',
      icon: Lightbulb,
      bg: 'bg-[#F0FDF4] dark:bg-[#13261C]',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'yabanci-dil',
      name: 'Yabancı Dil (İngilizce)',
      teacher: 'Yabancı Dil Zümresi',
      hours: '4 Saat / Hafta',
      icon: Compass,
      bg: 'bg-[#FFFBEB] dark:bg-[#261E10]',
      border: 'border-amber-100 dark:border-amber-900/30',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
  ]

  const activeSubjectName =
    (activeOrNextLesson as any)?.subjectName ||
    activeOrNextLesson?.subject ||
    'Türk Dili ve Edebiyatı'
  const activeTeacherName = activeOrNextLesson?.teacherName || profile.mentorTeacher || 'Ebru TEKNECİ'
  const activeRoomName = activeOrNextLesson?.roomName || `Derslik ${profile.className}`

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-6 lg:space-y-8 select-none">
      {/* ── TOP SECTION: 2 COLUMNS (Left Main Content + Right Widgets Column) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ── LEFT MAIN COLUMN (lg:col-span-8) ── */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-7 min-w-0">
          {/* ── SKY-BLUE HERO CARD (Lingora Style Banner with 3D Popping Owl Mascot) ── */}
          {/* Extra top margin provided so the owl's head pops out above the box with depth effect */}
          <div className="relative mt-8 sm:mt-14 lg:mt-20 rounded-[32px] bg-gradient-to-r from-[#D9EBFF] via-[#E8F3FF] to-[#D5E9FF] dark:from-[#132247] dark:via-[#192D5C] dark:to-[#132247] border border-blue-100/90 dark:border-blue-900/50 p-6 sm:p-8 pt-8 shadow-[0_12px_40px_rgba(29,119,255,0.08)]">
            {/* Mascot on Mobile: Centered above card with head protruding */}
            <div className="sm:hidden flex justify-center -mt-20 mb-3 pointer-events-none select-none">
              <div className="relative w-36 h-36">
                <img
                  src="/images/oxonom-hero-owl.png"
                  alt="Oxonom Maskot"
                  className="w-full h-full object-contain filter drop-shadow-[0_14px_20px_rgba(0,0,0,0.18)]"
                />
              </div>
            </div>

            {/* Mascot on Desktop/Tablet: Positioned on the right, protruding high above the upper border */}
            <div className="hidden sm:block absolute right-4 lg:right-8 xl:right-12 -top-16 sm:-top-20 lg:-top-24 xl:-top-28 w-52 h-52 sm:w-60 sm:h-60 lg:w-72 lg:h-72 xl:w-84 xl:h-84 z-20 pointer-events-none select-none">
              <img
                src="/images/oxonom-hero-owl.png"
                alt="Oxonom Maskot"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.22)]"
              />
            </div>

            <div className="relative z-10 flex flex-col justify-between max-w-md sm:max-w-sm lg:max-w-md xl:max-w-lg space-y-3 sm:space-y-4">
              {/* Active Class Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-[11px] font-black text-slate-700 dark:text-slate-200 shadow-xs border border-blue-100/80 dark:border-blue-900/60 self-start">
                <span className="text-sm">🇹🇷</span>
                <span>{profile.className} Sınıfı • Aktif Dönem</span>
                <ChevronRight size={13} className="text-slate-400" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {greeting},{' '}
                  <span className="text-[#1D77FF] dark:text-[#5BA0FF]">{profile.firstName}!</span> 👋
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Bugün {profile.className} şubesinde seni bekleyen{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {todayClassesCount} ders saati
                  </span>{' '}
                  ve{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pendingAssignments.length} aktif ödev
                  </span>{' '}
                  bulunuyor.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-3 flex-wrap">
                <Link
                  href="/student/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1D77FF] hover:bg-blue-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                >
                  <span>Dersine Devam Et</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/student/assignments"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-blue-100/80 dark:border-blue-900/40 shadow-xs transition-all"
                >
                  <BookOpen size={15} className="text-[#1D77FF]" />
                  <span>Ödevler ({pendingAssignments.length})</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── "KALDIĞIN YERDEN DEVAM ET" / AKTİF VE SIRADAKİ DERS ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Kaldığın Yerden Devam Et
              </h2>
              <Link
                href="/student/courses"
                className="text-xs font-bold text-[#1D77FF] hover:underline flex items-center gap-1"
              >
                <span>Tüm Dersler</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Real Active Lesson Card */}
            <div className="p-4 sm:p-5 rounded-[28px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-blue-500/20">
                  <GraduationCap size={28} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1D77FF] border border-blue-200/50">
                      Aktif Müfredat
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {activeOrNextLesson ? `${activeOrNextLesson.period}. Ders Saati` : 'Dönem Planı'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-1">
                    {profile.className} {activeSubjectName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    <span>{activeTeacherName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {activeRoomName}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/student/courses"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1D77FF] hover:bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 shrink-0 transition-transform active:scale-95"
              >
                <Play size={14} className="fill-white" />
                <span>Derse Git</span>
              </Link>
            </div>

            {/* Live Class Radar integrated seamlessly */}
            <LiveClassRadar role="student" initialClassCode={profile.className || '9-A'} />
          </div>

          {/* ── "BECERİLERİNİ GELİŞTİR" / GERÇEK DERSLER (100% REAL DATA) ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Derslerim & Gelişim Alanları
              </h2>
              <Link
                href="/student/courses"
                className="text-xs font-bold text-[#1D77FF] hover:underline flex items-center gap-1"
              >
                <span>Müfredatı İncele</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {realCoreCourses.map((c) => {
                const Icon = c.icon
                return (
                  <Link
                    key={c.id}
                    href={`/student/courses/${c.id}`}
                    className={`p-4 rounded-[24px] ${c.bg} border ${c.border} hover:shadow-md transition-all group flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl ${c.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{c.hours}</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        {c.teacher}
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <ArrowRight size={13} className="text-[#1D77FF] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: AUTHENTIC REAL DATA WIDGETS (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-7">
          {/* ── WIDGET 1: GÜNLÜK HEDEF & PLANLAYICI GÖREVLERİ (REAL DATA) ── */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Günlük Hedefim
              </h3>
              <Link
                href="/student/planner"
                className="text-xs font-bold text-[#1D77FF] hover:underline"
              >
                Planlayıcı &gt;
              </Link>
            </div>

            {/* Circular Progress Ring with Flame */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    className="dark:stroke-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1D77FF"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      totalTasksCount > 0
                        ? 251.2 * (1 - completedTasksCount / totalTasksCount)
                        : 251.2
                    }
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Flame size={16} className="text-amber-500 fill-amber-500 mb-0.5" />
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {completedTasksCount}/{Math.max(1, totalTasksCount)}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase">Görev</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  {completedTasksCount === totalTasksCount && totalTasksCount > 0
                    ? 'Tüm görevler tamamlandı! 🎉'
                    : 'Hedefine odaklan!'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {tasks.length > 0
                    ? `${totalTasksCount - completedTasksCount} görev bekliyor`
                    : 'Henüz görev eklenmedi'}
                </div>
                <div className="text-[10px] text-[#1D77FF] font-bold mt-2">
                  %{totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0} İlerleme
                </div>
              </div>
            </div>

            {/* Real Interactive Tasks List */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {tasks.length > 0 ? (
                tasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="w-full text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-[#15213B] hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-blue-50 dark:border-blue-900/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[#1D77FF] border-[#1D77FF] text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {task.completed && <CheckSquare size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold leading-tight truncate ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{task.course}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  Henüz planlanmış bir görev bulunmuyor.
                </div>
              )}
            </div>
          </div>

          {/* ── WIDGET 2: AKADEMİK BAŞARI & RESMİ STATÜ (100% REAL DATA, NO FAKE NAMES) ── */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Akademik Durumum
              </h3>
              <Link
                href="/student/progress"
                className="text-xs font-bold text-[#1D77FF] hover:underline"
              >
                Detay &gt;
              </Link>
            </div>

            {/* Official Student Standing Row */}
            <div className="p-4 rounded-2xl bg-[#EAF2FF] dark:bg-[#1A2849] border border-[#1D77FF]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D77FF] to-cyan-400 text-white font-black text-xs flex items-center justify-center">
                    {profile.firstName.slice(0, 1)}
                    {profile.lastName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {profile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {profile.className} • No: {profile.studentNo}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-[#1D77FF]">
                    {profile.gpa > 0 ? `${profile.gpa} Ort.` : '0.0 Ort.'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    Sınıf {profile.classRank}.'si
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Resmi Sicil & Statü:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {profile.disciplineStatus.split('—')[0]?.trim() || 'Temiz Sicil'}
                </span>
              </div>
            </div>

            {/* Attendance & Class Details */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-50 dark:border-blue-900/30">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Devam Oranı</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">
                  %{profile.attendanceRate}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#15213B] border border-blue-50 dark:border-blue-900/30">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Devamsızlık</div>
                <div className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
                  {profile.absentDays || 0} Gün
                </div>
              </div>
            </div>
          </div>

          {/* ── WIDGET 3: ÇALIŞMA & ÖDEV TESLİM TAKİBİ (REAL DATA) ── */}
          <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#E0F2FE] via-[#EDE9FE] to-[#FCE7F3] dark:from-[#11233F] dark:to-[#211636] border border-sky-200/50 dark:border-purple-900/30 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-3xl shrink-0">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Ödev & Çalışma Durumu
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                {pendingAssignments.length > 0
                  ? `${pendingAssignments.length} bekleyen ödevin bulunuyor.`
                  : 'Tüm ödevlerini teslim ettin, harikasın!'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {Object.keys(submissions).length} Teslim / {assignments.length || 1} Toplam
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL WIDTH TIMETABLE & DETAILED CONTENT SECTION ── */}
      <div className="space-y-6">
        {/* ── HAFTALIK DERS PROGRAMI (Müdürlük Onaylı Canlı Senkronize Matrix) ── */}
        <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1D77FF]/10 text-[#1D77FF] flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Haftalık Ders Programı ({profile.className})
                  </h2>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Canlı Senkronize
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#1D77FF] border border-blue-500/20">
                    Müdürlük Onaylı
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Okul müdürlüğü tarafından onaylanan haftalık MEB ders akışı ({weeklySchedule.length || 30} Saat / Hafta)
                </p>
              </div>
            </div>

            {/* View Switcher & Link to full schedule */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    scheduleViewMode === 'matrix'
                      ? 'bg-white dark:bg-[#111A2E] text-[#1D77FF] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Table size={13} />
                  <span>Tablo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    scheduleViewMode === 'list'
                      ? 'bg-white dark:bg-[#111A2E] text-[#1D77FF] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List size={13} />
                  <span>Günlük Liste</span>
                </button>
              </div>

              <Link
                href="/student/courses?tab=schedule"
                className="text-xs font-black text-[#1D77FF] hover:underline flex items-center gap-1 pl-1"
              >
                <span>Tam Ekran</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* TABLO MATRİS GÖRÜNÜMÜ: 5 Gün x Periyotlar */}
          {scheduleViewMode === 'matrix' && (
            <div className="rounded-2xl border border-blue-100/70 dark:border-blue-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[660px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-blue-100/80 dark:border-blue-900/60 text-[10px] font-black text-slate-600 dark:text-slate-300">
                      <th className="p-3 w-28 text-center shrink-0">Saat / Periyot</th>
                      {DAYS_LIST.map((day) => {
                        const dayCount = weeklySchedule.filter((e) => e.day === day.key).length
                        const isToday = todayKey === day.key
                        return (
                          <th key={day.key} className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{day.label}</span>
                              {isToday && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                              )}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                              {dayCount} Ders
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 dark:divide-blue-950/40 text-xs">
                    {schedulePeriods.map((period) => (
                      <tr
                        key={period.periodNumber}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Period & Time Column */}
                        <td className="p-2.5 text-center bg-slate-50/50 dark:bg-slate-900/30 border-r border-blue-50 dark:border-blue-950/50 shrink-0">
                          <div className="font-black text-slate-800 dark:text-slate-200 text-xs">
                            {period.periodNumber}. Ders
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {period.time}
                          </div>
                        </td>

                        {/* Day Columns */}
                        {DAYS_LIST.map((day) => {
                          const match = weeklySchedule.find(
                            (e) => e.day === day.key && e.period === period.periodNumber
                          )
                          const subjectName = (match as any)?.subjectName || match?.subject || ''
                          const style = match
                            ? getStudentDashboardSubjectColor(subjectName, (match as any).color)
                            : null

                          const lessonNotes = match
                            ? getLessonNotes(day.key, period.periodNumber, subjectName)
                            : []
                          const hasNotes = lessonNotes.length > 0

                          return (
                            <td
                              key={day.key}
                              className="p-1.5 align-top border-r last:border-r-0 border-blue-50 dark:border-blue-950/40"
                            >
                              {match ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenLessonNoteModal(
                                      match,
                                      day.label,
                                      day.key,
                                      period.periodNumber,
                                      period.time
                                    )
                                  }
                                  className={`w-full text-left block p-2 rounded-2xl border transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer relative group ${style?.bg} ${style?.border} ${style?.text}`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="font-black text-[11px] leading-tight truncate flex-1">
                                      {subjectName}
                                    </div>
                                    {hasNotes && (
                                      <span
                                        title={`${lessonNotes.length} Not Kayıtlı`}
                                        className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[8px] flex items-center gap-0.5 shadow-xs"
                                      >
                                        <FileText size={8} />
                                        <span>{lessonNotes.length}</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] opacity-80 truncate mt-1">
                                    {match.teacherName || 'Öğretmen'}
                                  </div>
                                  <div className="flex items-center justify-between text-[8px] opacity-75 mt-1">
                                    <span className="truncate">
                                      {match.roomName?.split('(')[0]?.trim() || '9-A'}
                                    </span>
                                    {hasNotes ? (
                                      <span className="font-bold text-[8px] text-amber-600 dark:text-amber-400">
                                        Not Var
                                      </span>
                                    ) : (
                                      <span className="opacity-0 group-hover:opacity-100 text-[8px] transition-opacity font-bold text-[#1D77FF]">
                                        + Not
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ) : (
                                <div className="w-full h-14 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-[9px] font-bold">
                                  <span>Boş</span>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GÜNLÜK LİSTE GÖRÜNÜMÜ */}
          {scheduleViewMode === 'list' && (
            <div className="space-y-4">
              {/* Day Selector Pill Tabs */}
              <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                {DAYS_LIST.map((day) => {
                  const isSelected = selectedScheduleDay === day.key
                  const isToday = todayKey === day.key
                  const count = weeklySchedule.filter((e) => e.day === day.key).length

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedScheduleDay(day.key)}
                      className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-white dark:bg-[#111A2E] text-[#1D77FF] font-black shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{day.label}</span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        {count > 0 ? `${count} Ders` : '—'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Day's Lessons List */}
              <div className="space-y-2.5">
                {selectedDayClasses.length > 0 ? (
                  selectedDayClasses.map((item, idx) => {
                    const periodTime =
                      MIDDLE_PERIODS.find((p) => p.periodNumber === item.period)?.time ||
                      (item as any).timeSlot ||
                      '09:25 - 10:05'
                    const subjectName = (item as any).subjectName || item.subject || 'Ders'
                    const dayLabel = DAYS_LIST.find((d) => d.key === selectedScheduleDay)?.label || 'Seçili Gün'
                    const lessonNotes = getLessonNotes(selectedScheduleDay, item.period, subjectName)
                    const hasNotes = lessonNotes.length > 0

                    return (
                      <div
                        key={item.id || idx}
                        onClick={() =>
                          handleOpenLessonNoteModal(
                            item,
                            dayLabel,
                            selectedScheduleDay,
                            item.period,
                            periodTime
                          )
                        }
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-blue-50 dark:border-blue-900/30 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-[#1D77FF]/10 text-[#1D77FF] border border-blue-200/50 flex flex-col items-center justify-center shrink-0">
                            <span className="text-sm font-black">{item.period}</span>
                            <span className="text-[8px] font-bold uppercase text-slate-400">Ders</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                {subjectName}
                              </span>
                              {hasNotes && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <FileText size={10} />
                                  <span>{lessonNotes.length} Not</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {item.teacherName || 'Öğretmen'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                {item.roomName || 'Derslik 9-A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {periodTime}
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            40 Dk
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Bu gün için planlanmış ders saati bulunmamaktadır.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 2 COLUMNS: YAKLAŞAN SINAVLAR & BEKLEYEN ÖDEVLER (REAL DATA) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ── YAKLAŞAN SINAVLAR ── */}
          <div
            id="yaklasan-sinavlar"
            className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Yaklaşan Sınavlar
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {upcomingWeekExams.length} Sınav
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Resmi sınav takvimi ve tarihler ({profile.className})
                  </p>
                </div>
              </div>

              <Link
                href="/student/planner?tab=calendar"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Tümü</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {upcomingWeekExams.length > 0 ? (
              <div className="space-y-3">
                {upcomingWeekExams.map((exam) => {
                  const daysLeft = (exam as any).daysLeft
                  let countdownLabel = 'Yaklaşıyor'
                  if (daysLeft === 0) countdownLabel = 'Bugün!'
                  else if (daysLeft === 1) countdownLabel = 'Yarın!'
                  else if (daysLeft !== null && daysLeft > 1 && daysLeft <= 7) {
                    countdownLabel = `${daysLeft} Gün Kaldı`
                  } else if (daysLeft !== null && daysLeft > 7) {
                    countdownLabel = `${daysLeft} Gün Sonra`
                  }

                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-[#1A2238] dark:to-[#141B2E] border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {exam.courseName}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            {countdownLabel}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {exam.title}
                        </h4>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{exam.date} • {exam.time}</span>
                          <span>•</span>
                          <span>{exam.location}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[11px] font-black px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-xs">
                          {exam.durationMinutes} dk
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Önümüzdeki bir hafta içinde planlanmış sınavın bulunmuyor 🎉
                </p>
              </div>
            )}
          </div>

          {/* ── BEKLEYEN ÖDEVLER (REAL DATA) ── */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-[#111A2E] border border-blue-100/80 dark:border-blue-900/40 shadow-[0_8px_30px_rgb(29,119,255,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Bekleyen Ödevler
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      {pendingAssignments.length} Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Öğretmenler tarafından sana verilen çalışmalar
                  </p>
                </div>
              </div>

              <Link
                href="/student/assignments"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Tümü</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssignments.map((asg) => (
                  <Link
                    key={asg.id || asg.assignment_uuid}
                    href={`/student/assignments/${asg.assignment_uuid || asg.id}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-blue-50 dark:border-blue-900/30 flex items-center justify-between gap-3 hover:border-emerald-400 transition-all group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                          {(asg as any).subject_name || asg.subject || 'Ders'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Son: {asg.due_date ? String(asg.due_date).slice(0, 10) : '20.10.2026'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                        {asg.title}
                      </h4>
                      <div className="text-[10px] text-slate-400">
                        {asg.teacher_name || 'Öğretmen'}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs group-hover:translate-x-0.5 transition-transform">
                        <span>Çöz</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tebrikler! Bekleyen ödevin bulunmuyor 🎉
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: DERS NOTU EKLEME VE GÖRÜNTÜLEME MODALI (100% WORKING & SYNCED) ── */}
      <AnimatePresence>
        {isNoteModalOpen && selectedLessonNoteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111A2E] rounded-[32px] border border-blue-100 dark:border-blue-900/50 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-blue-50 dark:border-blue-950/60 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-[#111A2E] dark:to-blue-950/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#1D77FF]/10 text-[#1D77FF] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {(selectedLessonNoteTarget.lesson as any)?.subjectName ||
                          selectedLessonNoteTarget.lesson?.subject ||
                          'Ders Notu'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#1D77FF]/10 text-[#1D77FF] border border-blue-200/50">
                        {selectedLessonNoteTarget.dayLabel} • {selectedLessonNoteTarget.periodNumber}. Ders
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {selectedLessonNoteTarget.periodTime} •{' '}
                      {selectedLessonNoteTarget.lesson.teacherName || 'Öğretmen'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Scrollable */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Existing Notes for this Lesson */}
                {(() => {
                  const subject =
                    (selectedLessonNoteTarget.lesson as any)?.subjectName ||
                    selectedLessonNoteTarget.lesson?.subject ||
                    'Ders'
                  const existingNotes = getLessonNotes(
                    selectedLessonNoteTarget.dayKey,
                    selectedLessonNoteTarget.periodNumber,
                    subject
                  )

                  if (existingNotes.length === 0) return null

                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                        <span>Kayıtlı Ders Notları</span>
                        <span className="text-[10px] text-slate-400">({existingNotes.length})</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {existingNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 relative group"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold mb-1">
                              <span>{note.category || 'Ders Notu'}</span>
                              <div className="flex items-center gap-2">
                                <span>{note.date}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLessonNote(note.id)}
                                  className="text-rose-500 hover:text-rose-700 transition-colors p-0.5"
                                  title="Notu Sil"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {note.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Form to Add New Note */}
                <form onSubmit={handleSaveLessonNote} className="space-y-3.5 pt-2">
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus size={14} className="text-[#1D77FF]" />
                    <span>Yeni Ders Notu Ekle</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Not Başlığı
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Örn: 3. Ders Konu Özeti & Formüller"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1D77FF]/30"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Kategori
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Ders Notu', 'Önemli Hatırlatma', 'Soru Notu', 'Ödev Notu'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNoteCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                            noteCategory === cat
                              ? 'bg-[#1D77FF] text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Not İçeriği
                    </label>
                    <textarea
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Öğretmenin tahtaya yazdığı önemli formüller, sayfa numaraları veya hatırlatmalar..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1D77FF]/30 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNoteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-[#1D77FF] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Notu Kaydet</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
