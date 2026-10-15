export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { CANONICAL_SCHOOL_EXAMS, SchoolExamItem } from '@/lib/teacher/teacherAgendaStorage'
import { getPanoDb } from '@/lib/pano-pair/store'

const TEMP_STORAGE_FILE = path.join('/tmp', 'oxonom_school_exams.json')
const BACKUP_STORAGE_FILE = path.join(process.cwd(), 'oxonom_school_exams_backup.json')
const DELETED_IDS_FILE = path.join('/tmp', 'oxonom_deleted_exam_ids.json')

let memoryExamsCache: SchoolExamItem[] | null = null

function getLocalDeletedIds(): string[] {
  try {
    if (fs.existsSync(DELETED_IDS_FILE)) {
      const data = fs.readFileSync(DELETED_IDS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function saveLocalDeletedIds(ids: string[]) {
  try {
    fs.writeFileSync(DELETED_IDS_FILE, JSON.stringify(ids), 'utf-8')
  } catch (_) {}
}

function loadFromFile(): SchoolExamItem[] | null {
  try {
    if (fs.existsSync(TEMP_STORAGE_FILE)) {
      const data = fs.readFileSync(TEMP_STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
    if (fs.existsSync(BACKUP_STORAGE_FILE)) {
      const data = fs.readFileSync(BACKUP_STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return null
}

function saveToFile(data: SchoolExamItem[]) {
  try {
    fs.writeFileSync(TEMP_STORAGE_FILE, JSON.stringify(data), 'utf-8')
  } catch (_) {}
  try {
    fs.writeFileSync(BACKUP_STORAGE_FILE, JSON.stringify(data), 'utf-8')
  } catch (_) {}
  memoryExamsCache = data
}

async function getExamsFromDatabase(): Promise<SchoolExamItem[]> {
  try {
    const db = await getPanoDb()
    if (db) {
      const examsCol = db.collection('school_exams')
      const deletedCol = db.collection('deleted_exam_ids')

      const [deletedDocs, count] = await Promise.all([
        deletedCol.find({}).toArray(),
        examsCol.countDocuments(),
      ])

      const deletedIds = new Set(deletedDocs.map((d: any) => d.id))

      // Only seed canonically once if database has ZERO exams AND ZERO deletions
      if (count === 0 && deletedDocs.length === 0) {
        const initialExams = CANONICAL_SCHOOL_EXAMS.map((e) => ({
          ...e,
          scores: {},
          status: 'upcoming' as const,
        }))
        await examsCol.insertMany(initialExams.map((e) => ({ ...e })))
        saveToFile(initialExams)
        return initialExams
      }

      const docs = await examsCol.find({}).toArray()
      const exams: SchoolExamItem[] = docs
        .filter((d: any) => !deletedIds.has(d.id))
        .map((d: any) => {
          const { _id, ...rest } = d
          return rest as SchoolExamItem
        })

      saveToFile(exams)
      return exams
    }
  } catch (err: any) {
    console.warn('[api/exams] MongoDB load error, fallback to file storage:', err?.message || err)
  }

  // File fallback
  const fileExams = loadFromFile()
  const deletedIds = getLocalDeletedIds()
  if (fileExams !== null) {
    const filtered = fileExams.filter((e) => !deletedIds.includes(e.id))
    memoryExamsCache = filtered
    return filtered
  }

  // Initial fallback
  const initial = CANONICAL_SCHOOL_EXAMS.filter((e) => !deletedIds.includes(e.id)).map((e) => ({
    ...e,
    scores: {},
    status: 'upcoming' as const,
  }))
  saveToFile(initial)
  return initial
}

export async function GET(request: Request) {
  const exams = await getExamsFromDatabase()

  const { searchParams } = new URL(request.url)
  const className = searchParams.get('className')

  let filtered = exams
  if (className && className !== 'all' && className !== 'Tüm Sınıflar') {
    filtered = exams.filter(
      (e) => e.className === className || e.className === 'Tüm Sınıflar'
    )
  }

  return NextResponse.json(
    {
      success: true,
      exams: filtered,
      totalCount: filtered.length,
      updatedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { exam, exams } = body

    const itemsToSave: SchoolExamItem[] = exam ? [exam] : Array.isArray(exams) ? exams : []

    if (itemsToSave.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Eksik veya geçersiz sınav verisi' },
        { status: 400 }
      )
    }

    try {
      const db = await getPanoDb()
      if (db) {
        const examsCol = db.collection('school_exams')
        const deletedCol = db.collection('deleted_exam_ids')

        for (const item of itemsToSave) {
          const { _id, ...cleanItem } = item as any
          await examsCol.updateOne(
            { id: item.id },
            { $set: cleanItem },
            { upsert: true }
          )
          await deletedCol.deleteOne({ id: item.id })
        }
      }
    } catch (dbErr: any) {
      console.warn('[api/exams] MongoDB save error, fallback to file:', dbErr?.message || dbErr)
    }

    // Update local file storage
    const current = (loadFromFile() || []).filter((e) => !itemsToSave.some((it) => it.id === e.id))
    const updated = [...itemsToSave, ...current]
    saveToFile(updated)

    // Unmark from local deleted ids
    const localDeleted = getLocalDeletedIds().filter((id) => !itemsToSave.some((it) => it.id === id))
    saveLocalDeletedIds(localDeleted)

    return NextResponse.json({
      success: true,
      message: 'Sınav veritabanına başarıyla kaydedildi ve tüm öğrencilerin ekranlarına yansıtıldı.',
      exam: itemsToSave[0],
      exams: updated,
      totalCount: updated.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sınav ID belirtilmedi' }, { status: 400 })
    }

    try {
      const db = await getPanoDb()
      if (db) {
        const examsCol = db.collection('school_exams')
        const deletedCol = db.collection('deleted_exam_ids')

        await examsCol.deleteOne({ id })
        await deletedCol.updateOne(
          { id },
          { $set: { id, deletedAt: new Date().toISOString() } },
          { upsert: true }
        )
      }
    } catch (dbErr: any) {
      console.warn('[api/exams] MongoDB delete error, fallback to file:', dbErr?.message || dbErr)
    }

    // Update local deleted IDs
    const localDeleted = getLocalDeletedIds()
    if (!localDeleted.includes(id)) {
      localDeleted.push(id)
      saveLocalDeletedIds(localDeleted)
    }

    // Update local file storage
    const current = loadFromFile() || []
    const updated = current.filter((e) => e.id !== id)
    saveToFile(updated)

    return NextResponse.json({
      success: true,
      message: 'Sınav veritabanından kalıcı olarak silindi.',
      deletedId: id,
      totalCount: updated.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
