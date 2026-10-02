'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, Lock, Users, Pencil, Sparkles, BookOpen, Eye, EyeOff, Settings, X, CheckSquare, Square } from 'lucide-react'
import { Cube } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Playground, updatePlayground, addUserGroupToPlayground, removeUserGroupFromPlayground, getPlaygroundUserGroups } from '@services/playgrounds/playgrounds'
import { getUserGroups, getMyUserGroups } from '@services/usergroups/usergroups'
import { getPlaygroundThumbnailMediaDirectory } from '@services/media/media'
import { getUriWithOrg } from '@services/config/config'
import { useLHAnalytics, AnalyticsEvent } from '@services/analytics'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import ModuleVisualCover from './ModuleVisualCover'

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

const accessConfig = {
  public: { icon: Globe, labelTr: 'Herkese Açık', labelEn: 'Public', className: 'bg-emerald-100 text-emerald-800' },
  authenticated: { icon: Lock, labelTr: 'Tüm Sınıflar', labelEn: 'All Classes', className: 'bg-indigo-100 text-indigo-800' },
  restricted: { icon: Users, labelTr: 'Seçili Sınıflar', labelEn: 'Assigned Classes', className: 'bg-amber-100 text-amber-800' },
}

export default function PlaygroundCard({ playground, orgslug, canEdit, canManage }: PlaygroundCardProps) {
  const { t, i18n } = useTranslation()
  const isTr = i18n.language?.startsWith('tr') !== false
  const { track } = useLHAnalytics('learner')
  const access = accessConfig[playground.access_type as keyof typeof accessConfig] || accessConfig.authenticated
  const AccessIcon = access.icon
  const category = detectCategory(playground)

  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const handleTogglePublish = async () => {
    if (!access_token || isUpdating) return
    setIsUpdating(true)
    try {
      await updatePlayground(playground.playground_uuid, { published: !playground.published }, access_token)
      toast.success(isTr ? 'Durum güncellendi' : 'Status updated')
      queryClient.invalidateQueries({ queryKey: queryKeys.playgrounds.list(orgslug) })
    } catch {
      toast.error(isTr ? 'Güncelleme başarısız' : 'Update failed')
    } finally {
      setIsUpdating(false)
    }
  }

  const org = useOrg() as any
  const effectiveOrgId = playground.org_id || org?.id || 1

  const openManageModal = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!access_token) return
    setShowManageModal(true)
    setLoadingClasses(true)
    try {
      const [allRes, myRes, assignedRes] = await Promise.allSettled([
        getUserGroups(effectiveOrgId, access_token),
        getMyUserGroups(effectiveOrgId, access_token),
        getPlaygroundUserGroups(playground.playground_uuid, access_token)
      ])
      
      const extractArray = (res: PromiseSettledResult<any>) => {
        if (res.status !== 'fulfilled' || !res.value) return []
        const val = res.value
        if (Array.isArray(val)) return val
        if (val.data && Array.isArray(val.data)) return val.data
        return []
      }

      const allList = extractArray(allRes)
      const myList = extractArray(myRes)

      const combinedMap = new Map<string, any>()
      for (const item of [...allList, ...myList]) {
        const key = item.usergroup_uuid || String(item.id)
        if (key && !combinedMap.has(key)) {
          combinedMap.set(key, item)
        }
      }
      setAvailableClasses(Array.from(combinedMap.values()))
      
      const assignedList = extractArray(assignedRes)
      setAssignedClasses(assignedList.map((a: any) => a.usergroup_uuid))
    } catch {
      toast.error(isTr ? 'Sınıflar yüklenemedi' : 'Failed to load classes')
    } finally {
      setLoadingClasses(false)
    }
  }

  const toggleClass = async (ugUuid: string) => {
    if (!access_token) return
    const isAssigned = assignedClasses.includes(ugUuid)
    
    // Optimistic UI update
    setAssignedClasses(prev => isAssigned ? prev.filter(id => id !== ugUuid) : [...prev, ugUuid])
    
    try {
      if (isAssigned) {
        await removeUserGroupFromPlayground(playground.playground_uuid, ugUuid, access_token)
      } else {
        await addUserGroupToPlayground(playground.playground_uuid, ugUuid, access_token)
      }
    } catch {
      toast.error(isTr ? 'İşlem başarısız' : 'Action failed')
      // Revert on failure
      setAssignedClasses(prev => isAssigned ? [...prev, ugUuid] : prev.filter(id => id !== ugUuid))
    }
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
  const editLink = `/editor/playground/${playground.playground_uuid}/edit`

  // Strip category tag like [1. Sınıf Temel Beceriler] from display description for cleaner text
  const cleanDescription = (playground.description || '').replace(/\[.*?\]/g, '').trim()

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl nice-shadow overflow-hidden w-full transition-all duration-300 hover:scale-[1.015] hover:shadow-lg border border-gray-100">
      {/* Manage buttons for teachers/principals (Assign class & Toggle visibility) */}
      {canManage && (
        <div className="absolute top-2.5 end-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={openManageModal}
            className="p-2 bg-white/95 backdrop-blur-md rounded-full hover:bg-white text-gray-700 hover:text-black transition-all shadow-md flex items-center justify-center border border-gray-200 cursor-pointer"
            title={isTr ? 'Sınıf Ata' : 'Assign Class'}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); handleTogglePublish(); }}
            disabled={isUpdating}
            className="p-2 bg-white/95 backdrop-blur-md rounded-full hover:bg-white text-gray-700 hover:text-black transition-all shadow-md flex items-center justify-center border border-gray-200 cursor-pointer"
            title={isTr ? (playground.published ? 'Modülü Pasif Yap (Gizle)' : 'Modülü Aktif Yap (Yayınla)') : 'Toggle Visibility'}
          >
            {playground.published ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
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
          <span className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-full shadow-xs ${access.className}`}>
            <AccessIcon className="w-2.5 h-2.5" />
            {isTr ? access.labelTr : access.labelEn}
          </span>
          {!playground.published && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700 rounded-full shadow-xs">
              {isTr ? 'Taslak' : 'Draft'}
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
{/* Manage Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowManageModal(false); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">{isTr ? 'Sınıf Ata' : 'Assign Class'}</h3>
              <button onClick={() => setShowManageModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            {loadingClasses ? (
              <div className="text-center text-sm text-gray-500 py-4">{isTr ? 'Yükleniyor...' : 'Loading...'}</div>
            ) : availableClasses.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">{isTr ? 'Sınıf bulunamadı.' : 'No classes found.'}</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableClasses.map(cls => (
                  <div key={cls.usergroup_uuid} onClick={() => toggleClass(cls.usergroup_uuid)} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100">
                    {assignedClasses.includes(cls.usergroup_uuid) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm font-medium">{cls.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
