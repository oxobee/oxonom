'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Gamepad2,
  Atom,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  Layers,
  Flame,
  Search,
  ArrowRight,
  Code2,
  Compass,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'

interface StudentLearnViewProps {
  initialTab?: 'subjects' | 'topics' | 'activities' | 'games'
}

interface LearnModule {
  id: string
  title: string
  course: string
  category: 'subjects' | 'topics' | 'activities' | 'games'
  duration: string
  points: number
  status: 'active' | 'passive'
  gradient: string
  description: string
}

const LEARN_MODULES: LearnModule[] = [
  {
    id: 'lm-1',
    title: 'Divan Şiiri ve Aruz Vezni İnteraktif Alıştırması',
    course: 'Türk Dili ve Edebiyatı',
    category: 'activities',
    duration: '15 dk',
    points: 50,
    status: 'active',
    gradient: 'from-indigo-600 to-blue-700',
    description: 'Şiir beyitlerini inceleyerek nazım birimi ve kafiye şemalarını interaktif test edin.',
  },
  {
    id: 'lm-2',
    title: 'Matematiksel Fonksiyonlar ve Grafik Görselleştirici',
    course: 'Matematik',
    category: 'activities',
    duration: '20 dk',
    points: 60,
    status: 'active',
    gradient: 'from-emerald-600 to-teal-700',
    description: 'Doğrusal ve kuadratik fonksiyon parametrelerini canlı değiştirerek grafik davranışını gözlemleyin.',
  },
  {
    id: 'lm-3',
    title: 'Python Kod Blokları ve Algoritma Labirenti',
    course: 'Bilişim & Kodlama',
    category: 'games',
    duration: '25 dk',
    points: 100,
    status: 'active',
    gradient: 'from-purple-600 to-pink-700',
    description: 'Karakteri döngüler ve koşullu ifadeler kullanarak labirentin çıkışına ulaştırın.',
  },
  {
    id: 'lm-4',
    title: 'Akademik İngilizce Kelime Eşleştirme Oyunu',
    course: 'Yabancı Dil',
    category: 'games',
    duration: '10 dk',
    points: 40,
    status: 'active',
    gradient: 'from-amber-500 to-orange-600',
    description: 'B2-C1 seviyesi akademik kelimeleri eşanlamlılarıyla hızlıca eşleştirip puan toplayın.',
  },
  {
    id: 'lm-5',
    title: 'Sürtünmesiz Eğik Düzlem Fizik Simülasyonu',
    course: 'Fizik',
    category: 'activities',
    duration: '15 dk',
    points: 50,
    status: 'active',
    gradient: 'from-cyan-600 to-blue-600',
    description: 'Açı ve kütle değişkenlerini değiştirerek serbest düşme ve hızlanma ivmesini hesaplayın.',
  },
  {
    id: 'lm-6',
    title: 'Moleküler Yapı ve Periyodik Tablo 3D Simülasyonu',
    course: 'Fen Bilimleri',
    category: 'activities',
    duration: '30 dk',
    points: 80,
    status: 'passive',
    gradient: 'from-rose-600 to-red-700',
    description: '3D moleküler modelleme ve atom bağları simülasyonu (WebGL 3D motoru yakında açılacaktır).',
  },
]

export default function StudentLearnView({ initialTab = 'activities' }: StudentLearnViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'subjects' | 'topics' | 'activities' | 'games'>('all')
  const [selectedModule, setSelectedModule] = useState<LearnModule | null>(null)

  const handleStartModule = (mod: LearnModule) => {
    if (mod.status === 'passive') {
      toast('Bu modül şu anda geliştirme aşamasındadır ve yakında öğrenci kullanımına sunulacaktır.', {
        icon: '⏳',
      })
      return
    }
    setSelectedModule(mod)
  }

  const filtered = LEARN_MODULES.filter((m) => {
    if (activeTab === 'all') return true
    return m.category === activeTab
  })

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <Sparkles size={14} />
            <span>Etkileşimli Öğrenme</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Öğren ve Keşfet
            </h1>
            <MockBadge label="Mock Veri" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ders dışı konu tekrarları, eğitici zeka oyunları ve bilimsel simülasyonlar.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Simülasyonlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('games')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'games'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Eğitici Oyunlar
          </button>
        </div>
      </div>

      {/* Grid of Interactive Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((mod) => (
          <div
            key={mod.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-cyan-400/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header pill */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                  {mod.course}
                </span>
                {mod.status === 'passive' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Geliştirme
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400">{mod.duration}</span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              {/* Reward Points */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-50 dark:bg-[#131C31] text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                <Flame size={13} className="text-amber-500" />
                <span>+{mod.points} Başarı Puanı</span>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80">
              <button
                type="button"
                onClick={() => handleStartModule(mod)}
                className={`w-full py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mod.status === 'passive'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20'
                }`}
              >
                {mod.status === 'passive' ? (
                  <>
                    <Lock size={14} />
                    <span>Yakında Kullanıma Açılacak</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Etkinliği Başlat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Simulation Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-jakarta">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
                  {selectedModule.course} · İnteraktif Etkinlik
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                  {selectedModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/30 border border-cyan-500/20 text-center space-y-4">
              <Sparkles size={36} className="mx-auto text-cyan-400" />
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Etkinlik Başlatıldı</h4>
                <p className="text-xs text-cyan-100 max-w-md mx-auto leading-relaxed">
                  {selectedModule.description}
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-400">
                Puan: +{selectedModule.points} XP profilinize eklenecektir.
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Tebrikler! ${selectedModule.points} başarı puanı kazandınız.`)
                  setSelectedModule(null)
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Etkinliği Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
