'use client'
import React, { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAPIUrl } from '@services/config/config'
import { apiFetch } from '@services/utils/ts/requests'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import {
  GearSix,
  Robot,
  Image as ImageIcon,
  Check,
  Eye,
  EyeSlash,
  UploadSimple,
  Sparkle,
  Cpu,
  Lightning,
  GraduationCap,
  Brain,
  Sliders,
  CheckCircle,
} from '@phosphor-icons/react'

const USER_OPENROUTER_KEY = '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'

const AI_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Tüm Modeller - Önerilen)',
    badge: 'Tavsiye Edilen',
    defaultFast: 'google/gemini-2.0-flash-001',
    defaultModel: 'google/gemini-2.0-flash-001',
    proModel: 'anthropic/claude-3.5-sonnet',
    baseUrl: 'https://openrouter.ai/api/v1',
    description: 'Gemini, Claude, GPT-4o ve DeepSeek dahil yüzlerce yapay zeka modeline tek anahtarla erişim.',
  },
  {
    id: 'google',
    name: 'Google Gemini (Resmi API)',
    defaultFast: 'gemini-2.0-flash',
    defaultModel: 'gemini-2.5-flash',
    proModel: 'gemini-2.5-pro',
    baseUrl: '',
    description: 'Doğrudan Google AI Studio API anahtarı ile bağlantı.',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT Resmi API)',
    defaultFast: 'gpt-4o-mini',
    defaultModel: 'gpt-4o-mini',
    proModel: 'gpt-4o',
    baseUrl: '',
    description: 'Doğrudan OpenAI platform anahtarı ile bağlantı.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude Resmi API)',
    defaultFast: 'claude-3-5-haiku-latest',
    defaultModel: 'claude-3-5-sonnet-latest',
    proModel: 'claude-3-7-sonnet-latest',
    baseUrl: '',
    description: 'Doğrudan Anthropic Claude konsol anahtarı ile bağlantı.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (Resmi API)',
    defaultFast: 'deepseek-chat',
    defaultModel: 'deepseek-chat',
    proModel: 'deepseek-reasoner',
    baseUrl: '',
    description: 'DeepSeek resmi platform anahtarı ile bağlantı.',
  },
  {
    id: 'ollama',
    name: 'Ollama (Yerel Sunucu)',
    defaultFast: 'llama3.2',
    defaultModel: 'llama3.2',
    proModel: 'qwen2.5-coder',
    baseUrl: 'http://localhost:11434/v1',
    description: 'Kendi sunucunuzda veya bilgisayarınızda çalışan yerel modeller.',
  },
]

const PROVIDER_MODELS: Record<string, { id: string; label: string; tag?: string }[]> = {
  openrouter: [
    { id: 'google/gemini-2.0-flash-001', label: 'Google Gemini 2.0 Flash (Hızlı & Zeki - En Popüler)', tag: 'Önerilen' },
    { id: 'google/gemini-2.0-flash-lite-001', label: 'Google Gemini 2.0 Flash Lite (Ekonomik & Seri)', tag: 'Hızlı' },
    { id: 'google/gemini-2.0-pro-exp-02-05', label: 'Google Gemini 2.0 Pro (En Yüksek Google Zekası)' },
    { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Mükemmel Türkçe & İçerik Kalitesi)', tag: 'Popüler' },
    { id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet (Gelişmiş Düşünme & Hibrit Muhakeme)', tag: 'Yeni' },
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Yıldırım Hızında Yanıt)' },
    { id: 'openai/gpt-4o', label: 'OpenAI GPT-4o (Amiral Gemisi Model)' },
    { id: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o Mini (Hafif, Dengeli & Hızlı)', tag: 'Ekonomik' },
    { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Yüksek Akıl & Düşük Maliyet)' },
    { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Derin Muhakeme & Matematik)', tag: 'Düşünme' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta Llama 3.3 70B (Açık Kaynak Lideri)' },
    { id: 'mistralai/mistral-large-2411', label: 'Mistral Large 2 (Avrupa Çok Dilli Model)' },
  ],
  google: [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tag: 'Önerilen' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tag: 'Önerilen' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'o3-mini', label: 'o3-mini' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', tag: 'Önerilen' },
    { id: 'claude-3-7-sonnet-latest', label: 'Claude 3.7 Sonnet' },
    { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat (V3)', tag: 'Önerilen' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1)' },
  ],
  ollama: [
    { id: 'llama3.2', label: 'Llama 3.2' },
    { id: 'qwen2.5-coder', label: 'Qwen 2.5 Coder' },
    { id: 'mistral', label: 'Mistral 7B' },
  ],
}

const OPENROUTER_PRESETS = [
  {
    id: 'balanced',
    name: 'Dengeli Eğitim Paketi',
    badge: 'Önerilen',
    desc: 'Hızlı ders & soru üretimi için Gemini 2.0 Flash + karmaşık içerikler için Claude 3.5 Sonnet.',
    fast: 'google/gemini-2.0-flash-001',
    standard: 'google/gemini-2.0-flash-001',
    pro: 'anthropic/claude-3.5-sonnet',
  },
  {
    id: 'speed_budget',
    name: 'Süper Hızlı & Tasarruflu',
    badge: 'Ekonomik',
    desc: 'Minimum API maliyeti, seri yanıtlar: Gemini 2.0 Flash Lite & DeepSeek V3.',
    fast: 'google/gemini-2.0-flash-lite-001',
    standard: 'deepseek/deepseek-chat',
    pro: 'google/gemini-2.0-flash-001',
  },
  {
    id: 'reasoning',
    name: 'Maksimum Muhakeme & Zeka',
    badge: 'Akademik',
    desc: 'Derin düşünme ve zor sorular: GPT-4o Mini + GPT-4o + DeepSeek R1 Akıl Yürütme.',
    fast: 'openai/gpt-4o-mini',
    standard: 'openai/gpt-4o',
    pro: 'deepseek/deepseek-r1',
  },
  {
    id: 'claude_suite',
    name: 'Anthropic Claude Paketi',
    badge: 'Pedagojik',
    desc: 'Türkçe akıcılığı ve öğretmen üslubunda lider Claude modelleri ailesi.',
    fast: 'anthropic/claude-3.5-haiku',
    standard: 'anthropic/claude-3.5-sonnet',
    pro: 'anthropic/claude-3.7-sonnet',
  },
]

export default function AdminSettingsPage() {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI query
  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['superadmin', 'system', 'ai'],
    queryFn: () => apiFetch(`${getAPIUrl()}ee/superadmin/system/ai`, accessToken),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  // Branding query
  const { data: brandingData, isLoading: brandingLoading } = useQuery({
    queryKey: ['superadmin', 'system', 'branding'],
    queryFn: () => apiFetch(`${getAPIUrl()}ee/superadmin/system/branding`, accessToken),
    enabled: !!accessToken,
    staleTime: 60_000,
  })

  const [activeTab, setActiveTab] = useState<'ai' | 'branding'>('ai')

  // AI Form state
  const [aiForm, setAiForm] = useState({
    is_ai_enabled: true,
    is_copilot_enabled: true,
    provider: 'openrouter',
    api_key: USER_OPENROUTER_KEY,
    base_url: 'https://openrouter.ai/api/v1',
    model_fast: 'google/gemini-2.0-flash-001',
    model_standard: 'google/gemini-2.0-flash-001',
    model_pro: 'anthropic/claude-3.5-sonnet',
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)
  const [aiError, setAiError] = useState('')
  const [activePreset, setActivePreset] = useState<string>('balanced')

  // Custom model text toggles
  const [customModelFast, setCustomModelFast] = useState(false)
  const [customModelStandard, setCustomModelStandard] = useState(false)
  const [customModelPro, setCustomModelPro] = useState(false)

  // Branding Form state
  const [brandingForm, setBrandingForm] = useState({
    site_name: '',
    site_logo: '',
    footer_text: '',
    footer_link_text: '',
    footer_link_url: '',
  })
  const [brandingSaving, setBrandingSaving] = useState(false)
  const [brandingSaved, setBrandingSaved] = useState(false)
  const [brandingError, setBrandingError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Populate state on load
  React.useEffect(() => {
    if (aiData) {
      const provider = aiData.provider || 'openrouter'
      const apiKey = aiData.api_key_masked || (provider === 'openrouter' ? USER_OPENROUTER_KEY : '')
      setAiForm({
        is_ai_enabled: aiData.is_ai_enabled ?? true,
        is_copilot_enabled: aiData.is_copilot_enabled ?? true,
        provider,
        api_key: apiKey,
        base_url: aiData.base_url || (provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : ''),
        model_fast: aiData.model_fast || 'google/gemini-2.0-flash-001',
        model_standard: aiData.model_standard || 'google/gemini-2.0-flash-001',
        model_pro: aiData.model_pro || 'anthropic/claude-3.5-sonnet',
      })
    }
  }, [aiData])

  React.useEffect(() => {
    if (brandingData) {
      setBrandingForm({
        site_name: brandingData.site_name || 'Oxonom Edu',
        site_logo: brandingData.site_logo || '/lrn-dash.svg',
        footer_text: brandingData.footer_text || '© 2026 Oxonom Education Technologies. Tüm hakları saklıdır.',
        footer_link_text: brandingData.footer_link_text || 'Oxonom Technologies',
        footer_link_url: brandingData.footer_link_url || 'https://www.oxonom.com',
      })
    }
  }, [brandingData])

  if (aiLoading || brandingLoading) return <PageLoading />

  // Handle AI save
  const handleSaveAi = async () => {
    setAiSaving(true)
    setAiSaved(false)
    setAiError('')
    try {
      const res = await fetch(`${getAPIUrl()}ee/superadmin/system/ai`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(aiForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setAiError(err.detail || 'Yapay zeka ayarları kaydedilemedi')
        return
      }
      setAiSaved(true)
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'system', 'ai'] })
      setTimeout(() => setAiSaved(false), 2500)
    } catch (_err) {
      setAiError('Bağlantı hatası oluştu')
    } finally {
      setAiSaving(false)
    }
  }

  // Handle Branding save
  const handleSaveBranding = async () => {
    setBrandingSaving(true)
    setBrandingSaved(false)
    setBrandingError('')
    try {
      const res = await fetch(`${getAPIUrl()}ee/superadmin/system/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(brandingForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setBrandingError(err.detail || 'Markalama ayarları kaydedilemedi')
        return
      }
      setBrandingSaved(true)
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'system', 'branding'] })
      setTimeout(() => setBrandingSaved(false), 2500)
    } catch (_err) {
      setBrandingError('Bağlantı hatası oluştu')
    } finally {
      setBrandingSaving(false)
    }
  }

  // Handle Logo Upload from device
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setBrandingError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${getAPIUrl()}ee/superadmin/system/branding/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setBrandingError(err.detail || 'Logo yüklenemedi')
        return
      }

      const resData = await res.json()
      setBrandingForm((prev) => ({ ...prev, site_logo: resData.logo_url }))
      setBrandingSaved(true)
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'system', 'branding'] })
      setTimeout(() => setBrandingSaved(false), 2500)
    } catch (_err) {
      setBrandingError('Logo yüklenirken bağlantı hatası oluştu')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 text-white mb-1.5">
          <GearSix size={24} weight="fill" className="text-blue-400" />
          <h1 className="text-2xl font-bold">Sistem & AI Yapılandırması</h1>
        </div>
        <p className="text-sm text-white/50">
          Platform genelinde kullanılan yapay zeka modelleri, API anahtarları, sistem logosu ve platform adını yapılandırın.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] mb-8">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'ai'
              ? 'text-white border-purple-500'
              : 'text-white/40 border-transparent hover:text-white/70'
          }`}
        >
          <Robot size={16} weight={activeTab === 'ai' ? 'fill' : 'regular'} className="text-purple-400" />
          Yapay Zeka (AI) API Ayarları
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'branding'
              ? 'text-white border-blue-500'
              : 'text-white/40 border-transparent hover:text-white/70'
          }`}
        >
          <ImageIcon size={16} weight={activeTab === 'branding' ? 'fill' : 'regular'} className="text-blue-400" />
          Sistem Logosu & İsim Yönetimi
        </button>
      </div>

      {/* 1. Yapay Zeka (AI) Sekmesi */}
      {activeTab === 'ai' && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-purple-400" />
                Yapay Zeka Modelleri & API Sağlayıcı
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Ders oluşturma, öğretmen copilot'u, sesli podcast ve akıllı asistan için kullanılacak motoru belirleyin.
              </p>
            </div>
            {/* AI On/Off Switch */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">{aiForm.is_ai_enabled ? 'Aktif' : 'Pasif'}</span>
              <button
                type="button"
                role="switch"
                aria-checked={aiForm.is_ai_enabled}
                onClick={() => setAiForm({ ...aiForm, is_ai_enabled: !aiForm.is_ai_enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  aiForm.is_ai_enabled ? 'bg-purple-600' : 'bg-white/[0.12]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiForm.is_ai_enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Copilot Görünürlük Kontrolü (Superadmin Toggle) */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Robot size={18} weight="fill" className="text-purple-400" />
                <span className="text-sm font-bold text-white">AI Copilot Asistanı (Arayüzde Göster / Gizle)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aiForm.is_copilot_enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {aiForm.is_copilot_enabled ? 'Arayüzde Görünür' : 'Tamamen Gizli'}
                </span>
              </div>
              <p className="text-xs text-white/60">
                Copilot asistanını tüm sitede (üst menü, yüzen sohbet balonu ve mobil menü) tek tıkla aktif edin veya tamamen gizleyin.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-white/50">{aiForm.is_copilot_enabled ? 'Göster' : 'Gizle'}</span>
              <button
                type="button"
                role="switch"
                aria-checked={aiForm.is_copilot_enabled}
                onClick={() => setAiForm({ ...aiForm, is_copilot_enabled: !aiForm.is_copilot_enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  aiForm.is_copilot_enabled ? 'bg-emerald-600' : 'bg-white/[0.12]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    aiForm.is_copilot_enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>

          {aiSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              Yapay zeka ayarları başarıyla kaydedildi.
            </div>
          )}
          {aiError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {aiError}
            </div>
          )}

          {/* AI Sağlayıcı Seçimi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/50 font-medium">Yapay Zeka Sağlayıcısı</label>
              <span className="text-[11px] text-purple-400 font-medium">Tek Anahtar ile 100+ Model: OpenRouter</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AI_PROVIDERS.map((provider) => {
                const isSelected = aiForm.provider === provider.id
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => {
                      const models = PROVIDER_MODELS[provider.id] || []
                      const firstModel = models[0]?.id || provider.defaultModel
                      const proModel = models.find((m) => m.id.includes('pro') || m.id.includes('sonnet') || m.id.includes('reasoner'))?.id || provider.proModel
                      setAiForm({
                        ...aiForm,
                        provider: provider.id,
                        base_url: provider.baseUrl,
                        api_key: provider.id === 'openrouter' && !aiForm.api_key ? USER_OPENROUTER_KEY : aiForm.api_key,
                        model_fast: provider.defaultFast || firstModel,
                        model_standard: provider.defaultModel || firstModel,
                        model_pro: proModel,
                      })
                      setCustomModelFast(false)
                      setCustomModelStandard(false)
                      setCustomModelPro(false)
                    }}
                    className={`p-3.5 rounded-xl border text-start transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">{provider.name}</span>
                        {isSelected ? (
                          <CheckCircle size={16} weight="fill" className="text-purple-400 shrink-0" />
                        ) : provider.badge ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium shrink-0">
                            {provider.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">{provider.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* API Anahtarı */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/60 font-medium">
                {aiForm.provider === 'openrouter' ? 'OpenRouter API Anahtarı' : 'API Anahtarı (API Key)'}
              </label>
              {aiForm.provider === 'openrouter' && (
                <button
                  type="button"
                  onClick={() => setAiForm({ ...aiForm, api_key: USER_OPENROUTER_KEY })}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium underline underline-offset-2"
                >
                  <Sparkle size={12} weight="fill" />
                  Sistem Anahtarını Uygula
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={aiForm.api_key}
                onChange={(e) => setAiForm({ ...aiForm, api_key: e.target.value })}
                placeholder="sk-or-v1-..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl ps-3.5 pe-10 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showApiKey ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/40">
              <span>Anahtarınız sunucuda güvenle saklanır ve şifrelenir.</span>
              {aiForm.api_key && aiForm.api_key.includes('68ee0deca995') && (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <Check size={12} weight="bold" /> Tanımlı OpenRouter Anahtarı Hazır
                </span>
              )}
            </div>
          </div>

          {/* OpenRouter Hazır Model Paketleri */}
          {aiForm.provider === 'openrouter' && (
            <div className="p-4 rounded-xl bg-purple-500/[0.04] border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Lightning size={14} weight="fill" className="text-purple-400" />
                    Hızlı Hazır Paketler (1-Tıklamayla Kurulum)
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Manuel model yazmanıza gerek yok. İhtiyacınıza uygun paketi seçin, tüm kademeler otomatik ayarlansın.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OPENROUTER_PRESETS.map((preset) => {
                  const isPresetActive =
                    aiForm.model_fast === preset.fast &&
                    aiForm.model_standard === preset.standard &&
                    aiForm.model_pro === preset.pro

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAiForm({
                          ...aiForm,
                          model_fast: preset.fast,
                          model_standard: preset.standard,
                          model_pro: preset.pro,
                        })
                        setActivePreset(preset.id)
                        setCustomModelFast(false)
                        setCustomModelStandard(false)
                        setCustomModelPro(false)
                      }}
                      className={`p-3 rounded-xl border text-start transition-all ${
                        isPresetActive
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {preset.id === 'balanced' && <GraduationCap size={14} className="text-purple-400" />}
                          {preset.id === 'speed_budget' && <Lightning size={14} className="text-amber-400" />}
                          {preset.id === 'reasoning' && <Brain size={14} className="text-cyan-400" />}
                          {preset.id === 'claude_suite' && <Sparkle size={14} className="text-rose-400" />}
                          {preset.name}
                        </span>
                        {isPresetActive ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Check size={10} weight="bold" /> Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-medium">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed mb-2">{preset.desc}</p>
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono text-purple-300/80">
                        <span className="px-1.5 py-0.5 bg-black/40 rounded border border-white/5">
                          Hızlı: {preset.fast.split('/')[1] || preset.fast}
                        </span>
                        <span className="px-1.5 py-0.5 bg-black/40 rounded border border-white/5">
                          Pro: {preset.pro.split('/')[1] || preset.pro}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Model Kademeleri (Açılır Seçim Menüleri) */}
          <div className="border-t border-white/[0.06] pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs text-white/70 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Sliders size={14} className="text-purple-400" />
                  Model Kademeleri & Servis Seçimleri
                </h3>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Aşağıdaki açılır kutulardan istediğiniz yapay zeka modelini kolayca seçebilirsiniz.
                </p>
              </div>
            </div>

            {(() => {
              const currentModels = PROVIDER_MODELS[aiForm.provider] || []

              const renderModelSelector = (
                label: string,
                description: string,
                value: string,
                onChange: (val: string) => void,
                customOpen: boolean,
                setCustomOpen: (val: boolean) => void,
                badge: string
              ) => {
                const isKnownModel = currentModels.some((m) => m.id === value)

                return (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-white">{label}</label>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                            {badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 mt-0.5">{description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomOpen(!customOpen)}
                        className="text-[10px] text-white/40 hover:text-purple-300 transition-colors"
                      >
                        {customOpen ? 'Listeden Seç' : 'Manuel Yaz'}
                      </button>
                    </div>

                    {!customOpen ? (
                      <select
                        value={isKnownModel ? value : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomOpen(true)
                          } else {
                            onChange(e.target.value)
                          }
                        }}
                        className="w-full bg-black/50 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60 font-medium"
                      >
                        {currentModels.map((m) => (
                          <option key={m.id} value={m.id} className="bg-neutral-900 text-white py-1">
                            {m.label} {m.tag ? `[${m.tag}]` : ''}
                          </option>
                        ))}
                        <option value="__custom__" className="bg-neutral-900 text-purple-300 font-semibold">
                          ✍️ Listede Olmayan Özel Model İsmi Gir...
                        </option>
                      </select>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder="Örn: google/gemini-2.0-flash-001"
                          className="w-full bg-black/50 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                        <p className="text-[10px] text-white/30">
                          OpenRouter'daki herhangi bir model ID'sini (örn: provider/model-name) girebilirsiniz.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 truncate">
                      <span className="text-white/20">Seçili ID:</span>
                      <span className="text-purple-300 font-semibold">{value || 'Seçilmedi'}</span>
                    </div>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {renderModelSelector(
                    'Hızlı Model (Fast)',
                    'Özet çıkarma, mini testler, hızlı kontroller için.',
                    aiForm.model_fast,
                    (val) => setAiForm({ ...aiForm, model_fast: val }),
                    customModelFast,
                    setCustomModelFast,
                    'Hafif / Seri'
                  )}
                  {renderModelSelector(
                    'Standart Model (Chat & Copilot)',
                    'Öğretmen asistanı, ders planı ve sohbet motoru.',
                    aiForm.model_standard,
                    (val) => setAiForm({ ...aiForm, model_standard: val }),
                    customModelStandard,
                    setCustomModelStandard,
                    'Ana Motor'
                  )}
                  {renderModelSelector(
                    'Gelişmiş Model (Pro & Muhakeme)',
                    'Zor sınav soruları, RAG ve derin pedagojik analiz.',
                    aiForm.model_pro,
                    (val) => setAiForm({ ...aiForm, model_pro: val }),
                    customModelPro,
                    setCustomModelPro,
                    'Üst Düzey'
                  )}
                </div>
              )
            })()}
          </div>

          {/* Özel Base URL (Opsiyonel / Ollama için) */}
          <div className="border-t border-white/[0.06] pt-4">
            <label className="text-xs text-white/50 block mb-1 font-medium">
              API Uç Noktası (Base URL)
            </label>
            <input
              type="text"
              value={aiForm.base_url}
              onChange={(e) => setAiForm({ ...aiForm, base_url: e.target.value })}
              placeholder={aiForm.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'Varsayılan API Uç Noktası'}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 font-mono"
            />
            <p className="text-[11px] text-white/30 mt-1">
              OpenRouter için varsayılan olarak <code className="text-purple-300">https://openrouter.ai/api/v1</code> kullanılır.
            </p>
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2">
            <button
              onClick={handleSaveAi}
              disabled={aiSaving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              {aiSaving ? 'Kaydediliyor...' : 'Yapay Zeka Ayarlarını Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Sistem Logosu & İsim Yönetimi Sekmesi */}
      {activeTab === 'branding' && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon size={18} weight="fill" className="text-blue-400" />
              Sistem Logosu & Platform Başlığı
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Süper admin üst menüsü, giriş ekranları ve platform genelinde görüntülenecek marka kimliği.
            </p>
          </div>

          {brandingSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              Sistem görünüm ayarları başarıyla güncellendi.
            </div>
          )}
          {brandingError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {brandingError}
            </div>
          )}

          {/* Platform Adı */}
          <div>
            <label className="text-xs text-white/40 block mb-1.5 font-medium">Sistem / Platform Adı</label>
            <input
              type="text"
              value={brandingForm.site_name}
              onChange={(e) => setBrandingForm({ ...brandingForm, site_name: e.target.value })}
              placeholder="Oxonom Edu"
              className="w-full max-w-md bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Logo Yükleme & Önerilen Ölçüler */}
          <div className="space-y-4">
            <label className="text-xs text-white/40 block font-medium">Platform Logosu</label>

            {/* Ölçü Rehberi Kutusu */}
            <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 space-y-2">
              <p className="text-xs font-semibold text-blue-300">Önerilen Logo Ölçüleri & Formatları</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/70">
                <div className="bg-white/[0.03] p-2 rounded-lg">
                  <span className="text-blue-400 font-bold block">Geniş Yatay Logo</span>
                  240 × 60 px (Şeffaf PNG / SVG)
                </div>
                <div className="bg-white/[0.03] p-2 rounded-lg">
                  <span className="text-blue-400 font-bold block">Kare Simge / İkon</span>
                  128 × 128 px (PNG / WebP)
                </div>
                <div className="bg-white/[0.03] p-2 rounded-lg">
                  <span className="text-blue-400 font-bold block">Tarayıcı Simgesi (Favicon)</span>
                  32 × 32 px (ICO / PNG)
                </div>
              </div>
            </div>

            {/* Mevcut Logo Önizleme & Cihazdan Yükleme */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              {/* Canlı Önizleme */}
              <div className="h-20 w-44 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-3 relative overflow-hidden">
                {brandingForm.site_logo ? (
                  <img
                    src={brandingForm.site_logo}
                    alt="Sistem Logosu"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-white/30">Logo Yok</span>
                )}
              </div>

              {/* Yükleme Butonu */}
              <div className="space-y-2 text-center sm:text-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <UploadSimple size={16} weight="bold" />
                  {uploadingLogo ? 'Yükleniyor...' : 'Cihazdan Yeni Logo Seç'}
                </button>
                <p className="text-[11px] text-white/30">PNG, SVG, WebP veya JPG (Maks. 5 MB)</p>
              </div>
            </div>
          </div>

          {/* Platform Sabit Footer & İmza Yönetimi */}
          <div className="space-y-4 border-t border-white/[0.08] pt-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-white block">
                Platform Sabit Footer & Telif İmzası
              </label>
              <p className="text-xs text-white/40">
                Tüm sayfalarda en altta gösterilecek telif metnini ve yönlendirilecek harici bağlantıyı buradan yönetebilirsiniz.
              </p>
            </div>

            <div className="space-y-3 max-w-xl">
              <div>
                <label className="text-xs text-white/50 block mb-1 font-medium">
                  Alt Bilgi (Footer) Telif & İmza Metni
                </label>
                <input
                  type="text"
                  value={brandingForm.footer_text}
                  onChange={(e) => setBrandingForm({ ...brandingForm, footer_text: e.target.value })}
                  placeholder="© 2026 Oxonom Education Technologies. Tüm hakları saklıdır."
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1 font-medium">
                    Bağlantı Metni
                  </label>
                  <input
                    type="text"
                    value={brandingForm.footer_link_text}
                    onChange={(e) => setBrandingForm({ ...brandingForm, footer_link_text: e.target.value })}
                    placeholder="Oxonom Technologies"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1 font-medium">
                    Bağlantı URL'i
                  </label>
                  <input
                    type="url"
                    value={brandingForm.footer_link_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, footer_link_url: e.target.value })}
                    placeholder="https://www.oxonom.com"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2">
            <button
              onClick={handleSaveBranding}
              disabled={brandingSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {brandingSaving ? 'Kaydediliyor...' : 'Görünüm Ayarlarını Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
