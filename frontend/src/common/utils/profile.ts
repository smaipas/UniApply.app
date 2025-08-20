import type { UserModel } from '@uniapply/shared'

export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}

export function checkProfileCompletion(profile: UserModel | null): ProfileCompletionStatus {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: [
        'firstName',
        'lastName',
        'tel',
        'studentId',
        'userOfficialId',
        'userOfficialType',
        'gender',
      ],
      completionPercentage: 0,
    }
  }

  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'tel', label: 'Phone Number' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'userOfficialId', label: 'Official ID Number' },
    { key: 'userOfficialType', label: 'Official ID Type' },
    { key: 'gender', label: 'Gender' },
  ]

  const missingFields: string[] = []

  requiredFields.forEach((field) => {
    const value = profile[field.key as keyof UserModel]
    if (!value || String(value).trim() === '') {
      missingFields.push(field.label)
    }
  })

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100,
  )
  const isComplete = missingFields.length === 0

  return {
    isComplete,
    missingFields,
    completionPercentage,
  }
}

export function getProfileCompletionMessage(status: ProfileCompletionStatus): string {
  if (status.isComplete) {
    return 'Your profile is complete!'
  }

  if (status.missingFields.length === 1) {
    return `Please complete your profile by adding your ${status.missingFields[0].toLowerCase()}.`
  }

  if (status.missingFields.length <= 3) {
    return `Please complete your profile by adding: ${status.missingFields.join(', ').toLowerCase()}.`
  }

  return `Please complete your profile. ${status.missingFields.length} fields are missing.`
}
