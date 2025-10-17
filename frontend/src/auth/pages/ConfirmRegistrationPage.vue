<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirm Your Registration
        </h2>
      </div>

      <div v-if="loading" class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <p class="mt-2 text-sm text-gray-600">Confirming your registration...</p>
      </div>

      <div v-else-if="success" class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Registration Confirmed!</h3>
        <p class="mt-1 text-sm text-gray-600">{{ successMessage }}</p>
        <div class="mt-6">
          <router-link to="/login">
            <UiButton block color="primary"> Go to Login </UiButton>
          </router-link>
        </div>
      </div>

      <div v-else-if="error" class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Confirmation Failed</h3>
        <p class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
        <div class="mt-6 space-y-3">
          <UiButton @click="retryConfirmation" block color="primary"> Try Again </UiButton>
          <div class="text-center">
            <router-link to="/signup" class="text-sm font-medium text-blue-600 hover:text-blue-500">
              ← Back to Sign Up
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="mt-8 space-y-6">
        <div class="rounded-md bg-blue-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Check your email</h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>
                  We've sent a confirmation code to <strong>{{ email }}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="confirmRegistration" class="space-y-6">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700">
              Confirmation Code
            </label>
            <div class="mt-1">
              <input
                id="code"
                v-model="code"
                name="code"
                type="text"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
                maxlength="6"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <UiButton
              type="submit"
              :disabled="loading || !code || code.length !== 6"
              block
              color="primary"
            >
              Confirm Registration
            </UiButton>
          </div>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Didn't receive the code?
            <button
              @click="resendCode"
              :disabled="loading || resendCooldown > 0"
              class="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/auth/store'
import UiButton from '@/common/components/UiButton.vue'

const route = useRoute()
const authStore = useAuthStore()

const email = ref<string>('')
const code = ref<string>('')
const loading = ref(false)
const success = ref(false)
const error = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const resendCooldown = ref(0)

// Get email and code from URL parameters
onMounted(() => {
  const emailParam = route.query.email as string
  const codeParam = route.query.code as string

  if (emailParam) {
    email.value = decodeURIComponent(emailParam)
  }

  if (codeParam) {
    code.value = codeParam
    // Auto-confirm if code is provided in URL
    if (email.value && code.value) {
      confirmRegistration()
    }
  }
})

async function confirmRegistration() {
  if (!email.value || !code.value) {
    errorMessage.value = 'Email and confirmation code are required'
    error.value = true
    return
  }

  loading.value = true
  error.value = false
  success.value = false

  try {
    await authStore.confirmRegistration(email.value, code.value)
    success.value = true
    successMessage.value =
      'Your email has been confirmed successfully. You can now sign in to your account.'
  } catch (err: unknown) {
    error.value = true
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Confirmation failed. Please check your code and try again.'
    errorMessage.value = errorMsg
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  if (resendCooldown.value > 0) return

  loading.value = true
  error.value = false
  try {
    await authStore.resendConfirmationCode(email.value)
    success.value = true
    successMessage.value = 'A new confirmation code has been sent to your email address.'

    // Set cooldown timer
    resendCooldown.value = 60
    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  } catch (err: unknown) {
    error.value = true
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Failed to resend confirmation code. Please try again later.'
    errorMessage.value = errorMsg
  } finally {
    loading.value = false
  }
}

function retryConfirmation() {
  error.value = false
  errorMessage.value = ''
  code.value = ''
}
</script>
