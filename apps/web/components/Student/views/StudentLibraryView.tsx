'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookmarkCheck,
  FileText,
  Video,
  Headphones,
  Star,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  FolderOpen,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'

interface LibraryItem {
  id: string
  title: string
  course: string
  type: 'doc' | 'video' | 'audio'
  fileSize: string
  author: string
  date: string
  isFavorite: boolean
  description: string
}

const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib-1',
    title: '9. Sınıf Türk Edebiyatı Şiir Bilgisi & Edebi Sanatlar Kapsamlı Özeti',
    course: 'Türk Dili ve Edebiyatı',
    type: 'doc',
    fileSize: '3.4 MB (PDF)',
    author: 'Ebru TEKNECİ',
    date: '10 Ekim 2026',
    isFavorite: true,
    description: 'Divan ve Tanzimat edebiyatı nazım şekilleri, aruz kalıpları ve örnek beyit tahlilleri föyü.',
  },
  {
    id: 'lib-2',
    title: 'Birinci Dereceden Denklem ve Eşitsizlikler Formül Kartları',
    course: 'Matematik',
    type: 'doc',
    fileSize: '2.1 MB (PDF)',
    author: 'Ebru TEKNECİ',
    date: '08 Ekim 2026',
    isFavorite: false,
    description: 'Aralık kavramı, mutlak değer ve modelleme soruları için pratik çözüm yolları özeti.',
  },
  {
    id: 'lib-3',
    title: 'Python Temelleri: Değişkenler, Döngüler ve Koşullar Video Dersi',
    course: 'Bilişim & Kodlama',
    type: 'video',
    fileSize: '45 dk (HD Video)',
    author: 'Ebru TEKNECİ',
    date: '05 Ekim 2026',
    isFavorite: true,
    description: 'Akıllı tahta üzerinde canlı kodlama örnekleri ve algoritma akış şeması anlatımı.',
  },
  {
    id: 'lib-4',
    title: 'Academic English Listening & Debates Podcast Serisi (B2 Bölüm 1)',
    course: 'Yabancı Dil',
    type: 'audio',
    fileSize: '18 dk (Ses Kaydı)',
    author: 'Yabancı Dil Zümresi',
    date: '01 Ekim 2026',
    isFavorite: false,
    description: 'Teknoloji ve iklim krizleri üzerine üniversite münazara diyalogları ses kaydı.',
  },
  {
    id: 'lib-5',
    title: 'Fizik Madde ve Özkütle Deneyleri Laboratuvar Kılavuzu',
    course: 'Fizik',
    type: 'doc',
    fileSize: '1.8 MB (PDF)',
    author: 'Fen Bilimleri',
    date: '28 Eylül 2026',
    isFavorite: false,
    description: 'Düzgün geometrik cisimlerin hacim ölçümü ve sıvıların özkütle deney föyü.',
  },
]

interface StudentLibraryViewProps {
  initialTab?: 'all' | 'documents' | 'videos' | 'audio' | 'favorites'
}

export default function StudentLibraryView({ initialTab = 'all' }: StudentLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'videos' | 'audio' | 'favorites'>(initialTab)
  const [items, setItems] = useState<LibraryItem[]>(INITIAL_LIBRARY_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')

  const toggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    )
    toast.success('Favori listeniz güncellendi.')
  }

  const filtered = items.filter((item) => {
    if (activeTab === 'documents' && item.type !== 'doc') return false
    if (activeTab === 'videos' && item.type !== 'video') return false
    if (activeTab === 'audio' && item.type !== 'audio') return false
    if (activeTab === 'favorites' && !item.isFavorite) return false

    if (selectedCourse !== 'all' && item.course !== selectedCourse) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.course.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <BookmarkCheck size={14} />
            <span>Dijital Kaynaklar</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Eğitim Kütüphanesi
            </h1>
            <MockBadge label="Mock Veri" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Öğretmenler tarafından paylaşılan ders notları, video kayıtları ve kaynak dokümanlar.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Materyal veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Tabs & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 dark:border-gray-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Tüm Kaynaklar ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Dokümanlar & PDF
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Video Dersler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Sesli İçerikler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1526] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Favorilerim ({items.filter((i) => i.isFavorite).length})
          </button>
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="all">Tüm Dersler</option>
          <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
          <option value="Matematik">Matematik</option>
          <option value="Bilişim & Kodlama">Bilişim & Kodlama</option>
          <option value="Yabancı Dil">Yabancı Dil</option>
        </select>
      </div>

      {/* Library Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-cyan-400/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <Video size={16} />
                    ) : item.type === 'audio' ? (
                      <Headphones size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300">
                    {item.course}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    item.isFavorite
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-gray-500'
                  }`}
                >
                  <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131C31] text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>{item.author}</span>
                <span>{item.fileSize}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toast.success(`"${item.title}" önizleniyor...`)}
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-cyan-600 flex items-center gap-1 cursor-pointer"
              >
                <Eye size={13} />
                <span>Görüntüle</span>
              </button>

              <button
                type="button"
                onClick={() => toast.success(`"${item.title}" başarıyla indiriliyor...`)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>İndir</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
