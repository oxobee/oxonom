/**
 * Client-side Storage for Custom Game HTML Files
 *
 * Utilizes IndexedDB for virtually unlimited storage of large HTML5 games,
 * with memory caching and fallback to sessionStorage/localStorage.
 */

const DB_NAME = 'oxonom_games_db'
const DB_VERSION = 1
const STORE_NAME = 'game_htmls'

const memoryCache = new Map<string, string>()

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        resolve(null)
      }
    } catch (_) {
      resolve(null)
    }
  })
}

/**
 * Save custom game HTML for one or multiple keys (e.g. uuid, slug, id).
 */
export async function saveCustomGameHtml(
  keys: (string | number | undefined | null)[] | string | number,
  html: string
): Promise<void> {
  if (!html || typeof window === 'undefined') return

  const keyList = (Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .map((k) => String(k).trim())

  if (keyList.length === 0) return

  // 1. Update memory cache
  for (const k of keyList) {
    memoryCache.set(k, html)
  }

  // 2. Save to sessionStorage / localStorage if quota permits
  for (const k of keyList) {
    try {
      sessionStorage.setItem(`game_html_${k}`, html)
    } catch (_) {}
    try {
      localStorage.setItem(`game_html_${k}`, html)
    } catch (_) {}
  }

  // 3. Save to IndexedDB (no quota limit)
  const db = await openDatabase()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      for (const k of keyList) {
        store.put(html, k)
      }
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    } catch (_) {
      resolve()
    }
  })
}

/**
 * Retrieve custom game HTML by trying one or more identifiers.
 */
export async function getCustomGameHtml(
  keys: (string | number | undefined | null)[] | string | number
): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const keyList = (Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .map((k) => String(k).trim())

  if (keyList.length === 0) return null

  // 1. Check memory cache
  for (const k of keyList) {
    const val = memoryCache.get(k)
    if (val && val.trim().length > 0) return val
  }

  // 2. Check sessionStorage
  for (const k of keyList) {
    try {
      const val = sessionStorage.getItem(`game_html_${k}`)
      if (val && val.trim().length > 0) {
        memoryCache.set(k, val)
        return val
      }
    } catch (_) {}
  }

  // 3. Check localStorage
  for (const k of keyList) {
    try {
      const val = localStorage.getItem(`game_html_${k}`)
      if (val && val.trim().length > 0) {
        memoryCache.set(k, val)
        return val
      }
    } catch (_) {}
  }

  // 4. Check IndexedDB
  const db = await openDatabase()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)

      let found = false
      let completed = 0

      for (const k of keyList) {
        const req = store.get(k)
        req.onsuccess = () => {
          completed++
          if (!found && req.result && typeof req.result === 'string' && req.result.trim().length > 0) {
            found = true
            memoryCache.set(k, req.result)
            db.close()
            resolve(req.result)
          } else if (completed === keyList.length && !found) {
            db.close()
            resolve(null)
          }
        }
        req.onerror = () => {
          completed++
          if (completed === keyList.length && !found) {
            db.close()
            resolve(null)
          }
        }
      }
    } catch (_) {
      resolve(null)
    }
  })
}

/**
 * Delete custom game HTML by key(s).
 */
export async function removeCustomGameHtml(
  keys: (string | number | undefined | null)[] | string | number
): Promise<void> {
  if (typeof window === 'undefined') return

  const keyList = (Array.isArray(keys) ? keys : [keys])
    .filter(Boolean)
    .map((k) => String(k).trim())

  for (const k of keyList) {
    memoryCache.delete(k)
    try {
      sessionStorage.removeItem(`game_html_${k}`)
    } catch (_) {}
    try {
      localStorage.removeItem(`game_html_${k}`)
    } catch (_) {}
  }

  const db = await openDatabase()
  if (!db) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      for (const k of keyList) {
        store.delete(k)
      }
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    } catch (_) {
      resolve()
    }
  })
}
