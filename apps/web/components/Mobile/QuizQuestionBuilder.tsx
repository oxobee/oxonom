'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  Edit3,
  Check,
  Layers,
  ArrowRight,
  ListOrdered,
  Shuffle,
  FileQuestion,
} from 'lucide-react'
import type {
  QuizQuestion,
  QuizQuestionType,
  QuizQuestionOption,
  MatchingPair,
} from '@services/school_assignments/school_assignments'

export const DEFAULT_TEMPLATE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-demo-1',
    questionNumber: 1,
    type: 'multiple_choice',
    prompt: '“Yazar, olayları bir kamera sessizliğiyle aktarmak yerine karakterlerinin iç dünyasındaki fırtınaları kelimelere dökmüştür.” Bu cümlede yazarın öne çıkan özelliği aşağıdakilerden hangisidir?',
    points: 25,
    options: [
      { id: 'A', label: 'A', text: 'Olayları kronolojik sırayla belgesel gibi aktarması' },
      { id: 'B', label: 'B', text: 'Ruhsal tahlil ve iç çatışmaları derinlemesine işlemesi' },
      { id: 'C', label: 'C', text: 'Sadece dış gözleme dayalı betimlemeler yapması' },
      { id: 'D', label: 'D', text: 'Mekân tasvirlerine odaklanıp insanı arka plana atması' },
    ],
    correctOptionId: 'B',
    explanation: 'Karakterlerin iç dünyasındaki fırtınalar, psikolojik derinliği ve iç çatışmaları simgeler.',
  },
  {
    id: 'q-demo-2',
    questionNumber: 2,
    type: 'true_false',
    prompt: 'Dede Korkut Hikâyelerinde olağanüstü mitolojik motifler ile gerçekçi tarihsel unsurlar bir arada bulunur ve eser nazım-nesir (şiir-düzyazı) karışık olarak kaleme alınmıştır.',
    points: 25,
    correctBoolean: true,
    explanation: 'Dede Korkut destansı anlatılarında olaylar düzyazı, duygular şiir biçimindedir.',
  },
  {
    id: 'q-demo-3',
    questionNumber: 3,
    type: 'matching',
    prompt: 'Aşağıdaki edebi sanatları uygun şiir dizeleriyle eşleştiriniz.',
    points: 25,
    matchingPairs: [
      { id: 'm-1', left: 'Teşbih (Benzetme)', right: 'Kükremiş sel gibiyim, bendimi çiğner aşarım.' },
      { id: 'm-2', left: 'Teşhis (Kişileştirme)', right: 'Rüzgâr hüzünle fısıldıyordu kırık penceremde.' },
      { id: 'm-3', left: 'Tezat (Karşıtlık)', right: 'Ağlarım çağlar gibi, gülerim güller gibi.' },
    ],
    explanation: 'Kükremiş sel benzetme, rüzgârın fısıldaması kişileştirme, ağlamak-gülmek tezattır.',
  },
  {
    id: 'q-demo-4',
    questionNumber: 4,
    type: 'short_answer',
    prompt: 'Bir edebi metinde anlatıcının olayları her şeyi bilen, kahramanların geçmişini, geleceğini ve gizli düşüncelerini sezen bakış açısına ne ad verilir?',
    points: 25,
    sampleAnswer: 'İlahi (Hakim / Tanrısal) Bakış Açısı',
    explanation: 'Kahramanların gizli düşüncelerini ve geleceği bilen anlatıcı ilahi bakış açısına sahiptir.',
  },
]

interface QuizQuestionBuilderProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
  maxScore?: number
}

export default function QuizQuestionBuilder({
  questions,
  onChange,
  maxScore = 100,
}: QuizQuestionBuilderProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0)

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      questionNumber: nextNum,
      type: 'multiple_choice',
      prompt: '',
      points: 20,
      options: [
        { id: 'A', label: 'A', text: '' },
        { id: 'B', label: 'B', text: '' },
        { id: 'C', label: 'C', text: '' },
        { id: 'D', label: 'D', text: '' },
      ],
      correctOptionId: 'A',
      explanation: '',
    }
    onChange([...questions, newQ])
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = questions
      .filter((_, idx) => idx !== index)
      .map((q, idx) => ({ ...q, questionNumber: idx + 1 }))
    onChange(updated)
  }

  const handleUpdateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    const updated = [...questions]
    const cur = updated[index]
    if (!cur) return

    // If changing type, initialize type-specific fields cleanly
    if (patch.type && patch.type !== cur.type) {
      if (patch.type === 'multiple_choice') {
        patch.options = cur.options || [
          { id: 'A', label: 'A', text: '' },
          { id: 'B', label: 'B', text: '' },
          { id: 'C', label: 'C', text: '' },
          { id: 'D', label: 'D', text: '' },
        ]
        patch.correctOptionId = patch.correctOptionId || 'A'
      } else if (patch.type === 'true_false') {
        patch.correctBoolean = patch.correctBoolean ?? true
      } else if (patch.type === 'matching') {
        patch.matchingPairs = cur.matchingPairs || [
          { id: 'm-1', left: '', right: '' },
          { id: 'm-2', left: '', right: '' },
        ]
      } else if (patch.type === 'short_answer') {
        patch.sampleAnswer = cur.sampleAnswer || ''
      }
    }

    updated[index] = { ...cur, ...patch }
    onChange(updated)
  }

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const q = questions[qIndex]
    if (!q || !q.options) return
    const newOptions = [...q.options]
    newOptions[optIndex] = { ...newOptions[optIndex], text }
    handleUpdateQuestion(qIndex, { options: newOptions })
  }

  const handleAddOption = (qIndex: number) => {
    const q = questions[qIndex]
    if (!q || !q.options) return
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    if (q.options.length >= 6) return
    const nextLabel = labels[q.options.length]
    const newOpt: QuizQuestionOption = { id: nextLabel, label: nextLabel, text: '' }
    handleUpdateQuestion(qIndex, { options: [...q.options, newOpt] })
  }

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex]
    if (!q || !q.options || q.options.length <= 2) return
    const newOptions = q.options.filter((_, idx) => idx !== optIndex)
    let newCorrect = q.correctOptionId
    if (!newOptions.some((o) => o.id === newCorrect)) {
      newCorrect = newOptions[0]?.id
    }
    handleUpdateQuestion(qIndex, { options: newOptions, correctOptionId: newCorrect })
  }

  const handleMatchingPairChange = (
    qIndex: number,
    pairIndex: number,
    field: 'left' | 'right',
    val: string
  ) => {
    const q = questions[qIndex]
    if (!q || !q.matchingPairs) return
    const newPairs = [...q.matchingPairs]
    newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: val }
    handleUpdateQuestion(qIndex, { matchingPairs: newPairs })
  }

  const handleAddMatchingPair = (qIndex: number) => {
    const q = questions[qIndex]
    if (!q) return
    const pairs = q.matchingPairs || []
    const newPair: MatchingPair = { id: `m-${Date.now()}`, left: '', right: '' }
    handleUpdateQuestion(qIndex, { matchingPairs: [...pairs, newPair] })
  }

  const handleRemoveMatchingPair = (qIndex: number, pairIndex: number) => {
    const q = questions[qIndex]
    if (!q || !q.matchingPairs || q.matchingPairs.length <= 1) return
    const newPairs = q.matchingPairs.filter((_, idx) => idx !== pairIndex)
    handleUpdateQuestion(qIndex, { matchingPairs: newPairs })
  }

  const handleLoadDemoTemplate = () => {
    onChange(DEFAULT_TEMPLATE_QUESTIONS)
  }

  return (
    <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-800/60 space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <HelpCircle size={17} />
          </div>
          <div>
            <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Test & Quiz Parametreleri — Soru ve Şık Editörü</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-extrabold">
                {questions.length} Soru
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Çoktan seçmeli, doğru-yanlış, eşleştirme ve açık uçlu soruları soru bazlı yapılandırın.
            </p>
          </div>
        </div>

        {/* Tab switch & demo button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleLoadDemoTemplate}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-800 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-50 transition-colors flex items-center gap-1 cursor-pointer"
            title="4 farklı soru stilinden oluşan MEB standart şablonu yükle"
          >
            <Sparkles size={12} />
            <span>Şablon Yükle</span>
          </button>

          <div className="p-0.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Edit3 size={11} />
              <span>Düzenle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Eye size={11} />
              <span>Önizle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Point balance meter */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 dark:bg-gray-900/60 border border-sky-100 dark:border-sky-900 text-xs">
        <span className="text-[11px] text-gray-600 dark:text-gray-400">
          Toplam Puan Dağılımı:
        </span>
        <span className={`font-mono font-bold ${
          totalPoints === maxScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        }`}>
          {totalPoints} / {maxScore} Puan {totalPoints === maxScore ? '✓ (Tam Dengeli)' : '⚠️'}
        </span>
      </div>

      {/* Mode: EDIT */}
      {activeTab === 'edit' && (
        <div className="space-y-3">
          {questions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3"
            >
              {/* Question header */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {qIdx + 1}. Soru
                  </span>
                </div>

                {/* Question Type selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'multiple_choice', label: 'Çoktan Seçmeli' },
                    { id: 'true_false', label: 'Doğru / Yanlış' },
                    { id: 'short_answer', label: 'Kısa Cevap' },
                    { id: 'matching', label: 'Eşleştirme' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleUpdateQuestion(qIdx, { type: t.id as QuizQuestionType })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        q.type === t.id
                          ? 'bg-sky-500 text-white shadow-2xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}

                  {/* Points */}
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={q.points || 20}
                      onChange={(e) => handleUpdateQuestion(qIdx, { points: Number(e.target.value) || 0 })}
                      className="w-12 h-7 px-1 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-mono font-bold text-gray-900 dark:text-white"
                      title="Soru Puanı"
                    />
                    <span className="text-[10px] text-gray-400 font-bold">Puan</span>
                  </div>

                  {/* Delete question button */}
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Soruyu Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                  Soru Metni / Yönergesi:
                </label>
                <textarea
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => handleUpdateQuestion(qIdx, { prompt: e.target.value })}
                  placeholder="Örn: Paragrafa göre sanatçının dili hakkında ne söylenebilir?"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              {/* Specific Editor based on Type */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400">
                    <span>Şıklar ve Doğru Cevap: (Doğru şıkkın solundaki kutucuğa tıklayınız)</span>
                    {(!q.options || q.options.length < 5) && (
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Şık Ekle (E Şıkkı)</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = q.correctOptionId === opt.id
                      return (
                        <div
                          key={opt.id || optIdx}
                          className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/70'
                              : 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {/* Pick as correct option */}
                          <button
                            type="button"
                            onClick={() => handleUpdateQuestion(qIdx, { correctOptionId: opt.id })}
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all ${
                              isCorrect
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100'
                            }`}
                            title={isCorrect ? 'Doğru Cevap Olarak İşaretli' : 'Doğru Cevap Yap'}
                          >
                            {isCorrect ? <Check size={12} strokeWidth={3} /> : opt.label}
                          </button>

                          {/* Option text */}
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`${opt.label} şıkkı metnini giriniz...`}
                            className="flex-1 h-8 px-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />

                          {isCorrect && (
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                              Doğru Şık
                            </span>
                          )}

                          {q.options && q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, optIdx)}
                              className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Şıkkı Kaldır"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* True/False type */}
              {q.type === 'true_false' && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block">
                    Doğru Cevap Seçimi:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuestion(qIdx, { correctBoolean: true })}
                      className={`h-10 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        q.correctBoolean === true
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>DOĞRU (✔)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuestion(qIdx, { correctBoolean: false })}
                      className={`h-10 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        q.correctBoolean === false
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <XCircle size={15} />
                      <span>YANLIŞ (✖)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Matching type */}
              {q.type === 'matching' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400">
                    <span>Eşleştirme Çiftleri:</span>
                    <button
                      type="button"
                      onClick={() => handleAddMatchingPair(qIdx)}
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Çift Ekle</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(q.matchingPairs || []).map((pair, pIdx) => (
                      <div key={pair.id || pIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) =>
                            handleMatchingPairChange(qIdx, pIdx, 'left', e.target.value)
                          }
                          placeholder="Sol Kavram (Örn: Teşbih)"
                          className="flex-1 h-8 px-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                        <ArrowRight size={14} className="text-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) =>
                            handleMatchingPairChange(qIdx, pIdx, 'right', e.target.value)
                          }
                          placeholder="Sağ Tanım / Karşılık"
                          className="flex-1 h-8 px-2.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                        />
                        {q.matchingPairs && q.matchingPairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMatchingPair(qIdx, pIdx)}
                            className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short answer type */}
              {q.type === 'short_answer' && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block">
                    Örnek Model Yanıt / Anahtar Terimler:
                  </label>
                  <input
                    type="text"
                    value={q.sampleAnswer || ''}
                    onChange={(e) => handleUpdateQuestion(qIdx, { sampleAnswer: e.target.value })}
                    placeholder="Örn: İlahi / Hakim Bakış Açısı"
                    className="w-full h-9 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Explanation field */}
              <div className="pt-1">
                <input
                  type="text"
                  value={q.explanation || ''}
                  onChange={(e) => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                  placeholder="İsteğe Bağlı Çözüm Açıklaması / Kazanım İpucu..."
                  className="w-full h-8 px-2.5 text-[11px] bg-gray-50/60 dark:bg-gray-800/30 border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-600 dark:text-gray-300 italic"
                />
              </div>
            </div>
          ))}

          {/* Add question button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Yeni Soru Ekle</span>
          </button>
        </div>
      )}

      {/* Mode: PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-sky-100/50 dark:bg-sky-900/30 border border-sky-200/50 text-[11px] text-sky-800 dark:text-sky-200 font-medium">
            Öğrencilerin bu testi sınav/ödev ekranında nasıl görüntüleyeceğinin canlı interaktif önizlemesi:
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              className="p-4 rounded-2xl bg-white dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-extrabold flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {q.type === 'multiple_choice'
                      ? 'Çoktan Seçmeli'
                      : q.type === 'true_false'
                      ? 'Doğru / Yanlış'
                      : q.type === 'short_answer'
                      ? 'Kısa Cevap'
                      : 'Eşleştirme'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                  {q.points} Puan
                </span>
              </div>

              <p className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                {q.prompt || '(Soru metni henüz girilmedi)'}
              </p>

              {/* Multiple choice preview */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-1.5 pt-1">
                  {(q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-sky-400 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-[10px]">
                        {opt.label}
                      </span>
                      <span>{opt.text || `(${opt.label} şıkkı metni)`}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False preview */}
              {q.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-9 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Doğru</span>
                  </div>
                  <div className="h-9 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <XCircle size={14} className="text-rose-500" />
                    <span>Yanlış</span>
                  </div>
                </div>
              )}

              {/* Short Answer preview */}
              {q.type === 'short_answer' && (
                <div className="pt-1">
                  <input
                    disabled
                    type="text"
                    placeholder="Öğrencinin yanıt alanı..."
                    className="w-full h-9 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-xs text-gray-400 italic"
                  />
                </div>
              )}

              {/* Matching preview */}
              {q.type === 'matching' && (
                <div className="space-y-1.5 pt-1">
                  {(q.matchingPairs || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {p.left || `(Sol Öğe ${idx + 1})`}
                      </span>
                      <ArrowRight size={13} className="text-sky-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {p.right || `(Sağ Öğe ${idx + 1})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
