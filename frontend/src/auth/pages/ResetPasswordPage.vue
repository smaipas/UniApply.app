<template>
  <AuthCard>
    <h1 class="mb-6 text-2xl font-semibold text-gray-900">Reset your password</h1>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <UiInput
          label="Email"
          type="email"
          v-model="state.email"
          :error="v$.email.$errors[0]?.$message"
          @blur="v$.email.$touch"
        />
        <UiInput
          label="Verification code"
          v-model="state.code"
          :error="v$.code.$errors[0]?.$message"
          @blur="v$.code.$touch"
        />
        <UiInput
          label="New password"
          type="password"
          v-model="state.password"
          :error="v$.password.$errors[0]?.$message"
          @blur="v$.password.$touch"
        />
        <UiInput
          label="Confirm new password"
          type="password"
          v-model="state.confirm"
          :error="v$.confirm.$errors[0]?.$message"
          @blur="v$.confirm.$touch"
        />
      </div>
      <div class="mt-6 flex items-center justify-between">
        <router-link class="text-sm text-blue-700 hover:underline" to="/login"
          >Back to sign in</router-link
        >
        <UiButton :disabled="loading || v$.$invalid"
          >{{ loading ? 'Updating…' : 'Update password' }}</UiButton
        >
      </div>
    </form>
    <p v-if="success" class="mt-4 text-sm text-green-700">{{ success }}</p>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
  </AuthCard>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email as emailValidator, minLength, sameAs, helpers } from '@vuelidate/validators'

import AuthCard from '../components/AuthCard.vue'
import UiInput from '@/common/components/UiInput.vue'
import UiButton from '@/common/components/UiButton.vue'
import { confirmForgotPassword } from '@/auth/services/cognito'

const state = reactive({
  email: '',
  code: '',
  password: '',
  confirm: '',
})
const loading = ref(false)
const success = ref('')
const error = ref('')

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

async function submit() {
  v$.value.$touch()
  if (v$.value.$invalid) return

  error.value = ''
  success.value = ''

  loading.value = true
  try {
    await confirmForgotPassword(state.email, state.code, state.password)
    success.value = 'Password updated. You may now sign in.'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.message || 'Failed to update password'
  } finally {
    loading.value = false
  }
}
</script>
