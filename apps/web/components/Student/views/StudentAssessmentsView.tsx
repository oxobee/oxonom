'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { STUDENT_ASSESSMENTS, type StudentAssessment } from '@/lib/student/studentData'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'

interface StudentAssessmentsViewProps {
  initialTab?: 'all' | 'exams' | 'quizzes' | 'results'
}

export default function StudentAssessmentsView({
  initialTab = 'all',
}: StudentAssessmentsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'exams' | 'quizzes' | 'results'>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssessments = STUDENT_ASSESSMENTS.filter((item) => {
    if (activeTab === 'exams' && item.type !== 'exam') return false
    if (activeTab === 'quizzes' && item.type !== 'quiz') return false
    if (activeTab === 'results' && (!item.isPublished || item.score === undefined)) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.courseName.toLowerCase().includes(q)
    }
    return true
  })

  // Calculate Average Score of published exams
  const publishedScores = STUDENT_ASSESSMENTS.filter((a) => a.isPublished && a.score !== undefined)
  const averageScore = publishedScores.length
    ? Math.round(
        publishedScores.reduce((acc, curr) => acc + (curr.score || 0), 0) / publishedScores.length
      )
    : 98

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
            <FileCheck size={14} />
            <span>Resmi Değerlendirmeler</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınavlar, Quizler ve Sonuçlar
            </h1>
            <MockBadge label="Mock Veri" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dönem içi yazılı sınav takvimi, mini quizler ve yayımlanmış resmi sınav notları.
          </p>
        </div>

        {/* GPA Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-sm">
            <Award size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Sınav Not Ortalaması</div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {averageScore} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200/80 dark:border-gray-800/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Tüm Değerlendirmeler ({STUDENT_ASSESSMENTS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Yazılı Sınavlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quizzes'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Quizler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
          }`}
        >
          Yayımlanan Sonuçlar ({publishedScores.length})
        </button>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssessments.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-amber-400/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Type and Date badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                  {item.type === 'exam' ? 'Yazılı Sınav' : 'Mini Quiz'}
                </span>
                <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {item.date}
                </span>
              </div>

              {/* Title & Course */}
              <div>
                <div className="text-[11px] font-bold text-gray-400">{item.courseName}</div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {item.title}
                </h3>
              </div>

              {/* Exam Info metadata */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/40 dark:border-gray-800/40 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Süre:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {item.durationMinutes} Dakika
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    Yer:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.location}</span>
                </div>
              </div>

              {/* Teacher feedback if completed */}
              {item.teacherFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 italic">
                  "{item.teacherFeedback}"
                </div>
              )}
            </div>

            {/* Score / Status Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              {item.isPublished && item.score !== undefined ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Sınav Notu:
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    toast(
                      'Bu sınav süreli bir okul oturumudur. Belirlenen sınav saatinde sınıf ortamında başlatılacaktır.',
                      { icon: 'ℹ️' }
                    )
                  }
                  className="w-full py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer text-center"
                >
                  Sınav Bilgilerini İncele
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
