'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  GraduationCap,
  Award,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  FileText,
  X,
  ChevronRight,
  UserCheck,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { ALL_INITIAL_STUDENTS, MStudentItem } from '@components/Mobile/MStudentClient'
import MockBadge from '@components/Common/MockBadge'

interface ClassOption {
  code: string
  name: string
  branch: string
  teacher: string
  studentCount: number
  avgGpa: number
}

const AVAILABLE_CLASSES: ClassOption[] = [
  {
    code: '9-A',
    name: '9-A Şubesi',
    branch: 'Türk Dili ve Edebiyatı · Rehberlik',
    teacher: 'Ebru TEKNECİ',
    studentCount: 1,
    avgGpa: 98.8,
  },
  {
    code: '9-B',
    name: '9-B Şubesi',
    branch: 'Türk Dili ve Edebiyatı',
    teacher: 'Ebru TEKNECİ',
    studentCount: 0,
    avgGpa: 0,
  },
  {
    code: '1-A',
    name: '1-A Şubesi',
    branch: 'Temel Eğitim & Sınıf Öğretmenliği',
    teacher: 'Ebru TEKNECİ',
    studentCount: 0,
    avgGpa: 0,
  },
]

export default function TeacherClassesView() {
  const searchParams = useSearchParams()
  const classFromQuery = searchParams.get('class')

  // Selected Class State (null = prompt teacher to select class)
  const [selectedClass, setSelectedClass] = useState<string | null>(() => {
    if (classFromQuery) {
      const match = AVAILABLE_CLASSES.find(
        (c) => c.code.toLowerCase() === classFromQuery.toLowerCase() || c.name.toLowerCase() === classFromQuery.toLowerCase()
      )
      if (match) return match.name
    }
    return null
  })

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all')

  // Selected student for detailed modal
  const [selectedStudent, setSelectedStudent] = useState<MStudentItem | null>(null)
  const [activeProfileTab, setActiveProfileTab] = useState<'identity' | 'academic' | 'attendance' | 'parent'>('identity')

  // Sync with searchParams if it changes
  useEffect(() => {
    if (classFromQuery) {
      const match = AVAILABLE_CLASSES.find(
        (c) => c.code.toLowerCase() === classFromQuery.toLowerCase() || c.name.toLowerCase() === classFromQuery.toLowerCase()
      )
      if (match) {
        setSelectedClass(match.name)
      }
    }
  }, [classFromQuery])

  // Students for the active selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return ALL_INITIAL_STUDENTS.filter((st) => {
      // 9-A contains Erçil Uğurlu
      if (selectedClass === '9-A Şubesi' || selectedClass === '9-A') {
        return st.className === '9-A Şubesi' || st.className.startsWith('9-A')
      }
      return st.className === selectedClass
    })
  }, [selectedClass])

  // Filtered by search & status
  const filteredStudents = useMemo(() => {
    return classStudents.filter((st) => {
      if (statusFilter !== 'all' && st.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = st.name.toLowerCase().includes(q)
        const matchNo = st.studentNo.toLowerCase().includes(q)
        const matchTc = st.tcNo.toLowerCase().includes(q)
        const matchParent = st.parentName.toLowerCase().includes(q)
        if (!matchName && !matchNo && !matchTc && !matchParent) return false
      }
      return true
    })
  }, [classStudents, statusFilter, searchQuery])

  const currentClassInfo = AVAILABLE_CLASSES.find((c) => c.name === selectedClass || c.code === selectedClass)

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── SCREEN 1: CLASS SELECTION PROMPT (When No Class is Selected) ── */}
      {!selectedClass ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">
              <Users size={16} />
              <span>Öğretmen Sınıf & Öğrenci Yönetimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Sınıfınızı Seçin
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              Öğrenci listesini ve akademik bilgileri görüntülemek için lütfen sorumlu olduğunuz şubelerden birini seçiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AVAILABLE_CLASSES.map((cls) => {
              const isLead = cls.code === '9-A'

              return (
                <div
                  key={cls.code}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-lg ${
                    isLead
                      ? 'bg-gradient-to-br from-indigo-50/60 to-white dark:from-[#131C31] dark:to-[#0F172A] border-indigo-200 dark:border-indigo-800/70 hover:border-indigo-400'
                      : 'bg-white dark:bg-[#121826] border-gray-200/70 dark:border-gray-800/70 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                        {cls.code}
                      </span>
                      {isLead && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Rehber Şube</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                      {cls.branch}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                        <span>Kayıtlı Öğrenci:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {cls.studentCount} Öğrenci
                        </span>
                      </div>
                      {cls.studentCount > 0 && (
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                          <span>Başarı Ortalaması:</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {cls.avgGpa}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Sınıfı Aç & Öğrencileri Gör</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── SCREEN 2: ACTIVE CLASS SELECTED & STUDENT LIST ── */
        <div className="space-y-6">
          {/* Active Class Header Card */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px]">
                  Seçili Şube
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 font-semibold">
                  Sınıf Rehberliği: Ebru TEKNECİ
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{selectedClass}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {classStudents.length} Kayıtlı Öğrenci
                </span>
                <MockBadge size="xs" />
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Sınıfı Değiştir</span>
              </button>

              <Link
                href={`/teacher/attendance?class=${encodeURIComponent(selectedClass)}`}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Yoklama Al</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Öğrenci adı, okul no (101) veya T.C. ile ara..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Tümü ({classStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Aktif
              </button>
            </div>
          </div>

          {/* Student List */}
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                          {st.name}
                        </h3>
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif Öğrenci</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                          Sınıf 1.'si (Ort: {st.gpa})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Okul No: <strong className="text-gray-800 dark:text-gray-200 font-mono">{st.studentNo}</strong></span>
                        <span>T.C.: <strong className="text-gray-800 dark:text-gray-200 font-mono">{st.tcNo}</strong></span>
                        <span>Şube: <strong className="text-gray-800 dark:text-gray-200">{st.className}</strong></span>
                      </div>

                      <div className="pt-2 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <Users size={14} className="text-indigo-500" />
                        <span>Veli: <strong>{st.parentName}</strong> ({st.parentPhone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st)
                        setActiveProfileTab('identity')
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText size={15} />
                      <span>Öğrenci Dosyasını İncele</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-12 text-center space-y-3">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Bu şubede henüz kayıtlı öğrenci bulunmuyor
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {selectedClass} şubesine ait öğrenci kaydı bulunamadı. Lütfen başka bir şube seçiniz.
              </p>
              <button
                type="button"
                onClick={() => setSelectedClass(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700"
              >
                Tüm Sınıflara Dön
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STUDENT PROFILE DETAIL DRAWER / MODAL ── */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center">
                    {selectedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      No: {selectedStudent.studentNo} • T.C.: {selectedStudent.tcNo}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 pt-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('identity')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'identity'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Kimlik & Genel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('academic')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'academic'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Akademik Notlar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('attendance')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'attendance'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Devam & Yoklama
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('parent')}
                  className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeProfileTab === 'parent'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Veli & Rehberlik
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeProfileTab === 'identity' && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                      <div>
                        <div className="text-gray-400 text-[11px]">Doğum Tarihi:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.birthDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Kan Grubu:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.bloodType}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Kayıt Tarihi:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.enrollmentDate}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-[11px]">Cinsiyet:</div>
                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedStudent.gender}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
                      <div className="text-gray-400 text-[11px]">İkametgâh Adresi:</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{selectedStudent.address}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                      <div className="text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">Öğrenci Disiplin & Sicil Durumu:</div>
                      <div className="text-emerald-900 dark:text-emerald-200 font-semibold">{selectedStudent.disciplineStatus}</div>
                    </div>
                  </div>
                )}

                {activeProfileTab === 'academic' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 flex items-center justify-between">
                      <div>
                        <div className="font-black text-sm text-indigo-900 dark:text-indigo-200">Genel Akademik Not Ortalaması</div>
                        <div className="text-indigo-700 dark:text-indigo-300 text-[11px]">Sınıf Sıralaması: 1 / 30</div>
                      </div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">98.8</div>
                    </div>

                    <div className="space-y-2">
                      {selectedStudent.grades.map((gr, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{gr.courseName}</div>
                            <div className="text-[11px] text-gray-400">1. Sınav: {gr.exam1} • 2. Sınav: {gr.exam2} • Performans: {gr.performance}</div>
                          </div>
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{gr.average}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeProfileTab === 'attendance' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-emerald-800 dark:text-emerald-300 font-bold">Ders Devam Oranı</div>
                        <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">Özürsüz Devamsızlık: 0 Gün</div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">%100</div>
                    </div>
                    <p className="text-gray-400 text-[11px]">
                      Öğrenci 2026-2027 Güz Döneminde tüm derslere eksiksiz olarak katılmıştır.
                    </p>
                  </div>
                )}

                {activeProfileTab === 'parent' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
                      <div className="font-bold text-gray-900 dark:text-white">1. Veli (Anne)</div>
                      <div className="text-gray-600 dark:text-gray-300">{selectedStudent.parentName} ({selectedStudent.parentOccupation})</div>
                      <div className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedStudent.parentPhone}</div>
                    </div>

                    {selectedStudent.secondParentName && (
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
                        <div className="font-bold text-gray-900 dark:text-white">2. Veli (Baba)</div>
                        <div className="text-gray-600 dark:text-gray-300">{selectedStudent.secondParentName}</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedStudent.secondParentPhone}</div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                      <div className="font-bold text-purple-900 dark:text-purple-200">Rehberlik Pedagojik Gözlem Kaydı:</div>
                      {selectedStudent.guidanceNotes.map((gn) => (
                        <div key={gn.id} className="text-[11px] text-purple-950 dark:text-purple-300 pt-1 border-t border-purple-200/40">
                          <span className="font-bold">{gn.author} ({gn.date}):</span> {gn.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
