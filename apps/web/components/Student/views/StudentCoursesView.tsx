'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Clock,
  MapPin,
  ChevronRight,
  User,
  Sparkles,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Tv,
} from 'lucide-react'
import {
  STUDENT_COURSES,
  getSynchronizedStudentCourses,
  getSynchronizedStudentProfile,
  getSynchronizedClassWeeklySchedule,
  type StudentCourse,
  type StudentProfile,
  DEFAULT_STUDENT_PROFILE,
} from '@/lib/student/studentData'
import {
  DAYS_LIST,
  MIDDLE_PERIODS,
  type ScheduleEntry,
  type DayKey,
} from '@components/Mobile/Admin/MAdminScheduleClient'
import MockBadge from '@components/Common/MockBadge'

export default function StudentCoursesView() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'schedule' ? 'schedule' : 'courses'

  const [activeTab, setActiveTab] = useState<'courses' | 'schedule'>(initialTab)
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayKey>(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1: return 'mon'
      case 2: return 'tue'
      case 3: return 'wed'
      case 4: return 'thu'
      case 5: return 'fri'
      default: return 'mon'
    }
  })

  React.useEffect(() => {
    const sync = () => {
      const p = getSynchronizedStudentProfile()
      setCourses(getSynchronizedStudentCourses())
      setProfile(p)
      setWeeklySchedule(getSynchronizedClassWeeklySchedule(p.className))
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('oxonom_admin_schedule_updated', sync)
    window.addEventListener('oxonom_schedule_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('oxonom_admin_schedule_updated', sync)
      window.removeEventListener('oxonom_schedule_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const selectedDayClasses = useMemo(() => {
    return weeklySchedule
      .filter((e) => e.day === selectedScheduleDay)
      .sort((a, b) => a.period - b.period)
  }, [weeklySchedule, selectedScheduleDay])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [courses, searchQuery])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <GraduationCap size={14} />
            <span>{profile.className} Şubesi Müfredatı & Haftalık Akış</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {activeTab === 'courses' ? 'Kayıtlı Derslerim' : 'Haftalık Ders Programı'}
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'courses'
              ? `2025-2026 Akademik yılında ${profile.className} şubesinde kayıtlı olduğun ${courses.length} ders ve ders öğretmenlerin.`
              : `Okul müdürlüğü tarafından onaylanan 9-A şubesine ait haftalık 35 saatlik MEB ders çizelgesi.`}
          </p>
        </div>

        {/* Tab Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <BookOpen size={14} />
              <span>Dersler ({courses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Calendar size={14} />
              <span>Haftalık Program ({weeklySchedule.length || 35}s)</span>
            </button>
          </div>

          {activeTab === 'courses' && (
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ders veya öğretmen ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: COURSES LIST */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const completedTopics = course.topics.filter((t) => t.completed).length
            const totalTopics = course.topics.length
            const completionRate = Math.round((completedTopics / totalTopics) * 100)

            return (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-cyan-400/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                      {course.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <Clock size={12} />
                      <span>Haftada {course.weeklyHours} Saat</span>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Teacher Info */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/40 dark:border-gray-800/40 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {course.teacherName.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {course.teacherName}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {course.teacherBranch}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                      <span>Müfredat İlerlemesi</span>
                      <span>%{completionRate}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px] flex items-center gap-1">
                    <MapPin size={12} />
                    {course.roomType}
                  </span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ders Detayı</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* VIEW 2: HAFTALIK DERS PROGRAMI (Müdürlük Onaylı) */}
      {activeTab === 'schedule' && (
        <div className="space-y-5">
          {/* Day Tabs */}
          <div className="p-2 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
            <div className="grid grid-cols-5 gap-2">
              {DAYS_LIST.map((day) => {
                const isSelected = selectedScheduleDay === day.key
                const count = weeklySchedule.filter((e) => e.day === day.key).length

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedScheduleDay(day.key)}
                    className={`p-3 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-extrabold shadow-md'
                        : 'bg-gray-50 dark:bg-[#131C31] text-gray-700 dark:text-gray-300 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{day.label}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {count} Ders Saati
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Periods Table for selected day */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {DAYS_LIST.find((d) => d.key === selectedScheduleDay)?.label} Günü Ders Akışı
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile.className} Şubesi · Toplam {selectedDayClasses.length} Ders Saati
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Müdürlük Onaylı Canlı Program
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {selectedDayClasses.length > 0 ? (
                selectedDayClasses.map((item, idx) => {
                  const periodTime =
                    MIDDLE_PERIODS.find((p) => p.periodNumber === item.period)?.time ||
                    (item as any).timeSlot ||
                    '09:25 - 10:05'

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-4 hover:border-cyan-400/50 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-base font-black">{item.period}</span>
                          <span className="text-[8px] uppercase tracking-wider text-gray-400">Ders</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                              {(item as any).subjectName || item.subject || 'Ders'}
                            </span>
                            {item.isSmartBoardActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                <Tv size={11} />
                                <span>Akıllı Tahta Aktif</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {item.teacherName || 'Ebru TEKNECİ'}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <MapPin size={12} />
                              {item.roomName || 'Derslik 9-A (1. Kat)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-extrabold text-gray-800 dark:text-gray-200">
                          {periodTime}
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          40 Dk Ders
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Bu gün için planlanmış ders saati bulunmamaktadır.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
