'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Folder,
  Download,
  Share2,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TeacherFile {
  id: string
  name: string
  category: 'lesson' | 'smartboard' | 'generated' | 'shared'
  categoryLabel: string
  size: string
  updatedAt: string
}

export default function TeacherFilesView() {
  const [filter, setFilter] = useState<'all' | 'lesson' | 'smartboard' | 'generated'>('all')

  const FILES: TeacherFile[] = [
    {
      id: 'f-1',
      name: '9-A_Edebiyat_Metin_Tahlili_Ders_Notlari.pdf',
      category: 'lesson',
      categoryLabel: 'Ders Materyali',
      size: '2.8 MB',
      updatedAt: 'Bugün 10:15',
    },
    {
      id: 'f-2',
      name: 'Akilli_Tahta_Cizimleri_Paragraf_Semasi.png',
      category: 'smartboard',
      categoryLabel: 'Tahta Çıktısı',
      size: '1.2 MB',
      updatedAt: 'Dün 14:30',
    },
    {
      id: 'f-3',
      name: 'YapayZeka_Calisma_Kagidi_SozcukteAnlam.pdf',
      category: 'generated',
      categoryLabel: 'Yapay Zekâ Çıktısı',
      size: '640 KB',
      updatedAt: '3 gün önce',
    },
    {
      id: 'f-4',
      name: '5-A_Turkce_Haftalik_Odev_Metinleri.docx',
      category: 'lesson',
      categoryLabel: 'Ders Materyali',
      size: '1.5 MB',
      updatedAt: 'Geçen hafta',
    },
  ]

  const filtered = FILES.filter((f) => filter === 'all' || f.category === filter)

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <FileText size={15} />
            <span>Kişisel & Sınıf Paylaşımlı Belgeler</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Dosyalarım ve Paylaşımlar
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders dosyaları, tahta çıktıları ve yapay zekâ belgeleri
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Dosya yükleme penceresi açıldı.')}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Upload size={15} />
          <span>Yeni Dosya Yükle</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'all', label: 'Tüm Dosyalar' },
          { key: 'lesson', label: 'Ders Materyalleri' },
          { key: 'smartboard', label: 'Akıllı Tahta Çıktıları' },
          { key: 'generated', label: 'Yapay Zekâ Dosyaları' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === t.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Files List */}
      <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {file.name}
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {file.categoryLabel}
                  </span>
                  <span>•</span>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => toast.success(`${file.name} indirildi.`)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                title="İndir"
              >
                <Download size={14} />
              </button>
              <button
                type="button"
                onClick={() => toast.success('Paylaşım bağlantısı panoya kopyalandı.')}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Sınıfla Paylaş"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
