'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import {
  STUDENT_COURSES,
  getSynchronizedStudentCourses,
  getSynchronizedStudentProfile,
  type StudentCourse,
  type StudentProfile,
  DEFAULT_STUDENT_PROFILE,
} from '@/lib/student/studentData'
import MockBadge from '@components/Common/MockBadge'

export default function StudentCoursesView() {
  const [courses, setCourses] = useState<StudentCourse[]>(STUDENT_COURSES)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mandatory' | 'elective'>('all')

  React.useEffect(() => {
    const sync = () => {
      setCourses(getSynchronizedStudentCourses())
      setProfile(getSynchronizedStudentProfile())
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
            <span>{profile.className} Şubesi Müfredatı</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Kayıtlı Derslerim
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            2025-2026 Akademik yılında {profile.className} şubesinde kayıtlı olduğun {courses.length} ders ve ders öğretmenlerin.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ders veya öğretmen ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
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
    </div>
  )
}
