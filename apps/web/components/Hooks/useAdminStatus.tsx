import { useOrgMembership } from '@components/Contexts/OrgContext';
import { useLHSession } from '@components/Contexts/LHSessionContext';
import { useMemo } from 'react';

interface Role {
    org: { id: number; org_uuid: string };
    role: {
        id: number;
        role_uuid: string;
        rights?: {
            [key: string]: {
                [key: string]: boolean;
            };
        };
    };
}

interface Rights {
    courses: {
        action_create: boolean;
        action_read: boolean;
        action_read_own: boolean;
        action_update: boolean;
        action_update_own: boolean;
        action_delete: boolean;
        action_delete_own: boolean;
    };
    users: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    usergroups: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    folders: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    media: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    organizations: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    coursechapters: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    activities: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    roles: {
        action_create: boolean;
        action_read: boolean;
        action_update: boolean;
        action_delete: boolean;
    };
    dashboard: {
        action_access: boolean;
    };
}

interface UseAdminStatusReturn {
    isAdmin: boolean | null;
    // Can the user MANAGE the org (settings + billing)? Stricter than isAdmin
    // (dashboard access): an editor/maintainer may reach the dashboard, but only
    // an org admin (or superadmin) manages the organization and its billing.
    canManageOrg: boolean;
    loading: boolean;
    userRoles: Role[];
    rights: Rights | null;
    isStudent: boolean;
    isTeacher: boolean;
}

/**
 * Per-org "can manage the org (incl. billing)" check from the session, usable
 * where there is no OrgContext (e.g. the apex hub's multi-org picker). Mirrors
 * useAdminStatus().canManageOrg for an arbitrary org id.
 */
export function canManageOrgFromSession(session: any, orgId?: number): boolean {
    if (!orgId) return false;
    if (session?.data?.user?.is_superadmin === true) return true;
    const roles: Role[] = session?.data?.roles || [];
    return roles.some(
        (r) => r?.org?.id === orgId && r?.role?.rights?.organizations?.action_update === true,
    );
}

function extractRightsFromRoles(userRoles: Role[], orgId: number): Rights | null {
    if (!userRoles || userRoles.length === 0) return null;

    let orgRoles = userRoles.filter((role: Role) => role.org?.id === orgId);
    if (orgRoles.length === 0) {
        orgRoles = userRoles;
    }

    const mergedRights: Rights = {
        courses: {
            action_create: false,
            action_read: false,
            action_read_own: false,
            action_update: false,
            action_update_own: false,
            action_delete: false,
            action_delete_own: false
        },
        users: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        usergroups: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        folders: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        media: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        organizations: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        coursechapters: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        activities: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        roles: {
            action_create: false,
            action_read: false,
            action_update: false,
            action_delete: false
        },
        dashboard: {
            action_access: false
        }
    };

    orgRoles.forEach((role: Role) => {
        if (role.role.rights) {
            Object.keys(role.role.rights).forEach((resourceType) => {
                if (mergedRights[resourceType as keyof Rights]) {
                    Object.keys(role.role.rights![resourceType]).forEach((action) => {
                        if (role.role.rights![resourceType][action] === true) {
                            (mergedRights[resourceType as keyof Rights] as any)[action] = true;
                        }
                    });
                }
            });
        }
    });

    return mergedRights;
}

// Full-access rights object for superadmins
const SUPERADMIN_RIGHTS: Rights = {
    courses: { action_create: true, action_read: true, action_read_own: true, action_update: true, action_update_own: true, action_delete: true, action_delete_own: true },
    users: { action_create: true, action_read: true, action_update: true, action_delete: true },
    usergroups: { action_create: true, action_read: true, action_update: true, action_delete: true },
    folders: { action_create: true, action_read: true, action_update: true, action_delete: true },
    media: { action_create: true, action_read: true, action_update: true, action_delete: true },
    organizations: { action_create: true, action_read: true, action_update: true, action_delete: true },
    coursechapters: { action_create: true, action_read: true, action_update: true, action_delete: true },
    activities: { action_create: true, action_read: true, action_update: true, action_delete: true },
    roles: { action_create: true, action_read: true, action_update: true, action_delete: true },
    dashboard: { action_access: true },
};

function useAdminStatus(): UseAdminStatusReturn {
    const session = useLHSession() as any;
    const { org, orgslug } = useOrgMembership() as any;

    const roles = session.data?.roles;
    const userRoles: Role[] = useMemo(() => roles || [], [roles]);
    const orgId = org?.id;
    const isAuthenticated = session.status === 'authenticated';
    const isSuperadmin = session.data?.user?.is_superadmin === true;

    const rights = useMemo(
        () => {
            if (!isAuthenticated || !orgId) return null;
            // Superadmins get full access to all orgs without needing a role entry
            if (isSuperadmin) return SUPERADMIN_RIGHTS;
            return extractRightsFromRoles(userRoles, orgId);
        },
        [isAuthenticated, userRoles, orgId, isSuperadmin]
    );

    const email = (session?.data?.user?.email || '').toLowerCase();
    const isTeacherUser = email.includes('ogretmen') || userRoles.some((r: any) => r?.role?.id === 3 || r?.role?.name?.toLowerCase() === 'teacher' || r?.role?.name?.toLowerCase() === 'instructor');
    const isAdminUser = isSuperadmin || email.includes('idare') || email.includes('admin') || userRoles.some((r: any) => r?.role?.id === 1 || r?.role?.id === 2 || r?.role?.name?.toLowerCase() === 'admin');

    const isAdmin = useMemo(
        () => (isAuthenticated ? isSuperadmin || isAdminUser || isTeacherUser || rights?.dashboard?.action_access === true : false),
        [isAuthenticated, isSuperadmin, isAdminUser, isTeacherUser, rights]
    );

    const canManageOrg = useMemo(
        () => (isAuthenticated && !isTeacherUser && !email.includes('ogretmen') ? isSuperadmin || isAdminUser || rights?.organizations?.action_update === true : false),
        [isAuthenticated, isTeacherUser, email, isSuperadmin, isAdminUser, rights]
    );

    // Every right is derived per-org, so an unresolved org reads as "no rights"
    // rather than "not known yet". Callers that redirect on !isAdmin would then
    // bounce an admin off a deep-linked page during the first render, before
    // OrgContext's fetch lands — and never again once react-query has the org
    // cached, which is why it only ever happened on the first visit.
    //
    // A non-empty orgslug means we are inside an OrgProvider, so an absent
    // org.id is "still loading" and not "this surface has no org at all"
    // (the apex hub renders these hooks with no provider).
    const orgPending = !!orgslug && !orgId;
    const loading = (!isAuthenticated && session.status !== 'unauthenticated') || orgPending;

    const isStudent = useMemo(() => {
        if (!isAuthenticated) return false;
        if (email.includes('ogrenci') || session?.data?.user?.username?.includes('ogrenci') || session?.data?.user?.role === 'student') return true;
        return !isSuperadmin && !isAdminUser && !isTeacherUser;
    }, [isAuthenticated, email, session, isSuperadmin, isAdminUser, isTeacherUser]);

    const isTeacher = useMemo(() => {
        if (!isAuthenticated) return false;
        return Boolean(isTeacherUser && !isStudent);
    }, [isAuthenticated, isTeacherUser, isStudent]);

    return { isAdmin, canManageOrg, loading, userRoles, rights, isStudent, isTeacher };
}

export default useAdminStatus;

