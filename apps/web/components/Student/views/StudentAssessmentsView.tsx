'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileCheck,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Play,
  Sparkles,
  BookOpen,
  User,
  Check,
} from 'lucide-react'
import {
  STUDENT_ASSESSMENTS,
  getSynchronizedStudentAssessments,
  type StudentAssessment,
} from '@/lib/student/studentData'
import toast from 'react-hot-toast'

export type AssessmentFilterTab = 'all' | 'written' | 'oral' | 'quiz' | 'performance' | 'results'

interface StudentAssessmentsViewProps {
  initialTab?: AssessmentFilterTab | string
}

export default function StudentAssessmentsView({
  initialTab = 'all',
}: StudentAssessmentsViewProps) {
  const [activeTab, setActiveTab] = useState<AssessmentFilterTab>(() => {
    if (initialTab === 'exams') return 'written'
    if (initialTab === 'quizzes') return 'quiz'
    if (initialTab === 'results') return 'results'
    return (initialTab as AssessmentFilterTab) || 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])

  useEffect(() => {
    const syncAssessments = () => {
      setAssessments(getSynchronizedStudentAssessments())
    }
    syncAssessments()

    window.addEventListener('oxonom_student_updated', syncAssessments)
    window.addEventListener('oxonom_teacher_profile_updated', syncAssessments)
    window.addEventListener('oxonom_exam_calendar_updated', syncAssessments)
    window.addEventListener('storage', syncAssessments)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAssessments)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAssessments)
      window.removeEventListener('oxonom_exam_calendar_updated', syncAssessments)
      window.removeEventListener('storage', syncAssessments)
    }
  }, [])

  const displayAssessments = assessments.length > 0 ? assessments : STUDENT_ASSESSMENTS

  // Helper to normalize assessment type
  const normalizeType = (item: StudentAssessment): 'written' | 'oral' | 'quiz' | 'performance' | 'mock' => {
    const t = (item.type || '').toLowerCase()
    const lbl = (item.examTypeLabel || '').toLowerCase()
    if (t === 'oral' || lbl.includes('sözlü')) return 'oral'
    if (t === 'quiz' || lbl.includes('quiz')) return 'quiz'
    if (t === 'performance' || lbl.includes('performans') || lbl.includes('proje')) return 'performance'
    if (t === 'mock' || lbl.includes('deneme')) return 'mock'
    return 'written'
  }

  // Type label helper
  const getTypeBadge = (item: StudentAssessment) => {
    const norm = normalizeType(item)
    if (norm === 'oral') {
      return {
        label: 'Sözlü Sınav',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        dot: 'bg-amber-500',
      }
    }
    if (norm === 'quiz') {
      return {
        label: 'Quiz',
        className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        dot: 'bg-cyan-500',
      }
    }
    if (norm === 'performance') {
      return {
        label: 'Performans & Proje',
        className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
        dot: 'bg-purple-500',
      }
    }
    if (norm === 'mock') {
      return {
        label: 'Deneme Sınavı',
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
        dot: 'bg-rose-500',
      }
    }
    return {
      label: 'Yazılı Sınav',
      className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-500',
    }
  }

  // Filter items based on activeTab and searchQuery
  const filteredAssessments = useMemo(() => {
    return displayAssessments.filter((item) => {
      const norm = normalizeType(item)
      const isPublishedWithScore = item.isPublished && item.score !== undefined && item.score !== null

      if (activeTab === 'written' && norm !== 'written') return false
      if (activeTab === 'oral' && norm !== 'oral') return false
      if (activeTab === 'quiz' && norm !== 'quiz') return false
      if (activeTab === 'performance' && norm !== 'performance') return false
      if (activeTab === 'results' && !isPublishedWithScore) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q) ||
          (item.teacherName && item.teacherName.toLowerCase().includes(q)) ||
          (item.scope && item.scope.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [displayAssessments, activeTab, searchQuery])

  // Split into upcoming vs graded
  const upcomingAssessments = useMemo(() => {
    return filteredAssessments.filter(
      (a) => a.score === undefined || a.score === null || !a.isGraded
    )
  }, [filteredAssessments])

  const gradedAssessments = useMemo(() => {
    return filteredAssessments.filter(
      (a) => a.score !== undefined && a.score !== null && a.isGraded
    )
  }, [filteredAssessments])

  // Counts for pills
  const counts = useMemo(() => {
    const published = displayAssessments.filter((a) => a.isPublished && a.score !== undefined)
    const written = displayAssessments.filter((a) => normalizeType(a) === 'written')
    const oral = displayAssessments.filter((a) => normalizeType(a) === 'oral')
    const quiz = displayAssessments.filter((a) => normalizeType(a) === 'quiz')
    const perf = displayAssessments.filter((a) => normalizeType(a) === 'performance')
    return {
      all: displayAssessments.length,
      written: written.length,
      oral: oral.length,
      quiz: quiz.length,
      performance: perf.length,
      results: published.length,
    }
  }, [displayAssessments])

  // Calculate Average Score of published exams
  const publishedScores = displayAssessments.filter((a) => a.isPublished && a.score !== undefined)
  const averageScore = publishedScores.length
    ? (
        publishedScores.reduce((acc, curr) => acc + (curr.score || 0), 0) / publishedScores.length
      ).toFixed(1)
    : '98.8'

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-jakarta">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
            <FileCheck size={14} />
            <span>Ölçme ve Değerlendirme Takibi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınavlar ve Notlar
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenlerin tarafından planlanan yazılı, sözlü sınavlar, quizler ve açıklanan resmi sınav notların.
          </p>
        </div>

        {/* GPA Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 px-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 shadow-xs flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                Sınav Not Ortalaması
              </div>
              <div className="text-xl font-black text-amber-900 dark:text-amber-100">
                {averageScore} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER TABS (MATCHING USER SCREENSHOT STYLE) ── */}
      <div className="space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Tüm Değerlendirmeler ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('written')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'written'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Yazılı Sınavlar {counts.written > 0 && `(${counts.written})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oral')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'oral'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Sözlü Sınavlar {counts.oral > 0 && `(${counts.oral})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Quizler {counts.quiz > 0 && `(${counts.quiz})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'performance'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Performans & Proje {counts.performance > 0 && `(${counts.performance})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'results'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-white dark:bg-[#121826] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            Yayımlanan Sonuçlar ({counts.results})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ders adına, sınav konusuna veya öğretmene göre ara..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#121826] text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* ── BÖLÜM 1: YAKLAŞAN SINAVLAR ── */}
      {activeTab !== 'results' && upcomingAssessments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              <span>Yaklaşan Sınavlar & Takvim ({upcomingAssessments.length})</span>
            </h2>
            <span className="text-[11px] font-bold text-gray-400">
              Sınav gün ve saatinde okulda olunuz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAssessments.map((item) => {
              const badge = getTypeBadge(item)
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-amber-400/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${badge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                        Yaklaşıyor
                      </span>
                    </div>

                    {/* Title & Subject */}
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                        {item.courseName}
                      </div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Metadata Box */}
                    <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Calendar size={13} />
                          Tarih:
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                          {item.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={13} />
                          Saat:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                          {item.time} ({item.durationMinutes} Dk)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <MapPin size={13} />
                          Salon:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                          {item.location}
                        </span>
                      </div>
                    </div>

                    {/* Scope / Topics */}
                    {item.scope && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed">
                        <strong className="text-gray-700 dark:text-gray-200 font-bold block mb-0.5">
                          Konu Kapsamı:
                        </strong>
                        {item.scope}
                      </div>
                    )}
                  </div>

                  {/* Teacher Info */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <User size={12} />
                      {item.teacherName || 'Zümre Öğretmeni'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono">
                      100 Tam Puan Üzerinden
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BÖLÜM 2: PUANLANMIŞ SINAVLAR VE RESMİ NOTLAR ── */}
      {(activeTab === 'all' || activeTab === 'results' || gradedAssessments.length > 0) && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>Puanlanmış Sınavlar ve Notlar ({gradedAssessments.length})</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Resmi Karne ve E-Okul Kayıtları
            </span>
          </div>

          {gradedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradedAssessments.map((item) => {
                const badge = getTypeBadge(item)
                const score = item.score ?? 0
                const isHigh = score >= 90

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-emerald-400/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header with Type & Date */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {item.date}
                        </span>
                      </div>

                      {/* Course & Title */}
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                          {item.courseName}
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-0.5 leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      {/* Score Highlight Box */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 block tracking-wider">
                            Sınav Sonucu
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            {score >= 85 ? 'Pekiyi • Üstün Başarı' : 'Başarılı'}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {score}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block -mt-1">
                            / {item.maxScore || 100} Puan
                          </span>
                        </div>
                      </div>

                      {/* Teacher Feedback */}
                      {item.teacherFeedback ? (
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                          <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5 font-bold">
                            Öğretmen Değerlendirmesi:
                          </strong>
                          "{item.teacherFeedback}"
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">
                          Resmi sınav kağıdı zümre arşivinde onaylanmıştır.
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1">
                        <User size={12} />
                        {item.teacherName || 'Ders Öğretmeni'}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={13} />
                        Puanlandı & Onaylandı
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-xs text-gray-400">
              Bu filtrede puanlanmış bir sınav kaydı bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* Empty State when no results in tab */}
      {filteredAssessments.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 space-y-2">
          <AlertCircle size={28} className="mx-auto text-gray-400" />
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
            Kayıt Bulunamadı
          </h4>
          <p className="text-xs text-gray-400">
            Arama kriterinize veya seçili sekmeye uygun herhangi bir sınav bulunmuyor.
          </p>
        </div>
      )}
    </div>
  )
}
