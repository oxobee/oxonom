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
  if (color === 'emerald' || sub.includes('fen') || sub.includes('fizik') || sub.includes('kimya') || sub.includes('biyoloji') || sub.includes('din')) {
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
  if (color === 'pink' || sub.includes('görsel') || sub.includes('sanat') || sub.includes('müzik') || sub.includes('rehberlik')) {
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

  // Active day selection in the weekly schedule tabs (defaults to today's weekday, or Monday on weekend)
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

    // Fetch from /api/schedule for cross-browser, cross-device & incognito synchronization
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
          if (data && Array.isArray(data.exams) && data.exams.length > 0) {
            try {
              localStorage.setItem('oxonom_school_exam_calendar', JSON.stringify(data.exams))
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

  // Dynamically determine period rows: only show periods that actually exist (no empty 7th period!)
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
    // Default to 6 periods (30 hours/week) matching 9-A curriculum
    return MIDDLE_PERIODS.filter((p) => p.periodNumber <= 6)
  }, [weeklySchedule])

  // Today's Day Key in Turkish schedule format (mon, tue, wed, thu, fri)
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

  // Classes for the selected schedule day
  const selectedDayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === selectedScheduleDay)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, selectedScheduleDay])

  // Today's total scheduled hours
  const todayClassesCount = useMemo(() => {
    return weeklySchedule.filter((e) => e.day === todayKey).length || 7
  }, [weeklySchedule, todayKey])

  // Pending assignments: exclude already submitted assignments, take top 4 items for 2x2 grid
  const pendingAssignments = useMemo(() => {
    return assignments
      .filter((asg) => {
        const id = String(asg.assignment_uuid || asg.id)
        return !submissions[id]
      })
      .slice(0, 4)
  }, [assignments, submissions])

  // Helper to parse exam dates
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

  // Yaklaşan Sınavlar: Son 1 hafta içinde olan ve en yakın yaklaşan sınavlar
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

    // Filter for upcoming within 1 week (0 to 7 days)
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
  const totalTasksCount = tasks.length || 4

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 lg:p-8 text-white shadow-xl shadow-cyan-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles size={14} className="text-yellow-300" />
              <span>Oxonom EDU Akademik Dönem 2025-2026</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
              Hoş geldin, {profile.firstName}! 👋
            </h1>
            <p className="text-cyan-100 text-xs lg:text-sm max-w-xl leading-relaxed">
              Bugün {profile.className} şubesinde seni bekleyen {todayClassesCount} ders saati ve {pendingAssignments.length} aktif çalışma bulunuyor.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-yellow-300 font-black text-lg">
              <Award size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-200 flex items-center gap-1.5">
                <span>Akademik Başarı</span>
              </div>
              <div className="text-xl font-extrabold">{profile.gpa} Ort.</div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                {profile.gpa >= 85
                  ? (profile.disciplineStatus.split('—')[1]?.trim() || 'Örnek Öğrenci Onur Belgesi')
                  : profile.gpa >= 60
                  ? 'Gelişim Süreci Devam Ediyor'
                  : 'Akademik Destek & Birebir Etüt'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 QUICK KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card 1: Sınıf ve Şube */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Sınıf & No</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
              {profile.className} · #{profile.studentNo}
            </div>
          </div>
        </div>

        {/* Card 2: Bekleyen Ödevler */}
        <Link
          href="/student/assignments"
          className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5 hover:border-emerald-400/50 transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Bekleyen Ödev</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{pendingAssignments.length} Ödev</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 3: Yaklaşan Sınavlar */}
        <a
          href="#yaklasan-sinavlar"
          className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5 hover:border-amber-400/50 transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileCheck size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Yaklaşan Sınavlar</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{upcomingWeekExams.length} Sınav Yayında</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </a>

        {/* Card 4: Devamlılık */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Devam Durumu</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              %{profile.attendanceRate} (0 Devamsızlık)
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): Bugünün Ders Programı & Bekleyen Ödevler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Canlı Ders & Zaman Radarı */}
          <LiveClassRadar role="student" initialClassCode={profile.className || '9-A'} />

          {/* Haftalık Ders Programı (Müdürlük Tarafından Ayarlanan Güncel Program) */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Haftalık Ders Programı ({profile.className})
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Canlı Senkronize
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                      Müdürlük Onaylı
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Okul müdürlüğü tarafından onaylanan haftalık MEB ders akışı ({weeklySchedule.length || 35} Saat / Hafta)
                  </p>
                </div>
              </div>

              {/* View Switcher & Link to full schedule */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('matrix')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scheduleViewMode === 'matrix'
                        ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-cyan-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Table size={13} />
                    <span>Tablo (Varsayılan)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleViewMode('list')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      scheduleViewMode === 'list'
                        ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-cyan-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <List size={13} />
                    <span>Günlük Liste</span>
                  </button>
                </div>

                <Link
                  href="/student/courses?tab=schedule"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 pl-1"
                >
                  <span>Tam Program</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* TABLO MATRİS GÖRÜNÜMÜ (VARSAYILAN): 5 Gün x 7 Periyot */}
            {scheduleViewMode === 'matrix' && (
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[660px]">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-800 text-[10px] font-black text-gray-600 dark:text-gray-300">
                        <th className="p-2.5 w-24 text-center shrink-0">Saat / Periyot</th>
                        {DAYS_LIST.map((day) => {
                          const dayCount = weeklySchedule.filter((e) => e.day === day.key).length
                          const isToday = todayKey === day.key
                          return (
                            <th key={day.key} className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span>{day.label}</span>
                                {isToday && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                                )}
                              </div>
                              <div className="text-[9px] font-medium text-gray-400">
                                {dayCount} Ders
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                      {schedulePeriods.map((period) => (
                        <tr key={period.periodNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          {/* Saat ve Periyot Kolonu */}
                          <td className="p-2 text-center bg-gray-50/40 dark:bg-gray-900/40 border-r border-gray-100 dark:border-gray-800/60 shrink-0">
                            <div className="font-black text-gray-900 dark:text-white text-[11px]">
                              {period.periodNumber}. Ders
                            </div>
                            <div className="text-[9px] text-gray-400 font-mono">
                              {period.time}
                            </div>
                          </td>

                          {/* Gün Kolonları (Pazartesi .. Cuma) */}
                          {DAYS_LIST.map((day) => {
                            const match = weeklySchedule.find(
                              (e) => e.day === day.key && e.period === period.periodNumber
                            )
                            const subjectName = (match as any)?.subjectName || match?.subject || ''
                            const style = match ? getStudentDashboardSubjectColor(subjectName, (match as any).color) : null

                            const lessonNotes = match ? getLessonNotes(day.key, period.periodNumber, subjectName) : []
                            const hasNotes = lessonNotes.length > 0

                            return (
                              <td
                                key={day.key}
                                className="p-1 align-top border-r last:border-r-0 border-gray-100 dark:border-gray-800/60"
                              >
                                {match ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLessonNoteModal(match, day.label, day.key, period.periodNumber, period.time)}
                                    className={`w-full text-left block p-1.5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer relative group ${style?.bg} ${style?.border} ${style?.text}`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div className="font-black text-[10px] leading-tight truncate flex-1">
                                        {subjectName}
                                      </div>
                                      {hasNotes && (
                                        <span
                                          title={`${lessonNotes.length} Not Kayıtlı`}
                                          className="shrink-0 px-1 py-0.2 rounded bg-amber-500 text-white font-black text-[8px] flex items-center gap-0.5 shadow-xs"
                                        >
                                          <FileText size={8} />
                                          <span>{lessonNotes.length}</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] opacity-90 truncate mt-0.5">
                                      {match.teacherName || 'Öğretmen'}
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] opacity-75 mt-0.5">
                                      <span className="truncate">{match.roomName?.split('(')[0]?.trim() || '9-A'}</span>
                                      {hasNotes ? (
                                        <span className="font-bold text-[8px] text-amber-600 dark:text-amber-400">
                                          Not Var
                                        </span>
                                      ) : (
                                        <span className="opacity-0 group-hover:opacity-100 text-[8px] transition-opacity font-bold">
                                          + Not Ekle
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ) : (
                                  <div className="w-full h-12 rounded-xl border border-dashed border-gray-200 dark:border-gray-800/80 flex flex-col items-center justify-center text-gray-400 text-[9px] font-bold">
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
              <div className="space-y-3">
                {/* Day Selector Tabs (Pazartesi .. Cuma) */}
                <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
                  {DAYS_LIST.map((day) => {
                    const isSelected = selectedScheduleDay === day.key
                    const isToday = todayKey === day.key
                    const count = weeklySchedule.filter((e) => e.day === day.key).length

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedScheduleDay(day.key)}
                        className={`relative py-2 px-1.5 sm:px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-white dark:bg-[#0E1526] text-blue-600 dark:text-cyan-400 font-extrabold shadow-xs'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-xs tracking-tight">{day.label}</span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Bugün" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium hidden sm:inline">
                          {count > 0 ? `${count} Ders` : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Timetable slots for the selected day */}
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
                          onClick={() => handleOpenLessonNoteModal(item, dayLabel, selectedScheduleDay, item.period, periodTime)}
                          className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3 hover:border-indigo-400/50 hover:bg-gray-100/50 dark:hover:bg-[#17223b] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                              <span className="text-sm font-black">{item.period}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Ders</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                                  {subjectName}
                                </span>
                                {hasNotes && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    <FileText size={10} />
                                    <span>{lessonNotes.length} Not Kayıtlı</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {item.teacherName || 'Ebru TEKNECİ'}
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-gray-400">
                                  <MapPin size={11} />
                                  {item.roomName || 'Derslik 9-A (1. Kat)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                              {periodTime}
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              40 Dk
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 dark:bg-[#131C31] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                      Bu gün için planlanmış ders saati bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Yaklaşan Sınavlar (Ders Programının Hemen Altında) */}
          <div
            id="yaklasan-sinavlar"
            className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Yaklaşan Sınavlar
                    </h2>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      Son 1 Hafta / Yaklaşanlar
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Öğretmenler tarafından planlanan ve yaklaşan resmi sınav takvimi ({profile.className})
                  </p>
                </div>
              </div>

              <Link
                href="/student/planner?tab=calendar"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
              >
                <span>Tüm Sınav Takvimini Gör</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {upcomingWeekExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {upcomingWeekExams.map((exam) => {
                  const isQuiz = exam.type === 'quiz'
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
                      className="p-4.5 rounded-2xl bg-gradient-to-br from-white to-amber-50/30 dark:from-[#131C31] dark:to-[#172036] border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {/* Course & Countdown Badge */}
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {exam.courseName}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Clock size={11} className="text-amber-500" />
                            {countdownLabel}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                          {exam.title}
                        </h3>

                        {/* Scope */}
                        {exam.scope && (
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/40 dark:border-amber-800/30">
                            <span className="font-bold text-gray-800 dark:text-gray-200">Kapsam: </span>
                            {exam.scope}
                          </p>
                        )}
                      </div>

                      {/* Footer Info: Date, Time, Room, Duration */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/60 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-amber-500" />
                            {exam.date}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-semibold">
                            <Clock size={12} className="text-indigo-500" />
                            {exam.time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-500" />
                            {exam.location}
                          </span>
                          <span>{exam.durationMinutes} dakika</span>
                        </div>

                        {exam.teacherName && (
                          <div className="text-[10px] text-gray-400 pt-0.5">
                            Öğretmen: <span className="font-semibold text-gray-700 dark:text-gray-300">{exam.teacherName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#131C31] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Önümüzdeki bir hafta içinde planlanmış sınavın bulunmuyor 🎉
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Dönemlik sınav tarihlerini Sınav Takvimi ekranından takip edebilirsin.
                </p>
              </div>
            )}
          </div>

          {/* Bekleyen Ödevler Kartları (Öğretmenin Öğrenciye/Sınıfına Verdiği Ödevler) */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Bekleyen ve Güncel Ödevler
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {pendingAssignments.length} Aktif Görev
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Öğretmenler tarafından {profile.className} şubesine ve sana özel verilen ödevler
                  </p>
                </div>
              </div>
              <Link
                href="/student/assignments"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Ödevlere Git</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pendingAssignments.map((asg) => {
                  const isIndividual =
                    asg.target_type === 'INDIVIDUAL' ||
                    (asg as any).tool_data?.targetType === 'INDIVIDUAL'
                  const toolType = asg.tool_type || (asg as any).category
                  let toolLabel = 'Çalışma Görevi'
                  if (toolType === 'WHITEBOARD') toolLabel = 'Akıllı Tahta'
                  else if (toolType === 'WORKSHEET') toolLabel = 'Çalışma Föyü'
                  else if (toolType === 'READING') toolLabel = 'Okuma & Tahlil'
                  else if (toolType === 'QUIZ') toolLabel = 'Online Quiz'

                  return (
                    <Link
                      key={asg.id || asg.assignment_uuid}
                      href={`/student/assignments/${asg.assignment_uuid || asg.id}`}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 hover:border-emerald-400/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {(asg as any).subject_name || asg.subject || 'Türk Dili ve Edebiyatı'}
                            </span>
                            {isIndividual ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                🎯 Sana Özel
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                👥 9-A Şubesi
                              </span>
                            )}
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {toolLabel}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                            <Clock size={11} />
                            {asg.due_date ? String(asg.due_date).slice(0, 10) : '20.10.2026'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                          {asg.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {asg.description || 'Ödev detayları ve çalışma föyü talimatlarını inceleyin.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/40 dark:border-gray-800/40 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {asg.teacher_name || 'Ebru TEKNECİ'}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>İncele & Teslim Et</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#131C31] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Tebrikler! Bekleyen ödevin bulunmuyor 🎉
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Öğretmenin tarafından verilen tüm ders ödevlerini başarıyla teslim ettin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Günlük Çalışma Hedefleri, Sınavlar & Duyurular */}
        <div className="space-y-6">
          {/* Günlük Hedefler / Yapılacaklar */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Günlük Çalışma Hedefim
                </h3>
              </div>
              <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                {completedTasksCount}/{totalTasksCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedTasksCount / totalTasksCount) * 100}%` }}
              />
            </div>

            {/* Task Checklist */}
            <div className="space-y-2 pt-1">
              {tasks.slice(0, 4).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-gray-50 dark:bg-[#131C31] hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-200/50 dark:border-gray-800/50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {task.completed && <CheckSquare size={12} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        task.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{task.course}</span>
                  </div>
                </button>
              ))}
            </div>

            <Link
              href="/student/planner"
              className="w-full py-2 rounded-xl text-center block text-xs font-bold text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Ajandayı ve Tüm Görevleri Gör →
            </Link>
          </div>

          {/* Rehber Öğretmen Değerlendirmesi & Pedagojik Not */}
          {guidanceNotes.length > 0 && (
            <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    Rehber Öğretmen Değerlendirmesi
                  </h3>
                </div>
                <Link
                  href="/student/progress"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Tüm Görüşler
                </Link>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0E1526]/80 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                    {guidanceNotes[0].author}
                  </span>
                  <span className="text-gray-400 font-medium">{guidanceNotes[0].date}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  "{guidanceNotes[0].content}"
                </p>
              </div>
            </div>
          )}

          {/* Son Duyurular */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-blue-500" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Okul ve Sınıf Duyurusu
                </h3>
              </div>
              <Link
                href="/student/communication"
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Tümü
              </Link>
            </div>

            <div className="space-y-2.5">
              {STUDENT_ANNOUNCEMENTS.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {ann.author}
                    </span>
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: DERS NOTU EKLEME VE GÖRÜNTÜLEME MODALI ── */}
      <AnimatePresence>
        {isNoteModalOpen && selectedLessonNoteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 dark:from-indigo-950/20 dark:via-[#0E1526] dark:to-indigo-950/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {(selectedLessonNoteTarget.lesson as any)?.subjectName ||
                          selectedLessonNoteTarget.lesson?.subject ||
                          'Ders Notu'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {selectedLessonNoteTarget.dayLabel} · {selectedLessonNoteTarget.periodNumber}. Ders
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {selectedLessonNoteTarget.periodTime} · {selectedLessonNoteTarget.lesson.teacherName || 'Öğretmen'} · {selectedLessonNoteTarget.lesson.roomName || 'Derslik 9-A'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Scrollable */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
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
                    <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50">
                      <div className="flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-amber-600" />
                          <span>Bu Derse Ait Kayıtlı Notlar ({existingNotes.length})</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          Defterim & Planlayıcım ile Eşitlendi
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                        {existingNotes.map((nt: any) => (
                          <div
                            key={nt.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#131C31] border border-amber-200/80 dark:border-amber-900/60 flex items-start justify-between gap-2 shadow-xs"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                                  {nt.title}
                                </h5>
                                <span className="text-[10px] text-gray-400 shrink-0 font-medium ml-2">
                                  {nt.date}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {nt.content}
                              </p>
                              {nt.category && (
                                <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  #{nt.category}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteLessonNote(nt.id)}
                              title="Notu Sil"
                              className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Add New Note Form */}
                <form onSubmit={handleSaveLessonNote} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span>Not Başlığı</span>
                      <span className="text-[10px] text-gray-400 font-normal">Zorunlu</span>
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Örn: 3. Ders Konu Tekrarı & Önemli Formüller"
                      className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Kategori Seçici */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Not Kategorisi
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Ders Notu', 'Önemli Soru', 'Ödev Hatırlatıcısı', 'Sınav Notu'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNoteCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            noteCategory === cat
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span>Ders Notu İçeriği</span>
                      <span className="text-[10px] text-gray-400 font-normal">Zorunlu</span>
                    </label>
                    <textarea
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Bu ders sırasında öğretmenin tahtaya yazdığı önemli formülleri, çözülen soruları veya hatırlatıcıları buraya yaz..."
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300">
                    <FileText size={15} className="shrink-0 text-indigo-500" />
                    <span>
                      Bu not otomatik olarak <strong>Defterim ve Planlayıcım</strong> alanına kaydedilecek ve ilgili ders kartında <strong>Not Var</strong> rozetiyle gösterilecektir.
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setIsNoteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Kapat
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Notu Kaydet ve Ekle</span>
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
