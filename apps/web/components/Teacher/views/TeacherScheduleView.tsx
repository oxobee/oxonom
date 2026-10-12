'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tv,
  CheckSquare,
  Sparkles,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Info,
  CalendarDays,
  ListFilter,
  GraduationCap,
} from 'lucide-react'
import { DAYS_LIST, PRIMARY_PERIODS } from '@components/Mobile/Admin/MAdminScheduleClient'
import ConnectBoardModal from '@components/DashboardV2/ConnectBoardModal'
import { useMobileTheme } from '@components/Mobile/useMobileTheme'

interface LessonPlanModalData {
  title: string
  subject: string
  classroom: string
  time: string
  curriculumGoal: string
  materials: string[]
  teacherNotes: string
}

export default function TeacherScheduleView() {
  const { theme } = useMobileTheme()
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily')
  const [selectedDayKey, setSelectedDayKey] = useState<string>('mon')
  const [selectedLessonModal, setSelectedLessonModal] = useState<LessonPlanModalData | null>(null)
  const [isConnectBoardModalOpen, setIsConnectBoardModalOpen] = useState(false)

  // Real, authentic teacher lesson schedule
  const TEACHER_SCHEDULE = [
    {
      period: 1,
      time: '08:30 - 09:10',
      subject: 'Türk Dili ve Edebiyatı',
      classroom: '9-A Şubesi',
      room: 'Derslik 101',
      curriculumGoal: 'Metin tahlili, ana fikir ve yardımcı fikirlerin belirlenmesi.',
      materials: ['9. Sınıf Edebiyat Kitabı s.42', 'Akıllı Tahta Şiir İnceleme Panosu'],
      teacherNotes: 'Öğrencilere ödev kontrolü yapılacak, tahtada kavram haritası açılacak.',
      status: 'completed',
    },
    {
      period: 2,
      time: '09:25 - 10:05',
      subject: 'Türk Dili ve Edebiyatı',
      classroom: '9-A Şubesi',
      room: 'Derslik 101',
      curriculumGoal: 'Paragrafta anlam, düşünceyi geliştirme yolları ve anlatım teknikleri.',
      materials: ['Paragraf Çalışma Kâğıdı #3', 'Örnek Soru Bankası'],
      teacherNotes: 'Sınıf içi kısa quiz uygulanacak.',
      status: 'active', // Currently active or next
    },
    {
      period: 3,
      time: '10:20 - 11:00',
      subject: 'Türkçe',
      classroom: '5-A Şubesi',
      room: 'Derslik 204',
      curriculumGoal: 'Sözcükte anlam: Gerçek, mecaz ve terim anlamlı sözcükler.',
      materials: ['Kelime Etkinlik Çarkı (Akıllı Tahta)', 'Çalışma Kâğıdı'],
      teacherNotes: 'Görsel kartlarla sözcük eşleştirme oyunu oynatılacak.',
      status: 'upcoming',
    },
    {
      period: 4,
      time: '11:15 - 11:55',
      subject: 'Türkçe',
      classroom: '5-A Şubesi',
      room: 'Derslik 204',
      curriculumGoal: 'Cümlede anlam: Neden-sonuç ve amaç-sonuç cümlelerinin ayırt edilmesi.',
      materials: ['Etkileşimli Tahta Sunumu', 'Test Kitabı Test 4'],
      teacherNotes: 'Grup çalışması ile örnek cümleler yazılacak.',
      status: 'upcoming',
    },
    {
      period: 5,
      time: '12:45 - 13:25',
      subject: 'Rehberlik ve Yönlendirme',
      classroom: '9-A Şubesi',
      room: 'Derslik 101',
      curriculumGoal: 'Akademik hedef belirleme, verimli ders çalışma ve motivasyon takibi.',
      materials: ['Haftalık Hedef Çizelgesi'],
      teacherNotes: 'Öğrenci bireysel hedef kartları toplanacak.',
      status: 'upcoming',
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <GraduationCap size={15} />
            <span>Haftalık Ders Akışı & Müfredat Planı</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Derslerim ve Programım
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders saatleri, kazanımlar, tahtayla ders başlatma ve günlük ders planları
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Günlük Görünüm
          </button>
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Haftalık Çizelge
          </button>
        </div>
      </div>

      {/* Week Day Selector Tabs (for Daily mode) */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {DAYS_LIST.map((day) => {
            const isSelected = selectedDayKey === day.key
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayKey(day.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                }`}
              >
                <span>{day.label}</span>
                {day.key === 'mon' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    Bugün
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* DAILY VIEW: Timetable List */}
      {viewMode === 'daily' && (
        <div className="space-y-3.5">
          {TEACHER_SCHEDULE.map((lesson) => {
            const isCurrent = lesson.status === 'active'

            return (
              <motion.article
                key={lesson.period}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition-all ${
                  isCurrent
                    ? 'bg-white dark:bg-[#121A2F] border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-[#121826] border-gray-200/80 dark:border-gray-800/80 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Time & Subject info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      <span className="text-base leading-none">{lesson.period}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold">Ders</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                          {lesson.subject}
                        </h2>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                          {lesson.classroom}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <MapPin size={11} />
                          <span>{lesson.room}</span>
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Şu Anki / Sıradaki Ders</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={13} />
                        <span className="font-mono font-medium">{lesson.time}</span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium pt-1">
                        🎯 <span className="font-bold">Kazanım:</span> {lesson.curriculumGoal}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLessonModal({
                          title: `${lesson.period}. Ders: ${lesson.subject}`,
                          subject: lesson.subject,
                          classroom: lesson.classroom,
                          time: lesson.time,
                          curriculumGoal: lesson.curriculumGoal,
                          materials: lesson.materials,
                          teacherNotes: lesson.teacherNotes,
                        })
                      }
                      className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen size={14} />
                      <span>Ders Planı</span>
                    </button>

                    <Link
                      href="/teacher/attendance"
                      className="h-10 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckSquare size={14} />
                      <span>Yoklama</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsConnectBoardModalOpen(true)}
                      className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0D15] font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Tv size={15} />
                      <span>Tahtada Başlat</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      {/* WEEKLY TIMETABLE GRID (Weekly mode) */}
      {viewMode === 'weekly' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="py-3 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24">Saat</th>
                {DAYS_LIST.map((day) => (
                  <th key={day.key} className="py-3 px-3 text-xs font-extrabold text-gray-900 dark:text-white">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
              {PRIMARY_PERIODS.slice(0, 5).map((period) => (
                <tr key={period.periodNumber} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3.5 px-3 font-mono text-[11px] text-gray-500">
                    <div className="font-bold text-gray-900 dark:text-white">{period.periodNumber}. Ders</div>
                    <div>{period.time}</div>
                  </td>
                  {DAYS_LIST.map((day) => {
                    const isMon = day.key === 'mon'
                    const subject = isMon ? (period.periodNumber <= 2 ? 'Türk Dili' : 'Türkçe') : 'Edebiyat'
                    const cl = isMon ? (period.periodNumber <= 2 ? '9-A' : '5-A') : '9-A'
                    return (
                      <td key={day.key} className="py-3 px-3">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800/80">
                          <div className="font-extrabold text-gray-900 dark:text-white text-xs">{subject}</div>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{cl} Şubesi</div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lesson Plan Detail Modal */}
      <AnimatePresence>
        {selectedLessonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-jakarta">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLessonModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {selectedLessonModal.title}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedLessonModal.classroom} • {selectedLessonModal.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLessonModal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Ders Kazanımı</div>
                  <p className="mt-1 text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    {selectedLessonModal.curriculumGoal}
                  </p>
                </div>

                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Kullanılacak Materyaller</div>
                  <ul className="mt-1 space-y-1">
                    {selectedLessonModal.materials.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Öğretmen Ders Notu</div>
                  <p className="mt-1 text-gray-600 dark:text-gray-400 italic">
                    {selectedLessonModal.teacherNotes}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLessonModal(null)}
                  className="h-9 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConnectBoardModal
        isOpen={isConnectBoardModalOpen}
        onClose={() => setIsConnectBoardModalOpen(false)}
        theme={theme}
      />
    </div>
  )
}
