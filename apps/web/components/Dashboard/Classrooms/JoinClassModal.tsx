'use client'
import React, { useState } from 'react'
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react'
import { joinClassByCode } from '@services/usergroups/usergroups'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'

interface JoinClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (usergroup: any) => void
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const session = useLHSession() as any
  const org = useOrg() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      toast.error('Lütfen 6 haneli sınıf katılım kodunu giriniz.')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Sınıfa katılınıyor...')
    try {
      const res = await joinClassByCode(cleanCode, org?.id || null, token)
      if (res.status === 200 || res.status === 201) {
        const data = res.data
        if (data.status === 'already_joined') {
          toast.success(data.message, { id: toastId })
        } else {
          toast.success(data.message || 'Sınıfa başarıyla katıldınız!', { id: toastId, icon: '🎉' })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.usergroups.list(org?.id) })
        queryClient.invalidateQueries({ queryKey: ['my-classes', org?.id] })
        setCode('')
        onClose()
        if (onSuccess) onSuccess(data.usergroup)
      } else {
        toast.error(res.data?.detail || 'Geçersiz katılım kodu. Lütfen kodu kontrol edin.', { id: toastId })
      }
    } catch (err: any) {
      toast.error('Bağlantı hatası oluştu. Lütfen tekrar deneyin.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <DialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <KeyRound size={24} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Sınıfa Katıl
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            Öğretmeninizin tahtada paylaştığı veya sizinle paylaştığı 6 haneli sınıf katılım kodunu giriniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoin} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Katılım Kodu
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                maxLength={10}
                placeholder="Örn: OX-8492"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest text-2xl font-mono font-bold py-3 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-base"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              Kodlar büyük/küçük harfe duyarsızdır (Örn: <code className="bg-gray-100 px-1 py-0.5 rounded">OX-1001</code>)
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl transition-colors shadow-sm"
            >
              <span>{loading ? 'Katılınıyor...' : 'Sınıfa Katıl'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
