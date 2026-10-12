'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { ALL_INITIAL_STUDENTS } from '@components/Mobile/MStudentClient'

export default function TeacherProgressView() {
  const [search, setSearch] = useState('')

  const students = ALL_INITIAL_STUDENTS.filter((s) => {
    if (!search.trim()) return true
    return s.name.toLowerCase().includes(search.toLowerCase()) || s.studentNo.includes(search)
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <TrendingUp size={15} />
            <span>Akademik Takip & Rehberlik Görüşmeleri</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Öğrenci Gelişimi ve Rehberlik
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders başarı durumu, ödev tamamlama oranları ve rehberlik servisi kayıtları
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğrenci ara..."
            className="w-full h-10 px-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Student Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((st) => (
          <div
            key={st.id}
            className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center">
                  {st.studentNo.slice(-2)}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {st.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {st.className} • No: {st.studentNo}
                  </div>
                </div>
              </div>

              <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                %{st.attendanceRate} Devam
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Ödev Başarısı</div>
                <div className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                  %88 Tamamlandı
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Ders Katılımı</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Yüksek
                </div>
              </div>
            </div>

            {/* Guidance Log */}
            {st.guidanceNotes && st.guidanceNotes.length > 0 && (
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-1">
                <div className="font-extrabold text-indigo-700 dark:text-indigo-300">
                  Son Rehberlik Notu ({st.guidanceNotes[0].date}):
                </div>
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                  {st.guidanceNotes[0].content}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Link
                href="/teacher/classes"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Detaylı Profil</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
