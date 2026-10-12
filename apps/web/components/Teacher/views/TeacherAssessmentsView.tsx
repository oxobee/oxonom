'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Award,
  Sparkles,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  ChevronRight,
  BarChart2,
} from 'lucide-react'
import PassiveModuleNotice from '../PassiveModuleNotice'

export default function TeacherAssessmentsView() {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'question-bank' | 'exams'>('quizzes')

  // Sample verified quiz questions in Question Bank
  const SAMPLE_QUESTIONS = [
    {
      id: 1,
      subject: 'Türk Dili ve Edebiyatı',
      grade: '9. Sınıf',
      type: 'Çoktan Seçmeli',
      question: 'Aşağıdaki cümlelerin hangisinde mecaz anlamlı bir sözcük kullanılmıştır?',
      options: ['A) Masanın üzerindeki kitapları topladı.', 'B) Sıcak bakışlarıyla salondaki herkesi etkiledi.', 'C) Kapıyı yavaşça kapatıp dışarı çıktı.', 'D) Sabah erkenden yürüyüşe çıktı.'],
      answer: 'B',
      difficulty: 'Orta',
    },
    {
      id: 2,
      subject: 'Türk Dili ve Edebiyatı',
      grade: '9. Sınıf',
      type: 'Açık Uçlu',
      question: 'Bir paragrafta düşünceyi geliştirme yollarından "tanık gösterme" ile "örneklendirme" arasındaki temel farkı açıklayınız.',
      answer: 'Tanık göstermede alanında uzman bir kişinin doğrudan sözüne yer verilir, örneklendirmede ise konuyla ilgili durum veya kavramlar sıralanır.',
      difficulty: 'İleri',
    },
    {
      id: 3,
      subject: 'Türkçe',
      grade: '5. Sınıf',
      type: 'Çoktan Seçmeli',
      question: '"Soğuk havada dışarı çıkınca hastalandı." cümlesindeki anlam ilişkisi aşağıdakilerden hangisidir?',
      options: ['A) Amaç - Sonuç', 'B) Neden - Sonuç', 'C) Koşul - Sonuç', 'D) Karşılaştırma'],
      answer: 'B',
      difficulty: 'Kolay',
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Award size={15} />
            <span>Ölçme, Değerlendirme & Soru Bankası</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Sınavlar ve Notlar
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Soru bankası, sınıf içi quizler ve ölçme değerlendirme araçları
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Soru Bankası & Quizler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-[#1A2338] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Yazılı Sınav & Not Girişi
          </button>
        </div>
      </div>

      {/* ── TAB 1: QUESTION BANK & QUIZZES ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Kayıtlı Sorular & Etkileşimli Quiz Örnekleri
            </h2>
            <Link
              href="/teacher/ai-assistant/question-generator"
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles size={14} />
              <span>Yapay Zekâ ile Soru Üret</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {q.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>
                  {q.options && (
                    <div className="space-y-1 pt-1">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-2 rounded-lg bg-gray-50 dark:bg-[#161D2E] text-gray-700 dark:text-gray-300 font-medium"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Tür: {q.type}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Cevap: {q.answer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: EXAMS & OFFICIAL GRADEBOOK (PASSIVE) ── */}
      {activeTab === 'exams' && (
        <PassiveModuleNotice
          moduleName="Yazılı Sınavlar, Not Defteri ve MEB e-Okul Not Aktarımı"
          description="Okul genelinde gerçekleştirilen yazılı ortak sınavların sonuç girişi, optik form okuma ve e-Okul resmi not defteri aktarımı modülü."
          missingDependency="MEB e-Okul Not Aktarım Web Servisi & Optik Cevap Anahtarı Okuma Altyapısı"
          plannedFeatures={[
            'Ortak yazılı sınav takvimi ve salon listeleri',
            'Optik form tarama ve otomatik puanlama',
            'e-Okul 1. ve 2. yazılı not defteri entegrasyonu',
            'Soru ve kazanım analizli sınav başarı grafikleri',
          ]}
          relatedActivePath="/teacher/assessments"
          relatedActiveLabel="Soru Bankasına Dön"
        />
      )}
    </div>
  )
}
