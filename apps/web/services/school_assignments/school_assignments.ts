import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'
import { generateAssignmentSubmissionsData } from '@services/demo/schoolDirectory'

export interface SchoolAssignmentItem {
  id: number
  assignment_uuid: string
  title: string
  description?: string
  grade_level: string
  grade_category: string
  subject: string
  tool_type: 'WHITEBOARD' | 'WORKSHEET' | 'QUIZ' | 'READING' | 'PROJECT'
  tool_data?: Record<string, any>
  board_uuid?: string
  usergroup_ids?: number[]
  classes?: { id: number; name: string; code?: string }[]
  due_date?: string
  max_score: number
  published: boolean
  created_by?: number
  teacher_name?: string
  creation_date?: string
  total_submissions?: number
  graded_submissions?: number
  average_score?: number | null
  submission?: {
    id: number | null
    status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
    submission_date?: string | null
    student_content?: Record<string, any>
    score?: number | null
    teacher_feedback?: string | null
    graded_at?: string | null
  }
}

export interface StudentSubmissionRow {
  user_id: number
  name: string
  username: string
  avatar_image?: string
  classroom_name: string
  classroom_id: number
  submission_id?: number | null
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE'
  submission_date?: string | null
  student_content?: Record<string, any>
  score?: number | null
  teacher_feedback?: string | null
  graded_at?: string | null
}

export interface SubmissionsResponse {
  assignment: SchoolAssignmentItem
  total_students: number
  submitted_count: number
  graded_count: number
  students: StudentSubmissionRow[]
}

export async function createSchoolAssignment(
  orgId: number,
  data: {
    title: string
    description?: string
    grade_level: string
    grade_category: string
    subject: string
    tool_type: string
    tool_data?: Record<string, any>
    board_uuid?: string
    create_new_board?: boolean
    new_board_name?: string
    usergroup_ids: number[]
    due_date?: string
    max_score?: number
    published?: boolean
  },
  accessToken: string
) {
  const result = await fetch(
    `${getAPIUrl()}school_assignments/org/${orgId}`,
    RequestBodyWithAuthHeader('POST', data, null, accessToken)
  )
  return errorHandling(result)
}

export const DEFAULT_SCHOOL_ASSIGNMENTS: SchoolAssignmentItem[] = [
  {
    id: 101,
    assignment_uuid: 'asg_ritmik_sayma_01',
    title: '1-A Matematik: Ritmik Sayma & Sayı Doğrusu Etkinliği',
    description: '1’er ve 2’şer ileriye doğru ritmik sayma kurallarını sayı doğrusunda zıplayarak tamamlayınız.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_6be7ebed-4c00-4243-9a9b-ffef9933803b',
    due_date: '2026-10-15T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 28,
    graded_submissions: 26,
    average_score: 94,
    submission: {
      id: 501,
      status: 'SUBMITTED',
      submission_date: '2026-10-02T14:30:00',
      score: 95,
      teacher_feedback: 'Harika bir çalışma Erçil Evren, tebrikler!',
    },
  },
  {
    id: 102,
    assignment_uuid: 'asg_hizli_okuma_02',
    title: '1-A Türkçe: 1 Dk Hızlı Okuma & Kelime Sayacı Çalışması',
    description: 'Verilen metni 1 dakika boyunca sesli okuyarak kelime sayacını başlatınız ve puanınızı kaydediniz.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Türkçe',
    tool_type: 'READING',
    due_date: '2026-10-16T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 26,
    graded_submissions: 24,
    average_score: 92,
    submission: {
      id: 502,
      status: 'SUBMITTED',
      submission_date: '2026-10-02T15:10:00',
      score: 92,
      teacher_feedback: 'Okuma akıcılığın harika gelişiyor.',
    },
  },
  {
    id: 103,
    assignment_uuid: 'asg_harf_cizgi_03',
    title: '1-A Türkçe: Harf Çizgi & Yazılış Yönü Atölyesi (Dik Temel Harfler)',
    description: 'MEB standart dik temel harfleri ok yönlerini takip ederek tamamlayınız.',
    grade_level: '1. Sınıf',
    grade_category: 'İlkokul',
    subject: 'Türkçe',
    tool_type: 'WORKSHEET',
    due_date: '2026-10-18T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Özlem ZOR',
    total_submissions: 25,
    graded_submissions: 22,
    average_score: 90,
    submission: {
      id: null,
      status: 'PENDING',
    },
  },
  {
    id: 104,
    assignment_uuid: 'asg_kesirler_ortaokul_04',
    title: '5-A Matematik: Kesirler ve Sayı Doğrusu Modellemesi',
    description: 'Basit ve bileşik kesirleri pasta dilimi ve sayı doğrusu modelleriyle eşleştiriniz.',
    grade_level: '5. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_2aa88e1a-dcc0-451b-9924-4b075f3f8e2e',
    due_date: '2026-10-20T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Esin AKKAN',
    total_submissions: 29,
    graded_submissions: 27,
    average_score: 88,
  },
  {
    id: 105,
    assignment_uuid: 'asg_gunes_sistemi_05',
    title: '6-A Fen Bilimleri: Güneş Sistemi ve Gezegenler Simülasyonu',
    description: '3D gezegen simülasyonunu inceleyerek gezegenlerin Güneş’e yakınlık sıralamasını belirleyiniz.',
    grade_level: '6. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Fen Bilimleri',
    tool_type: 'QUIZ',
    due_date: '2026-10-22T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Murat ESEN',
    total_submissions: 30,
    graded_submissions: 29,
    average_score: 95,
  },
  {
    id: 106,
    assignment_uuid: 'asg_osmanli_tarih_06',
    title: '7-A Sosyal Bilgiler: Osmanlı Devleti Kuruluş Dönemi Kavram Haritası',
    description: 'Beylikten devlete geçiş sürecindeki önemli savaşlar ve hükümdarlar kronolojisi.',
    grade_level: '7. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Sosyal Bilgiler',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_93a22f1c-4071-4fbc-b42a-82411a2a9faf',
    due_date: '2026-10-25T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Makbule YILDIRIM',
    total_submissions: 27,
    graded_submissions: 25,
    average_score: 87,
  },
  {
    id: 107,
    assignment_uuid: 'asg_lgs_carpanlar_07',
    title: '8-A LGS Matematik: Çarpanlar ve Katlar Yeni Nesil Soru Çözümü',
    description: 'EBOB-EKOK problemleri ve MEB örnek soruları üzerinden akıllı tahta çözümleri.',
    grade_level: '8. Sınıf',
    grade_category: 'Ortaokul',
    subject: 'Matematik',
    tool_type: 'WHITEBOARD',
    board_uuid: 'board_2ec16e01-3744-4a40-93dc-228016b8a937',
    due_date: '2026-10-26T23:59:00',
    max_score: 100,
    published: true,
    teacher_name: 'Gülümser ERMEZ',
    total_submissions: 30,
    graded_submissions: 30,
    average_score: 91,
  },
]

export async function getSchoolAssignments(
  orgId: number,
  filters: {
    usergroup_id?: number | null
    grade_level?: string | null
    grade_category?: string | null
    subject?: string | null
    tool_type?: string | null
  },
  accessToken: string
): Promise<SchoolAssignmentItem[]> {
  try {
    const params = new URLSearchParams()
    if (filters.usergroup_id) params.set('usergroup_id', String(filters.usergroup_id))
    if (filters.grade_level && filters.grade_level !== 'all') params.set('grade_level', filters.grade_level)
    if (filters.grade_category && filters.grade_category !== 'all') params.set('grade_category', filters.grade_category)
    if (filters.subject && filters.subject !== 'all') params.set('subject', filters.subject)
    if (filters.tool_type && filters.tool_type !== 'all') params.set('tool_type', filters.tool_type)

    const url = `${getAPIUrl()}school_assignments/org/${orgId}${params.toString() ? '?' + params.toString() : ''}`
    const result = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken))
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (_e) {}

  // Filter default assignments based on criteria
  return DEFAULT_SCHOOL_ASSIGNMENTS.filter((a) => {
    if (filters.grade_level && filters.grade_level !== 'all' && a.grade_level !== filters.grade_level) return false
    if (filters.subject && filters.subject !== 'all' && a.subject !== filters.subject) return false
    if (filters.tool_type && filters.tool_type !== 'all' && a.tool_type !== filters.tool_type) return false
    return true
  })
}

export async function getSchoolAssignmentDetail(
  assignmentUuid: string,
  accessToken: string
): Promise<SchoolAssignmentItem> {
  try {
    const result = await fetch(
      `${getAPIUrl()}school_assignments/${assignmentUuid}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      return await errorHandling(result)
    }
  } catch (_e) {}

  const match = DEFAULT_SCHOOL_ASSIGNMENTS.find((a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid)
  return match || DEFAULT_SCHOOL_ASSIGNMENTS[0]
}

export async function getStudentAssignments(
  orgId: number,
  accessToken: string
): Promise<SchoolAssignmentItem[]> {
  try {
    const result = await fetch(
      `${getAPIUrl()}school_assignments/student/my_assignments?org_id=${orgId}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (_e) {}

  return DEFAULT_SCHOOL_ASSIGNMENTS
}

export async function submitSchoolAssignment(
  assignmentUuid: string,
  payload: {
    student_content: Record<string, any>
    usergroup_id?: number
  },
  accessToken: string
) {
  const result = await fetch(
    `${getAPIUrl()}school_assignments/${assignmentUuid}/submit`,
    RequestBodyWithAuthHeader('POST', payload, null, accessToken)
  )
  return errorHandling(result)
}

export async function getAssignmentSubmissions(
  assignmentUuid: string,
  usergroupId: number | null,
  accessToken: string
): Promise<SubmissionsResponse> {
  const match = DEFAULT_SCHOOL_ASSIGNMENTS.find(
    (a) => a.assignment_uuid === assignmentUuid || String(a.id) === assignmentUuid
  ) || DEFAULT_SCHOOL_ASSIGNMENTS[0]

  try {
    const param = usergroupId ? `?usergroup_id=${usergroupId}` : ''
    const result = await fetch(
      `${getAPIUrl()}school_assignments/${assignmentUuid}/submissions${param}`,
      RequestBodyWithAuthHeader('GET', null, null, accessToken)
    )
    if (result.ok) {
      const data = await errorHandling(result)
      if (data && Array.isArray(data.students) && data.students.length > 0) {
        return data
      }
    }
  } catch (_e) {}

  const fallbackData = generateAssignmentSubmissionsData(assignmentUuid)
  return {
    assignment: match,
    total_students: fallbackData.total_students,
    submitted_count: fallbackData.submitted_count,
    graded_count: fallbackData.graded_count,
    students: fallbackData.students,
  }
}

export async function gradeSubmission(
  submissionId: number,
  payload: {
    score: number
    teacher_feedback?: string
  },
  accessToken: string
) {
  const result = await fetch(
    `${getAPIUrl()}school_assignments/submissions/${submissionId}/grade`,
    RequestBodyWithAuthHeader('POST', payload, null, accessToken)
  )
  return errorHandling(result)
}
