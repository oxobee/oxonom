'use client'

import React from 'react'
import { Database, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react'

export interface MockBadgeProps {
  label?: string
  size?: 'xs' | 'sm' | 'md'
  variant?: 'amber' | 'subtle' | 'card' | 'banner' | 'outline' | 'live'
  className?: string
  tooltip?: string
  description?: string
}

export function MockBadge({
  label = 'Mock Veri',
  size = 'xs',
  variant,
  className = '',
  tooltip,
  description,
}: MockBadgeProps) {
  const isLive = label === 'Canlı Senkronize' || label === 'Canlı' || variant === 'live'
  const effectiveVariant = variant || (isLive ? 'live' : 'amber')

  const effectiveTooltip =
    tooltip ||
    (isLive
      ? 'Bu alan güncel ve senkronize gerçek sistem verisidir.'
      : 'Bu veri canlı veritabanından çekilmemektedir (Yerel Mock / Demo Veri).')

  if (effectiveVariant === 'banner') {
    return (
      <div
        className={`px-3 py-2 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs gap-2 select-none ${className}`}
      >
        <div className="flex items-center gap-2">
          <Database size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold text-[11px]">
            {description || 'Bu alandaki istatistikler ve kayıtlar mock (simülasyon) veridir; veritabanından dinamik çekilmemektedir.'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 border border-amber-500/30">
          {label}
        </span>
      </div>
    )
  }

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 rounded gap-1 font-mono',
    sm: 'text-[10px] px-2 py-0.5 rounded-md gap-1.5 font-mono',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-mono',
  }

  const variantClasses = {
    amber:
      'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-extrabold shadow-2xs',
    live:
      'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold shadow-2xs',
    subtle:
      'bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/20 font-bold',
    outline:
      'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/40 font-bold',
    card:
      'bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold backdrop-blur-xs',
  }

  return (
    <span
      title={effectiveTooltip}
      className={`inline-flex items-center select-none shrink-0 tracking-tight transition-colors ${sizeClasses[size]} ${variantClasses[effectiveVariant] || variantClasses.amber} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
        }`}
      />
      <span>{label}</span>
    </span>
  )
}

export default MockBadge
