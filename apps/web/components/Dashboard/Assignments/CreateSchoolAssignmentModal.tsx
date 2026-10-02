'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog'
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  File,
  GraduationCap,
  HelpCircle,
  Layers,
  Loader2,
  Mic,
  PenTool,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createSchoolAssignment } from '@services/school_assignments/school_assignments'

interface CreateSchoolAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orgId: number
  accessToken: string
  classrooms: any[]
  boards: any[]
  defaultClassroomId?: number
}

const GRADE_CATEGORIES = [
  { id: 'İlkokul (1-4)', label: 'İlkokul (1-4. Sınıf)', grades: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'] },
  { id: 'Ortaokul (5-8)', label: 'Ortaokul (5-8. Sınıf)', grades: ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'] },
  { id: 'Lise (9-12)', label: 'Lise (9-12. Sınıf)', grades: ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'] },
]

const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  'İlkokul (1-4)': ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Görsel Sanatlar', 'Müzik'],
  'Ortaokul (5-8)': ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü', 'Bilişim Teknolojileri', 'Görsel Sanatlar'],
  'Lise (9-12)': ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'İngilizce', 'Felsefe', 'Bilişim / Kodlama'],
}

const TOOL_TYPES = [
  {
    id: 'WHITEBOARD',
    title: 'İnteraktif Akıllı Tahta',
    desc: 'Öğrenci tahta üzerinde çizim yaparak, formül yazarak problemi interaktif çözer.',
    icon: PenTool,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'WORKSHEET',
    title: 'Çalışma Kağıdı & Dosya',
    desc: 'Yönergeli soru çözümü, zengin metin cevabı ve fotoğraf/PDF teslimi.',
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'QUIZ',
    title: 'İnteraktif Test / Alıştırma',
    desc: 'Çoktan seçmeli sorular ve test, öğrenci anında işaretleyip çözer.',
    icon: HelpCircle,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'READING',
    title: 'Okuma & Sesli Özet',
    desc: 'Kitap/metin okuma parçası, ana fikir analizi veya sesli kayıt görevi.',
    icon: BookOpen,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
]

export default function CreateSchoolAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  orgId,
  accessToken,
  classrooms,
  boards,
  defaultClassroomId,
}: CreateSchoolAssignmentModalProps) {
  const [gradeCategory, setGradeCategory] = useState<string>('Lise (9-12)')
  const [gradeLevel, setGradeLevel] = useState<string>('10. Sınıf')
  const [subject, setSubject] = useState<string>('Matematik')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [selectedUsergroups, setSelectedUsergroups] = useState<number[]>(
    defaultClassroomId ? [defaultClassroomId] : []
  )

  React.useEffect(() => {
    if (defaultClassroomId && isOpen) {
      setSelectedUsergroups([defaultClassroomId])
    }
  }, [defaultClassroomId, isOpen])
  const [toolType, setToolType] = useState<string>('WHITEBOARD')
  const [dueDate, setDueDate] = useState<string>('')
  const [maxScore, setMaxScore] = useState<number>(100)

  // Whiteboard specific state
  const [boardOption, setBoardOption] = useState<'create_new' | 'existing'>('create_new')
  const [selectedBoardUuid, setSelectedBoardUuid] = useState<string>('')
  const [newBoardName, setNewBoardName] = useState<string>('')

  // Quiz questions state
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{ id: number; question: string; options: string[]; correct_answer: string; points: number }>
  >([
    {
      id: 1,
      question: 'Soru 1: ',
      options: ['A) Seçenek 1', 'B) Seçenek 2', 'C) Seçenek 3', 'D) Seçenek 4'],
      correct_answer: 'A) Seçenek 1',
      points: 25,
    },
  ])

  // Worksheet specific state
  const [worksheetFile, setWorksheetFile] = useState<{
    file_name: string
    file_size: number
    file_type: string
    file_url: string
  } | null>(null)
  const worksheetInputRef = React.useRef<HTMLInputElement | null>(null)

  // Reading specific state
  const [readingText, setReadingText] = useState<string>('')
  const [readingInstructions, setReadingInstructions] = useState<string>(
    'Metni akıcı ve noktalama işaretlerine dikkat ederek sesli okuyup ses kaydınızı stüdyodan kaydedip gönderiniz.'
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWorksheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 30 * 1024 * 1024) {
      toast.error('Dosya boyutu 30 MB üzerinde olamaz.')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setWorksheetFile({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        file_url: reader.result as string,
      })
      toast.success(`${file.name} başarıyla yüklendi!`)
    }
  }

  const availableGrades = GRADE_CATEGORIES.find((c) => c.id === gradeCategory)?.grades || []
  const availableSubjects = SUBJECTS_BY_CATEGORY[gradeCategory] || []

  const handleCategoryChange = (newCat: string) => {
    setGradeCategory(newCat)
    const grades = GRADE_CATEGORIES.find((c) => c.id === newCat)?.grades || []
    if (grades.length > 0) setGradeLevel(grades[0])
    const subs = SUBJECTS_BY_CATEGORY[newCat] || []
    if (subs.length > 0) setSubject(subs[0])
  }

  const handleSelectAllClasses = () => {
    setSelectedUsergroups(classrooms.map((c) => c.id))
  }

  const handleClearClasses = () => {
    setSelectedUsergroups([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Lütfen ödev başlığı giriniz.')
      return
    }
    if (selectedUsergroups.length === 0) {
      toast.error('Lütfen ödevin verileceği en az bir sınıf seçiniz.')
      return
    }

    setIsSubmitting(true)
    try {
      let toolData: Record<string, any> = {}
      if (toolType === 'QUIZ') {
        toolData = { questions: quizQuestions }
      } else if (toolType === 'WORKSHEET') {
        toolData = {
          file_name: worksheetFile?.file_name || null,
          file_size: worksheetFile?.file_size || null,
          file_type: worksheetFile?.file_type || null,
          file_url: worksheetFile?.file_url || null,
        }
      } else if (toolType === 'READING') {
        toolData = {
          text_to_read: readingText,
          instructions: readingInstructions,
        }
      }

      await createSchoolAssignment(
        orgId,
        {
          title,
          description,
          grade_level: gradeLevel,
          grade_category: gradeCategory,
          subject,
          tool_type: toolType,
          tool_data: toolData,
          board_uuid: boardOption === 'existing' ? selectedBoardUuid : undefined,
          create_new_board: toolType === 'WHITEBOARD' && boardOption === 'create_new',
          new_board_name: newBoardName || `${title} — Ödev Tahtası`,
          usergroup_ids: selectedUsergroups,
          due_date: dueDate || undefined,
          max_score: maxScore,
          published: true,
        },
        accessToken
      )

      toast.success('Ödev başarıyla oluşturuldu ve sınıflara atandı!')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error('Ödev oluşturulurken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-100">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Sınıfa Yeni Ödev Ver
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                1. sınıftan 12. sınıfa kadar kademe, sınıf ve interaktif araç bazında ödev tanımlayın.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-xs">
          {/* 1. KADEME VE SEVİYE SEÇİMİ */}
          <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-3">
            <label className="block font-bold text-gray-800 uppercase tracking-wider text-[11px]">
              1. Okul Kademesi & Sınıf Düzeyi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer text-center ${
                    gradeCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Sınıf Seviyesi</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Ders / Branş</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. HEDEF SINIFLAR (ÇOKLU SEÇİM) */}
          <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                2. Ödevin Verileceği Şubeler *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Tümünü Seç
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleClearClasses}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Temizle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {classrooms.map((c) => {
                const isChecked = selectedUsergroups.includes(c.id)
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedUsergroups(selectedUsergroups.filter((id) => id !== c.id))
                        } else {
                          setSelectedUsergroups([...selectedUsergroups, c.id])
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                    />
                    <span className="flex-1 truncate">{c.name}</span>
                    {c.invitation_code && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                        {c.invitation_code}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* 3. ÖDEV BAŞLIĞI VE AÇIKLAMA */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Ödev Başlığı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Parabol Grafikleri & Tepe Noktası Alıştırmaları"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Ödev Yönergeleri & Açıklama (Öğrencinin yapması gereken adımlar)
              </label>
              <textarea
                rows={3}
                placeholder="Örn: Tahtada verilen fonksiyonların tepe noktasını bularak grafikleri çiziniz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 4. ÖDEV ARACI / STİLİ */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-800 uppercase tracking-wider text-[11px]">
              3. Ödev Stili & İnteraktif Araç
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TOOL_TYPES.map((tool) => {
                const isSelected = toolType === tool.id
                const Icon = tool.icon
                return (
                  <div
                    key={tool.id}
                    onClick={() => setToolType(tool.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border ${tool.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">{tool.title}</span>
                        {isSelected && <Check size={14} className="text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tool.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* WHITEBOARD CONFIGURATION */}
            {toolType === 'WHITEBOARD' && (
              <div className="mt-3 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <label className="block font-bold text-indigo-950 text-xs">
                  🎨 Akıllı Tahta Yapılandırması
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="boardOption"
                      checked={boardOption === 'create_new'}
                      onChange={() => setBoardOption('create_new')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-gray-800">
                      Bu ödeve özel yeni bir Ödev Tahtası oluştur (Öğrenciler doğrudan bu tahtada çözer)
                    </span>
                  </label>
                  {boardOption === 'create_new' && (
                    <input
                      type="text"
                      placeholder="Ödev Tahtası İsmi (Örn: Parabol Çizim Tahtası)"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="boardOption"
                      checked={boardOption === 'existing'}
                      onChange={() => setBoardOption('existing')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-gray-800">
                      Mevcut sınıf akıllı tahtalarından birini bağla
                    </span>
                  </label>
                  {boardOption === 'existing' && (
                    <select
                      value={selectedBoardUuid}
                      onChange={(e) => setSelectedBoardUuid(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="">Tahta seçiniz...</option>
                      {boards.map((b) => (
                        <option key={b.board_uuid} value={b.board_uuid}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* QUIZ CONFIGURATION */}
            {toolType === 'QUIZ' && (
              <div className="mt-3 p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 text-xs">
                    🧪 Test Soruları ({quizQuestions.length} Soru)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextId = quizQuestions.length + 1
                      setQuizQuestions([
                        ...quizQuestions,
                        {
                          id: nextId,
                          question: `Soru ${nextId}: `,
                          options: ['A) ', 'B) ', 'C) ', 'D) '],
                          correct_answer: 'A) ',
                          points: 25,
                        },
                      ])
                    }}
                    className="text-amber-700 hover:text-amber-900 font-bold inline-flex items-center gap-1"
                  >
                    <Plus size={13} /> Soru Ekle
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={q.id} className="p-3 bg-white border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 text-[11px]">Soru {qIndex + 1}</span>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuizQuestions(quizQuestions.filter((_, idx) => idx !== qIndex))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Soru metnini yazınız..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...quizQuestions]
                          updated[qIndex].question = e.target.value
                          setQuizQuestions(updated)
                        }}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, optIndex) => (
                          <input
                            key={optIndex}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...quizQuestions]
                              updated[qIndex].options[optIndex] = e.target.value
                              setQuizQuestions(updated)
                            }}
                            className="px-2 py-1 border border-gray-200 rounded text-[11px]"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WORKSHEET CONFIGURATION */}
            {toolType === 'WORKSHEET' && (
              <div className="mt-3 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <FileText size={15} className="text-emerald-600" />
                    Çalışma Kağıdı / Doküman Ekle
                  </label>
                  <span className="text-[10px] text-emerald-700">PDF, Word, Görsel vb.</span>
                </div>

                <input
                  ref={worksheetInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleWorksheetUpload}
                />

                {!worksheetFile ? (
                  <div
                    onClick={() => worksheetInputRef.current?.click()}
                    className="p-5 border-2 border-dashed border-emerald-200 rounded-xl bg-white hover:bg-emerald-50/40 text-center cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-xs">Çalışma Kağıdı Yüklemek İçin Tıklayın</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        PDF (doğrudan sistem içi açılır), Word, Excel veya Görsel (Maks. 30 MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate max-w-xs">
                          {worksheetFile.file_name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {worksheetFile.file_type.includes('pdf') || worksheetFile.file_name.toLowerCase().endsWith('.pdf')
                            ? 'PDF Dokümanı (Öğrenci arayüzünde temaya uyumlu açılacak)'
                            : 'İndirilebilir Doküman'} • {(worksheetFile.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWorksheetFile(null)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Dosyayı Kaldır"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* READING CONFIGURATION */}
            {toolType === 'READING' && (
              <div className="mt-3 p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <BookOpen size={15} className="text-purple-600" />
                    Okunacak Metin & Sesli Görev Yönergeleri
                  </label>
                  <span className="text-[10px] text-purple-700">Canlı Ses Kaydı Stüdyosu Aktif</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Okunacak Metin / Parça (Öğrenci bu metni ekranda görüp sesli okuyacaktır)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Öğrencinin okuyacağı Türkçe veya İngilizce okuma parçasını, şiiri veya metni buraya yapıştırınız..."
                    value={readingText}
                    onChange={(e) => setReadingText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Ses Kaydı Yönergesi
                  </label>
                  <input
                    type="text"
                    value={readingInstructions}
                    onChange={(e) => setReadingInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. TARİH VE PUAN */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={13} /> Son Teslim Tarihi & Saati
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                <GraduationCap size={13} /> Maksimum Puan
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>Ödevi Yayınla & Sınıflara Ata</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
