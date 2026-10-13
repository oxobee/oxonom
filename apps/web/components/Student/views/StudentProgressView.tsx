'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart3,
  Target,
  Flame,
  Star,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import {
  DEFAULT_STUDENT_PROFILE,
  getSynchronizedStudentProfile,
  getSynchronizedGuidanceNotes,
  type StudentProfile,
  type GuidanceNoteItem,
} from '@/lib/student/studentData'
import MockBadge from '@components/Common/MockBadge'

interface StudentProgressViewProps {
  initialTab?: 'all' | 'subjects' | 'guidance' | 'achievements' | 'goals'
}

interface AchievementBadge {
  id: string
  title: string
  category: string
  date: string
  unlocked: boolean
  description: string
  icon: string
}

const BADGES: AchievementBadge[] = [
  {
    id: 'b-1',
    title: 'Üstün Başarı Onur Belgesi',
    category: 'Akademik Başarı',
    date: 'Ekim 2026',
    unlocked: true,
    description: 'Dönem genelinde 98.8 genel not ortalaması ve örnek öğrenci davranışı.',
    icon: '🏆',
  },
  {
    id: 'b-2',
    title: 'Kusursuz Devam ve Katılım',
    category: 'Disiplin',
    date: 'Ekim 2026',
    unlocked: true,
    description: 'Dönem başından bu yana sıfır devamsızlık ve derslere %100 eksiksiz katılım.',
    icon: '⭐',
  },
  {
    id: 'b-3',
    title: 'Tam Puan Şampiyonu',
    category: 'Sınav Başarısı',
    date: 'Ekim 2026',
    unlocked: true,
    description: 'Türk Dili ve Edebiyatı ile Bilişim sınavlarında 100 tam puan başarısı.',
    icon: '💯',
  },
  {
    id: 'b-4',
    title: 'Algoritma ve Kodlama Ustası',
    category: 'Bilişim',
    date: 'Eylül 2026',
    unlocked: true,
    description: 'Python ve akıllı tahta kodlama etkinliklerinde tüm görevleri başarıyla tamamlama.',
    icon: '💻',
  },
  {
    id: 'b-5',
    title: 'Edebi Tahlil ve Kompozisyon Ustası',
    category: 'Edebiyat',
    date: 'Ekim 2026',
    unlocked: true,
    description: 'Şiir tahlilleri ve kompozisyon ödevlerinde zümre başkanı tebriği.',
    icon: '📖',
  },
  {
    id: 'b-6',
    title: 'Bilim Olimpiyatı Adayı',
    category: 'Bilim & Proje',
    date: 'Yakında',
    unlocked: false,
    description: 'TÜBİTAK proje başvurusunu tamamlayarak aktif bilim olimpiyatına katılma.',
    icon: '🔬',
  },
]

const FALLBACK_COURSES = [
  { name: 'Türk Dili ve Edebiyatı', teacher: 'Ebru TEKNECİ', exam1: 98, exam2: 100, perf: 100, avg: 99.3 },
  { name: 'Matematik', teacher: 'Ebru TEKNECİ', exam1: 96, exam2: 98, perf: 100, avg: 98.0 },
  { name: 'Bilişim & Kodlama', teacher: 'Ebru TEKNECİ', exam1: 100, exam2: 98, perf: 100, avg: 99.0 },
  { name: 'Yabancı Dil (İngilizce)', teacher: 'Yabancı Dil', exam1: 100, exam2: 98, perf: 100, avg: 99.3 },
  { name: 'Fizik & Fen Bilimleri', teacher: 'Fen Zümresi', exam1: 95, exam2: 98, perf: 100, avg: 97.6 },
]

export default function StudentProgressView({ initialTab = 'all' }: StudentProgressViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'subjects' | 'guidance' | 'achievements' | 'goals'>(initialTab)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])

  useEffect(() => {
    const sync = () => {
      setProfile(getSynchronizedStudentProfile())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('oxonom_attendance_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('oxonom_attendance_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <TrendingUp size={14} />
            <span>Akademik Başarı Takibi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Gelişimim ve Başarılarım
            </h1>
            <MockBadge label="Canlı Senkronize" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenin tarafından girilen ders notları, rehberlik değerlendirmeleri ve akademik kazanımların.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Genel Bakış
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Ders Notları
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guidance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'guidance'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Rehberlik Görüşleri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Rozetler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-white dark:bg-[#0E1526] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Hedefler
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Genel Not Ortalaması</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {profile.gpa} <span className="text-xs font-normal text-gray-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {profile.gpa >= 85 ? 'Dönem Sonu Takdir Belgesi' : 'Dönem Sonu Teşekkür Belgesi'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Sınıf Sıralaması</div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {profile.classRank}. Sıra <span className="text-xs font-normal text-gray-400">({profile.className})</span>
          </div>
          <div className="text-[11px] text-gray-500 font-semibold">
            {profile.classRank === 1 ? 'Şube Birincisi' : 'Sınıf Başarı Sırası'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Devamlılık Oranı</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            %{profile.attendanceRate}
          </div>
          <div className="text-[11px] text-gray-500 font-semibold">
            {profile.absentDays} Gün Devamsızlık
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Kazanılan Rozetler</div>
          <div className="text-2xl font-black text-amber-500">
            5 / 6 <span className="text-xs font-normal text-gray-400">Rozet</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">
            Üst Düzey Başarı
          </div>
        </div>
      </div>

      {/* Course Breakdown Table */}
      {(activeTab === 'all' || activeTab === 'subjects') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Ders Bazlı Akademik Not Çizelgesi ({profile.className})
              </h2>
              <p className="text-[11px] text-gray-400">
                Öğretmen panelinde girilen yazılı sınavlar, sözlü ve performans notları canlı listelenmektedir
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-bold">
                  <th className="pb-3">Ders Adı</th>
                  <th className="pb-3">Ders Öğretmeni</th>
                  <th className="pb-3 text-center">1. Yazılı</th>
                  <th className="pb-3 text-center">2. Yazılı</th>
                  <th className="pb-3 text-center">Performans</th>
                  <th className="pb-3 text-right">Ağırlıklı Ort.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-semibold">
                {((profile.grades && profile.grades.length > 0) ? profile.grades : FALLBACK_COURSES).map((c: any) => {
                  const courseTitle = c.courseName || c.name
                  const teacher = c.teacherName || c.teacher || 'Ders Öğretmeni'
                  const e1 = c.exam1 !== undefined && c.exam1 !== null && c.exam1 !== '' ? c.exam1 : '-'
                  const e2 = c.exam2 !== undefined && c.exam2 !== null && c.exam2 !== '' ? c.exam2 : '-'
                  const perf = c.performance !== undefined && c.performance !== null && c.performance !== '' ? c.performance : '-'
                  
                  let calculatedAvg = c.average
                  if (!calculatedAvg || isNaN(calculatedAvg)) {
                    const numE1 = Number(c.exam1) || 0
                    const numE2 = Number(c.exam2) || 0
                    const numPerf = Number(c.performance) || 0
                    calculatedAvg = Number(((numE1 * 0.4) + (numE2 * 0.4) + (numPerf * 0.2)).toFixed(1))
                  } else {
                    calculatedAvg = Number(calculatedAvg).toFixed(1)
                  }

                  return (
                    <tr key={courseTitle} className="hover:bg-gray-50 dark:hover:bg-[#131C31]/50 transition-colors">
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">{courseTitle}</td>
                      <td className="py-3.5 text-gray-500 dark:text-gray-400">{teacher}</td>
                      <td className="py-3.5 text-center">{e1}</td>
                      <td className="py-3.5 text-center">{e2}</td>
                      <td className="py-3.5 text-center">{perf}</td>
                      <td className="py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {calculatedAvg}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guidance and Pedagogical Notes Section */}
      {(activeTab === 'all' || activeTab === 'guidance') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold mb-1">
                <Sparkles size={12} />
                <span>Öğretmen Gözlemi</span>
              </div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Rehberlik ve Pedagojik Gelişim Görüşleri
              </h2>
              <p className="text-[11px] text-gray-400">
                Sınıf rehber öğretmeni ve ders öğretmenlerinin öğrenci hakkındaki resmi pedagojik değerlendirmeleri
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {guidanceNotes.length} Kayıtlı Görüş
            </span>
          </div>

          <div className="space-y-3">
            {guidanceNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2.5 hover:border-indigo-400/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{note.author}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-semibold">{note.date}</div>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal bg-white/70 dark:bg-black/20 p-3.5 rounded-xl border border-gray-200/40 dark:border-gray-800/40">
                  {note.content}
                </p>
              </div>
            ))}

            {guidanceNotes.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-[#131C31] text-gray-400 text-xs">
                Henüz eklenmiş bir rehberlik görüşü bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievement Badges Grid */}
      {(activeTab === 'all' || activeTab === 'achievements') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Başarı Rozetleri ve Onur Belgeleri
              </h2>
              <p className="text-[11px] text-gray-400">
                Akademik, sosyal ve disiplin alanlarında kazanılan tescilli rozetler
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGES.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                  b.unlocked
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20'
                    : 'bg-gray-50 dark:bg-[#131C31] border-gray-200/60 dark:border-gray-800/60 opacity-60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-2xl flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      {b.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{b.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Goals */}
      {(activeTab === 'all' || activeTab === 'goals') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
              Dönem Sonu Akademik Hedefleri
            </h2>
            <p className="text-[11px] text-gray-400">
              Rehber öğretmen {profile.mentorTeacher} ile belirlenmiş akademik yol haritası
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    1. Dönem Ağırlıklı Ortalamasını 98 Üzerinde Tutmak
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Mevcut: {profile.gpa} (Hedef Başarıyla Korunuyor)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600">
                Hedefte
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Akıllı Tahta ve Python Kodlama Projesini Tamamlamak
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    1. ve 2. modül eksiksiz teslim edildi
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600">
                Devam Ediyor
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
