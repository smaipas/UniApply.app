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
import { UserForm } from '@/common/components'
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
        email: authStore.profile.email || '',
        tel: authStore.profile.tel || '',
        dateOfBirth: authStore.profile.dateOfBirth || '',
        studentId: authStore.profile.studentId || '',
        userOfficialId: authStore.profile.userOfficialId || '',
        userOfficialType: authStore.profile.userOfficialType || '',
        address: {
          street: authStore.profile.address?.street || '',
          number: authStore.profile.address?.number || '',
          city: authStore.profile.address?.city || '',
          province: authStore.profile.address?.province || '',
          zipCode: authStore.profile.address?.zipCode || '',
          country: authStore.profile.address?.country || '',
        },
        nationality: authStore.profile.nationality || '',
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
      // Remove empty address fields
      address: Object.fromEntries(
        Object.entries(data.address).filter(([_, value]) => value && value.trim()),
      ),
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
  } catch (error) {
    console.error('Failed to save profile:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to save profile',
    })
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  // Navigate to the previous route if available, otherwise go to dashboard
  const previousRoute = (route.query.redirect as string) || '/dashboard'
  router.push(previousRoute)
}

function resetForm() {
  loadProfile()
}
</script>
