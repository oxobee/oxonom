'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAPIUrl } from '@services/config/config'
import { apiFetch } from '@services/utils/ts/requests'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import {
  CreditCard,
  Check,
  Robot,
  Users,
  BookOpen,
  ShieldStar,
  SlidersHorizontal,
  Coins,
} from '@phosphor-icons/react'

interface PlanItem {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  courses_limit: number
  members_limit: number
  admin_limit: number
  ai_credits: number
  features: Record<string, boolean>
}

const FEATURE_NAMES: Record<string, string> = {
  ai: 'Yapay Zeka (AI Asistanı & Copilot)',
  analytics: 'Gelişmiş Analitikler',
  api: 'API Erişimi & Dış Entegrasyon',
  boards: 'Akıllı Tahta (Panolar)',
  collaboration: 'Gerçek Zamanlı Eşzamanlı Çalışma',
  folders: 'Klasörleme & Medya Yönetimi',
  communities: 'Topluluklar & Forum',
  payments: 'Ödemeler & Kurs Satışı',
  podcasts: 'Podcastler & Sesli Yayınlar',
  playgrounds: 'Kod Çalışma Alanları',
}

export default function AdminPlansPage() {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ plans: PlanItem[] }>({
    queryKey: ['superadmin', 'plans'],
    queryFn: () => apiFetch(`${getAPIUrl()}ee/superadmin/plans`, accessToken),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  const [selectedPlanId, setSelectedPlanId] = useState<string>('free')
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const rawPlans = Array.isArray(data?.plans) ? data.plans : []
  const plans: PlanItem[] = rawPlans.filter((p: any) => p && typeof p === 'object' && p.id)
  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0]

  React.useEffect(() => {
    if (currentPlan) {
      setEditingPlan({ ...currentPlan, features: { ...(currentPlan.features || {}) } })
    }
  }, [currentPlan?.id])

  if (isLoading) return <PageLoading />

  if (error || !data) {
    return (
      <div className="p-8 text-white">
        <p className="text-red-400">Paketler yüklenemedi.</p>
      </div>
    )
  }

  const handleFeatureToggle = (featureKey: string) => {
    if (!editingPlan) return
    setEditingPlan({
      ...editingPlan,
      features: {
        ...editingPlan.features,
        [featureKey]: !editingPlan.features[featureKey],
      },
    })
  }

  const handleSave = async () => {
    if (!editingPlan) return
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const res = await fetch(`${getAPIUrl()}ee/superadmin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(editingPlan),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setSaveError(errData.detail || 'Paket güncellenemedi')
        return
      }
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'plans'] })
      setTimeout(() => setSaved(false), 2500)
    } catch (_err) {
      setSaveError('Bağlantı hatası oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-white mb-1.5">
          <CreditCard size={24} weight="fill" className="text-purple-400" />
          <h1 className="text-2xl font-bold">Paketler & Lisans Planları</h1>
        </div>
        <p className="text-sm text-white/50">
          Okullara sunulan abonelik paketlerini, içeriklerini, kotalarını ve fiyatlandırmasını yönetin.
        </p>
      </div>

      {/* Plan Seçim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((p) => {
          const isSelected = p.id === (editingPlan?.id || selectedPlanId)
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`p-5 rounded-2xl border text-start transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-purple-500/[0.08] border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-white">{p.name}</span>
                {isSelected && <Check size={18} weight="bold" className="text-purple-400" />}
              </div>
              <p className="text-xs text-white/50 line-clamp-2 mb-4">{p.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {Number(p.price_monthly || 0) === 0 ? 'Ücretsiz' : `₺${Number(p.price_monthly).toLocaleString()}`}
                </span>
                {Number(p.price_monthly || 0) > 0 && <span className="text-xs text-white/40">/ ay</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Seçili Planı Düzenleme Alanı */}
      {editingPlan && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingPlan.name} Paketi Yapılandırması</span>
                <span className="text-[11px] font-mono uppercase bg-white/[0.06] text-white/50 px-2 py-0.5 rounded">
                  {editingPlan.id}
                </span>
              </h2>
              <p className="text-xs text-white/40 mt-0.5">Bu paketin genel bilgileri ve limitlerini düzenleyin</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Paketi Güncelle'}
              </button>
            </div>
          </div>

          {saved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              Paket özellikleri ve limitleri başarıyla kaydedildi.
            </div>
          )}
          {saveError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          {/* Temel Bilgiler & Fiyatlandırma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Paket Başlığı</label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Aylık Ücret (₺)</label>
              <div className="relative">
                <Coins size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  min={0}
                  value={editingPlan.price_monthly}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: Number(e.target.value) })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl ps-9 pe-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/40 block mb-1.5">Paket Tanıtım Açıklaması</label>
              <input
                type="text"
                value={editingPlan.description}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Limitler & Kotalar */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-white/60" />
              Paket Kotaları & Sınırları (0 = Sınırsız)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
                  <BookOpen size={14} />
                  Ders / Kurs Limiti
                </div>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.courses_limit}
                  onChange={(e) => setEditingPlan({ ...editingPlan, courses_limit: Number(e.target.value) })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-[10px] text-white/30 mt-1">0 = Sınırsız ders açılabilir</p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
                  <Users size={14} />
                  Öğrenci & Üye Kotası
                </div>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.members_limit}
                  onChange={(e) => setEditingPlan({ ...editingPlan, members_limit: Number(e.target.value) })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-[10px] text-white/30 mt-1">0 = Sınırsız kayıtlı üye</p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
                  <ShieldStar size={14} />
                  Yönetici / İdare Kotası
                </div>
                <input
                  type="number"
                  min={1}
                  value={editingPlan.admin_limit}
                  onChange={(e) => setEditingPlan({ ...editingPlan, admin_limit: Number(e.target.value) })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-[10px] text-white/30 mt-1">Yönetici hesabı sınırı</p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 text-violet-400 text-xs mb-2">
                  <Robot size={14} weight="fill" />
                  Yapay Zeka Kredisi / Ay
                </div>
                <input
                  type="number"
                  min={0}
                  value={editingPlan.ai_credits}
                  onChange={(e) => setEditingPlan({ ...editingPlan, ai_credits: Number(e.target.value) })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-[10px] text-white/30 mt-1">Dönemlik tanımlanan kredi</p>
              </div>
            </div>
          </div>

          {/* Dahil Olan Modüller & Özellikler */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Bu Pakete Dahil Olan Modüller</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(FEATURE_NAMES).map(([key, label]) => {
                const isEnabled = !!editingPlan.features?.[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleFeatureToggle(key)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-start transition-all ${
                      isEnabled
                        ? 'bg-white/[0.05] border-white/20 text-white'
                        : 'bg-white/[0.01] border-white/[0.05] text-white/40 hover:text-white/60'
                    }`}
                  >
                    <span className="text-xs font-medium">{label}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/[0.04] text-white/30'
                      }`}
                    >
                      {isEnabled ? 'Dahil' : 'Hariç'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
