// Oxonom EDU — Real Classroom Daily Attendance Service with Date History

export interface AttendanceRecord {
  date: string
  classCode: string
  taken: boolean
  updatedAt: string
  records: Record<string, 'present' | 'absent'>
  totalCount: number
  presentCount: number
  absentCount: number
}

const STORAGE_PREFIX = 'oxonom_daily_attendance_'
const INDEX_KEY = 'oxonom_daily_attendance_history_index'

export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTurkish(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    })
  } catch (_) {
    return dateStr
  }
}

export function getAttendanceForClass(
  classCode: string,
  dateStr: string = getTodayDateString()
): AttendanceRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${classCode}_${dateStr}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

export function saveAttendanceForClass(
  classCode: string,
  records: Record<string, 'present' | 'absent'>,
  totalStudents: number,
  dateStr: string = getTodayDateString()
): AttendanceRecord {
  let presentCount = 0
  let absentCount = 0

  Object.values(records).forEach((status) => {
    if (status === 'present') presentCount++
    else if (status === 'absent') absentCount++
  })

  // Any student not explicitly marked is counted as present by default if not set
  if (presentCount + absentCount < totalStudents) {
    presentCount = totalStudents - absentCount
  }

  const record: AttendanceRecord = {
    date: dateStr,
    classCode,
    taken: true,
    updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    records,
    totalCount: totalStudents,
    presentCount,
    absentCount,
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${classCode}_${dateStr}`, JSON.stringify(record))

      // Update Index
      const existingHistory = getAllAttendanceHistory()
      const filtered = existingHistory.filter(
        (h) => !(h.classCode === classCode && h.date === dateStr)
      )
      const updated = [record, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
      localStorage.setItem(INDEX_KEY, JSON.stringify(updated))

      window.dispatchEvent(
        new CustomEvent('oxonom_attendance_updated', {
          detail: { classCode, date: dateStr, record },
        })
      )
    } catch (_) {}
  }

  return record
}

// Initial realistic attendance history records
const SEED_HISTORY: AttendanceRecord[] = [
  {
    date: '2026-10-09',
    classCode: '9-A Şubesi',
    taken: true,
    updatedAt: '08:45',
    records: { 's-1': 'present' },
    totalCount: 1,
    presentCount: 1,
    absentCount: 0,
  },
  {
    date: '2026-10-08',
    classCode: '9-A Şubesi',
    taken: true,
    updatedAt: '08:40',
    records: { 's-1': 'present' },
    totalCount: 1,
    presentCount: 1,
    absentCount: 0,
  },
  {
    date: '2026-10-07',
    classCode: '9-A Şubesi',
    taken: true,
    updatedAt: '08:42',
    records: { 's-1': 'present' },
    totalCount: 1,
    presentCount: 1,
    absentCount: 0,
  },
]

export function getAllAttendanceHistory(classCode?: string): AttendanceRecord[] {
  if (typeof window === 'undefined') return SEED_HISTORY
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    let history: AttendanceRecord[] = []
    if (raw) {
      history = JSON.parse(raw)
    } else {
      history = SEED_HISTORY
      localStorage.setItem(INDEX_KEY, JSON.stringify(SEED_HISTORY))
    }

    if (classCode && classCode !== 'all') {
      return history.filter(
        (h) => h.classCode === classCode || h.classCode.startsWith(classCode.slice(0, 3))
      )
    }
    return history
  } catch (_) {
    return SEED_HISTORY
  }
}
