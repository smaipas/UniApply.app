import { unref } from 'vue'

export function errorMessageHandler(
  field?: { $errors?: Array<{ $message?: unknown }> } | null,
): string | undefined {
  const errors = field?.$errors
  if (!errors || errors.length === 0) return undefined
  const msg = errors[0]?.$message
  if (msg == null) return undefined
  return typeof msg === 'string' ? msg : (unref(msg) as string)
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []

  // Minimum length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Symbol check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (
      password.length >= 16 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    ) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

export function getPasswordRequirements(): string[] {
  return [
    'At least 12 characters long',
    'At least one uppercase letter (A-Z)',
    'At least one lowercase letter (a-z)',
    'At least one number (0-9)',
    'At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
  ]
}

export function checkPasswordRequirement(password: string, requirement: string): boolean {
  if (requirement.includes('12 characters')) {
    return password.length >= 12
  }
  if (requirement.includes('uppercase letter')) {
    return /[A-Z]/.test(password)
  }
  if (requirement.includes('lowercase letter')) {
    return /[a-z]/.test(password)
  }
  if (requirement.includes('number')) {
    return /\d/.test(password)
  }
  if (requirement.includes('special character')) {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  }
  return false
}
