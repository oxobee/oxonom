'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Send,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check,
  FileQuestion,
} from 'lucide-react'
import type {
  QuizQuestion,
  SchoolAssignmentItem,
} from '@services/school_assignments/school_assignments'
import type { StudentSubmission } from '@/lib/student/studentData'
import toast from 'react-hot-toast'

interface StudentInteractiveQuizSolverProps {
  assignment: SchoolAssignmentItem
  questions: QuizQuestion[]
  existingSubmission: StudentSubmission | null
  onSubmit: (submission: StudentSubmission) => void
}

export default function StudentInteractiveQuizSolver({
  assignment,
  questions,
  existingSubmission,
  onSubmit,
}: StudentInteractiveQuizSolverProps) {
  // Answers state: Record<questionId, any>
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    // If existing submission has student_content, restore it
    if (existingSubmission?.content) {
      try {
        const parsed = JSON.parse(existingSubmission.content)
        if (parsed && typeof parsed === 'object') return parsed
      } catch (_) {}
    }
    return {}
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!existingSubmission)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectOption = (qId: string, optId: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [qId]: optId }))
  }

  const handleSelectBoolean = (qId: string, val: boolean) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [qId]: val }))
  }

  const handleShortAnswerChange = (qId: string, text: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [qId]: text }))
  }

  const handleSelectMatching = (qId: string, leftId: string, rightVal: string) => {
    if (isSubmitted) return
    setAnswers((prev) => {
      const curPairs = prev[qId] || {}
      return {
        ...prev,
        [qId]: { ...curPairs, [leftId]: rightVal },
      }
    })
  }

  // Answered count
  const answeredCount = questions.filter((q) => {
    const ans = answers[q.id]
    if (ans === undefined || ans === null || ans === '') return false
    if (q.type === 'matching') {
      const pairs = q.matchingPairs || []
      return pairs.every((p) => ans[p.id || p.left])
    }
    return true
  }).length

  const handleSubmitQuiz = () => {
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `Tüm soruları yanıtlamadınız (${answeredCount}/${questions.length} soru yanıtlandı). Yine de göndermek istiyor musunuz?`
      )
      if (!confirmSubmit) return
    }

    setIsSubmitting(true)

    // Calculate score
    let calculatedScore = 0
    questions.forEach((q) => {
      const userAns = answers[q.id]
      const qPoints = Number(q.points) || 25

      if (q.type === 'multiple_choice') {
        if (userAns && userAns === q.correctOptionId) {
          calculatedScore += qPoints
        }
      } else if (q.type === 'true_false') {
        if (userAns !== undefined && userAns === q.correctBoolean) {
          calculatedScore += qPoints
        }
      } else if (q.type === 'short_answer') {
        if (
          userAns &&
          q.sampleAnswer &&
          userAns.trim().toLowerCase().includes(q.sampleAnswer.trim().toLowerCase())
        ) {
          calculatedScore += qPoints
        } else if (userAns && userAns.trim().length > 3) {
          // Generous partial credit for thoughtful answer
          calculatedScore += Math.round(qPoints * 0.8)
        }
      } else if (q.type === 'matching') {
        const pairs = q.matchingPairs || []
        if (pairs.length > 0 && userAns) {
          let correctPairs = 0
          pairs.forEach((p) => {
            const key = p.id || p.left
            if (userAns[key] === p.right) correctPairs++
          })
          calculatedScore += Math.round((correctPairs / pairs.length) * qPoints)
        }
      }
    })

    const finalScore = Math.min(100, Math.max(0, calculatedScore))

    setTimeout(() => {
      const subRecord: StudentSubmission = {
        assignmentId: String(assignment.assignment_uuid || assignment.id),
        submittedAt: new Date().toLocaleString('tr-TR'),
        content: JSON.stringify(answers),
        status: 'graded',
        score: finalScore,
        feedback:
          finalScore >= 85
            ? 'Tebrikler! Soruların büyük çoğunluğunu başarıyla tamamladın.'
            : finalScore >= 60
            ? 'Güzel bir çalışma, yanlış yapılan soruların çözümlerini inceleyebilirsin.'
            : 'Soruları ve çözüm açıklamalarını tekrar gözden geçirmeni öneririm.',
      }

      onSubmit(subRecord)
      setIsSubmitted(true)
      setIsSubmitting(false)
      toast.success(`Test tamamlandı! Notunuz: ${finalScore} / 100`, { icon: '🎉' })
    }, 500)
  }

  const handleRetake = () => {
    setIsSubmitted(false)
  }

  return (
    <div className="space-y-6">
      {/* Progress or Score Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/30 border border-sky-200/70 dark:border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>İnteraktif Test ve Değerlendirme</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-200/60 dark:bg-sky-800/60 text-sky-800 dark:text-sky-200">
                {questions.length} Soru
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Soruları dikkatlice okuyup yanıtlayınız. Test sonucunuz anında değerlendirilir.
            </p>
          </div>
        </div>

        {isSubmitted && existingSubmission?.score !== undefined ? (
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 px-3.5 rounded-xl border border-emerald-500/30 shrink-0">
            <Award size={20} className="text-emerald-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Puanınız</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {existingSubmission.score} / 100
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-gray-400">İlerleme</div>
              <div className="text-xs font-mono font-black text-sky-600 dark:text-sky-400">
                {answeredCount} / {questions.length} Soru
              </div>
            </div>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{
                  width: `${(answeredCount / Math.max(1, questions.length)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAns = answers[q.id]
          const isCorrectAnswer =
            q.type === 'multiple_choice'
              ? userAns === q.correctOptionId
              : q.type === 'true_false'
              ? userAns === q.correctBoolean
              : true

          return (
            <div
              key={q.id || idx}
              className={`p-5 rounded-3xl bg-white dark:bg-[#0E1526] border transition-all space-y-4 ${
                isSubmitted
                  ? isCorrectAnswer
                    ? 'border-emerald-500/40 shadow-xs'
                    : 'border-rose-500/40 shadow-xs'
                  : 'border-gray-200/80 dark:border-gray-800/80'
              }`}
            >
              {/* Question Top Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
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
                </div>

                <div className="flex items-center gap-2">
                  {isSubmitted && (
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrectAnswer
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrectAnswer ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Doğru (+{q.points} Puan)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>Yanlış (0 Puan)</span>
                        </>
                      )}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {q.points} Puan
                  </span>
                </div>
              </div>

              {/* Prompt text */}
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                {q.prompt}
              </p>

              {/* 1. Multiple Choice Options */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-2 pt-1">
                  {(q.options || []).map((opt) => {
                    const isSelected = userAns === opt.id
                    const isTheCorrectOne = isSubmitted && q.correctOptionId === opt.id
                    const isUserWrong = isSubmitted && isSelected && !isTheCorrectOne

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isTheCorrectOne
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                            : isUserWrong
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 font-bold text-rose-900 dark:text-rose-100'
                            : isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 font-bold text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/30'
                            : 'bg-gray-50/70 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                              isTheCorrectOne
                                ? 'bg-emerald-500 text-white'
                                : isUserWrong
                                ? 'bg-rose-500 text-white'
                                : isSelected
                                ? 'bg-sky-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-xs leading-relaxed">{opt.text}</span>
                        </div>

                        {isTheCorrectOne && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                            ✓ Doğru Cevap
                          </span>
                        )}
                        {isUserWrong && (
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 shrink-0">
                            ✕ Sizin Cevabınız
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 2. True / False */}
              {q.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { val: true, label: 'DOĞRU', icon: CheckCircle2, color: 'emerald' },
                    { val: false, label: 'YANLIŞ', icon: XCircle, color: 'rose' },
                  ].map((item) => {
                    const isSelected = userAns === item.val
                    const isCorrectBtn = isSubmitted && q.correctBoolean === item.val

                    return (
                      <button
                        key={String(item.val)}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectBoolean(q.id, item.val)}
                        className={`h-12 rounded-2xl border font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isCorrectBtn
                            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30'
                            : isSubmitted && isSelected && !isCorrectBtn
                            ? 'bg-rose-600 text-white border-rose-600'
                            : isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-gray-50 dark:bg-[#131C31] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-sky-400'
                        }`}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 3. Short Answer */}
              {q.type === 'short_answer' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={userAns || ''}
                    onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                    placeholder="Yanıtınızı buraya yazınız..."
                    className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {isSubmitted && q.sampleAnswer && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-extrabold">Örnek Model Yanıt:</span> {q.sampleAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Matching */}
              {q.type === 'matching' && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-gray-500">
                    Kavramları uygun açıklamalarla eşleştiriniz:
                  </div>
                  {(q.matchingPairs || []).map((p, pIdx) => {
                    const currentSelected = userAns?.[p.id || p.left] || ''
                    const rightOptions = (q.matchingPairs || []).map((mp) => mp.right)

                    return (
                      <div
                        key={p.id || pIdx}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <span className="text-xs font-bold text-gray-900 dark:text-white sm:w-1/3">
                          {p.left}
                        </span>
                        <ArrowRight size={14} className="text-sky-500 shrink-0 hidden sm:block" />
                        <select
                          disabled={isSubmitted}
                          value={currentSelected}
                          onChange={(e) =>
                            handleSelectMatching(q.id, p.id || p.left, e.target.value)
                          }
                          className="flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white"
                        >
                          <option value="">-- Eşleşen Açıklamayı Seçin --</option>
                          {rightOptions.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Explanation (Visible after submit) */}
              {isSubmitted && q.explanation && (
                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-500/20 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                  <div className="font-black flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                    <Sparkles size={13} />
                    <span>Çözüm ve Açıklama:</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isSubmitted ? (
          <button
            type="button"
            onClick={handleRetake}
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Testi Tekrar Çöz</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitQuiz}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Puan Hesaplanıyor...' : 'Testi Tamamla ve Öğretmene Gönder'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
