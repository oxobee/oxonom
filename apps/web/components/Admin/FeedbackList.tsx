'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getAPIUrl } from '@services/config/config'
import { apiFetch, asArray, RequestBodyWithAuthHeader } from '@services/utils/ts/requests'
import toast from 'react-hot-toast'
import {
  MessageCircle,
  Trash2,
  Paperclip,
  Search,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Smile,
  Meh,
  Frown,
  Lightbulb,
  Bug,
  HelpCircle,
  MessageSquare,
  Building,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

export default function FeedbackList() {
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const isSuperadmin = session?.data?.user?.is_superadmin === true
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedReaction, setSelectedReaction] = useState<string>('all')
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: () => apiFetch(`${getAPIUrl()}monitoring/feedbacks`, token),
    enabled: !!token && isSuperadmin,
  })

  const rawList = asArray(feedbacks)

  // Computed statistics
  const stats = useMemo(() => {
    const total = rawList.length
    const happy = rawList.filter((f: any) => f.reaction === 'happy').length
    const suggestions = rawList.filter((f: any) => f.category === 'suggestion').length
    const bugs = rawList.filter((f: any) => f.category === 'bug').length
    const satisfaction = total > 0 ? Math.round((happy / total) * 100) : 0
    return { total, happy, suggestions, bugs, satisfaction }
  }, [rawList])

  // Filtered list
  const filteredFeedbacks = useMemo(() => {
    return rawList.filter((fb: any) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchMessage = (fb.message || '').toLowerCase().includes(q)
        const matchUser = (fb.user_name || '').toLowerCase().includes(q)
        const matchEmail = (fb.user_email || '').toLowerCase().includes(q)
        const matchOrg = (fb.org_name || '').toLowerCase().includes(q) || (fb.org_slug || '').toLowerCase().includes(q)
        if (!matchMessage && !matchUser && !matchEmail && !matchOrg) return false
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (fb.category !== selectedCategory) return false
      }

      // Reaction filter
      if (selectedReaction !== 'all') {
        if (fb.reaction !== selectedReaction) return false
      }

      // Device filter
      if (selectedDevice !== 'all') {
        const dev = (fb.device || '').toLowerCase()
        if (selectedDevice === 'mobile' && !dev.includes('mobil') && !dev.includes('iphone') && !dev.includes('android')) return false
        if (selectedDevice === 'desktop' && !dev.includes('masaüstü') && !dev.includes('mac') && !dev.includes('windows')) return false
        if (selectedDevice === 'tablet' && !dev.includes('tablet') && !dev.includes('ipad')) return false
      }

      return true
    })
  }, [rawList, searchQuery, selectedCategory, selectedReaction, selectedDevice])

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const res = await fetch(
        `${getAPIUrl()}monitoring/feedbacks/${deletingId}`,
        RequestBodyWithAuthHeader('DELETE', null, null, token)
      )
      if (!res.ok) throw new Error('Silinemedi')
      toast.success('Geri bildirim silindi')
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] })
    } catch {
      toast.error('Silinirken bir hata oluştu')
    } finally {
      setDeletingId(null)
    }
  }

  const renderReactionBadge = (reaction?: string) => {
    if (reaction === 'happy') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Smile size={13} />
          <span>Memnun</span>
        </span>
      )
    }
    if (reaction === 'neutral') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Meh size={13} />
          <span>Nötr</span>
        </span>
      )
    }
    if (reaction === 'sad') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Frown size={13} />
          <span>Memnun Değil</span>
        </span>
      )
    }
    return <span className="text-white/20 text-xs">-</span>
  }

  const renderCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'suggestion':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lightbulb size={12} />
            <span>Öneri</span>
          </span>
        )
      case 'bug':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bug size={12} />
            <span>Hata</span>
          </span>
        )
      case 'question':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HelpCircle size={12} />
            <span>Soru</span>
          </span>
        )
      case 'general':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/10 text-white/70 border border-white/10">
            <MessageSquare size={12} />
            <span>Genel</span>
          </span>
        )
    }
  }

  const renderDeviceBadge = (device?: string, browser?: string) => {
    const isMobile = (device || '').toLowerCase().includes('mobil') || (device || '').toLowerCase().includes('iphone')
    const isTablet = (device || '').toLowerCase().includes('tablet') || (device || '').toLowerCase().includes('ipad')

    return (
      <div className="flex flex-col gap-1 text-xs">
        <span className="inline-flex items-center gap-1 text-white/80 font-medium">
          {isMobile ? <Smartphone size={13} className="text-amber-400" /> : isTablet ? <Tablet size={13} className="text-purple-400" /> : <Laptop size={13} className="text-sky-400" />}
          <span>{device || 'Bilinmiyor'}</span>
        </span>
        {browser && (
          <span className="text-[11px] text-white/40 flex items-center gap-1">
            <Globe size={11} />
            <span>{browser}</span>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-white/50 font-medium">Toplam Geri Bildirim</div>
          <div className="text-3xl font-black text-white mt-2">{stats.total}</div>
          <div className="text-[11px] text-white/30 mt-1">Platform genelinde</div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-white/50 font-medium">Memnuniyet Oranı</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">%{stats.satisfaction}</div>
          <div className="text-[11px] text-emerald-400/60 mt-1">{stats.happy} pozitif değerlendirme</div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-white/50 font-medium">Öneri & İstekler</div>
          <div className="text-3xl font-black text-indigo-400 mt-2">{stats.suggestions}</div>
          <div className="text-[11px] text-indigo-400/60 mt-1">Geliştirme talebi</div>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-white/50 font-medium">Hata Bildirimleri</div>
          <div className="text-3xl font-black text-rose-400 mt-2">{stats.bugs}</div>
          <div className="text-[11px] text-rose-400/60 mt-1">İncelenmesi gereken</div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mesaj, kullanıcı, e-posta veya okul ara..."
            className="w-full ps-9 pe-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Kategori Filtresi"
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="suggestion">💡 Öneriler</option>
            <option value="bug">🐞 Hata Bildirimleri</option>
            <option value="question">❓ Sorular</option>
            <option value="general">💬 Genel</option>
          </select>

          {/* Reaction Filter */}
          <select
            value={selectedReaction}
            onChange={(e) => setSelectedReaction(e.target.value)}
            aria-label="Reaksiyon Filtresi"
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Tüm Tepkiler</option>
            <option value="happy">😊 Memnun</option>
            <option value="neutral">😐 Nötr</option>
            <option value="sad">😞 Memnun Değil</option>
          </select>

          {/* Device Filter */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            aria-label="Cihaz Filtresi"
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Tüm Cihazlar</option>
            <option value="desktop">💻 Masaüstü</option>
            <option value="mobile">📱 Mobil</option>
            <option value="tablet">📱 Tablet</option>
          </select>
        </div>
      </div>

      {/* Feedbacks Table */}
      <div className="bg-[#141416] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-white/40 uppercase bg-white/[0.02] border-b border-white/10 tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Tarih</th>
                <th className="px-5 py-3.5 font-semibold">Kullanıcı</th>
                <th className="px-5 py-3.5 font-semibold">Okul / Kurum</th>
                <th className="px-5 py-3.5 font-semibold">Konu & Tepki</th>
                <th className="px-5 py-3.5 font-semibold">Cihaz & Tarayıcı</th>
                <th className="px-5 py-3.5 font-semibold">Mesaj & Sayfa</th>
                <th className="px-5 py-3.5 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
                    <span>Geri bildirimler yükleniyor...</span>
                  </td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <MessageCircle className="mx-auto h-10 w-10 text-white/15 mb-3" />
                    <p className="text-white/60 font-medium">Geri bildirim bulunamadı.</p>
                    <p className="text-white/30 text-[11px] mt-1">Filtreleri veya arama kriterini değiştirmeyi deneyin.</p>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb: any) => (
                  <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Tarih */}
                    <td className="px-5 py-4 text-white/70 whitespace-nowrap font-mono text-[11px]">
                      {fb.created_at ? new Date(fb.created_at).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </td>

                    {/* Kullanıcı */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{fb.user_name || 'İsimsiz'}</span>
                        <span className="text-white/40 text-[11px] font-mono">{fb.user_email || 'E-posta yok'}</span>
                      </div>
                    </td>

                    {/* Okul / Kurum */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {fb.org_name ? (
                        <div className="flex items-center gap-1.5">
                          <Building size={13} className="text-white/40" />
                          <div className="flex flex-col">
                            <span className="text-white/90 font-medium">{fb.org_name}</span>
                            {fb.org_slug && <span className="text-white/40 text-[10px]">/{fb.org_slug}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/30 text-[11px]">Genel / Ana Site</span>
                      )}
                    </td>

                    {/* Konu & Tepki */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {renderCategoryBadge(fb.category)}
                        {renderReactionBadge(fb.reaction)}
                      </div>
                    </td>

                    {/* Cihaz & Tarayıcı */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderDeviceBadge(fb.device, fb.browser)}
                    </td>

                    {/* Mesaj & Sayfa */}
                    <td className="px-5 py-4 max-w-md">
                      <div className="text-white/90 whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {fb.message}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        {fb.page_url && (
                          <a
                            href={fb.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <ExternalLink size={10} />
                            <span>Sayfa Bağlantısı</span>
                          </a>
                        )}

                        {fb.attachments?.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                            <Paperclip size={11} />
                            <span>{fb.attachments.length} dosya eki</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* İşlemler */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDeletingId(fb.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Geri Bildirimi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="sm:max-w-[420px] bg-[#141416] border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Geri Bildirimi Sil</DialogTitle>
            <DialogDescription className="text-xs text-white/50 mt-1">
              Bu geri bildirim kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 gap-2">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
            >
              Sil
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
