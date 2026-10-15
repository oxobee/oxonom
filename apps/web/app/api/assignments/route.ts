export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getPanoDb } from '@/lib/pano-pair/store'
import type { SchoolAssignmentItem, QuizQuestion } from '@/services/school_assignments/school_assignments'

const TEMP_STORAGE_FILE = path.join('/tmp', 'oxonom_school_assignments.json')
const BACKUP_STORAGE_FILE = path.join(process.cwd(), 'oxonom_school_assignments_backup.json')
const DELETED_IDS_FILE = path.join('/tmp', 'oxonom_deleted_assignment_ids.json')

export const CANONICAL_SCHOOL_ASSIGNMENTS: SchoolAssignmentItem[] = [
  {
    id: 1001,
    assignment_uuid: 'asg_dede_korkut_okuma',
    title: 'Dede Korkut Hikâyeleri Metin Tahlili & Karakter İncelemesi',
    description: 'Dede Korkut destanlarından "Dirse Han Oğlu Boğaç Han" boyunun ana fikri, olay örgüsü ve kültürel motiflerinin tahlili.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'READING',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-10-18T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-06T09:00:00',
    tool_data: {
      readingBook: 'Dede Korkut Kitabı',
      readingPages: 'Sayfa 15-42',
      readingQuestions: '1) Boğaç Han boyunun teması nedir? 2) Dirse Han ve hatununun fedakarlığı neyi simgeler?',
    },
  },
  {
    id: 1002,
    assignment_uuid: 'asg_edebi_sanatlar_tahta',
    title: 'Edebi Sanatlar & Teşbih-Mecaz Kavram Haritası Çizimi',
    description: 'Divan ve Halk edebiyatında kullanılan teşbih, istiare ve mecaz-ı mürsel sanatlarını gösteren interaktif kavram haritası.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_edebi_sanatlar_9a',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-10-20T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-08T10:00:00',
    tool_data: {
      whiteboardTopic: 'Teşbih, İstiare ve Mecaz Sanatları Şeması',
      whiteboardCanvasType: 'İnteraktif Çizim Tuvali',
    },
  },
  {
    id: 1003,
    assignment_uuid: 'asg_paragraf_anlam_test',
    title: 'Sözcükte Anlam & Paragrafta Ana Düşünce Değerlendirme Quiz',
    description: 'Çoktan seçmeli, doğru-yanlış, eşleştirme ve kısa cevaplı sorular içeren interaktif tarama testi.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Türk Dili ve Edebiyatı',
    tool_type: 'QUIZ',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-10-22T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-09T11:00:00',
    quiz_questions: [
      {
        id: 'q-1',
        questionNumber: 1,
        type: 'multiple_choice',
        prompt: '“Yazar, olayları bir kamera sessizliğiyle aktarmak yerine karakterlerinin iç dünyasındaki fırtınaları kelimelere dökmüştür.” Bu cümlede yazarın öne çıkan özelliği aşağıdakilerden hangisidir?',
        points: 25,
        options: [
          { id: 'A', label: 'A', text: 'Olayları kronolojik sırayla belgesel gibi aktarması' },
          { id: 'B', label: 'B', text: 'Ruhsal tahlil ve iç çatışmaları derinlemesine işlemesi' },
          { id: 'C', label: 'C', text: 'Sadece dış gözleme dayalı betimlemeler yapması' },
          { id: 'D', label: 'D', text: 'Mekân tasvirlerine odaklanıp insanı arka plana atması' },
        ],
        correctOptionId: 'B',
        explanation: 'Karakterlerin iç dünyasındaki fırtınalar, bireyin psikolojik ve ruhsal boyutunu derinlemesine ele almayı ifade eder.',
      },
      {
        id: 'q-2',
        questionNumber: 2,
        type: 'true_false',
        prompt: 'Dede Korkut Hikâyelerinde olağanüstü mitolojik motifler ile gerçekçi tarihsel unsurlar bir arada bulunur ve eser nazım-nesir (şiir-düzyazı) karışık olarak kaleme alınmıştır.',
        points: 25,
        correctBoolean: true,
        explanation: 'Dede Korkut destansı anlatılarında olaylar düzyazı, kahramanların duyguları ve yakarışları ise şiir biçimindedir.',
      },
      {
        id: 'q-3',
        questionNumber: 3,
        type: 'matching',
        prompt: 'Aşağıdaki edebi sanatları uygun şiir dizeleriyle eşleştiriniz.',
        points: 25,
        matchingPairs: [
          { id: 'm-1', left: 'Teşbih (Benzetme)', right: 'Kükremiş sel gibiyim, bendimi çiğner aşarım.' },
          { id: 'm-2', left: 'Teşhis (Kişileştirme)', right: 'Rüzgâr hüzünle fısıldıyordu kırık penceremde.' },
          { id: 'm-3', left: 'Tezat (Karşıtlık)', right: 'Ağlarım çağlar gibi, gülerim güller gibi.' },
        ],
        explanation: 'Kükremiş sel benzetme (teşbih), rüzgârın fısıldaması kişileştirme (teşhis), ağlamak-gülmek karşıtlık (tezat) sanatıdır.',
      },
      {
        id: 'q-4',
        questionNumber: 4,
        type: 'short_answer',
        prompt: 'Bir edebi metinde anlatıcının olayları her şeyi bilen, kahramanların geçmişini, geleceğini ve gizli düşüncelerini sezen bakış açısına ne ad verilir?',
        points: 25,
        sampleAnswer: 'İlahi (Hakim / Tanrısal) Bakış Açısı',
        explanation: 'Kahramanların aklından geçenleri ve geleceği bilen anlatıcı ilahi (tanrısal / hakim) bakış açısına sahiptir.',
      },
    ],
    tool_data: {
      quizQuestionCount: 4,
      quizDifficulty: 'Orta',
      quizQuestions: [
        {
          id: 'q-1',
          questionNumber: 1,
          type: 'multiple_choice',
          prompt: '“Yazar, olayları bir kamera sessizliğiyle aktarmak yerine karakterlerinin iç dünyasındaki fırtınaları kelimelere dökmüştür.” Bu cümlede yazarın öne çıkan özelliği aşağıdakilerden hangisidir?',
          points: 25,
          options: [
            { id: 'A', label: 'A', text: 'Olayları kronolojik sırayla belgesel gibi aktarması' },
            { id: 'B', label: 'B', text: 'Ruhsal tahlil ve iç çatışmaları derinlemesine işlemesi' },
            { id: 'C', label: 'C', text: 'Sadece dış gözleme dayalı betimlemeler yapması' },
            { id: 'D', label: 'D', text: 'Mekân tasvirlerine odaklanıp insanı arka plana atması' },
          ],
          correctOptionId: 'B',
          explanation: 'Karakterlerin iç dünyasındaki fırtınalar, bireyin psikolojik boyutunu ele almayı ifade eder.',
        },
        {
          id: 'q-2',
          questionNumber: 2,
          type: 'true_false',
          prompt: 'Dede Korkut Hikâyelerinde olağanüstü mitolojik motifler ile gerçekçi tarihsel unsurlar bir arada bulunur ve eser nazım-nesir (şiir-düzyazı) karışık olarak kaleme alınmıştır.',
          points: 25,
          correctBoolean: true,
          explanation: 'Dede Korkut anlatılarında olaylar düzyazı, duygular şiir biçimindedir.',
        },
        {
          id: 'q-3',
          questionNumber: 3,
          type: 'matching',
          prompt: 'Aşağıdaki edebi sanatları uygun şiir dizeleriyle eşleştiriniz.',
          points: 25,
          matchingPairs: [
            { id: 'm-1', left: 'Teşbih (Benzetme)', right: 'Kükremiş sel gibiyim, bendimi çiğner aşarım.' },
            { id: 'm-2', left: 'Teşhis (Kişileştirme)', right: 'Rüzgâr hüzünle fısıldıyordu kırık penceremde.' },
            { id: 'm-3', left: 'Tezat (Karşıtlık)', right: 'Ağlarım çağlar gibi, gülerim güller gibi.' },
          ],
          explanation: 'Kükremiş sel benzetme, rüzgârın fısıldaması kişileştirme, ağlamak-gülmek tezattır.',
        },
        {
          id: 'q-4',
          questionNumber: 4,
          type: 'short_answer',
          prompt: 'Bir edebi metinde anlatıcının olayları her şeyi bilen, kahramanların geçmişini, geleceğini ve gizli düşüncelerini sezen bakış açısına ne ad verilir?',
          points: 25,
          sampleAnswer: 'İlahi (Hakim / Tanrısal) Bakış Açısı',
          explanation: 'Kahramanların gizli düşüncelerini bilen anlatıcı ilahi bakış açısına sahiptir.',
        },
      ],
    },
  },
  {
    id: 1004,
    assignment_uuid: 'asg_kumeler_mantik_calisma',
    title: 'Kümeler, Önermeler ve Mantık Çalışma Föyü',
    description: 'Doğruluk tabloları ve küme işlemleri içeren analitik matematik çalışma föyü.',
    grade_level: '9. Sınıf',
    grade_category: 'Lise (9-12)',
    subject: 'Matematik',
    tool_type: 'WORKSHEET',
    classes: [{ id: 101, name: '9-A Şubesi', code: '9/A' }],
    due_date: '2026-10-24T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Ebru TEKNECİ',
    creation_date: '2026-10-10T14:00:00',
    tool_data: {
      attachedFileName: '9A_Matematik_Mantık_ve_Kümeler_Çalışma_Föyü.pdf',
    },
  },
]

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

function loadFromFile(): SchoolAssignmentItem[] | null {
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

function saveToFile(data: SchoolAssignmentItem[]) {
  try {
    fs.writeFileSync(TEMP_STORAGE_FILE, JSON.stringify(data), 'utf-8')
  } catch (_) {}
  try {
    fs.writeFileSync(BACKUP_STORAGE_FILE, JSON.stringify(data), 'utf-8')
  } catch (_) {}
}

async function getAssignmentsFromDatabase(): Promise<SchoolAssignmentItem[]> {
  try {
    const db = await getPanoDb()
    if (db) {
      const col = db.collection('school_assignments')
      const deletedCol = db.collection('deleted_assignment_ids')

      const [deletedDocs, count] = await Promise.all([
        deletedCol.find({}).toArray(),
        col.countDocuments(),
      ])

      const deletedIds = new Set(deletedDocs.map((d: any) => String(d.id)))

      // Seed canonically once if database has zero assignments AND zero deletions
      if (count === 0 && deletedDocs.length === 0) {
        await col.insertMany(CANONICAL_SCHOOL_ASSIGNMENTS.map((a) => ({ ...a })))
        saveToFile(CANONICAL_SCHOOL_ASSIGNMENTS)
        return CANONICAL_SCHOOL_ASSIGNMENTS
      }

      const docs = await col.find({}).toArray()
      const assignments: SchoolAssignmentItem[] = docs
        .filter((d: any) => !deletedIds.has(String(d.id)) && !deletedIds.has(String(d.assignment_uuid)))
        .map((d: any) => {
          const { _id, ...rest } = d
          return rest as SchoolAssignmentItem
        })

      saveToFile(assignments)
      return assignments
    }
  } catch (err: any) {
    console.warn('[api/assignments] MongoDB load error, fallback to file storage:', err?.message || err)
  }

  // File fallback
  const fileData = loadFromFile()
  const deletedIds = new Set(getLocalDeletedIds())
  if (fileData && fileData.length > 0) {
    return fileData.filter((a) => !deletedIds.has(String(a.id)) && !deletedIds.has(String(a.assignment_uuid)))
  }

  return CANONICAL_SCHOOL_ASSIGNMENTS.filter(
    (a) => !deletedIds.has(String(a.id)) && !deletedIds.has(String(a.assignment_uuid))
  )
}

export async function GET(request: Request) {
  const assignments = await getAssignmentsFromDatabase()

  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const toolType = searchParams.get('tool_type')

  let filtered = assignments
  if (subject && subject !== 'all') {
    filtered = filtered.filter((a) => a.subject === subject)
  }
  if (toolType && toolType !== 'all') {
    filtered = filtered.filter((a) => a.tool_type === toolType)
  }

  return NextResponse.json(
    {
      success: true,
      assignments: filtered,
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
    const { assignment, assignments } = body

    const itemsToSave: SchoolAssignmentItem[] = assignment
      ? [assignment]
      : Array.isArray(assignments)
      ? assignments
      : []

    if (itemsToSave.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Eksik veya geçersiz ödev verisi' },
        { status: 400 }
      )
    }

    try {
      const db = await getPanoDb()
      if (db) {
        const col = db.collection('school_assignments')
        const deletedCol = db.collection('deleted_assignment_ids')

        for (const item of itemsToSave) {
          const { _id, ...cleanItem } = item as any
          const searchKey = item.assignment_uuid
            ? { assignment_uuid: item.assignment_uuid }
            : { id: item.id }

          await col.updateOne(searchKey, { $set: cleanItem }, { upsert: true })
          if (item.id) await deletedCol.deleteOne({ id: String(item.id) })
          if (item.assignment_uuid) await deletedCol.deleteOne({ id: String(item.assignment_uuid) })
        }
      }
    } catch (dbErr: any) {
      console.warn('[api/assignments] MongoDB save error, fallback to file:', dbErr?.message || dbErr)
    }

    // Update local file storage
    const current = (loadFromFile() || []).filter(
      (e) => !itemsToSave.some((it) => it.id === e.id || it.assignment_uuid === e.assignment_uuid)
    )
    const updated = [...itemsToSave, ...current]
    saveToFile(updated)

    // Unmark from local deleted ids
    const localDeleted = getLocalDeletedIds().filter(
      (id) => !itemsToSave.some((it) => String(it.id) === id || it.assignment_uuid === id)
    )
    saveLocalDeletedIds(localDeleted)

    return NextResponse.json({
      success: true,
      message: 'Ödev veritabanına başarıyla kaydedildi ve tüm öğrencilerin ekranlarına yansıtıldı.',
      assignment: itemsToSave[0],
      assignments: updated,
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
      return NextResponse.json({ success: false, error: 'Ödev ID belirtilmedi' }, { status: 400 })
    }

    try {
      const db = await getPanoDb()
      if (db) {
        const col = db.collection('school_assignments')
        const deletedCol = db.collection('deleted_assignment_ids')

        await col.deleteMany({
          $or: [{ id: isNaN(Number(id)) ? -1 : Number(id) }, { assignment_uuid: id }],
        })
        await deletedCol.updateOne(
          { id },
          { $set: { id, deletedAt: new Date().toISOString() } },
          { upsert: true }
        )
      }
    } catch (dbErr: any) {
      console.warn('[api/assignments] MongoDB delete error, fallback to file:', dbErr?.message || dbErr)
    }

    // Update local deleted IDs
    const localDeleted = getLocalDeletedIds()
    if (!localDeleted.includes(id)) {
      localDeleted.push(id)
      saveLocalDeletedIds(localDeleted)
    }

    // Update local file storage
    const current = loadFromFile() || []
    const updated = current.filter((e) => String(e.id) !== id && e.assignment_uuid !== id)
    saveToFile(updated)

    return NextResponse.json({
      success: true,
      message: 'Ödev veritabanından kalıcı olarak silindi ve öğrenci ekranlarından kaldırıldı.',
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
