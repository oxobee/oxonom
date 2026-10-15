/**
 * Oxonom Edu — Öğrenci Kitaplık ve E-Kitap Okuyucu Veri Yönetimi
 * Okuma ilerlemesi, yer işaretleri, kitap notları (Defterim) ve okuma planları (Planlayıcım)
 */

import { type StudentNote } from '@/components/Student/views/StudentPlannerView'
import { type PlannerTask, getStoredPlannerTasks } from '@/lib/student/studentData'

export interface BookReadingProgress {
  bookId: number
  currentPage: number
  totalPages: number
  percent: number
  status: 'not_started' | 'in_progress' | 'completed'
  lastReadAt: string
}

export interface BookBookmark {
  id: string
  bookId: number
  bookTitle: string
  pageNumber: number
  title?: string
  createdAt: string
}

export interface BookNoteItem {
  id: string
  bookId: number
  bookTitle: string
  course: string
  pageNumber: number
  title: string
  content: string
  color?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEYS = {
  PROGRESS: 'oxonom_student_reading_progress_ercil',
  FAVORITES: 'oxonom_student_book_favorites_ercil',
  READ_LATER: 'oxonom_student_book_readlater_ercil',
  BOOKMARKS: 'oxonom_student_book_bookmarks_ercil',
  NOTES: 'oxonom_student_notes_ercil',
  PLANNER_TASKS: 'oxonom_student_planner_tasks_ercil',
}

// ── 1. OKUMA İLERLEMESİ (Reading Progress) ──
export function getAllReadingProgress(): Record<number, BookReadingProgress> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getBookReadingProgress(bookId: number): BookReadingProgress | null {
  const all = getAllReadingProgress()
  return all[bookId] || null
}

export function saveBookReadingProgress(
  bookId: number,
  currentPage: number,
  totalPages: number = 100
): BookReadingProgress {
  if (typeof window === 'undefined') {
    return {
      bookId,
      currentPage,
      totalPages,
      percent: Math.round((currentPage / totalPages) * 100),
      status: currentPage >= totalPages ? 'completed' : 'in_progress',
      lastReadAt: new Date().toISOString(),
    }
  }

  const all = getAllReadingProgress()
  const validTotal = Math.max(1, totalPages)
  const validPage = Math.min(Math.max(1, currentPage), validTotal)
  const percent = Math.min(100, Math.round((validPage / validTotal) * 100))
  const status: 'not_started' | 'in_progress' | 'completed' =
    percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started'

  const updated: BookReadingProgress = {
    bookId,
    currentPage: validPage,
    totalPages: validTotal,
    percent,
    status,
    lastReadAt: new Date().toISOString(),
  }

  all[bookId] = updated
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all))
    window.dispatchEvent(new CustomEvent('oxonom_reading_progress_updated', { detail: updated }))
  } catch (err) {
    console.warn('Failed to save reading progress:', err)
  }

  return updated
}

// ── 2. FAVORİLER & DAHA SONRA OKU ──
export function getFavoriteBookIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleBookFavorite(bookId: number): boolean {
  if (typeof window === 'undefined') return false
  const current = getFavoriteBookIds()
  const exists = current.includes(bookId)
  const updated = exists ? current.filter((id) => id !== bookId) : [...current, bookId]
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_book_favorites_updated', { detail: updated }))
  } catch {}
  return !exists
}

export function getReadLaterBookIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READ_LATER)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleBookReadLater(bookId: number): boolean {
  if (typeof window === 'undefined') return false
  const current = getReadLaterBookIds()
  const exists = current.includes(bookId)
  const updated = exists ? current.filter((id) => id !== bookId) : [...current, bookId]
  try {
    localStorage.setItem(STORAGE_KEYS.READ_LATER, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_book_readlater_updated', { detail: updated }))
  } catch {}
  return !exists
}

// ── 3. YER İŞARETLERİ (Bookmarks) ──
export function getBookBookmarks(bookId?: number): BookBookmark[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    const list: BookBookmark[] = raw ? JSON.parse(raw) : []
    return bookId ? list.filter((b) => b.bookId === bookId) : list
  } catch {
    return []
  }
}

export function addBookmark(
  bookId: number,
  bookTitle: string,
  pageNumber: number,
  title?: string
): BookBookmark {
  const current = getBookBookmarks()
  // Avoid duplicate bookmark on same page
  const existing = current.find((b) => b.bookId === bookId && b.pageNumber === pageNumber)
  if (existing) return existing

  const newBookmark: BookBookmark = {
    id: `bm-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    bookId,
    bookTitle,
    pageNumber,
    title: title || `${bookTitle} — Sayfa ${pageNumber}`,
    createdAt: new Date().toLocaleDateString('tr-TR'),
  }

  const updated = [newBookmark, ...current]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_book_bookmarks_updated', { detail: updated }))
    } catch {}
  }
  return newBookmark
}

export function removeBookmark(bookmarkId: string): void {
  if (typeof window === 'undefined') return
  const current = getBookBookmarks()
  const updated = current.filter((b) => b.id !== bookmarkId)
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_book_bookmarks_updated', { detail: updated }))
  } catch {}
}

export function togglePageBookmark(
  bookId: number,
  bookTitle: string,
  pageNumber: number
): boolean {
  const current = getBookBookmarks(bookId)
  const existing = current.find((b) => b.pageNumber === pageNumber)
  if (existing) {
    removeBookmark(existing.id)
    return false
  } else {
    addBookmark(bookId, bookTitle, pageNumber)
    return true
  }
}

// ── 4. DEFTERİM İLE ENTEGRE NOTLAR (Book Notes <-> Defterim) ──
export function getStoredStudentNotes(): StudentNote[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getBookNotes(bookId: number): StudentNote[] {
  const all = getStoredStudentNotes()
  return all.filter((n: any) => n.bookId === bookId || n.bookId === String(bookId))
}

export function saveBookNoteToDefterim(params: {
  bookId: number
  bookTitle: string
  course: string
  pageNumber: number
  title: string
  content: string
}): StudentNote {
  const current = getStoredStudentNotes()
  const now = new Date()
  const dateStr = `${now.getDate()} ${now.toLocaleString('tr-TR', { month: 'long' })} ${now.getFullYear()}`

  const newNote: StudentNote & { bookId: number; bookTitle: string; pageNumber: number } = {
    id: `note-book-${Date.now()}`,
    title: params.title.trim() || `${params.bookTitle} — Sayfa ${params.pageNumber} Notu`,
    course: params.course || 'Türk Dili ve Edebiyatı',
    date: dateStr,
    content: params.content.trim(),
    bookId: params.bookId,
    bookTitle: params.bookTitle,
    pageNumber: params.pageNumber,
  }

  const updated = [newNote, ...current]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_notes_updated', { detail: updated }))
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEYS.NOTES } }))
    } catch (err) {
      console.warn('Failed to save book note:', err)
    }
  }

  return newNote
}

export function deleteBookNoteFromDefterim(noteId: string): void {
  if (typeof window === 'undefined') return
  const current = getStoredStudentNotes()
  const updated = current.filter((n) => n.id !== noteId)
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('oxonom_student_notes_updated', { detail: updated }))
    window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEYS.NOTES } }))
  } catch {}
}

// ── 5. PLANLAYICIM İLE ENTEGRE OKUMA GÖREVİ (Reading Task <-> Planlayıcım) ──
export function addReadingGoalToPlanner(params: {
  bookId: number
  bookTitle: string
  course: string
  pageStart?: number
  pageEnd?: number
  dueDateLabel?: string
}): PlannerTask {
  const current = getStoredPlannerTasks()
  const rangeLabel =
    params.pageStart && params.pageEnd
      ? `${params.pageStart}–${params.pageEnd}. sayfaları oku`
      : 'Bölüm okumasını tamamla'

  const newTask: PlannerTask & { bookId: number; bookTitle: string; pageNumber?: number } = {
    id: `pt-book-${Date.now()}`,
    title: `${params.bookTitle}, ${rangeLabel}`,
    course: params.course || 'Türk Dili ve Edebiyatı',
    dueDate: params.dueDateLabel || 'Yarın',
    completed: false,
    priority: 'high',
    bookId: params.bookId,
    bookTitle: params.bookTitle,
    pageNumber: params.pageStart || 1,
  }

  const updated = [newTask, ...current]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANNER_TASKS, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('oxonom_student_planner_tasks_updated', { detail: updated }))
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEYS.PLANNER_TASKS } }))
    } catch (err) {
      console.warn('Failed to save reading goal to planner:', err)
    }
  }

  return newTask
}
