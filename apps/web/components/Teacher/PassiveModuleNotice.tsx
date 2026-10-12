'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock,
  ArrowLeft,
  Server,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'

interface PassiveModuleNoticeProps {
  moduleName: string
  description?: string
  missingDependency?: string
  plannedFeatures?: string[]
  relatedActivePath?: string
  relatedActiveLabel?: string
}

export default function PassiveModuleNotice({
  moduleName,
  description = 'Bu modül Oxonom EDU v2 yol haritasında planlanmış olup altyapı hazırlığı devam etmektedir.',
  missingDependency = 'Harici servis veya backend entegrasyonu',
  plannedFeatures = [],
  relatedActivePath = '/teacher/dashboard',
  relatedActiveLabel = 'Ana Sayfaya Dön',
}: PassiveModuleNoticeProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 font-jakarta">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/teacher/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Öğretmen Merkezi
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-bold">{moduleName}</span>
      </div>

      {/* Main Notice Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-5">
          <Clock size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
          <span>Geliştirme Aşamasında • Pasif Modül</span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {moduleName}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mb-6">
          {description}
        </p>

        {/* Missing Dependency Box */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4.5 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-extrabold tracking-wide uppercase">
            <Server size={14} />
            <span>Gerekli Sistem Bağımlılığı</span>
          </div>
          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 font-mono leading-relaxed">
            {missingDependency}
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
            * Oxonom Edu sistem bütünlüğü gereği, gerçek veri veya resmi entegrasyonu bulunmayan özellikler simüle edilmemekte ve pasif olarak korunmaktadır.
          </p>
        </div>

        {/* Planned Features List if any */}
        {plannedFeatures.length > 0 && (
          <div className="mb-6 space-y-2.5">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Planlanan Temel Yetenekler
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#161F33] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300"
                >
                  <Layers size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href={relatedActivePath}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <LayoutDashboard size={15} />
            <span>{relatedActiveLabel}</span>
          </Link>
          <Link
            href="/teacher/dashboard"
            className="h-11 px-5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
