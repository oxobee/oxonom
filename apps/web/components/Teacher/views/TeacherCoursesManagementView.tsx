'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  GraduationCap,
  MessageSquare,
  Send,
  Save,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { MEB_TEXTBOOKS_CATALOG, type MebBookItem } from '@/lib/student/mebBooksData'
import {
  STUDENT_COURSES,
  GRADE_1_COURSES,
  type StudentCourse,
  type StudentAssessment,
  getSynchronizedStudentAssessments,
  getSynchronizedStudentProfile,
} from '@/lib/student/studentData'

const CLASS_OPTIONS = [
  '1/A', '1/B', '1/C', '1/D',
  '2/A', '2/B', '2/C', '2/D',
  '3/A', '3/B', '3/C', '3/D',
  '4/A', '4/B', '4/C', '4/D',
  '5/A', '5/B', '5/C', '5/D',
  '6/A', '6/B', '6/C', '6/D',
  '7/A', '7/B', '7/C', '7/D',
  '8/A', '8/B', '8/C', '8/D',
]

interface CustomMaterial {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'video'
  size: string
  target: 'all' | 'individual'
  studentName?: string
  dateAdded: string
  description?: string
}

export default function TeacherCoursesManagementView() {
  const [selectedClass, setSelectedClass] = useState<string>('1/A')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('turkce')
  const [activeTab, setActiveTab] = useState<'books' | 'materials' | 'exams' | 'notes'>('books')

  // Teacher hidden books state
  const [hiddenBookIds, setHiddenBookIds] = useState<number[]>([])

  // Course materials state
  const [materials, setMaterials] = useState<CustomMaterial[]>([])
  const [newMatTitle, setNewMatTitle] = useState('')
  const [newMatType, setNewMatType] = useState<'pdf' | 'doc' | 'video'>('pdf')
  const [newMatTarget, setNewMatTarget] = useState<'all' | 'individual'>('all')
  const [newMatDesc, setNewMatDesc] = useState('')

  // Sınav ve Not Girişi State
  const [examTitle, setExamTitle] = useState('')
  const [examType, setExamType] = useState<'exam' | 'quiz' | 'performance'>('exam')
  const [examDate, setExamDate] = useState('25 Ekim 2026')
  const [studentScore, setStudentScore] = useState<string>('100')
  const [teacherFeedback, setTeacherFeedback] = useState<string>('Konu kazanımlarında üstün başarı gösterdi.')

  // Duyuru / Rehberlik Notu
  const [guidanceText, setGuidanceText] = useState('')

  // Load teacher hidden books
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_teacher_hidden_books')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setHiddenBookIds(parsed)
        }
      } catch (_) {}
    }
  }, [])

  // Load course materials when selectedCourseId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`oxonom_course_materials_${selectedCourseId}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setMaterials(parsed)
            return
          }
        }
      } catch (_) {}
    }

    // Default seed for 1. Sınıf selected course
    const crs = GRADE_1_COURSES.find((c) => c.id === selectedCourseId)
    if (crs && crs.materials) {
      setMaterials(
        crs.materials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          size: m.size,
          target: 'all',
          dateAdded: '12 Ekim 2026',
        }))
      )
    } else {
      setMaterials([])
    }
  }, [selectedCourseId])

  const selectedCourse =
    GRADE_1_COURSES.find((c) => c.id === selectedCourseId) || GRADE_1_COURSES[0]

  // Filter MEB textbooks for this grade and course
  const gradeLevel = parseInt(selectedClass.charAt(0)) || 1
  const availableBooks = MEB_TEXTBOOKS_CATALOG.filter((book) => {
    if (book.gradeLevel !== gradeLevel) return false
    const normCourse = selectedCourse.name.toLowerCase()
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

  // Toggle book visibility
  const toggleBookVisibility = (bookId: number, bookTitle: string) => {
    let updated: number[]
    const isCurrentlyHidden = hiddenBookIds.includes(bookId)
    if (isCurrentlyHidden) {
      updated = hiddenBookIds.filter((id) => id !== bookId)
      toast.success(`"${bookTitle}" öğrencilere görünür yapıldı.`)
    } else {
      updated = [...hiddenBookIds, bookId]
      toast.success(`"${bookTitle}" öğrencilerden gizlendi.`)
    }
    setHiddenBookIds(updated)
    try {
      localStorage.setItem('oxonom_teacher_hidden_books', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_teacher_hidden_books_updated', { detail: updated }))
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'oxonom_teacher_hidden_books' } }))
    } catch (_) {}
  }

  // Add new material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMatTitle.trim()) {
      toast.error('Lütfen materyal başlığı girin.')
      return
    }

    const newMat: CustomMaterial = {
      id: `mat-${Date.now()}`,
      title: newMatTitle.trim(),
      type: newMatType,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      target: newMatTarget,
      studentName: newMatTarget === 'individual' ? 'Erçil UĞURLU (No: 101)' : undefined,
      dateAdded: new Date().toLocaleDateString('tr-TR'),
      description: newMatDesc.trim() || undefined,
    }

    const updated = [newMat, ...materials]
    setMaterials(updated)
    try {
      localStorage.setItem(`oxonom_course_materials_${selectedCourseId}`, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      toast.success('Ders materyali başarıyla eklendi ve öğrencilere yayınlandı!')
    } catch (_) {}

    setNewMatTitle('')
    setNewMatDesc('')
  }

  // Delete material
  const handleDeleteMaterial = (id: string, title: string) => {
    const updated = materials.filter((m) => m.id !== id)
    setMaterials(updated)
    try {
      localStorage.setItem(`oxonom_course_materials_${selectedCourseId}`, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      toast.success(`"${title}" silindi.`)
    } catch (_) {}
  }

  // Save student exam grade
  const handleSaveExamGrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!examTitle.trim()) {
      toast.error('Lütfen sınav veya değerlendirme başlığı girin.')
      return
    }

    const scoreNum = Number(studentScore)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error('Not 0 ile 100 arasında olmalıdır.')
      return
    }

    // Save into oxonom_school_exams
    try {
      const rawExams = localStorage.getItem('oxonom_school_exams')
      const examsList = rawExams ? JSON.parse(rawExams) : []

      const newExam = {
        id: `exam-${Date.now()}`,
        title: examTitle.trim(),
        courseName: selectedCourse.name,
        className: selectedClass,
        date: examDate,
        time: '09:25 - 10:05',
        type: examType,
        maxScore: 100,
        scores: {
          's-1': scoreNum,
          '101': scoreNum,
        },
        teacherName: 'Özlem ZOR',
        teacherFeedback: teacherFeedback.trim(),
      }

      const updatedExams = [newExam, ...examsList]
      localStorage.setItem('oxonom_school_exams', JSON.stringify(updatedExams))

      // Also update student profile grades in oxonom_m_students_v3
      const rawStudents = localStorage.getItem('oxonom_m_students_v3')
      if (rawStudents) {
        const parsed = JSON.parse(rawStudents)
        if (Array.isArray(parsed)) {
          const student = parsed.find((s: any) => s.id === 's-1' || s.studentNo === '101')
          if (student) {
            if (!student.grades) student.grades = []
            const existingGradeIdx = student.grades.findIndex((g: any) => g.courseName === selectedCourse.name)
            if (existingGradeIdx >= 0) {
              student.grades[existingGradeIdx].exam1 = scoreNum
              student.grades[existingGradeIdx].average = scoreNum
            } else {
              student.grades.push({
                courseId: selectedCourse.id,
                courseName: selectedCourse.name,
                exam1: scoreNum,
                average: scoreNum,
                teacherName: 'Özlem ZOR',
              })
            }
            localStorage.setItem('oxonom_m_students_v3', JSON.stringify(parsed))
          }
        }
      }

      window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'oxonom_school_exams' } }))
      toast.success(`${selectedCourse.name} değerlendirme notu (${scoreNum}/100) Erçil Uğurlu dosyasına işlendi!`)
      setExamTitle('')
    } catch (err) {
      toast.error('Not kaydedilirken bir hata oluştu.')
    }
  }

  // Add guidance note for student
  const handleAddGuidanceNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guidanceText.trim()) return

    try {
      const rawStudents = localStorage.getItem('oxonom_m_students_v3')
      if (rawStudents) {
        const parsed = JSON.parse(rawStudents)
        const student = parsed.find((s: any) => s.id === 's-1' || s.studentNo === '101')
        if (student) {
          if (!student.guidanceNotes) student.guidanceNotes = []
          student.guidanceNotes.unshift({
            id: `gn-${Date.now()}`,
            date: new Date().toLocaleDateString('tr-TR'),
            author: 'Özlem ZOR (1/A Sınıf Öğretmeni)',
            content: guidanceText.trim(),
          })
          localStorage.setItem('oxonom_m_students_v3', JSON.stringify(parsed))
          window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
          toast.success('Pedagojik ders ve rehberlik notu kaydedildi.')
          setGuidanceText('')
        }
      }
    } catch (_) {}
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center gap-1.5">
                <BookOpen size={12} />
                Öğretmen Yönetim Portalı
              </span>
              <span className="text-xs text-gray-400 font-semibold">Oxonom Okulları</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Öğrenci Dersleri & İçerik Yönetimi
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
              Öğrencinin "Derslerim" ekranında gördüğü müfredat kitaplarının görünürlüğünü ayarlayın, sınıfa ve bireysel öğrencilere çalışma materyalleri yükleyin, sınav ve değerlendirme notlarını sisteme işleyin.
            </p>
          </div>

          {/* Quick Selection Box */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 shrink-0">
            {/* Sınıf / Şube Seçici */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Sınıf & Şube
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-black text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} Şubesi {cls === '1/A' ? '(Kayıtlı Öğrenci)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Ders Seçici */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Yönetilen Ders
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-black text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {GRADE_1_COURSES.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Class & Course Info Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
              {selectedClass} Şubesi · {selectedClass === '1/A' ? '1 Kayıtlı Öğrenci (Erçil Uğurlu)' : '0 Öğrenci'}
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-gray-600 dark:text-gray-300">
              Ders: <strong>{selectedCourse.name}</strong> ({selectedCourse.roomType} · Haftada {selectedCourse.weeklyHours} Saat)
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-gray-600 dark:text-gray-300">
              Öğretmen: <strong>{selectedCourse.teacherName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
              {availableBooks.length} Müfredat Kitabı
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200/60 dark:border-cyan-800/60">
              {materials.length} Paylaşılan Materyal
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'books'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Müfredat Kitapları & Görünürlük ({availableBooks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload size={14} />
            <span>Ders Materyali Ekle & Dosyalar ({materials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Award size={14} />
            <span>Sınav / Test Hazırlama & Not Girişi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>Ders Duyurusu & Rehberlik</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: MEB TEXTBOOKS VISIBILITY TOGGLE ── */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">
                  Öğrenci Müfredat Kitapları Görünürlük Kontrolü
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Aşağıdaki listeden dilediğiniz kitabın yanındaki butona tıklayarak öğrencinin ders detayında o kitabı görüp göremeyeceğini tek tıkla belirleyebilirsiniz.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {availableBooks.filter((b) => !hiddenBookIds.includes(b.id)).length} Açık / {availableBooks.length} Kitap
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBooks.map((book) => {
              const isHidden = hiddenBookIds.includes(book.id)
              return (
                <div
                  key={book.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    isHidden
                      ? 'bg-gray-100/70 dark:bg-gray-900/60 border-gray-300 dark:border-gray-800 opacity-60'
                      : 'bg-white dark:bg-[#0E1526] border-gray-200/80 dark:border-gray-800/80 shadow-xs'
                  }`}
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
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
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
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        isHidden ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff size={12} />
                          <span>Öğrenciye Gizli</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>Öğrenciye Açık</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBookVisibility(book.id, book.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isHidden
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <Eye size={13} />
                          <span>Göster (Aç)</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} />
                          <span>Gizle</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: COURSE MATERIALS ADD & MANAGE ── */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Add Material */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Upload size={16} className="text-indigo-600 dark:text-indigo-400" />
                Yeni Ders Materyali Ekle
              </h3>
              <p className="text-xs text-gray-400">
                Öğrencilerin "Ders Materyalleri" sekmesinde indirebileceği dosya ve çalışma kağıtları ekleyin.
              </p>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Hedef Kitle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMatTarget('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      newMatTarget === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Tüm {selectedClass} Şubesi
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMatTarget('individual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      newMatTarget === 'individual'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Bireysel (Erçil U.)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Materyal Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 1. Hafta Ses ve Hece Çalışma Föyü (PDF)"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Dosya Formatı
                  </label>
                  <select
                    value={newMatType}
                    onChange={(e) => setNewMatType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="pdf">PDF Dokümanı</option>
                    <option value="doc">Word / Doküman</option>
                    <option value="video">Ders Videosu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    İlgili Ders
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedCourse.name}
                    className="w-full h-10 px-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Öğretmen Açıklaması / Talimatı
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Dersten önce çıktı alıp etkinlikleri tamamlayınız."
                  value={newMatDesc}
                  onChange={(e) => setNewMatDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Materyali Yayınla</span>
              </button>
            </form>
          </div>

          {/* Right: Published Materials List */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  Yayınlanan Materyaller ({materials.length})
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedClass} şubesindeki öğrenciler bu dokümanlara doğrudan erişebilir.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {materials.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  Bu ders için henüz materyal eklenmedi. Soldaki formu kullanarak ilk materyali ekleyebilirsiniz.
                </div>
              ) : (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span>{mat.size}</span>
                          <span>•</span>
                          <span>{mat.dateAdded}</span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {mat.target === 'individual' ? 'Bireysel (Erçil U.)' : 'Tüm Şube'}
                          </span>
                        </div>
                        {mat.description && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 italic">
                            "{mat.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                      className="w-8 h-8 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Materyali Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: EXAM / ASSESSMENT PREPARATION & GRADE ENTRY ── */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Exam / Assessment */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
                Sınav & Değerlendirme Notu Girişi
              </h3>
              <p className="text-xs text-gray-400">
                {selectedClass} şubesindeki öğrenciye {selectedCourse.name} dersi için sınav, quiz veya performans notu verin.
              </p>
            </div>

            <form onSubmit={handleSaveExamGrade} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Değerlendirme Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 1. Değerlendirme (İlk Okuma & Ses Bilgisi)"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Değerlendirme Türü
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="exam">Yazılı / Değerlendirme</option>
                    <option value="quiz">Tarama Testi (Quiz)</option>
                    <option value="performance">Performans / Proje</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tarih
                  </label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Student Row */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      E
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        Erçil UĞURLU (No: 101)
                      </div>
                      <div className="text-[10px] text-gray-400">1/A Şubesi · Kayıtlı Öğrenci</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500">Not (0-100):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={studentScore}
                      onChange={(e) => setStudentScore(e.target.value)}
                      className="w-16 h-9 px-2 text-center rounded-xl bg-white dark:bg-[#0E1526] border border-gray-300 dark:border-gray-700 text-xs font-black text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Öğretmen Geri Bildirimi / Karne Notu
                  </label>
                  <input
                    type="text"
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                    placeholder="Öğrenciye ve veliye yansıyacak değerlendirme notu"
                    className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-300 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Save size={16} />
                <span>Notu Kaydet ve Öğrenciye Yayınla</span>
              </button>
            </form>
          </div>

          {/* Current Live Grades in System */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              Aktif Not Çizelgesi (Erçil Uğurlu · 1/A)
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Türkçe İlk Okuma Değerlendirmesi
                  </div>
                  <div className="text-[10px] text-gray-400">16 Ekim 2026 · Yazılı Sınav</div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 italic mt-1">
                    "Harika ses tanıma ve heceleme becerisi. Tebrikler!"
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">100 / 100</div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Sisteme İşlendi
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Matematik 1-20 Ritmik Sayma & Şekiller
                  </div>
                  <div className="text-[10px] text-gray-400">20 Ekim 2026 · Yazılı Sınav</div>
                  <p className="text-[11px] text-gray-500 italic mt-1">
                    "Ritmik sayma ve şekil eşleştirmede üstün başarı."
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">98 / 100</div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Sisteme İşlendi
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Hayat Bilgisi Okulumuzda Hayat Performansı
                  </div>
                  <div className="text-[10px] text-gray-400">24 Ekim 2026 · Performans Çalışması</div>
                  <p className="text-[11px] text-gray-500 italic mt-1">
                    "Sınıf kurallarına uyum ve arkadaşlık ilişkilerinde örnek davranış."
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">98 / 100</div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    Sisteme İşlendi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: GUIDANCE & LESSON ANNOUNCEMENTS ── */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
              Ders Duyurusu & Pedagojik Rehberlik Notu
            </h3>
            <p className="text-xs text-gray-400">
              Bu ders kapsamında öğrencinin profiline ve velisine iletilecek pedagojik gözlem veya ders duyurusu yazın.
            </p>
          </div>

          <form onSubmit={handleAddGuidanceNote} className="space-y-3.5">
            <textarea
              rows={4}
              placeholder="Örn: İlk okuma çalışmalarında sesleri birleştirme becerisi gayet başarılı. Evde günlük 15 dakika ses kartı tekrarı yapılması pekiştirecektir."
              value={guidanceText}
              onChange={(e) => setGuidanceText(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Send size={15} />
              <span>Gelişim Notunu Kaydet</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
