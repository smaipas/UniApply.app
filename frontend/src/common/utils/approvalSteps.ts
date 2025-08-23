export interface ApprovalStep {
  type: 'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'
  role?: string
  user?: {
    id: string
    firstName: string
    lastName: string
  }
  label?: string
  status?: string
  statusText?: string
  updatedAt?: string
  updatedById?: string
  updatedByFullName?: string
}

const approvalStepTypes = [
  {
    value: 'USER_GROUP',
    label: 'User Group',
    description: 'Any user with the specified role can approve this step',
  },
  {
    value: 'FIXED_USER',
    label: 'Fixed User',
    description: 'A specific user must approve this step',
  },
  {
    value: 'DYNAMIC_USER',
    label: 'Dynamic User',
    description: 'The application creator specifies who approves this step',
  },
]

export function getStepDisplayText(step: ApprovalStep): string {
  const typeInfo = approvalStepTypes.find((t) => t.value === step.type)

  switch (step.type) {
    case 'USER_GROUP':
      return `${typeInfo?.label}: ${step.role}`
    case 'FIXED_USER':
      return `${typeInfo?.label}: ${step.user?.firstName} ${step.user?.lastName}`
    case 'DYNAMIC_USER':
      return `${typeInfo?.label}: ${step.label} (${step.role})`
    default:
      return step.role || 'Unknown'
  }
}

export function getStepTypeLabel(type: string): string {
  return approvalStepTypes.find((t) => t.value === type)?.label || type
}
