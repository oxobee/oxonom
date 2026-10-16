import {
  CUSTOM_ASSIGNMENTS_STORAGE_KEY,
  getStoredCustomAssignments,
  getDeletedHomeworkIds,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
  type QuizQuestion,
} from '@services/school_assignments/school_assignments'
import {
  DAYS_LIST,
  PRIMARY_PERIODS,
  MIDDLE_PERIODS,
  INITIAL_SCHEDULE_ENTRIES,
  type ScheduleEntry,
} from '@components/Mobile/Admin/MAdminScheduleClient'
import {
  ALL_INITIAL_STUDENTS,
  type MStudentItem,
  type MStudentCourseGrade,
} from '@components/Mobile/MStudentClient'
import { CANONICAL_SCHOOL_EXAMS, getStoredSchoolExams } from '@/lib/teacher/teacherAgendaStorage'
import { getStudentAttendanceSummary } from '@services/demo/attendanceService'

export interface GuidanceNoteItem {
  id: string
  date: string
  author: string
  content: string
}

export interface StudentProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  studentNo: string
  tcNo: string
  gender: string
  birthDate: string
  bloodType: string
  enrollmentDate: string
  className: string
  gradeLevel: string
  mentorTeacher: string
  schoolName: string
  gpa: number
  classRank: number
  attendanceRate: number
  absentDays: number
  absentExcusedDays?: number
  absentUnexcusedDays?: number
  parentName: string
  parentPhone: string
  parentRelation: string
  secondParentName: string
  secondParentPhone: string
  secondParentRelation: string
  emergencyPhone: string
  address: string
  disciplineStatus: string
  specialHealthNote?: string
  notes?: string
  guidanceNotes?: GuidanceNoteItem[]
  grades?: MStudentCourseGrade[]
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 's-1',
  name: 'Erçil UĞURLU',
  firstName: 'Erçil',
  lastName: 'UĞURLU',
  email: 'ogrenci@oxonom.com',
  studentNo: '101',
  tcNo: '10000000146',
  gender: 'Erkek',
  birthDate: '15.06.2010 (16 Yaşında)',
  bloodType: 'A Rh+',
  enrollmentDate: '01.09.2024',
  className: '9-A',
  gradeLevel: '9. Sınıf',
  mentorTeacher: 'Ebru TEKNECİ (Türk Dili ve Edebiyatı)',
  schoolName: 'Oxonom Okulları',
  gpa: 0,
  classRank: 1,
  attendanceRate: 100,
  absentDays: 0,
  absentExcusedDays: 0,
  absentUnexcusedDays: 0,
  parentName: 'Ebru UĞURLU',
  parentPhone: '+90 532 999 1100',
  parentRelation: 'Anne (Mimar)',
  secondParentName: 'Dr. Uğur UĞURLU',
  secondParentPhone: '+90 532 999 2200',
  secondParentRelation: 'Baba (Kurum Müdürü)',
  emergencyPhone: '+90 532 999 2200',
  address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
  disciplineStatus: 'Temiz Sicil — Örnek Öğrenci',
}

export interface StudentCourse {
  id: string
  code: string
  name: string
  teacherName: string
  teacherBranch: string
  weeklyHours: number
  classroom: string
  roomType: string
  color: string
  gradient: string
  description: string
  topics: Array<{ id: string; title: string; completed: boolean; week: number }>
  materials: Array<{ id: string; title: string; type: 'pdf' | 'doc' | 'video'; size: string }>
}

export const STUDENT_COURSES: StudentCourse[] = [
  {
    id: 'turk-dili-ve-edebiyati',
    code: 'EDB-101',
    name: 'Türk Dili ve Edebiyatı',
    teacherName: 'Ebru TEKNECİ',
    teacherBranch: 'Türk Dili ve Edebiyatı',
    weeklyHours: 5,
    classroom: '9-A',
    roomType: 'Derslik 101',
    color: 'indigo',
    gradient: 'from-indigo-600 to-blue-700',
    description: 'Şiir tahlili, divan ve halk edebiyatı gelenekleri, edebi sanatlar ve anlatım bozuklukları.',
    topics: [
      { id: 't1', title: 'Edebiyatın Güzel Sanatlarla İlişkisi', completed: true, week: 1 },
      { id: 't2', title: 'Metinlerin Sınıflandırılması ve Anlatım Türleri', completed: true, week: 2 },
      { id: 't3', title: 'Şiir Bilgisi: Nazım Birimi, Ölçü ve Kafiye Düzenleri', completed: true, week: 3 },
      { id: 't4', title: 'Edebi Sanatlar (Teşbih, İstiare, Mecaz-ı Mürsel)', completed: false, week: 4 },
      { id: 't5', title: 'Tanzimat Dönemi Türk Edebiyatı ve Gazete Kültürü', completed: false, week: 5 },
    ],
    materials: [
      { id: 'm1', title: 'Şiir Bilgisi ve Edebi Sanatlar Özeti (PDF)', type: 'pdf', size: '2.4 MB' },
      { id: 'm2', title: '9-A Şiir Tahlil Çalışma Kağıdı', type: 'doc', size: '1.1 MB' },
      { id: 'm3', title: 'Divan Edebiyatı Nazım Şekilleri Video Dersi', type: 'video', size: '42 MB' },
    ],
  },
  {
    id: 'matematik',
    code: 'MAT-101',
    name: 'Matematik',
    teacherName: 'Ebru TEKNECİ',
    teacherBranch: 'Matematik',
    weeklyHours: 6,
    classroom: '9-A',
    roomType: 'Derslik 101',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-700',
    description: 'Kümeler, denklem ve eşitsizlik sistemleri, fonksiyon kavramı ve temel geometri.',
    topics: [
      { id: 't1', title: 'Mantık ve Önermeler', completed: true, week: 1 },
      { id: 't2', title: 'Kümelerde İşlemler ve Kartezyen Çarpım', completed: true, week: 2 },
      { id: 't3', title: 'Gerçek Sayılar ve Aralık Kavramı', completed: true, week: 3 },
      { id: 't4', title: 'Birinci Dereceden Denklem ve Eşitsizlikler', completed: true, week: 4 },
      { id: 't5', title: 'Üslü ve Köklü İfadeler ile Modelleme', completed: false, week: 5 },
    ],
    materials: [
      { id: 'm1', title: 'Denklem ve Eşitsizlikler Çalışma Föyü (PDF)', type: 'pdf', size: '3.8 MB' },
      { id: 'm2', title: 'Kümeler Soru Bankası Çözümleri', type: 'pdf', size: '4.5 MB' },
    ],
  },
  {
    id: 'fizik',
    code: 'FIZ-101',
    name: 'Fizik',
    teacherName: 'Fen Bilgisi Zümresi',
    teacherBranch: 'Fizik',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Fen Laboratuvarı',
    color: 'cyan',
    gradient: 'from-cyan-600 to-blue-700',
    description: 'Fizik bilimine giriş, madde ve özellikleri, özkütle, hareket ve kuvvet kanunları.',
    topics: [
      { id: 't1', title: 'Fiziksel Niceliklerin Sınıflandırılması', completed: true, week: 1 },
      { id: 't2', title: 'Madde ve Özkütle Deneyleri', completed: true, week: 2 },
      { id: 't3', title: 'Düzgün Doğrusal Hareket ve Grafikler', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: 'Laboratuvar Güvenlik Kuralları ve Deney Raporu', type: 'pdf', size: '1.6 MB' },
    ],
  },
  {
    id: 'bilisim-ve-kodlama',
    code: 'BIL-101',
    name: 'Bilişim & Kodlama',
    teacherName: 'Ebru TEKNECİ',
    teacherBranch: 'Bilişim Teknolojileri',
    weeklyHours: 2,
    classroom: '9-A',
    roomType: 'Bilişim Atölyesi',
    color: 'violet',
    gradient: 'from-violet-600 to-purple-800',
    description: 'Algoritma tasarımı, akış şemaları, Python ile temel programlama ve akıllı tahta uygulamaları.',
    topics: [
      { id: 't1', title: 'Algoritma Mantığı ve Problem Çözme Adımları', completed: true, week: 1 },
      { id: 't2', title: 'Python Değişkenler, Veri Tipleri ve print()', completed: true, week: 2 },
      { id: 't3', title: 'Koşullu İfadeler (if-elif-else)', completed: true, week: 3 },
      { id: 't4', title: 'Döngüler (for & while) ve Listeler', completed: false, week: 4 },
    ],
    materials: [
      { id: 'm1', title: 'Python Temelleri Başlangıç Kılavuzu', type: 'pdf', size: '5.2 MB' },
      { id: 'm2', title: 'Akıllı Tahta Kodlama Örnekleri', type: 'doc', size: '890 KB' },
    ],
  },
  {
    id: 'yabanci-dil',
    code: 'ING-101',
    name: 'Yabancı Dil (İngilizce)',
    teacherName: 'Yabancı Dil Zümresi',
    teacherBranch: 'İngilizce',
    weeklyHours: 4,
    classroom: '9-A',
    roomType: 'Derslik 101',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Academic reading, speaking club debates, grammar in context and writing essays.',
    topics: [
      { id: 't1', title: 'Studying Abroad & Daily Routines', completed: true, week: 1 },
      { id: 't2', title: 'Past Habits & Narrative Tenses', completed: true, week: 2 },
      { id: 't3', title: 'Technology and Environment Debates', completed: false, week: 3 },
    ],
    materials: [
      { id: 'm1', title: 'Academic Vocabulary List (B2-C1)', type: 'pdf', size: '2.1 MB' },
    ],
  },
]

export interface StudentAssessment {
  id: string
  title: string
  courseName: string
  type: 'exam' | 'quiz' | 'performance' | 'oral' | 'mock' | 'common' | string
  examTypeLabel?: string
  date: string
  time: string
  durationMinutes: number
  location: string
  maxScore: number
  score?: number
  isGraded: boolean
  isPublished: boolean
  teacherFeedback?: string
  status: 'upcoming' | 'completed' | 'in_progress'
  scope?: string
  teacherName?: string
  period?: number
  className?: string
}

export const STUDENT_ASSESSMENTS: StudentAssessment[] = [
  {
    id: 'as-1',
    title: '1. Dönem 1. Yazılı Sınavı',
    courseName: 'Türk Dili ve Edebiyatı',
    type: 'exam',
    date: '12 Ekim 2026',
    time: '09:25',
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-2',
    title: '1. Dönem 2. Yazılı Sınavı',
    courseName: 'Türk Dili ve Edebiyatı',
    type: 'exam',
    date: '28 Kasım 2026',
    time: '10:20',
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-3',
    title: '1. Dönem 1. Yazılı Sınavı',
    courseName: 'Matematik',
    type: 'exam',
    date: '18 Ekim 2026',
    time: '08:30',
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-4',
    title: '1. Dönem 2. Yazılı Sınavı',
    courseName: 'Matematik',
    type: 'exam',
    date: '02 Aralık 2026',
    time: '09:25',
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-5',
    title: 'Python Kodlama ve Algoritma Uygulama Sınavı',
    courseName: 'Bilişim & Kodlama',
    type: 'exam',
    date: '20 Kasım 2026',
    time: '13:40',
    durationMinutes: 40,
    location: 'Bilişim Atölyesi',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-6',
    title: 'İngilizce Reading & Essay Değerlendirmesi',
    courseName: 'Yabancı Dil (İngilizce)',
    type: 'exam',
    date: '15 Kasım 2026',
    time: '11:15',
    durationMinutes: 40,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: true,
    status: 'upcoming',
  },
  {
    id: 'as-7',
    title: 'Edebiyat Şiir Tahlili Mini Quiz',
    courseName: 'Türk Dili ve Edebiyatı',
    type: 'quiz',
    date: '24 Ekim 2026',
    time: '10:20',
    durationMinutes: 20,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: false,
    status: 'upcoming',
  },
  {
    id: 'as-8',
    title: 'Denklem Sistemleri Hızlı Tarama Quizi',
    courseName: 'Matematik',
    type: 'quiz',
    date: '27 Ekim 2026',
    time: '11:15',
    durationMinutes: 25,
    location: 'Derslik 101 (9-A)',
    maxScore: 100,
    score: undefined,
    isGraded: false,
    isPublished: false,
    status: 'upcoming',
  },
]

export interface StudentAnnouncement {
  id: string
  title: string
  author: string
  authorRole: string
  date: string
  category: 'general' | 'academic' | 'event'
  content: string
  isPinned?: boolean
}

export const STUDENT_ANNOUNCEMENTS: StudentAnnouncement[] = [
  {
    id: 'ann-1',
    title: '9-A Şubesi Dönem Ortası Akademik Başarı Tebriği',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    date: 'Bugün, 09:30',
    category: 'academic',
    isPinned: true,
    content: '9-A şubemiz edebiyat, matematik ve bilişim derslerindeki üstün performansıyla okulumuzun birinci şubesi olarak devam etmektedir. Tüm öğrencilerimizi ve zümre öğretmenimiz Ebru Hanımı tebrik eder, başarılarının devamını dilerim.',
  },
  {
    id: 'ann-2',
    title: 'Akıllı Tahta ve Dijital Kütüphane Yeni İçerikleri Eklendi',
    author: 'Ebru TEKNECİ',
    authorRole: '9-A Rehber Öğretmeni & Edebiyat',
    date: 'Dün, 14:15',
    category: 'academic',
    isPinned: false,
    content: 'Dersliklerimizde bulunan akıllı tahtalar ile senkronize çalışan yeni dijital çalışma föyleri ve video kaynakları öğrenci kütüphanesine yüklenmiştir. Hafta sonu inceleyebilirsiniz.',
  },
  {
    id: 'ann-3',
    title: 'TÜBİTAK & Bilişim Bilim Fuarı Başvuruları Başladı',
    author: 'Oxonom Bilim Koordinatörlüğü',
    authorRole: 'Akademik Koordinatörlük',
    date: '10 Ekim 2026',
    category: 'event',
    isPinned: false,
    content: 'Bu yıl düzenlenecek geleneksel Oxonom Bilim Şenliği için proje önerilerini danışman öğretmenleriniz ile paylaşabilirsiniz.',
  },
]

// Student submission storage
const SUBMISSIONS_STORAGE_KEY = 'oxonom_student_submissions_ercil'

export interface StudentSubmission {
  assignmentId: string
  submittedAt: string
  content: string
  fileName?: string
  status: 'submitted' | 'graded'
  score?: number
  feedback?: string
}

export function getStudentSubmissions(): Record<string, StudentSubmission> {
  if (typeof window === 'undefined') return {}
  const res: Record<string, StudentSubmission> = {}
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.assign(res, parsed)
    }
  } catch (_) {}

  // Merge live teacher evaluations from m_homework_submissions_v2
  try {
    const teacherRaw = localStorage.getItem('m_homework_submissions_v2')
    if (teacherRaw) {
      const parsedTeacher = JSON.parse(teacherRaw)
      Object.entries(parsedTeacher).forEach(([hwId, subs]: [string, any]) => {
        const studentSub = subs?.['s-1'] || subs?.['101']
        if (studentSub) {
          res[hwId] = {
            assignmentId: hwId,
            submittedAt: studentSub.submittedAt || new Date().toLocaleDateString('tr-TR'),
            content: res[hwId]?.content || 'Çalışma teslim edildi.',
            fileName: res[hwId]?.fileName,
            status: studentSub.score !== undefined ? 'graded' : 'submitted',
            score: studentSub.score,
            feedback: studentSub.feedback,
          }
        }
      })
    }
  } catch (_) {}

  return res
}

export function saveStudentSubmission(sub: StudentSubmission): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStudentSubmissions()
    current[sub.assignmentId] = sub
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current))

    // Bridge into teacher storage m_homework_submissions_v2 so teacher sees it immediately
    try {
      const teacherRaw = localStorage.getItem('m_homework_submissions_v2')
      const teacherData = teacherRaw ? JSON.parse(teacherRaw) : {}
      const record = {
        studentId: 's-1',
        score: sub.score ?? 100,
        feedback: sub.feedback || (sub.content ? `Öğrenci Yanıtı: ${sub.content}` : 'Ödev teslimi alındı.'),
        submittedAt: sub.submittedAt || new Date().toLocaleString('tr-TR'),
        status: 'submitted',
      }

      if (!teacherData[sub.assignmentId]) teacherData[sub.assignmentId] = {}
      teacherData[sub.assignmentId]['s-1'] = record

      // Also bridge under canonical aliases if known
      const allAsgs = getSynchronizedStudentAssignments()
      const found = allAsgs.find((a: any) => String(a.assignment_uuid) === sub.assignmentId || String(a.id) === sub.assignmentId)
      if (found) {
        if (found.id) {
          if (!teacherData[found.id]) teacherData[found.id] = {}
          teacherData[found.id]['s-1'] = record
        }
        if (found.assignment_uuid) {
          if (!teacherData[found.assignment_uuid]) teacherData[found.assignment_uuid] = {}
          teacherData[found.assignment_uuid]['s-1'] = record
        }
      }

      localStorage.setItem('m_homework_submissions_v2', JSON.stringify(teacherData))
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('oxonom_student_submission_updated', { detail: sub }))
    window.dispatchEvent(new CustomEvent('oxonom_student_homeworks_updated', { detail: sub }))
  } catch (_) {}
}

// Student Planner tasks storage
const PLANNER_TASKS_KEY = 'oxonom_student_planner_tasks_ercil'

export interface PlannerTask {
  id: string
  title: string
  course: string
  dueDate: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  bookId?: number | string
  bookTitle?: string
  pageNumber?: number
}

export const INITIAL_PLANNER_TASKS: PlannerTask[] = [
  { id: 'pt-1', title: 'Edebiyat şiir tahlili 3. ünitenin tekrarı', course: 'Türk Dili ve Edebiyatı', dueDate: 'Bugün', completed: false, priority: 'high' },
  { id: 'pt-2', title: 'Matematik eşitsizlikler 20 soru çözümü', course: 'Matematik', dueDate: 'Yarın', completed: false, priority: 'medium' },
  { id: 'pt-3', title: 'Python fonksiyonlar modülü örnek kod denemesi', course: 'Bilişim & Kodlama', dueDate: '14 Ekim', completed: true, priority: 'low' },
  { id: 'pt-4', title: 'İngilizce essay taslağının düzenlenmesi', course: 'Yabancı Dil', dueDate: '16 Ekim', completed: false, priority: 'medium' },
]

export function getStoredPlannerTasks(): PlannerTask[] {
  if (typeof window === 'undefined') return INITIAL_PLANNER_TASKS
  try {
    const raw = localStorage.getItem(PLANNER_TASKS_KEY)
    if (!raw) return INITIAL_PLANNER_TASKS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_PLANNER_TASKS
  } catch (_) {
    return INITIAL_PLANNER_TASKS
  }
}

export function saveStoredPlannerTasks(tasks: PlannerTask[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLANNER_TASKS_KEY, JSON.stringify(tasks))
  } catch (_) {}
}

// ────────────────────────────────────────────────────────────
// DYNAMIC SYNCHRONIZATION WITH TEACHER & PRINCIPAL ACCOUNTS
// ────────────────────────────────────────────────────────────

/**
 * Returns the authoritative student profile synchronized with the
 * teacher and principal portal records (oxonom_m_students_v3, teacher profile, attendance).
 */
export function getSynchronizedStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_PROFILE

  try {
    let studentRecord: MStudentItem | null = null

    // 1. Read from authoritative student directory managed by teachers and principal
    const rawStudents = localStorage.getItem('oxonom_m_students_v3')
    if (rawStudents) {
      try {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Erçil UĞURLU (student ID s-1, No 101, class 9-A)
          studentRecord =
            parsed.find(
              (s: MStudentItem) =>
                s.id === 's-1' ||
                s.studentNo === '101' ||
                (s.name && s.name.toLowerCase().includes('erçil'))
            ) ||
            parsed.find(
              (s: MStudentItem) =>
                s.className?.includes('9-A') || s.className?.includes('9/A')
            ) ||
            parsed[0]
        }
      } catch (_) {}
    }

    if (!studentRecord) {
      studentRecord = ALL_INITIAL_STUDENTS[0] || (DEFAULT_STUDENT_PROFILE as any)
    }

    // 2. Mentor Teacher synchronization from active teacher's profile
    let mentorTeacher = studentRecord.mentorTeacher || 'Ebru TEKNECİ (Türk Dili ve Edebiyatı)'
    const rawTeacher = localStorage.getItem('oxonom_teacher_profile')
    if (rawTeacher) {
      try {
        const teacherObj = JSON.parse(rawTeacher)
        const tName = `${teacherObj.firstName || teacherObj.name || 'Ebru'} ${teacherObj.lastName || 'TEKNECİ'}`.trim()
        const tBranch = teacherObj.branch || 'Türk Dili ve Edebiyatı'
        mentorTeacher = `${tName} (${tBranch})`
      } catch (_) {}
    }

    // 3. Dynamic GPA and Course Grades calculation from official student record & calendar exams
    const baseCurriculum = [
      'Türk Dili ve Edebiyatı',
      'Matematik',
      'Fizik & Fen Bilimleri',
      'Bilişim & Kodlama',
      'Yabancı Dil (İngilizce)',
      'Tarih',
      'Coğrafya',
      'Felsefe',
    ]

    const gradesMap = new Map<string, MStudentCourseGrade>()

    // Seed base courses
    baseCurriculum.forEach((cName) => {
      gradesMap.set(cName, {
        courseName: cName,
        teacherName: cName.includes('Edebiyat')
          ? 'Ebru TEKNECİ'
          : cName.includes('Matematik')
          ? 'Matematik Zümresi'
          : cName.includes('Bilişim')
          ? 'Ebru TEKNECİ'
          : 'Ders Öğretmeni',
      })
    })

    // Overlay studentRecord.grades
    if (studentRecord.grades && Array.isArray(studentRecord.grades)) {
      studentRecord.grades.forEach((g) => {
        if (g && g.courseName) {
          const existing = gradesMap.get(g.courseName) || {
            courseName: g.courseName,
            teacherName: g.teacherName || 'Ders Öğretmeni',
          }
          gradesMap.set(g.courseName, { ...existing, ...g })
        }
      })
    }

    // Overlay actual exam scores from getStoredSchoolExams()
    try {
      const calendarExams = getStoredSchoolExams()
      const studentId = studentRecord.id || 's-1'

      calendarExams.forEach((ce) => {
        const studentScore = ce.scores?.[studentId] ?? ce.scores?.['s-1']
        if (studentScore !== undefined && studentScore !== null && String(studentScore) !== '') {
          const scoreNum = Number(studentScore)
          const targetCourse = ce.courseName
          const cur = gradesMap.get(targetCourse) || {
            courseName: targetCourse,
            teacherName: ce.teacherName || 'Ders Öğretmeni',
          }

          if (
            ce.type === 'performance' ||
            ce.type === 'oral' ||
            (ce.examTypeLabel || '').includes('Sözlü') ||
            (ce.examTypeLabel || '').includes('Performans')
          ) {
            cur.performance = scoreNum
          } else if (ce.title.includes('2.') || (ce.id && ce.id.includes('2'))) {
            cur.exam2 = scoreNum
          } else {
            cur.exam1 = scoreNum
          }

          gradesMap.set(targetCourse, cur)
        }
      })
    } catch (_) {}

    // Calculate each course average strictly from entered components
    const grades: MStudentCourseGrade[] = Array.from(gradesMap.values()).map((g) => {
      const e1 = g.exam1 !== undefined && g.exam1 !== null && String(g.exam1) !== '' ? Number(g.exam1) : null
      const e2 = g.exam2 !== undefined && g.exam2 !== null && String(g.exam2) !== '' ? Number(g.exam2) : null
      const perf = g.performance !== undefined && g.performance !== null && String(g.performance) !== '' ? Number(g.performance) : null

      const entered: { val: number; weight: number }[] = []
      if (e1 !== null && !isNaN(e1)) entered.push({ val: e1, weight: 0.4 })
      if (e2 !== null && !isNaN(e2)) entered.push({ val: e2, weight: 0.4 })
      if (perf !== null && !isNaN(perf)) entered.push({ val: perf, weight: 0.2 })

      let avg: number | undefined = undefined
      if (entered.length > 0) {
        const totalWeight = entered.reduce((acc, c) => acc + c.weight, 0)
        const weightedSum = entered.reduce((acc, c) => acc + c.val * c.weight, 0)
        avg = Number((weightedSum / totalWeight).toFixed(1))
      } else if (g.average !== undefined && g.average !== null && !isNaN(Number(g.average))) {
        avg = Number(Number(g.average).toFixed(1))
      }

      return {
        ...g,
        average: avg,
      }
    })

    // Calculate overall GPA strictly from courses that have actual grades
    const coursesWithAverage = grades.filter((g) => g.average !== undefined && g.average !== null)
    let calculatedGpa = 0

    if (coursesWithAverage.length > 0) {
      const sum = coursesWithAverage.reduce((acc, g) => acc + (Number(g.average) || 0), 0)
      calculatedGpa = Number((sum / coursesWithAverage.length).toFixed(1))
    } else if (typeof studentRecord.gpa === 'number') {
      calculatedGpa = studentRecord.gpa
    } else if (studentRecord.gpa) {
      calculatedGpa = Number(studentRecord.gpa)
    }

    // Dynamic Class Rank based on GPA
    let classRank = studentRecord.classRank || 1
    if (calculatedGpa > 0) {
      if (calculatedGpa < 50) {
        classRank = 30
      } else if (calculatedGpa < 70) {
        classRank = 18
      } else if (calculatedGpa < 85) {
        classRank = 8
      } else {
        classRank = 1
      }
    } else {
      classRank = studentRecord.classRank || 1
    }

    let disciplineStatus = studentRecord.disciplineStatus || 'Temiz Sicil'
    if (calculatedGpa >= 85) {
      disciplineStatus = 'Temiz Sicil — Üstün Başarı Onur Belgesi'
    } else if (calculatedGpa >= 60) {
      disciplineStatus = 'Temiz Sicil — Başarı Takip Sürecinde'
    } else if (calculatedGpa > 0) {
      disciplineStatus = 'Temiz Sicil — Akademik Destek ve Etüt Takibinde'
    }

    // 4. Live Attendance Synchronization from teacher's attendance service
    let attendanceRate = studentRecord.attendanceRate || 100
    let absentDays = (studentRecord.absentExcusedDays || 0) + (studentRecord.absentUnexcusedDays || 0)
    try {
      const summary = getStudentAttendanceSummary(
        studentRecord.id || 's-1',
        studentRecord.studentNo || '101',
        studentRecord.className || '9/A'
      )
      attendanceRate = summary.attendanceRate
      absentDays = summary.absentSessions
    } catch (_) {}

    const nameParts = (studentRecord.name || 'Erçil UĞURLU').split(' ')
    const firstName = nameParts[0] || 'Erçil'
    const lastName = nameParts.slice(1).join(' ') || 'UĞURLU'

    return {
      id: studentRecord.id || 's-1',
      name: studentRecord.name || 'Erçil UĞURLU',
      firstName,
      lastName,
      email: studentRecord.email || 'ogrenci@oxonom.com',
      studentNo: studentRecord.studentNo || '101',
      tcNo: studentRecord.tcNo || '10000000146',
      gender: studentRecord.gender || 'Erkek',
      birthDate: studentRecord.birthDate || '15.06.2010 (16 Yaşında)',
      bloodType: studentRecord.bloodType || 'A Rh+',
      enrollmentDate: studentRecord.enrollmentDate || '01.09.2024',
      className: studentRecord.className ? studentRecord.className.replace(' Şubesi', '') : '9-A',
      gradeLevel: '9. Sınıf',
      mentorTeacher,
      schoolName: studentRecord.schoolName || 'Oxonom Okulları',
      gpa: calculatedGpa,
      classRank,
      attendanceRate,
      absentDays,
      absentExcusedDays: studentRecord.absentExcusedDays ?? 0,
      absentUnexcusedDays: studentRecord.absentUnexcusedDays ?? absentDays,
      parentName: studentRecord.parentName || 'Ebru UĞURLU',
      parentPhone: studentRecord.parentPhone || '+90 532 999 1100',
      parentRelation: studentRecord.parentRelation || 'Anne (Mimar)',
      secondParentName: studentRecord.secondParentName || 'Dr. Uğur UĞURLU',
      secondParentPhone: studentRecord.secondParentPhone || '+90 532 999 2200',
      secondParentRelation: studentRecord.secondParentRelation || 'Baba (Kurum Müdürü)',
      emergencyPhone: studentRecord.emergencyPhone || '+90 532 999 2200',
      address: studentRecord.address || 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
      disciplineStatus,
      specialHealthNote: studentRecord.specialHealthNote,
      notes: studentRecord.notes,
      guidanceNotes: (studentRecord.guidanceNotes as any) || [],
      grades,
    }
  } catch (err) {
    console.warn('getSynchronizedStudentProfile fallback:', err)
    return DEFAULT_STUDENT_PROFILE
  }
}

/**
 * Returns dynamic assessments matching the teacher's grade book records for the student.
 */
export function getSynchronizedStudentAssessments(): StudentAssessment[] {
  const profile = getSynchronizedStudentProfile()
  const grades = profile.grades || []
  const assessments: StudentAssessment[] = []

  try {
    const calendarExams = getStoredSchoolExams()
    const currentClass = profile.className || '9-A'

    calendarExams.forEach((ce: any) => {
      const matchClass =
        !ce.className ||
        ce.className === 'Tüm Sınıflar' ||
        ce.className === currentClass ||
        currentClass.includes(ce.className)

      if (!matchClass) return

      const studentScore = ce.scores?.[profile.id] ?? ce.scores?.['s-1']
      const hasScoreInExam = studentScore !== undefined && studentScore !== null && String(studentScore) !== ''

      // Also check matching grade record
      const courseGrade = grades.find(
        (g) =>
          g.courseName.toLowerCase().includes(ce.courseName.toLowerCase()) ||
          ce.courseName.toLowerCase().includes(g.courseName.toLowerCase())
      )

      let resolvedScore: number | undefined = hasScoreInExam ? Number(studentScore) : undefined

      if (resolvedScore === undefined && courseGrade) {
        if (ce.type === 'performance' || ce.type === 'oral' || (ce.examTypeLabel || '').includes('Sözlü') || (ce.examTypeLabel || '').includes('Performans')) {
          if (courseGrade.performance !== undefined && courseGrade.performance !== null && String(courseGrade.performance) !== '') {
            resolvedScore = Number(courseGrade.performance)
          }
        } else if (ce.title.includes('2.') || ce.id.includes('2')) {
          if (courseGrade.exam2 !== undefined && courseGrade.exam2 !== null && String(courseGrade.exam2) !== '') {
            resolvedScore = Number(courseGrade.exam2)
          }
        } else if (ce.title.includes('1.') || ce.id.includes('1')) {
          if (courseGrade.exam1 !== undefined && courseGrade.exam1 !== null && String(courseGrade.exam1) !== '') {
            resolvedScore = Number(courseGrade.exam1)
          }
        }
      }

      const isGraded = resolvedScore !== undefined && !isNaN(resolvedScore)
      const typeLabel =
        ce.examTypeLabel ||
        (ce.type === 'quiz'
          ? 'Quiz'
          : ce.type === 'oral'
          ? 'Sözlü Sınav'
          : ce.type === 'performance'
          ? 'Performans / Proje'
          : ce.type === 'mock'
          ? 'Deneme Sınavı'
          : 'Yazılı Sınav')

      let feedback: string | undefined = undefined
      if (isGraded && resolvedScore !== undefined) {
        if (resolvedScore >= 85) {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Üstün akademik başarı ve konu hakimiyeti (${resolvedScore}/100).`
        } else if (resolvedScore >= 50) {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Başarılı çalışma, eksik kazanımlar tekrar edilmelidir (${resolvedScore}/100).`
        } else {
          feedback = `${ce.teacherName || courseGrade?.teacherName || 'Öğretmen'}: Kritik başarı seviyesi (${resolvedScore}/100). Birebir etüt ve telafi çalışması zorunludur.`
        }
      }

      assessments.push({
        id: ce.id || `exam-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        title: ce.title,
        courseName: ce.courseName,
        type: ce.type || 'exam',
        examTypeLabel: typeLabel,
        date: ce.date,
        time: ce.time || '10:20 - 11:00',
        period: ce.period,
        durationMinutes: ce.durationMinutes || 40,
        location: ce.location || `Derslik 101 (${currentClass})`,
        maxScore: 100,
        score: isGraded ? resolvedScore : undefined,
        isGraded,
        isPublished: true,
        status: isGraded ? 'completed' : 'upcoming',
        teacherFeedback: feedback,
        scope: ce.scope,
        teacherName: ce.teacherName || courseGrade?.teacherName || 'Ebru TEKNECİ',
        className: ce.className,
      })
    })
  } catch (err) {
    console.warn('Error in getSynchronizedStudentAssessments:', err)
  }

  return assessments
}

/**
 * Returns courses matching the teacher and schedule records for 9-A.
 */
export function getSynchronizedStudentCourses(): StudentCourse[] {
  const profile = getSynchronizedStudentProfile()

  return STUDENT_COURSES.map((course) => {
    const gradeMatch = profile.grades?.find((g) => g.courseName === course.name)
    const teacherName =
      gradeMatch?.teacherName ||
      (course.name.includes('Edebiyat') ? profile.mentorTeacher.split('(')[0].trim() : course.teacherName)

    return {
      ...course,
      classroom: `${profile.className} (${course.roomType})`,
      teacherName,
    }
  })
}

/**
 * Returns guidance & pedagogical notes written by the teacher for this student.
 */
export function getSynchronizedGuidanceNotes(): GuidanceNoteItem[] {
  const profile = getSynchronizedStudentProfile()
  if (profile.guidanceNotes && profile.guidanceNotes.length > 0) {
    return profile.guidanceNotes
  }
  return [
    {
      id: 'gn-1',
      date: '28.09.2026',
      author: 'Ebru TEKNECİ (Türk Dili ve Edebiyatı · Rehberlik)',
      content:
        'Öğrencinin edebiyat tahlilleri, kompozisyon yeteneği ve ders içi motivasyonu en üst düzeydedir.',
    },
    {
      id: 'gn-2',
      date: '15.09.2026',
      author: 'Dr. Uğur UĞURLU (Okul Müdürü)',
      content:
        'Velisi Ebru Hanım ile yapılan dönem başı akademik ve eğitim planlama görüşmesi verimli tamamlandı.',
    },
  ]
}

// Canonical 30-hour (6 periods/day x 5 days) schedule for 9-A matching the Principal's curriculum
export const CANONICAL_9A_SCHEDULE_30: ScheduleEntry[] = [
  // Pazartesi (6)
  { id: 'sc-9a-mon-1', orgId: 30, day: 'mon', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-mon-2', orgId: 30, day: 'mon', period: 2, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-mon-3', orgId: 30, day: 'mon', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-mon-4', orgId: 30, day: 'mon', period: 4, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-mon-5', orgId: 30, day: 'mon', period: 5, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Ebru TEKNECİ', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-9a-mon-6', orgId: 30, day: 'mon', period: 6, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Ebru TEKNECİ', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },

  // Salı (6)
  { id: 'sc-9a-tue-1', orgId: 30, day: 'tue', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-tue-2', orgId: 30, day: 'tue', period: 2, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-tue-3', orgId: 30, day: 'tue', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-tue-4', orgId: 30, day: 'tue', period: 4, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-tue-5', orgId: 30, day: 'tue', period: 5, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Ebru TEKNECİ', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },
  { id: 'sc-9a-tue-6', orgId: 30, day: 'tue', period: 6, classCode: '9-A', subject: 'Fizik & Fen Bilimleri', teacherName: 'Ebru TEKNECİ', roomName: 'Fen & Teknoloji Laboratuvarı', color: 'emerald', isSmartBoardActive: true },

  // Çarşamba (6)
  { id: 'sc-9a-wed-1', orgId: 30, day: 'wed', period: 1, classCode: '9-A', subject: 'Türk Dili ve Edebiyatı', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'blue', isSmartBoardActive: true },
  { id: 'sc-9a-wed-2', orgId: 30, day: 'wed', period: 2, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-wed-3', orgId: 30, day: 'wed', period: 3, classCode: '9-A', subject: 'Matematik', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'indigo', isSmartBoardActive: true },
  { id: 'sc-9a-wed-4', orgId: 30, day: 'wed', period: 4, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Ebru TEKNECİ', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-wed-5', orgId: 30, day: 'wed', period: 5, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Ebru TEKNECİ', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-wed-6', orgId: 30, day: 'wed', period: 6, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },

  // Perşembe (6)
  { id: 'sc-9a-thu-1', orgId: 30, day: 'thu', period: 1, classCode: '9-A', subject: 'Bilişim & Yazılım', teacherName: 'Ebru TEKNECİ', roomName: 'Bilişim & Kodlama Atölyesi', color: 'cyan', isSmartBoardActive: true },
  { id: 'sc-9a-thu-2', orgId: 30, day: 'thu', period: 2, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-thu-3', orgId: 30, day: 'thu', period: 3, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-thu-4', orgId: 30, day: 'thu', period: 4, classCode: '9-A', subject: 'Tarih', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-9a-thu-5', orgId: 30, day: 'thu', period: 5, classCode: '9-A', subject: 'Tarih', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'amber', isSmartBoardActive: true },
  { id: 'sc-9a-thu-6', orgId: 30, day: 'thu', period: 6, classCode: '9-A', subject: 'Coğrafya', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'teal', isSmartBoardActive: true },

  // Cuma (6)
  { id: 'sc-9a-fri-1', orgId: 30, day: 'fri', period: 1, classCode: '9-A', subject: 'Yabancı Dil (İngilizce)', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'purple', isSmartBoardActive: true },
  { id: 'sc-9a-fri-2', orgId: 30, day: 'fri', period: 2, classCode: '9-A', subject: 'Coğrafya', teacherName: 'Ebru TEKNECİ', roomName: 'Derslik 9-A', color: 'teal', isSmartBoardActive: true },
  { id: 'sc-9a-fri-3', orgId: 30, day: 'fri', period: 3, classCode: '9-A', subject: 'Beden Eğitimi & Spor', teacherName: 'Ebru TEKNECİ', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-9a-fri-4', orgId: 30, day: 'fri', period: 4, classCode: '9-A', subject: 'Beden Eğitimi & Spor', teacherName: 'Ebru TEKNECİ', roomName: 'Kapalı Spor Salonu', color: 'orange', isSmartBoardActive: false },
  { id: 'sc-9a-fri-5', orgId: 30, day: 'fri', period: 5, classCode: '9-A', subject: 'Görsel Sanatlar & Atölye', teacherName: 'Ebru TEKNECİ', roomName: 'Görsel Sanatlar Atölyesi', color: 'pink', isSmartBoardActive: false },
  { id: 'sc-9a-fri-6', orgId: 30, day: 'fri', period: 6, classCode: '9-A', subject: 'Müzik & Sahne Sanatları', teacherName: 'Ebru TEKNECİ', roomName: 'Müzik Odası', color: 'pink', isSmartBoardActive: true },
]

/**
 * Returns the weekly class schedule configured by the school principal for 9-A.
 * Synchronizes from oxonom_admin_schedule_30 and other admin schedule stores with fallback to CANONICAL_9A_SCHEDULE_30.
 */
export function getSynchronizedClassWeeklySchedule(classCode: string = '9-A'): ScheduleEntry[] {
  let entries = CANONICAL_9A_SCHEDULE_30

  if (typeof window !== 'undefined') {
    try {
      const raw30 = localStorage.getItem('oxonom_admin_schedule_30')
      const rawSchedule = localStorage.getItem('oxonom_schedule_30')
      const raw1 = localStorage.getItem('oxonom_admin_schedule_1')
      if (raw30) {
        const parsed = JSON.parse(raw30)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else if (rawSchedule) {
        const parsed = JSON.parse(rawSchedule)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else if (raw1) {
        const parsed = JSON.parse(raw1)
        if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('oxonom_admin_schedule_') || key.startsWith('oxonom_schedule_')) && !key.includes('revisions')) {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                entries = parsed
                break
              }
            }
          }
        }
      }
    } catch (_) {}
  }

  const normTarget = classCode.replace(/[\/\-\s_]/g, '').toLowerCase()
  const filtered = entries.filter((e) => {
    const rawClass = String((e as any).classCode || (e as any).classroom || '')
    const normEntry = rawClass.replace(/[\/\-\s_]/g, '').toLowerCase()
    return (
      normEntry === normTarget ||
      normEntry.includes(normTarget) ||
      normTarget.includes(normEntry) ||
      (normTarget.startsWith('9') && normEntry.startsWith('9'))
    )
  })

  return filtered.length > 0 ? filtered : CANONICAL_9A_SCHEDULE_30
}

/**
 * Returns homework assignments assigned by the teacher to 9-A or specifically to Erçil Uğurlu.
 */
export function getSynchronizedStudentAssignments(): SchoolAssignmentItem[] {
  let storedCustom: SchoolAssignmentItem[] = []
  let studentHomeworks: SchoolAssignmentItem[] = []
  const deletedIds = new Set<string>()

  if (typeof window !== 'undefined') {
    try {
      getDeletedHomeworkIds().forEach((id) => deletedIds.add(String(id)))
      const rawDel = localStorage.getItem('oxonom_deleted_homework_ids')
      if (rawDel) {
        const parsedDel = JSON.parse(rawDel)
        if (Array.isArray(parsedDel)) {
          parsedDel.forEach((id: string) => deletedIds.add(String(id)))
        }
      }
    } catch (_) {}

    try {
      storedCustom = getStoredCustomAssignments()
    } catch (_) {}
    try {
      const rawSh = localStorage.getItem('oxonom_student_homeworks_3001')
      if (rawSh) {
        const parsed = JSON.parse(rawSh)
        if (Array.isArray(parsed)) studentHomeworks = parsed
      }
    } catch (_) {}
  }

  // Teacher 9-A initial curriculum assignments
  const teacherDefaults: SchoolAssignmentItem[] = [
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
      tool_data: {
        readingBook: 'Dede Korkut Kitabı',
        readingPages: 'Sayfa 15-42',
        readingQuestions: '1) Boğaç Han boyunun teması nedir? 2) Dirse Han ve hatununun fedakarlığı neyi simgeler?',
      },
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
      board_uuid: 'board_edebi_sanatlar_9a',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-20T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-08T10:00:00',
      tool_data: {
        whiteboardTopic: 'Teşbih, İstiare ve Mecaz Sanatları Şeması',
        whiteboardCanvasType: 'İnteraktif Çizim Tuvali',
      },
    },
    {
      id: 1003,
      assignment_uuid: 'asg_paragraf_anlam_test',
      title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
      description: 'Çoktan seçmeli, doğru-yanlış, eşleştirme ve kısa cevaplı sorular içeren interaktif tarama testi.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Türk Dili ve Edebiyatı',
      tool_type: 'QUIZ',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-22T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-09T11:00:00',
      quiz_questions: [
        {
          id: 'q-1',
          questionNumber: 1,
          type: 'multiple_choice',
          prompt: '“Yazar, olayları bir kamera sessizliğiyle aktarmak yerine karakterlerinin iç dünyasındaki fırtınaları kelimelere dökmüştür.” Bu cümlede yazarın öne çıkan özelliği aşağıdakilerden hangisidir?',
          points: 25,
          options: [
            { id: 'A', label: 'A', text: 'Olayları kronolojik sırayla belgesel gibi aktarması' },
            { id: 'B', label: 'B', text: 'Ruhsal tahlil ve iç çatışmaları derinlemesine işlemesi' },
            { id: 'C', label: 'C', text: 'Sadece dış gözleme dayalı betimlemeler yapması' },
            { id: 'D', label: 'D', text: 'Mekân tasvirlerine odaklanıp insanı arka plana atması' },
          ],
          correctOptionId: 'B',
          explanation: 'Karakterlerin iç dünyasındaki fırtınalar, bireyin psikolojik ve ruhsal boyutunu derinlemesine ele almayı ifade eder.',
        },
        {
          id: 'q-2',
          questionNumber: 2,
          type: 'true_false',
          prompt: 'Dede Korkut Hikâyelerinde olağanüstü mitolojik motifler ile gerçekçi tarihsel unsurlar bir arada bulunur ve eser nazım-nesir (şiir-düzyazı) karışık olarak kaleme alınmıştır.',
          points: 25,
          correctBoolean: true,
          explanation: 'Dede Korkut destansı anlatılarında olaylar düzyazı, duygular şiir biçimindedir.',
        },
        {
          id: 'q-3',
          questionNumber: 3,
          type: 'matching',
          prompt: 'Aşağıdaki edebi sanatları uygun şiir dizeleriyle eşleştiriniz.',
          points: 25,
          matchingPairs: [
            { id: 'm-1', left: 'Teşbih (Benzetme)', right: 'Kükremiş sel gibiyim, bendimi çiğner aşarım.' },
            { id: 'm-2', left: 'Teşhis (Kişileştirme)', right: 'Rüzgâr hüzünle fısıldıyordu kırık penceremde.' },
            { id: 'm-3', left: 'Tezat (Karşıtlık)', right: 'Ağlarım çağlar gibi, gülerim güller gibi.' },
          ],
          explanation: 'Kükremiş sel benzetme, rüzgârın fısıldaması kişileştirme, ağlamak-gülmek tezattır.',
        },
        {
          id: 'q-4',
          questionNumber: 4,
          type: 'short_answer',
          prompt: 'Bir edebi metinde anlatıcının olayları her şeyi bilen, kahramanların geçmişini, geleceğini ve gizli düşüncelerini sezen bakış açısına ne ad verilir?',
          points: 25,
          sampleAnswer: 'İlahi (Hakim / Tanrısal) Bakış Açısı',
          explanation: 'Kahramanların aklından geçenleri ve geleceği bilen anlatıcı ilahi bakış açısına sahiptir.',
        },
      ],
      tool_data: {
        quizQuestionCount: 4,
        quizDifficulty: 'Orta',
      },
    },
    {
      id: 1004,
      assignment_uuid: 'asg_kumeler_mantik_calisma',
      title: 'Kümeler, Önermeler ve Mantık Çalışma Föyü',
      description: 'Doğruluk tabloları ve küme işlemleri içeren analitik matematik çalışma föyü.',
      grade_level: '9. Sınıf',
      grade_category: 'Lise (9-12)',
      subject: 'Matematik',
      tool_type: 'WORKSHEET',
      classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
      due_date: '2026-10-24T23:59:00',
      max_score: 100,
      published: true,
      teacher_name: 'Ebru TEKNECİ',
      creation_date: '2026-10-10T14:00:00',
      tool_data: {
        attachedFileName: '9A_Matematik_Mantık_ve_Kümeler_Çalışma_Föyü.pdf',
      },
    },
  ]

  // Filter teacherDefaults to remove deleted ones
  const activeTeacherDefaults = teacherDefaults.filter(
    (t) => !deletedIds.has(String(t.id)) && !deletedIds.has(String(t.assignment_uuid))
  )

  // Custom and updated assignments take highest precedence
  const pool = [
    ...storedCustom.filter((c) => !deletedIds.has(String(c.id)) && !deletedIds.has(String(c.assignment_uuid))),
    ...studentHomeworks.filter((s) => !deletedIds.has(String(s.id)) && !deletedIds.has(String(s.assignment_uuid))),
    ...activeTeacherDefaults,
  ]

  // Deduplicate pool by assignment_uuid or id
  const seenIds = new Set<string>()
  const uniquePool: SchoolAssignmentItem[] = []

  for (const asg of pool) {
    const key = String(asg.assignment_uuid || asg.id)
    if (!seenIds.has(key)) {
      seenIds.add(key)
      // Ensure quiz questions are accessible
      const qQuestions = asg.quiz_questions || asg.tool_data?.quizQuestions
      uniquePool.push({
        ...asg,
        quiz_questions: qQuestions || asg.quiz_questions,
      })
    }
  }

  // Filter for 9-A class or individual student Erçil Uğurlu
  return uniquePool.filter((asg: any) => {
    // Check if target is individual
    const targetType = asg.target_type || asg.tool_data?.targetType || 'CLASS'
    if (targetType === 'INDIVIDUAL') {
      const studentId = String(asg.target_student_id || asg.tool_data?.targetStudentId || '')
      const studentName = String(asg.target_student_name || asg.tool_data?.targetStudentName || '').toLowerCase()
      const isForErcil =
        studentId === 's-1' ||
        studentId === '101' ||
        studentName.includes('erçil') ||
        studentName.includes('ugurlu') ||
        studentName.includes('uğurlu')
      return isForErcil
    }

    // Class assignment targeted to 9-A or 9. Sınıf
    const classStr = String(asg.className || asg.grade_level || '').toLowerCase()
    const hasClassInClasses = asg.classes?.some((c: any) => {
      const cStr = String(c.code || c.name || '').toLowerCase()
      return cStr.includes('9-a') || cStr.includes('9/a') || cStr.includes('9a') || cStr.includes('9. sınıf')
    })

    if (
      classStr.includes('9-a') ||
      classStr.includes('9/a') ||
      classStr.includes('9a') ||
      classStr.includes('9. sınıf') ||
      hasClassInClasses
    ) {
      return true
    }

    // Exclude if explicitly targeted to other grades (1. Sınıf, 5-A, etc.)
    if (
      asg.grade_level &&
      (asg.grade_level.includes('1.') ||
        asg.grade_level.includes('5.') ||
        asg.grade_level.includes('6.') ||
        asg.grade_level.includes('7.') ||
        asg.grade_level.includes('8.'))
    ) {
      return false
    }

    // Fallback if no specific class defined and not excluded
    if (!asg.className && (!asg.classes || asg.classes.length === 0)) {
      return true
    }

    return false
  })
}


