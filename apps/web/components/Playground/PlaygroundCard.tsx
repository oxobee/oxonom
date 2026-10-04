'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Globe,
  Lock,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Settings,
  School,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Playground, updatePlayground } from '@services/playgrounds/playgrounds'
import { getPlaygroundThumbnailMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import ModuleVisualCover from './ModuleVisualCover'
import ModuleVisibilityModal from './ModuleVisibilityModal'
import {
  getModuleAssignment,
  saveModuleAssignment,
  ModuleAssignment,
} from '@services/playgrounds/moduleAssignments'

interface PlaygroundCardProps {
  playground: Playground
  orgslug: string
  canEdit?: boolean
  canManage?: boolean
}

export function detectCategory(playground: Playground): { key: string; label: string; color: string } {
  const text = `${playground.name} ${playground.description || ''}`.toLowerCase()
  if (text.includes('1. sınıf') || text.includes('1.sinif') || text.includes('1st grade')) {
    return { key: 'grade1', label: '1. Sınıf Temel Beceriler', color: 'bg-amber-100 text-amber-800 border-amber-200' }
  }
  if (text.includes('matematik') || text.includes('sayı') || text.includes('rakam') || text.includes('math') || text.includes('count')) {
    return { key: 'math', label: 'Matematik & Sayılar', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  }
  if (text.includes('harf') || text.includes('hece') || text.includes('okuma') || text.includes('türkçe') || text.includes('phonics') || text.includes('words')) {
    return { key: 'turkish', label: 'Türkçe & Okuma-Yazma', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  }
  if (text.includes('fen') || text.includes('doğa') || text.includes('bilim') || text.includes('science')) {
    return { key: 'science', label: 'Fen & Doğa', color: 'bg-teal-100 text-teal-800 border-teal-200' }
  }
  if (text.includes('kodlama') || text.includes('algoritma') || text.includes('robotik') || text.includes('coding')) {
    return { key: 'coding', label: 'Mantık & Kodlama', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  }
  return { key: 'general', label: 'Genel Modül', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export default function PlaygroundCard({ playground, orgslug, canEdit, canManage }: PlaygroundCardProps) {
  const { t, i18n } = useTranslation()
  const isTr = i18n.language?.startsWith('tr') !== false
  const { track } = useLHAnalytics('learner')
  const category = detectCategory(playground)

  const org = useOrg() as any
  const effectiveOrgId = playground.org_id || org?.id || 10
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)

  // Live assignment state
  const [assignment, setAssignment] = useState<ModuleAssignment>(() =>
    getModuleAssignment(effectiveOrgId, playground.playground_uuid, playground.published !== false)
  )

  useEffect(() => {
    const handleUpdate = () => {
      setAssignment(getModuleAssignment(effectiveOrgId, playground.playground_uuid, playground.published !== false))
    }
    window.addEventListener('oxonom_module_assignments_changed', handleUpdate)
    return () => window.removeEventListener('oxonom_module_assignments_changed', handleUpdate)
  }, [effectiveOrgId, playground.playground_uuid, playground.published])

  const isPublished = assignment.published && assignment.scope !== 'hidden'

  // Access badge
  let accessBadge = {
    icon: Globe,
    labelTr: 'Tüm Sınıflar',
    labelEn: 'All Classes',
    className: 'bg-emerald-100 text-emerald-800',
  }
  if (!isPublished) {
    accessBadge = {
      icon: Lock,
      labelTr: 'Gizli (Pasif)',
      labelEn: 'Hidden',
      className: 'bg-rose-100 text-rose-800',
    }
  } else if (assignment.scope === 'classes') {
    const count = assignment.assignedClasses?.length || 0
    accessBadge = {
      icon: School,
      labelTr: count > 0 ? `${count} Sınıf` : 'Seçili Sınıflar',
      labelEn: count > 0 ? `${count} Classes` : 'Assigned Classes',
      className: 'bg-blue-100 text-blue-800',
    }
  } else if (assignment.scope === 'students') {
    const count = assignment.assignedStudents?.length || 0
    accessBadge = {
      icon: Users,
      labelTr: count > 0 ? `${count} Öğrenci` : 'Özel Öğrenciler',
      labelEn: count > 0 ? `${count} Students` : 'Assigned Students',
      className: 'bg-purple-100 text-purple-800',
    }
  }

  const AccessIcon = accessBadge.icon

  const handleTogglePublish = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    const nextPublished = !isPublished
    const nextScope = nextPublished ? (assignment.scope === 'hidden' ? 'all' : assignment.scope) : 'hidden'

    saveModuleAssignment(effectiveOrgId, playground.playground_uuid, {
      published: nextPublished,
      scope: nextScope,
    })

    if (access_token) {
      try {
        await updatePlayground(playground.playground_uuid, { published: nextPublished }, access_token)
      } catch {
        // Fallback
      }
    }

    toast.success(
      nextPublished
        ? isTr
          ? 'Modül aktif edildi (yayında)'
          : 'Module published'
        : isTr
        ? 'Modül öğrencilerden gizlendi (pasif)'
        : 'Module hidden'
    )
    queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
    setIsUpdating(false)
  }

  const handleOpen = () => {
    track(AnalyticsEvent.PlaygroundOpened, {
      access_type: playground.access_type,
      published: playground.published,
      source: 'card',
    })
  }

  const thumbnailUrl =
    playground.thumbnail_image && playground.org_uuid
      ? getPlaygroundThumbnailMediaDirectory(
          playground.org_uuid,
          playground.playground_uuid,
          playground.thumbnail_image
        )
      : null

  const playgroundLink = getUriWithOrg(orgslug, `/playground/${playground.playground_uuid}`)

  // Strip category tag like [1. Sınıf Temel Beceriler] from display description for cleaner text
  const cleanDescription = (playground.description || '').replace(/\[.*?\]/g, '').trim()

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl nice-shadow overflow-hidden w-full transition-all duration-300 hover:scale-[1.015] hover:shadow-lg border border-gray-100">
      {/* Manage buttons for teachers/principals (Assign class & Toggle visibility) */}
      {canManage && (
        <div className="absolute top-2.5 end-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setShowManageModal(true)
            }}
            className="p-2 bg-white/95 backdrop-blur-md rounded-full hover:bg-white text-gray-700 hover:text-indigo-600 transition-all shadow-md flex items-center justify-center border border-gray-200 cursor-pointer"
            title={isTr ? 'Görünürlük & Sınıf/Öğrenci Ata' : 'Assign Class / Student'}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleTogglePublish()
            }}
            disabled={isUpdating}
            className="p-2 bg-white/95 backdrop-blur-md rounded-full hover:bg-white text-gray-700 hover:text-black transition-all shadow-md flex items-center justify-center border border-gray-200 cursor-pointer"
            title={isTr ? (isPublished ? 'Modülü Pasif Yap (Gizle)' : 'Modülü Aktif Yap (Yayınla)') : 'Toggle Visibility'}
          >
            {isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-rose-600" />}
          </button>
        </div>
      )}

      {/* Thumbnail */}
      <Link href={playgroundLink} onClick={handleOpen} className="block relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-50/50 via-slate-50 to-amber-50/30">
        {thumbnailUrl ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <ModuleVisualCover
            name={playground.name}
            description={playground.description || ''}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Badges — bottom left */}
        <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1.5 flex-wrap">
          <span className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-full shadow-xs ${accessBadge.className}`}>
            <AccessIcon className="w-2.5 h-2.5" />
            {isTr ? accessBadge.labelTr : accessBadge.labelEn}
          </span>
          {!isPublished && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700 rounded-full shadow-xs">
              {isTr ? 'Gizli' : 'Draft'}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col space-y-2 flex-1 justify-between">
        <div>
          {/* Category Pill */}
          <div className="mb-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${category.color}`}>
              <BookOpen className="w-2.5 h-2.5" />
              <span>{category.label}</span>
            </span>
          </div>

          <Link
            href={playgroundLink}
            onClick={handleOpen}
            className="text-[15px] font-bold text-gray-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2"
          >
            {playground.name}
          </Link>

          {cleanDescription && (
            <p className="text-[12px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {cleanDescription}
            </p>
          )}
        </div>

        <div className="pt-2.5 flex items-center justify-between border-t border-gray-100 mt-2">
          <span className="text-[11px] text-gray-400 font-medium">
            {isTr ? 'Çok Dilli (TR / EN)' : 'Multilingual'}
          </span>
          <Link
            href={playgroundLink}
            onClick={handleOpen}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>{isTr ? 'Modülü Başlat' : 'Start Module'}</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Manage Visibility Modal */}
      {showManageModal && (
        <ModuleVisibilityModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          module={playground}
          orgId={effectiveOrgId}
          onSaved={(updated) => {
            setAssignment(updated)
            queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
          }}
        />
      )}
    </div>
  )
}
