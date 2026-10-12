'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  Users,
  Check,
  X,
  Clock,
  Save,
  History,
  Server,
  FileCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ALL_INITIAL_STUDENTS, MStudentItem } from '@components/Mobile/MStudentClient'
import {
  saveAttendanceForClass,
  getAttendanceForClass,
  getTodayDateString,
  AttendanceRecord,
} from '@services/demo/attendanceService'
import PassiveModuleNotice from '../PassiveModuleNotice'

export default function TeacherAttendanceView() {
  const [selectedClass, setSelectedClass] = useState('9-A Şubesi')
  const [activeTab, setActiveTab] = useState<'take' | 'history' | 'reports'>('take')

  // Students for the selected class
  const classStudents = useMemo(() => {
    return ALL_INITIAL_STUDENTS.filter(
      (s) => s.className === selectedClass || selectedClass === '9-A Şubesi'
    )
  }, [selectedClass])

  // Records state: studentId -> 'present' | 'absent'
  const [records, setRecords] = useState<Record<string, 'present' | 'absent'>>({})
  const [lastSaved, setLastSaved] = useState<AttendanceRecord | null>(null)

  // Load existing today's attendance on mount or class change
  useEffect(() => {
    const existing = getAttendanceForClass(selectedClass)
    if (existing) {
      setRecords(existing.records)
      setLastSaved(existing)
    } else {
      // Default all to present
      const initial: Record<string, 'present' | 'absent'> = {}
      classStudents.forEach((s) => {
        initial[s.id] = 'present'
      })
      setRecords(initial)
      setLastSaved(null)
    }
  }, [selectedClass, classStudents])

  const toggleStudent = (id: string) => {
    setRecords((prev) => ({
      ...prev,
      [id]: prev[id] === 'absent' ? 'present' : 'absent',
    }))
  }

  const markAllPresent = () => {
    const all: Record<string, 'present' | 'absent'> = {}
    classStudents.forEach((s) => {
      all[s.id] = 'present'
    })
    setRecords(all)
    toast.success('Tüm sınıf "Burada" olarak işaretlendi.')
  }

  const handleSave = () => {
    const saved = saveAttendanceForClass(selectedClass, records, classStudents.length)
    setLastSaved(saved)
    toast.success(`${selectedClass} günlük yoklaması sisteme kaydedildi!`)
  }

  const presentCount = Object.values(records).filter((r) => r === 'present').length
  const absentCount = Object.values(records).filter((r) => r === 'absent').length

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <CheckSquare size={15} />
            <span>Sınıf İçi Devam & Yoklama Takibi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Yoklama ve Devam
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders yoklaması alma, sınıf mevcudu kontrolü ve geçmiş devamsızlık kayıtları
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('take')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'take'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Yoklama Al
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Geçmiş
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            e-Okul Raporları
          </button>
        </div>
      </div>

      {/* ── TAB 1: YOKLAMA AL ── */}
      {activeTab === 'take' && (
        <div className="space-y-4">
          {/* Controls: Class Selector & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <label htmlFor="class-select" className="text-xs font-bold text-gray-500">Şube Seçimi:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="9-A Şubesi">9-A Şubesi (Rehber Şube)</option>
                <option value="5-A Şubesi">5-A Şubesi</option>
                <option value="1-A Şubesi">1-A Şubesi</option>
              </select>
            </div>

            {/* Stats Pill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold">
                {presentCount} Burada
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-extrabold">
                {absentCount} Yok
              </span>
              <button
                type="button"
                onClick={markAllPresent}
                className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold transition-colors cursor-pointer"
              >
                Tümünü Var Yap
              </button>
            </div>
          </div>

          {/* Student Roster Grid */}
          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {classStudents.map((st) => {
                const isPresent = records[st.id] !== 'absent'

                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStudent(st.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                      isPresent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPresent
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}>
                        {st.studentNo.slice(-2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                          No: {st.studentNo}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold">
                          <Check size={12} strokeWidth={3} />
                          <span>Burada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-extrabold">
                          <X size={12} strokeWidth={3} />
                          <span>Yok</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {lastSaved ? (
                  <span>Son Kayıt: Bugün {lastSaved.updatedAt} tarihinde başarıyla kaydedildi.</span>
                ) : (
                  <span>Bugün henüz yoklama kaydedilmedi.</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Save size={16} />
                <span>Yoklamayı Onayla & Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GEÇMİŞ ── */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <History size={16} className="text-indigo-500" />
            <span>Kaydedilmiş Yoklama Kayıtları</span>
          </div>

          {lastSaved ? (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-xs text-gray-900 dark:text-white">
                  {lastSaved.classCode} — Günlük Ders Yoklaması
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Tarih: {lastSaved.date} • Kayıt Saati: {lastSaved.updatedAt}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  {lastSaved.presentCount} Mevcut
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
                  {lastSaved.absentCount} Devamsız
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              Henüz bu sınıfa ait kaydedilmiş geçmiş yoklama kaydı bulunmuyor.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: E-OKUL RAPORLARI (PASSIVE) ── */}
      {activeTab === 'reports' && (
        <PassiveModuleNotice
          moduleName="MEB e-Okul Devamsızlık Entegrasyonu & Resmi Raporlar"
          description="Yoklama kayıtlarının otomatik olarak MEB e-Okul sistemine ve resmi devamsızlık defterlerine aktarılması modülü."
          missingDependency="MEB e-Okul Resmi Web Servis / API Entegrasyonu & Yetkili Bakanlık Doğrulaması"
          plannedFeatures={[
            'e-Okul otomatik devamsızlık fişi aktarımı',
            'Resmi yoklama çizelgesi PDF çıktısı',
            'Veliye anlık SMS devamsızlık bildirimi',
            'Kazanım bazlı ders devamsızlık istatistiği',
          ]}
          relatedActivePath="/teacher/attendance"
          relatedActiveLabel="Yoklama Ekranına Dön"
        />
      )}
    </div>
  )
}
