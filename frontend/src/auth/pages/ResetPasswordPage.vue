<template>
  <AuthCard>
    <!-- Success State -->
    <div v-if="passwordUpdated" class="text-center">
      <div class="mb-6">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"
        >
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">Password Updated!</h1>
        <p class="text-gray-600">Your password has been successfully updated.</p>
      </div>
      <router-link to="/login">
        <UiButton class="w-full">Back to sign in</UiButton>
      </router-link>
    </div>

    <!-- Form State -->
    <div v-else>
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Reset your password</h1>
      <form @submit.prevent="submit">
        <div class="space-y-4">
          <UiInput
            label="Email"
            type="email"
            v-model="state.email"
            :error="errorMessageHandler(v$.email)"
            :disabled="!!route.query.email"
            @blur="v$.email.$touch"
          />
          <UiInput
            label="Verification code"
            v-model="state.code"
            :error="errorMessageHandler(v$.code)"
            :disabled="!!route.query.code"
            @blur="v$.code.$touch"
          />
          <UiInput
            label="New password"
            type="password"
            v-model="state.password"
            :error="errorMessageHandler(v$.password)"
            @blur="v$.password.$touch"
          />
          <UiInput
            label="Confirm new password"
            type="password"
            v-model="state.confirm"
            :error="errorMessageHandler(v$.confirm)"
            @keyup.enter="submit"
            @blur="v$.confirm.$touch"
          />
        </div>
        <div class="mt-6 flex items-center justify-between">
          <router-link class="text-sm text-blue-700 hover:underline" to="/login"
            >Back to sign in</router-link
          >
          <UiButton :disabled="loading" @click="submit">{{
            loading ? 'Updating…' : 'Update password'
          }}</UiButton>
        </div>
      </form>
      <div v-if="urlError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">{{ urlError }}</p>
        <router-link
          to="/forgot-password"
          class="mt-2 inline-block text-sm text-blue-700 hover:underline"
        >
          Request a new password reset
        </router-link>
      </div>
      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </div>
  </AuthCard>
</template>
<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import {
  required,
  email as emailValidator,
  minLength,
  sameAs,
  helpers,
} from '@vuelidate/validators'

import AuthCard from '../components/AuthCard.vue'
import { UiInput } from '@/common/components'
import { UiButton } from '@/common/components'
import { confirmForgotPassword } from '@/auth/services/cognito'
import { errorMessageHandler } from '@/common/utils/validation'

const route = useRoute()

const state = reactive({
  email: '',
  code: '',
  password: '',
  confirm: '',
})
const loading = ref(false)
const success = ref('')
const error = ref('')
const urlError = ref('')
const passwordUpdated = ref(false)

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is not valid', emailValidator),
  },
  code: {
    required: helpers.withMessage('Verification code is required', required),
  },
  password: {
    required: helpers.withMessage('New password is required', required),
    minLength: helpers.withMessage('Password must be at least 6 characters', minLength(6)),
  },
  confirm: {
    required: helpers.withMessage('Password confirmation is required', required),
    sameAs: helpers.withMessage('Passwords do not match', sameAs(state.password)),
  },
}))

const v$ = useVuelidate(rules, state)

// Extract email and code from URL parameters
onMounted(() => {
  const emailParam = route.query.email as string
  const codeParam = route.query.code as string

  if (!emailParam || !codeParam) {
    urlError.value = 'Invalid reset link. Please request a new password reset.'
    return
  }

  try {
    const decodedEmail = decodeURIComponent(emailParam)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(decodedEmail)) {
      urlError.value = 'Invalid email in reset link. Please request a new password reset.'
      return
    }

    // Basic code validation (should be 6 digits)
    if (!/^\d{6}$/.test(codeParam)) {
      urlError.value =
        'Invalid verification code in reset link. Please request a new password reset.'
      return
    }

    state.email = decodedEmail
    state.code = codeParam
  } catch {
    urlError.value = 'Invalid reset link format. Please request a new password reset.'
  }
})

async function submit() {
  v$.value.$touch()
  if (v$.value.$invalid) return

  error.value = ''
  success.value = ''

  loading.value = true
  try {
    await confirmForgotPassword(state.email, state.code, state.password)
    passwordUpdated.value = true
    // Clear the form after successful reset
    state.password = ''
    state.confirm = ''
  } catch (e: unknown) {
    // Handle specific Cognito errors
    const errorMessage = (e as Error)?.message || 'Failed to update password'
    if (
      errorMessage.includes('Invalid verification code') ||
      errorMessage.includes('CodeMismatchException')
    ) {
      error.value = 'Invalid or expired verification code. Please request a new password reset.'
    } else if (errorMessage.includes('ExpiredCodeException')) {
      error.value = 'Verification code has expired. Please request a new password reset.'
    } else if (errorMessage.includes('LimitExceededException')) {
      error.value = 'Too many attempts. Please wait before trying again.'
    } else {
      error.value = errorMessage
    }
  } finally {
    loading.value = false
  }
}
</script>
