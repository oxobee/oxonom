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
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  PenTool,
  Save,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getAssignmentSubmissions,
  gradeSubmission,
  SchoolAssignmentItem,
  StudentSubmissionRow,
} from '@services/school_assignments/school_assignments'
import AssignmentFileViewer from './AssignmentFileViewer'
import AudioReviewPlayer from './AudioReviewPlayer'

interface AssignmentSubmissionsModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: SchoolAssignmentItem | null
  accessToken: string
  onGraded?: () => void
}

export default function AssignmentSubmissionsModal({
  isOpen,
  onClose,
  assignment,
  accessToken,
  onGraded,
}: AssignmentSubmissionsModalProps) {
  const queryClient = useQueryClient()
  const [selectedUsergroupId, setSelectedUsergroupId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmissionRow | null>(null)

  // Grading form state
  const [gradeScore, setGradeScore] = useState<number>(100)
  const [gradeFeedback, setGradeFeedback] = useState<string>('')
  const [isGrading, setIsGrading] = useState(false)

  const { data: submissionsData, isLoading, refetch } = useQuery({
    queryKey: ['school-assignment-submissions', assignment?.assignment_uuid, selectedUsergroupId],
    queryFn: () =>
      getAssignmentSubmissions(assignment!.assignment_uuid, selectedUsergroupId, accessToken),
    enabled: !!(isOpen && assignment?.assignment_uuid && accessToken),
  })

  if (!assignment) return null

  const students = submissionsData?.students || []
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q)
  })

  const handleSelectStudent = (s: StudentSubmissionRow) => {
    setSelectedStudent(s)
    setGradeScore(s.score ?? 100)
    setGradeFeedback(s.teacher_feedback || '')
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent?.submission_id) {
      toast.error('Bu öğrenci henüz ödev teslim etmemiştir.')
      return
    }

    setIsGrading(true)
    try {
      await gradeSubmission(
        selectedStudent.submission_id,
        {
          score: Number(gradeScore),
          teacher_feedback: gradeFeedback,
        },
        accessToken
      )

      toast.success('Puan ve geri bildirim başarıyla kaydedildi!')
      refetch()
      onGraded?.()
      queryClient.invalidateQueries({ queryKey: ['school-assignments'] })
      // Update local state
      setSelectedStudent({
        ...selectedStudent,
        status: 'GRADED',
        score: Number(gradeScore),
        teacher_feedback: gradeFeedback,
      })
    } catch (err) {
      console.error(err)
      toast.error('Puan kaydedilirken bir hata oluştu.')
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-100">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                  {assignment.subject}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {assignment.grade_level}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {assignment.title} — Teslim ve Değerlendirme
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Sınıftaki öğrencilerin teslim durumlarını inceleyin, tahta çözümlerini açın ve puanlayın.
              </DialogDescription>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Toplam</span>
                <span className="text-xs font-black text-gray-900">{submissionsData?.total_students || 0}</span>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="block text-[10px] text-blue-600 font-bold uppercase">Teslim</span>
                <span className="text-xs font-black text-blue-800">{submissionsData?.submitted_count || 0}</span>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase">Notlandı</span>
                <span className="text-xs font-black text-emerald-800">{submissionsData?.graded_count || 0}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4 text-xs">
          {/* LEFT COLUMN: Student List */}
          <div className="md:col-span-5 space-y-3 border-r border-gray-100 pr-0 md:pr-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Öğrenci ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Öğrenci listesi yükleniyor...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400">Öğrenci bulunamadı.</div>
            ) : (
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.user_id === s.user_id
                  const isGraded = s.status === 'GRADED'
                  const isSubmitted = s.status === 'SUBMITTED' || isGraded

                  return (
                    <div
                      key={s.user_id}
                      onClick={() => handleSelectStudent(s)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{s.classroom_name}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {s.score} Puan
                          </span>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            İncele
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            Bekliyor
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Student Submission Review & Grading Form */}
          <div className="md:col-span-7 space-y-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedStudent.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Sınıf: {selectedStudent.classroom_name} •{' '}
                      {selectedStudent.submission_date
                        ? `Teslim: ${new Date(selectedStudent.submission_date).toLocaleString('tr-TR')}`
                        : 'Henüz teslim edilmedi'}
                    </p>
                  </div>
                  {selectedStudent.status === 'GRADED' ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                      Notlandı ({selectedStudent.score} / {assignment.max_score})
                    </span>
                  ) : selectedStudent.status === 'SUBMITTED' ? (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-xs">
                      Teslim Edildi
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-700 font-bold rounded-lg text-xs">
                      Teslim Edilmedi
                    </span>
                  )}
                </div>

                {/* ÖĞRENCİ ÇÖZÜM İÇERİĞİ */}
                <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-2xl">
                  <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Öğrenci Yanıtı & Çözüm Detayları
                  </span>

                  {/* WHITEBOARD ÖDEVİ TAHTA BAĞLANTISI */}
                  {assignment.tool_type === 'WHITEBOARD' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold">
                        <PenTool size={16} className="text-indigo-600" />
                        <span>Akıllı Tahta Çözümü</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const boardUuid =
                            selectedStudent.student_content?.board_uuid || assignment.board_uuid
                          if (boardUuid) {
                            window.open(`/board/${boardUuid}`, '_blank')
                          } else {
                            toast.error('Tahta bağlantısı bulunamadı.')
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <span>Tahtayı Aç ve İncele</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  )}

                  {/* ÖĞRENCİ SES KAYDI (SESLİ GÖREV / OKUMA) */}
                  {selectedStudent.student_content?.audio_url && (
                    <AudioReviewPlayer
                      audioUrl={selectedStudent.student_content.audio_url}
                      audioName={selectedStudent.student_content.audio_name || 'Öğrenci Ses Kaydı'}
                      studentName={selectedStudent.name}
                    />
                  )}

                  {/* ÖĞRENCİ ÇALIŞMA DOSYASI / PDF / GÖRSEL */}
                  {selectedStudent.student_content?.file_url && (
                    <AssignmentFileViewer
                      fileUrl={selectedStudent.student_content.file_url}
                      fileName={selectedStudent.student_content.file_name || 'Öğrenci Teslim Dosyası'}
                      fileType={selectedStudent.student_content.file_type}
                      fileSize={selectedStudent.student_content.file_size}
                      title={`${selectedStudent.name} — Çözüm Dosyası`}
                    />
                  )}

                  {/* METİN CEVABI */}
                  {selectedStudent.student_content?.notes ? (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl whitespace-pre-line text-gray-800 leading-relaxed">
                      {selectedStudent.student_content.notes}
                    </div>
                  ) : selectedStudent.status === 'PENDING' ? (
                    <p className="text-gray-400 italic">Öğrenci henüz bir çözüm veya not girmedi.</p>
                  ) : !selectedStudent.student_content?.audio_url && !selectedStudent.student_content?.file_url ? (
                    <p className="text-gray-400 italic">Metin açıklaması eklenmedi.</p>
                  ) : null}
                </div>

                {/* PUANLAMA VE GERİ BİLDİRİM FORMU */}
                {selectedStudent.status !== 'PENDING' ? (
                  <form onSubmit={handleSaveGrade} className="space-y-3 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-indigo-600" />
                      Değerlendirme & Puanlama
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                          Puan (Max: {assignment.max_score}) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          max={assignment.max_score}
                          value={gradeScore}
                          onChange={(e) => setGradeScore(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block font-semibold text-gray-700 mb-1">
                          Öğretmen Geri Bildirim Notu
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Öğrenciye çözümüne dair yönlendirici geri bildirim yazın..."
                          value={gradeFeedback}
                          onChange={(e) => setGradeFeedback(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isGrading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isGrading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        <span>Puan ve Geri Bildirimi Kaydet</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-gray-500">
                    Öğrenci henüz teslim yapmadığı için puanlama formu kapalıdır.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 space-y-2">
                <User size={36} className="text-gray-300" />
                <p className="font-semibold">İncelemek istediğiniz öğrenciyi soldaki listeden seçiniz.</p>
                <p className="text-[11px] text-gray-400">Öğrencinin çözümü, tahta çizimleri ve notlandırma formu burada görüntülenecektir.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Kapat
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
