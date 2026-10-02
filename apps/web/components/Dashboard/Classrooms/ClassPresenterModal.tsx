'use client'
import React, { useState } from 'react'
import { Copy, Check, RotateCw, Monitor, Sparkles } from 'lucide-react'
import { regenerateClassJoinCode } from '@services/usergroups/usergroups'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog'

interface ClassPresenterModalProps {
  isOpen: boolean
  onClose: () => void
  classroom: any
  onCodeUpdated?: (newCode: string) => void
}

export default function ClassPresenterModal({
  isOpen,
  onClose,
  classroom,
  onCodeUpdated,
}: ClassPresenterModalProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentCode, setCurrentCode] = useState(classroom?.join_code || '')
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (classroom?.join_code) {
      setCurrentCode(classroom.join_code)
    }
  }, [classroom?.join_code])

  const copyCode = () => {
    if (!currentCode) return
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    toast.success('Katılım kodu kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!confirm('Sınıf katılım kodunu yenilemek istediğinize emin misiniz? Eski kod artık çalışmayacaktır.')) {
      return
    }

    setLoading(true)
    const toastId = toast.loading('Yeni kod üretiliyor...')
    try {
      const res = await regenerateClassJoinCode(classroom.id, token)
      if (res.status === 200 || res.status === 201) {
        const newCode = res.data?.join_code
        setCurrentCode(newCode)
        toast.success(`Yeni kod üretildi: ${newCode}`, { id: toastId })
        queryClient.invalidateQueries({ queryKey: queryKeys.usergroups.list(classroom.org_id) })
        if (onCodeUpdated) onCodeUpdated(newCode)
      } else {
        toast.error('Kod yenilenemedi.', { id: toastId })
      }
    } catch (err) {
      toast.error('Bağlantı hatası.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (!classroom) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 text-center">
        <DialogHeader className="items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md mb-2">
            <Monitor size={14} />
            <span>Akıllı Tahta / Projektör Modu</span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {classroom.name}
          </DialogTitle>
          {classroom.grade_level && (
            <p className="text-sm font-medium text-indigo-300 mt-1">
              {classroom.grade_level}
            </p>
          )}
        </DialogHeader>

        {/* Big Code Blackboard Card */}
        <div className="my-8 py-8 px-6 bg-black/40 border-2 border-dashed border-indigo-400/40 rounded-3xl backdrop-blur-sm relative group">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
            Sınıf Katılım Kodu
          </p>
          <div className="text-5xl sm:text-7xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 select-all py-2">
            {currentCode || 'KOD YOK'}
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Kodu Yenile</span>
            </button>
          </div>
        </div>

        {/* Instructions for Students */}
        <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            Öğrenciler İçin Katılım Adımları
          </h4>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Öğrenci hesabınızla <strong>Oxonom Edu</strong> platformuna giriş yapın.</li>
            <li>Sol menüdeki veya ana sayfadaki <strong>&quot;Sınıfa Katıl&quot;</strong> butonuna tıklayın.</li>
            <li>Tahtada görünen <span className="font-mono font-bold text-amber-300 px-1 py-0.5 bg-white/10 rounded">{currentCode}</span> kodunu girip onaylayın.</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Kapat
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
