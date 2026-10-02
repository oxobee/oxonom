import { getAPIUrl } from '@services/config/config'
import {
  RequestBodyWithAuthHeader,
  errorHandling,
  getResponseMetadata,
} from '@services/utils/ts/requests'

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
  const params = new URLSearchParams()
  if (filters.usergroup_id) params.set('usergroup_id', String(filters.usergroup_id))
  if (filters.grade_level && filters.grade_level !== 'all') params.set('grade_level', filters.grade_level)
  if (filters.grade_category && filters.grade_category !== 'all') params.set('grade_category', filters.grade_category)
  if (filters.subject && filters.subject !== 'all') params.set('subject', filters.subject)
  if (filters.tool_type && filters.tool_type !== 'all') params.set('tool_type', filters.tool_type)

  const url = `${getAPIUrl()}school_assignments/org/${orgId}${params.toString() ? '?' + params.toString() : ''}`
  const result = await fetch(url, RequestBodyWithAuthHeader('GET', null, null, accessToken))
  return errorHandling(result)
}

export async function getSchoolAssignmentDetail(
  assignmentUuid: string,
  accessToken: string
): Promise<SchoolAssignmentItem> {
  const result = await fetch(
    `${getAPIUrl()}school_assignments/${assignmentUuid}`,
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
}

export async function getStudentAssignments(
  orgId: number,
  accessToken: string
): Promise<SchoolAssignmentItem[]> {
  const result = await fetch(
    `${getAPIUrl()}school_assignments/student/my_assignments?org_id=${orgId}`,
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
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
  const param = usergroupId ? `?usergroup_id=${usergroupId}` : ''
  const result = await fetch(
    `${getAPIUrl()}school_assignments/${assignmentUuid}/submissions${param}`,
    RequestBodyWithAuthHeader('GET', null, null, accessToken)
  )
  return errorHandling(result)
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
