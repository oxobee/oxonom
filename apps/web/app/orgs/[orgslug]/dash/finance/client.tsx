'use client'
import React, { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Receipt,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  Trash,
  Lightning,
  Drop,
  WifiHigh,
  BookBookmark,
  Wrench,
  TrendDown,
  TrendUp,
  FileText,
} from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { searchMatchesAny } from '@/lib/search/normalize'

interface ExpenseRecord {
  id: number
  title: string
  category: 'Faturalar' | 'Kırtasiye' | 'Bakım & Onarım' | 'Bilişim & Donanım' | 'Etkinlik & Spor' | 'Diğer'
  invoiceNo: string
  amount: number
  date: string
  status: 'paid' | 'pending'
  notes: string
}

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 1,
    title: 'Eylül Ayı Elektrik Faturası',
    category: 'Faturalar',
    invoiceNo: 'ELK-2026-091',
    amount: 6850,
    date: '28.09.2026',
    status: 'paid',
    notes: 'Okul ana bina ve laboratuvarlar elektrik tüketimi.',
  },
  {
    id: 2,
    title: 'Fiber İnternet & Ağ Altyapısı',
    category: 'Faturalar',
    invoiceNo: 'TT-2026-9812',
    amount: 2400,
    date: '25.09.2026',
    status: 'paid',
    notes: 'Tüm sınıflar ve akıllı tahta gigabit internet aboneliği.',
  },
  {
    id: 3,
    title: 'Dönem Başı Sınav Kağıtları & Kırtasiye Alımı',
    category: 'Kırtasiye',
    invoiceNo: 'KRT-4412',
    amount: 8650,
    date: '20.09.2026',
    status: 'paid',
    notes: 'A4 fotokopi kağıtları, sınav optik formları ve tahta kalemleri.',
  },
  {
    id: 4,
    title: 'Fen Laboratuvarı Deney Tüpleri ve Mikroskop Bakımı',
    category: 'Bakım & Onarım',
    invoiceNo: 'LAB-1029',
    amount: 4500,
    date: '18.09.2026',
    status: 'paid',
    notes: 'Laboratuvar optik ekipmanları periyodik kalibrasyonu.',
  },
  {
    id: 5,
    title: 'Akıllı Tahta Projeksiyon Lambaları Değişimi',
    category: 'Bilişim & Donanım',
    invoiceNo: 'BLG-7731',
    amount: 11200,
    date: '15.09.2026',
    status: 'pending',
    notes: '9 ve 10. sınıf şubeleri projeksiyon üniteleri.',
  },
  {
    id: 6,
    title: 'Okul Su ve Arıtma Filtre Değişimi',
    category: 'Faturalar',
    invoiceNo: 'SU-2026-302',
    amount: 1850,
    date: '12.09.2026',
    status: 'paid',
    notes: 'Sebiller ve mutfak filtre sistemi bakımı.',
  },
]

export default function FinanceClient({ orgslug }: { orgslug: string }) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ExpenseRecord['category']>('Faturalar')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<'paid' | 'pending'>('paid')
  const [notes, setNotes] = useState('')

  // Totals
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0)
  }, [expenses])

  const totalPaid = useMemo(() => {
    return expenses.filter((e) => e.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
  }, [expenses])

  const totalPending = useMemo(() => {
    return expenses.filter((e) => e.status === 'pending').reduce((sum, item) => sum + item.amount, 0)
  }, [expenses])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        !search.trim() ||
        searchMatchesAny([e.title, e.invoiceNo, e.category, e.notes], search)
      const matchesCategory =
        selectedCategory === 'all' || e.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [expenses, search, selectedCategory])

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) {
      toast.error('Lütfen gider başlığı ve tutarı giriniz.')
      return
    }

    const newExpense: ExpenseRecord = {
      id: Date.now(),
      title: title.trim(),
      category,
      invoiceNo: invoiceNo.trim() || `FTR-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: parseFloat(amount) || 0,
      date: date || new Date().toLocaleDateString('tr-TR'),
      status,
      notes: notes.trim() || 'Açıklama belirtilmedi.',
    }

    setExpenses((prev) => [newExpense, ...prev])
    toast.success('Gider kaydı başarıyla eklendi.')
    setIsAddOpen(false)
    setTitle('')
    setInvoiceNo('')
    setAmount('')
    setDate('')
    setNotes('')
  }

  const handleDeleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    toast.success('Gider kaydı silindi.')
  }

  const handleToggleStatus = (id: number) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === 'paid' ? 'pending' : 'paid' } : e
      )
    )
  }

  return (
    <div className="h-full w-full bg-[#f8f8f8]">
      <div className="px-4 sm:px-10 pt-8 pb-16 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt size={22} weight="duotone" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Finans, Masraflar & Faturalar</h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Okul genel giderlerini, elektrik/su/internet faturalarını ve kırtasiye harcamalarını takip edin.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus size={16} weight="bold" />
            <span>Yeni Gider / Masraf Ekle</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toplam Gider (Bu Dönem)</span>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              ₺{totalExpense.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{expenses.length} adet harcama kalemi</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ödenen Faturalar</span>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              ₺{totalPaid.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-emerald-700/70 mt-1 flex items-center gap-1">
              <CheckCircle size={13} weight="fill" /> Ödemesi tamamlandı
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 nice-shadow">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bekleyen / Yaklaşan Ödemeler</span>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              ₺{totalPending.toLocaleString('tr-TR')}
            </div>
            <div className="text-xs text-amber-700/70 mt-1 flex items-center gap-1">
              <Clock size={13} weight="fill" /> Vadesi yaklaşan kalemler
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', 'Faturalar', 'Kırtasiye', 'Bakım & Onarım', 'Bilişim & Donanım'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'Tüm Harcamalar' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <MagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Fatura no, harcama başlığı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs ps-9 pe-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Expense Table */}
        <div className="bg-white rounded-2xl border border-gray-100 nice-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Harcama / Fatura</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Belge No</th>
                  <th className="px-5 py-3.5">Tarih</th>
                  <th className="px-5 py-3.5">Tutar</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5 text-end">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      Harcama kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">{item.notes}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-gray-500">
                        {item.invoiceNo}
                      </td>

                      <td className="px-5 py-3.5 text-gray-500">
                        {item.date}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        ₺{item.amount.toLocaleString('tr-TR')}
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            item.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {item.status === 'paid' ? (
                            <>
                              <CheckCircle size={12} weight="fill" />
                              <span>Ödendi</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} weight="fill" />
                              <span>Bekliyor</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-end">
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          title="Harcamayı Sil"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Yeni Gider Ekle */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt size={20} className="text-amber-600" />
              <span>Yeni Gider / Masraf Ekle</span>
            </DialogTitle>
            <DialogDescription>
              Fatura veya operasyonel harcama detaylarını giriniz.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Gider Başlığı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Ekim Ayı Doğalgaz Faturası"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Kategori *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Faturalar">Faturalar</option>
                  <option value="Kırtasiye">Kırtasiye</option>
                  <option value="Bakım & Onarım">Bakım & Onarım</option>
                  <option value="Bilişim & Donanım">Bilişim & Donanım</option>
                  <option value="Etkinlik & Spor">Etkinlik & Spor</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tutar (₺) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="Örn: 4500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Fatura / Belge No</label>
                <input
                  type="text"
                  placeholder="FTR-2026-001"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Ödeme Durumu</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="paid">Ödendi</option>
                  <option value="pending">Ödeme Bekliyor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Açıklama / Not</label>
              <textarea
                rows={2}
                placeholder="Ek ayrıntılar veya harcama gerekçesi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"
              >
                Kaydet
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
