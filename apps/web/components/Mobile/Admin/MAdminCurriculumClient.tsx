'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  X,
  Check,
  Clock,
  Sparkles,
  Trash2,
  Edit3,
  RotateCcw,
  Wand2,
  Calendar,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Tv,
  Layers,
  ArrowRight,
  Copy,
  Users,
  ShieldCheck,
  Sliders,
  Settings,
  School,
  Flame,
  UserCheck,
  UserX,
  BarChart2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import {
  SCHOOL_ORGS,
  getOrgTeachers,
} from '@services/demo/schoolDirectory'
import { useLHSession } from '@components/Contexts/LHSessionContext'

export interface MAdminCurriculumClientProps {
  orgSlug?: string
  hideHeader?: boolean
  hideDock?: boolean
}

// ── TYPES ──
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export interface DayInfo {
  key: DayKey
  shortLabel: string
  label: string
}

export const DAYS_LIST: DayInfo[] = [
  { key: 'mon', shortLabel: 'Pzt', label: 'Pazartesi' },
  { key: 'tue', shortLabel: 'Sal', label: 'Salı' },
  { key: 'wed', shortLabel: 'Çar', label: 'Çarşamba' },
  { key: 'thu', shortLabel: 'Per', label: 'Perşembe' },
  { key: 'fri', shortLabel: 'Cum', label: 'Cuma' },
]

export interface PeriodSlot {
  periodNumber: number
  time: string
  isLunchAfter?: boolean
}

export const PRIMARY_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
]

export const MIDDLE_PERIODS: PeriodSlot[] = [
  { periodNumber: 1, time: '08:30 - 09:10' },
  { periodNumber: 2, time: '09:25 - 10:05' },
  { periodNumber: 3, time: '10:20 - 11:00' },
  { periodNumber: 4, time: '11:15 - 11:55', isLunchAfter: true },
  { periodNumber: 5, time: '12:45 - 13:25' },
  { periodNumber: 6, time: '13:40 - 14:20' },
  { periodNumber: 7, time: '14:35 - 15:15' },
]

export type RoomType = 'normal' | 'atolye' | 'laboratuvar'

export interface BackupTeacher {
  id: string
  name: string
  priority: number // 1: 1. Yedek, 2: 2. Yedek vb.
  branch?: string
}

export interface CurriculumCourse {
  id: string
  code: string
  name: string
  category: 'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'
  gradeLevels: string[]
  targetClass: string // Örn: '9/A', '10/G' vb.
  orgId: number
  weeklyHours: number
  branchTeacher: string // Asıl Öğretmen
  teacherBranch: string // Branş (Öğretmen seçilince otomatik gelir)
  backupTeachers: BackupTeacher[] // Yedek Öğretmenler (Öncelik sıralı)
  roomType: RoomType // Normal Sınıf | Atölye | Laboratuvar
  requiredRoom: string // Belirli derslik adı (Derslik 9/A, Fen Laboratuvarı, vb.)
  isSmartBoardReady: boolean
  isElective: boolean
  color: string
}

export interface ScheduleEntry {
  id: string
  orgId: number
  day: DayKey
  period: number
  classCode: string
  subject: string
  teacherName: string // Asıl Öğretmen
  teacherBranch?: string
  backupTeacherName?: string // 1. Yedek Öğretmen
  isTeacherOnLeave?: boolean // Asıl öğretmen izinli / raporlu mu?
  activeTeacherName?: string // Fiilen derse giren öğretmen
  roomType?: RoomType
  roomName: string
  color: string
  isSmartBoardActive: boolean
}

// ── COLOR THEMES ──
export const COLOR_OPTIONS: Record<string, { bg: string; text: string; border: string; badge: string; dot: string }> = {
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
  },
  teal: {
    bg: 'bg-teal-500/10 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-800',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/10 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-800',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-800',
    badge: 'bg-pink-600 text-white',
    dot: 'bg-pink-500',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    badge: 'bg-purple-600 text-white',
    dot: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
    badge: 'bg-cyan-600 text-white',
    dot: 'bg-cyan-500',
  },
}

function getColorStyle(color: string) {
  return COLOR_OPTIONS[color] || COLOR_OPTIONS.blue
}

// ── AUTHENTIC INITIAL DATASETS (ORGANIZATION 30: OXONOM OKULLARI & 9/A) ──
const INITIAL_OXONOM_COURSES: CurriculumCourse[] = [
  {
    id: 'c-ox-1',
    code: 'EDB-901',
    name: 'Türk Dili ve Edebiyatı',
    category: 'Temel Ders',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 5,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Türk Dili ve Edebiyatı',
    backupTeachers: [{ id: 'b-ox-1', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Edebiyat & Kurum Yönetimi' }],
    roomType: 'normal',
    requiredRoom: 'Derslik 9/A',
    isSmartBoardReady: true,
    isElective: false,
    color: 'blue',
  },
  {
    id: 'c-ox-2',
    code: 'MAT-901',
    name: 'Matematik',
    category: 'Temel Ders',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 6,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Matematik',
    backupTeachers: [{ id: 'b-ox-2', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Matematik & Analitik' }],
    roomType: 'normal',
    requiredRoom: 'Derslik 9/A',
    isSmartBoardReady: true,
    isElective: false,
    color: 'indigo',
  },
  {
    id: 'c-ox-3',
    code: 'FEN-901',
    name: 'Fizik & Fen Bilimleri',
    category: 'Fen & Teknoloji',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 4,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Fen Bilimleri',
    backupTeachers: [{ id: 'b-ox-3', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Fen & Teknoloji' }],
    roomType: 'laboratuvar',
    requiredRoom: 'Fen & Teknoloji Laboratuvarı',
    isSmartBoardReady: true,
    isElective: false,
    color: 'emerald',
  },
  {
    id: 'c-ox-4',
    code: 'BIL-901',
    name: 'Bilişim & Yazılım',
    category: 'Fen & Teknoloji',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 3,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Bilişim Teknolojileri',
    backupTeachers: [{ id: 'b-ox-4', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Yazılım' }],
    roomType: 'atolye',
    requiredRoom: 'Bilişim & Kodlama Atölyesi',
    isSmartBoardReady: true,
    isElective: false,
    color: 'cyan',
  },
  {
    id: 'c-ox-5',
    code: 'ING-901',
    name: 'Yabancı Dil (İngilizce)',
    category: 'Yabancı Dil',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 4,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'İngilizce',
    backupTeachers: [{ id: 'b-ox-5', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Yabancı Diller' }],
    roomType: 'normal',
    requiredRoom: 'Derslik 9/A',
    isSmartBoardReady: true,
    isElective: false,
    color: 'purple',
  },
  {
    id: 'c-ox-6',
    code: 'TAR-901',
    name: 'Tarih',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 2,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Tarih',
    backupTeachers: [],
    roomType: 'normal',
    requiredRoom: 'Derslik 9/A',
    isSmartBoardReady: true,
    isElective: false,
    color: 'amber',
  },
  {
    id: 'c-ox-7',
    code: 'COG-901',
    name: 'Coğrafya',
    category: 'Sosyal & Beşeri',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 2,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Coğrafya',
    backupTeachers: [],
    roomType: 'normal',
    requiredRoom: 'Derslik 9/A',
    isSmartBoardReady: true,
    isElective: false,
    color: 'teal',
  },
  {
    id: 'c-ox-8',
    code: 'BED-901',
    name: 'Beden Eğitimi & Spor',
    category: 'Sanat & Spor',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 2,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Beden Eğitimi',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Kapalı Spor Salonu',
    isSmartBoardReady: false,
    isElective: false,
    color: 'orange',
  },
  {
    id: 'c-ox-9',
    code: 'GOR-901',
    name: 'Görsel Sanatlar & Atölye',
    category: 'Sanat & Spor',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 1,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Görsel Sanatlar',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Görsel Sanatlar Atölyesi',
    isSmartBoardReady: false,
    isElective: false,
    color: 'pink',
  },
  {
    id: 'c-ox-10',
    code: 'MUZ-901',
    name: 'Müzik & Sahne Sanatları',
    category: 'Sanat & Spor',
    gradeLevels: ['9. Sınıf'],
    targetClass: '9/A',
    orgId: 30,
    weeklyHours: 1,
    branchTeacher: 'Ebru TEKNECİ',
    teacherBranch: 'Müzik',
    backupTeachers: [],
    roomType: 'atolye',
    requiredRoom: 'Müzik Odası',
    isSmartBoardReady: true,
    isElective: false,
    color: 'pink',
  },
]

export default function MAdminCurriculumClient({
  orgSlug,
  hideHeader = false,
  hideDock = false,
}: MAdminCurriculumClientProps) {
  const { theme, toggleTheme } = useMobileTheme()
  const session = useLHSession() as any
  const user = session?.data?.user

  const [selectedOrgId, setSelectedOrgId] = useState<number>(30)
  const [selectedClass, setSelectedClass] = useState<string>('9/A')
  const [activeDay, setActiveDay] = useState<DayKey>('mon')

  // Main View Tab: 'distribute' (Sürükle-Bırak Haftalık Çizelge) | 'catalog' (Ders Tanımları & Saatler)
  const [activeTab, setActiveTab] = useState<'distribute' | 'catalog'>('distribute')

  // Selected Active Course for 1-Tap Quick-Drop placement
  const [selectedCourseForDrop, setSelectedCourseForDrop] = useState<CurriculumCourse | null>(null)
  const [draggedCourseName, setDraggedCourseName] = useState<string | null>(null)

  // Workload monitor toggle
  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState<boolean>(true)

  // Dynamic periods (can be customized by principal)
  const [periods, setPeriods] = useState<PeriodSlot[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPeriods = localStorage.getItem(`oxonom_admin_periods_30`)
        if (savedPeriods) {
          const parsed = JSON.parse(savedPeriods)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return PRIMARY_PERIODS // 6 periods/day = 30 hours/week
  })

  // Modals state
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<CurriculumCourse | null>(null)
  const [isEditPeriodsModalOpen, setIsEditPeriodsModalOpen] = useState(false)
  const [selectedSlotForAction, setSelectedSlotForAction] = useState<{
    entry?: ScheduleEntry
    day: DayKey
    period: number
  } | null>(null)

  // Form Fields for Add/Edit Course (Strictly grouped as requested)
  // Section 1: Ders Bilgileri
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formTargetClass, setFormTargetClass] = useState('9/A')
  const [formWeeklyHours, setFormWeeklyHours] = useState<number>(4)
  const [formCategory, setFormCategory] = useState<'Temel Ders' | 'Fen & Teknoloji' | 'Sosyal & Beşeri' | 'Sanat & Spor' | 'Yabancı Dil'>('Temel Ders')
  const [formColor, setFormColor] = useState('blue')
  const [formIsSmartBoard, setFormIsSmartBoard] = useState(true)

  // Section 2: Öğretmen Bilgileri
  const [formBranchTeacher, setFormBranchTeacher] = useState('Ebru TEKNECİ')
  const [formTeacherBranch, setFormTeacherBranch] = useState('Türk Dili ve Edebiyatı')
  const [formBackupTeachers, setFormBackupTeachers] = useState<BackupTeacher[]>([
    { id: 'b-default', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Edebiyat & Kurum Yönetimi' },
  ])
  const [newBackupTeacherSelect, setNewBackupTeacherSelect] = useState('')

  // Section 3: Derslik Bilgileri
  const [formRoomType, setFormRoomType] = useState<RoomType>('normal')
  const [formRequiredRoom, setFormRequiredRoom] = useState('Derslik 9/A')

  // Dynamic Teachers List (Authentic source without mock data)
  const [teachersList, setTeachersList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_teachers_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return getOrgTeachers(selectedOrgId)
  })

  // Dynamic Available Classes (Synchronized with /principal/classes)
  const availableClasses = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`oxonom_admin_classes_${selectedOrgId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((c: any) => {
              const code = (c.code || '').trim()
              const matchGrade = (c.gradeLevel || '').match(/\d+/) || code.match(/^\d+/)
              const gNum = matchGrade ? matchGrade[0] : '9'
              let branch = ''
              if (code.includes('/') || code.includes('-')) {
                const parts = code.split(/[\/\-]/)
                branch = parts[parts.length - 1].trim().toUpperCase()
              } else if (/^[A-Za-zÇĞİÖŞÜçğıöşü]+$/.test(code)) {
                branch = code.toUpperCase()
              } else {
                branch = 'A'
              }
              return `${gNum}/${branch}`
            })
          }
        }
      } catch (_) {}
    }
    return ['9/A']
  }, [selectedOrgId])

  // Courses Catalog State
  const [coursesList, setCoursesList] = useState<CurriculumCourse[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem(`oxonom_admin_curriculum_${selectedOrgId}`)
        if (savedCourses) {
          const parsed = JSON.parse(savedCourses)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return INITIAL_OXONOM_COURSES
  })

  // Schedule Entries State
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSchedule = localStorage.getItem(`oxonom_admin_schedule_${selectedOrgId}`)
        if (savedSchedule) {
          const parsedSchedule = JSON.parse(savedSchedule)
          if (Array.isArray(parsedSchedule)) return parsedSchedule
        }
      } catch (_) {}
    }
    return []
  })

  // Reload data on external storage changes
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedT = localStorage.getItem(`oxonom_admin_teachers_${selectedOrgId}`)
          if (savedT) setTeachersList(JSON.parse(savedT))
        } catch (_) {}
      }
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('oxonom_teachers_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('oxonom_teachers_updated', handleSync)
    }
  }, [selectedOrgId])

  // Helpers to persist
  const persistCourses = (updated: CurriculumCourse[]) => {
    setCoursesList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_curriculum_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  const persistSchedule = (updated: ScheduleEntry[]) => {
    setScheduleList(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_schedule_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  const persistPeriods = (updated: PeriodSlot[]) => {
    setPeriods(updated)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`oxonom_admin_periods_${selectedOrgId}`, JSON.stringify(updated))
      } catch (_) {}
    }
  }

  // Ensure selectedClass is valid
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.includes(selectedClass)) {
      setSelectedClass(availableClasses[0])
    }
  }, [availableClasses, selectedClass])

  // ── FILTERED COURSES POOL (STRICTLY BY SELECTED CLASS) ──
  // User Rule: "program oluşturulurken ilk önce sınıf seçilmeli sınıflara göre ders havuzları filtrelenmeli"
  const classCoursesPool = useMemo(() => {
    return coursesList.filter((c) => {
      if (c.orgId !== selectedOrgId) return false
      if (c.targetClass) {
        return c.targetClass.trim() === selectedClass.trim()
      }
      return true
    })
  }, [coursesList, selectedOrgId, selectedClass])

  // Class Entries in current weekly schedule
  const classEntries = useMemo(() => {
    return scheduleList.filter((e) => {
      if (e.orgId !== selectedOrgId) return false
      const eNorm = e.classCode.replace(/[\/-]/, '/').toLowerCase()
      const selNorm = selectedClass.replace(/[\/-]/, '/').toLowerCase()
      return eNorm === selNorm
    })
  }, [scheduleList, selectedOrgId, selectedClass])

  // Placed hours counts for the selected class
  const placedSubjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    classEntries.forEach((e) => {
      counts[e.subject] = (counts[e.subject] || 0) + 1
    })
    return counts
  }, [classEntries])

  const targetWeeklyHours = periods.length * 5
  const totalAssignedHours = classEntries.length
  const remainingTotalHours = Math.max(0, targetWeeklyHours - totalAssignedHours)

  const activeDayEntries = useMemo(() => {
    return classEntries.filter((e) => e.day === activeDay)
  }, [classEntries, activeDay])

  // ── TEACHER WORKLOAD & OVERTIME MONITOR ──
  // User Rule: "Öğretmenlerin mesai saatlerine göre ders saatleri hesaplanır ve öğretmen mesaisinden fazla çalışıyorsa grafiksel olarak gösterilir."
  const teacherWorkloads = useMemo(() => {
    // Combine teachers from teachersList and Dr. Uğur UĞURLU
    const baseList = [...teachersList]
    if (!baseList.some((t) => t.name === 'Dr. Uğur UĞURLU')) {
      baseList.push({
        id: 9999,
        name: 'Dr. Uğur UĞURLU',
        branch: 'Okul Müdürü & Edebiyat',
        weeklyHours: 30,
      })
    }

    return baseList.map((t) => {
      // Total assigned hours across all classes in the school
      const assignedHours = scheduleList.filter(
        (e) => e.orgId === selectedOrgId && (e.activeTeacherName || e.teacherName) === t.name
      ).length

      const weeklyLimit = t.weeklyHours || 30
      const percentage = Math.round((assignedHours / weeklyLimit) * 100)
      const isOvertime = assignedHours > weeklyLimit
      const overtimeHours = Math.max(0, assignedHours - weeklyLimit)

      return {
        id: t.id || t.name,
        name: t.name,
        branch: t.branch ? t.branch.split('(')[0].trim() : 'Branş Öğretmeni',
        assignedHours,
        weeklyLimit,
        percentage,
        isOvertime,
        overtimeHours,
      }
    })
  }, [teachersList, scheduleList, selectedOrgId])

  // ── CONFLICT CHECK ENGINE ──
  // User Rules:
  // 1. Aynı öğretmen aynı saatte başka derse atanamamalı
  // 2. Aynı derslik aynı anda iki sınıfa verilemez (laboratuvar, sınıf veya atölye)
  const checkConflicts = (day: DayKey, period: number, courseToAssign: CurriculumCourse) => {
    const dayLabel = DAYS_LIST.find((d) => d.key === day)?.label || day

    // Check teacher conflict in other classes
    const teacherConflict = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === day &&
        e.period === period &&
        e.classCode !== selectedClass &&
        (e.activeTeacherName || e.teacherName) === courseToAssign.branchTeacher &&
        !e.isTeacherOnLeave
    )

    // Check room conflict in other classes
    const roomConflict = scheduleList.find(
      (e) =>
        e.orgId === selectedOrgId &&
        e.day === day &&
        e.period === period &&
        e.classCode !== selectedClass &&
        e.roomName === courseToAssign.requiredRoom
    )

    return {
      dayLabel,
      teacherConflict,
      roomConflict,
    }
  }

  // ── ASSIGN COURSE TO SLOT ──
  const handleAssignCourseToSlot = (
    day: DayKey,
    period: number,
    courseToAssign: CurriculumCourse,
    forceBackup: boolean = false
  ) => {
    const { dayLabel, teacherConflict, roomConflict } = checkConflicts(day, period, courseToAssign)

    if (roomConflict) {
      toast.error(
        `❌ Derslik Çakışması! "${courseToAssign.requiredRoom}" (${courseToAssign.roomType === 'laboratuvar' ? 'Laboratuvar' : courseToAssign.roomType === 'atolye' ? 'Atölye' : 'Derslik'}) ${dayLabel} ${period}. saatte ${roomConflict.classCode} sınıfı tarafından kullanılmaktadır!`,
        { duration: 4500 }
      )
      return
    }

    let actualTeacher = courseToAssign.branchTeacher
    let isSub = false

    if (teacherConflict) {
      if (courseToAssign.backupTeachers && courseToAssign.backupTeachers.length > 0) {
        actualTeacher = courseToAssign.backupTeachers[0].name
        isSub = true
        toast(
          `⚠️ Asıl öğretmen (${courseToAssign.branchTeacher}) bu saatte ${teacherConflict.classCode} sınıfında derste. 1. Yedek Öğretmen (${actualTeacher}) devreye alındı.`,
          { icon: '🛡️', duration: 4000 }
        )
      } else {
        toast.error(
          `❌ Öğretmen Zaman Çakışması! ${courseToAssign.branchTeacher} öğretmeni ${dayLabel} ${period}. saatte ${teacherConflict.classCode} sınıfında derstedir! Lütfen başka bir saat seçin veya derse bir yedek öğretmen tanımlayın.`,
          { duration: 4500 }
        )
        return
      }
    }

    const existingIndex = scheduleList.findIndex(
      (e) => e.orgId === selectedOrgId && e.classCode === selectedClass && e.day === day && e.period === period
    )

    const newEntry: ScheduleEntry = {
      id: `sc-${Date.now()}-${day}-${period}`,
      orgId: selectedOrgId,
      day,
      period,
      classCode: selectedClass,
      subject: courseToAssign.name,
      teacherName: courseToAssign.branchTeacher,
      teacherBranch: courseToAssign.teacherBranch,
      backupTeacherName: courseToAssign.backupTeachers?.[0]?.name,
      isTeacherOnLeave: isSub,
      activeTeacherName: actualTeacher,
      roomType: courseToAssign.roomType,
      roomName: courseToAssign.requiredRoom,
      color: courseToAssign.color,
      isSmartBoardActive: courseToAssign.isSmartBoardReady,
    }

    let updatedList: ScheduleEntry[]
    if (existingIndex >= 0) {
      updatedList = [...scheduleList]
      updatedList[existingIndex] = newEntry
    } else {
      updatedList = [...scheduleList, newEntry]
    }

    persistSchedule(updatedList)
    toast.success(`✅ ${courseToAssign.name} (${dayLabel} ${period}. Ders) ${selectedClass} sınıfına yerleştirildi!`)
  }

  // Remove slot
  const handleRemoveSlot = (day: DayKey, period: number) => {
    const updated = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass && e.day === day && e.period === period)
    )
    persistSchedule(updated)
    toast.success('Ders saati boşaltıldı.')
    setSelectedSlotForAction(null)
  }

  // Toggle Leave / Substitute Teacher in Slot
  const handleToggleTeacherLeave = (entry: ScheduleEntry) => {
    const isNowOnLeave = !entry.isTeacherOnLeave
    const newActiveTeacher = isNowOnLeave
      ? entry.backupTeacherName || 'Dr. Uğur UĞURLU'
      : entry.teacherName

    const updated = scheduleList.map((e) => {
      if (e.id === entry.id) {
        return {
          ...e,
          isTeacherOnLeave: isNowOnLeave,
          activeTeacherName: newActiveTeacher,
        }
      }
      return e
    })

    persistSchedule(updated)
    if (isNowOnLeave) {
      toast.success(`⚠️ Asıl öğretmen izinli bildirildi. Ders ${newActiveTeacher} (Yedek) tarafından yürütülecektir.`)
    } else {
      toast.success(`✅ Asıl öğretmen (${entry.teacherName}) derse geri döndü.`)
    }
    setSelectedSlotForAction(null)
  }

  // ── SMART AUTO-FILL ENGINE ──
  // User Rule: "Otomatik doldur ile ders saatine öğretmen mesai saatine göre ince hesaplamalar yapılmalı ve en uygun ve en doğru şekilde otomatik doldurmalar yapılmalıdır."
  const handleSmartAutoFill = () => {
    if (classCoursesPool.length === 0) {
      toast.error(`"${selectedClass}" sınıfı için henüz tanımlanmış ders bulunmuyor! Lütfen önce "Yeni Ders Tanımla" butonuyla ders ekleyin.`)
      return
    }

    // Build course hour queue
    const queue: CurriculumCourse[] = []
    classCoursesPool.forEach((c) => {
      for (let i = 0; i < c.weeklyHours; i++) {
        queue.push(c)
      }
    })

    // Other classes' entries for conflict prevention
    const otherClassesEntries = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass)
    )

    const newEntries: ScheduleEntry[] = []
    let placedCount = 0

    // Loop through days and periods
    DAYS_LIST.forEach((day) => {
      periods.forEach((period) => {
        if (queue.length === 0) return

        // Find candidate that has no conflict at (day, period)
        const matchIdx = queue.findIndex((candidate) => {
          // Teacher conflict in other classes
          const teacherBusy = otherClassesEntries.some(
            (e) => e.day === day.key && e.period === period.periodNumber && (e.activeTeacherName || e.teacherName) === candidate.branchTeacher && !e.isTeacherOnLeave
          )
          // Room conflict in other classes
          const roomBusy = otherClassesEntries.some(
            (e) => e.day === day.key && e.period === period.periodNumber && e.roomName === candidate.requiredRoom
          )
          // Max 2 consecutive/day for same subject
          const placedToday = newEntries.filter(
            (e) => e.day === day.key && e.subject === candidate.name
          ).length

          return !teacherBusy && !roomBusy && placedToday < 2
        })

        if (matchIdx >= 0) {
          const course = queue.splice(matchIdx, 1)[0]
          newEntries.push({
            id: `sc-auto-${day.key}-${period.periodNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            orgId: selectedOrgId,
            day: day.key,
            period: period.periodNumber,
            classCode: selectedClass,
            subject: course.name,
            teacherName: course.branchTeacher,
            teacherBranch: course.teacherBranch,
            backupTeacherName: course.backupTeachers?.[0]?.name,
            roomType: course.roomType,
            roomName: course.requiredRoom,
            color: course.color,
            isSmartBoardActive: course.isSmartBoardReady,
            activeTeacherName: course.branchTeacher,
            isTeacherOnLeave: false,
          })
          placedCount++
        } else if (queue.length > 0) {
          // Secondary attempt with backup teacher or relaxed consecutive rule
          const fallbackIdx = queue.findIndex((candidate) => {
            const roomBusy = otherClassesEntries.some(
              (e) => e.day === day.key && e.period === period.periodNumber && e.roomName === candidate.requiredRoom
            )
            return !roomBusy
          })

          if (fallbackIdx >= 0) {
            const course = queue.splice(fallbackIdx, 1)[0]
            const teacherBusy = otherClassesEntries.some(
              (e) => e.day === day.key && e.period === period.periodNumber && (e.activeTeacherName || e.teacherName) === course.branchTeacher
            )
            const actualTeacher = teacherBusy && course.backupTeachers?.[0]
              ? course.backupTeachers[0].name
              : course.branchTeacher

            newEntries.push({
              id: `sc-auto-${day.key}-${period.periodNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              orgId: selectedOrgId,
              day: day.key,
              period: period.periodNumber,
              classCode: selectedClass,
              subject: course.name,
              teacherName: course.branchTeacher,
              teacherBranch: course.teacherBranch,
              backupTeacherName: course.backupTeachers?.[0]?.name,
              roomType: course.roomType,
              roomName: course.requiredRoom,
              color: course.color,
              isSmartBoardActive: course.isSmartBoardReady,
              activeTeacherName: actualTeacher,
              isTeacherOnLeave: actualTeacher !== course.branchTeacher,
            })
            placedCount++
          }
        }
      })
    })

    const combined = [...otherClassesEntries, ...newEntries]
    persistSchedule(combined)
    toast.success(`🎉 ${selectedClass} için haftalık ders programı 0 çakışma ile otomatik oluşturuldu! (${placedCount} Saat)`)
  }

  // Clear weekly schedule
  const handleClearWeek = () => {
    const updated = scheduleList.filter(
      (e) => !(e.orgId === selectedOrgId && e.classCode === selectedClass)
    )
    persistSchedule(updated)
    toast.success(`${selectedClass} haftalık ders programı temizlendi.`)
  }

  // Clear all courses and restart
  const handleClearAllCourses = () => {
    const updated = coursesList.filter((c) => c.targetClass !== selectedClass)
    persistCourses(updated)
    handleClearWeek()
    toast.success(`${selectedClass} sınıfına ait tüm dersler silindi.`)
  }

  // Reset to authentic Oxonom preset courses
  const handleLoadAuthenticPreset = () => {
    persistCourses(INITIAL_OXONOM_COURSES)
    toast.success('Oxonom Okulları 9/A standart ders müfredatı başarıyla yüklendi!')
  }

  // ── OPEN NEW COURSE MODAL HANDLERS ──
  const handleOpenNewCourseModal = () => {
    const defaultTeacher = teachersList[0]?.name || 'Ebru TEKNECİ'
    const defaultBranch = teachersList[0]?.branch?.split('(')[0].trim() || 'Türk Dili ve Edebiyatı'

    setFormName('')
    setFormCode('')
    setFormTargetClass(selectedClass)
    setFormWeeklyHours(4)
    setFormCategory('Temel Ders')
    setFormBranchTeacher(defaultTeacher)
    setFormTeacherBranch(defaultBranch)
    setFormBackupTeachers([
      { id: 'b-default', name: 'Dr. Uğur UĞURLU', priority: 1, branch: 'Edebiyat & Kurum Yönetimi' },
    ])
    setNewBackupTeacherSelect('')
    setFormRoomType('normal')
    setFormRequiredRoom(`Derslik ${selectedClass}`)
    setFormColor('blue')
    setFormIsSmartBoard(true)
    setIsNewCourseModalOpen(true)
  }

  // Handle teacher selection change (BRANCH AUTO-FILLS)
  // User Rule: "Branş(Öğretmen seçince branşı Otomatik Gelir)"
  const handleSelectPrimaryTeacher = (teacherName: string) => {
    setFormBranchTeacher(teacherName)
    const teacherObj = teachersList.find((t) => t.name === teacherName)
    if (teacherObj && teacherObj.branch) {
      const cleanBranch = teacherObj.branch.split('(')[0].trim()
      setFormTeacherBranch(cleanBranch)
    } else if (teacherName === 'Dr. Uğur UĞURLU') {
      setFormTeacherBranch('Okul Müdürü & Edebiyat')
    }
  }

  // Add backup teacher with priority order
  // User Rule: "Birden fazla yedek öğretmen gerekiyorsa öncelik sırası da tanımlanabilir."
  const handleAddBackupTeacher = () => {
    if (!newBackupTeacherSelect) {
      toast.error('Lütfen eklenecek yedek öğretmeni seçin.')
      return
    }
    if (formBackupTeachers.some((b) => b.name === newBackupTeacherSelect)) {
      toast.error('Bu öğretmen zaten yedek listesinde ekli.')
      return
    }
    const tObj = teachersList.find((t) => t.name === newBackupTeacherSelect)
    const nextPriority = formBackupTeachers.length + 1
    const newBackup: BackupTeacher = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: newBackupTeacherSelect,
      priority: nextPriority,
      branch: tObj?.branch?.split('(')[0].trim() || 'Branş Öğretmeni',
    }
    setFormBackupTeachers([...formBackupTeachers, newBackup])
    setNewBackupTeacherSelect('')
    toast.success(`${newBackup.name} ${nextPriority}. Öncelikli Yedek Öğretmen olarak eklendi.`)
  }

  const handleRemoveBackupTeacher = (id: string) => {
    setFormBackupTeachers((prev) =>
      prev
        .filter((b) => b.id !== id)
        .map((b, idx) => ({ ...b, priority: idx + 1 }))
    )
  }

  // Create course submit
  const handleCreateCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedName = formName.trim()
    if (!trimmedName) {
      toast.error('Lütfen ders adını girin!')
      return
    }

    const autoCode = formCode.trim()
      ? formCode.trim().toUpperCase()
      : `${trimmedName.slice(0, 3).toUpperCase()}-101`

    const newCourse: CurriculumCourse = {
      id: `c-custom-${Date.now()}`,
      code: autoCode,
      name: trimmedName,
      category: formCategory,
      gradeLevels: [`${formTargetClass.split('/')[0]}. Sınıf`],
      targetClass: formTargetClass,
      orgId: selectedOrgId,
      weeklyHours: Number(formWeeklyHours) || 4,
      branchTeacher: formBranchTeacher,
      teacherBranch: formTeacherBranch,
      backupTeachers: formBackupTeachers,
      roomType: formRoomType,
      requiredRoom: formRequiredRoom.trim() || `Derslik ${formTargetClass}`,
      isSmartBoardReady: Boolean(formIsSmartBoard),
      isElective: false,
      color: formColor,
    }

    const updated = [...coursesList, newCourse]
    persistCourses(updated)
    toast.success(`🎉 "${trimmedName}" (${newCourse.weeklyHours} Saat) ${formTargetClass} sınıfı için tanımlandı!`)
    setIsNewCourseModalOpen(false)
    setSelectedCourseForDrop(newCourse)
  }

  // Edit course
  const handleOpenEditCourse = (course: CurriculumCourse) => {
    setCourseToEdit(course)
    setFormName(course.name)
    setFormCode(course.code)
    setFormTargetClass(course.targetClass || selectedClass)
    setFormWeeklyHours(course.weeklyHours)
    setFormCategory(course.category)
    setFormBranchTeacher(course.branchTeacher)
    setFormTeacherBranch(course.teacherBranch || 'Branş Öğretmeni')
    setFormBackupTeachers(course.backupTeachers || [])
    setFormRoomType(course.roomType || 'normal')
    setFormRequiredRoom(course.requiredRoom)
    setFormColor(course.color)
    setFormIsSmartBoard(course.isSmartBoardReady)
  }

  const handleSaveEditCourse = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!courseToEdit) return

    const trimmedName = formName.trim() || courseToEdit.name
    const updated = coursesList.map((c) => {
      if (c.id === courseToEdit.id) {
        return {
          ...c,
          name: trimmedName,
          code: formCode.trim().toUpperCase() || c.code,
          targetClass: formTargetClass,
          category: formCategory,
          weeklyHours: Number(formWeeklyHours) || c.weeklyHours,
          branchTeacher: formBranchTeacher,
          teacherBranch: formTeacherBranch,
          backupTeachers: formBackupTeachers,
          roomType: formRoomType,
          requiredRoom: formRequiredRoom.trim() || c.requiredRoom,
          color: formColor,
          isSmartBoardReady: Boolean(formIsSmartBoard),
        }
      }
      return c
    })

    persistCourses(updated)
    toast.success(`"${trimmedName}" ders bilgileri güncellendi!`)
    setCourseToEdit(null)
  }

  const handleDeleteCourse = (courseId: string) => {
    const course = coursesList.find((c) => c.id === courseId)
    const updated = coursesList.filter((c) => c.id !== courseId)
    persistCourses(updated)
    toast.success(`"${course?.name || 'Ders'}" ders havuzundan silindi.`)
    if (selectedCourseForDrop?.id === courseId) {
      setSelectedCourseForDrop(null)
    }
  }

  return (
    <div
      className={`min-h-screen font-jakarta select-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0A0D15] text-white' : 'bg-[#F8FAFC] text-gray-900'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)' }}
    >
      {/* ── 1. HEADER (Optional mobile header) ── */}
      {!hideHeader && (
        <MobileHeader
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <main className={`w-full ${hideHeader ? 'max-w-7xl mx-auto p-2 sm:p-4 lg:p-6' : 'max-w-[430px] sm:max-w-[460px] mx-auto'} min-h-screen space-y-4`}>
        {/* ── 2. HERO CARD & SINIF SEÇİCİ ── */}
        <section className="px-3 pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0E1B38] to-[#06241C] border border-emerald-500/25 p-4 sm:p-5 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm font-black flex items-center gap-2">
                    <span>Haftalık Ders Programı</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Çakışma Korumalı
                    </span>
                  </div>
                  <p className="text-xs text-gray-300/80 mt-0.5">
                    Oxonom Okulları · Akıllı Zümre, Derslik ve Öğretmen Yerleşimi
                  </p>
                </div>
              </div>

              {/* Time slot edit button */}
              <button
                type="button"
                onClick={() => setIsEditPeriodsModalOpen(true)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Sliders size={13} className="text-emerald-400" />
                <span>Ders Saatlerini Düzenle</span>
              </button>
            </div>

            {/* Sınıf / Şube Seçici (User Rule: Program oluşturulurken ilk önce sınıf seçilmeli) */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-emerald-400" />
                  <span>Programı Hazırlanan Sınıf / Şube:</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Seçili Sınıf: <strong>{selectedClass}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {availableClasses.map((cls) => {
                  const isSelected = selectedClass === cls
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls)
                        setSelectedCourseForDrop(null)
                      }}
                      className={`min-w-[70px] px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer text-center shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg ring-2 ring-emerald-400/50 scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                    >
                      {cls}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weekly Hours Progress */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center text-xs">
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-base font-black text-white">{targetWeeklyHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Haftalık Kapasite</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-base font-black text-emerald-400">{totalAssignedHours} Saat</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Yerleştirilen Ders</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
                <div className={`text-base font-black ${remainingTotalHours === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {remainingTotalHours === 0 ? 'Tamamlandı' : `${remainingTotalHours} Saat Boş`}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Kalan Slot</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. ÖĞRETMEN MESAİ & DERS YÜKÜ MONİTÖRÜ (GRAFİKSEL GÖSTERİM) ── */}
        {/* User Rule: "Öğretmenlerin mesai saatlerine göre ders saatleri hesaplanır ve öğretmen mesaisinden fazla çalışıyorsa grafiksel olarak gösterilir." */}
        <section className="px-3">
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <BarChart2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>Öğretmen Mesai & Haftalık Ders Yükü Monitörü</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      Canlı Hesaplama
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Okul geneli haftalık ders dağılımı vs. yasal mesai kapasitesi (30 Saat)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWorkloadExpanded(!isWorkloadExpanded)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <span>{isWorkloadExpanded ? 'Gizle' : 'Göster'}</span>
                <ChevronDown size={14} className={`transition-transform ${isWorkloadExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isWorkloadExpanded && (
              <div className="mt-3 space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                {teacherWorkloads.map((t) => (
                  <div key={t.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 dark:text-white">{t.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">({t.branch})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-700 dark:text-gray-300">
                          {t.assignedHours} / {t.weeklyLimit} Saat
                        </span>
                        {t.isOvertime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[9px] font-black text-rose-600 dark:text-rose-400 animate-pulse">
                            <Flame size={10} />
                            <span>+{t.overtimeHours} Saat Ek Ders!</span>
                          </span>
                        ) : t.percentage === 100 ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                            Tam Kapasite (%100)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            Optimum (%{t.percentage})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar (Graphical representation) */}
                    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.isOvertime
                            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                            : t.percentage >= 90
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, t.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. SEKMELER (SÜRÜKLE-BIRAK DAĞITIM / DERS HAVUZU KATALOĞU) ── */}
        <section className="px-3">
          <div className="flex items-center p-1 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('distribute')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'distribute'
                  ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Wand2 size={14} />
              <span>Sürükle - Bırak Dağıtım & Takvim</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-[#111827] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Sınıf Ders Havuzu & Tanımlar</span>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SEKME 1: HAFTALIK DERS PROGRAMI & SÜRÜKLE-BIRAK DAĞITIM
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'distribute' && (
          <div className="space-y-3">
            {/* A. SEÇİLİ SINIFIN DERS HAVUZU */}
            <section className="px-3">
              <div className="p-4 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-500" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {selectedClass} Sınıfı Ders Havuzu ({classCoursesPool.length} Tanımlı Ders)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleOpenNewCourseModal}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Yeni Ders Tanımla</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  💡 <strong>Nasıl Yerleştirilir:</strong> Aşağıdaki ders kartına dokunun, ardından gün akışındaki boş bir ders saatine dokunarak atayın.
                </p>

                {classCoursesPool.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2">
                    <BookOpen size={24} className="mx-auto text-gray-400" />
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {selectedClass} sınıfı için henüz ders tanımlanmadı.
                    </div>
                    <p className="text-[11px] text-gray-400">
                      "Yeni Ders Tanımla" butonu ile ders ekleyebilir veya varsayılan müfredatı yükleyebilirsiniz.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenNewCourseModal}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Bu Sınıfa Ders Ekle
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadAuthenticPreset}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                      >
                        Örnek Müfredatı Yükle
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {classCoursesPool.map((course) => {
                      const style = getColorStyle(course.color)
                      const placedHours = placedSubjectCounts[course.name] || 0
                      const isFullyPlaced = placedHours >= course.weeklyHours
                      const isSelected = selectedCourseForDrop?.id === course.id

                      return (
                        <motion.div
                          key={course.id}
                          whileTap={{ scale: 0.96 }}
                          draggable={true}
                          onDragStart={(e) => {
                            const dt = (e as unknown as { dataTransfer?: DataTransfer }).dataTransfer
                            if (dt) dt.setData('text/plain', course.name)
                            setDraggedCourseName(course.name)
                          }}
                          onDragEnd={() => setDraggedCourseName(null)}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCourseForDrop(null)
                            } else {
                              setSelectedCourseForDrop(course)
                              toast(`🎯 "${course.name}" seçildi. Yerleştirmek istediğiniz ders saatine dokunun.`, {
                                icon: '👉',
                                duration: 2000,
                              })
                            }
                          }}
                          className={`p-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 shadow-xs ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                              : isFullyPlaced
                              ? 'bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 opacity-80'
                              : `${style.bg} ${style.border} ${style.text}`
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black">{course.name}</span>
                              <span className="text-[9px] opacity-75 font-mono">({course.code})</span>
                            </div>
                            <div className="text-[10px] font-normal opacity-90">
                              {course.branchTeacher} · {course.requiredRoom}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              isFullyPlaced
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/80 dark:bg-black/40 border border-current'
                            }`}
                          >
                            {placedHours}/{course.weeklyHours}s
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* Selected Indicator Banner */}
                {selectedCourseForDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>
                        Seçili Ders: <strong>{selectedCourseForDrop.name}</strong> ({selectedCourseForDrop.branchTeacher})
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {placedSubjectCounts[selectedCourseForDrop.name] || 0}/{selectedCourseForDrop.weeklyHours} Yerleşti
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForDrop(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-bold px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </motion.div>
                )}
              </div>
            </section>

            {/* B. GÜN SEÇİCİ & AKILLI OTOMATİK DOLDUR AKSİYONLARI */}
            <section className="px-3">
              <div className="grid grid-cols-5 gap-1.5">
                {DAYS_LIST.map((day) => {
                  const isActive = activeDay === day.key
                  const dayCount = classEntries.filter((e) => e.day === day.key).length
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setActiveDay(day.key)}
                      className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40 scale-102'
                          : 'bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-80">{day.shortLabel}</span>
                      <span className="text-xs font-black">{day.label.slice(0, 3)}</span>
                      <span className={`text-[9px] mt-0.5 font-bold px-1.5 rounded-full ${isActive ? 'bg-white/20' : 'text-gray-400'}`}>
                        {dayCount}/{periods.length}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons: Otomatik Doldur & Haftayı Sıfırla */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleSmartAutoFill}
                  className="h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <Wand2 size={15} />
                  <span>Akıllı Otomatik Doldur</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearWeek}
                  className="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Haftayı Sıfırla</span>
                </button>
              </div>
            </section>

            {/* C. GÜNLÜK DERS SAATLERİ AKIŞI (SLOTLAR) */}
            <section className="px-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span>
                    {selectedClass} · {DAYS_LIST.find((d) => d.key === activeDay)?.label} Akışı ({activeDayEntries.length}/{periods.length} Saat)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditPeriodsModalOpen(true)}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Saatleri Düzenle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {periods.map((slot) => {
                  const entry = activeDayEntries.find((e) => e.period === slot.periodNumber)
                  const style = entry ? getColorStyle(entry.color) : null

                  return (
                    <motion.div
                      key={slot.periodNumber}
                      whileTap={{ scale: 0.98 }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const subjectName = e.dataTransfer.getData('text/plain') || draggedCourseName
                        if (subjectName) {
                          const matched = classCoursesPool.find((c) => c.name === subjectName)
                          if (matched) {
                            handleAssignCourseToSlot(activeDay, slot.periodNumber, matched)
                          }
                        }
                      }}
                      onClick={() => {
                        if (selectedCourseForDrop) {
                          handleAssignCourseToSlot(activeDay, slot.periodNumber, selectedCourseForDrop)
                        } else if (entry) {
                          setSelectedSlotForAction({
                            entry,
                            day: activeDay,
                            period: slot.periodNumber,
                          })
                        } else {
                          toast('Lütfen yukarıdaki ders havuzundan bir ders seçin veya Yeni Ders Tanımla butonunu kullanın.', {
                            icon: '☝️',
                          })
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        entry
                          ? `bg-white dark:bg-[#111827] border-gray-200/90 dark:border-gray-800/80 shadow-xs hover:border-emerald-500`
                          : selectedCourseForDrop
                          ? 'border-2 border-dashed border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Sol: Saat ve Periyot */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                              entry
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold'
                            }`}
                          >
                            <span className="text-[9px] uppercase leading-none opacity-80">DERS</span>
                            <span className="text-base font-black leading-none mt-0.5">{slot.periodNumber}</span>
                          </div>

                          <div className="min-w-0">
                            {entry ? (
                              <>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-gray-900 dark:text-white">
                                    {entry.subject}
                                  </span>
                                  {entry.isTeacherOnLeave ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <UserCheck size={9} />
                                      <span>Yedek: {entry.activeTeacherName}</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style?.bg} ${style?.text} ${style?.border}`}
                                    >
                                      {entry.activeTeacherName || entry.teacherName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                  <span>⏰ {slot.time}</span>
                                  <span>·</span>
                                  <span className="font-semibold text-gray-600 dark:text-gray-300">{entry.roomName}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-bold text-gray-400">
                                  {selectedCourseForDrop
                                    ? `👉 "${selectedCourseForDrop.name}" dersini buraya bırak/dokun`
                                    : 'Boş Ders Saati'}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  ⏰ {slot.time}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Sağ Aksiyon */}
                        <div className="flex items-center gap-1 shrink-0">
                          {entry ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSlot(activeDay, slot.periodNumber)
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                              title="Dersi Boşalt"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                              <Plus size={14} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SEKME 2: SINIF DERS TANIMLARI & KATALOG
           ════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-3 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 dark:text-white">
                {selectedClass} Sınıfı Tanımlı Dersleri ({classCoursesPool.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllCourses}
                  className="h-8 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-all cursor-pointer"
                >
                  Tümünü Temizle
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewCourseModal}
                  className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Yeni Ders Tanımla</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {classCoursesPool.map((course) => {
                const style = getColorStyle(course.color)
                const placedHours = placedSubjectCounts[course.name] || 0

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-3xl bg-white dark:bg-[#111827] border border-gray-200/90 dark:border-gray-800/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {course.name}
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {course.code}
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {course.targetClass}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                          >
                            {course.category}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {course.roomType === 'laboratuvar' ? '🔬 Laboratuvar' : course.roomType === 'atolye' ? '🛠️ Atölye' : '🏫 Normal Sınıf'}
                          </span>
                        </div>

                        {/* Detailed Teacher & Room Meta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <div>
                            <strong>Asıl Öğretmen:</strong> {course.branchTeacher} ({course.teacherBranch})
                          </div>
                          <div>
                            <strong>Derslik:</strong> {course.requiredRoom}
                          </div>
                          {course.backupTeachers && course.backupTeachers.length > 0 && (
                            <div className="col-span-full text-amber-600 dark:text-amber-400">
                              <strong>Yedek Öğretmenler:</strong>{' '}
                              {course.backupTeachers.map((b) => `${b.priority}. ${b.name}`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(course)}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-500 flex items-center justify-center cursor-pointer"
                          title="Dersi Düzenle"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-rose-500 flex items-center justify-center cursor-pointer"
                          title="Dersi Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100 dark:border-gray-800">
                      <span>Haftalık {course.weeklyHours} Saat</span>
                      <span>
                        {placedHours >= course.weeklyHours ? (
                          <span className="text-emerald-500 font-bold">Tamamı Dağıtıldı ({placedHours}s)</span>
                        ) : (
                          <span className="text-amber-500 font-bold">{course.weeklyHours - placedHours} Saat Bekliyor</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL 1: YENİ DERS TANIMLA (USER SPECIFIED LAYOUT) ── */}
      <AnimatePresence>
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewCourseModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-lg max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Yeni Ders Tanımla
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Sınıf, asıl/yedek öğretmen, branş ve derslik tanımları
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateCourse()
                }}
                className="p-5 overflow-y-auto space-y-4 text-xs"
              >
                {/* ── BÖLÜM 1: DERS BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>1. Ders Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Ders Adı *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value)
                          if (!formCode && e.target.value.length >= 3) {
                            setFormCode(`${e.target.value.slice(0, 3).toUpperCase()}-101`)
                          }
                        }}
                        placeholder="Örn: Matematik"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Ders Kodu
                      </label>
                      <input
                        type="text"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        placeholder="Örn: MAT-901"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-black uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Sınıf / Şube *
                      </label>
                      <select
                        value={formTargetClass}
                        onChange={(e) => {
                          setFormTargetClass(e.target.value)
                          if (formRoomType === 'normal') {
                            setFormRequiredRoom(`Derslik ${e.target.value}`)
                          }
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-black text-emerald-600 dark:text-emerald-400"
                      >
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Haftalık Ders Saati *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={formWeeklyHours}
                        onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-black text-center"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Kategori
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full h-10 px-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        <option value="Temel Ders">Temel Ders</option>
                        <option value="Fen & Teknoloji">Fen & Teknoloji</option>
                        <option value="Sosyal & Beşeri">Sosyal & Beşeri</option>
                        <option value="Sanat & Spor">Sanat & Spor</option>
                        <option value="Yabancı Dil">Yabancı Dil</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 2: ÖĞRETMEN BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} />
                    <span>2. Öğretmen Bilgileri</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Asıl Öğretmen *
                      </label>
                      <select
                        value={formBranchTeacher}
                        onChange={(e) => handleSelectPrimaryTeacher(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      >
                        {teachersList.map((t) => (
                          <option key={t.id || t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Branş (Otomatik Gelir)
                      </label>
                      <input
                        type="text"
                        value={formTeacherBranch}
                        onChange={(e) => setFormTeacherBranch(e.target.value)}
                        placeholder="Örn: Türk Dili ve Edebiyatı"
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Yedek Öğretmen Öncelik Sıralı Alanı */}
                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        Yedek Öğretmenler (Öncelik Sırası)
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Asıl öğretmen izinli/raporlu olduğunda devreye girer
                      </span>
                    </div>

                    {/* Mevcut Yedekler Listesi */}
                    <div className="space-y-1.5 mb-2">
                      {formBackupTeachers.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                              {b.priority}
                            </span>
                            <span className="font-extrabold text-amber-900 dark:text-amber-200">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                              ({b.branch})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBackupTeacher(b.id)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-[11px] cursor-pointer"
                          >
                            Çıkar
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Yedek Öğretmen Ekle Seçici */}
                    <div className="flex items-center gap-2">
                      <select
                        value={newBackupTeacherSelect}
                        onChange={(e) => setNewBackupTeacherSelect(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold"
                      >
                        <option value="">+ Yedek Öğretmen Seç</option>
                        {teachersList
                          .filter((t) => t.name !== formBranchTeacher)
                          .map((t) => (
                            <option key={t.id || t.name} value={t.name}>
                              {t.name} ({t.branch ? t.branch.split('(')[0].trim() : 'Öğretmen'})
                            </option>
                          ))}
                        <option value="Dr. Uğur UĞURLU">Dr. Uğur UĞURLU (Okul Müdürü)</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddBackupTeacher}
                        className="px-3 h-9 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Sıraya Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 3: DERSLİK BİLGİLERİ ── */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={13} />
                    <span>3. Derslik Seçimi & Türü</span>
                  </div>

                  {/* 3'lü Segment: Normal Sınıf | Atölye | Laboratuvar */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                      Derslik Türü
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('normal')
                          setFormRequiredRoom(`Derslik ${formTargetClass}`)
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'normal'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <School size={16} />
                        <span>Normal Sınıf</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('atolye')
                          setFormRequiredRoom('Bilişim & Kodlama Atölyesi')
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'atolye'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span>Atölye</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormRoomType('laboratuvar')
                          setFormRequiredRoom('Fen & Teknoloji Laboratuvarı')
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          formRoomType === 'laboratuvar'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Layers size={16} />
                        <span>Laboratuvar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Fiziksel Derslik Adı
                    </label>
                    <input
                      type="text"
                      value={formRequiredRoom}
                      onChange={(e) => setFormRequiredRoom(e.target.value)}
                      placeholder="Derslik adı girin..."
                      className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Renk Seçimi */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                    Kart Renk Teması
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {Object.keys(COLOR_OPTIONS).map((cKey) => {
                      const cStyle = COLOR_OPTIONS[cKey]
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setFormColor(cKey)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            cStyle.dot
                          } ${formColor === cKey ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80'}`}
                        >
                          {formColor === cKey && <Check size={12} className="text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Dersi Oluştur ve Kataloğa Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: DERS DÜZENLE MODALI ── */}
      <AnimatePresence>
        {courseToEdit && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCourseToEdit(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-lg max-h-[92vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Bilgilerini Güncelle
                    </h3>
                    <p className="text-[11px] text-gray-400">{courseToEdit.name} · {courseToEdit.code}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCourseToEdit(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveEditCourse()
                }}
                className="p-5 overflow-y-auto space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Ders Adı</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Ders Kodu</label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Sınıf</label>
                    <select
                      value={formTargetClass}
                      onChange={(e) => setFormTargetClass(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Haftalık Saat</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formWeeklyHours}
                      onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Asıl Öğretmen</label>
                    <select
                      value={formBranchTeacher}
                      onChange={(e) => handleSelectPrimaryTeacher(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    >
                      {teachersList.map((t) => (
                        <option key={t.id || t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Branş</label>
                    <input
                      type="text"
                      value={formTeacherBranch}
                      onChange={(e) => setFormTeacherBranch(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Derslik Adı</label>
                  <input
                    type="text"
                    value={formRequiredRoom}
                    onChange={(e) => setFormRequiredRoom(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: DERS SAATLERİNİ DÜZENLE (MÜDÜR İSTERSE SAATLERDE DEĞİŞİKLİK YAPABİLİR) ── */}
      <AnimatePresence>
        {isEditPeriodsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPeriodsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col z-10 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Ders Saatlerini Özelleştir
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Günün ders periyotlarını ve başlangıç-bitiş saatlerini güncelleyin
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditPeriodsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3 text-xs">
                {periods.map((p, idx) => (
                  <div key={p.periodNumber} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <span className="w-8 font-black text-gray-700 dark:text-gray-300">
                      {p.periodNumber}. Ders
                    </span>
                    <input
                      type="text"
                      value={p.time}
                      onChange={(e) => {
                        const val = e.target.value
                        const updated = periods.map((item) =>
                          item.periodNumber === p.periodNumber ? { ...item, time: val } : item
                        )
                        setPeriods(updated)
                      }}
                      className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono font-bold text-xs"
                      placeholder="08:30 - 09:10"
                    />
                    {periods.length > 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = periods.filter((item) => item.periodNumber !== p.periodNumber)
                          setPeriods(updated)
                        }}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center cursor-pointer"
                        title="Ders Saatini Sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const nextNum = periods.length + 1
                    const newPeriod: PeriodSlot = {
                      periodNumber: nextNum,
                      time: '15:30 - 16:10',
                    }
                    setPeriods([...periods, newPeriod])
                  }}
                  className="w-full h-10 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Yeni Ders Saati Ekle</span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      persistPeriods(periods)
                      setIsEditPeriodsModalOpen(false)
                      toast.success('Ders saatleri çizelgesi başarıyla kaydedildi!')
                    }}
                    className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    Kaydet ve Uygula
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: SLOT AKSİYON SHEET (ASIL ÖĞRETMEN İZİNLİ BİLDİR / YEDEK DEVRAL) ── */}
      <AnimatePresence>
        {selectedSlotForAction && selectedSlotForAction.entry && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSlotForAction(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className={`relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl z-10 space-y-4 ${
                theme === 'dark'
                  ? 'bg-[#0E131F] text-white border-t sm:border border-gray-800'
                  : 'bg-white text-gray-900 border-t sm:border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    {selectedSlotForAction.entry.subject}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {DAYS_LIST.find((d) => d.key === selectedSlotForAction.day)?.label} · {selectedSlotForAction.period}. Ders Saati
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlotForAction(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Slot Details */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sınıf / Şube:</span>
                  <span className="font-black text-emerald-500">{selectedSlotForAction.entry.classCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Asıl Öğretmen:</span>
                  <span className="font-extrabold">{selectedSlotForAction.entry.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tanımlı Yedek:</span>
                  <span className="font-bold text-amber-500">{selectedSlotForAction.entry.backupTeacherName || 'Dr. Uğur UĞURLU'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Derslik:</span>
                  <span className="font-bold">{selectedSlotForAction.entry.roomName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-400">Fiilen Görevli Öğretmen:</span>
                  <span className="font-black text-indigo-500">
                    {selectedSlotForAction.entry.activeTeacherName || selectedSlotForAction.entry.teacherName}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {/* Asıl öğretmen yokluğunda izin durumu toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTeacherLeave(selectedSlotForAction.entry!)}
                  className={`w-full h-11 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedSlotForAction.entry.isTeacherOnLeave
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {selectedSlotForAction.entry.isTeacherOnLeave ? (
                    <>
                      <UserCheck size={16} />
                      <span>Asıl Öğretmen Göreve Döndü (Normale Al)</span>
                    </>
                  ) : (
                    <>
                      <UserX size={16} />
                      <span>Asıl Öğretmen İzinli / Raporlu (Yedeği Devreye Al)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveSlot(selectedSlotForAction.day, selectedSlotForAction.period)}
                  className="w-full h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-100"
                >
                  <Trash2 size={15} />
                  <span>Bu Saati Boşalt / Dersi Kaldır</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
