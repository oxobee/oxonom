'use client'
import React, { useState } from 'react'
import { GraduationCap, Sparkles, Plus } from 'lucide-react'
import { createUserGroup } from '@services/usergroups/usergroups'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newClass: any) => void
}

const GRADE_LEVELS = [
  'İlkokul (1-4)',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf (LGS)',
  '9. Sınıf',
  '10. Sınıf',
  '11. Sınıf',
  '12. Sınıf (YKS)',
  'Üniversite / Hazırlık',
  'Genel / Kulüp',
]

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[4])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const session = useLHSession() as any
  const org = useOrg() as any
  const token = session?.data?.tokens?.access_token
  const queryClient = useQueryClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Lütfen sınıf adını giriniz.')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Sınıf oluşturuluyor...')
    try {
      const res = await createUserGroup(
        {
          name: name.trim(),
          grade_level: gradeLevel,
          description: description.trim() || `${gradeLevel} Şubesi`,
          org_id: org.id,
        },
        token
      )

      if (res.status === 200 || res.status === 201) {
        toast.success(`'${name}' sınıfı oluşturuldu!`, { id: toastId, icon: '🎓' })
        queryClient.invalidateQueries({ queryKey: queryKeys.usergroups.list(org.id) })
        setName('')
        setDescription('')
        onClose()
        if (onSuccess) onSuccess(res.data)
      } else {
        toast.error(res.data?.detail || 'Sınıf oluşturulamadı.', { id: toastId })
      }
    } catch (err: any) {
      toast.error('Bağlantı hatası oluştu. Lütfen tekrar deneyin.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <DialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <GraduationCap size={24} />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Yeni Sınıf / Şube Aç
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            Öğrencilerin 6 haneli kodla katılabileceği yeni bir okul sınıfı veya çalışma grubu oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Sınıf / Şube Adı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 8-B Matematik veya 10-Fen A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Sınıf Düzeyi
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full text-sm py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all text-gray-800"
            >
              {GRADE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              rows={2}
              placeholder="Sınıf hakkında kısa bilgi, ders saati veya öğretmen notu..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Sınıf oluşturulduğunda sistem otomatik olarak <strong>benzersiz 6 haneli bir katılım kodu</strong> (örn: <code>OX-8492</code>) üretecek ve tahtada paylaşmanız için hazır hale getirecektir.
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
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>{loading ? 'Oluşturuluyor...' : 'Sınıfı Oluştur'}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
