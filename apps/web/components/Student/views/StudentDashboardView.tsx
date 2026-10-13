'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  FileCheck,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  CheckSquare,
  BookMarked,
  MapPin,
  Play,
  Layers,
  Flame,
  MessageSquareQuote,
} from 'lucide-react'
import {
  DEFAULT_STUDENT_PROFILE,
  STUDENT_COURSES,
  STUDENT_ASSESSMENTS,
  STUDENT_ANNOUNCEMENTS,
  getStoredPlannerTasks,
  getSynchronizedStudentProfile,
  getSynchronizedStudentAssignments,
  getSynchronizedStudentAssessments,
  getSynchronizedGuidanceNotes,
  type PlannerTask,
  type StudentProfile,
  type StudentAssessment,
  type GuidanceNoteItem,
} from '@/lib/student/studentData'
import {
  getStoredCustomAssignments,
  DEFAULT_SCHOOL_ASSIGNMENTS,
  type SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import {
  INITIAL_SCHEDULE_ENTRIES,
  MIDDLE_PERIODS,
  type ScheduleEntry,
  type DayKey,
} from '@components/Mobile/Admin/MAdminScheduleClient'
import MockBadge from '@components/Common/MockBadge'

export default function StudentDashboardView() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [assignments, setAssignments] = useState<SchoolAssignmentItem[]>([])
  const [assessments, setAssessments] = useState<StudentAssessment[]>([])
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])

  useEffect(() => {
    const syncAll = () => {
      setProfile(getSynchronizedStudentProfile())
      setTasks(getStoredPlannerTasks())
      setAssignments(getSynchronizedStudentAssignments())
      setAssessments(getSynchronizedStudentAssessments())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
    }

    syncAll()

    window.addEventListener('oxonom_student_updated', syncAll)
    window.addEventListener('oxonom_assignments_updated', syncAll)
    window.addEventListener('oxonom_teacher_profile_updated', syncAll)
    window.addEventListener('oxonom_attendance_updated', syncAll)
    window.addEventListener('oxonom_schedule_updated', syncAll)
    window.addEventListener('storage', syncAll)

    return () => {
      window.removeEventListener('oxonom_student_updated', syncAll)
      window.removeEventListener('oxonom_assignments_updated', syncAll)
      window.removeEventListener('oxonom_teacher_profile_updated', syncAll)
      window.removeEventListener('oxonom_attendance_updated', syncAll)
      window.removeEventListener('oxonom_schedule_updated', syncAll)
      window.removeEventListener('storage', syncAll)
    }
  }, [])

  // Today's Day Key in Turkish schedule format (mon, tue, wed, thu, fri)
  const todayKey: DayKey = useMemo(() => {
    const dayIndex = new Date().getDay()
    switch (dayIndex) {
      case 1:
        return 'mon'
      case 2:
        return 'tue'
      case 3:
        return 'wed'
      case 4:
        return 'thu'
      case 5:
        return 'fri'
      default:
        return 'mon' // default to Monday for weekend preview
    }
  }, [])

  // Today's classes for 9-A
  const todayClasses = useMemo(() => {
    let entries = INITIAL_SCHEDULE_ENTRIES
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oxonom_admin_schedule_30')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) entries = parsed
        }
      } catch (_) {}
    }
    return entries
      .filter((e) => {
        const classStr = String((e as any).classCode || (e as any).classroom || '').toLowerCase()
        return e.day === todayKey && (classStr.includes('9-a') || classStr.includes('9/a') || classStr.includes('9a'))
      })
      .sort((a, b) => a.period - b.period)
  }, [todayKey])

  // Pending assignments count & top 3 items
  const pendingAssignments = useMemo(() => {
    return assignments.slice(0, 3)
  }, [assignments])

  // Upcoming assessments
  const upcomingAssessments = useMemo(() => {
    return assessments.filter((a) => a.status === 'upcoming').slice(0, 2)
  }, [assessments])

  // Toggle quick planner task
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_planner_tasks_ercil', JSON.stringify(updated))
    }
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length
  const totalTasksCount = tasks.length || 4

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 lg:p-8 text-white shadow-xl shadow-cyan-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles size={14} className="text-yellow-300" />
              <span>Oxonom EDU Akademik Dönem 2025-2026</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
              Hoş geldin, {profile.firstName}! 👋
            </h1>
            <p className="text-cyan-100 text-xs lg:text-sm max-w-xl leading-relaxed">
              Bugün {profile.className} şubesinde seni bekleyen {todayClasses.length > 0 ? todayClasses.length : '5'} ders saati ve {pendingAssignments.length} aktif çalışma bulunuyor.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-yellow-300 font-black text-lg">
              <Award size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-200 flex items-center gap-1.5">
                <span>Akademik Başarı</span>
              </div>
              <div className="text-xl font-extrabold">{profile.gpa} Ort.</div>
              <div className="text-[10px] text-emerald-300 font-semibold">
                {profile.disciplineStatus.split('—')[1]?.trim() || 'Örnek Öğrenci Onur Belgesi'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 QUICK KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card 1: Sınıf ve Şube */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Sınıf & No</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
              {profile.className} · #{profile.studentNo}
            </div>
          </div>
        </div>

        {/* Card 2: Bekleyen Ödevler */}
        <Link
          href="/student/assignments"
          className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5 hover:border-emerald-400/50 transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Bekleyen Ödev</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{pendingAssignments.length} Ödev</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 3: Yaklaşan Sınavlar */}
        <Link
          href="/student/assessments"
          className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5 hover:border-amber-400/50 transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileCheck size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Yaklaşan Sınav</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{upcomingAssessments.length} Değerlendirme</span>
              <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Card 4: Devamlılık */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Devam Durumu</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              %{profile.attendanceRate} (0 Devamsızlık)
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): Bugünün Ders Programı & Bekleyen Ödevler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bugünün Ders Programı */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Bugünün Ders Akışı ({profile.className})
                    </h2>
                    <MockBadge label="Canlı Senkronize" />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Haftalık programa göre planlanmış ders saatleri
                  </p>
                </div>
              </div>
              <Link
                href="/student/courses"
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Tüm Program</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Timetable slots */}
            <div className="space-y-2.5">
              {todayClasses.length > 0 ? (
                todayClasses.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3 hover:border-cyan-400/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                        <span>{item.period}.</span>
                        <span className="text-[9px] font-normal">Ders</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                          {(item as any).subjectName || item.subject || 'Ders'}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{item.teacherName}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {item.roomName || 'Derslik 101'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        {MIDDLE_PERIODS.find((p: any) => p.periodNumber === item.period)?.time || (item as any).timeSlot || '09:25 - 10:05'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Bugün için planlanmış ders bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Bekleyen Ödevler Kartları */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Bekleyen ve Güncel Ödevler
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Öğretmenler tarafından tanımlanmış görevler
                  </p>
                </div>
              </div>
              <Link
                href="/student/assignments"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ödevlere Git</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingAssignments.map((asg) => (
                <Link
                  key={asg.id || asg.assignment_uuid}
                  href={`/student/assignments/${asg.assignment_uuid || asg.id}`}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 hover:border-emerald-400/50 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {(asg as any).subject_name || asg.subject || 'Türkçe / Edebiyat'}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {asg.due_date ? String(asg.due_date).slice(0, 10) : '24 Ekim'}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                      {asg.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {asg.description || 'Ödev detayları ve çalışma föyü talimatlarını inceleyin.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/40 dark:border-gray-800/40 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">{asg.teacher_name || 'Ebru TEKNECİ'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>İncele</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Günlük Çalışma Hedefleri, Sınavlar & Duyurular */}
        <div className="space-y-6">
          {/* Günlük Hedefler / Yapılacaklar */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Günlük Çalışma Hedefim
                </h3>
              </div>
              <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                {completedTasksCount}/{totalTasksCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(completedTasksCount / totalTasksCount) * 100}%` }}
              />
            </div>

            {/* Task Checklist */}
            <div className="space-y-2 pt-1">
              {tasks.slice(0, 4).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-gray-50 dark:bg-[#131C31] hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-gray-200/50 dark:border-gray-800/50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {task.completed && <CheckSquare size={12} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        task.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{task.course}</span>
                  </div>
                </button>
              ))}
            </div>

            <Link
              href="/student/planner"
              className="w-full py-2 rounded-xl text-center block text-xs font-bold text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Ajandayı ve Tüm Görevleri Gör →
            </Link>
          </div>

          {/* Yaklaşan Sınavlar */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Yaklaşan Değerlendirmeler
                </h3>
                <MockBadge label="Canlı Senkronize" />
              </div>
              <Link
                href="/student/assessments"
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Tümü
              </Link>
            </div>

            <div className="space-y-2">
              {upcomingAssessments.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      {exam.courseName}
                    </span>
                    <span className="text-gray-400">{exam.date}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {exam.title}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-2">
                    <span>Süre: {exam.durationMinutes} dk</span>
                    <span>·</span>
                    <span>{exam.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rehber Öğretmen Değerlendirmesi & Pedagojik Not */}
          {guidanceNotes.length > 0 && (
            <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    Rehber Öğretmen Değerlendirmesi
                  </h3>
                </div>
                <Link
                  href="/student/progress"
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Tüm Görüşler
                </Link>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#0E1526]/80 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                    {guidanceNotes[0].author}
                  </span>
                  <span className="text-gray-400 font-medium">{guidanceNotes[0].date}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  "{guidanceNotes[0].content}"
                </p>
              </div>
            </div>
          )}

          {/* Son Duyurular */}
          <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-blue-500" />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Okul ve Sınıf Duyurusu
                </h3>
                <MockBadge label="Mock Veri" />
              </div>
              <Link
                href="/student/communication"
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Tümü
              </Link>
            </div>

            <div className="space-y-2.5">
              {STUDENT_ANNOUNCEMENTS.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {ann.author}
                    </span>
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
