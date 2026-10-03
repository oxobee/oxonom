'use client'
import React, { useState, useRef, useEffect } from 'react'
import { KeyRound, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
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
  // 6 characters: 2 prefix (e.g. "OX"), fixed hyphen "-", 4 suffix (e.g. "8492")
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const session = useLHSession() as any
  const org = useOrg() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  // Reset digits and auto-focus first box when opened
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  const fullCode = `${digits[0]}${digits[1]}-${digits[2]}${digits[3]}${digits[4]}${digits[5]}`.trim()
  const isComplete = digits.every((d) => d.trim().length === 1)

  const handleCharChange = (index: number, val: string) => {
    // Only accept alphanumeric characters (A-Z, 0-9)
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)

    // Auto-advance to next box if character was entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump back and clear previous box
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
        e.preventDefault()
      } else if (digits[index]) {
        // Clear current box
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
        e.preventDefault()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text') || ''
    const clean = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    if (!clean) return

    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = clean[i] || ''
    }
    setDigits(newDigits)

    // Focus last filled box or next empty
    const nextIdx = Math.min(clean.length, 5)
    inputRefs.current[nextIdx]?.focus()
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) {
      toast.error('Lütfen 6 haneli sınıf katılım kodunun tamamını giriniz.')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Sınıfa katılınıyor...')
    try {
      const res = await joinClassByCode(fullCode, org?.id || null, token)
      if (res.status === 200 || res.status === 201) {
        const data = res.data
        if (data.status === 'already_joined') {
          toast.success(data.message, { id: toastId })
        } else {
          toast.success(data.message || 'Sınıfa başarıyla katıldınız!', { id: toastId, icon: '🎉' })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.usergroups.list(org?.id) })
        queryClient.invalidateQueries({ queryKey: ['my-classes', org?.id] })
        setDigits(['', '', '', '', '', ''])
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

  const fillSampleCode = (sample: string) => {
    const clean = sample.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    const newDigits = clean.split('')
    while (newDigits.length < 6) newDigits.push('')
    setDigits(newDigits)
    inputRefs.current[5]?.focus()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 overflow-hidden">
        <DialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20">
            <KeyRound size={24} />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
            Sınıfa Katıl
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 leading-relaxed">
            Öğretmeninizin tahtada paylaştığı 6 karakterli sınıf katılım kodunu girerek sınıfınıza ve ders tahtalarınıza hemen bağlanın.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoin} className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Sınıf Katılım Kodu
              </label>
              <button
                type="button"
                onClick={() => fillSampleCode('OX8492')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={11} />
                <span>Örnek Kod (OX-8492)</span>
              </button>
            </div>

            {/* Segmented Animated Inputs with Fixed Hyphen Divider */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {/* Box 0 & Box 1: Prefix */}
              {[0, 1].map((idx) => {
                const hasValue = Boolean(digits[idx])
                return (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleCharChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all duration-200 outline-none transform active:scale-95 focus:scale-105 ${
                      hasValue
                        ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm ring-2 ring-indigo-500/10'
                        : 'border-gray-200 bg-gray-50/80 text-gray-900 hover:border-gray-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20'
                    }`}
                    placeholder="•"
                  />
                )
              })}

              {/* Fixed, styled Hyphen Divider */}
              <div className="flex items-center justify-center px-1">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400 select-none pb-0.5">
                  -
                </span>
              </div>

              {/* Box 2, 3, 4, 5: Suffix */}
              {[2, 3, 4, 5].map((idx) => {
                const hasValue = Boolean(digits[idx])
                return (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleCharChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all duration-200 outline-none transform active:scale-95 focus:scale-105 ${
                      hasValue
                        ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm ring-2 ring-indigo-500/10'
                        : 'border-gray-200 bg-gray-50/80 text-gray-900 hover:border-gray-300 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20'
                    }`}
                    placeholder="•"
                  />
                )
              })}
            </div>

            <p className="text-[11px] text-gray-500 mt-2.5 text-center">
              Kodlar büyük/küçük harfe duyarsızdır. Tire işareti (<span className="font-bold text-gray-700">-</span>) sabittir.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || !isComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer"
            >
              <span>{loading ? 'Katılınıyor...' : 'Sınıfa Katıl'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
