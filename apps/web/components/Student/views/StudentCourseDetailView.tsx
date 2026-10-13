'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import {
  STUDENT_COURSES,
  getSynchronizedStudentCourses,
  getSynchronizedStudentAssessments,
  type StudentCourse,
  type StudentAssessment,
} from '@/lib/student/studentData'
import toast from 'react-hot-toast'

interface StudentCourseDetailViewProps {
  courseId: string
}

export default function StudentCourseDetailView({ courseId }: StudentCourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'materials' | 'assessments'>('topics')
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])

  React.useEffect(() => {
    const sync = () => {
      setCourses(getSynchronizedStudentCourses())
      setAssessments(getSynchronizedStudentAssessments())
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const course = courses.find((c) => c.id === courseId) || courses[0] || STUDENT_COURSES[0]
  const courseExams = assessments.filter((a) => a.courseName === course.name)

  const handleDownload = (materialTitle: string) => {
    toast.success(`"${materialTitle}" başarıyla indiriliyor...`)
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top back navigation */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Derslerime Geri Dön</span>
      </Link>

      {/* Course Hero Banner */}
      <div className="p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                {course.code}
              </span>
              <span className="text-xs text-gray-400 font-semibold">{course.classroom} Şubesi</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {course.name}
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Teacher box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
              {course.teacherName.slice(0, 1)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                {course.teacherName}
              </div>
              <div className="text-[10px] text-gray-400">{course.teacherBranch}</div>
              <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {course.roomType} · Haftada {course.weeklyHours} Saat
              </div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Müfredat & Konular ({course.topics.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Ders Materyalleri ({course.materials.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Sınavlar & Notlar ({courseExams.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Topics / Syllabus */}
      {activeTab === 'topics' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">
            Haftalık Ders Kazanımları ve Konu İlerlemesi
          </h2>
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
                      {topic.week}. Hafta Kazanımı
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

      {/* Tab 2: Materials */}
      {activeTab === 'materials' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">
            Öğretmen Tarafından Paylaşılan Kaynaklar
          </h2>
          <div className="space-y-2.5">
            {course.materials.map((mat) => (
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
                    <div className="text-[10px] text-gray-400 mt-0.5">{mat.size}</div>
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
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Assessments */}
      {activeTab === 'assessments' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">
            {course.name} Sınavları ve Değerlendirmeleri
          </h2>
          <div className="space-y-2.5">
            {courseExams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      {exam.date}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {exam.title}
                    </span>
                  </div>
                  {exam.teacherFeedback && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                      "{exam.teacherFeedback}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {exam.isPublished && exam.score !== undefined ? (
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {exam.score} / {exam.maxScore}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Yakında
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
