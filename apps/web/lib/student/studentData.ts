import {
  CUSTOM_ASSIGNMENTS_STORAGE_KEY,
  getStoredCustomAssignments,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  DAYS_LIST,
  PRIMARY_PERIODS,
  MIDDLE_PERIODS,
  INITIAL_SCHEDULE_ENTRIES,
  type ScheduleEntry,
} from '@components/Mobile/Admin/MAdminScheduleClient'

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
  parentName: string
  parentPhone: string
  parentRelation: string
  secondParentName: string
  secondParentPhone: string
  secondParentRelation: string
  emergencyPhone: string
  address: string
  disciplineStatus: string
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
  gpa: 98.8,
  classRank: 1,
  attendanceRate: 100,
  absentDays: 0,
  parentName: 'Ebru UĞURLU',
  parentPhone: '+90 532 999 1100',
  parentRelation: 'Anne (Mimar)',
  secondParentName: 'Dr. Uğur UĞURLU',
  secondParentPhone: '+90 532 999 2200',
  secondParentRelation: 'Baba (Kurum Müdürü)',
  emergencyPhone: '+90 532 999 2200',
  address: 'Caddebostan Mah. Bağdat Cad. No: 142/5 Kadıköy / İstanbul',
  disciplineStatus: 'Temiz Sicil — Üstün Başarı Onur Belgesi',
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
  type: 'exam' | 'quiz' | 'performance'
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
    score: 98,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Edebi metin tahlili ve şiir bilgisi sorularında üstün başarı gösterilmiştir.',
    status: 'completed',
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
    score: 100,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Kusursuz kompozisyon ve tam puan.',
    status: 'completed',
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
    score: 96,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Kümeler ve önermeler bölümleri eksiksiz, işlem adımları çok düzenli.',
    status: 'completed',
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
    score: 98,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Denklem kurma ve problem çözme metodolojisi harika.',
    status: 'completed',
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
    score: 100,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Akıllı tahta entegrasyonu ve kod yazım temizliği mükemmel.',
    status: 'completed',
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
    score: 100,
    isGraded: true,
    isPublished: true,
    teacherFeedback: 'Native-level writing and vocabulary structure.',
    status: 'completed',
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
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (_) {
    return {}
  }
}

export function saveStudentSubmission(sub: StudentSubmission): void {
  if (typeof window === 'undefined') return
  try {
    const current = getStudentSubmissions()
    current[sub.assignmentId] = sub
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current))
    window.dispatchEvent(new CustomEvent('oxonom_student_submission_updated', { detail: sub }))
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
