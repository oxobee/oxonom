export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { CANONICAL_SCHOOL_EXAMS, SchoolExamItem } from '@/lib/teacher/teacherAgendaStorage'

let globalExamsState: SchoolExamItem[] = CANONICAL_SCHOOL_EXAMS

const TEMP_STORAGE_FILE = path.join('/tmp', 'oxonom_school_exams.json')

function loadFromTempFile() {
  try {
    if (fs.existsSync(TEMP_STORAGE_FILE)) {
      const data = fs.readFileSync(TEMP_STORAGE_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalExamsState = parsed
      }
    }
  } catch (_) {}
}

function saveToTempFile(data: SchoolExamItem[]) {
  try {
    fs.writeFileSync(TEMP_STORAGE_FILE, JSON.stringify(data), 'utf-8')
  } catch (_) {}
}

// Initial load
loadFromTempFile()

export async function GET(request: Request) {
  loadFromTempFile()

  const { searchParams } = new URL(request.url)
  const className = searchParams.get('className')

  let filtered = globalExamsState
  if (className && className !== 'all' && className !== 'Tüm Sınıflar') {
    filtered = globalExamsState.filter(
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
    loadFromTempFile()
    const body = await request.json()
    const { exam } = body

    if (!exam || !exam.title || !exam.courseName) {
      return NextResponse.json(
        { success: false, error: 'Eksik veya geçersiz sınav verisi' },
        { status: 400 }
      )
    }

    const existingIndex = globalExamsState.findIndex((e) => e.id === exam.id)
    if (existingIndex >= 0) {
      globalExamsState[existingIndex] = { ...globalExamsState[existingIndex], ...exam }
    } else {
      globalExamsState = [exam, ...globalExamsState]
    }

    saveToTempFile(globalExamsState)

    return NextResponse.json({
      success: true,
      message: 'Sınav başarıyla kaydedildi ve tüm öğrencilerin ekranlarına yansıtıldı.',
      exam,
      totalCount: globalExamsState.length,
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
    loadFromTempFile()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sınav ID belirtilmedi' }, { status: 400 })
    }

    globalExamsState = globalExamsState.filter((e) => e.id !== id)
    saveToTempFile(globalExamsState)

    return NextResponse.json({
      success: true,
      message: 'Sınav silindi.',
      totalCount: globalExamsState.length,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
