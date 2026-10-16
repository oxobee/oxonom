'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  MapPin,
  BookOpen,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  Video,
  User,
  Calendar,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Award,
  ExternalLink,
  Layers,
  HelpCircle,
  Check,
  Bookmark,
  Share2,
  FileCheck,
  Send,
  RefreshCw,
} from 'lucide-react'
import {
  STUDENT_COURSES,
  getSynchronizedStudentCourses,
  getSynchronizedStudentAssessments,
  getSynchronizedStudentProfile,
  type StudentCourse,
  type StudentAssessment,
  type StudentProfile,
} from '@/lib/student/studentData'
import { MEB_TEXTBOOKS_CATALOG, type MebBookItem } from '@/lib/student/mebBooksData'
import {
  getStoredStudentNotes,
  saveBookNoteToDefterim,
  deleteBookNoteFromDefterim,
} from '@/lib/student/studentLibraryStorage'
import MobileBookReader from '@/components/Student/library/MobileBookReader'
import toast from 'react-hot-toast'

interface StudentCourseDetailViewProps {
  courseId: string
}

interface CustomCourseMaterial {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'video'
  size: string
  target?: string
  dateAdded?: string
  description?: string
}

export default function StudentCourseDetailView({ courseId }: StudentCourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'materials' | 'assessments' | 'books' | 'quizzes' | 'notes'>('topics')
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [profile, setProfile] = useState<StudentProfile>(getSynchronizedStudentProfile())

  // Reader state for MEB textbooks
  const [readingBook, setReadingBook] = useState<MebBookItem | null>(null)
  const [readerInitialPage, setReaderInitialPage] = useState<number | undefined>(undefined)

  // Teacher hidden books filter
  const [teacherHiddenBookIds, setTeacherHiddenBookIds] = useState<number[]>([])
  const [principalHiddenBookIds, setPrincipalHiddenBookIds] = useState<number[]>([])

  // Course materials (including teacher-added custom ones)
  const [courseMaterials, setCourseMaterials] = useState<CustomCourseMaterial[]>([])
  const [materialFilter, setMaterialFilter] = useState<'all' | 'pdf' | 'doc' | 'video'>('all')

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Course notes from Defterim (including book notes taken in textbooks)
  const [courseNotes, setCourseNotes] = useState<any[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [showNoteForm, setShowNoteForm] = useState(false)

  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const syncAll = () => {
    const prof = getSynchronizedStudentProfile()
    setProfile(prof)
    const crss = getSynchronizedStudentCourses()
    setCourses(crss)
    setAssessments(getSynchronizedStudentAssessments())

    // Hidden books
    try {
      const tRaw = localStorage.getItem('oxonom_teacher_hidden_books')
      if (tRaw) setTeacherHiddenBookIds(JSON.parse(tRaw))
      const pRaw = localStorage.getItem('oxonom_principal_hidden_book_ids')
      if (pRaw) setPrincipalHiddenBookIds(JSON.parse(pRaw))
    } catch (_) {}

    // Course materials
    try {
      const crs = crss.find((c) => c.id === courseId) || crss[0]
      const rawMat = localStorage.getItem(`oxonom_course_materials_${crs.id}`)
      if (rawMat) {
        setCourseMaterials(JSON.parse(rawMat))
      } else {
        setCourseMaterials(crs.materials || [])
      }
    } catch (_) {}

    // Synchronize Defterim notes matching course
    try {
      const allNotes = getStoredStudentNotes()
      const crs = crss.find((c) => c.id === courseId) || crss[0]
      const filteredNotes = allNotes.filter(
        (n: any) =>
          (n.course && (n.course.toLowerCase().includes(crs.name.toLowerCase()) || crs.name.toLowerCase().includes(n.course.toLowerCase()))) ||
          (n.bookTitle && n.bookTitle.toLowerCase().includes(crs.name.toLowerCase()))
      )
      setCourseNotes(filteredNotes)
    } catch (_) {}
  }

  useEffect(() => {
    syncAll()

    window.addEventListener('oxonom_student_updated', syncAll)
    window.addEventListener('oxonom_teacher_profile_updated', syncAll)
    window.addEventListener('oxonom_student_notes_updated', syncAll)
    window.addEventListener('oxonom_teacher_hidden_books_updated', syncAll)
    window.addEventListener('storage', syncAll)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAll)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAll)
      window.removeEventListener('oxonom_student_notes_updated', syncAll)
      window.removeEventListener('oxonom_teacher_hidden_books_updated', syncAll)
      window.removeEventListener('storage', syncAll)
    }
  }, [courseId])

  const course = courses.find((c) => c.id === courseId) || courses[0] || STUDENT_COURSES[0]
  const courseExams = assessments.filter(
    (a) =>
      a.courseName.toLowerCase().includes(course.name.toLowerCase()) ||
      course.name.toLowerCase().includes(a.courseName.toLowerCase())
  )

  // Filter MEB Textbooks for this course (Grade 1 default or student's grade level)
  const studentGradeNum = parseInt((profile.gradeLevel || '1').charAt(0)) || 1
  const hiddenIdsSet = new Set([...teacherHiddenBookIds, ...principalHiddenBookIds])

  const visibleBooks = MEB_TEXTBOOKS_CATALOG.filter((book) => {
    if (hiddenIdsSet.has(book.id)) return false
    if (book.gradeLevel !== studentGradeNum) return false

    const normCourse = course.name.toLowerCase()
    const normSubj = book.subject.toLowerCase()
    const normTitle = book.title.toLowerCase()

    if (normCourse.includes('türkçe') && (normSubj.includes('türkçe') || normTitle.includes('türkçe') || normTitle.includes('okuma'))) return true
    if (normCourse.includes('matematik') && (normSubj.includes('matematik') || normTitle.includes('matematik'))) return true
    if (normCourse.includes('hayat bilgisi') && (normSubj.includes('hayat bilgisi') || normTitle.includes('hayat bilgisi'))) return true
    if (normCourse.includes('beden') && (normSubj.includes('beden') || normTitle.includes('beden') || normTitle.includes('oyun'))) return true
    if (normCourse.includes('görsel') && (normSubj.includes('görsel') || normTitle.includes('görsel'))) return true
    if (normCourse.includes('müzik') && (normSubj.includes('müzik') || normTitle.includes('müzik'))) return true
    if (normCourse.includes('ingilizce') && (normSubj.includes('ingilizce') || normTitle.includes('ingilizce'))) return true
    if (normCourse.includes('serbest') && (normTitle.includes('oyun') || normTitle.includes('etkinlik'))) return true
    return false
  })

  // Topics progress calculation
  const completedTopicsCount = course.topics.filter((t) => t.completed).length
  const totalTopicsCount = course.topics.length
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0

  // File Download Handler
  const handleDownload = (materialTitle: string) => {
    toast.success(`"${materialTitle}" başarıyla indiriliyor...`)
  }

  // Handle Drag & Drop / File Upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase()
    const type: 'pdf' | 'doc' | 'video' =
      ext === 'mp4' || ext === 'mov' ? 'video' : ext === 'pdf' ? 'pdf' : 'doc'
    const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    const newMaterial: CustomCourseMaterial = {
      id: `mat-${Date.now()}`,
      title: file.name,
      type,
      size,
      dateAdded: new Date().toLocaleDateString('tr-TR'),
      description: 'Öğrenci tarafından yüklenen çalışma dosyası',
    }

    const updated = [newMaterial, ...courseMaterials]
    setCourseMaterials(updated)
    try {
      localStorage.setItem(`oxonom_course_materials_${course.id}`, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      toast.success(`"${file.name}" başarıyla yüklendi!`)
    } catch (_) {}
  }

  // Handle Note Creation for this course
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.error('Lütfen not başlığı ve içeriği girin.')
      return
    }

    try {
      const allNotes = getStoredStudentNotes()
      const now = new Date()
      const dateStr = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'long' })} ${now.getFullYear()}`

      const newNote = {
        id: `note-${Date.now()}`,
        title: newNoteTitle.trim(),
        course: course.name,
        date: dateStr,
        content: newNoteContent.trim(),
      }

      const updated = [newNote, ...allNotes]
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_notes_updated', { detail: updated }))
      toast.success('Ders notunuz Defterim klasörüne kaydedildi!')
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowNoteForm(false)
      syncAll()
    } catch (_) {}
  }

  // Handle Note Delete
  const handleDeleteNote = (noteId: string) => {
    deleteBookNoteFromDefterim(noteId)
    toast.success('Not silindi.')
    syncAll()
  }

  // Open book at specific page from note
  const handleOpenBookAtPage = (bookId: number, pageNumber?: number) => {
    const foundBook = MEB_TEXTBOOKS_CATALOG.find((b) => b.id === bookId)
    if (foundBook) {
      setReaderInitialPage(pageNumber || 1)
      setReadingBook(foundBook)
    } else {
      toast.error('Kitap kataloğunda bulunamadı.')
    }
  }

  // Interactive Quiz questions mock for the course
  const sampleQuizQuestions = [
    {
      id: 'q1',
      question: `${course.name} dersi 1. ünite kazanımları ile ilgili temel soru: Aşağıdakilerden hangisi doğrudur?`,
      options: [
        { key: 'A', text: 'Öğrenilen temel kavramların düzenli tekrar edilmesi başarımı pekiştirir.' },
        { key: 'B', text: 'Ders kitapları sadece sınav günleri incelenmelidir.' },
        { key: 'C', text: 'Öğretmen anlatırken not tutmaya gerek yoktur.' },
      ],
      correct: 'A',
    },
    {
      id: 'q2',
      question: `Haftalık ders programına göre ${course.name} dersi nerede işlenmektedir?`,
      options: [
        { key: 'A', text: `${course.roomType}` },
        { key: 'B', text: 'Müdür Odası' },
        { key: 'C', text: 'Yemekhane' },
      ],
      correct: 'A',
    },
  ]

  const filteredMaterials = courseMaterials.filter((m) => {
    if (materialFilter === 'all') return true
    return m.type === materialFilter
  })

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── TOP BACK NAVIGATION ── */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Tüm Derslerime Geri Dön</span>
      </Link>

      {/* ── COURSE HERO BANNER (THEME MATCHED & RESPONSIVE) ── */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5 relative overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                {course.code}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40 dark:border-indigo-800/40">
                {profile.schoolName || 'Oxonom Okulları'}
              </span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>{profile.className} Şubesi</span>
                <span>•</span>
                <span>{profile.gradeLevel}</span>
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {course.name}
            </h1>

            {/* Course Description */}
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>

            {/* Progress Bar */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-500 dark:text-gray-400">Dönem Kazanım İlerlemesi</span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  %{progressPercent} ({completedTopicsCount}/{totalTopicsCount} Konu)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Teacher & Schedule Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2.5 shrink-0 min-w-[240px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                {course.teacherName.slice(0, 1)}
              </div>
              <div>
                <div className="text-xs font-black text-gray-900 dark:text-white">
                  {course.teacherName}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">{course.teacherBranch}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Clock size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-bold">Haftada {course.weeklyHours} Saat</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <MapPin size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{course.roomType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6 CATEGORICAL TABS SWITCHER ── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Müfredat Konuları ({course.topics.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ders Materyalleri ({courseMaterials.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sınavlar ve Notlar ({courseExams.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'books'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Müfredat Kitapları ({visibleBooks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Testler & Etkinlikler
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Notlarım ({courseNotes.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: MÜFREDAT KONULARI ── */}
      {activeTab === 'topics' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Haftalık Ders Kazanımları ve Konu İlerlemesi
            </h2>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {completedTopicsCount} / {totalTopicsCount} Tamamlandı
            </span>
          </div>

          <div className="space-y-2.5">
            {course.topics.map((topic) => (
              <div
                key={topic.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  topic.completed
                    ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-gray-900 dark:text-white'
                    : 'bg-gray-50 dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 text-gray-600 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {topic.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-gray-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight truncate">
                      {topic.title}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {topic.week}. Hafta Kazanımı · MEB Türkiye Yüzyılı Maarif Modeli
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    topic.completed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {topic.completed ? 'Tamamlandı' : 'İşlenecek'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: DERS MATERYALLERİ & DRAG-AND-DROP DOSYA SİSTEMİ ── */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Interactive Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFileUpload(e.dataTransfer.files)
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#131C31]/50 hover:border-cyan-500/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Çalışma veya Ödev Dosyası Yükle
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Dosyaları buraya sürükleyin veya seçmek için tıklayın (PDF, Word, Video)
              </p>
            </div>
          </div>

          {/* Filing System Filter Chips */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Ders Dosyaları & Paylaşılan Kaynaklar
              </h2>

              <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setMaterialFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'all'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Tümü ({courseMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('pdf')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'pdf'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  PDF Föyleri
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialFilter('doc')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    materialFilter === 'doc'
                      ? 'bg-white dark:bg-[#0E1526] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Çalışma Kağıtları
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredMaterials.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Bu filtreye uygun ders materyali bulunamadı.
                </div>
              ) : (
                filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        {mat.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>{mat.size}</span>
                          {mat.dateAdded && (
                            <>
                              <span>•</span>
                              <span>{mat.dateAdded}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(mat.title)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-cyan-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Download size={14} />
                      <span>İndir</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SINAVLAR VE NOTLAR ── */}
      {activeTab === 'assessments' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              {course.name} Sınavları, Değerlendirmeleri ve Öğretmen Notları
            </h2>
          </div>

          <div className="space-y-3">
            {courseExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Bu ders için planlanan veya girilen sınav kaydı bulunmamaktadır.
              </div>
            ) : (
              courseExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        {exam.date}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {exam.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({exam.examTypeLabel || 'Değerlendirme'})
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-3">
                      <span>Süre: {exam.durationMinutes} Dk</span>
                      <span>•</span>
                      <span>Yer: {exam.location}</span>
                      <span>•</span>
                      <span>Öğretmen: {exam.teacherName || course.teacherName}</span>
                    </div>

                    {exam.teacherFeedback && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200/60 dark:border-gray-800/60 mt-2">
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 italic">
                          "{exam.teacherFeedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {exam.isPublished && exam.score !== undefined ? (
                      <div className="space-y-1">
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {exam.score} / {exam.maxScore}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                          Değerlendirildi
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10">
                        Yaklaşan Sınav
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: MÜFREDAT KİTAPLARI (PDF OKUYUCU ENTEGRASYONU) ── */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">
                  MEB Resmi Ders Kitapları & Öğretim Materyalleri
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Öğretmeniniz veya okul idaresi tarafından erişime açılan resmî MEB ders kitapları listelenmektedir.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 shrink-0">
              {visibleBooks.length} Kitap Mevcut
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleBooks.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-gray-400 bg-white dark:bg-[#0E1526] rounded-3xl border border-gray-200 dark:border-gray-800">
                Bu ders için öğretmeniniz tarafından henüz erişime açılmış bir kitap bulunmamaktadır.
              </div>
            ) : (
              visibleBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between gap-4 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0 bg-gray-100 dark:bg-gray-800"
                      onError={(e) => {
                        ;(e.target as any).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }}
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                        {book.bookType} · {book.gradeLevel}. Sınıf
                      </span>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{book.publisher}</p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {book.curriculumModel}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReaderInitialPage(1)
                        setReadingBook(book)
                      }}
                      className="w-full h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen size={14} />
                      <span>Kitabı Aç & Oku</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: TESTLER & ETKİNLİKLER ── */}
      {activeTab === 'quizzes' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-600 dark:text-cyan-400" />
              {course.name} İnteraktif Pekiştirme ve Tarama Testi
            </h2>
            <p className="text-xs text-gray-400">
              Öğrendiğiniz kazanımları pekiştirmek için soruları yanıtlayın ve sonucunuzu görün.
            </p>
          </div>

          <div className="space-y-4">
            {sampleQuizQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-3"
              >
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  {idx + 1}. {q.question}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = quizAnswers[q.id] === opt.key
                    const isCorrect = opt.key === q.correct
                    let btnStyle = 'bg-white dark:bg-[#0E1526] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          if (quizSubmitted) return
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {opt.key}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {quizSubmitted && isCorrect && (
                          <Check size={16} className="text-emerald-500 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 flex items-center gap-3">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    if (Object.keys(quizAnswers).length < sampleQuizQuestions.length) {
                      toast.error('Lütfen tüm soruları yanıtlayınız.')
                      return
                    }
                    setQuizSubmitted(true)
                    toast.success('Test tamamlandı! Tebrikler.')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Testi Tamamla ve Puanımı Göster
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({})
                    setQuizSubmitted(false)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Tekrar Çöz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: NOTLARIM (KİTAP NOTLARI & DEFTERİM ENTEGRASYONU) ── */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {course.name} Ders Notlarım ve Kitap İçi Kayıtlarım
                </h2>
                <p className="text-xs text-gray-400">
                  Bu ders kapsamında aldığınız notlar ve e-kitap okuyucuda kaydettiğiniz sayfa notları burada toplanır.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>Yeni Not Ekle</span>
              </button>
            </div>

            {/* Note Creation Form */}
            {showNoteForm && (
              <form onSubmit={handleCreateNote} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 space-y-3">
                <input
                  type="text"
                  placeholder="Not Başlığı (Örn: Ritmik Sayma Kuralları Notum)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden"
                />
                <textarea
                  rows={3}
                  placeholder="Not içeriğinizi buraya yazın..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {courseNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  Bu ders için henüz bir not almadınız. Yukarıdaki "Yeni Not Ekle" butonuna basarak veya e-kitap okuyucuda sayfaya not ekleyerek buraya kaydedebilirsiniz.
                </div>
              ) : (
                courseNotes.map((note) => {
                  const isBookNote = !!note.bookId
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isBookNote ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <BookOpen size={11} />
                              Kitap Notu · Sayfa {note.pageNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                              Ders Notu
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                            {note.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400">{note.date}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors cursor-pointer"
                            title="Notu Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>

                      {isBookNote && (
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200/40 dark:border-gray-800/40">
                          <span className="text-[10px] text-gray-400 italic">
                            Kaynak: {note.bookTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenBookAtPage(note.bookId, note.pageNumber)}
                            className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Kitapta Sayfaya Git (s. {note.pageNumber})</span>
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN DISTRACTION-FREE MEB BOOK READER MODAL ── */}
      {readingBook && (
        <MobileBookReader
          book={readingBook}
          initialPage={readerInitialPage}
          onClose={() => {
            setReadingBook(null)
            setReaderInitialPage(undefined)
            syncAll()
          }}
        />
      )}
    </div>
  )
}
