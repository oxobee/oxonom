'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Folder,
  FolderOpen,
  Download,
  Share2,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Tv,
  Eye,
  ArrowLeft,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  name: string
  extension: 'pdf' | 'png' | 'docx' | 'pptx' | 'xlsx'
  size: string
  updatedAt: string
  author: string
  sharedWithClass?: string
  downloadsCount: number
}

interface FolderCategory {
  id: string
  name: string
  description: string
  color: string
  iconColor: string
  bgLight: string
  files: FileItem[]
}

const INITIAL_FOLDERS: FolderCategory[] = [
  {
    id: 'folder-presentations',
    name: 'Ders Sunumları ve Slaytlar',
    description: 'Türk Dili ve Edebiyatı ders slaytları, interaktif konu sunumları ve PDF notlar.',
    color: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50/60 dark:bg-blue-950/30',
    files: [
      { id: 'f-1', name: '9-A_Edebiyat_Metin_Tahlili_Ders_Notlari.pdf', extension: 'pdf', size: '3.4 MB', updatedAt: 'Bugün 10:15', author: 'Ebru TEKNECİ', sharedWithClass: '9-A', downloadsCount: 28 },
      { id: 'f-2', name: 'Tanzimat_Donemi_Edebi_Akimlar_Sunumu.pptx', extension: 'pptx', size: '14.2 MB', updatedAt: 'Dün 16:40', author: 'Ebru TEKNECİ', sharedWithClass: '9-A, 9-B', downloadsCount: 42 },
      { id: 'f-3', name: 'Divan_Edebiyati_Gazel_ve_Kaside_Tahlili.pdf', extension: 'pdf', size: '5.1 MB', updatedAt: '3 gün önce', author: 'Ebru TEKNECİ', downloadsCount: 19 },
    ],
  },
  {
    id: 'folder-worksheets',
    name: 'Çalışma Kâğıtları ve Testler',
    description: 'Öğrenciler için MEB kazanım kavrama testleri, paragraf çözümleri ve kompozisyon ödev formları.',
    color: 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    files: [
      { id: 'f-4', name: '9-A_Paragrafta_Anlam_Calisma_Kagidi_Hafta4.pdf', extension: 'pdf', size: '1.2 MB', updatedAt: 'Bugün 08:30', author: 'Ebru TEKNECİ', sharedWithClass: '9-A', downloadsCount: 24 },
      { id: 'f-5', name: 'Noktalama_Isaretleri_Pratik_Uygulama.docx', extension: 'docx', size: '820 KB', updatedAt: '4 gün önce', author: 'Ebru TEKNECİ', sharedWithClass: '9-B', downloadsCount: 21 },
      { id: 'f-6', name: 'Cümle_Turleri_Tarama_Testi_20_Soru.pdf', extension: 'pdf', size: '2.1 MB', updatedAt: 'Geçen hafta', author: 'Ebru TEKNECİ', downloadsCount: 35 },
    ],
  },
  {
    id: 'folder-smartboard',
    name: 'Akıllı Tahta Ders Çizimleri',
    description: 'Pano ve sınıf akıllı tahtalarında işlenen derslerin canlı çizimleri, ekran çıktıları ve tahta özetleri.',
    color: 'border-teal-200 dark:border-teal-900/50 hover:border-teal-400',
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-50/60 dark:bg-teal-950/30',
    files: [
      { id: 'f-7', name: '9A_AkilliTahta_Siir_Tahlili_Sema_Cizimi.png', extension: 'png', size: '2.8 MB', updatedAt: 'Bugün 11:45', author: 'Ebru TEKNECİ (Tahta)', sharedWithClass: '9-A', downloadsCount: 15 },
      { id: 'f-8', name: 'BeyazTahta_Kelimede_Anlam_Zihin_Haritasi.png', extension: 'png', size: '1.9 MB', updatedAt: '2 gün önce', author: 'Ebru TEKNECİ (Tahta)', sharedWithClass: '9-A', downloadsCount: 22 },
      { id: 'f-9', name: 'Paragraf_Akis_Semasi_Canli_Cizim.png', extension: 'png', size: '3.1 MB', updatedAt: '5 gün önce', author: 'Ebru TEKNECİ (Tahta)', downloadsCount: 18 },
    ],
  },
  {
    id: 'folder-meb-curriculum',
    name: 'MEB Müfredat Kılavuzları & Kitaplar',
    description: 'Bakanlık 9. Sınıf Edebiyat ders kitabı, yıllık planlar, zümre hedefleri ve kazanım tabloları.',
    color: 'border-purple-200 dark:border-purple-900/50 hover:border-purple-400',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50/60 dark:bg-purple-950/30',
    files: [
      { id: 'f-10', name: 'MEB_9_Sinif_Turk_Dili_ve_Edebiyati_Ders_Kitabi.pdf', extension: 'pdf', size: '42.5 MB', updatedAt: 'Eylül 2026', author: 'MEB Yayınları', downloadsCount: 110 },
      { id: 'f-11', name: '2026_2027_Edebiyat_Yillik_Cerceve_Plani.docx', extension: 'docx', size: '1.4 MB', updatedAt: 'Eylül 2026', author: 'Ebru TEKNECİ', downloadsCount: 45 },
      { id: 'f-12', name: 'MEB_Haftalik_Kazanim_ve_Degerlendirme_Tablosu.xlsx', extension: 'xlsx', size: '680 KB', updatedAt: '1 ay önce', author: 'Ebru TEKNECİ', downloadsCount: 16 },
    ],
  },
  {
    id: 'folder-official-docs',
    name: 'Zümre Tutanakları ve Resmi Evraklar',
    description: 'Sene başı ve dönem başı zümre toplantı tutanakları, şube öğretmenler kurulu kararları ve dilekçeler.',
    color: 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50/60 dark:bg-amber-950/30',
    files: [
      { id: 'f-13', name: '2026_2027_1_Donem_Zumre_Ogretmenler_Kurulu_Tutanagi.pdf', extension: 'pdf', size: '2.2 MB', updatedAt: '15 Eylül', author: 'Ebru TEKNECİ', downloadsCount: 12 },
      { id: 'f-14', name: '9-A_Sube_Ogretmenler_Kurulu_Toplanti_Raporu.docx', extension: 'docx', size: '940 KB', updatedAt: '28 Eylül', author: 'Ebru TEKNECİ', downloadsCount: 8 },
    ],
  },
  {
    id: 'folder-student-projects',
    name: 'Öğrenci Proje & Ödev Arşivi',
    description: 'Öğrencilerin teslim ettiği dönem projeleri, şiir dinletisi ses kayıtları ve ödev derlemeleri.',
    color: 'border-rose-200 dark:border-rose-900/50 hover:border-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50/60 dark:bg-rose-950/30',
    files: [
      { id: 'f-15', name: '101_Ercil_Ugurlu_Edebi_Metin_Incelemesi_Proje.pdf', extension: 'pdf', size: '4.8 MB', updatedAt: 'Dün', author: 'Erçil UĞURLU', downloadsCount: 4 },
      { id: 'f-16', name: '102_Zeynep_Yilmaz_Cumhuriyet_Donemi_Siirleri.pdf', extension: 'pdf', size: '3.6 MB', updatedAt: '3 gün önce', author: 'Zeynep YILMAZ', downloadsCount: 3 },
    ],
  },
]

export default function TeacherFilesView() {
  const [folders, setFolders] = useState<FolderCategory[]>(INITIAL_FOLDERS)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false)
  const [newFileName, setNewFileName] = useState<string>('')
  const [targetFolderForUpload, setTargetFolderForUpload] = useState<string>(folders[0].id)

  const activeFolder = folders.find((f) => f.id === selectedFolderId)

  // Total statistics
  const totalFilesCount = folders.reduce((acc, f) => acc + f.files.length, 0)

  // Filtered files when inside a folder or searching globally
  const displayedFiles = activeFolder
    ? activeFolder.files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName.trim()) {
      toast.error('Lütfen bir dosya adı girin.')
      return
    }

    const extMatch = newFileName.includes('.') ? newFileName.split('.').pop()?.toLowerCase() : 'pdf'
    const safeExt = (['pdf', 'png', 'docx', 'pptx', 'xlsx'].includes(extMatch || '') ? extMatch : 'pdf') as FileItem['extension']

    const newFile: FileItem = {
      id: `f-${Date.now()}`,
      name: newFileName.includes('.') ? newFileName : `${newFileName}.pdf`,
      extension: safeExt,
      size: '1.8 MB',
      updatedAt: 'Şimdi',
      author: 'Ebru TEKNECİ',
      downloadsCount: 0,
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === targetFolderForUpload ? { ...f, files: [newFile, ...f.files] } : f))
    )

    toast.success(`"${newFile.name}" başarıyla yüklendi.`)
    setNewFileName('')
    setIsUploadModalOpen(false)
  }

  const handleDownload = (file: FileItem) => {
    toast.success(`${file.name} başarıyla indirildi.`)
  }

  const handleShareToClass = (file: FileItem) => {
    toast.success(`"${file.name}" 9-A ve 9-B sınıfı öğrenci panellerinde paylaşıldı.`)
  }

  const handleSendToSmartboard = (file: FileItem) => {
    toast.success(`"${file.name}" akıllı tahtaya canlı aktarıldı. Tahtada açılıyor...`)
  }

  const getExtensionBadge = (ext: FileItem['extension']) => {
    switch (ext) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">PDF</span>
      case 'pptx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">PPTX</span>
      case 'docx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">DOCX</span>
      case 'xlsx':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">XLSX</span>
      case 'png':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40">GÖRSEL</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gray-100 text-gray-700">BELGE</span>
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-jakarta space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <Layers size={15} />
            <span>Kişisel & Sınıf Dosya Kütüphanesi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Dosyalarım ve Paylaşımlar
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ders sunumları, çalışma yaprakları, tahta çizimleri ve resmi evraklar klasör bazlı organize edilmiştir
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs shadow-indigo-500/20"
          >
            <Upload size={15} />
            <span>Yeni Dosya Yükle</span>
          </button>
        </div>
      </div>

      {/* ── BREADCRUMB NAVIGATION & SEARCH ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null)
              setSearchTerm('')
            }}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              selectedFolderId === null
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Folder size={15} />
            <span>Kök Klasörler ({folders.length})</span>
          </button>

          {activeFolder && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-900 dark:text-white font-extrabold flex items-center gap-1.5">
                <FolderOpen size={15} className={activeFolder.iconColor} />
                <span>{activeFolder.name}</span>
              </span>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeFolder ? `"${activeFolder.name}" içinde ara...` : 'Dosya veya klasör ara...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ── ROOT VIEW: FOLDER CARDS (KLASÖR MANTIĞI) ── */}
      {selectedFolderId === null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1 font-bold">
            <span>Ders Materyali Kategorileri & Klasörler</span>
            <span>Toplam {totalFilesCount} Dosya</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders
              .filter((f) =>
                searchTerm
                  ? f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.files.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  : true
              )
              .map((folder) => {
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedFolderId(folder.id)
                      setSearchTerm('')
                    }}
                    className={`group p-5 rounded-3xl border ${folder.color} bg-white dark:bg-[#121826] text-left transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 rounded-2xl ${folder.bgLight} ${folder.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                          <Folder size={24} />
                        </div>
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {folder.files.length} Dosya
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {folder.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <span>Klasörü Aç</span>
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      ) : (
        /* ── INSIDE FOLDER VIEW: FILE LIST & ACTIONS ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setSelectedFolderId(null)
                setSearchTerm('')
              }}
              className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Geri (Tüm Klasörler)</span>
            </button>

            <span className="text-xs font-bold text-gray-400">
              {displayedFiles.length} / {activeFolder?.files.length} dosya listeleniyor
            </span>
          </div>

          <div className="bg-white dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs divide-y divide-gray-100 dark:divide-gray-800/80">
            {displayedFiles.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Bu klasörde aradığınız kriterde dosya bulunamadı.
              </div>
            ) : (
              displayedFiles.map((file) => (
                <div
                  key={file.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-gray-200/60 dark:border-gray-800 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-gray-600 dark:text-gray-300" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {file.name}
                        </span>
                        {getExtensionBadge(file.extension)}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">{file.author}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.updatedAt}</span>
                        {file.sharedWithClass && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              {file.sharedWithClass} Paylaşıldı
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="h-8 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Önizle"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Önizle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendToSmartboard(file)}
                      className="h-8 px-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-600 dark:text-teal-400 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Akıllı Tahtaya Gönder"
                    >
                      <Tv size={13} />
                      <span className="hidden sm:inline">Tahtaya Gönder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareToClass(file)}
                      className="h-8 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Sınıfla Paylaş"
                    >
                      <Share2 size={13} />
                      <span className="hidden sm:inline">Paylaş</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="İndir"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: YENİ DOSYA YÜKLE ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Dosya Yükle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUploadFile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Hedef Klasör
                  </label>
                  <select
                    value={targetFolderForUpload}
                    onChange={(e) => setTargetFolderForUpload(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Dosya Adı & Uzantısı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 9-A_Edebiyat_Cümle_Turleri_Notlari.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-[#161D2E] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Desteklenen formatlar: .pdf, .docx, .pptx, .xlsx, .png
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs shadow-indigo-500/20"
                  >
                    Klasöre Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: DOSYA ÖNİZLEME ── */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white truncate max-w-[280px]">
                    {previewFile.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview Content Placeholder */}
              <div className="h-64 rounded-2xl bg-gray-50 dark:bg-[#161D2E] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <FileText size={28} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{previewFile.name}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Boyut: {previewFile.size} • Yazar: {previewFile.author} • {previewFile.updatedAt}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 max-w-xs">
                  MEB Türk Dili ve Edebiyatı ders dokümanı güvenli görüntüleme penceresi hazır.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSendToSmartboard(previewFile)
                    setPreviewFile(null)
                  }}
                  className="h-10 px-4 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Tv size={14} />
                  <span>Tahtaya Yansıt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(previewFile)
                    setPreviewFile(null)
                  }}
                  className="h-10 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>İndir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
