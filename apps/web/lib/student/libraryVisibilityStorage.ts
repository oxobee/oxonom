/**
 * Oxonom EDU — Kitaplık Müfredat Görünürlük Yönetimi
 * Müdürün belirlediği sınıf ve kitap bazlı görünürlük kurallarını yönetir.
 * Kural: Müdürün istemediği kitaplar listelenmez (Arapça ve Kur'an-ı Kerim varsayılan olarak gizlidir).
 */

import { MEB_TEXTBOOKS_CATALOG, type MebBookItem } from '@/lib/student/mebBooksData'

const STORAGE_KEY_HIDDEN_BOOKS = 'oxonom_principal_hidden_book_ids'
const STORAGE_KEY_CLASS_VISIBILITY = 'oxonom_principal_class_hidden_books'

// Varsayılan gizlenecek anahtar kelimeler: Arapça ve Kur'an-ı Kerim
export const DEFAULT_HIDDEN_KEYWORDS = [
  'arapça',
  'arapca',
  "kur'an",
  'kuran',
  'kur’an',
  "kur'an-ı kerim",
  "kur’an-ı kerim",
  'mesleki arapça',
]

/**
 * Başlık veya derse göre kitabın varsayılan gizli listesinde olup olmadığını kontrol eder.
 */
export function isDefaultHiddenBook(book: MebBookItem): boolean {
  const title = (book.title || '').toLowerCase()
  const subject = (book.subject || '').toLowerCase()

  return DEFAULT_HIDDEN_KEYWORDS.some(
    (kw) => title.includes(kw) || subject.includes(kw)
  )
}

/**
 * Varsayılan gizli kitap ID'lerini üretir (Arapça ve Kur'an-ı Kerim kitapları)
 */
export function getDefaultHiddenBookIds(): number[] {
  return MEB_TEXTBOOKS_CATALOG.filter(isDefaultHiddenBook).map((b) => b.id)
}

/**
 * Tüm gizli kitap ID'lerini döner.
 * İlk defa çağrılıyorsa varsayılan listeyi (Arapça & Kur'an) kaydeder ve döner.
 */
export function getHiddenBookIds(): number[] {
  if (typeof window === 'undefined') {
    return getDefaultHiddenBookIds()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_HIDDEN_BOOKS)
    if (!raw) {
      const defaults = getDefaultHiddenBookIds()
      localStorage.setItem(STORAGE_KEY_HIDDEN_BOOKS, JSON.stringify(defaults))
      return defaults
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : getDefaultHiddenBookIds()
  } catch {
    return getDefaultHiddenBookIds()
  }
}

/**
 * Sınıf bazında gizli kitap ID'lerini döner.
 */
export function getClassHiddenBookIds(gradeName?: string): number[] {
  const globalHidden = getHiddenBookIds()
  if (!gradeName || gradeName === 'all' || typeof window === 'undefined') {
    return globalHidden
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASS_VISIBILITY)
    if (!raw) return globalHidden
    const parsed: Record<string, number[]> = JSON.parse(raw)
    const classSpecific = parsed[gradeName]
    if (Array.isArray(classSpecific)) {
      // Birleşim: Hem global gizliler hem bu sınıfa özel gizliler
      const set = new Set([...globalHidden, ...classSpecific])
      return Array.from(set)
    }
    return globalHidden
  } catch {
    return globalHidden
  }
}

/**
 * Bir kitabın öğrenciye gösterilip gösterilmeyeceğini kontrol eder.
 */
export function isBookVisibleForStudent(bookId: number, gradeName?: string): boolean {
  const hiddenIds = getClassHiddenBookIds(gradeName)
  return !hiddenIds.includes(bookId)
}

/**
 * Tek bir kitabın görünürlüğünü günceller.
 */
export function setBookVisibility(bookId: number, isVisible: boolean, gradeName?: string): void {
  if (typeof window === 'undefined') return

  const currentHidden = getHiddenBookIds()
  let updatedHidden: number[]

  if (isVisible) {
    // Görünür yap -> gizli listesinden çıkar
    updatedHidden = currentHidden.filter((id) => id !== bookId)
  } else {
    // Gizle -> gizli listesine ekle
    if (!currentHidden.includes(bookId)) {
      updatedHidden = [...currentHidden, bookId]
    } else {
      updatedHidden = currentHidden
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_HIDDEN_BOOKS, JSON.stringify(updatedHidden))

    // Sınıf bazlı özel kayıt da varsa güncelle
    if (gradeName && gradeName !== 'all') {
      const rawClass = localStorage.getItem(STORAGE_KEY_CLASS_VISIBILITY)
      const classMap: Record<string, number[]> = rawClass ? JSON.parse(rawClass) : {}
      const classList = classMap[gradeName] || []
      if (isVisible) {
        classMap[gradeName] = classList.filter((id) => id !== bookId)
      } else {
        if (!classList.includes(bookId)) classMap[gradeName] = [...classList, bookId]
      }
      localStorage.setItem(STORAGE_KEY_CLASS_VISIBILITY, JSON.stringify(classMap))
    }

    // Olay yay
    window.dispatchEvent(
      new CustomEvent('oxonom_library_visibility_updated', {
        detail: { bookId, isVisible, gradeName },
      })
    )
    window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEY_HIDDEN_BOOKS } }))
  } catch (err) {
    console.error('Failed to update book visibility:', err)
  }
}

/**
 * Tek bir kitabın görünürlüğünü tersine çevirir (toggle).
 */
export function toggleBookVisibility(bookId: number, gradeName?: string): boolean {
  const currentlyVisible = isBookVisibleForStudent(bookId, gradeName)
  const nextVisible = !currentlyVisible
  setBookVisibility(bookId, nextVisible, gradeName)
  return nextVisible
}

/**
 * Belirli bir sınıfın veya listenin tüm kitaplarını topluca göster/gizle yapar.
 */
export function setMultipleBooksVisibility(
  bookIds: number[],
  isVisible: boolean,
  gradeName?: string
): void {
  if (typeof window === 'undefined') return

  const currentHidden = new Set(getHiddenBookIds())

  bookIds.forEach((id) => {
    if (isVisible) {
      currentHidden.delete(id)
    } else {
      currentHidden.add(id)
    }
  })

  const updatedArray = Array.from(currentHidden)
  try {
    localStorage.setItem(STORAGE_KEY_HIDDEN_BOOKS, JSON.stringify(updatedArray))

    if (gradeName && gradeName !== 'all') {
      const rawClass = localStorage.getItem(STORAGE_KEY_CLASS_VISIBILITY)
      const classMap: Record<string, number[]> = rawClass ? JSON.parse(rawClass) : {}
      const classSet = new Set(classMap[gradeName] || [])
      bookIds.forEach((id) => {
        if (isVisible) classSet.delete(id)
        else classSet.add(id)
      })
      classMap[gradeName] = Array.from(classSet)
      localStorage.setItem(STORAGE_KEY_CLASS_VISIBILITY, JSON.stringify(classMap))
    }

    window.dispatchEvent(new CustomEvent('oxonom_library_visibility_updated'))
    window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEY_HIDDEN_BOOKS } }))
  } catch (err) {
    console.error('Failed to update multiple books visibility:', err)
  }
}

/**
 * Görünürlük ayarlarını varsayılana sıfırlar (Arapça & Kur'an gizli, diğerleri açık)
 */
export function resetToDefaultVisibility(): void {
  if (typeof window === 'undefined') return
  const defaults = getDefaultHiddenBookIds()
  try {
    localStorage.setItem(STORAGE_KEY_HIDDEN_BOOKS, JSON.stringify(defaults))
    localStorage.removeItem(STORAGE_KEY_CLASS_VISIBILITY)
    window.dispatchEvent(new CustomEvent('oxonom_library_visibility_updated'))
    window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEY_HIDDEN_BOOKS } }))
  } catch (err) {
    console.error('Failed to reset library visibility:', err)
  }
}
