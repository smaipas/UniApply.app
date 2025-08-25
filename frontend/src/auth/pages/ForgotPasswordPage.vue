<template>
  <AuthCard>
    <h1 class="mb-6 text-2xl font-semibold text-gray-900">Forgot your password?</h1>
    <form @submit.prevent="submit">
      <UiInput
        label="Email"
        type="email"
        v-model="state.email"
        :error="errorMessageHandler(v$.email)"
        @keyup.enter="submit"
        @blur="v$.email.$touch"
      />
      <div class="mt-6 flex items-center justify-between">
        <router-link class="text-sm text-blue-700 hover:underline" to="/login">
          Back to sign in
        </router-link>
        <UiButton :disabled="loading" @click="submit">
          {{ loading ? 'Sending…' : 'Send reset code' }}
        </UiButton>
      </div>
    </form>
    <p v-if="success" class="mt-4 text-sm text-green-700">{{ success }}</p>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
  </AuthCard>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email as emailValidator, helpers } from '@vuelidate/validators'

import AuthCard from '@/auth/components/AuthCard.vue'
import { UiInput } from '@/common/components'
import { UiButton } from '@/common/components'
import { forgotPassword } from '@/auth/services/cognito'
import { errorMessageHandler } from '@/common/utils/validation'

const state = reactive({
  email: '',
})
const loading = ref(false)
const success = ref('')
const error = ref('')

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is not valid', emailValidator),
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
    await forgotPassword(state.email)
    success.value = 'Reset code sent. Check your email and continue to reset password.'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.message || 'Failed to send reset code'
  } finally {
    loading.value = false
  }
}
</script>
