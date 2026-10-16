'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Pin,
  FileText,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Check,
  X,
  Tv,
  GraduationCap,
  Calendar,
  Building2,
  RefreshCw,
  Copy,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getStoredPrincipalProfile } from '@/lib/principal/principalProfileStorage'

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  author: string
  authorRole: string
  targetAudience: 'all' | 'parents' | 'teachers' | '9/A' | 'emergency'
  audienceLabel: string
  category: 'academic' | 'meeting' | 'administrative' | 'event' | 'emergency'
  categoryLabel: string
  date: string
  createdAt: number
  isPinned: boolean
  displayOnBoards: boolean
  smsSent: boolean
}

export interface SmsLogItem {
  id: string
  title: string
  message: string
  recipientGroup: string
  recipientCount: number
  status: 'delivered' | 'processing' | 'failed'
  sentAt: string
  costCredits: number
  senderHeader: string
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-p-1',
    title: '9-A Şubesi Dönem Ortası Akademik Başarı ve Tebrik Bildirimi',
    content:
      '9-A şubemiz Türk Dili ve Edebiyatı, Matematik ve Bilişim derslerindeki üstün performansıyla okulumuzun birinci şubesi olarak devam etmektedir. Tüm öğrencilerimizi ve zümre öğretmenimiz Ebru Hanımı tebrik eder, başarılarının devamını dilerim.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetAudience: 'all',
    audienceLabel: 'Tüm Okul & Veliler',
    category: 'academic',
    categoryLabel: 'Akademik Başarı',
    date: 'Bugün, 09:30',
    createdAt: Date.now() - 3600000,
    isPinned: true,
    displayOnBoards: true,
    smsSent: true,
  },
  {
    id: 'ann-p-2',
    title: '2026-2027 Eğitim Öğretim Yılı 1. Dönem Veli Toplantısı',
    content:
      'Değerli Velilerimiz; 1. Dönem Veli-Öğretmen Değerlendirme Toplantısı 25 Ekim 2026 Cumartesi günü saat 13:00\'te okulumuz konferans salonunda gerçekleştirilecektir. Öğrencilerimizin akademik ve sosyal gelişim süreçlerinin görüşüleceği toplantıya katılımınızı önemle rica ederiz.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetAudience: 'parents',
    audienceLabel: 'Tüm Sınıf Velileri',
    category: 'meeting',
    categoryLabel: 'Veli Toplantısı',
    date: '14 Ekim 2026, 11:00',
    createdAt: Date.now() - 86400000,
    isPinned: true,
    displayOnBoards: true,
    smsSent: true,
  },
  {
    id: 'ann-p-3',
    title: 'Öğretmenler Kurulu ve Zümre Başkanları Toplantısı',
    content:
      'Değerli Öğretmenlerimiz; Ara sınav öncesi soru hazırlama ve kazanım değerlendirme toplantısı yarın saat 16:30\'da Öğretmenler Odasında yapılacaktır. Tüm branş zümre başkanlarımızın taslak sınav formlarıyla hazır bulunması rica olunur.',
    author: 'Dr. Uğur UĞURLU',
    authorRole: 'Okul Müdürü',
    targetAudience: 'teachers',
    audienceLabel: 'Öğretmenler & Kadro',
    category: 'administrative',
    categoryLabel: 'İdari & Kadro',
    date: '12 Ekim 2026, 14:20',
    createdAt: Date.now() - 172800000,
    isPinned: false,
    displayOnBoards: false,
    smsSent: true,
  },
  {
    id: 'ann-p-4',
    title: 'Akıllı Tahta ve Dijital Kütüphane Yeni Föyleri Yayında',
    content:
      'Dersliklerimizde bulunan akıllı tahtalar ve öğrenci mobil uygulaması ile senkron çalışan yeni MEB uyumlu dijital föyler, soru bankaları ve video kaynaklar kütüphaneye eklenmiştir.',
    author: 'Ebru TEKNECİ',
    authorRole: '9-A Rehber Öğretmeni',
    targetAudience: '9/A',
    audienceLabel: '9/A Şubesi',
    category: 'academic',
    categoryLabel: 'Müfredat & Kitaplık',
    date: '11 Ekim 2026, 10:15',
    createdAt: Date.now() - 259200000,
    isPinned: false,
    displayOnBoards: true,
    smsSent: false,
  },
  {
    id: 'ann-p-5',
    title: 'TÜBİTAK ve Bilişim Projeleri Öğrenci Başvuruları Başladı',
    content:
      'Bu yıl düzenlenecek geleneksel Oxonom Bilim Şenliği ve TÜBİTAK 4006 proje başvuruları için danışman öğretmenlerimiz koordinasyonunda hazırlıklar başlamıştır. İlgilenen öğrencilerimizin başvurularını bekliyoruz.',
    author: 'Oxonom Bilim Koordinatörlüğü',
    authorRole: 'Akademik Koordinatörlük',
    targetAudience: 'all',
    audienceLabel: 'Tüm Okul',
    category: 'event',
    categoryLabel: 'Bilim & Etkinlik',
    date: '10 Ekim 2026, 09:00',
    createdAt: Date.now() - 345600000,
    isPinned: false,
    displayOnBoards: true,
    smsSent: false,
  },
]

const INITIAL_SMS_LOGS: SmsLogItem[] = [
  {
    id: 'sms-log-1',
    title: 'Veli Toplantısı Daveti',
    message:
      'Sayin Velimiz; 1. Donem Veli Toplantisi 25 Ekim Cumartesi 13:00\'te okulumuzda yapilacaktir. Katiliminizi rica ederiz. Oxonom Okullari Mudurlugu',
    recipientGroup: 'Tüm Okul Velileri (124 Veli)',
    recipientCount: 124,
    status: 'delivered',
    sentAt: '14 Ekim 2026, 11:05',
    costCredits: 124,
    senderHeader: 'OXONOM-EDU',
  },
  {
    id: 'sms-log-2',
    title: 'Öğretmenler Kurulu Bilgilendirmesi',
    message:
      'Degerli Ogretmenlerimiz; Yarin 16:30\'da yapilacak Ogretmenler Kurulu toplantisina zumre taslaklariyla katilmaniz rica olunur. Dr. Ugur UGURLU',
    recipientGroup: 'Tüm Öğretmen Kadrosu (18 Öğretmen)',
    recipientCount: 18,
    status: 'delivered',
    sentAt: '12 Ekim 2026, 14:22',
    costCredits: 18,
    senderHeader: 'OXONOM-EDU',
  },
  {
    id: 'sms-log-3',
    title: '9-A Şubesi Başarı Tebriği',
    message:
      'Sayin Velimiz; 9-A subemiz aylik akademik basarisiyla okulumuz birincisi olmustur. Tebrik eder basarilar dileriz. Oxonom Okullari',
    recipientGroup: '9/A Şubesi Velileri (24 Veli)',
    recipientCount: 24,
    status: 'delivered',
    sentAt: '10 Ekim 2026, 10:00',
    costCredits: 24,
    senderHeader: 'OXONOM-EDU',
  },
]

const MEB_SMS_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Günlük Devamsızlık Uyarısı',
    category: 'Devamsızlık',
    text: 'Sayin Velimiz; {OgrenciAdi} isimli ogrencimiz bugun ({Tarih}) okulda derslere katilmamistir. Bilgilerinize rica olunur. Oxonom Okullari Mudurlugu',
  },
  {
    id: 'tpl-2',
    title: 'Veli Toplantısı Davetiyesi',
    category: 'Veli İletişimi',
    text: 'Sayin Velimiz; {Sinif} subesi veli toplantisi {Tarih} saat {Saat}\'te okulumuzda yapilacaktir. Katiliminizi rica ederiz. Oxonom Okullari',
  },
  {
    id: 'tpl-3',
    title: 'Ara Tatil & Dönem Sonu Bilgilendirmesi',
    category: 'Dönem Takvimi',
    text: 'Sayin Velimiz; MEB takvimi uyarinca 1. Donem ara tatili {Tarih} itibariyla baslayacaktir. Ders baslama tarihi {DersTarih}\'dir. Iyi tatiller dileriz. Oxonom Okullari',
  },
  {
    id: 'tpl-4',
    title: 'Olumsuz Hava & Kar Tatili Duyurusu',
    category: 'Acil Durum',
    text: 'Sayin Velimiz; Valilik karariyla il genelinde olumsuz hava sartlari nedeniyle egitim-ogretime 1 gun ara verilmistir. Oxonom Okullari Mudurlugu',
  },
  {
    id: 'tpl-5',
    title: 'Deneme Sınavı & Akademik Tebrik',
    category: 'Akademik',
    text: 'Sayin Velimiz; {OgrenciAdi} son deneme sinavinda {Puan} puan alarak sinifinda derece yapmistir. Basarilarinin devamini dileriz. Oxonom Okullari',
  },
  {
    id: 'tpl-6',
    title: 'Dijital Ödev & Akıllı Tahta Çalışması',
    category: 'Ödev & Takip',
    text: 'Sayin Velimiz; Ogrencimizin haftalik tekrar calismalari ve dijital odevleri Oxonom Portalina yuklenmistir. Kontrolunuzu rica ederiz.',
  },
]

export default function PrincipalAnnouncementsView() {
  const [activeTab, setActiveTab] = useState<'board' | 'sms_history' | 'templates'>('board')
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Principal profile identity
  const [principalName, setPrincipalName] = useState('Dr. Uğur UĞURLU')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = getStoredPrincipalProfile()
        if (p?.name) setPrincipalName(p.name)
      } catch (_) {}
    }
  }, [])

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_announcements')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return INITIAL_ANNOUNCEMENTS
  })

  // SMS Logs State
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_sms_logs')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (_) {}
    }
    return INITIAL_SMS_LOGS
  })

  // SMS Credit balance
  const [smsCredits, setSmsCredits] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oxonom_principal_sms_credits')
        if (saved) return parseInt(saved, 10)
      } catch (_) {}
    }
    return 8520
  })

  // Persist helpers
  const persistAnnouncements = (list: AnnouncementItem[]) => {
    setAnnouncements(list)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_principal_announcements', JSON.stringify(list))
        localStorage.setItem('oxonom_school_announcements_index', JSON.stringify(list))
        window.dispatchEvent(new CustomEvent('oxonom_announcements_updated', { detail: list }))
      } catch (_) {}
    }
  }

  const persistSmsLogs = (logs: SmsLogItem[], newCredit: number) => {
    setSmsLogs(logs)
    setSmsCredits(newCredit)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oxonom_principal_sms_logs', JSON.stringify(logs))
        localStorage.setItem('oxonom_principal_sms_credits', String(newCredit))
      } catch (_) {}
    }
  }

  // Modals state
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false)
  const [isNewSmsModalOpen, setIsNewSmsModalOpen] = useState(false)

  // New Announcement Form State
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAudience, setFormAudience] = useState<'all' | 'parents' | 'teachers' | '9/A' | 'emergency'>('all')
  const [formCategory, setFormCategory] = useState<'academic' | 'meeting' | 'administrative' | 'event' | 'emergency'>('academic')
  const [formIsPinned, setFormIsPinned] = useState(false)
  const [formDisplayOnBoards, setFormDisplayOnBoards] = useState(true)
  const [formSendSmsAlso, setFormSendSmsAlso] = useState(false)

  // New SMS Form State
  const [smsTargetGroup, setSmsTargetGroup] = useState('Tüm Okul Velileri (124 Veli)')
  const [smsTitle, setSmsTitle] = useState('')
  const [smsMessage, setSmsMessage] = useState('')

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Audience filter
      if (selectedAudienceFilter !== 'all') {
        if (selectedAudienceFilter === 'parents' && item.targetAudience !== 'parents' && item.targetAudience !== 'all') return false
        if (selectedAudienceFilter === 'teachers' && item.targetAudience !== 'teachers' && item.targetAudience !== 'all') return false
        if (selectedAudienceFilter === '9/A' && item.targetAudience !== '9/A' && item.targetAudience !== 'all') return false
        if (selectedAudienceFilter === 'emergency' && item.targetAudience !== 'emergency' && item.category !== 'emergency') return false
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [announcements, selectedAudienceFilter, searchQuery])

  // Create Announcement Handler
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Lütfen duyuru başlığı ve metnini giriniz.')
      return
    }

    const audienceLabels: Record<string, string> = {
      all: 'Tüm Okul & Veliler',
      parents: 'Tüm Sınıf Velileri',
      teachers: 'Öğretmenler & Kadro',
      '9/A': '9/A Şubesi',
      emergency: 'Acil Durum & Tatil',
    }

    const categoryLabels: Record<string, string> = {
      academic: 'Akademik Başarı',
      meeting: 'Veli Toplantısı',
      administrative: 'İdari & Kadro',
      event: 'Etkinlik & Fuar',
      emergency: 'Acil Durum Bildirisi',
    }

    const newAnn: AnnouncementItem = {
      id: `ann-p-${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      author: principalName,
      authorRole: 'Okul Müdürü',
      targetAudience: formAudience,
      audienceLabel: audienceLabels[formAudience] || 'Tüm Okul',
      category: formCategory,
      categoryLabel: categoryLabels[formCategory] || 'Genel',
      date: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isPinned: formIsPinned,
      displayOnBoards: formDisplayOnBoards,
      smsSent: formSendSmsAlso,
    }

    const updated = [newAnn, ...announcements]
    persistAnnouncements(updated)

    // If SMS was also requested
    if (formSendSmsAlso) {
      const recipientCount = formAudience === 'parents' ? 124 : formAudience === 'teachers' ? 18 : 24
      const newSms: SmsLogItem = {
        id: `sms-log-${Date.now()}`,
        title: formTitle.trim(),
        message: formContent.trim().substring(0, 155),
        recipientGroup: audienceLabels[formAudience],
        recipientCount,
        status: 'delivered',
        sentAt: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        costCredits: recipientCount,
        senderHeader: 'OXONOM-EDU',
      }
      persistSmsLogs([newSms, ...smsLogs], Math.max(0, smsCredits - recipientCount))
      toast.success('Duyuru yayınlandı ve velilere SMS iletildi!')
    } else {
      toast.success('Yeni duyuru başarıyla yayınlandı!')
    }

    // Reset
    setFormTitle('')
    setFormContent('')
    setFormSendSmsAlso(false)
    setIsNewAnnouncementModalOpen(false)
  }

  // Send Direct SMS Handler
  const handleSendDirectSms = (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsTitle.trim() || !smsMessage.trim()) {
      toast.error('Lütfen SMS başlığı ve mesaj metnini yazınız.')
      return
    }

    let count = 124
    if (smsTargetGroup.includes('9/A')) count = 24
    if (smsTargetGroup.includes('Öğretmen')) count = 18
    if (smsTargetGroup.includes('Devamsız')) count = 4

    const newLog: SmsLogItem = {
      id: `sms-log-${Date.now()}`,
      title: smsTitle.trim(),
      message: smsMessage.trim(),
      recipientGroup: smsTargetGroup,
      recipientCount: count,
      status: 'delivered',
      sentAt: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      costCredits: count,
      senderHeader: 'OXONOM-EDU',
    }

    persistSmsLogs([newLog, ...smsLogs], Math.max(0, smsCredits - count))
    toast.success(`${count} alıcıya Toplu SMS başarıyla iletildi!`)

    setSmsTitle('')
    setSmsMessage('')
    setIsNewSmsModalOpen(false)
  }

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    persistAnnouncements(updated)
    toast.success('Duyuru sabitleme durumu güncellendi.')
  }

  // Toggle Smartboard
  const handleToggleBoard = (id: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, displayOnBoards: !a.displayOnBoards } : a))
    persistAnnouncements(updated)
    toast.success('Akıllı tahta ve pano görünürlüğü güncellendi.')
  }

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
      const updated = announcements.filter((a) => a.id !== id)
      persistAnnouncements(updated)
      toast.success('Duyuru yayından kaldırıldı.')
    }
  }

  // Apply Template to SMS modal
  const handleApplyTemplate = (tpl: typeof MEB_SMS_TEMPLATES[0]) => {
    setSmsTitle(tpl.title)
    let processedText = tpl.text
      .replace('{OgrenciAdi}', 'Ercil Uğur')
      .replace('{Sinif}', '9/A')
      .replace('{Tarih}', new Date().toLocaleDateString('tr-TR'))
      .replace('{Saat}', '14:00')
      .replace('{DersTarih}', '10 Kasım 2026')
      .replace('{Puan}', '98.5')
    setSmsMessage(processedText)
    setIsNewSmsModalOpen(true)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-7 space-y-6 font-jakarta select-none">
      {/* ── 1. HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black mb-2 border border-purple-500/20">
            <Megaphone size={14} />
            <span>Okul Yönetim & İletişim Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Duyurular & Toplu SMS Merkezi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Oxonom Okulları kurumsal duyuruları, veli ve öğretmen bilgilendirmeleri, MEB onaylı SMS gönderimleri ve akıllı tahta panoları.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewSmsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121826] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200/90 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-98"
          >
            <Smartphone size={16} className="text-blue-500" />
            <span>Toplu SMS Gönder</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewAnnouncementModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/20 cursor-pointer transition-all active:scale-98"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Yeni Duyuru Yayınla</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI İSTATİSTİK ŞERİDİ ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {announcements.length}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              Aktif Yayında Duyuru
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Send size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {smsLogs.reduce((acc, log) => acc + log.recipientCount, 0)}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              İletilen Toplu SMS
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              %99.6
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              Teslimat Başarısı
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Smartphone size={22} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {smsCredits.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">
              MEB SMS Kredisi
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. VIEW & SUB-TAB SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#121826] border border-gray-200/80 dark:border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'board'
                ? 'bg-white dark:bg-[#1F2937] text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Megaphone size={14} />
            <span>Duyuru Panosu ({filteredAnnouncements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms_history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sms_history'
                ? 'bg-white dark:bg-[#1F2937] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Send size={14} />
            <span>SMS İletim Geçmişi ({smsLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-[#1F2937] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>MEB Uyumlu SMS Şablonları</span>
          </button>
        </div>

        {/* Quick Search inside Board */}
        {activeTab === 'board' && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Duyurularda ara..."
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-white dark:bg-[#1A2234] border border-gray-200 dark:border-gray-700/80 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {/* ── 4. DUYURU PANOSU TAB ── */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Kategori / Hedef Kitle Filtreleri */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter size={13} />
              <span>Hedef Kitle:</span>
            </span>

            {[
              { id: 'all', label: 'Tümü' },
              { id: 'parents', label: 'Velilere SMS & Duyuru' },
              { id: 'teachers', label: 'Öğretmenler & Kadro' },
              { id: '9/A', label: '9/A Şubesi' },
              { id: 'emergency', label: 'Acil Durum & Tatil' },
            ].map((chip) => {
              const isSelected = selectedAudienceFilter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedAudienceFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#121826] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          {/* Duyuru Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((ann) => (
              <motion.div
                key={ann.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl bg-white dark:bg-[#121826] border transition-all shadow-xs flex flex-col justify-between ${
                  ann.isPinned
                    ? 'border-purple-500/40 dark:border-purple-500/30 ring-1 ring-purple-500/10'
                    : 'border-gray-200/90 dark:border-gray-800'
                }`}
              >
                <div>
                  {/* Üst Satır: Kategori & Hedef Kitle & Sabitleme */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-black border border-purple-200/40">
                        {ann.audienceLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-bold">
                        {ann.categoryLabel}
                      </span>
                      {ann.smsSent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold border border-blue-200/40">
                          <Smartphone size={10} />
                          <span>SMS İletildi</span>
                        </span>
                      )}
                      {ann.displayOnBoards && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200/40">
                          <Tv size={10} />
                          <span>Tahta Panosunda</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(ann.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        ann.isPinned
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={ann.isPinned ? 'Sabitlemeyi Kaldır' : 'Panoya Sabitle'}
                    >
                      <Pin size={13} className={ann.isPinned ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Duyuru Başlığı */}
                  <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug">
                    {ann.title}
                  </h3>

                  {/* İçerik */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                {/* Alt Satır: Yazar, Tarih ve İşlem Butonları */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {ann.author}
                    </span>
                    <span>·</span>
                    <span className="text-[11px] text-gray-400">{ann.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleBoard(ann.id)}
                      className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-bold cursor-pointer transition-colors"
                      title="Akıllı Tahtaya Yansıt / Gizle"
                    >
                      <Tv size={12} className="inline mr-1" />
                      <span>{ann.displayOnBoards ? 'Tahtadan Al' : 'Tahtaya Ver'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                      title="Duyuruyu Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="col-span-full p-8 text-center rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 text-gray-400 space-y-2">
                <Megaphone size={32} className="mx-auto text-gray-400/60" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Bu filtreye uygun duyuru bulunamadı.
                </p>
                <p className="text-xs text-gray-400">
                  Yeni bir duyuru ekleyebilir veya filtre seçimini değiştirebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. SMS İLETİM GEÇMİŞİ TAB ── */}
      {activeTab === 'sms_history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <div className="font-black text-gray-900 dark:text-white">
                  MEB Alfanumerik SMS Başlığı: <strong>OXONOM-EDU</strong>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Türk Telekom, Turkcell ve Vodafone şebekelerine anlık resmi SMS iletimi aktiftir.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNewSmsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              Hızlı SMS Gönder
            </button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121826]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-bold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-3.5 pl-5">Gönderim Başlığı & Mesaj</th>
                  <th className="p-3.5">Hedef Kitle</th>
                  <th className="p-3.5">Alıcı</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5 pr-5 text-right">Kredi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {smsLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-3.5 pl-5 max-w-sm">
                      <div className="font-black text-gray-900 dark:text-white">{log.title}</div>
                      <div className="text-gray-500 truncate mt-0.5">{log.message}</div>
                    </td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300 font-bold">
                      {log.recipientGroup}
                    </td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300">
                      {log.recipientCount} Kişi
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[11px] border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span>İletildi</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400 whitespace-nowrap">{log.sentAt}</td>
                    <td className="p-3.5 pr-5 text-right font-black text-purple-600 dark:text-purple-400">
                      -{log.costCredits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. MEB HAZIR SMS ŞABLONLARI TAB ── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-black text-gray-900 dark:text-white">
                  Milli Eğitim Bakanlığı Resmi İletişim Standartları
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Aşağıdaki hazır şablonlara tıklayarak doğrudan veli veya öğretmenlere SMS gönderebilirsiniz.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEB_SMS_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#121826] border border-gray-200/90 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10.5px] font-black border border-purple-200/40">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">160 Karakter</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                    {tpl.title}
                  </h4>

                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2 leading-relaxed">
                    {tpl.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
                >
                  <Send size={13} />
                  <span>Bu Şablonla SMS Gönder</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL 1: YENİ DUYURU YAYINLA ── */}
      <AnimatePresence>
        {isNewAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewAnnouncementModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full sm:max-w-lg rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 shadow-2xl p-5 sm:p-6 z-10 text-gray-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Yeni Kurumsal Duyuru Yayınla</h3>
                    <p className="text-xs text-gray-400">Öğrenci, veli ve öğretmen panellerine anında iletilir</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewAnnouncementModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Duyuru Başlığı:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: 1. Dönem Veli-Öğretmen Buluşması"
                    className="w-full h-11 px-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Hedef Kitle:
                    </label>
                    <select
                      value={formAudience}
                      onChange={(e) => setFormAudience(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    >
                      <option value="all">Tüm Okul & Veliler</option>
                      <option value="parents">Yalnızca Veliler</option>
                      <option value="teachers">Yalnızca Öğretmenler</option>
                      <option value="9/A">9/A Şubesi</option>
                      <option value="emergency">Acil Durum Bildirisi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Duyuru Türü:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    >
                      <option value="academic">Akademik Başarı & Sınav</option>
                      <option value="meeting">Veli Toplantısı</option>
                      <option value="administrative">İdari & Kadro</option>
                      <option value="event">Etkinlik & Bilim Fuarı</option>
                      <option value="emergency">Acil Durum & Tatil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Duyuru Metni:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Duyuru metnini detaylı şekilde yazınız..."
                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 leading-relaxed"
                  />
                </div>

                {/* Tercihler */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Panonun en üstüne sabitle (Önemli Duyuru)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDisplayOnBoards}
                      onChange={(e) => setFormDisplayOnBoards(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Akıllı Tahtalarda ve Koridor Bilgi Ekranlarında Göster
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSendSmsAlso}
                      onChange={(e) => setFormSendSmsAlso(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Smartphone size={14} />
                      <span>Bu duyuruyu hedef kitlenin cep telefonlarına SMS olarak da gönder</span>
                    </span>
                  </label>
                </div>

                <div className="pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAnnouncementModalOpen(false)}
                    className="flex-1 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20 transition-all active:scale-98"
                  >
                    <Megaphone size={14} />
                    <span>Duyuruyu Yayınla</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: TOPLU SMS GÖNDER ── */}
      <AnimatePresence>
        {isNewSmsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-jakarta select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewSmsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full sm:max-w-md rounded-3xl bg-white dark:bg-[#121826] border border-gray-200 dark:border-gray-800 shadow-2xl p-5 sm:p-6 z-10 text-gray-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Toplu SMS Gönderimi</h3>
                    <p className="text-xs text-gray-400">MEB onaylı kurumsal SMS altyapısı</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewSmsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendDirectSms} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Alıcı Hedef Grubu:
                  </label>
                  <select
                    value={smsTargetGroup}
                    onChange={(e) => setSmsTargetGroup(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value="Tüm Okul Velileri (124 Veli)">Tüm Okul Velileri (124 Veli)</option>
                    <option value="9/A Şubesi Velileri (24 Veli)">9/A Şubesi Velileri (24 Veli)</option>
                    <option value="Tüm Öğretmen Kadrosu (18 Öğretmen)">Tüm Öğretmen Kadrosu (18 Öğretmen)</option>
                    <option value="Bugün Devamsız Olan Öğrenci Velileri (4 Veli)">
                      Bugün Devamsız Olan Öğrenci Velileri (4 Veli)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    SMS Başlığı (Kayıt İçin):
                  </label>
                  <input
                    type="text"
                    required
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    placeholder="Örn: Veli Bilgilendirme SMS"
                    className="w-full h-11 px-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-700 dark:text-gray-300 font-bold">
                      SMS Metni:
                    </label>
                    <span className="text-[11px] font-bold text-gray-400">
                      {smsMessage.length} / 160 Karakter ({Math.ceil(smsMessage.length / 160) || 1} SMS)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Gönderilecek SMS metnini giriniz..."
                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
                  />
                </div>

                {/* Sender ID info */}
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-semibold">Gönderici Başlığı:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">OXONOM-EDU</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewSmsModalOpen(false)}
                    className="flex-1 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer transition-colors"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all active:scale-98"
                  >
                    <Send size={14} />
                    <span>SMS Gönderimini Başlat</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
