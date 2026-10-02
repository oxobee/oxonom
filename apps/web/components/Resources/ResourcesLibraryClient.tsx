'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import {
  FolderSimple,
  Files,
  Plus,
  MagnifyingGlass,
  Lock,
  LockOpen,
  Eye,
  Download,
  Trash,
  PencilSimple,
  Globe,
  UploadSimple,
  LinkSimple,
  VideoCamera,
  FilePdf,
  FileDoc,
  FileXls,
  FilePpt,
  Image as ImageIcon,
  Headphones,
  CheckCircle,
  X,
  Users,
  CaretRight,
  Clock,
  ArrowSquareOut,
  ShieldCheck,
  Sparkle
} from '@phosphor-icons/react'
import {
  ResourceFolder,
  ResourceItem,
  ResourceAccessLog,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  trackResourceAccess,
  getResourceLogs,
  uploadResourceFile,
} from '@services/educational_resources/educational_resources'
import { getUserGroups, getMyUserGroups } from '@services/usergroups/usergroups'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

const SUBJECTS = [
  'Türkçe',
  'Matematik',
  'Fen Bilimleri',
  'Sosyal Bilgiler',
  'İngilizce',
  'Din Kültürü',
  'Görsel Sanatlar & Müzik',
  'Rehberlik & Etkinlik',
  'Genel',
]

const FORMAT_ICONS: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  pdf: { icon: FilePdf, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'PDF Belgesi' },
  document: { icon: FileDoc, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'Word / Belge' },
  spreadsheet: { icon: FileXls, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'Excel Tablo' },
  presentation: { icon: FilePpt, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', label: 'Sunum (PPT)' },
  image: { icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200', label: 'Görsel / Şema' },
  video: { icon: VideoCamera, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200', label: 'Video Dersi' },
  youtube: { icon: VideoCamera, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'YouTube Video' },
  audio: { icon: Headphones, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', label: 'Ses / Podcast' },
  link: { icon: LinkSimple, color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-200', label: 'Web Bağlantısı' },
}

interface ResourcesLibraryClientProps {
  orgslug: string
}

export default function ResourcesLibraryClient({ orgslug }: ResourcesLibraryClientProps) {
  const { t } = useTranslation()
  const org = useOrg() as any
  const orgId = org?.id || 1
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const { isAdmin } = useAdminStatus()

  // User role
  const userRole = session?.data?.user?.role_name || (session?.data?.user?.is_superadmin ? 'admin' : 'student')
  const isTeacher = Boolean(
    isAdmin ||
    session?.data?.user?.is_superadmin ||
    ['admin', 'teacher', 'instructor', 'owner', 'manager'].includes(userRole.toLowerCase())
  )

  // Current folder breadcrumbs
  const [currentFolder, setCurrentFolder] = useState<ResourceFolder | null>(null)
  const [folderHistory, setFolderHistory] = useState<ResourceFolder[]>([])

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')

  // Modals state
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false)
  const [newResourceModalOpen, setNewResourceModalOpen] = useState(false)
  const [viewerResource, setViewerResource] = useState<ResourceItem | null>(null)
  const [trackingResource, setTrackingResource] = useState<ResourceItem | null>(null)
  const [pinPromptItem, setPinPromptItem] = useState<{ type: 'folder' | 'resource'; item: any } | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [unlockedFolderIds, setUnlockedFolderIds] = useState<Set<number>>(new Set())
  const pinInputRef = useRef<HTMLInputElement>(null)


  // Form states for New Folder
  const [folderName, setFolderName] = useState('')
  const [folderDesc, setFolderDesc] = useState('')
  const [folderColor, setFolderColor] = useState('#3b82f6')
  const [folderIsLocked, setFolderIsLocked] = useState(false)
  const [folderPin, setFolderPin] = useState('')
  const [folderTargetType, setFolderTargetType] = useState<'all' | 'classrooms'>('all')
  const [folderClassrooms, setFolderClassrooms] = useState<number[]>([])
  const [creatingFolder, setCreatingFolder] = useState(false)

  // Form states for New Resource
  const [resourceTab, setResourceTab] = useState<'file' | 'link'>('file')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceDesc, setResourceDesc] = useState('')
  const [resourceSubject, setResourceSubject] = useState('Türkçe')
  const [resourceIsDownloadable, setResourceIsDownloadable] = useState(true)
  const [resourceIsLocked, setResourceIsLocked] = useState(false)
  const [resourcePin, setResourcePin] = useState('')
  const [resourceTargetType, setResourceTargetType] = useState<'all' | 'classrooms'>('all')
  const [resourceClassrooms, setResourceClassrooms] = useState<number[]>([])
  const [externalUrl, setExternalUrl] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; progress?: number }[]>([])
  const [uploadingResource, setUploadingResource] = useState(false)

  // Classes list for permissions targeting
  const [availableClasses, setAvailableClasses] = useState<any[]>([])

  useEffect(() => {
    if (!accessToken || !orgId) return
    const fetchClasses = async () => {
      try {
        const res = isTeacher && !isAdmin
          ? await getMyUserGroups(orgId, accessToken)
          : await getUserGroups(orgId, accessToken)
        const list = Array.isArray(res) ? res : res?.data || []
        setAvailableClasses(list)
      } catch (err) {
        console.error('Failed to load classrooms for permissions', err)
      }
    }
    fetchClasses()
  }, [accessToken, orgId, isTeacher, isAdmin])

  // Queries
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['resources-folders', orgId, currentFolder?.id || 'root'],
    queryFn: () => getFolders(orgId, currentFolder?.id || null, accessToken),
    enabled: !!orgId && !!accessToken,
  })

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: [
      'resources-items',
      orgId,
      currentFolder?.id || 'root',
      selectedSubject,
      selectedFormat,
      searchQuery,
    ],
    queryFn: () =>
      getResources(
        orgId,
        {
          folderId: currentFolder?.id ?? 0,
          subject: selectedSubject,
          resourceType: selectedFormat,
          search: searchQuery,
        },
        accessToken
      ),
    enabled: !!orgId && !!accessToken,
  })

  // Strictly filter resources so files inside folders (and especially locked folders) never leak to root
  const visibleResources = useMemo(() => {
    if (!currentFolder) {
      return resources.filter((r: ResourceItem) => !r.folder_id)
    }
    return resources.filter((r: ResourceItem) => r.folder_id === currentFolder.id)
  }, [resources, currentFolder])

  // Access Logs Query
  const { data: accessLogsData, isLoading: logsLoading } = useQuery({
    queryKey: ['resource-logs', trackingResource?.resource_uuid],
    queryFn: () => (trackingResource ? getResourceLogs(trackingResource.resource_uuid, accessToken!) : null),
    enabled: !!trackingResource && !!accessToken,
  })

  // Folder navigation
  const openFolder = (folder: ResourceFolder) => {
    if (folder.is_locked && folder.pin && !unlockedFolderIds.has(folder.id)) {
      setPinPromptItem({ type: 'folder', item: folder })
      setPinInput('')
      setPinError('')
      setPinStatus('idle')
      return
    }
    setFolderHistory((prev) => [...prev, folder])
    setCurrentFolder(folder)
  }

  const navigateBack = (index: number) => {
    if (index === -1) {
      setCurrentFolder(null)
      setFolderHistory([])
      return
    }
    const target = folderHistory[index]
    setCurrentFolder(target)
    setFolderHistory((prev) => prev.slice(0, index + 1))
  }

  // Handle PIN verification for locked folder/resource with smooth animation
  const handleVerifyPin = (overridePin?: string) => {
    if (!pinPromptItem) return
    const inputToCheck = (overridePin !== undefined ? overridePin : pinInput).trim()
    const targetPin = (pinPromptItem.item.pin || '').trim()

    if (inputToCheck !== targetPin) {
      setPinStatus('error')
      setPinError('Hatalı şifre / PIN! Lütfen tekrar deneyin.')
      setTimeout(() => {
        setPinInput('')
        setPinStatus('idle')
      }, 700)
      return
    }

    // Success animation
    setPinStatus('success')
    setPinError('')
    setTimeout(() => {
      if (pinPromptItem.type === 'folder') {
        const folder = pinPromptItem.item
        setUnlockedFolderIds((prev) => new Set([...prev, folder.id]))
        setFolderHistory((prev) => [...prev, folder])
        setCurrentFolder(folder)
        setPinPromptItem(null)
        setPinStatus('idle')
        toast.success(`"${folder.name}" klasör kilidi açıldı!`)
      } else {
        const res = pinPromptItem.item
        setPinPromptItem(null)
        setPinStatus('idle')
        triggerViewResource(res)
      }
    }, 450)
  }


  // Handle resource open
  const handleOpenResource = (res: ResourceItem) => {
    if (res.is_locked && res.pin) {
      setPinPromptItem({ type: 'resource', item: res })
      setPinInput('')
      setPinError('')
      return
    }
    triggerViewResource(res)
  }

  const triggerViewResource = async (res: ResourceItem) => {
    // Track view in background
    if (accessToken) {
      trackResourceAccess(res.resource_uuid, 'view', accessToken).catch(() => {})
      queryClient.invalidateQueries({ queryKey: ['resources-items'] })
    }
    setViewerResource(res)
  }

  // Handle resource download
  const handleDownloadResource = async (res: ResourceItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!res.is_downloadable) {
      toast.error('Bu içerik sadece görüntüleme amaçlıdır, indirmeye kapatılmıştır.')
      return
    }
    if (accessToken) {
      trackResourceAccess(res.resource_uuid, 'download', accessToken).catch(() => {})
      queryClient.invalidateQueries({ queryKey: ['resources-items'] })
    }
    if (res.file_url) {
      const downloadUrl = res.file_url.includes('?')
        ? `${res.file_url}&download=true`
        : `${res.file_url}?download=true`
      window.open(downloadUrl, '_blank')
    } else if (res.external_url) {
      window.open(res.external_url, '_blank')
    }
    toast.success('İndirme başlatıldı')
  }

  // Handle New Folder submission
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim() || !accessToken) return
    setCreatingFolder(true)
    try {
      await createFolder(
        {
          org_id: orgId,
          name: folderName.trim(),
          description: folderDesc.trim() || undefined,
          parent_id: currentFolder?.id || null,
          color: folderColor,
          is_locked: folderIsLocked,
          pin: folderIsLocked ? folderPin.trim() : null,
          target_type: folderTargetType,
          target_ids: folderTargetType === 'classrooms' ? { classroom_ids: folderClassrooms } : null,
        },
        accessToken
      )
      toast.success('Klasör oluşturuldu!')
      setNewFolderModalOpen(false)
      setFolderName('')
      setFolderDesc('')
      setFolderIsLocked(false)
      setFolderPin('')
      queryClient.invalidateQueries({ queryKey: ['resources-folders'] })
    } catch {
      toast.error('Klasör oluşturulurken hata meydana geldi.')
    } finally {
      setCreatingFolder(false)
    }
  }

  // Handle New Resource submission
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return

    setUploadingResource(true)
    try {
      if (resourceTab === 'file') {
        if (uploadedFiles.length === 0) {
          toast.error('Lütfen en az bir dosya seçin.')
          setUploadingResource(false)
          return
        }

        // Upload files sequentially or in batch
        for (const item of uploadedFiles) {
          const upRes = await uploadResourceFile(item.file, orgId, accessToken)
          await createResource(
            {
              org_id: orgId,
              title: resourceTitle.trim() || item.file.name,
              description: resourceDesc.trim() || undefined,
              folder_id: currentFolder?.id || null,
              resource_type: upRes.resource_type as any,
              file_url: upRes.file_url,
              file_name: upRes.file_name,
              file_size: upRes.file_size,
              subject: resourceSubject,
              is_downloadable: resourceIsDownloadable,
              is_locked: resourceIsLocked,
              pin: resourceIsLocked ? resourcePin.trim() : null,
              target_type: resourceTargetType,
              target_ids: resourceTargetType === 'classrooms' ? { classroom_ids: resourceClassrooms } : null,
            },
            accessToken
          )
        }
      } else {
        // Link / YouTube resource
        if (!externalUrl.trim()) {
          toast.error('Lütfen geçerli bir bağlantı adresi girin.')
          setUploadingResource(false)
          return
        }
        const isYt = externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be')
        await createResource(
          {
            org_id: orgId,
            title: resourceTitle.trim() || 'Eğitim Bağlantısı',
            description: resourceDesc.trim() || undefined,
            folder_id: currentFolder?.id || null,
            resource_type: isYt ? 'youtube' : 'link',
            external_url: externalUrl.trim(),
            subject: resourceSubject,
            is_downloadable: false,
            is_locked: resourceIsLocked,
            pin: resourceIsLocked ? resourcePin.trim() : null,
            target_type: resourceTargetType,
            target_ids: resourceTargetType === 'classrooms' ? { classroom_ids: resourceClassrooms } : null,
          },
          accessToken
        )
      }

      toast.success('Kaynak başarıyla eklendi!')
      setNewResourceModalOpen(false)
      setResourceTitle('')
      setResourceDesc('')
      setExternalUrl('')
      setUploadedFiles([])
      setResourceIsLocked(false)
      setResourcePin('')
      queryClient.invalidateQueries({ queryKey: ['resources-items'] })
    } catch {
      toast.error('Kaynak eklenirken bir hata meydana geldi.')
    } finally {
      setUploadingResource(false)
    }
  }

  // Handle Delete Resource
  const handleDeleteResource = async (res: ResourceItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`"${res.title}" kaynağını silmek istediğinizden emin misiniz?`)) return
    if (!accessToken) return
    try {
      await deleteResource(res.resource_uuid, accessToken)
      toast.success('Kaynak silindi')
      queryClient.invalidateQueries({ queryKey: ['resources-items'] })
    } catch {
      toast.error('Kaynak silinemedi')
    }
  }

  // Handle Delete Folder
  const handleDeleteFolder = async (folder: ResourceFolder, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`"${folder.name}" klasörünü ve içindeki kaynakları silmek istediğinizden emin misiniz?`)) return
    if (!accessToken) return
    try {
      await deleteFolder(folder.folder_uuid, accessToken)
      toast.success('Klasör silindi')
      queryClient.invalidateQueries({ queryKey: ['resources-folders'] })
    } catch {
      toast.error('Klasör silinemedi')
    }
  }

  return (
    <div className="w-full pb-16">
      <GeneralWrapperStyled>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FolderSimple size={20} weight="fill" />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                Ders Kaynakları & Materyal Kütüphanesi
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ders notları, özet PDF'ler, çalışma yaprakları, sunumlar ve video kaynakları.
            </p>
          </div>

          {/* Action Buttons for Teachers / Admins */}
          {isTeacher && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setNewFolderModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Plus size={14} weight="bold" />
                <span>Yeni Klasör</span>
              </button>
              <button
                type="button"
                onClick={() => setNewResourceModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <UploadSimple size={15} weight="bold" />
                <span>Kaynak Yükle</span>
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 nice-shadow mb-6 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => navigateBack(-1)}
            className={`font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              currentFolder ? 'text-blue-600 hover:underline' : 'text-slate-900'
            }`}
          >
            <FolderSimple size={15} weight="fill" />
            <span>Ana Kütüphane</span>
          </button>

          {folderHistory.map((f, i) => (
            <React.Fragment key={f.folder_uuid}>
              <CaretRight size={13} className="text-slate-300 shrink-0" />
              <button
                onClick={() => navigateBack(i)}
                className={`font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  i === folderHistory.length - 1 ? 'text-slate-900' : 'text-blue-600 hover:underline'
                }`}
              >
                <span>{f.name}</span>
                {f.is_locked && <Lock size={11} className="text-amber-500" />}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full sm:flex-1">
            <MagnifyingGlass className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kaynak adı, konu veya öğretmen ara..."
              className="w-full ps-10 pe-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-xs cursor-pointer"
            >
              <option value="all">Tüm Dersler</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Format Selector */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-xs cursor-pointer"
            >
              <option value="all">Tüm Formatlar</option>
              <option value="pdf">PDF Dosyaları</option>
              <option value="document">Word Dokümanları</option>
              <option value="spreadsheet">Excel Tabloları</option>
              <option value="presentation">PowerPoint Sunumları</option>
              <option value="video">Videolar & YouTube</option>
              <option value="image">Görsel / Şemalar</option>
              <option value="audio">Ses Kayıtları</option>
              <option value="link">Web Bağlantıları</option>
            </select>
          </div>
        </div>

        {/* 1. Folders Section */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FolderSimple size={14} weight="bold" />
              <span>Klasörler ({folders.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder: ResourceFolder) => (
                <div
                  key={folder.folder_uuid}
                  onClick={() => openFolder(folder)}
                  className="group relative p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  style={{ borderLeftColor: folder.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl" style={{ color: folder.color }}>
                      📁
                    </span>
                    <div className="flex items-center gap-1">
                      {folder.is_locked && (
                        <span className="p-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200" title="Şifreli Klasör">
                          <Lock size={12} weight="bold" />
                        </span>
                      )}
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFolder(folder, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                          title="Klasörü Sil"
                        >
                          <Trash size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Resources Grid Section */}
        <div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Files size={14} weight="bold" />
            <span>Materyaller & Dosyalar ({visibleResources.length})</span>
          </h2>

          {resourcesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : visibleResources.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center p-6">
              <span className="text-4xl mb-3">📂</span>
              <h3 className="text-sm font-bold text-slate-700">Bu bölümde henüz kaynak bulunmuyor</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {isTeacher
                  ? 'Yukarıdaki "Kaynak Yükle" butonunu kullanarak sınıfınız için ders notları, PDF veya bağlantılar ekleyin.'
                  : 'Öğretmeniniz bu alana henüz kaynak eklememiş.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleResources.map((res: ResourceItem) => {

                const fmt = FORMAT_ICONS[res.resource_type] || FORMAT_ICONS.document
                const FormatIcon = fmt.icon

                return (
                  <div
                    key={res.resource_uuid}
                    onClick={() => handleOpenResource(res)}
                    className="group relative flex flex-col justify-between p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${fmt.bg} ${fmt.color}`}>
                          <FormatIcon size={13} weight="bold" />
                          <span>{fmt.label}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {res.is_locked && (
                            <span className="p-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200" title="Şifreli">
                              <Lock size={12} weight="bold" />
                            </span>
                          )}
                          {!res.is_downloadable && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200 text-[9px] font-bold" title="Sadece Görüntülenebilir">
                              Salt Okunur
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {res.description}
                        </p>
                      )}

                      {/* Subject Tag */}
                      {res.subject && (
                        <div className="mt-2.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                            {res.subject}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {/* Uploader Meta */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2.5">
                        <span className="truncate font-medium">{res.uploader_name || 'Öğretmen'}</span>
                        <span>{new Date(res.creation_date || Date.now()).toLocaleDateString('tr-TR')}</span>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Live Views / Downloads count */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1" title="Görüntüleme Sayısı">
                            <Eye size={12} />
                            <span>{res.views_count}</span>
                          </span>
                          {res.is_downloadable && (
                            <span className="flex items-center gap-1 text-slate-400" title="İndirme Sayısı">
                              <Download size={12} />
                              <span>{res.downloads_count}</span>
                            </span>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-1">
                          {isTeacher && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setTrackingResource(res)
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                              title="Görüntüleme & İndirme Geçmişini Gör"
                            >
                              <Users size={14} />
                            </button>
                          )}

                          {res.is_downloadable && (
                            <button
                              type="button"
                              onClick={(e) => handleDownloadResource(res, e)}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="İndir"
                            >
                              <Download size={14} weight="bold" />
                            </button>
                          )}

                          {isTeacher && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteResource(res, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Sil"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </GeneralWrapperStyled>

      {/* --- MODAL 1: YENİ KLASÖR MODALI --- */}
      <Dialog open={newFolderModalOpen} onOpenChange={setNewFolderModalOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FolderSimple size={22} weight="fill" className="text-blue-600" />
              <span>Yeni Klasör Oluştur</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Dersler veya konular için düzenli bir klasör yapısı oluşturun.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Klasör Adı *</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Örn: 1. Dönem Matematik Çalışmaları"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Açıklama (İsteğe bağlı)</label>
              <textarea
                value={folderDesc}
                onChange={(e) => setFolderDesc(e.target.value)}
                placeholder="Klasör içeriği hakkında kısa bilgi..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Folder color */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Klasör Rengi</label>
              <div className="flex items-center gap-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFolderColor(col)}
                    className={`w-6 h-6 rounded-full transition-transform ${folderColor === col ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Folder PIN Protection */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={folderIsLocked}
                  onChange={(e) => setFolderIsLocked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Lock size={12} className="text-amber-600" />
                    <span>Şifre / PIN Koruması Ekle</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Öğrenciler klasörü açmak için 4 haneli PIN girer.</p>
                </div>
              </label>

              {folderIsLocked && (
                <div className="mt-2.5 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="text-[11px] font-bold text-amber-900 block mb-1">
                    Klasör Şifresi (PIN) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={folderPin}
                    onChange={(e) => setFolderPin(e.target.value)}
                    placeholder="Örn: 1234"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required={folderIsLocked}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setNewFolderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={creatingFolder || !folderName.trim() || (folderIsLocked && !folderPin.trim())}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {creatingFolder ? 'Oluşturuluyor...' : 'Klasör Oluştur'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: YENİ KAYNAK / DOSYA YÜKLEME MODALI --- */}
      <Dialog open={newResourceModalOpen} onOpenChange={setNewResourceModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UploadSimple size={22} weight="bold" className="text-blue-600" />
              <span>Yeni Ders Kaynağı Yükle</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              PDF, Word, Excel, Sunum, Resim, Ses veya YouTube bağlantısı ekleyin.
            </DialogDescription>
          </DialogHeader>

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl my-2">
            <button
              type="button"
              onClick={() => setResourceTab('file')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                resourceTab === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Files size={15} weight="bold" />
              <span>Dosya Yükle</span>
            </button>
            <button
              type="button"
              onClick={() => setResourceTab('link')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                resourceTab === 'link' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LinkSimple size={15} weight="bold" />
              <span>Web / YouTube Linki</span>
            </button>
          </div>

          <form onSubmit={handleCreateResource} className="space-y-4">
            {resourceTab === 'file' ? (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Dosya Seçin veya Sürükleyin *
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                  onClick={() => document.getElementById('resource-file-input')?.click()}
                >
                  <input
                    id="resource-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setUploadedFiles(files.map((file) => ({ file })))
                      if (files.length === 1 && !resourceTitle) {
                        setResourceTitle(files[0].name.replace(/\.[^/.]+$/, ''))
                      }
                    }}
                  />
                  <UploadSimple size={28} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Dosyaları buraya bırakın veya tıklayın</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Görsel, MP4, MP3
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-blue-50/60 rounded-xl text-xs border border-blue-200/60">
                        <span className="font-semibold text-blue-900 truncate">{item.file.name}</span>
                        <span className="text-[10px] text-blue-600 shrink-0">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Web veya YouTube Bağlantısı (URL) *
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... veya https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={resourceTab === 'link'}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Başlık *</label>
              <input
                type="text"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Örn: Kesirler Konu Özeti & Çalışma Yaprağı"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ders / Alan</label>
                <select
                  value={resourceSubject}
                  onChange={(e) => setResourceSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hedef Klasör</label>
                <div className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium truncate">
                  {currentFolder ? currentFolder.name : 'Ana Kütüphane'}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Açıklama / Kazanımlar</label>
              <textarea
                value={resourceDesc}
                onChange={(e) => setResourceDesc(e.target.value)}
                placeholder="Öğrenciler için yönerge veya konu özeti..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Visibility Targeting */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Görünürlük & Hedef Sınıflar
              </label>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={resourceTargetType === 'all'}
                    onChange={() => setResourceTargetType('all')}
                    className="text-blue-600"
                  />
                  <span>Tüm Okul / Herkese Açık</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={resourceTargetType === 'classrooms'}
                    onChange={() => setResourceTargetType('classrooms')}
                    className="text-blue-600"
                  />
                  <span>Belirli Sınıflar</span>
                </label>
              </div>

              {resourceTargetType === 'classrooms' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto space-y-1.5">
                  {availableClasses.map((cls) => {
                    const cid = cls.id
                    const checked = resourceClassrooms.includes(cid)
                    return (
                      <label key={cid} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setResourceClassrooms([...resourceClassrooms, cid])
                            else setResourceClassrooms(resourceClassrooms.filter((x) => x !== cid))
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-800">{cls.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Download Toggle & PIN */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={resourceIsDownloadable}
                  onChange={(e) => setResourceIsDownloadable(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800">İndirmeye İzin Ver</div>
                  <p className="text-[10px] text-slate-500">
                    Kapatılırsa öğrenciler dosyayı sadece tarayıcıda canlı görüntüleyebilir, indiremez.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={resourceIsLocked}
                  onChange={(e) => setResourceIsLocked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Lock size={12} className="text-amber-600" />
                    <span>Şifre / PIN Koruması</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Görüntüleme öncesi şifre zorunlu olur.</p>
                </div>
              </label>

              {resourceIsLocked && (
                <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="text-[11px] font-bold text-amber-900 block mb-1">
                    Görüntüleme Şifresi (PIN) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={resourcePin}
                    onChange={(e) => setResourcePin(e.target.value)}
                    placeholder="Örn: 1234"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required={resourceIsLocked}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setNewResourceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={uploadingResource || !resourceTitle.trim() || (resourceIsLocked && !resourcePin.trim())}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingResource ? 'Yükleniyor...' : 'Kaydet ve Yayınla'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: IN-APP LIVE PREVIEW VIEWER MODAL --- */}
      <Dialog open={!!viewerResource} onOpenChange={(open) => !open && setViewerResource(null)}>
        <DialogContent className="sm:max-w-[850px] w-[95vw] bg-white rounded-2xl p-5 max-h-[92vh] flex flex-col">
          <DialogHeader className="shrink-0 mb-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 line-clamp-1">
                  {viewerResource?.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  {viewerResource?.subject} • {viewerResource?.uploader_name}
                </DialogDescription>
              </div>

              {viewerResource?.is_downloadable && (
                <button
                  type="button"
                  onClick={(e) => viewerResource && handleDownloadResource(viewerResource, e)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} weight="bold" />
                  <span>İndir</span>
                </button>
              )}
            </div>
          </DialogHeader>

          {/* Viewer Stage */}
          <div className="flex-1 w-full min-h-[420px] bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
            {viewerResource?.resource_type === 'pdf' && viewerResource.file_url ? (
              <iframe
                src={`${viewerResource.file_url}#toolbar=0`}
                className="w-full h-full border-0 absolute inset-0"
                title={viewerResource.title}
              />
            ) : viewerResource?.resource_type === 'video' && viewerResource.file_url ? (
              <video
                src={viewerResource.file_url}
                controls
                controlsList={viewerResource.is_downloadable ? undefined : 'nodownload'}
                className="w-full max-h-full"
              />
            ) : viewerResource?.resource_type === 'youtube' && viewerResource.external_url ? (
              <iframe
                src={viewerResource.external_url.replace('watch?v=', 'embed/')}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={viewerResource.title}
              />
            ) : viewerResource?.resource_type === 'image' && viewerResource.file_url ? (
              <img
                src={viewerResource.file_url}
                alt={viewerResource.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : viewerResource?.resource_type === 'audio' && viewerResource.file_url ? (
              <div className="p-8 text-center text-white">
                <span className="text-5xl block mb-4">🎧</span>
                <audio src={viewerResource.file_url} controls className="w-full max-w-md mx-auto" />
              </div>
            ) : (
              <div className="p-8 text-center text-white">
                <span className="text-4xl block mb-2">📄</span>
                <p className="text-sm font-bold">{viewerResource?.file_name || viewerResource?.title}</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Bu doküman türü cihazınızda açılabilir.</p>
                {viewerResource?.file_url && viewerResource.is_downloadable && (
                  <a
                    href={viewerResource.file_url}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Download size={14} />
                    <span>Dosyayı İndir</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 4: VIEW / DOWNLOAD TRACKING HISTORY MODAL --- */}
      <Dialog open={!!trackingResource} onOpenChange={(open) => !open && setTrackingResource(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users size={20} weight="bold" className="text-blue-600" />
              <span>Görüntüleme & İndirme Geçmişi</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{trackingResource?.title}</span> materyalini inceleyen ve indiren kullanıcılar.
            </DialogDescription>
          </DialogHeader>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                <Eye size={18} weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-blue-950 block leading-none">
                  {accessLogsData?.views_count || trackingResource?.views_count || 0}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                  Görüntüleme
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                <Download size={18} weight="bold" />
              </div>
              <div>
                <span className="text-xl font-black text-emerald-950 block leading-none">
                  {accessLogsData?.downloads_count || trackingResource?.downloads_count || 0}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                  İndirme
                </span>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {logsLoading ? (
              <p className="text-xs text-slate-400 text-center py-6">Kayıtlar yükleniyor...</p>
            ) : !accessLogsData?.logs || accessLogsData.logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Henüz herhangi bir görüntüleme veya indirme işlemi kaydedilmemiş.
              </p>
            ) : (
              accessLogsData.logs.map((log: ResourceAccessLog) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg ${
                        log.action === 'download'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {log.action === 'download' ? <Download size={12} weight="bold" /> : <Eye size={12} weight="bold" />}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{log.user_role}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.timestamp).toLocaleString('tr-TR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setTrackingResource(null)}
              className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 5: ANIMATED PIN PROMPT FOR LOCKED FOLDER/RESOURCE --- */}
      <Dialog
        open={!!pinPromptItem}
        onOpenChange={(open) => {
          if (!open) {
            setPinPromptItem(null)
            setPinInput('')
            setPinError('')
            setPinStatus('idle')
          }
        }}
      >
        <DialogContent className="sm:max-w-[380px] bg-white rounded-3xl p-6 sm:p-7 text-center shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header Icon with Smooth Transition */}
          <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            {pinStatus === 'success' ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
                <LockOpen size={32} weight="fill" />
              </div>
            ) : pinStatus === 'error' ? (
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pin-shake">
                <Lock size={32} weight="fill" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-md shadow-amber-500/10">
                <Lock size={32} weight="fill" />
              </div>
            )}
          </div>

          <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
            {pinStatus === 'success' ? 'Kilit Açıldı!' : 'Şifreli İçerik Kilidi'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1 mb-5">
            {pinStatus === 'success'
              ? 'Giriş başarılı, içerik yükleniyor...'
              : `Bu ${pinPromptItem?.type === 'folder' ? 'klasöre' : 'kaynağa'} erişmek için 4 haneli PIN şifresini girin.`}
          </DialogDescription>

          {/* Hidden input capturing all keyboard and mobile numeric events */}
          <input
            ref={pinInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 4)
              setPinInput(val)
              setPinError('')
              if (val.length === 4) {
                handleVerifyPin(val)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleVerifyPin()
              }
            }}
            className="sr-only"
            autoFocus
          />

          {/* 4 Animated Character Slots */}
          <div
            onClick={() => pinInputRef.current?.focus()}
            className={`flex items-center justify-center gap-3 mb-4 cursor-pointer ${
              pinStatus === 'error' ? 'animate-pin-shake' : ''
            }`}
          >
            {[0, 1, 2, 3].map((slotIdx) => {
              const char = pinInput[slotIdx]
              const isFilled = char !== undefined && char !== ''
              const isActive = pinInput.length === slotIdx

              let slotClass =
                'w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black font-mono transition-all duration-200 '

              if (pinStatus === 'success') {
                slotClass += 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/20 scale-105'
              } else if (pinStatus === 'error') {
                slotClass += 'bg-rose-50 border-rose-500 text-rose-600 shadow-md shadow-rose-500/20'
              } else if (isFilled) {
                slotClass += 'bg-slate-900 border-slate-900 text-white shadow-md transform scale-100'
              } else if (isActive) {
                slotClass += 'bg-amber-50/50 border-amber-500 text-slate-900 ring-4 ring-amber-500/20 scale-105'
              } else {
                slotClass += 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
              }

              return (
                <div key={slotIdx} className={slotClass}>
                  {pinStatus === 'success' ? (
                    <CheckCircle size={22} weight="fill" className="text-emerald-500 animate-in zoom-in-50" />
                  ) : isFilled ? (
                    <span className="inline-block animate-in zoom-in-75 duration-150">&bull;</span>
                  ) : isActive ? (
                    <span className="w-1.5 h-5 bg-amber-500 rounded-full animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Feedback message */}
          <div className="h-5 mb-3">
            {pinError ? (
              <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
                <span>⚠️</span>
                <span>{pinError}</span>
              </p>
            ) : pinStatus === 'success' ? (
              <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                <span>✓</span>
                <span>Şifre doğrulandı, açılıyor...</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Klavyenizden şifreyi yazın veya aşağıdaki tuşları kullanın
              </p>
            )}
          </div>

          {/* Virtual Keypad for touchscreens & mobile */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => {
                  if (pinInput.length < 4) {
                    const next = pinInput + digit
                    setPinInput(next)
                    setPinError('')
                    if (next.length === 4) handleVerifyPin(next)
                  }
                }}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-base transition-transform active:scale-95 cursor-pointer shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPinInput('')
                setPinError('')
                setPinStatus('idle')
              }}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs transition-transform active:scale-95 cursor-pointer"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={() => {
                if (pinInput.length < 4) {
                  const next = pinInput + '0'
                  setPinInput(next)
                  setPinError('')
                  if (next.length === 4) handleVerifyPin(next)
                }
              }}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-base transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                setPinInput((prev) => prev.slice(0, -1))
                setPinError('')
                setPinStatus('idle')
              }}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setPinPromptItem(null)
                setPinInput('')
                setPinError('')
                setPinStatus('idle')
              }}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={pinInput.length === 0 || pinStatus === 'success'}
              onClick={() => handleVerifyPin()}
              className="flex-1 py-2.5 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              Kilidi Aç
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
