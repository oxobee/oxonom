'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  CheckSquare,
  AlertCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Save,
  Volume2,
  Users,
  Layers,
  X,
  QrCode,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RotateCcw,
  BookOpenCheck,
  Calendar,
  Filter,
  ArrowUpDown,
  BookMarked,
  Check,
  Sun,
  Moon,
  Plus,
  PenTool,
  HelpCircle,
  BookOpen,
  Upload,
  Paperclip,
  User,
  FileCheck,
  Trash2,
  Pencil,
  ShieldCheck,
  Lock,
  Unlock,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MobileHeader from '@components/Mobile/MobileHeader'
import MobileFloatingDock from '@components/Mobile/MobileFloatingDock'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'
import { ALL_INITIAL_STUDENTS, type MStudentItem } from '@components/Mobile/MStudentClient'
import {
  DEFAULT_SCHOOL_ASSIGNMENTS,
  getStoredCustomAssignments,
  saveStoredCustomAssignment,
  deleteStoredCustomAssignment,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import { normalizeClassCode } from '@services/demo/attendanceService'

export interface HomeworkItem {
  id: string
  assignment_uuid?: string
  title: string
  shortTitle: string
  subject: 'Türkçe' | 'Matematik' | 'Hayat Bilgisi' | 'Fen Bilimleri' | 'Görsel Sanatlar' | 'İngilizce' | 'Sosyal Bilgiler' | string
  category: 'READING' | 'MATH' | 'SCIENCE' | 'LIFE_STUDIES' | 'ART' | 'ENGLISH' | 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | string
  tool_type?: 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'
  tool_data?: Record<string, any>
  target_type?: 'CLASS' | 'INDIVIDUAL'
  target_student_id?: string
  target_student_name?: string
  attached_file_name?: string
  board_uuid?: string
  className: string
  assignedDate: string
  dueDate: string
  assignedTimestamp: number
  dueTimestamp: number
  description: string
  period: 'this_week' | 'past' | 'upcoming'
  periodLabel: string
  accentColor: 'rose' | 'blue' | 'emerald' | 'amber' | 'purple'
  max_score?: number
  teacher_name?: string
  permissions?: {
    allowLateSubmission?: boolean
    allowResubmission?: boolean
    allowFileUpload?: boolean
    parentNotification?: boolean
    accessScope?: 'CLASS' | 'INDIVIDUAL' | 'DRAFT'
  }
}

interface SubmissionRecord {
  studentId: string
  score: number
  feedback: string
  submittedAt: string
  status: 'submitted' | 'late' | 'not_submitted'
}

const DEFAULT_TEMPLATES = [
  'Harika bir çalışma, tebrik ederim!',
  'Çözüm adımların doğru ve anlaşılır, eline sağlık.',
  'Çözümün genel olarak başarılı, küçük eksikler var.',
  'Eksik kısımları tamamlayıp tekrar inceleyebilirsin.',
]

const QUICK_SCORES = [100, 95, 90, 85, 75, 60, 50]

const BRANCH_OPTIONS = [
  { id: 'all', title: 'Tüm Şubeler', desc: 'Oxonom Okulları', isAll: true },
  { id: '9-A', title: '9-A Şubesi', desc: 'Sınıf Rehber Öğretmeni: Ebru TEKNECİ', isAll: false },
]

// Real school assignments across classes covering all assignment combinations
const INITIAL_HOMEWORKS: HomeworkItem[] = [
  {
    id: 'hw-reading-1',
    assignment_uuid: 'asg_dede_korkut_okuma',
    title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
    shortTitle: 'Dede Korkut Tahlili',
    subject: 'Türkçe',
    category: 'READING',
    tool_type: 'READING',
    className: '9-A Şubesi',
    assignedDate: '06.10.2026',
    dueDate: '11.10.2026',
    assignedTimestamp: Date.now() - 6 * 86400000,
    dueTimestamp: Date.now() - 1 * 86400000,
    description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
    period: 'past',
    periodLabel: 'Geçen Hafta',
    accentColor: 'emerald',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-whiteboard-1',
    assignment_uuid: 'asg_edebi_sanatlar_tahta',
    title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
    shortTitle: 'Edebi Sanatlar Çizimi',
    subject: 'Türkçe',
    category: 'WHITEBOARD',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_edebi_sanatlar_9a',
    className: '9-A Şubesi',
    assignedDate: '08.10.2026',
    dueDate: '13.10.2026',
    assignedTimestamp: Date.now() - 4 * 86400000,
    dueTimestamp: Date.now() + 1 * 86400000,
    description: 'Akıllı tahta üzerinde teşbih, istiare, teşhis ve tezat sanatlarını örnekleyen görsel kavram haritasının tamamlanması.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'purple',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-quiz-1',
    assignment_uuid: 'asg_paragraf_anlam_test',
    title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
    shortTitle: 'Paragraf Anlam Testi',
    subject: 'Türkçe',
    category: 'QUIZ',
    tool_type: 'QUIZ',
    className: '9-A Şubesi',
    assignedDate: '09.10.2026',
    dueDate: '14.10.2026',
    assignedTimestamp: Date.now() - 3 * 86400000,
    dueTimestamp: Date.now() + 2 * 86400000,
    description: '15 soruluk çoktan seçmeli paragraf analiz ve akıl yürütme tarama testi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'blue',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-worksheet-1',
    assignment_uuid: 'asg_tanzimat_siir_inceleme',
    title: 'Tanzimat Dönemi Şiir İncelemesi & Karşılaştırmalı Kompozisyon',
    shortTitle: 'Şiir İnceleme & Kompozisyon',
    subject: 'Türkçe',
    category: 'WORKSHEET',
    tool_type: 'WORKSHEET',
    className: '9-A Şubesi',
    assignedDate: '05.10.2026',
    dueDate: '12.10.2026',
    assignedTimestamp: Date.now() - 7 * 86400000,
    dueTimestamp: Date.now(),
    description: 'Namık Kemal ve Şinasi şiirlerinin biçim, tema ve dil özellikleri açısından karşılaştırmalı analizi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'amber',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
  {
    id: 'hw-math-1',
    assignment_uuid: 'asg_kumeler_mantik_calisma',
    title: 'Kümeler, Önermeler ve Bileşik Önermeler Problem Çalışması',
    shortTitle: 'Kümeler & Mantık Problemleri',
    subject: 'Matematik',
    category: 'MATH',
    tool_type: 'WORKSHEET',
    className: '9-A Şubesi',
    assignedDate: '07.10.2026',
    dueDate: '13.10.2026',
    assignedTimestamp: Date.now() - 5 * 86400000,
    dueTimestamp: Date.now() + 1 * 86400000,
    description: 'Doğruluk tabloları ve küme işlemleri içeren 10 adet analitik matematik problemi.',
    period: 'this_week',
    periodLabel: 'Bu Hafta',
    accentColor: 'rose',
    max_score: 100,
    teacher_name: 'Ebru TEKNECİ',
  },
]

const DEFAULT_INITIAL_SUBMISSIONS: Record<string, Record<string, SubmissionRecord>> = {
  'hw-reading-1': {
    's-1': {
      studentId: 's-1',
      score: 100,
      feedback: 'Harika bir metin tahlili! Kültürel motifleri ve karakter çatışmalarını çok derinlikli analiz etmişsin. Tebrik ederim.',
      submittedAt: '10.10.2026 16:30',
      status: 'submitted',
    },
  },
  'hw-whiteboard-1': {
    's-1': {
      studentId: 's-1',
      score: 98,
      feedback: 'Kavram haritası tasarımı ve edebi sanat örnekleri kusursuz düzeyde. Çok özenli bir çalışma.',
      submittedAt: '11.10.2026 14:15',
      status: 'submitted',
    },
  },
  'hw-quiz-1': {
    's-1': {
      studentId: 's-1',
      score: 95,
      feedback: '15 soruda 14 doğru ile üstün başarı. Paragrafta yardımcı düşünceler konusu pekiştirildi.',
      submittedAt: '11.10.2026 19:40',
      status: 'submitted',
    },
  },
  'hw-worksheet-1': {
    's-1': {
      studentId: 's-1',
      score: 100,
      feedback: 'Tanzimat dönemi tahlili ve kompozisyon dili oldukça akıcı ve edebi. Eline sağlık.',
      submittedAt: '12.10.2026 11:20',
      status: 'submitted',
    },
  },
  'hw-math-1': {
    's-1': {
      studentId: 's-1',
      score: 96,
      feedback: 'Mantık kuralları ve küme kesişim işlemleri adım adım doğru çözülmüş.',
      submittedAt: '11.10.2026 17:05',
      status: 'submitted',
    },
  },
}

export interface MHomeworkClientProps {
  hideDock?: boolean
  hideHeader?: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}

export default function MHomeworkClient({
  hideDock = false,
  hideHeader = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}: MHomeworkClientProps = {}) {
  // Synchronized theme state for unified header and UI styling
  const { theme: internalTheme, toggleTheme: internalToggleTheme } = useMobileTheme()
  const theme = propTheme || internalTheme
  const toggleTheme = propToggleTheme || internalToggleTheme

  // Prevent pinch-to-zoom & gesture changes
  useEffect(() => {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    const preventGesture = (e: Event) => e.preventDefault()
    document.addEventListener('touchmove', preventMultiTouch, { passive: false })
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    return () => {
      document.removeEventListener('touchmove', preventMultiTouch)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
    }
  }, [])

  // Branch & Modals
  const [selectedBranch, setSelectedBranch] = useState('9-A Şubesi')
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  // Homework Selector Modal state
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('')
  const [homeworkDateFilter, setHomeworkDateFilter] = useState<'all' | 'this_week' | 'past' | 'upcoming'>('all')
  const [homeworkSearch, setHomeworkSearch] = useState('')
  const [homeworkSortBy, setHomeworkSortBy] = useState<'newest' | 'due' | 'subject'>('newest')

  // Assignment Creation Form State
  const [assignmentVersion, setAssignmentVersion] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createTargetType, setCreateTargetType] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS')
  const [createTargetStudentId, setCreateTargetStudentId] = useState<string>('s-1')
  const [createTitle, setCreateTitle] = useState('')
  const [createSubject, setCreateSubject] = useState('Türk Dili ve Edebiyatı')
  const [createToolType, setCreateToolType] = useState<'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING'>('WORKSHEET')
  const [createDueDate, setCreateDueDate] = useState('2026-10-20T23:59')
  const [createMaxScore, setCreateMaxScore] = useState(100)
  const [createDescription, setCreateDescription] = useState('')

  // Tool Type Specific Dynamic States
  const [createWorksheetFileName, setCreateWorksheetFileName] = useState('')
  const [createWhiteboardTopic, setCreateWhiteboardTopic] = useState('Teşbih & İstiare Kavram Haritası')
  const [createWhiteboardCanvasType, setCreateWhiteboardCanvasType] = useState('İnteraktif Çizim Tuvali')
  const [createReadingBook, setCreateReadingBook] = useState('')
  const [createReadingPages, setCreateReadingPages] = useState('')
  const [createReadingQuestions, setCreateReadingQuestions] = useState('')
  const [createQuizQuestionCount, setCreateQuizQuestionCount] = useState(10)
  const [createQuizDifficulty, setCreateQuizDifficulty] = useState<'Kolay' | 'Orta' | 'İleri'>('Orta')

  // ── Assignment Edit Modal State ──
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSubject, setEditSubject] = useState('Türk Dili ve Edebiyatı')
  const [editToolType, setEditToolType] = useState<'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'>('WORKSHEET')
  const [editDueDate, setEditDueDate] = useState('2026-10-25T23:59')
  const [editMaxScore, setEditMaxScore] = useState(100)
  const [editDescription, setEditDescription] = useState('')
  const [editTargetType, setEditTargetType] = useState<'CLASS' | 'INDIVIDUAL'>('CLASS')
  const [editTargetStudentId, setEditTargetStudentId] = useState('s-1')
  const [editTargetStudentName, setEditTargetStudentName] = useState('Erçil UĞURLU')

  // ── Assignment Permissions (Yetkilendirme) Modal State ──
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [permissionHomework, setPermissionHomework] = useState<HomeworkItem | null>(null)
  const [permScope, setPermScope] = useState<'CLASS' | 'INDIVIDUAL' | 'DRAFT'>('CLASS')
  const [permStudentId, setPermStudentId] = useState('s-1')
  const [permAllowLate, setPermAllowLate] = useState(true)
  const [permAllowResubmit, setPermAllowResubmit] = useState(true)
  const [permAllowFileUpload, setPermAllowFileUpload] = useState(true)
  const [permParentNotification, setPermParentNotification] = useState(true)

  // ── Assignment Delete Modal State ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingHomework, setDeletingHomework] = useState<HomeworkItem | null>(null)

  // Seed default authentic assignments if storage is empty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = getStoredCustomAssignments()
        if (stored.length === 0) {
          const defaults: SchoolAssignmentItem[] = [
            {
              id: 1001,
              assignment_uuid: 'asg_dede_korkut_okuma',
              title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
              description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
              grade_level: '9. Sınıf',
              grade_category: 'Lise (9-12)',
              subject: 'Türk Dili ve Edebiyatı',
              tool_type: 'READING',
              classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
              due_date: '2026-10-18T23:59:00',
              max_score: 100,
              published: true,
              teacher_name: 'Ebru TEKNECİ',
              creation_date: '2026-10-06T09:00:00',
            },
            {
              id: 1002,
              assignment_uuid: 'asg_edebi_sanatlar_tahta',
              title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
              description: 'Divan ve Halk edebiyatında kullanılan teşbih, istiare ve mecaz-ı mürsel sanatlarını gösteren interaktif kavram haritası.',
              grade_level: '9. Sınıf',
              grade_category: 'Lise (9-12)',
              subject: 'Türk Dili ve Edebiyatı',
              tool_type: 'WHITEBOARD',
              classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
              due_date: '2026-10-20T23:59:00',
              max_score: 100,
              published: true,
              teacher_name: 'Ebru TEKNECİ',
              creation_date: '2026-10-08T10:00:00',
            },
          ]
          defaults.forEach((d) => saveStoredCustomAssignment(d))
          setAssignmentVersion((v) => v + 1)
        }
      } catch (_) {}
    }
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      setAssignmentVersion((v) => v + 1)
    }
    window.addEventListener('oxonom_assignments_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('oxonom_assignments_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const handleCreateAssignment = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createTitle.trim()) {
      toast.error('Lütfen ödev başlığı giriniz.')
      return
    }

    const targetStudent = ALL_INITIAL_STUDENTS.find((s) => s.id === createTargetStudentId) || ALL_INITIAL_STUDENTS[0]
    const isIndividual = createTargetType === 'INDIVIDUAL'

    let detailedDesc = createDescription.trim()
    if (createToolType === 'READING') {
      const parts = []
      if (createReadingBook) parts.push(`Kitap / Eser: ${createReadingBook}`)
      if (createReadingPages) parts.push(`Sayfa Aralığı: ${createReadingPages}`)
      if (createReadingQuestions) parts.push(`Tahlil Soruları: ${createReadingQuestions}`)
      if (parts.length > 0) detailedDesc = `${parts.join(' · ')}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'QUIZ') {
      detailedDesc = `Soru Sayısı: ${createQuizQuestionCount} · Seviye: ${createQuizDifficulty}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'WHITEBOARD') {
      detailedDesc = `Tuval Tipi: ${createWhiteboardCanvasType} · Konu: ${createWhiteboardTopic}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    } else if (createToolType === 'WORKSHEET' && createWorksheetFileName) {
      detailedDesc = `Ekli Çalışma Belgesi: ${createWorksheetFileName}${detailedDesc ? `\n\n${detailedDesc}` : ''}`
    }

    const newId = Date.now()
    const newAsg: SchoolAssignmentItem = {
      id: newId,
      assignment_uuid: `asg_${newId}`,
      title: createTitle.trim(),
      description: detailedDesc.trim() || 'Öğretmen tarafından tanımlanan ödev görevi.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: createSubject,
      tool_type: createToolType,
      tool_data: {
        targetType: createTargetType,
        targetStudentId: isIndividual ? targetStudent.id : null,
        targetStudentName: isIndividual ? targetStudent.name : null,
        attachedFileName: createWorksheetFileName || null,
        readingBook: createReadingBook || null,
        readingPages: createReadingPages || null,
        readingQuestions: createReadingQuestions || null,
        quizQuestionCount: createQuizQuestionCount || null,
        quizDifficulty: createQuizDifficulty || null,
        whiteboardTopic: createWhiteboardTopic || null,
        whiteboardCanvasType: createWhiteboardCanvasType || null,
      },
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: createDueDate || '2026-10-20T23:59:00',
      max_score: Number(createMaxScore) || 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: new Date().toISOString(),
    }

    saveStoredCustomAssignment(newAsg)

    // Sync to student storage so student screen instantly reads it
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        localStorage.setItem(studentKey, JSON.stringify([newAsg, ...parsed.filter((p: any) => p.id !== newAsg.id)]))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: newAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    setSelectedHomeworkId(String(newId))
    setIsCreateModalOpen(false)
    setCreateTitle('')
    setCreateDescription('')
    setCreateWorksheetFileName('')
    setCreateReadingBook('')
    setCreateReadingPages('')
    setCreateReadingQuestions('')

    if (isIndividual) {
      toast.success(`Yeni ödev oluşturuldu ve ${targetStudent.name} öğrencisine atandı!`, { duration: 4000, icon: '🎉' })
    } else {
      toast.success('Yeni ödev başarıyla oluşturuldu ve 9/A şubesine atandı!', { duration: 4000, icon: '🎉' })
    }
  }

  // Real merged school assignments (Custom created only for new accounts)
  const allSchoolHomeworks = useMemo(() => {
    const customList = getStoredCustomAssignments()
    const rawDeleted = typeof window !== 'undefined' ? localStorage.getItem('oxonom_deleted_homework_ids') : null
    const deletedIds: string[] = rawDeleted ? JSON.parse(rawDeleted) : []

    const convertedCustom: HomeworkItem[] = customList
      .filter((asg) => !asg.title?.includes('Ritmik Sayma') && !asg.title?.includes('1 Dk Hızlı Okuma'))
      .filter((asg) => !deletedIds.includes(String(asg.id)) && !deletedIds.includes(asg.assignment_uuid))
      .map((asg) => {
        const className = asg.classes?.[0]?.name || '9-A Şubesi'
        const assignedMs = asg.creation_date ? new Date(asg.creation_date).getTime() : Date.now()
        const dueMs = asg.due_date ? new Date(asg.due_date).getTime() : Date.now() + 7 * 86400000
        const now = Date.now()
        let period: 'this_week' | 'past' | 'upcoming' = 'this_week'
        let periodLabel = 'Bu Hafta'
        if (dueMs < now) {
          period = 'past'
          periodLabel = 'Geçmiş'
        } else if (dueMs > now + 7 * 86400000) {
          period = 'upcoming'
          periodLabel = 'Gelecek'
        }

        return {
          id: String(asg.id || asg.assignment_uuid),
          assignment_uuid: asg.assignment_uuid,
          title: asg.title,
          shortTitle: asg.title.split(':')?.[1]?.trim() || asg.title,
          subject: (asg.subject as any) || 'Türkçe',
          category: (asg.tool_type as any) || 'WHITEBOARD',
          tool_type: asg.tool_type,
          tool_data: asg.tool_data,
          target_type: (asg.tool_data?.targetType as any) || 'CLASS',
          target_student_id: asg.tool_data?.targetStudentId || undefined,
          target_student_name: asg.tool_data?.targetStudentName || undefined,
          attached_file_name: asg.tool_data?.attachedFileName || undefined,
          board_uuid: asg.board_uuid,
          className,
          assignedDate: new Date(assignedMs).toLocaleDateString('tr-TR'),
          dueDate: asg.due_date ? new Date(asg.due_date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '15.10.2026 23:59',
          assignedTimestamp: assignedMs,
          dueTimestamp: dueMs,
          description: asg.description || 'Öğretmen tarafından tanımlanan ödev görevi.',
          period,
          periodLabel,
          accentColor: asg.subject === 'Türkçe' || asg.subject.includes('Edebiyat') ? 'rose' : asg.subject === 'Hayat Bilgisi' ? 'emerald' : 'blue',
          max_score: asg.max_score || 100,
          teacher_name: asg.teacher_name || 'Ebru TEKNECİ',
          permissions: asg.tool_data?.permissions,
        }
      })

    const combined: HomeworkItem[] = [...convertedCustom]
    INITIAL_HOMEWORKS.forEach((initHw) => {
      if (
        !deletedIds.includes(initHw.id) &&
        !deletedIds.includes(initHw.assignment_uuid || '') &&
        !combined.some(
          (c) =>
            c.id === initHw.id ||
            c.assignment_uuid === initHw.assignment_uuid ||
            c.title === initHw.title
        )
      ) {
        combined.push(initHw)
      }
    })

    return combined
  }, [assignmentVersion])

  // Branch-specific students roster
  const students = useMemo(() => {
    if (selectedBranch === 'all' || selectedBranch === 'Tüm Şubeler' || selectedBranch === 'Tüm Sınıflar ve Şubeler') {
      return ALL_INITIAL_STUDENTS
    }
    const filtered = ALL_INITIAL_STUDENTS.filter((s) => s.className === selectedBranch || s.className?.includes('9-A'))
    return filtered.length > 0 ? filtered : ALL_INITIAL_STUDENTS
  }, [selectedBranch])

  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-1')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'on_time' | 'late' | 'not_submitted'>('all')

  // Submissions Map: Record<homeworkId, Record<studentId, SubmissionRecord>>
  const [allSubmissions, setAllSubmissions] = useState<Record<string, Record<string, SubmissionRecord>>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('m_homework_submissions_v2')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Object.keys(parsed).length > 0) return parsed
        }
      } catch (err) {
        console.warn('Could not restore submissions from localStorage:', err)
      }
    }
    return DEFAULT_INITIAL_SUBMISSIONS
  })

  // Sync active homework when selectedHomeworkId changes (returns null if empty)
  const currentHomework = useMemo(() => {
    if (allSchoolHomeworks.length === 0) return null
    return allSchoolHomeworks.find((hw) => hw.id === selectedHomeworkId) || allSchoolHomeworks[0]
  }, [allSchoolHomeworks, selectedHomeworkId])

  // Current Homework's Submissions Map
  const currentSubmissions = useMemo(() => {
    if (!currentHomework) return {}
    return allSubmissions[currentHomework.id] || {}
  }, [allSubmissions, currentHomework])

  // Grading form state for the currently active student
  const [currentScore, setCurrentScore] = useState<number>(100)
  const [currentFeedback, setCurrentFeedback] = useState<string>('')
  const carouselRef = useRef<HTMLDivElement>(null)

  // Sync grading input when selected student or homework changes
  useEffect(() => {
    const existing = currentSubmissions[selectedStudentId]
    if (existing) {
      setCurrentScore(existing.score)
      setCurrentFeedback(existing.feedback || '')
    } else {
      setCurrentScore(100)
      setCurrentFeedback('')
    }
  }, [selectedStudentId, currentSubmissions])

  // Persist submissions
  const saveAllSubmissions = (newAll: Record<string, Record<string, SubmissionRecord>>) => {
    setAllSubmissions(newAll)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('m_homework_submissions_v2', JSON.stringify(newAll))
      } catch (err) {
        console.warn('Failed to save submissions:', err)
      }
    }
  }

  // Selected Student Object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0]
  }, [students, selectedStudentId])

  // Selected Student Index in list
  const selectedIndex = useMemo(() => {
    return students.findIndex((s) => s.id === selectedStudentId)
  }, [students, selectedStudentId])

  // Scroll carousel into view when student changes
  const handleSelectStudent = (id: string, index?: number) => {
    setSelectedStudentId(id)
    if (carouselRef.current && typeof index === 'number') {
      const cardWidth = 330
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      })
    }
  }

  // Filtered Students for the full list view
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentNo.toLowerCase().includes(studentSearch.toLowerCase())
      if (!matchesSearch) return false

      const sub = currentSubmissions[s.id]
      if (filterTab === 'on_time') return sub?.status === 'submitted'
      if (filterTab === 'late') return sub?.status === 'late'
      if (filterTab === 'not_submitted') return !sub || sub.status === 'not_submitted'
      return true
    })
  }, [students, studentSearch, filterTab, currentSubmissions])

  // Statistics calculation for the current homework
  const stats = useMemo(() => {
    const total = students.length
    let onTime = 0
    let late = 0
    Object.values(currentSubmissions).forEach((sub) => {
      if (sub.status === 'submitted') onTime++
      if (sub.status === 'late') late++
    })
    const notSubmitted = total - (onTime + late)
    return { total, onTime, late, notSubmitted }
  }, [students.length, currentSubmissions])

  // Handle Save Evaluation
  const handleSaveEvaluation = () => {
    if (!selectedStudent || !currentHomework) return
    const now = new Date()
    const timeFormatted = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`

    const newRecord: SubmissionRecord = {
      studentId: selectedStudent.id,
      score: currentScore,
      feedback: currentFeedback.trim(),
      submittedAt: timeFormatted,
      status: 'submitted',
    }

    const updatedHwSubmissions = {
      ...currentSubmissions,
      [selectedStudent.id]: newRecord,
    }

    const updatedAll = {
      ...allSubmissions,
      [currentHomework.id]: updatedHwSubmissions,
    }

    saveAllSubmissions(updatedAll)
    toast.success(`${selectedStudent.name} için ${currentScore} puan ve geri bildirim kaydedildi!`, {
      icon: '🎉',
      duration: 3500,
    })
  }

  // Filtered branches for the branch modal
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return BRANCH_OPTIONS
    return BRANCH_OPTIONS.filter((b) =>
      b.title.toLowerCase().includes(branchSearch.toLowerCase())
    )
  }, [branchSearch])

  // Filtered and Sorted Homework Items for the Homework Selection Modal
  const classHomeworks = useMemo(() => {
    // 1. Branch filter with normalized code comparison
    let list = allSchoolHomeworks
    if (selectedBranch !== 'Tüm Şubeler' && selectedBranch !== 'all' && selectedBranch !== 'Tüm Sınıflar ve Şubeler') {
      const normSelected = normalizeClassCode(selectedBranch)
      list = list.filter((hw) => normalizeClassCode(hw.className) === normSelected)
    }

    // 2. Chronological/period filter
    if (homeworkDateFilter !== 'all') {
      list = list.filter((hw) => hw.period === homeworkDateFilter)
    }

    // 3. Search query filter
    if (homeworkSearch.trim()) {
      const q = homeworkSearch.toLowerCase()
      list = list.filter(
        (hw) =>
          hw.title.toLowerCase().includes(q) ||
          hw.subject.toLowerCase().includes(q) ||
          hw.description.toLowerCase().includes(q)
      )
    }

    // 4. Sorting
    const sorted = [...list]
    if (homeworkSortBy === 'newest') {
      sorted.sort((a, b) => b.assignedTimestamp - a.assignedTimestamp)
    } else if (homeworkSortBy === 'due') {
      sorted.sort((a, b) => a.dueTimestamp - b.dueTimestamp)
    } else if (homeworkSortBy === 'subject') {
      sorted.sort((a, b) => a.subject.localeCompare(b.subject, 'tr'))
    }

    return sorted
  }, [allSchoolHomeworks, selectedBranch, homeworkDateFilter, homeworkSearch, homeworkSortBy])

  // Homework count metrics for tabs
  const homeworkMetrics = useMemo(() => {
    const normSelected = normalizeClassCode(selectedBranch)
    const list =
      selectedBranch === 'Tüm Şubeler' || selectedBranch === 'all' || selectedBranch === 'Tüm Sınıflar ve Şubeler'
        ? allSchoolHomeworks
        : allSchoolHomeworks.filter((hw) => normalizeClassCode(hw.className) === normSelected)

    return {
      all: list.length,
      this_week: list.filter((hw) => hw.period === 'this_week').length,
      past: list.filter((hw) => hw.period === 'past').length,
      upcoming: list.filter((hw) => hw.period === 'upcoming').length,
    }
  }, [allSchoolHomeworks, selectedBranch])

  // Change selected homework
  const handleSelectHomework = (hw: HomeworkItem) => {
    setSelectedHomeworkId(hw.id)
    setIsHomeworkModalOpen(false)
    toast.success(`"${hw.shortTitle}" ödevi seçildi!`, {
      icon: '📚',
      duration: 3000,
    })
  }

  // ── 1. Ödev Düzenleme Aksiyonları ──
  const handleOpenEditModal = (hw: HomeworkItem) => {
    setEditingHomework(hw)
    setEditTitle(hw.title)
    setEditSubject(hw.subject)
    setEditToolType(((hw.tool_type as any) || (hw.category as any) || 'WORKSHEET') as any)
    let dVal = '2026-10-25T23:59'
    if (hw.dueTimestamp) {
      const d = new Date(hw.dueTimestamp)
      const yr = d.getFullYear()
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const da = String(d.getDate()).padStart(2, '0')
      const hr = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      dVal = `${yr}-${mo}-${da}T${hr}:${mi}`
    }
    setEditDueDate(dVal)
    setEditMaxScore(hw.max_score || 100)
    setEditDescription(hw.description)
    setEditTargetType(hw.target_type || 'CLASS')
    setEditTargetStudentId(hw.target_student_id || 's-1')
    setEditTargetStudentName(hw.target_student_name || 'Erçil UĞURLU')
    setIsEditModalOpen(true)
  }

  const handleSaveEditHomework = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHomework) return
    if (!editTitle.trim()) {
      toast.error('Lütfen geçerli bir ödev başlığı girin.')
      return
    }

    const updatedAsg: SchoolAssignmentItem = {
      id: Number(editingHomework.id.replace(/\D/g, '')) || Date.now(),
      assignment_uuid: editingHomework.assignment_uuid || `asg_${editingHomework.id}`,
      title: editTitle.trim(),
      description: editDescription.trim() || 'Öğretmen tarafından güncellenen ödev.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: editSubject,
      tool_type: editToolType as any,
      tool_data: {
        ...(editingHomework.tool_data || {}),
        targetType: editTargetType,
        targetStudentId: editTargetType === 'INDIVIDUAL' ? editTargetStudentId : null,
        targetStudentName: editTargetType === 'INDIVIDUAL' ? editTargetStudentName : null,
        permissions: editingHomework.permissions,
      },
      classes: [{ id: 101, name: editingHomework.className || '9-A Şubesi', code: '9/A' }],
      due_date: editDueDate || '2026-10-25T23:59:00',
      max_score: Number(editMaxScore) || 100,
      published: true,
      teacher_name: editingHomework.teacher_name || 'Ebru TEKNECİ',
      creation_date: new Date(editingHomework.assignedTimestamp || Date.now()).toISOString(),
    }

    saveStoredCustomAssignment(updatedAsg)

    // Sync to student storage
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        const filtered = parsed.filter(
          (p: any) => String(p.id) !== String(updatedAsg.id) && p.assignment_uuid !== updatedAsg.assignment_uuid
        )
        localStorage.setItem(studentKey, JSON.stringify([updatedAsg, ...filtered]))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: updatedAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${editTitle}" ödevi başarıyla güncellendi!`, { icon: '✏️' })
    setIsEditModalOpen(false)
    setEditingHomework(null)
  }

  // ── 2. Ödev Yetkilendirme (Permissions) Aksiyonları ──
  const handleOpenPermissionModal = (hw: HomeworkItem) => {
    setPermissionHomework(hw)
    setPermScope((hw.target_type as any) || 'CLASS')
    setPermStudentId(hw.target_student_id || 's-1')
    setPermAllowLate(hw.permissions?.allowLateSubmission ?? true)
    setPermAllowResubmit(hw.permissions?.allowResubmission ?? true)
    setPermAllowFileUpload(hw.permissions?.allowFileUpload ?? true)
    setPermParentNotification(hw.permissions?.parentNotification ?? true)
    setIsPermissionModalOpen(true)
  }

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault()
    if (!permissionHomework) return

    const targetStudent = ALL_INITIAL_STUDENTS.find((s) => s.id === permStudentId) || ALL_INITIAL_STUDENTS[0]
    const permissionsObj = {
      allowLateSubmission: permAllowLate,
      allowResubmission: permAllowResubmit,
      allowFileUpload: permAllowFileUpload,
      parentNotification: permParentNotification,
      accessScope: permScope,
    }

    const updatedAsg: SchoolAssignmentItem = {
      id: Number(permissionHomework.id.replace(/\D/g, '')) || Date.now(),
      assignment_uuid: permissionHomework.assignment_uuid || `asg_${permissionHomework.id}`,
      title: permissionHomework.title,
      description: permissionHomework.description,
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: permissionHomework.subject,
      tool_type: (permissionHomework.tool_type as any) || 'WORKSHEET',
      tool_data: {
        ...(permissionHomework.tool_data || {}),
        targetType: permScope === 'DRAFT' ? 'CLASS' : permScope,
        targetStudentId: permScope === 'INDIVIDUAL' ? targetStudent.id : null,
        targetStudentName: permScope === 'INDIVIDUAL' ? targetStudent.name : null,
        permissions: permissionsObj,
      },
      classes: [{ id: 101, name: permissionHomework.className || '9-A Şubesi', code: '9/A' }],
      due_date: new Date(permissionHomework.dueTimestamp || Date.now() + 7 * 86400000).toISOString(),
      max_score: permissionHomework.max_score || 100,
      published: permScope !== 'DRAFT',
      teacher_name: permissionHomework.teacher_name || 'Ebru TEKNECİ',
      creation_date: new Date(permissionHomework.assignedTimestamp || Date.now()).toISOString(),
    }

    saveStoredCustomAssignment(updatedAsg)

    // Sync to student storage
    if (typeof window !== 'undefined') {
      try {
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        const parsed = existing ? JSON.parse(existing) : []
        const filtered = parsed.filter(
          (p: any) => String(p.id) !== String(updatedAsg.id) && p.assignment_uuid !== updatedAsg.assignment_uuid
        )
        if (permScope !== 'DRAFT') {
          localStorage.setItem(studentKey, JSON.stringify([updatedAsg, ...filtered]))
        } else {
          localStorage.setItem(studentKey, JSON.stringify(filtered))
        }
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: updatedAsg }))
      } catch (_) {}
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${permissionHomework.title}" ödev erişim ve yetki ayarları güncellendi!`, { icon: '🛡️' })
    setIsPermissionModalOpen(false)
    setPermissionHomework(null)
  }

  // ── 3. Ödev Silme (Delete) Aksiyonları ──
  const handleOpenDeleteModal = (hw: HomeworkItem) => {
    setDeletingHomework(hw)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDeleteHomework = () => {
    if (!deletingHomework) return
    const hwId = deletingHomework.id
    const hwUuid = deletingHomework.assignment_uuid || deletingHomework.id

    // 1. Delete from stored custom assignments
    deleteStoredCustomAssignment(hwUuid)

    // 2. Mark as deleted in localStorage so initial homeworks are also omitted
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_deleted_homework_ids')
        const deleted: string[] = raw ? JSON.parse(raw) : []
        if (!deleted.includes(hwId)) deleted.push(hwId)
        if (hwUuid && !deleted.includes(hwUuid)) deleted.push(hwUuid)
        localStorage.setItem('oxonom_deleted_homework_ids', JSON.stringify(deleted))

        // Clean from student storage
        const studentKey = 'oxonom_student_homeworks_3001'
        const existing = localStorage.getItem(studentKey)
        if (existing) {
          const parsed = JSON.parse(existing)
          const updated = parsed.filter((p: any) => p.id !== hwId && p.assignment_uuid !== hwUuid)
          localStorage.setItem(studentKey, JSON.stringify(updated))
        }

        window.dispatchEvent(new CustomEvent('oxonom_assignments_updated', { detail: { id: hwId } }))
        window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: { id: hwId } }))
      } catch (_) {}
    }

    // Switch selected homework if deleting the active one
    const remaining = allSchoolHomeworks.filter((h) => h.id !== hwId && h.assignment_uuid !== hwUuid)
    if (remaining.length > 0) {
      setSelectedHomeworkId(remaining[0].id)
    } else {
      setSelectedHomeworkId('')
    }

    setAssignmentVersion((v) => v + 1)
    toast.success(`"${deletingHomework.title}" ödevi başarıyla silindi.`, { icon: '🗑️' })
    setIsDeleteModalOpen(false)
    setDeletingHomework(null)
  }

  const isCurrentSubmitted = !!currentSubmissions[selectedStudent?.id]

  const pageContent = (
    <div className="flex flex-col flex-1 w-full">
      {/* ── STAGGERED PAGE CONTENT WRAPPER (Fluid Left Entrance) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 w-full dash-stagger-items"
      >

        {/* ── 2. HERO / ASSIGNMENT INFO CARD & EMPTY STATE ── */}
        {!currentHomework ? (
          <div className="mx-4 my-8 bg-white dark:bg-[#111624] border border-dashed border-gray-200 dark:border-white/10 rounded-[26px] p-8 text-center flex flex-col items-center justify-center gap-3.5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-300 flex items-center justify-center">
              <CheckSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Henüz Verilmiş Bir Ödev Bulunmuyor
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                9/A şubesi için henüz tanımlanmış bir ödev görevi bulunmuyor. Yeni bir ödev veya çalışma oluşturduğunuzda öğrenci teslimleri ve değerlendirmeleri burada listelenecektir.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Yeni Ödev Tanımla</span>
              </button>
              <Link
                href="/teacher/classes?class=9/A"
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Öğrenci Listesi</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── TOP PROMINENT ACTION BAR / WEB TOOLBAR (IMAGE 1 GÖRÜNÜR & WEB UYUMLU ALAN) ── */}
            <div className="mx-4 mt-3 bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Sol: Başlık ve Bilgi */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpenCheck size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Ödev & Değerlendirme Portalı
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      {currentHomework.subject}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                    {selectedBranch} Ödev ve Çalışma Görevleri
                  </h2>
                </div>
              </div>

              {/* Sağ: İstenen 3 Belirgin Kontrol (Sınıf Seçici, Ödev Seçici, Yeni Ödev Ver) */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
                {/* 1. Sınıf Seçimi Butonu */}
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(true)}
                  className="flex-1 sm:flex-none h-11 px-3.5 sm:px-4 rounded-xl bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
                  title="Sınıf / Şube Değiştir"
                >
                  <Users size={16} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>{selectedBranch}</span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                </button>

                {/* 2. Ödev Seç Butonu */}
                <button
                  type="button"
                  onClick={() => setIsHomeworkModalOpen(true)}
                  className="flex-1 sm:flex-none h-11 px-3.5 sm:px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 group"
                  title="Bu sınıfa ait ödevleri seç ve tarihsel filtrele"
                >
                  <BookOpenCheck size={16} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Ödev Seç</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-[10px] font-black text-indigo-800 dark:text-indigo-200">
                    {classHomeworks.length}
                  </span>
                  <ChevronDown size={14} className="text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors" />
                </button>

                {/* 3. Yeni Ödev Ver Butonu (Geniş, Yüksek Görünürlüklü Yeşil Buton) */}
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto h-11 px-4 sm:px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer border border-emerald-400 group"
                  title="9/A Şubesine Yeni Ödev Tanımla"
                >
                  <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
                  <span>+ Yeni Ödev Ver</span>
                </button>
              </div>
            </div>

            {/* ── HERO / AKTİF ÖDEV KARTI ── */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mt-3 bg-[#0A0D15] text-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-4 shadow-xl border border-white/10 relative overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 100% 0%,rgba(255,255,255,.12) 0%,rgba(255,255,255,0) 55%),linear-gradient(45deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(-45deg,rgba(255,255,255,.04) 1px,transparent 1px)',
                backgroundSize: 'auto,26px 26px,26px 26px',
              }}
            >
              {/* Header: Title & Meta Badges */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/35 text-[#34D399] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={22} strokeWidth={1.9} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-extrabold uppercase tracking-wide">
                      {currentHomework.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 text-[10.5px] font-bold">
                      {currentHomework.category}
                    </span>
                    {currentHomework.target_type === 'INDIVIDUAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-bold flex items-center gap-1">
                        <User size={11} />
                        <span>Bireysel: {currentHomework.target_student_name || 'Öğrenci'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1">
                        <Users size={11} />
                        <span>Tüm Sınıf (9/A)</span>
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10.5px] font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>Son Teslim: {currentHomework.dueDate}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(true)}
                    className="text-left group flex items-start gap-1 w-full cursor-pointer"
                    title="Ödevi değiştirmek için tıklayın"
                  >
                    <h1 className="text-base sm:text-xl leading-snug font-extrabold tracking-tight text-white m-0 group-hover:text-emerald-300 transition-colors">
                      {currentHomework.title} — Teslim ve Değerlendirme
                    </h1>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] leading-relaxed text-[#B4BDCC] m-0">
                {currentHomework.description}
              </p>

          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-white leading-tight">
                {stats.total}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                TOPLAM
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#6EE7B7] leading-tight">
                {stats.onTime}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                ZAMANINDA
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#FCD34D] leading-tight">
                {stats.late}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                GEÇ
              </div>
            </div>

            <div className="bg-white/7 border border-white/12 rounded-[14px] py-2 px-1 text-center">
              <div className="text-[19px] font-extrabold text-[#FCA5A5] leading-tight">
                {stats.notSubmitted}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-[#B4BDCC] mt-1">
                ETMEYEN
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── MAIN CONTENT SECTIONS (RESPONSIVE WEB 2-COLUMN GRID) ── */}
        <main className="flex-1 px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
            {/* SOL SÜTUN (5/12): ÖĞRENCİ SEÇİMİ, LİSTESİ & KÜNYESİ */}
            <div className="lg:col-span-5 space-y-4">

          {/* ── 3. SECTION: ÖĞRENCİ SEÇ (CAROUSEL & COLLAPSIBLE LIST) ── */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-[#5B6577] dark:text-gray-400 mt-1">
            <span className="w-4.5 h-[3px] rounded-full bg-[#34D399]" />
            <span>ÖĞRENCİ</span>
            <span className="flex-1 h-px bg-[#DDE3EC] dark:bg-gray-800" />
            <span className="tracking-normal text-[#334155] dark:text-gray-300 font-semibold">
              {students.length} öğrenci
            </span>
          </div>

          <section className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] shadow-sm overflow-hidden transition-colors">
            {/* Header: Clickable / Toggle Dropdown */}
            <div
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="p-4 flex flex-col gap-3 cursor-pointer select-none border-b border-[#E7EBF2]/60 dark:border-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-[38px] h-[38px] rounded-[12px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Users size={19} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="block text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
                      Öğrenci Seç
                    </span>
                    <span className="block text-[12px] text-[#5B6577] dark:text-gray-400 mt-0.5">
                      {selectedIndex + 1} / {students.length} · Tüm öğrenciler
                    </span>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full bg-[#F1F4F9] dark:bg-white/10 text-[#5B6577] dark:text-gray-300 flex items-center justify-center transition-transform duration-200 ${
                    isDetailsOpen ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown size={16} strokeWidth={2.4} />
                </div>
              </div>

              {/* Horizontal Snap Carousel */}
              <div
                ref={carouselRef}
                className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1 -mx-4 px-4 scroll-smooth"
              >
                {students.map((student, idx) => {
                  const isSelected = student.id === selectedStudentId
                  const sub = currentSubmissions[student.id]
                  const isSubmitted = sub?.status === 'submitted'
                  const initial = student.name.charAt(0).toUpperCase()

                  return (
                    <div
                      key={student.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectStudent(student.id, idx)
                      }}
                      className={`flex-none w-[86%] max-w-[295px] snap-start rounded-[18px] p-3 flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[1.5px] border-[#4338CA] bg-[#F4F5FF] dark:bg-[#1a1f33] shadow-md'
                          : 'border border-[#E7EBF2] dark:border-white/10 bg-white dark:bg-[#141b2c] hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-[#E9EDF4] dark:bg-white/15 text-[#334155] dark:text-white text-[16px] font-black flex items-center justify-center shrink-0">
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-0.5 items-start">
                        <span className="text-[13.5px] font-bold text-gray-900 dark:text-white truncate w-full">
                          {student.name}
                        </span>
                        <span className="text-[11px] text-[#5B6577] dark:text-gray-400">
                          Son Teslim: {currentHomework.dueDate}
                        </span>

                        <div className="mt-1">
                          {isSubmitted ? (
                            <span className="h-[22px] inline-flex items-center gap-1 px-2.5 rounded-full bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] dark:border-emerald-800 text-[#047857] dark:text-emerald-300 text-[10.5px] font-bold whitespace-nowrap">
                              <CheckCircle2 size={11} />
                              <span>Teslim Edildi ({sub.score} Puan)</span>
                            </span>
                          ) : (
                            <span className="h-[22px] inline-flex items-center px-2.5 rounded-full bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] dark:border-rose-900 text-[#B91C1C] dark:text-rose-300 text-[10.5px] font-bold whitespace-nowrap">
                              Teslim Etmedi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {students.slice(0, 6).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-all ${
                      i === (selectedIndex % 6)
                        ? 'w-4.5 h-1.5 rounded-full bg-[#4338CA]'
                        : 'w-1.5 h-1.5 rounded-full bg-[#D5DBE5] dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-center text-[11px] text-[#5B6577] dark:text-gray-400">
                Kaydırarak öğrenciler arasında geçiş yapın · Listeyi açmak için dokunun
              </span>
            </div>

            {/* Expanded Detailed Student Filter & List */}
            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 flex flex-col gap-3 bg-[#FAFCFF] dark:bg-[#0f1422] border-t border-[#E7EBF2] dark:border-white/10"
                >
                  {/* Filter Pills */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'all'
                          ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15]'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Tümü ({stats.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('on_time')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'on_time'
                          ? 'bg-[#047857] text-white'
                          : 'bg-[#E8F6F0] dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-[#BFE8D5] dark:border-emerald-800'
                      }`}
                    >
                      Zamanında ({stats.onTime})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('late')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'late'
                          ? 'bg-[#B45309] text-white'
                          : 'bg-[#FDF0DC] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-[#F5D9A8] dark:border-amber-800'
                      }`}
                    >
                      Geç ({stats.late})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('not_submitted')}
                      className={`h-[36px] px-3.5 rounded-[12px] text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        filterTab === 'not_submitted'
                          ? 'bg-[#B91C1C] text-white'
                          : 'bg-[#FDEBEB] dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-300 border border-[#F8CACA] dark:border-rose-900'
                      }`}
                    >
                      Etmeyenler ({stats.notSubmitted})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center gap-2.5 h-[46px] px-3.5 rounded-[14px] bg-white dark:bg-[#182033] border border-[#E1E6EE] dark:border-white/10 shadow-xs">
                    <Search size={17} className="text-[#5B6577] dark:text-gray-400 shrink-0" />
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Öğrenci ara..."
                      className="flex-1 bg-transparent border-0 outline-hidden text-[13px] text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {studentSearch && (
                      <button
                        type="button"
                        onClick={() => setStudentSearch('')}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Vertical Student List */}
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredStudents.map((st, i) => {
                      const isSel = st.id === selectedStudentId
                      const sub = currentSubmissions[st.id]
                      const isSub = sub?.status === 'submitted'

                      return (
                        <div
                          key={st.id}
                          onClick={() => handleSelectStudent(st.id, i)}
                          className={`p-3 rounded-[16px] flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSel
                              ? 'border-[1.5px] border-[#4338CA] bg-[#F4F5FF] dark:bg-[#1a2137]'
                              : 'border border-[#E7EBF2] dark:border-white/5 bg-white dark:bg-[#141b2c] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#E9EDF4] dark:bg-white/15 text-[#334155] dark:text-white text-[14px] font-black flex items-center justify-center shrink-0">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {st.name}
                              </span>
                              <span className="block text-[10.5px] text-[#5B6577] dark:text-gray-400">
                                Son Teslim: {currentHomework.dueDate}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`h-[24px] inline-flex items-center px-2.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                              isSub
                                ? 'bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] text-[#047857] dark:text-emerald-300'
                                : 'bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] text-[#B91C1C] dark:text-rose-300'
                            }`}
                          >
                            {isSub ? `Teslim Edildi (${sub.score})` : 'Teslim Etmedi'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <span className="text-center text-[11px] text-[#5B6577] dark:text-gray-400">
                    +{Math.max(0, students.length - 5)} öğrenci daha · listeyi kaydırın
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── 4. SECTION: SEÇİLİ ÖĞRENCİ ── */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-[#5B6577] dark:text-gray-400 mt-1">
            <span className="w-4.5 h-[3px] rounded-full bg-[#34D399]" />
            <span>SEÇİLİ ÖĞRENCİ</span>
            <span className="flex-1 h-px bg-[#DDE3EC] dark:bg-gray-800" />
          </div>

          <motion.section
            key={`${selectedStudent?.id}-${currentHomework.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight truncate m-0">
                  {selectedStudent?.name}
                </h2>
                <p className="text-[12px] text-[#5B6577] dark:text-gray-400 mt-1 m-0">
                  Sınıf: {selectedStudent?.className || selectedBranch} · Kullanıcı Adı: @{selectedStudent?.email?.split('@')[0] || 'ogrenci'}
                </p>
              </div>

              <span
                className={`h-[28px] inline-flex items-center px-3 rounded-[14px] text-[11px] font-extrabold whitespace-nowrap shrink-0 ${
                  isCurrentSubmitted
                    ? 'bg-[#E8F6F0] dark:bg-emerald-950/70 border border-[#BFE8D5] text-[#047857] dark:text-emerald-300'
                    : 'bg-[#FDEBEB] dark:bg-rose-950/70 border border-[#F8CACA] text-[#B91C1C] dark:text-rose-300'
                }`}
              >
                {isCurrentSubmitted ? 'Teslim Edildi' : 'Teslim Edilmedi'}
              </span>
            </div>

            <div className="bg-[#F6F8FC] dark:bg-[#161c2d] border border-[#E9EDF4] dark:border-white/5 rounded-[16px] p-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-[#5B6577] dark:text-gray-400 font-semibold">
                  Son Teslim Tarihi:
                </span>
                <span className="block text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                  {currentHomework.dueDate}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#5B6577] dark:text-gray-400 font-semibold">
                  Teslim Zamanı:
                </span>
                <span className="block text-[13px] font-bold text-gray-900 dark:text-white mt-1">
                  {currentSubmissions[selectedStudent?.id]?.submittedAt || '—'}
                </span>
              </div>
            </div>

            {isCurrentSubmitted ? (
              <div className="flex items-center gap-2.5 bg-[#E8F6F0] dark:bg-emerald-950/50 border border-[#BFE8D5] dark:border-emerald-800 rounded-[16px] p-3 text-[#047857] dark:text-emerald-300 text-[12.5px] font-bold leading-snug">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Ödev teslim edildi ve puanlandırıldı ({currentSubmissions[selectedStudent.id]?.score} Puan).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-[#FDEBEB] dark:bg-rose-950/50 border border-[#F8CACA] dark:border-rose-900 rounded-[16px] p-3 text-[#B91C1C] dark:text-rose-300 text-[12.5px] font-bold leading-snug">
                <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Ödev Henüz Teslim Edilmedi — Son teslim tarihi: {currentHomework.dueDate}</span>
              </div>
            )}
          </motion.section>
        </div>

        {/* SAĞ SÜTUN (7/12): ÖĞRENCİ YANITI, AKILLI TAHTA ÇÖZÜMÜ & DEĞERLENDİRME */}
        <div className="lg:col-span-7 space-y-4">
          {/* ── 5. SECTION: ÖĞRENCİ YANITI & ÇÖZÜM ── */}
          <section className="bg-white dark:bg-[#111624] border border-[#E7EBF2] dark:border-white/10 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-wider text-[#0F172A] dark:text-white">
                <FileText size={18} className="text-[#4338CA] dark:text-indigo-400" />
                <span>ÖĞRENCİ YANITI & ÇÖZÜM</span>
              </div>

              <span className="h-[26px] inline-flex items-center px-2.5 rounded-[13px] bg-[#ECEBFD] dark:bg-indigo-950/60 text-[#3730A3] dark:text-indigo-300 text-[10px] font-extrabold whitespace-nowrap">
                Kategori: {currentHomework.category}
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-[#FDF6E3] dark:bg-amber-950/40 border border-[#F5D9A8] dark:border-amber-800/80 rounded-[16px] p-3 text-[#92400E] dark:text-amber-300 text-[12.5px] font-bold">
              <Volume2 size={18} className="shrink-0" />
              <span>Öğrenci ses kaydı iletmedi.</span>
            </div>

            <div className="bg-[#F6F8FC] dark:bg-[#161c2d] border border-[#E1E6EE] dark:border-white/5 rounded-[16px] p-3.5 text-[#5B6577] dark:text-gray-400 text-[13px] italic leading-relaxed">
              Öğrenci henüz sisteme bir yanıt veya açıklama notu iletmedi.
            </div>

            {/* Whiteboard solution button — opens specific board in new tab */}
            {currentHomework.board_uuid ? (
              <a
                href={`/board/${currentHomework.board_uuid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-[14px] bg-[#EEF0FF] dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[#4338CA] dark:text-indigo-300 text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-xs cursor-pointer active:scale-98"
              >
                <ExternalLink size={15} />
                <span>Akıllı Tahta Çözümünü & Çizimini İncele (Yeni Sekme)</span>
              </a>
            ) : currentHomework.tool_type === 'WHITEBOARD' || currentHomework.category === 'WHITEBOARD' ? (
              <a
                href="/board/board_6be7ebed-4c00-4243-9a9b-ffef9933803b"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-[14px] bg-[#EEF0FF] dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[#4338CA] dark:text-indigo-300 text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-xs cursor-pointer active:scale-98"
              >
                <ExternalLink size={15} />
                <span>Akıllı Tahta Çözümünü & Çizimini İncele (Yeni Sekme)</span>
              </a>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-[#F8FAFC] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[14px] p-2.5 text-center text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  Bu ödev okuma / çalışma yaprağı etkinliği olarak tanımlanmıştır.
                </div>
                <a
                  href="/board/board_6be7ebed-4c00-4243-9a9b-ffef9933803b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-[12px] bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-gray-200 dark:border-white/10 cursor-pointer active:scale-98"
                >
                  <ExternalLink size={13} />
                  <span>Akıllı Tahta Çizim Tuvalini Aç (Yeni Sekme)</span>
                </a>
              </div>
            )}
          </section>

          {/* ── 6. SECTION: DEĞERLENDİRME & PUANLAMA ── */}
          <section className="bg-[#F6F7FF] dark:bg-[#13192b] border border-[#E3E7FA] dark:border-indigo-950/80 rounded-[22px] p-4 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-extrabold tracking-wider text-gray-900 dark:text-white">
                <GraduationCap size={20} className="text-[#4338CA] dark:text-indigo-400" />
                <span>DEĞERLENDİRME & PUANLAMA</span>
              </div>
            </div>

            <span className="self-start h-[28px] inline-flex items-center px-3 rounded-[14px] bg-[#FDF6E3] dark:bg-amber-950/60 border border-[#F5D9A8] dark:border-amber-800 text-[#92400E] dark:text-amber-300 text-[11px] font-bold">
              Sınıf içi / Fiziksel Teslim Notlandırma
            </span>

            {/* Quick Score Selection */}
            <div>
              <div className="text-[11px] font-extrabold tracking-wider text-[#5B6577] dark:text-gray-400 mb-2">
                HIZLI PUAN SEÇİMİ
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCORES.map((score) => {
                  const isScoreActive = currentScore === score
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setCurrentScore(score)}
                      className={`h-[38px] px-3.5 rounded-[13px] text-[12.5px] font-extrabold transition-all cursor-pointer ${
                        isScoreActive
                          ? 'bg-[#4338CA] text-white shadow-md shadow-[#4338CA]/25 scale-102'
                          : 'border border-[#D9DEFB] dark:border-white/10 bg-white dark:bg-[#1c2438] text-[#4338CA] dark:text-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      {score} Puan
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Score Input */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Verilen Puan (Max: 100) *
              </label>
              <div className="h-[52px] px-4 rounded-[16px] bg-white dark:bg-[#1c2438] border border-[#D9DEFB] dark:border-white/10 flex items-center justify-between shadow-xs">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={currentScore}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0 && val <= 100) setCurrentScore(val)
                  }}
                  className="text-[20px] font-extrabold text-[#4338CA] dark:text-indigo-400 bg-transparent border-0 outline-hidden w-24"
                />
                <span className="text-[14px] font-semibold text-[#5B6577] dark:text-gray-400">
                  / 100
                </span>
              </div>
            </div>

            {/* Teacher Feedback Note */}
            <div>
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
                Öğretmen Geri Bildirim Notu
              </label>
              <textarea
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                placeholder="Öğrenciye çözümüne dair yönlendirici geri bildirim yazın..."
                className="w-full h-[90px] p-3 rounded-[16px] bg-white dark:bg-[#1c2438] border border-[#D9DEFB] dark:border-white/10 text-[13px] text-[#0F172A] dark:text-white placeholder-gray-400 resize-none outline-hidden focus:border-[#4338CA]"
              />
            </div>

            {/* Ready-made templates */}
            <div>
              <div className="text-[12px] font-bold text-[#5B6577] dark:text-gray-400 mb-2">
                Hazır Şablonlar:
              </div>
              <div className="flex flex-col gap-2">
                {DEFAULT_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentFeedback(tpl)}
                    className="w-full text-left h-[34px] px-3 rounded-[12px] bg-white dark:bg-[#1c2438] border border-[#E1E6EE] dark:border-white/10 text-[11.5px] font-semibold text-[#334155] dark:text-gray-300 truncate hover:border-[#4338CA] dark:hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSaveEvaluation}
              className="mt-1 h-[52px] rounded-[16px] text-white text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-black/20 cursor-pointer transition-all border border-white/10"
              style={{
                background: 'linear-gradient(135deg, #0A0D15, #1E293B)',
              }}
            >
              <Save size={18} className="text-[#34D399]" />
              <span>Puanı ve Geri Bildirimi Kaydet</span>
            </motion.button>
          </section>
        </div>
      </div>
    </main>
      </>
    )}
  </motion.div>

        {/* ── 8. MODAL: ÖDEV SEÇİMİ VE TARİHSEL FİLTRELEME (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isHomeworkModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHomeworkModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />

              {/* Responsive Web / Mobile Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[440px] sm:max-w-xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden pb-8 sm:pb-6"
              >
                {/* Drag Handle (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 shrink-0 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                      <BookOpenCheck size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Sınıf Ödevleri Seçimi
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        {selectedBranch} için verilen tüm ödevler arasından seçim yapın.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* ── YENİ ÖDEV OLUŞTUR BUTONU ── */}
                <div className="mb-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeworkModalOpen(false)
                      setIsCreateModalOpen(true)
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>+ Yeni Ödev Oluştur (9/A Şubesi)</span>
                  </button>
                </div>

                {/* ── TARİHSEL FİLTRELEME SEKMELERİ (shrink-0, no collision) ── */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 shrink-0 mb-3">
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('all')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'all'
                        ? 'bg-[#0A0D15] dark:bg-white text-white dark:text-[#0A0D15]'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Tümü ({homeworkMetrics.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('this_week')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'this_week'
                        ? 'bg-[#4338CA] text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4338CA] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    Bu Hafta ({homeworkMetrics.this_week})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('past')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'past'
                        ? 'bg-[#B45309] text-white shadow-xs'
                        : 'bg-[#FDF0DC] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-[#F5D9A8] dark:border-amber-800'
                    }`}
                  >
                    Geçmiş Haftalar ({homeworkMetrics.past})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkDateFilter('upcoming')}
                    className={`h-[38px] px-3.5 rounded-[12px] text-[12px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      homeworkDateFilter === 'upcoming'
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'bg-[#E8F6F0] dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-[#BFE8D5] dark:border-emerald-800'
                    }`}
                  >
                    Gelecek ({homeworkMetrics.upcoming})
                  </button>
                </div>

                {/* ── ARAMA VE SIRALAMA ÇUBUĞU (shrink-0) ── */}
                <div className="flex items-center gap-2 shrink-0 mb-3">
                  <div className="flex-1 flex items-center gap-2.5 h-[44px] px-3.5 rounded-[14px] border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#182033]">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="search"
                      value={homeworkSearch}
                      onChange={(e) => setHomeworkSearch(e.target.value)}
                      placeholder="Ödev adı veya ders ara..."
                      className="flex-1 bg-transparent border-0 outline-hidden text-[12.5px] text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    {homeworkSearch && (
                      <button
                        type="button"
                        onClick={() => setHomeworkSearch('')}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Sıralama Seçici */}
                  <div className="relative shrink-0">
                    <select
                      value={homeworkSortBy}
                      onChange={(e) => setHomeworkSortBy(e.target.value as any)}
                      className="h-[44px] pl-2.5 pr-6 rounded-[14px] border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#182033] text-[11.5px] font-bold text-gray-700 dark:text-gray-300 outline-hidden cursor-pointer appearance-none"
                    >
                      <option value="newest">En Yeni Tarih</option>
                      <option value="due">Son Teslim</option>
                      <option value="subject">Ders Adı</option>
                    </select>
                    <ArrowUpDown size={12} className="absolute right-2 top-4 pointer-events-none text-gray-400" />
                  </div>
                </div>

                {/* ── ÖDEVLER LİSTESİ (Scrollable cleanly) ── */}
                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2.5 pr-0.5">
                  {classHomeworks.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                      Seçilen kriterlere uygun ödev bulunamadı.
                    </div>
                  ) : (
                    classHomeworks.map((hw) => {
                      const isSelected = hw.id === currentHomework?.id
                      const subCount = Object.keys(allSubmissions[hw.id] || {}).length

                      // Tag Colors
                      const tagClass =
                        hw.subject === 'Türkçe'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                          : hw.subject === 'Matematik'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                          : hw.subject === 'Hayat Bilgisi'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-900'

                      return (
                        <div
                          key={hw.id}
                          onClick={() => handleSelectHomework(hw)}
                          className={`p-3.5 rounded-[18px] flex flex-col gap-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[1.5px] border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs'
                              : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161c2d] hover:border-gray-300'
                          }`}
                        >
                          {/* Top Row: Subject Pill + Period Pill + Check icon */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`h-[22px] inline-flex items-center px-2 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${tagClass}`}
                              >
                                {hw.subject}
                              </span>

                              {hw.target_type === 'INDIVIDUAL' ? (
                                <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                  <User size={10} />
                                  <span>Bireysel: {hw.target_student_name || 'Öğrenci'}</span>
                                </span>
                              ) : (
                                <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                  <Clock size={10} />
                                  <span>{hw.periodLabel}</span>
                                </span>
                              )}
                            </div>

                            {isSelected ? (
                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-emerald-500 text-white text-[10.5px] font-extrabold shadow-xs">
                                <Check size={11} strokeWidth={2.5} />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400">
                                {subCount > 0 ? `${subCount} Teslim` : '0 Teslim'}
                              </span>
                            )}
                          </div>

                          {/* Homework Title */}
                          <div>
                            <h4 className="text-[13.5px] font-extrabold text-gray-900 dark:text-white leading-snug m-0">
                              {hw.title}
                            </h4>
                            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1 m-0 line-clamp-2">
                              {hw.description}
                            </p>
                          </div>

                          {/* Bottom Row: Dates */}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5 text-[10.5px] text-gray-500 dark:text-gray-400 font-semibold">
                            <span>Veriliş: {hw.assignedDate}</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                              Son Teslim: {hw.dueDate}
                            </span>
                          </div>

                          {/* Action & Permission Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 mt-0.5 gap-2 flex-wrap">
                            {/* Yetki Durumu Rozeti */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="h-[22px] inline-flex items-center gap-1 px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                <ShieldCheck size={11} className="text-emerald-500" />
                                <span>
                                  {hw.target_type === 'INDIVIDUAL'
                                    ? `Özel: ${hw.target_student_name || 'Öğrenci'}`
                                    : 'Tüm Sınıf Yetkili'}
                                </span>
                              </span>
                              {hw.permissions?.allowLateSubmission && (
                                <span className="h-[22px] inline-flex items-center px-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9.5px] font-bold">
                                  Geç Teslim İzinli
                                </span>
                              )}
                            </div>

                            {/* Butonlar: Düzenle, Yetkiler, Sil */}
                            <div className="flex items-center gap-1 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleOpenPermissionModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödev Yetkilendirme & Erişim Ayarları"
                              >
                                <ShieldCheck size={12} strokeWidth={2.2} />
                                <span>Yetkiler</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-gray-100 dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödevi Düzenle"
                              >
                                <Pencil size={12} strokeWidth={2.2} />
                                <span>Düzenle</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(hw)}
                                className="h-[27px] px-2 rounded-[9px] bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Ödevi Sil"
                              >
                                <Trash2 size={12} strokeWidth={2.2} />
                                <span>Sil</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL: ÖDEV DÜZENLEME ── */}
        <AnimatePresence>
          {isEditModalOpen && editingHomework && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-2xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Pencil size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Ödevi Düzenle
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        {editingHomework.className} • Bilgileri güncelleyin
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSaveEditHomework} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Ödev Başlığı
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      placeholder="Ödev başlığı..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Ders / Branş
                      </label>
                      <select
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full h-11 px-3 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      >
                        <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                        <option value="Türkçe">Türkçe</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fen Bilimleri">Fen Bilimleri</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Hayat Bilgisi">Hayat Bilgisi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Ödev Formatı / Araç
                      </label>
                      <select
                        value={editToolType}
                        onChange={(e) => setEditToolType(e.target.value as any)}
                        className="w-full h-11 px-3 text-xs font-semibold bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      >
                        <option value="WORKSHEET">Çalışma Kâğıdı / Metin</option>
                        <option value="QUIZ">Çoktan Seçmeli Quiz</option>
                        <option value="WHITEBOARD">Akıllı Tahta / Çizim</option>
                        <option value="READING">Okuma & Tahlil</option>
                        <option value="PROJECT">Dönem Projesi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Ödev Açıklaması & Kazanım Yönergeleri
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white leading-relaxed"
                      placeholder="Öğrencinin yapması gerekenler..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Son Teslim Tarihi ve Saati
                      </label>
                      <input
                        type="datetime-local"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Maksimum Puan
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={editMaxScore}
                        onChange={(e) => setEditMaxScore(Number(e.target.value))}
                        className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Hedef Kitle Seçimi */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                      Hedef Kitle
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTargetType('CLASS')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          editTargetType === 'CLASS'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-600'
                        }`}
                      >
                        <div>👥 Tüm Sınıf (9-A)</div>
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5">Sınıftaki herkese açık</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditTargetType('INDIVIDUAL')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          editTargetType === 'INDIVIDUAL'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-600'
                        }`}
                      >
                        <div>👤 Bireysel Öğrenci</div>
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5">Tek öğrenciye özel</div>
                      </button>
                    </div>

                    {editTargetType === 'INDIVIDUAL' && (
                      <div className="mt-2.5">
                        <select
                          value={editTargetStudentId}
                          onChange={(e) => {
                            setEditTargetStudentId(e.target.value)
                            const sObj = ALL_INITIAL_STUDENTS.find((s) => s.id === e.target.value)
                            if (sObj) setEditTargetStudentName(sObj.name)
                          }}
                          className="w-full h-11 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                        >
                          {ALL_INITIAL_STUDENTS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.studentNo || s.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs shadow-indigo-500/20"
                    >
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL: ÖDEV YETKİLENDİRME & ERİŞİM AYARLARI ── */}
        <AnimatePresence>
          {isPermissionModalOpen && permissionHomework && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPermissionModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Ödev Yetkilendirme & Erişim Ayarları
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0 line-clamp-1">
                        {permissionHomework.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermissionModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSavePermissions} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Yetki Kapsamı */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                      1. Erişim Yetkisi Kapsamı (Kimler Yetkili?)
                    </label>
                    <div className="space-y-2">
                      <div
                        onClick={() => setPermScope('CLASS')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'CLASS'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Tüm Sınıf Yetkili (9-A Şubesi)</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Şubedeki tüm öğrenciler ödevi görüntüler ve teslim eder</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'CLASS' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'}`}>
                          {permScope === 'CLASS' && <Check size={11} className="text-white" />}
                        </div>
                      </div>

                      <div
                        onClick={() => setPermScope('INDIVIDUAL')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'INDIVIDUAL'
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <User size={18} className="text-indigo-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Bireysel / Özel Yetkilendirme</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Yalnızca seçilen öğrenci için bireysel çalışma (BEP / Takviye)</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'INDIVIDUAL' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                          {permScope === 'INDIVIDUAL' && <Check size={11} className="text-white" />}
                        </div>
                      </div>

                      {permScope === 'INDIVIDUAL' && (
                        <div className="pl-4 pt-1">
                          <select
                            value={permStudentId}
                            onChange={(e) => setPermStudentId(e.target.value)}
                            className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#182033] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                          >
                            {ALL_INITIAL_STUDENTS.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.studentNo || s.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div
                        onClick={() => setPermScope('DRAFT')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-colors flex items-center justify-between ${
                          permScope === 'DRAFT'
                            ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                            : 'bg-white dark:bg-[#182033] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock size={18} className="text-amber-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">Zümre İncelemesi / Taslak Yetkisi</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrencilere kapalı, sadece öğretmen panelinde görünür</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${permScope === 'DRAFT' ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
                          {permScope === 'DRAFT' && <Check size={11} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Öğrenci Teslim & Gönderim Yetkileri */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                      2. Öğrenci Teslim & Gönderim Yetkileri
                    </label>
                    <div className="space-y-2">
                      {/* Geç Teslim İzni */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Geç Teslim İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Son teslim saatinden sonra mazeretli teslime izin ver</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowLate}
                          onChange={(e) => setPermAllowLate(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Yeniden Teslim / Düzenleme */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Yeniden Teslim & Düzeltme İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrenci teslim ettiği cevabı son tarihe kadar güncelleyebilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowResubmit}
                          onChange={(e) => setPermAllowResubmit(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Harici Dosya / PDF Yükleme */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Harici Dosya / Defter Fotoğrafı İzni</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Öğrenci cihazından PDF veya fotoğraf ekleyebilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permAllowFileUpload}
                          onChange={(e) => setPermAllowFileUpload(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>

                      {/* Veli Bildirimi */}
                      <label className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#182033] flex items-center justify-between cursor-pointer">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Veli SMS & Bildirim Entegrasyonu</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">Ödev teslim edilmediğinde veliye otomatik bildirim iletilsin</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={permParentNotification}
                          onChange={(e) => setPermParentNotification(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(false)}
                      className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs shadow-emerald-500/20"
                    >
                      Yetkileri Kaydet
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── MODAL: ÖDEV SİLME ONAYI ── */}
        <AnimatePresence>
          {isDeleteModalOpen && deletingHomework && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-3xl p-6 shadow-2xl z-10 space-y-4"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                      Ödevi Sil
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Bu işlem kalıcıdır ve geri alınamaz
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    &quot;{deletingHomework.title}&quot;
                  </div>
                  <p className="text-[11.5px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    Bu ödev ve öğrencilerin yapmış olduğu tüm teslim kayıtları sistemden kalıcı olarak silinecektir.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteHomework}
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-xs shadow-rose-500/20"
                  >
                    Evet, Kalıcı Olarak Sil
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 9. MODAL: YENİ ÖDEV TANIMLA VE YAYINLA (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreateModalOpen(false)}
                className="fixed inset-0 bg-black/65 backdrop-blur-xs"
              />

              {/* Responsive Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[480px] sm:max-w-2xl mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden pb-8 sm:pb-6"
              >
                {/* Drag Handle (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 shrink-0 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Plus size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Yeni Ödev Oluştur
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        9/A Şubesine yeni ödev ve çalışma görevi tanımlayın
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Scrollable Form */}
                <form onSubmit={handleCreateAssignment} className="flex-1 overflow-y-auto pr-0.5 space-y-4">
                  {/* Sınıf & Ders Seçimi 2 Sütun Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Sınıf & Şube Bilgisi (SADECE ŞUBE ADI, İSİM YAZMAZ) */}
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Hedef Şube</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        9/A Şubesi
                      </span>
                    </div>

                    {/* Ders Seçimi */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Ders / Zümre
                      </label>
                      <select
                        value={createSubject}
                        onChange={(e) => setCreateSubject(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Tarih">Tarih</option>
                        <option value="Fizik">Fizik</option>
                        <option value="Kimya">Kimya</option>
                        <option value="Biyoloji">Biyoloji</option>
                        <option value="İngilizce">İngilizce</option>
                        <option value="Coğrafya">Coğrafya</option>
                        <option value="Felsefe">Felsefe</option>
                        <option value="Bilişim & Kodlama">Bilişim & Kodlama</option>
                      </select>
                    </div>
                  </div>

                  {/* ── ATAMA KAPSAMI: TÜM SINIF VEYA BİREYSEL ÖĞRENCİ ── */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Atama Kapsamı
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCreateTargetType('CLASS')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          createTargetType === 'CLASS'
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            createTargetType === 'CLASS'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <Users size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs block leading-tight truncate">Tüm Sınıfa Ata</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate">9/A Şubesi genelinde</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreateTargetType('INDIVIDUAL')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          createTargetType === 'INDIVIDUAL'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            createTargetType === 'INDIVIDUAL'
                              ? 'bg-emerald-500 text-[#0A0D15]'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs block leading-tight truncate">Bireysel Öğrenci</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate">Özel seçilen öğrenciye</span>
                        </div>
                      </button>
                    </div>

                    {/* Bireysel Öğrenci Seçici (Eğer Bireysel seçildiyse) */}
                    {createTargetType === 'INDIVIDUAL' && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-1.5 mt-2">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Ödevin Atanacağı Öğrenci</span>
                        </label>
                        <select
                          value={createTargetStudentId}
                          onChange={(e) => setCreateTargetStudentId(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          {ALL_INITIAL_STUDENTS.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} (No: {st.studentNo}) — 9/A Şubesi
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* ── ÖDEV BAŞLIĞI (ZORUNLU VE BELİRGİN ALAN) ── */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>Ödev Başlığı</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">* Zorunlu</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder="Örn: Tanzimat Dönemi Şiir İncelemesi & Karşılaştırmalı Kompozisyon"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Ödev Türü (4 Cards) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Çalışma Türü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'WORKSHEET', label: 'Çalışma Kâğıdı', icon: FileText, desc: 'Metin, föy & döküman' },
                        { id: 'WHITEBOARD', label: 'Akıllı Tahta', icon: PenTool, desc: 'Çizim & interaktif tuval' },
                        { id: 'READING', label: 'Okuma & Tahlil', icon: BookOpen, desc: 'Metin incelemesi & analiz' },
                        { id: 'QUIZ', label: 'Test & Quiz', icon: HelpCircle, desc: 'Çoktan seçmeli sorular' },
                      ].map((type) => {
                        const Icon = type.icon
                        const isSelected = createToolType === type.id
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setCreateToolType(type.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                                : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <Icon size={14} className={isSelected ? 'text-emerald-600' : 'text-gray-400'} />
                              <span>{type.label}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{type.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── ÖDEV ÇALIŞMA TÜRÜNE GÖRE DİNAMİK YÜKLEME VE DETAY ALANLARI ── */}
                  {createToolType === 'WORKSHEET' && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <FileText size={15} className="text-indigo-600 dark:text-indigo-400" />
                          <span>Çalışma Kâğıdı / Döküman Yükleme</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          PDF / Word / Görsel
                        </span>
                      </div>

                      {/* Dosya Yükleme Dropzone */}
                      <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-xl p-3.5 text-center bg-white/70 dark:bg-gray-900/50 hover:bg-white transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setCreateWorksheetFileName(file.name)
                              toast.success(`"${file.name}" çalışma kâğıdı olarak eklendi!`)
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {createWorksheetFileName ? (
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck size={18} className="text-emerald-600 shrink-0" />
                              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {createWorksheetFileName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCreateWorksheetFileName('')
                              }}
                              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50"
                            >
                              Kaldır
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <Upload size={20} className="text-indigo-600 dark:text-indigo-400 mb-0.5" />
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              Çalışma Belgesi Yüklemek İçin Tıklayın
                            </span>
                            <span className="text-[10px] text-gray-400">
                              veya sürükleyip buraya bırakın (PDF, Word, PNG)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hazır Hızlı Şablonlar */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Örnek Şablonlar:</span>
                        {['Tanzimat_Siir_Tahlili.pdf', 'Paragraf_Analiz_Foyu.pdf'].map((tpl) => (
                          <button
                            key={tpl}
                            type="button"
                            onClick={() => {
                              setCreateWorksheetFileName(tpl)
                              toast.success(`"${tpl}" şablonu seçildi!`)
                            }}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 cursor-pointer"
                          >
                            + {tpl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {createToolType === 'WHITEBOARD' && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                          <PenTool size={15} className="text-teal-600 dark:text-teal-400" />
                          <span>Akıllı Tahta Tuvali & Çizim Alanı</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                          İnteraktif Çözüm
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Tuval Şablonu
                          </label>
                          <select
                            value={createWhiteboardCanvasType}
                            onChange={(e) => setCreateWhiteboardCanvasType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          >
                            <option value="İnteraktif Çizim Tuvali">İnteraktif Çizim Tuvali</option>
                            <option value="Kavram Haritası Şeması">Kavram Haritası Şeması</option>
                            <option value="Kareli Problem Çözüm Izgarası">Kareli Problem Çözüm Izgarası</option>
                            <option value="Çizgili Not ve Kompozisyon">Çizgili Not ve Kompozisyon</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Tahta Çizim Konusu
                          </label>
                          <input
                            type="text"
                            value={createWhiteboardTopic}
                            onChange={(e) => setCreateWhiteboardTopic(e.target.value)}
                            placeholder="Örn: Edebi Sanatlar Zihin Haritası"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed bg-white/70 dark:bg-gray-900/40 p-2.5 rounded-xl border border-teal-200/50 dark:border-teal-800/40">
                        💡 <strong>Öğrenci Deneyimi:</strong> Öğrenci bu ödevi açtığında doğrudan akıllı tahta çizim tuvali açılarak kalem, şekiller ve metin araçlarıyla çözümünü yapabilecektir.
                      </p>
                    </div>
                  )}

                  {createToolType === 'READING' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <BookOpen size={15} className="text-amber-600 dark:text-amber-400" />
                          <span>Okuma & Metin Tahlili Detayları</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          Edebiyat / Tahlil
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Okunacak Kitap / Eser Adı
                          </label>
                          <input
                            type="text"
                            value={createReadingBook}
                            onChange={(e) => setCreateReadingBook(e.target.value)}
                            placeholder="Örn: Dede Korkut Hikâyeleri"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Sayfa / Bölüm Aralığı
                          </label>
                          <input
                            type="text"
                            value={createReadingPages}
                            onChange={(e) => setCreateReadingPages(e.target.value)}
                            placeholder="Örn: Sayfa 25 - 60 (Boğaç Han)"
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Tahlil ve Odak Soruları
                        </label>
                        <input
                          type="text"
                          value={createReadingQuestions}
                          onChange={(e) => setCreateReadingQuestions(e.target.value)}
                          placeholder="Örn: Ana çatışma, karakter motivasyonları ve kültürel motifler"
                          className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {createToolType === 'QUIZ' && (
                    <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                          <HelpCircle size={15} className="text-sky-600 dark:text-sky-400" />
                          <span>Test & Quiz Parametreleri</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                          Çoktan Seçmeli
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Soru Sayısı
                          </label>
                          <select
                            value={createQuizQuestionCount}
                            onChange={(e) => setCreateQuizQuestionCount(Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white"
                          >
                            <option value={5}>5 Soru (Hızlı Tarama)</option>
                            <option value={10}>10 Soru (Kazanım Testi)</option>
                            <option value={15}>15 Soru (Ünite Değerlendirme)</option>
                            <option value={20}>20 Soru (Genel Deneme)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            Zorluk Seviyesi
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['Kolay', 'Orta', 'İleri'] as const).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setCreateQuizDifficulty(lvl)}
                                className={`h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                  createQuizDifficulty === lvl
                                    ? 'bg-sky-500 text-white shadow-xs'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Son Teslim Tarihi & Puan */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Son Teslim Tarihi
                      </label>
                      <input
                        type="datetime-local"
                        value={createDueDate}
                        onChange={(e) => setCreateDueDate(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Maksimum Puan
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={createMaxScore}
                        onChange={(e) => setCreateMaxScore(Number(e.target.value))}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Açıklama & Yönergeler */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ödev Açıklaması ve Öğrenci Yönergeleri
                    </label>
                    <textarea
                      rows={3}
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                      placeholder="Ödevin nasıl çözüleceği ve beklentiler hakkında notlar..."
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      <span>
                        {createTargetType === 'INDIVIDUAL'
                          ? `Ödevi Oluştur ve ${
                              ALL_INITIAL_STUDENTS.find((s) => s.id === createTargetStudentId)?.name || 'Öğrenciye'
                            }'ya Ata`
                          : 'Ödevi Oluştur ve 9/A Şubesine Ata'}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 10. MODAL: SINIFSAL KATEGORİLER & ŞUBELER (WEB VE MOBİL UYUMLU) ── */}
        <AnimatePresence>
          {isBranchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBranchModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Responsive Modal Dialog */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-[440px] sm:max-w-md mx-auto bg-white dark:bg-[#111624] text-[#0F172A] dark:text-white rounded-t-[30px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl z-10 flex flex-col gap-3.5 pb-8 sm:pb-6 max-h-[85vh] overflow-y-auto"
              >
                {/* Drag Handle Pill (Mobile Only) */}
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1 sm:hidden" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-white/10 text-[#34D399] flex items-center justify-center shrink-0">
                      <Users size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-tight m-0">
                        Sınıfsal Kategoriler & Şubeler
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                        Ödevleri filtrelemek veya incelemek istediğiniz sınıf / şubeyi seçin.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black shrink-0 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2.5 h-[48px] px-3.5 rounded-[16px] border border-emerald-400 dark:border-emerald-600/60 bg-emerald-50/20 dark:bg-emerald-950/20 mt-1">
                  <Search size={18} className="text-gray-500 dark:text-gray-400 shrink-0" />
                  <input
                    type="search"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    placeholder="Şube veya sınıf adı ara..."
                    className="flex-1 bg-transparent border-0 outline-hidden text-[13px] text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  {branchSearch && (
                    <button
                      type="button"
                      onClick={() => setBranchSearch('')}
                      className="text-gray-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Options List */}
                <div className="flex flex-col gap-2.5 mt-1">
                  {filteredBranches.map((branch) => {
                    const isSelected =
                      branch.isAll
                        ? selectedBranch === 'Tüm Şubeler'
                        : selectedBranch === branch.title

                    return (
                      <div
                        key={branch.id}
                        onClick={() => {
                          const newBranch = branch.isAll ? 'Tüm Şubeler' : branch.title
                          setSelectedBranch(newBranch)
                          setIsBranchModalOpen(false)

                          // If the currently selected homework doesn't belong to the newly selected branch, pick the first one from that branch
                          if (newBranch !== 'Tüm Şubeler') {
                            const firstMatch = INITIAL_HOMEWORKS.find((hw) => hw.className === newBranch)
                            if (firstMatch && firstMatch.id !== selectedHomeworkId) {
                              setSelectedHomeworkId(firstMatch.id)
                            }
                          }
                          toast.success(`${branch.title} seçildi`)
                        }}
                        className={`p-3.5 rounded-[18px] flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[1.5px] border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                            : 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161c2d] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {branch.isAll ? (
                            <div className="w-10 h-10 rounded-[14px] bg-[#0A0D15] dark:bg-black text-[#34D399] flex items-center justify-center shrink-0">
                              <Layers size={19} strokeWidth={2.2} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-[14px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                              <Users size={19} strokeWidth={2} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="block text-[14px] font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                              {branch.title}
                            </span>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {branch.desc}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={20} strokeWidth={2.4} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── 10. MODAL: QR TAHTAYA BAĞLAN ── */}
        <ConnectBoardModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          theme={theme}
        />
    </div>
  )

  if (hideHeader) {
    return pageContent
  }

  return (
    <div className={`${theme} min-h-[100dvh] w-full bg-[#0A0D15] sm:bg-[#E2E8F0] sm:dark:bg-[#06090F] flex justify-center selection:bg-[#34D399]/30 selection:text-emerald-950 transition-colors duration-300 font-jakarta overscroll-none`}>
      <div className="w-full sm:max-w-[390px] min-h-[100dvh] bg-[#F8FAFC] dark:bg-[#0A0D15] sm:shadow-2xl relative flex flex-col pb-24 sm:border-x border-gray-200/60 dark:border-gray-800/80 overflow-x-hidden overscroll-y-none">
        <MobileHeader theme={theme} onToggleTheme={toggleTheme} />
        {pageContent}
        {!hideDock && <MobileFloatingDock activeTab="assignments" />}
      </div>
    </div>
  )
}
