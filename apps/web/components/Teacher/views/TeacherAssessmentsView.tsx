'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Save,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'
import { ALL_INITIAL_STUDENTS, MStudentItem, MStudentCourseGrade } from '@components/Mobile/MStudentClient'

interface CourseDef {
  code: string
  name: string
  teacher: string
}

const COURSES: CourseDef[] = [
  { code: 'ede', name: 'Türk Dili ve Edebiyatı', teacher: 'Ebru TEKNECİ' },
  { code: 'mat', name: 'Matematik', teacher: 'Ebru TEKNECİ' },
  { code: 'bil', name: 'Bilişim & Kodlama', teacher: 'Ebru TEKNECİ' },
  { code: 'ing', name: 'Yabancı Dil (İngilizce)', teacher: 'Yabancı Dil Zümresi' },
]

const EXAM_TYPES = [
  { id: 'exam1', label: '1. Yazılı Sınav', weight: '40%' },
  { id: 'exam2', label: '2. Yazılı Sınav', weight: '40%' },
  { id: 'performance', label: '1. Performans Görevi', weight: '20%' },
  { id: 'performance2', label: 'Ders İçi Katılım & Quiz', weight: 'Ek' },
]

export default function TeacherAssessmentsView() {
  const [selectedClass, setSelectedClass] = useState('9-A Şubesi')
  const [selectedCourse, setSelectedCourse] = useState('Türk Dili ve Edebiyatı')
  const [selectedExamType, setSelectedExamType] = useState<'exam1' | 'exam2' | 'performance' | 'performance2'>('exam1')
  const [examDate, setExamDate] = useState('2026-10-12')

  // Local student state with grade persistence
  const [students, setStudents] = useState<MStudentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_m_students_v3')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return ALL_INITIAL_STUDENTS
  })

  // Temporary grades input map: studentId -> score (string/number)
  const [inputScores, setInputScores] = useState<Record<string, number | string>>({})

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass === '9-A Şubesi' || selectedClass === '9-A') {
        return s.className === '9-A Şubesi' || s.className.startsWith('9-A')
      }
      return s.className === selectedClass
    })
  }, [students, selectedClass])

  // Initialize inputs when class, course, or exam type changes
  useEffect(() => {
    const scores: Record<string, number | string> = {}
    classStudents.forEach((st) => {
      const courseGrade = st.grades?.find((g) => g.courseName === selectedCourse)
      if (courseGrade) {
        if (selectedExamType === 'exam1') scores[st.id] = courseGrade.exam1 ?? ''
        else if (selectedExamType === 'exam2') scores[st.id] = courseGrade.exam2 ?? ''
        else if (selectedExamType === 'performance') scores[st.id] = courseGrade.performance ?? ''
        else scores[st.id] = 100
      } else {
        scores[st.id] = ''
      }
    })
    setInputScores(scores)
  }, [classStudents, selectedCourse, selectedExamType])

  const handleScoreChange = (studentId: string, val: string) => {
    if (val === '') {
      setInputScores((prev) => ({ ...prev, [studentId]: '' }))
      return
    }
    const num = Number(val)
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setInputScores((prev) => ({ ...prev, [studentId]: num }))
    }
  }

  const setQuickScore = (studentId: string, score: number) => {
    setInputScores((prev) => ({ ...prev, [studentId]: score }))
    toast.success(`${score} puan atandı`, { duration: 1200 })
  }

  // Save all entered scores and persist to student record
  const handleSaveGrades = () => {
    let savedCount = 0
    const updatedStudents = students.map((st) => {
      if (!classStudents.some((cs) => cs.id === st.id)) return st

      const rawScore = inputScores[st.id]
      if (rawScore === '' || rawScore === undefined) return st

      const numScore = Number(rawScore)
      const existingGrades = [...(st.grades || [])]
      const courseIndex = existingGrades.findIndex((g) => g.courseName === selectedCourse)

      if (courseIndex >= 0) {
        const current = existingGrades[courseIndex]
        const updatedCourse = { ...current }
        if (selectedExamType === 'exam1') updatedCourse.exam1 = numScore
        else if (selectedExamType === 'exam2') updatedCourse.exam2 = numScore
        else if (selectedExamType === 'performance') updatedCourse.performance = numScore

        // Recalculate average
        const e1 = updatedCourse.exam1 || 0
        const e2 = updatedCourse.exam2 || e1
        const perf = updatedCourse.performance || e1
        updatedCourse.average = Number(((e1 * 0.4) + (e2 * 0.4) + (perf * 0.2)).toFixed(1))

        existingGrades[courseIndex] = updatedCourse
      } else {
        existingGrades.push({
          courseName: selectedCourse,
          teacherName: 'Ebru TEKNECİ',
          exam1: selectedExamType === 'exam1' ? numScore : 0,
          exam2: selectedExamType === 'exam2' ? numScore : 0,
          performance: selectedExamType === 'performance' ? numScore : 0,
          average: numScore,
        })
      }

      // Recalculate overall GPA
      const totalAvg = existingGrades.reduce((sum, g) => sum + (g.average || 0), 0)
      const newGpa = Number((totalAvg / existingGrades.length).toFixed(1))

      savedCount++
      return {
        ...st,
        grades: existingGrades,
        gpa: newGpa,
      }
    })

    setStudents(updatedStudents)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_m_students_v3', JSON.stringify(updatedStudents))
        window.dispatchEvent(new CustomEvent('oxonom_student_updated'))
      } catch (_) {}
    }

    toast.success(
      `🎉 ${selectedCourse} — ${EXAM_TYPES.find((e) => e.id === selectedExamType)?.label} notları öğrenci dosyasına başarıyla kaydedildi!`
    )
  }

  // Active student for detailed academic report view
  const primaryStudent = classStudents[0] || ALL_INITIAL_STUDENTS[0]

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Award size={15} />
            <span>Ölçme, Değerlendirme & Hızlı Not Girişi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınavlar ve Notlar
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınav tipini belirleyin, öğrencilerinize hızlıca not girin ve akademik karneye anında işleyin
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveGrades}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Save size={16} />
          <span>Notları Kaydet & Dosyaya İşle</span>
        </button>
      </div>

      {/* ── CONTROLS: CLASS, COURSE & EXAM TYPE SELECTOR ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl shadow-xs">
        {/* 1. Sınıf Seçimi */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 block">
            1. Sınıf Seçimi:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="9-A Şubesi">9-A Şubesi (Rehberlik Şubesi)</option>
            <option value="9-B Şubesi">9-B Şubesi</option>
            <option value="1-A Şubesi">1-A Şubesi</option>
          </select>
        </div>

        {/* 2. Ders Seçimi */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 block">
            2. Ders Seçimi:
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {COURSES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Sınav Tipi Seçimi (a maddesi) */}
        <div>
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 block">
            3. Sınav & Değerlendirme Tipi:
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value as any)}
            className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {EXAM_TYPES.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.label} ({ex.weight})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── B & C: ÖĞRENCİLER LİSTESİ VE PRATİK NOT GİRİŞİ ── */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>{selectedClass} — {selectedCourse}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold">
                {EXAM_TYPES.find((e) => e.id === selectedExamType)?.label}
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Not alanına sayı girin veya hızlı puan butonlarına dokunun.
            </p>
          </div>

          <span className="text-xs font-bold text-gray-500">
            {classStudents.length} Öğrenci
          </span>
        </div>

        {classStudents.length > 0 ? (
          <div className="space-y-3">
            {classStudents.map((st, idx) => {
              const currentScore = inputScores[st.id] ?? ''
              const courseGrade = st.grades?.find((g) => g.courseName === selectedCourse)

              return (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 font-mono">#{idx + 1}</span>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                          {st.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                          Genel Ort: {st.gpa}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        Okul No: {st.studentNo} • T.C.: {st.tcNo}
                      </div>
                    </div>
                  </div>

                  {/* Input Score & Quick Assign */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Quick Points */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[100, 95, 90, 85, 75].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setQuickScore(st.id, score)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            currentScore === score
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>

                    {/* Numeric Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentScore}
                          onChange={(e) => handleScoreChange(st.id, e.target.value)}
                          placeholder="0-100"
                          className="w-20 h-11 text-center rounded-xl bg-white dark:bg-[#0E1526] text-sm font-black text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800 focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-400">/ 100</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-xs">
            Seçilen şubede henüz kayıtlı öğrenci bulunmuyor.
          </div>
        )}
      </div>

      {/* ── ÖĞRENCİ DOSYASINDAKİ AKADEMİK NOTLAR (KATEGORİSEL & GRAFİKSEL STİL) ── */}
      {primaryStudent && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider mb-1">
                <BarChart2 size={15} />
                <span>Öğrenci Dosyası • Akademik Başarı ve Trend Analizi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {primaryStudent.name} — Akademik Performans Karnesi
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                Genel Ortalama: {primaryStudent.gpa}
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                Sınıf Derecesi: 1 / 30
              </span>
            </div>
          </div>

          {/* Kategorisel ve Grafiksel Ders Dağılımı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(primaryStudent.grades || []).map((grade, idx) => {
              const diff = (grade.exam2 || grade.exam1) - (grade.exam1 || 0)
              const isUp = diff >= 0

              return (
                <div
                  key={idx}
                  className="p-4.5 rounded-2xl bg-gray-50/70 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                        {grade.courseName}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        Öğretmen: {grade.teacherName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Trend Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 ${
                          isUp
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        <span>{isUp ? `+${diff}` : diff} Puan</span>
                      </span>

                      <span className="text-base font-black text-gray-900 dark:text-white">
                        {grade.average}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (Grafiksel) */}
                  <div className="space-y-1">
                    <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, grade.average || 0)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          grade.average >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : grade.average >= 70
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Sınav Kırılımı */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400 block text-[9px] font-bold">1. Sınav</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{grade.exam1}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400 block text-[9px] font-bold">2. Sınav</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{grade.exam2}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-400 block text-[9px] font-bold">Performans</span>
                      <span className="font-extrabold text-gray-900 dark:text-white">{grade.performance}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              * Notlar MEB 100'lük değerlendirme ölçeğine ve ağırlıklı ortalamaya göre hesaplanmaktadır.
            </span>
            <Link
              href="/teacher/classes?class=9-A"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Öğrenci Dosyasını Tam Aç</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
