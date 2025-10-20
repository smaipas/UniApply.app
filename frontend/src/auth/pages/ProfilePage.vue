<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Profile</h1>
        <p class="mt-2 text-gray-600">Manage your personal information and settings.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="ml-3 text-gray-600">Loading profile...</span>
      </div>

      <!-- Profile Form -->
      <div v-else class="bg-white rounded-lg border border-gray-200">
        <div class="p-6">
          <UserForm
            :initial-data="authStore.profile ? userToFormData(authStore.profile) : {}"
            :loading="saving"
            @submit="saveProfile"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserForm from '@/users/components/UserForm.vue'
import { useToastStore } from '@/common/store/toast'
import { useAuthStore } from '@/auth/store'
import { type UserFormData, useUserForm } from '@/common/composables/useUserForm'
import api from '@/app/axios'

const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const { userToFormData } = useUserForm()

onMounted(() => {
  loadProfile()
})

async function loadProfile() {
  loading.value = true
  try {
    await authStore.loadProfile()
  } catch (error: unknown) {
    console.error('Error loading profile:', error)
    toastStore.error('Failed to load profile information')
  } finally {
    loading.value = false
  }
}

async function saveProfile(data: UserFormData) {
  saving.value = true
  try {
    const userId = authStore.user?.sub
    if (!userId) {
      toastStore.error('User not authenticated')
      return
    }
    // Exclude immutable fields (e.g., role) from update payload
    const payloadBase = { ...data } as Omit<UserFormData, 'role'> &
      Partial<Pick<UserFormData, 'role'>>
    delete payloadBase.role
    const payload = {
      ...payloadBase,
      // Remove empty current address fields
      currentAddress: Object.fromEntries(
        Object.entries(data.currentAddress).filter(
          ([, value]) => value && typeof value === 'string' && value.trim(),
        ),
      ),
      // Remove empty permanent residence address fields
      permanentResidenceAddress: Object.fromEntries(
        Object.entries(data.permanentResidenceAddress).filter(
          ([, value]) => value && typeof value === 'string' && value.trim(),
        ),
      ),
    }

    await api.put(`/users/${userId}`, payload)
    toastStore.success('Profile updated successfully')

    // Reload the profile data to reflect changes
    await authStore.loadProfile()
  } catch (error: unknown) {
    console.error('Error saving profile:', error)
    toastStore.error('Failed to update profile')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/dashboard')
}
</script>
