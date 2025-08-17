<template>
  <AuthCard>
    <h1 class="mb-6 text-2xl font-semibold text-gray-900">Create your account</h1>
    <form v-if="step === 'form'" @submit.prevent="submit">
      <div class="space-y-4">
        <UiInput
          label="First name"
          v-model="state.first"
          :error="errorMessageHandler(v$.first)"
          @blur="v$.first.$touch"
        />
        <UiInput
          label="Last name"
          v-model="state.last"
          :error="errorMessageHandler(v$.last)"
          @blur="v$.last.$touch"
        />
        <UiInput
          label="Email"
          type="email"
          v-model="state.email"
          :error="errorMessageHandler(v$.email)"
          @blur="v$.email.$touch"
        />
        <UiInput
          label="Password"
          type="password"
          v-model="state.password"
          :error="errorMessageHandler(v$.password)"
          @blur="v$.password.$touch"
        />
        <UiInput
          label="Confirm password"
          type="password"
          v-model="state.confirm"
          :error="errorMessageHandler(v$.confirm)"
          @blur="v$.confirm.$touch"
        />
      </div>
      <div class="mt-6 flex items-center justify-between">
        <router-link class="text-sm text-blue-700 hover:underline" to="/login"
          >Back to sign in</router-link
        >
        <UiButton :disabled="loading" @click="submit">{{
          loading ? 'Creating…' : 'Create account'
        }}</UiButton>
      </div>
      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
      <p v-if="success" class="mt-4 text-sm text-green-700">{{ success }}</p>
    </form>

    <div v-else class="space-y-4">
      <h2 class="text-lg font-medium">Confirm your email</h2>
      <p class="text-sm text-gray-600">
        We've sent a 6-digit code to {{ state.email }}. Enter it below to verify.
      </p>
      <div class="flex gap-3 items-end">
        <UiInput label="Code" v-model="code" />
        <UiButton @click="confirmCode" :disabled="loading">Confirm</UiButton>
      </div>
      <p v-if="cError" class="text-sm text-red-600">{{ cError }}</p>
      <p v-if="success" class="text-sm text-green-700">{{ success }}</p>
    </div>
  </AuthCard>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import {
  required,
  email as emailValidator,
  minLength,
  sameAs,
  helpers,
} from '@vuelidate/validators'

import AuthCard from '@/auth/components/AuthCard.vue'
import UiInput from '@/common/components/UiInput.vue'
import UiButton from '@/common/components/UiButton.vue'
import { signUp, confirmSignUp } from '@/auth/services/cognito'
import { errorMessageHandler } from '@/common/utils/validation'

const router = useRouter()

const state = reactive({
  first: '',
  last: '',
  email: '',
  password: '',
  confirm: '',
})
const code = ref('')
const loading = ref(false)
const error = ref('')
const cError = ref('')
const success = ref('')
const step = ref<'form' | 'confirm'>('form')

const rules = computed(() => ({
  first: {
    required: helpers.withMessage('First name is required', required),
  },
  last: {
    required: helpers.withMessage('Last name is required', required),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is not valid', emailValidator),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
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
  cError.value = ''

  loading.value = true
  try {
    await signUp({
      email: state.email,
      password: state.password,
      givenName: state.first,
      familyName: state.last,
    })
    step.value = 'confirm'
    success.value = 'Account created. Please enter the confirmation code sent to your email.'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.message || 'Sign up failed'
  } finally {
    loading.value = false
  }
}

async function confirmCode() {
  cError.value = ''
  loading.value = true
  try {
    await confirmSignUp(state.email, code.value)
    success.value = 'Email verified. You can now sign in.'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    cError.value = e?.message || 'Confirmation failed'
  } finally {
    loading.value = false
    router.push('/login')
  }
}
</script>
