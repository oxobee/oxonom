'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  CheckSquare,
  FileCheck,
  TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PassiveModuleNotice from '../PassiveModuleNotice'

export default function TeacherReportsView() {
  const [reportTab, setReportTab] = useState<'attendance' | 'assignments' | 'official'>('attendance')

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Ogrenci No,Ad Soyad,Sube,Devam Orani,Odev Basarisi\n101,Erçil UĞURLU,9-A,%94,%88\n102,Zeynep YILMAZ,9-A,%98,%95\n103,Ahmet KAYA,9-A,%91,%82"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "9-A_Sinif_Gelisim_Raporu.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Rapor CSV formatında dışa aktarıldı.')
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <BarChart3 size={15} />
            <span>Akademik İstatistik & Performans Analizi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Raporlarım
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sınıf devam çizelgeleri, ödev tamamlama oranları ve çıktı alma
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>CSV İndir</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <button
          type="button"
          onClick={() => setReportTab('attendance')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300'
          }`}
        >
          Devam & Yoklama Raporu
        </button>
        <button
          type="button"
          onClick={() => setReportTab('assignments')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300'
          }`}
        >
          Ödev Tamamlama Analizi
        </button>
        <button
          type="button"
          onClick={() => setReportTab('official')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'official'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300'
          }`}
        >
          Resmi Dönem Raporları
        </button>
      </div>

      {/* Attendance Analytics */}
      {reportTab === 'attendance' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                9-A Genel Devam Oranı
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                %94.2
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Son 30 gün verisi</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Ortalama Katılım
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                22.8 / 24
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Ders başına ortalama öğrenci</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                Raporlu / İzinli Günler
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                8 Gün
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Bu ay toplam izinli kayıt</div>
            </div>
          </div>
        </div>
      )}

      {/* Assignments Analytics */}
      {reportTab === 'assignments' && (
        <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-500">Zamanında Teslim Oranı</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                %89.5
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-500">Sınıf Ödev Başarı Ortalaması</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                86 / 100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official MEB reports (Passive) */}
      {reportTab === 'official' && (
        <PassiveModuleNotice
          moduleName="Resmi Dönem Sonu Raporlama & MEB e-Okul Karne Çıktıları"
          description="Bakanlık standartlarında resmi gelişim raporları, karne basımı ve dönem sonu başarı değerlendirme cetvelleri."
          missingDependency="MEB Resmi Raporlama Formatı & Elektronik İmza (e-İmza) Entegrasyonu"
          plannedFeatures={[
            'e-Okul uyumlu resmi karne cetveli',
            'Öğretmen kanaat notu ve davranış değerlendirme formu',
            'Elektronik imzalı dönem sonu not çizelgesi',
          ]}
          relatedActivePath="/teacher/reports"
          relatedActiveLabel="Raporlar Ana Sayfasına Dön"
        />
      )}
    </div>
  )
}
