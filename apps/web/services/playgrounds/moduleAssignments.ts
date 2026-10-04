// Module assignment and visibility management service for Oxonom Edu
// Allows teachers to show/hide modules globally, to specific classes, or to specific students.

import { ALL_CLASSROOMS, generateClassStudents } from '../demo/schoolDirectory'

export type ModuleVisibilityScope = 'all' | 'classes' | 'students' | 'hidden'

export interface AssignedStudentInfo {
  id?: number | string
  name: string
  classroomName: string
  studentNo?: string
}

export interface ModuleAssignment {
  moduleUuid: string
  published: boolean
  scope: ModuleVisibilityScope
  assignedClasses: string[] // e.g. ['1-A', '1-B']
  assignedStudents: AssignedStudentInfo[] // specific students assigned
  updatedAt?: string
}

const STORAGE_PREFIX = 'oxonom_module_assignments_'

export function getStorageKey(orgId: number | string = 10): string {
  return `${STORAGE_PREFIX}${orgId}`
}

export function getAllModuleAssignments(orgId: number | string = 10): Record<string, ModuleAssignment> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(getStorageKey(orgId))
    if (!raw) return {}
    return JSON.parse(raw) || {}
  } catch {
    return {}
  }
}

export function getModuleAssignment(
  orgId: number | string,
  moduleUuid: string,
  fallbackPublished: boolean = true
): ModuleAssignment {
  const all = getAllModuleAssignments(orgId)
  if (all[moduleUuid]) {
    return all[moduleUuid]
  }

  // Default state: if published, visible to all classes and students
  return {
    moduleUuid,
    published: fallbackPublished,
    scope: fallbackPublished ? 'all' : 'hidden',
    assignedClasses: [],
    assignedStudents: [],
  }
}

export function saveModuleAssignment(
  orgId: number | string,
  moduleUuid: string,
  patch: Partial<ModuleAssignment>
): ModuleAssignment {
  if (typeof window === 'undefined') {
    return {
      moduleUuid,
      published: true,
      scope: 'all',
      assignedClasses: [],
      assignedStudents: [],
      ...patch,
    }
  }

  const all = getAllModuleAssignments(orgId)
  const existing = all[moduleUuid] || {
    moduleUuid,
    published: true,
    scope: 'all',
    assignedClasses: [],
    assignedStudents: [],
  }

  const updated: ModuleAssignment = {
    ...existing,
    ...patch,
    moduleUuid,
    updatedAt: new Date().toISOString(),
  }

  all[moduleUuid] = updated
  try {
    localStorage.setItem(getStorageKey(orgId), JSON.stringify(all))
    // Trigger custom event so other components (e.g. student view) update instantly
    window.dispatchEvent(new CustomEvent('oxonom_module_assignments_changed', { detail: { orgId, moduleUuid } }))
  } catch (err) {
    console.error('Failed to save module assignment:', err)
  }

  return updated
}

export function bulkUpdateModuleAssignments(
  orgId: number | string,
  moduleUuids: string[],
  patch: Partial<ModuleAssignment>
): void {
  if (typeof window === 'undefined') return
  const all = getAllModuleAssignments(orgId)
  const now = new Date().toISOString()

  moduleUuids.forEach((uuid) => {
    const existing = all[uuid] || {
      moduleUuid: uuid,
      published: true,
      scope: 'all',
      assignedClasses: [],
      assignedStudents: [],
    }
    all[uuid] = {
      ...existing,
      ...patch,
      moduleUuid: uuid,
      updatedAt: now,
    }
  })

  try {
    localStorage.setItem(getStorageKey(orgId), JSON.stringify(all))
    window.dispatchEvent(new CustomEvent('oxonom_module_assignments_changed', { detail: { orgId } }))
  } catch (err) {
    console.error('Failed to save bulk module assignments:', err)
  }
}

/**
 * Checks whether a given module is visible to a student.
 * If user is teacher/admin, returns true.
 */
export function isModuleVisibleToStudent(
  module: { playground_uuid: string; published?: boolean },
  studentClass: string = '1-A',
  studentName: string = '',
  assignmentsMap: Record<string, ModuleAssignment>
): boolean {
  const assignment = assignmentsMap[module.playground_uuid]
  
  // If no explicit assignment recorded yet, use default module published status
  if (!assignment) {
    return module.published !== false
  }

  // If marked as hidden or published === false
  if (!assignment.published || assignment.scope === 'hidden') {
    return false
  }

  // If visible to all
  if (assignment.scope === 'all') {
    return true
  }

  // If assigned to specific classes
  if (assignment.scope === 'classes') {
    if (!assignment.assignedClasses || assignment.assignedClasses.length === 0) {
      return false
    }
    const cleanStudentClass = studentClass.trim().toUpperCase()
    return assignment.assignedClasses.some((c) => {
      const clean = c.trim().toUpperCase()
      return clean === cleanStudentClass || cleanStudentClass.startsWith(clean)
    })
  }

  // If assigned to specific students
  if (assignment.scope === 'students') {
    if (!assignment.assignedStudents || assignment.assignedStudents.length === 0) {
      return false
    }
    const cleanStudentName = studentName.trim().toLowerCase()
    return assignment.assignedStudents.some((s) => {
      const matchName = s.name.trim().toLowerCase()
      return cleanStudentName.includes(matchName) || matchName.includes(cleanStudentName)
    })
  }

  return true
}

/**
 * Returns the roster of all available school classrooms for assignment.
 */
export function getAvailableClassrooms(orgId: number = 10) {
  const targetOrgId = orgId === 20 ? 20 : 10
  const classes = ALL_CLASSROOMS.filter((c) => c.org_id === targetOrgId)
  return classes.length > 0 ? classes : ALL_CLASSROOMS
}

/**
 * Returns available students across classrooms (or for a specific classroom)
 */
export function getAvailableStudentsForClassrooms(orgId: number = 10, classNames?: string[]): AssignedStudentInfo[] {
  if (typeof window !== 'undefined') {
    try {
      const savedKey = `oxonom_students_${orgId}`
      const saved = localStorage.getItem(savedKey)
      if (saved) {
        const list = JSON.parse(saved)
        if (Array.isArray(list) && list.length > 0) {
          const mapped: AssignedStudentInfo[] = list.map((st: any) => ({
            id: st.id,
            name: st.name,
            classroomName: st.classroomName || '1-A',
            studentNo: st.studentNo,
          }))
          if (classNames && classNames.length > 0) {
            return mapped.filter((s) => classNames.includes(s.classroomName))
          }
          return mapped
        }
      }
    } catch {
      // Fallback
    }
  }

  const classrooms = getAvailableClassrooms(orgId)
  const targetClasses = classNames && classNames.length > 0
    ? classrooms.filter((c) => classNames.includes(c.code) || classNames.includes(c.name))
    : classrooms.slice(0, 7) // 1. grade classes by default

  const roster: AssignedStudentInfo[] = []
  targetClasses.forEach((cls) => {
    const students = generateClassStudents(cls)
    students.forEach((s) => {
      roster.push({
        id: s.id,
        name: s.name,
        classroomName: cls.code || cls.name,
        studentNo: s.studentNo,
      })
    })
  })

  return roster
}
