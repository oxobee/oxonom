'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  BookOpen,
} from 'lucide-react'
import {
  getStoredPlannerTasks,
  saveStoredPlannerTasks,
  type PlannerTask,
  STUDENT_ASSESSMENTS,
} from '@/lib/student/studentData'
import toast from 'react-hot-toast'
import MockBadge from '@components/Common/MockBadge'

interface StudentPlannerViewProps {
  initialTab?: 'all' | 'calendar' | 'notes' | 'tasks'
}

interface StudentNote {
  id: string
  title: string
  course: string
  date: string
  content: string
}

const INITIAL_NOTES: StudentNote[] = [
  {
    id: 'note-1',
    title: 'Divan Şiirinde Aruz Kalıpları ve İmale Kuralları',
    course: 'Türk Dili ve Edebiyatı',
    date: '11 Ekim 2026',
    content:
      'Fâilâtün fâilâtün fâilün kalıbı gazellerde sıkça kullanılır. Açık hece (nokta), kapalı hece (çizgi) ile gösterilir. İmale heceyi uzatma, zihaf ise kısaltmadır.',
  },
  {
    id: 'note-2',
    title: 'İkinci Dereceden Denklemlerde Diskriminant (Delta)',
    course: 'Matematik',
    date: '09 Ekim 2026',
    content:
      'ax² + bx + c = 0 için Δ = b² - 4ac. Δ > 0 ise iki farklı reel kök vardır. Δ = 0 ise çakışık tek kök. Δ < 0 ise reel kök yoktur.',
  },
]

export default function StudentPlannerView({ initialTab = 'all' }: StudentPlannerViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'notes' | 'tasks'>(initialTab)
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [notes, setNotes] = useState<StudentNote[]>(INITIAL_NOTES)

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCourse, setNewTaskCourse] = useState('Türk Dili ve Edebiyatı')

  // New note form state
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCourse, setNewNoteCourse] = useState('Türk Dili ve Edebiyatı')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTasks(getStoredPlannerTasks())
      try {
        const rawNotes = localStorage.getItem('oxonom_student_notes_ercil')
        if (rawNotes) setNotes(JSON.parse(rawNotes))
      } catch (_) {}
    }
  }, [])

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    saveStoredPlannerTasks(updated)
  }

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id)
    setTasks(updated)
    saveStoredPlannerTasks(updated)
    toast.success('Görev silindi.')
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask: PlannerTask = {
      id: `pt-${Date.now()}`,
      title: newTaskTitle.trim(),
      course: newTaskCourse,
      dueDate: 'Bu Hafta',
      completed: false,
      priority: 'medium',
    }

    const updated = [newTask, ...tasks]
    setTasks(updated)
    saveStoredPlannerTasks(updated)
    setNewTaskTitle('')
    toast.success('Yeni görev eklendi!')
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return

    const newNote: StudentNote = {
      id: `sn-${Date.now()}`,
      title: newNoteTitle.trim(),
      course: newNoteCourse,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      content: newNoteContent.trim(),
    }

    const updated = [newNote, ...notes]
    setNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
    }
    setNewNoteTitle('')
    setNewNoteContent('')
    setIsAddingNote(false)
    toast.success('Ders notunuz kaydedildi!')
  }

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('oxonom_student_notes_ercil', JSON.stringify(updated))
    }
    toast.success('Not silindi.')
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <CalendarIcon size={14} />
            <span>Kişisel Çalışma Alanı</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Defterim ve Planlayıcım
            </h1>
            <MockBadge label="Mock Veri" />
          </div>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kişisel yapılacaklar listesi, ders not defteri ve haftalık akademik çalışma takvimi.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-[#131C31] border border-gray-200/80 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Görevlerim ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Not Defterim ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-[#0E1526] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Sınav Takvimi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Yapılacaklar & Kişisel Görevler */}
        {(activeTab === 'all' || activeTab === 'tasks') && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Kişisel Çalışma Görevleri
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400">
                {tasks.filter((t) => t.completed).length} / {tasks.length} Tamamlandı
              </span>
            </div>

            {/* Quick Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Yeni bir çalışma görevi ekleyin..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Ekle</span>
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-2 pt-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between gap-3 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center gap-3 min-w-0 text-left flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-cyan-600 border-cyan-600 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {task.completed && <CheckSquare size={13} />}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold ${
                          task.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{task.course}</span>
                        <span>·</span>
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Not Defterim */}
        {(activeTab === 'all' || activeTab === 'notes') && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Kişisel Ders Notlarım
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-500/20 transition-colors"
              >
                <Plus size={13} />
                <span>{isAddingNote ? 'Kapat' : 'Yeni Not'}</span>
              </button>
            </div>

            {/* New Note Form */}
            {isAddingNote && (
              <form
                onSubmit={handleAddNote}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200 dark:border-gray-800 space-y-3"
              >
                <input
                  type="text"
                  placeholder="Not Başlığı (örn: Hücre Bölünmesi Özeti)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <textarea
                  rows={3}
                  placeholder="Kişisel ders notunuzu buraya yazın..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1526] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/50 dark:border-gray-800/50 space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {note.course}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{note.date}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{note.title}</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM FULL-WIDTH: Sınav Takvimi */}
        {(activeTab === 'all' || activeTab === 'calendar') && (
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E1526] border border-gray-200/80 dark:border-gray-800/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-500" />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Akademik Değerlendirme Takvimi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {STUDENT_ASSESSMENTS.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#131C31] border border-gray-200/60 dark:border-gray-800/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{exam.courseName}</span>
                    <span>{exam.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                    {exam.title}
                  </h4>
                  <div className="text-[10px] text-gray-500 flex items-center justify-between">
                    <span>{exam.location}</span>
                    <span>{exam.durationMinutes} dk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
