import { ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength, email, requiredIf } from '@vuelidate/validators'
import { errorMessageHandler } from '@/common/utils/validation'
import type { User } from '@uniapply/shared'

// Form-specific type that allows empty strings for better form handling
export interface UserFormData {
  role: string
  firstName: string
  lastName: string
  fathersName: string
  mothersName: string
  email: string
  mobilePhoneNumber: string
  phoneNumber: string
  dateOfBirth: string
  studentId: string
  userOfficialId: string
  userOfficialIdIssuedDate: string
  userOfficialIdIssuedAuthority: string
  userOfficialType: string
  currentAddress: {
    street: string
    number: string
    city: string
    province: string
    zipCode: string
    country: string
  }
  permanentResidenceAddress: {
    street: string
    number: string
    city: string
    province: string
    zipCode: string
    country: string
  }
  placeOfBirth: string
  nationality: string
  gender: string
  maleRegistryNumber: string
  maleRegistryIssuedPlace: string
  militaryObligations: string
  maritalStatus: string
  numberOfChildren: number | undefined
  municipalRegisterNumber: number | undefined
  municipalRegisterPrefecture: string
  ssn: number | undefined
  academicEnrollmentYear: number | undefined
  department: string
}

export function useUserForm(initialData?: Partial<UserFormData> | null) {
  // Form data - ensure all fields are present with defaults
  const formData = ref<UserFormData>({
    role: initialData?.role || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    fathersName: initialData?.fathersName || '',
    mothersName: initialData?.mothersName || '',
    email: initialData?.email || '',
    mobilePhoneNumber: initialData?.mobilePhoneNumber || '',
    phoneNumber: initialData?.phoneNumber || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    studentId: initialData?.studentId || '',
    userOfficialId: initialData?.userOfficialId || '',
    userOfficialIdIssuedDate: initialData?.userOfficialIdIssuedDate || '',
    userOfficialIdIssuedAuthority: initialData?.userOfficialIdIssuedAuthority || '',
    userOfficialType: initialData?.userOfficialType || '',
    currentAddress: {
      street: initialData?.currentAddress?.street || '',
      number: initialData?.currentAddress?.number || '',
      city: initialData?.currentAddress?.city || '',
      province: initialData?.currentAddress?.province || '',
      zipCode: initialData?.currentAddress?.zipCode || '',
      country: initialData?.currentAddress?.country || '',
    },
    permanentResidenceAddress: {
      street: initialData?.permanentResidenceAddress?.street || '',
      number: initialData?.permanentResidenceAddress?.number || '',
      city: initialData?.permanentResidenceAddress?.city || '',
      province: initialData?.permanentResidenceAddress?.province || '',
      zipCode: initialData?.permanentResidenceAddress?.zipCode || '',
      country: initialData?.permanentResidenceAddress?.country || '',
    },
    placeOfBirth: initialData?.placeOfBirth || '',
    nationality: initialData?.nationality || '',
    gender: initialData?.gender || '',
    maleRegistryNumber: initialData?.maleRegistryNumber || '',
    maleRegistryIssuedPlace: initialData?.maleRegistryIssuedPlace || '',
    militaryObligations: initialData?.militaryObligations || '',
    maritalStatus: initialData?.maritalStatus || '',
    numberOfChildren: initialData?.numberOfChildren || undefined,
    municipalRegisterNumber: initialData?.municipalRegisterNumber || undefined,
    municipalRegisterPrefecture: initialData?.municipalRegisterPrefecture || '',
    ssn: initialData?.ssn || undefined,
    academicEnrollmentYear: initialData?.academicEnrollmentYear || undefined,
    department: initialData?.department || '',
  })

  // Validation rules
  const rules = {
    firstName: { required, minLength: minLength(2), maxLength: maxLength(64) },
    lastName: { required, minLength: minLength(2), maxLength: maxLength(64) },
    fathersName: { required, minLength: minLength(2), maxLength: maxLength(32) },
    mothersName: { required, minLength: minLength(2), maxLength: maxLength(32) },
    email: { required, email },
    mobilePhoneNumber: {
      regex: (value: string) =>
        !value || value.trim() === '' || /^\+?[1-9]\d{1,14}$/.test(value.replace(/[^\d+]/g, '')),
    },
    phoneNumber: {
      regex: (value: string) =>
        !value || value.trim() === '' || /^\+?[1-9]\d{1,14}$/.test(value.replace(/[^\d+]/g, '')),
    },
    dateOfBirth: {
      required,
      regex: (value: string) => !value || value.trim() === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
    },
    studentId: {
      required,
      minLength: (value: string) => !value || value.trim() === '' || value.length >= 1,
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 10,
      regex: (value: string) => !value || value.trim() === '' || /^[a-zA-Z0-9\-_]+$/.test(value),
    },
    userOfficialId: {
      required,
      minLength: (value: string) => !value || value.trim() === '' || value.length >= 2,
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 32,
    },
    userOfficialIdIssuedDate: {
      required,
      regex: (value: string) => !value || value.trim() === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
    },
    userOfficialIdIssuedAuthority: {
      required,
      minLength: (value: string) => !value || value.trim() === '' || value.length >= 2,
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 32,
    },
    userOfficialType: { required },
    currentAddress: {
      street: { required },
      number: {},
      city: { required },
      province: { required },
      zipCode: { required },
      country: { required },
    },
    permanentResidenceAddress: {
      street: {},
      number: {},
      city: {},
      province: {},
      zipCode: {},
      country: {},
    },
    placeOfBirth: {
      required,
      minLength: minLength(2),
      maxLength: maxLength(32),
    },
    nationality: {
      required,
      minLength: minLength(1),
      maxLength: maxLength(100),
    },
    gender: { required },
    maleRegistryNumber: {
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 32,
    },
    maleRegistryIssuedPlace: {
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 32,
    },
    militaryObligations: {
      required: requiredIf(() => formData.value.gender === 'MALE'),
    },
    maritalStatus: { required },
    numberOfChildren: {
      minValue: (value: number) => !value || value >= 0,
    },
    municipalRegisterNumber: {
      minValue: (value: number) => !value || value >= 0,
    },
    municipalRegisterPrefecture: {
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 32,
    },
    ssn: {
      required,
      minValue: (value: number) => !value || value >= 0,
    },
    academicEnrollmentYear: {
      required,
      minValue: (value: number) => !value || value >= 1900,
      maxValue: (value: number) => !value || value <= new Date().getFullYear() + 10,
    },
    department: {
      required,
      maxLength: (value: string) => !value || value.trim() === '' || value.length <= 64,
    },
  }

  // Validation instance
  const v$ = useVuelidate(rules, formData)

  // Function to get field error
  function getFieldError(fieldPath: string): string | undefined {
    const fieldParts = fieldPath.split('.')
    let field = v$.value

    for (const part of fieldParts) {
      if (!field || typeof field !== 'object') {
        return undefined
      }
      field = field[part as keyof typeof field]
    }

    return errorMessageHandler(field)
  }

  // Function to validate form
  async function validateForm(): Promise<boolean> {
    v$.value.$touch()
    return await v$.value.$validate()
  }

  // Function to reset form
  function resetForm() {
    v$.value.$reset()
  }

  // Function to update form data
  function updateFormData(data: Partial<UserFormData>) {
    Object.assign(formData.value, data)
  }

  // Function to convert User data to UserFormData
  function userToFormData(user: Partial<User>): Partial<UserFormData> {
    return {
      role: user.role || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fathersName: user.fathersName || '',
      mothersName: user.mothersName || '',
      email: user.email || '',
      mobilePhoneNumber: user.mobilePhoneNumber || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth || '',
      studentId: user.studentId || '',
      userOfficialId: user.userOfficialId || '',
      userOfficialIdIssuedDate: user.userOfficialIdIssuedDate || '',
      userOfficialIdIssuedAuthority: user.userOfficialIdIssuedAuthority || '',
      userOfficialType: user.userOfficialType || '',
      currentAddress: {
        street: user.currentAddress?.street || '',
        number: user.currentAddress?.number || '',
        city: user.currentAddress?.city || '',
        province: user.currentAddress?.province || '',
        zipCode: user.currentAddress?.zipCode || '',
        country: user.currentAddress?.country || '',
      },
      permanentResidenceAddress: {
        street: user.permanentResidenceAddress?.street || '',
        number: user.permanentResidenceAddress?.number || '',
        city: user.permanentResidenceAddress?.city || '',
        province: user.permanentResidenceAddress?.province || '',
        zipCode: user.permanentResidenceAddress?.zipCode || '',
        country: user.permanentResidenceAddress?.country || '',
      },
      placeOfBirth: user.placeOfBirth || '',
      nationality: user.nationality || '',
      gender: user.gender || '',
      maleRegistryNumber: user.maleRegistryNumber || '',
      maleRegistryIssuedPlace: user.maleRegistryIssuedPlace || '',
      militaryObligations: user.militaryObligations || '',
      maritalStatus: user.maritalStatus || '',
      numberOfChildren: user.numberOfChildren,
      municipalRegisterNumber: user.municipalRegisterNumber,
      municipalRegisterPrefecture: user.municipalRegisterPrefecture || '',
      ssn: user.ssn,
      academicEnrollmentYear: user.academicEnrollmentYear,
      department: user.department || '',
    }
  }

  return {
    formData,
    v$,
    getFieldError,
    validateForm,
    resetForm,
    updateFormData,
    userToFormData,
  }
}
