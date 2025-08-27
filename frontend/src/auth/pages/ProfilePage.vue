<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
        <p class="text-gray-600 mt-1">Complete your profile information</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Profile Form -->
    <div v-else class="bg-white rounded-lg border border-gray-200">
      <div class="p-6">
        <UserForm
          v-model="formData"
          :loading="saving"
          @submit="saveProfile"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UserForm from '@/users/components/UserForm.vue'
import { useToastStore } from '@/common/store/toast'
import { useAuthStore } from '@/auth/store'
import api from '@/app/axios'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const formData = ref<any>({})

onMounted(async () => {
  await loadProfile()
})

async function loadProfile() {
  loading.value = true

  try {
    await authStore.loadProfile()

    if (authStore.profile) {
      formData.value = {
        firstName: authStore.profile.firstName || '',
        lastName: authStore.profile.lastName || '',
        fathersName: authStore.profile.fathersName || '',
        mothersName: authStore.profile.mothersName || '',
        email: authStore.profile.email || '',
        mobilePhoneNumber: authStore.profile.mobilePhoneNumber || '',
        phoneNumber: authStore.profile.phoneNumber || '',
        dateOfBirth: authStore.profile.dateOfBirth || '',
        studentId: authStore.profile.studentId || '',
        userOfficialId: authStore.profile.userOfficialId || '',
        userOfficialIdIssuedDate: authStore.profile.userOfficialIdIssuedDate || '',
        userOfficialIdIssuedAuthority: authStore.profile.userOfficialIdIssuedAuthority || '',
        userOfficialType: authStore.profile.userOfficialType || '',
        currentAddress: {
          street: authStore.profile.currentAddress?.street || '',
          number: authStore.profile.currentAddress?.number || '',
          city: authStore.profile.currentAddress?.city || '',
          province: authStore.profile.currentAddress?.province || '',
          zipCode: authStore.profile.currentAddress?.zipCode || '',
          country: authStore.profile.currentAddress?.country || '',
        },
        permanentResidenceAddress: {
          street: authStore.profile.permanentResidenceAddress?.street || '',
          number: authStore.profile.permanentResidenceAddress?.number || '',
          city: authStore.profile.permanentResidenceAddress?.city || '',
          province: authStore.profile.permanentResidenceAddress?.province || '',
          zipCode: authStore.profile.permanentResidenceAddress?.zipCode || '',
          country: authStore.profile.permanentResidenceAddress?.country || '',
        },
        placeOfBirth: authStore.profile.placeOfBirth || '',
        nationality: authStore.profile.nationality || '',
        gender: authStore.profile.gender || '',
        maleRegistryNumber: authStore.profile.maleRegistryNumber || '',
        maleRegistryIssuedPlace: authStore.profile.maleRegistryIssuedPlace || '',
        militaryObligations: authStore.profile.militaryObligations || '',
        maritalStatus: authStore.profile.maritalStatus || '',
        numberOfChildren: authStore.profile.numberOfChildren,
        municipalRegisterNumber: authStore.profile.municipalRegisterNumber,
        municipalRegisterPrefecture: authStore.profile.municipalRegisterPrefecture || '',
        ssn: authStore.profile.ssn,
        academicEnrollmentYear: authStore.profile.academicEnrollmentYear,
        department: authStore.profile.department || '',
      }
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to load profile data',
    })
  } finally {
    loading.value = false
  }
}

async function saveProfile(data: any) {
  saving.value = true

  try {
    const payload = {
      ...data,
      // Remove empty current address fields
      currentAddress: Object.fromEntries(
        Object.entries(data.currentAddress).filter(
          ([, value]) => value && typeof value === 'string' && value.trim(),
        ),
      ),
      // Remove empty permanent residence address fields
      permanentResidenceAddress: data.permanentResidenceAddress
        ? Object.fromEntries(
            Object.entries(data.permanentResidenceAddress).filter(
              ([, value]) => value && typeof value === 'string' && value.trim(),
            ),
          )
        : undefined,
    }

    await api.put(`/users/${authStore.user?.sub}`, payload)

    // Reload profile
    await authStore.loadProfile()

    toastStore.show({
      tone: 'success',
      title: 'Success',
      message: 'Profile updated successfully',
    })

    // Redirect back to previous page or dashboard
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Failed to save profile:', error)

    // Show error toast with details
    if (error.response?.status === 400 && error.response?.data?.details) {
      const details = error.response.data.details
      const errorMessages = details
        .map((detail: any) => detail.message)
        .filter(Boolean)
        .join(', ')

      toastStore.show({
        tone: 'error',
        title: 'Validation Error',
        message: errorMessages || 'Please check your input and try again.',
      })
    } else {
      toastStore.show({
        tone: 'error',
        title: 'Error',
        message: 'Failed to save profile. Please try again.',
      })
    }
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  // Navigate to the previous route if available, otherwise go to dashboard
  const previousRoute = (route.query.redirect as string) || '/dashboard'
  router.push(previousRoute)
}
</script>
