import { useAuthStore } from '@/auth/store'
import { useRolesStore } from '@/common/store/roles'

export interface UserPermissions {
  applications: {
    create: boolean
    update: boolean
    delete: boolean
    approve: boolean
    reject: boolean
    readAll: boolean
    readOwn: boolean
  }
  formTemplates: {
    create: boolean
    readAll: boolean
    readActive: boolean
    update: boolean
    delete: boolean
  }
  users: {
    create: boolean
    readAll: boolean
    update: boolean
    delete: boolean
  }
  auditLogs: {
    read: boolean
  }
  systemSettings: {
    read: boolean
    update: boolean
  }
  roles: {
    readAll: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
}

export function usePermissions() {
  const authStore = useAuthStore()
  const rolesStore = useRolesStore()

  const getUserPermissions = (): UserPermissions => {
    const defaultPermissions: UserPermissions = {
      applications: {
        create: false,
        update: false,
        delete: false,
        approve: false,
        reject: false,
        readAll: false,
        readOwn: true, // Users can always read their own applications
      },
      formTemplates: {
        create: false,
        readAll: false,
        readActive: true, // Users can always read active form templates
        update: false,
        delete: false,
      },
      users: {
        create: false,
        readAll: false,
        update: false,
        delete: false,
      },
      auditLogs: {
        read: false,
      },
      systemSettings: {
        read: false,
        update: false,
      },
      roles: {
        readAll: false,
        create: false,
        update: false,
        delete: false,
      },
    }

    if (!authStore.profile?.role) {
      return defaultPermissions
    }

    const userRole = rolesStore.roles.find((r) => r.roleName === authStore.profile?.role)
    if (!userRole?.access) {
      return defaultPermissions
    }

    // Merge user role permissions with defaults
    return {
      applications: {
        ...defaultPermissions.applications,
        ...userRole.access.applications,
      },
      formTemplates: {
        ...defaultPermissions.formTemplates,
        ...userRole.access.formTemplates,
      },
      users: {
        ...defaultPermissions.users,
        ...userRole.access.users,
      },
      auditLogs: {
        ...defaultPermissions.auditLogs,
        ...userRole.access.auditLogs,
      },
      systemSettings: {
        ...defaultPermissions.systemSettings,
        ...userRole.access.systemSettings,
      },
      roles: {
        ...defaultPermissions.roles,
        ...userRole.access.roles,
      },
    }
  }

  const canApproveApplication = (application: any): boolean => {
    const permissions = getUserPermissions()

    // Check if user has approval permissions
    if (!permissions.applications.approve) {
      return false
    }

    // Check if application is in pending approval status
    if (application.status !== 'PENDING_APPROVAL') {
      return false
    }

    // Check if user's role matches the first pending approval step
    if (application.approvalSteps && application.approvalSteps.length > 0) {
      const firstPendingStep = application.approvalSteps.find(
        (step: any) => step.status === 'PENDING_APPROVAL',
      )

      if (firstPendingStep && authStore.profile?.role) {
        return firstPendingStep.role.toUpperCase() === authStore.profile.role.toUpperCase()
      }
    }

    return false
  }

  const canRejectApplication = (application: any): boolean => {
    // Same logic as approval for now
    return canApproveApplication(application)
  }

  return {
    getUserPermissions,
    canApproveApplication,
    canRejectApplication,
  }
}
