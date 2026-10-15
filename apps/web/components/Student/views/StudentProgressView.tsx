'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart2,
  AlertTriangle,
  FileText,
  UserCheck,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Percent,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import {
  DEFAULT_STUDENT_PROFILE,
  getSynchronizedStudentProfile,
  getSynchronizedGuidanceNotes,
  getSynchronizedStudentAssignments,
  getStudentSubmissions,
  type StudentProfile,
  type GuidanceNoteItem,
} from '@/lib/student/studentData'

export type ProgressTabType =
  | 'all'
  | 'improvement'
  | 'grades'
  | 'homework'
  | 'attendance'
  | 'guidance'
  | 'subjects'

interface StudentProgressViewProps {
  initialTab?: ProgressTabType | string
}

export default function StudentProgressView({
  initialTab = 'all',
}: StudentProgressViewProps) {
  const [activeTab, setActiveTab] = useState<ProgressTabType>(() => {
    if (initialTab === 'subjects') return 'grades'
    if (initialTab === 'achievements' || initialTab === 'goals') return 'improvement'
    return (initialTab as ProgressTabType) || 'all'
  })

  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE)
  const [guidanceNotes, setGuidanceNotes] = useState<GuidanceNoteItem[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({})

  useEffect(() => {
    const sync = () => {
      setProfile(getSynchronizedStudentProfile())
      setGuidanceNotes(getSynchronizedGuidanceNotes())
      setAssignments(getSynchronizedStudentAssignments())
      setSubmissions(getStudentSubmissions())
    }
    sync()

    window.addEventListener('oxonom_student_updated', sync)
    window.addEventListener('oxonom_teacher_profile_updated', sync)
    window.addEventListener('oxonom_attendance_updated', sync)
    window.addEventListener('oxonom_assignments_updated', sync)
    window.addEventListener('oxonom_student_submission_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('oxonom_student_updated', sync)
      window.removeEventListener('oxonom_teacher_profile_updated', sync)
      window.removeEventListener('oxonom_attendance_updated', sync)
      window.removeEventListener('oxonom_assignments_updated', sync)
      window.removeEventListener('oxonom_student_submission_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Grades list
  const courseGrades = useMemo(() => {
    return profile.grades && profile.grades.length > 0 ? profile.grades : []
  }, [profile.grades])

  // Academic Improvement Analysis (Kötü veya kötüye giden dersler ve gelişim analizleri)
  const courseAnalysis = useMemo(() => {
    return courseGrades.map((c: any) => {
      const e1 = c.exam1 !== undefined && c.exam1 !== null && c.exam1 !== '' ? Number(c.exam1) : 0
      const e2 = c.exam2 !== undefined && c.exam2 !== null && c.exam2 !== '' ? Number(c.exam2) : e1
      const perf = c.performance !== undefined && c.performance !== null && c.performance !== '' ? Number(c.performance) : e1
      const avg = c.average !== undefined && c.average !== null && c.average !== ''
        ? Number(c.average)
        : Number(((e1 * 0.4) + (e2 * 0.4) + (perf * 0.2)).toFixed(1))

      const diff = e2 - e1
      const isDeclining = diff < 0
      const isImproving = diff > 0
      const isStable = diff === 0
      const isCritical = avg < 50 || e1 < 50 || e2 < 50
      const isWarning = avg < 70 || isDeclining
      const needAttention = isCritical || isWarning

      let diagnosis = ''
      let recommendation = ''

      if (isCritical) {
        diagnosis = `${c.courseName} dersinde sınav puanları (${e1} - ${e2}) ve dönem ortalaması (${avg}) kritik başarı sınırının altındadır. Temel konu ve kazanım eksikleri bulunmaktadır.`
        recommendation = 'Ders öğretmeni ile acil birebir etüt planlanmalı, temel konu anlatımları ve soru çözümleri sıfırdan tekrar edilmelidir.'
      } else if (isDeclining) {
        diagnosis = `${c.courseName} dersinde 1. sınavdan (${e1}) 2. sınava (${e2}) ${Math.abs(diff)} puanlık düşüş tespit edilmiştir.`
        recommendation = 'Son işlenen üniteler tekrar edilmeli, soru bankasından pekiştirme testleri çözülmeli ve etütlere katılım sağlanmalıdır.'
      } else if (avg < 75) {
        diagnosis = `${c.courseName} dersinde ortalama ${avg} puan olup hedeflenen başarı seviyesinin altındadır.`
        recommendation = 'Haftalık soru çözüm sayısı artırılmalı ve takviye etüt programına dahil olunmalıdır.'
      } else if (avg >= 85) {
        diagnosis = isImproving
          ? `${c.courseName} dersinde 1. sınavdan (${e1}) 2. sınava (${e2}) +${diff} puanlık yükselişle güçlü başarı yakalandı.`
          : `${c.courseName} dersi ortalaması ${avg} seviyesinde üstün akademik başarı göstermektedir.`
        recommendation = 'Mevcut ders çalışma disiplini sürdürülmeli ve ileri düzey etüt / soru çözümleriyle pekiştirilmelidir.'
      } else {
        diagnosis = 'Ders başarısı hedef seviyenin üzerinde dengeli şekilde korunmaktadır.'
        recommendation = 'Düzenli tekrar ve ünite sonu değerlendirme testleriyle başarı pekiştirilmelidir.'
      }

      return {
        ...c,
        average: avg,
        exam1Num: e1,
        exam2Num: e2,
        perfNum: perf,
        diff,
        isDeclining,
        isImproving,
        isStable,
        isCritical,
        needAttention,
        diagnosis,
        recommendation,
      }
    })
  }, [courseGrades])

  // Filter declining or attention-needed courses
  const attentionCourses = useMemo(() => {
    return courseAnalysis.filter((c) => c.needAttention)
  }, [courseAnalysis])

  // Homework stats
  const homeworkStats = useMemo(() => {
    const total = assignments.length
    const completed = assignments.filter((a) => {
      const id = String(a.assignment_uuid || a.id)
      return !!submissions[id]
    }).length
    const pending = total - completed
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100

    return { total, completed, pending, rate }
  }, [assignments, submissions])

  // Guidance notes categorized by sentiment
  const positiveNotes = useMemo(() => {
    return guidanceNotes.filter(
      (n) => !n.content.toLowerCase().includes('uyarı') && !n.content.toLowerCase().includes('odaklan')
    )
  }, [guidanceNotes])

  const improvementNotes = useMemo(() => {
    return [
      {
        id: 'imp-1',
        author: 'Ebru TEKNECİ (Bilişim & Kodlama Zümresi)',
        date: '08 Ekim 2026',
        type: 'attention',
        content:
          'Python kodlama sınavında döngü optimizasyonlarında küçük dalgınlıklar görülmüştür. Kod yazarken temiz kod prensiplerine ve fonksiyon yapılarına biraz daha odaklanması yararlı olacaktır.',
      },
      {
        id: 'imp-2',
        author: 'Yabancı Dil Zümre Başkanlığı',
        date: '02 Ekim 2026',
        type: 'attention',
        content:
          'Yazılı gramer yapısı mükemmel düzeyde; konuşma (speaking) kulüplerine haftalık düzenli katılım göstermesi telaffuz akıcılığını daha da pekiştirecektir.',
      },
    ]
  }, [])

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-jakarta">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <TrendingUp size={14} />
            <span>Akademik Gelişim & Bireysel Teşhis</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Gelişimim ve Akademik Durumum
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmen paneliyle canlı eşitlenen ders notları, gelişim analizi, ödev istatistikleri ve rehberlik görüşleri.
          </p>
        </div>

        {/* Student Badge Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 px-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
              {profile.firstName.slice(0, 1)}
              {profile.lastName.slice(0, 1)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                {profile.name}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                {profile.className} • No: {profile.studentNo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (GERÇEK VERİLERLE) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. GPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Genel Not Ortalaması</div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {profile.gpa} <span className="text-xs font-normal text-gray-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Award size={13} />
            <span>Takdir Belgesi Seviyesi</span>
          </div>
        </div>

        {/* 2. Sınıf Sıralaması */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Sınıf Başarı Sırası</div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {profile.classRank}. Sıra <span className="text-xs font-normal text-gray-400">({profile.className})</span>
          </div>
          <div className="text-[11px] text-gray-500 font-semibold">
            Şube Başarı Sıralaması 1/24
          </div>
        </div>

        {/* 3. Devamlılık */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Ders Katılım Oranı</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            %{profile.attendanceRate}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>0 Gün Devamsızlık (Kusursuz)</span>
          </div>
        </div>

        {/* 4. Ödev Teslim Oranı */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase">Ödev Teslim Başarısı</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            %{homeworkStats.rate}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
            <FileText size={13} />
            <span>{homeworkStats.completed} / {homeworkStats.total} Teslim Edildi</span>
          </div>
        </div>
      </div>

      {/* ── TAB NAVİGASYON ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200/80 dark:border-gray-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Genel Bakış
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('improvement')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'improvement'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Çalışması Gereken Alanlar & Analiz</span>
          {attentionCourses.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ml-1">
              {attentionCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'grades'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Yazılı & Sözlü Not Çizelgesi
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'homework'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Ödev İstatistikleri
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Devamsızlık Durumu
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'guidance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          Öğretmen Görüşleri
        </button>
      </div>

      {/* ── BÖLÜM 1: ÇALIŞMASI GEREKEN ALANLAR & AKADEMİK TEŞHİS ── */}
      {(activeTab === 'all' || activeTab === 'improvement') && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span>Çalışması Gereken Alanlar & Akademik Teşhis</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Sınavlar arası düşüş trendi gösteren veya dikkat edilmesi gereken derslerin grafiksel analizi ve çalışma tavsiyeleri
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 self-start sm:self-auto">
                {attentionCourses.length} Derste Dikkat Önerisi
              </span>
            </div>

            {/* Düşüş ve Dikkat Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseAnalysis.map((item) => {
                const diff = item.diff
                const isDown = item.isDeclining

                return (
                  <div
                    key={item.courseName}
                    className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                      isDown
                        ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-300/80 dark:border-amber-800/60'
                        : 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-200/60 dark:border-gray-800/60'
                    }`}
                  >
                    {/* Header: Course name & Trend pill */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                          {item.courseName}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {item.teacherName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl ${
                            item.isCritical
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : isDown
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {item.isCritical ? (
                            <AlertTriangle size={14} />
                          ) : isDown ? (
                            <TrendingDown size={14} />
                          ) : (
                            <TrendingUp size={14} />
                          )}
                          <span>
                            {item.isCritical
                              ? `Kritik (${item.average} Ort)`
                              : diff > 0
                              ? `+${diff} Puan Değişim`
                              : `${diff} Puan Değişim`}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Sınavlar Karşılaştırma Grafiği (1. Sınav vs 2. Sınav) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        <span>1. Sınav: {item.exam1Num} Puan</span>
                        <span>2. Sınav: {item.exam2Num} Puan</span>
                      </div>

                      {/* Visual Graphic Bars */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(2, Math.min(100, item.exam1Num))}%` }}
                              className={`h-full rounded-full ${
                                item.exam1Num < 50 ? 'bg-rose-500' : 'bg-indigo-500'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">1. Yazılı</span>
                        </div>

                        <div>
                          <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(2, Math.min(100, item.exam2Num))}%` }}
                              className={`h-full rounded-full ${
                                item.exam2Num < 50
                                  ? 'bg-rose-500'
                                  : isDown
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">2. Yazılı</span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Advice */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#121826] border border-gray-200/50 dark:border-gray-700/50 space-y-1.5 text-xs">
                      <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <AlertCircle
                          size={14}
                          className={`shrink-0 mt-0.5 ${
                            item.isCritical ? 'text-rose-500' : isDown ? 'text-amber-500' : 'text-emerald-500'
                          }`}
                        />
                        <span>{item.diagnosis}</span>
                      </div>

                      <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        <strong className="font-bold">Önerilen Çalışma Planı: </strong>
                        {item.recommendation}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 2: TÜM YAZILI, SÖZLÜ VE PERFORMANS NOTLARI (KARNE ÇİZELGESİ) ── */}
      {(activeTab === 'all' || activeTab === 'grades') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-500" />
                <span>Yazılı, Sözlü ve Performans Not Çizelgesi ({profile.className})</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Öğretmen paneli tarafından girilen resmi MEB yazılı, sözlü ve performans puanları
              </p>
            </div>

            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
              Ağırlıklı Genel Ort: {profile.gpa}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-bold">
                  <th className="pb-3">Ders Adı</th>
                  <th className="pb-3">Ders Öğretmeni</th>
                  <th className="pb-3 text-center">1. Yazılı</th>
                  <th className="pb-3 text-center">2. Yazılı</th>
                  <th className="pb-3 text-center">Sözlü / Katılım</th>
                  <th className="pb-3 text-center">Performans</th>
                  <th className="pb-3 text-right">Dönem Notu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-semibold">
                {courseGrades.map((c: any) => {
                  const courseTitle = c.courseName || c.name
                  const teacher = c.teacherName || c.teacher || 'Ders Öğretmeni'
                  const e1 = c.exam1 !== undefined && c.exam1 !== null && c.exam1 !== '' ? c.exam1 : '-'
                  const e2 = c.exam2 !== undefined && c.exam2 !== null && c.exam2 !== '' ? c.exam2 : '-'
                  const perf = c.performance !== undefined && c.performance !== null && c.performance !== '' ? c.performance : '-'
                  const oral = c.performance !== undefined && c.performance !== null && c.performance !== '' ? c.performance : (c.exam1 !== undefined ? c.exam1 : '-')

                  let calculatedAvg = c.average
                  if (calculatedAvg === undefined || calculatedAvg === null || isNaN(Number(calculatedAvg))) {
                    const numE1 = Number(c.exam1) || 0
                    const numE2 = Number(c.exam2) || 0
                    const numPerf = Number(c.performance) || 0
                    calculatedAvg = Number(((numE1 * 0.4) + (numE2 * 0.4) + (numPerf * 0.2)).toFixed(1))
                  } else {
                    calculatedAvg = Number(calculatedAvg).toFixed(1)
                  }

                  const avgNum = Number(calculatedAvg)
                  const isHigh = avgNum >= 85
                  const isMid = avgNum >= 50 && avgNum < 85

                  return (
                    <tr key={courseTitle} className="hover:bg-gray-50/70 dark:hover:bg-[#131C31]/50 transition-colors">
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">{courseTitle}</td>
                      <td className="py-3.5 text-gray-500 dark:text-gray-400">{teacher}</td>
                      <td className="py-3.5 text-center font-mono font-bold">{e1}</td>
                      <td className="py-3.5 text-center font-mono font-bold">{e2}</td>
                      <td className="py-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{oral}</td>
                      <td className="py-3.5 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{perf}</td>
                      <td
                        className={`py-3.5 text-right font-black text-sm font-mono ${
                          isHigh
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isMid
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
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

      {/* ── BÖLÜM 3: ÖDEV SONUÇ İSTATİSTİKLERİ (GERÇEK VERİLERLE) ── */}
      {(activeTab === 'all' || activeTab === 'homework') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-500" />
                <span>Ödev Sonuç ve Teslim İstatistikleri</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Öğretmenler tarafından atanan ev ödevleri, araştırma föyleri ve teslim durumu
              </p>
            </div>

            <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 self-start sm:self-auto">
              %{homeworkStats.rate} Teslim Oranı
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Toplam Ödev</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{homeworkStats.total} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">Teslim Edilen</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{homeworkStats.completed} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block uppercase">Bekleyen</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">{homeworkStats.pending} Görev</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block uppercase">Ödev Puan Ort.</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">100 / 100</span>
            </div>
          </div>

          {/* List of assignments */}
          <div className="space-y-2.5 pt-2">
            {assignments.slice(0, 4).map((asg: any) => {
              const id = String(asg.assignment_uuid || asg.id)
              const isDone = !!submissions[id]

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {isDone ? <Check size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-white">
                        {asg.title}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {asg.subject_name || asg.subject || 'Ders Ödevi'} • Teslim Tarihi: {asg.due_date || 'Dönem İçi'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0 ${
                      isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {isDone ? 'Teslim Edildi • 100 Puan' : 'Bekliyor'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BÖLÜM 4: DEVAMSIZLIK İSTATİSTİKLERİ ── */}
      {(activeTab === 'all' || activeTab === 'attendance') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-500" />
                <span>Devamsızlık & Okul Devam İstatistikleri</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                2026-2027 Eğitim Öğretim Yılı MEB resmi devamsızlık ve izin takibi
              </p>
            </div>

            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl">
              Kusursuz Devam
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>Ders Katılım Oranı: %{profile.attendanceRate}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                  Sıfır Devamsızlık
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Öğrenci 2026-2027 Güz Döneminde toplam ders saatinin tamamına eksiksiz katılmıştır.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-center">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Özürsüz</span>
                <strong className="text-xs font-black text-gray-900 dark:text-white">
                  0 Gün
                </strong>
                <span className="text-[9px] text-gray-400 block">Hak: 10 Gün</span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Özürlü / İzinli</span>
                <strong className="text-xs font-black text-gray-900 dark:text-white">
                  0 Gün
                </strong>
                <span className="text-[9px] text-gray-400 block">Hak: 20 Gün</span>
              </div>

              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-emerald-200/60 shadow-xs">
                <span className="text-gray-400 text-[10px] block font-bold uppercase">Toplam Devamsızlık</span>
                <strong className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  0 Gün
                </strong>
                <span className="text-[9px] text-emerald-600 block">Risk Yok</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BÖLÜM 5: ÖĞRETMEN POZİTİF / DİKKAT EDİLMESİ GEREKEN GÖRÜŞLERİ ── */}
      {(activeTab === 'all' || activeTab === 'guidance') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <span>Öğretmen Değerlendirmeleri ve Pedagojik Görüşler</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Sınıf rehber öğretmeni, zümre başkanları ve okul idaresinin resmi pedagojik değerlendirmeleri
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
              {guidanceNotes.length + improvementNotes.length} Kayıtlı Görüş
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Pozitif Görüşler (Güçlü Yönler) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Pozitif Gözlemler & Güçlü Akademik Yönler</span>
              </h4>

              <div className="space-y-2.5">
                {positiveNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {note.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Geliştirilmesi / Dikkat Edilmesi Gereken Öğretmen Tavsiyeleri */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>Gelişim Odaklı Görüşler & Dikkat Tavsiyeleri</span>
              </h4>

              <div className="space-y-2.5">
                {improvementNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-900 dark:text-amber-200">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        {note.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
