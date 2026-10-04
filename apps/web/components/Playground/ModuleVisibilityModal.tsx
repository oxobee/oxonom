'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Users,
  GraduationCap,
  Globe,
  Eye,
  EyeOff,
  Check,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  School,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ModuleAssignment,
  ModuleVisibilityScope,
  AssignedStudentInfo,
  getModuleAssignment,
  saveModuleAssignment,
  getAvailableClassrooms,
  getAvailableStudentsForClassrooms,
} from '@services/playgrounds/moduleAssignments'
import { updatePlayground } from '@services/playgrounds/playgrounds'
import { useLHSession } from '@components/Contexts/LHSessionContext'

interface ModuleVisibilityModalProps {
  isOpen: boolean
  onClose: () => void
  module: {
    playground_uuid: string
    name: string
    description?: string | null
    published?: boolean
    org_id?: number
  }
  orgId: number
  onSaved?: (updatedAssignment: ModuleAssignment) => void
}

export default function ModuleVisibilityModal({
  isOpen,
  onClose,
  module,
  orgId,
  onSaved,
}: ModuleVisibilityModalProps) {
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token

  // Load current assignment
  const initialAssignment = useMemo(() => {
    return getModuleAssignment(orgId, module.playground_uuid, module.published !== false)
  }, [orgId, module.playground_uuid, module.published])

  const [published, setPublished] = useState<boolean>(initialAssignment.published)
  const [scope, setScope] = useState<ModuleVisibilityScope>(initialAssignment.scope)
  const [selectedClasses, setSelectedClasses] = useState<string[]>(initialAssignment.assignedClasses || [])
  const [selectedStudents, setSelectedStudents] = useState<AssignedStudentInfo[]>(initialAssignment.assignedStudents || [])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentClassFilter, setStudentClassFilter] = useState('all')
  const [isSaving, setIsSaving] = useState(false)

  // Reset when module changes
  React.useEffect(() => {
    setPublished(initialAssignment.published)
    setScope(initialAssignment.scope)
    setSelectedClasses(initialAssignment.assignedClasses || [])
    setSelectedStudents(initialAssignment.assignedStudents || [])
  }, [initialAssignment])

  // Classrooms and students rosters
  const availableClassrooms = useMemo(() => getAvailableClassrooms(orgId), [orgId])
  const allStudents = useMemo(() => getAvailableStudentsForClassrooms(orgId), [orgId])

  // Filtered students for student picker
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      if (studentClassFilter !== 'all' && st.classroomName !== studentClassFilter) {
        return false
      }
      if (studentSearch.trim()) {
        const query = studentSearch.trim().toLowerCase()
        const matchName = st.name.toLowerCase().includes(query)
        const matchNo = st.studentNo?.toLowerCase().includes(query)
        const matchClass = st.classroomName.toLowerCase().includes(query)
        return matchName || matchNo || matchClass
      }
      return true
    })
  }, [allStudents, studentClassFilter, studentSearch])

  if (!isOpen) return null

  // Class toggle helpers
  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    )
  }

  const selectAllGrade1Classes = () => {
    const grade1 = availableClassrooms
      .filter((c) => c.code.startsWith('1-') || c.name.startsWith('1-'))
      .map((c) => c.code || c.name)
    setSelectedClasses(grade1)
  }

  const selectAllClasses = () => {
    setSelectedClasses(availableClassrooms.map((c) => c.code || c.name))
  }

  const clearAllClasses = () => {
    setSelectedClasses([])
  }

  // Student toggle helpers
  const isStudentSelected = (student: AssignedStudentInfo) => {
    return selectedStudents.some(
      (s) => (s.id && s.id === student.id) || s.name.toLowerCase() === student.name.toLowerCase()
    )
  }

  const toggleStudent = (student: AssignedStudentInfo) => {
    setSelectedStudents((prev) => {
      const exists = prev.some(
        (s) => (s.id && s.id === student.id) || s.name.toLowerCase() === student.name.toLowerCase()
      )
      if (exists) {
        return prev.filter(
          (s) => !((s.id && s.id === student.id) || s.name.toLowerCase() === student.name.toLowerCase())
        )
      } else {
        return [...prev, student]
      }
    })
  }

  const removeSelectedStudent = (student: AssignedStudentInfo) => {
    setSelectedStudents((prev) =>
      prev.filter(
        (s) => !((s.id && s.id === student.id) || s.name.toLowerCase() === student.name.toLowerCase())
      )
    )
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Determine final published state
      const finalPublished = scope === 'hidden' ? false : published

      const updated = saveModuleAssignment(orgId, module.playground_uuid, {
        published: finalPublished,
        scope,
        assignedClasses: scope === 'classes' ? selectedClasses : [],
        assignedStudents: scope === 'students' ? selectedStudents : [],
      })

      // Sync with backend API if access token exists
      if (access_token) {
        try {
          await updatePlayground(module.playground_uuid, { published: finalPublished }, access_token)
        } catch {
          // LocalStorage fallback already active
        }
      }

      toast.success(`✨ "${module.name}" görünürlük ayarları kaydedildi!`)
      if (onSaved) onSaved(updated)
      onClose()
    } catch {
      toast.error('Ayarlar kaydedilirken bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Görünürlük & Atama
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  published && scope !== 'hidden'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {published && scope !== 'hidden' ? '● Aktif (Öğrencilere Açık)' : '○ Pasif (Gizli)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
              {module.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bu modülü hangi sınıfların veya öğrencilerin görebileceğini belirleyin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Quick Master Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  published && scope !== 'hidden'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {published && scope !== 'hidden' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-gray-900">
                  Modül Yayın Durumu
                </div>
                <div className="text-[11px] text-gray-500">
                  {published && scope !== 'hidden'
                    ? 'Modül aktif ve belirlenen öğrencilerin erişimine açık.'
                    : 'Modül pasife alındı, hiçbir öğrenci görüntüleyemez.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !published
                setPublished(next)
                if (!next) setScope('hidden')
                else if (scope === 'hidden') setScope('all')
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs ${
                published && scope !== 'hidden'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {published && scope !== 'hidden' ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}
            </button>
          </div>

          {/* 2. Scope Selector Tabs */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
              Kime Gösterileceğini Seçin
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Option A: Tüm Okul */}
              <button
                type="button"
                onClick={() => {
                  setScope('all')
                  setPublished(true)
                }}
                className={`p-3 rounded-2xl border text-start transition flex flex-col justify-between cursor-pointer ${
                  scope === 'all'
                    ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Globe className={`w-4 h-4 ${scope === 'all' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {scope === 'all' && <Check className="w-3.5 h-3.5 text-indigo-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Tüm Sınıflar</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Herkes görebilir</div>
              </button>

              {/* Option B: Belirli Sınıflar */}
              <button
                type="button"
                onClick={() => {
                  setScope('classes')
                  setPublished(true)
                }}
                className={`p-3 rounded-2xl border text-start transition flex flex-col justify-between cursor-pointer ${
                  scope === 'classes'
                    ? 'bg-blue-50/80 border-blue-400 text-blue-950 ring-2 ring-blue-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <School className={`w-4 h-4 ${scope === 'classes' ? 'text-blue-600' : 'text-gray-400'}`} />
                  {scope === 'classes' && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Belirli Sınıflar</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {selectedClasses.length > 0 ? `${selectedClasses.length} sınıf seçili` : 'Sınıf seçin'}
                </div>
              </button>

              {/* Option C: Belirli Öğrenciler */}
              <button
                type="button"
                onClick={() => {
                  setScope('students')
                  setPublished(true)
                }}
                className={`p-3 rounded-2xl border text-start transition flex flex-col justify-between cursor-pointer ${
                  scope === 'students'
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 ring-2 ring-purple-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className={`w-4 h-4 ${scope === 'students' ? 'text-purple-600' : 'text-gray-400'}`} />
                  {scope === 'students' && <Check className="w-3.5 h-3.5 text-purple-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Belirli Öğrenciler</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {selectedStudents.length > 0 ? `${selectedStudents.length} öğrenci` : 'Öğrenci seçin'}
                </div>
              </button>

              {/* Option D: Gizle */}
              <button
                type="button"
                onClick={() => {
                  setScope('hidden')
                  setPublished(false)
                }}
                className={`p-3 rounded-2xl border text-start transition flex flex-col justify-between cursor-pointer ${
                  scope === 'hidden'
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-2 ring-rose-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Lock className={`w-4 h-4 ${scope === 'hidden' ? 'text-rose-600' : 'text-gray-400'}`} />
                  {scope === 'hidden' && <Check className="w-3.5 h-3.5 text-rose-600 font-bold" />}
                </div>
                <div className="font-bold text-xs">Gizle (Kimse)</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Sadece öğretmen</div>
              </button>
            </div>
          </div>

          {/* 3. Conditional Content based on Scope */}
          {/* SUB-PANEL: CLASSES */}
          {scope === 'classes' && (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  Modülün Gösterileceği Sınıfları Seçin
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={selectAllGrade1Classes}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded hover:bg-blue-50 transition cursor-pointer"
                  >
                    Tüm 1. Sınıflar
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={selectAllClasses}
                    className="text-[11px] font-bold text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded hover:bg-gray-100 transition cursor-pointer"
                  >
                    Tümünü Seç
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={clearAllClasses}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-2 py-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {availableClassrooms.map((cls) => {
                  const isChecked = selectedClasses.includes(cls.code || cls.name)
                  return (
                    <button
                      key={cls.id || cls.code}
                      type="button"
                      onClick={() => toggleClass(cls.code || cls.name)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{cls.name || cls.code}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 shrink-0 text-gray-400" />
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedClasses.length === 0 && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                  ⚠️ Henüz hiçbir sınıf seçilmedi. Lütfen en az bir sınıf seçin veya &quot;Tüm Sınıflar&quot; seçeneğini kullanın.
                </div>
              )}
            </div>
          )}

          {/* SUB-PANEL: INDIVIDUAL STUDENTS */}
          {scope === 'students' && (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  Modülün Gösterileceği Özel Öğrencileri Seçin
                </span>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {selectedStudents.length} Öğrenci Seçildi
                </span>
              </div>

              {/* Filters for students */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Öğrenci adı veya numarası ara..."
                    className="w-full ps-8 pe-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-700 outline-none cursor-pointer shrink-0"
                >
                  <option value="all">Tüm Şubeler</option>
                  {availableClassrooms.map((c) => (
                    <option key={c.id || c.code} value={c.code || c.name}>
                      {c.name || c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Students Pill Tags */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-2 bg-white rounded-xl border border-gray-200/80">
                  {selectedStudents.map((st, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    >
                      <span>{st.name}</span>
                      <span className="text-[9px] text-purple-500">({st.classroomName})</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedStudent(st)}
                        className="text-purple-400 hover:text-purple-700 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Student list */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 bg-white p-2 rounded-xl border border-gray-200 divide-y divide-gray-50">
                {filteredStudents.slice(0, 30).map((st, idx) => {
                  const isChecked = isStudentSelected(st)
                  return (
                    <div
                      key={st.id || idx}
                      onClick={() => toggleStudent(st)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-50 text-purple-950 font-bold'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="text-xs">{st.name}</span>
                        {st.studentNo && (
                          <span className="text-[10px] text-gray-400">({st.studentNo})</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {st.classroomName}
                      </span>
                    </div>
                  )
                })}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-400">
                    Arama kriterine uygun öğrenci bulunamadı.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-PANEL: HIDDEN */}
          {scope === 'hidden' && (
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Modül Tüm Öğrencilerden Gizlendi</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Bu modül şu anda pasif durumda. Öğrenci veya veli hesapları bu modülü ders veya modüller listesinde göremez. Yalnızca öğretmenler ve yöneticiler görebilir ve düzenleyebilir.
              </p>
            </div>
          )}

          {/* SUB-PANEL: ALL */}
          {scope === 'all' && (
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Tüm Okula ve Şubelere Açık</span>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                Bu modül okuldaki tüm sınıflar ve öğrenciler tarafından görüntülenebilir ve etkileşimli olarak başlatılabilir.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition cursor-pointer"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet ve Uygula'}
          </button>
        </div>
      </div>
    </div>
  )
}
