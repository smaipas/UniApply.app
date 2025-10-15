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
        <!-- Password Requirements -->
        <div v-if="state.password" class="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
          <p class="font-medium mb-2">Password Requirements:</p>
          <ul class="space-y-1">
            <li
              v-for="requirement in passwordRequirements"
              :key="requirement"
              class="flex items-center"
            >
              <span
                class="w-2 h-2 rounded-full mr-2"
                :class="{
                  'bg-green-500': checkPasswordRequirement(state.password, requirement),
                  'bg-gray-300': !checkPasswordRequirement(state.password, requirement),
                }"
              ></span>
              {{ requirement }}
            </li>
          </ul>
        </div>
        <UiInput
          label="Confirm password"
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
      <form @submit.prevent="confirmCode">
        <div class="flex gap-3 items-end">
          <UiInput label="Code" v-model="code" @keyup.enter="confirmCode" />
          <UiButton type="submit" :disabled="loading">Confirm</UiButton>
        </div>
      </form>
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
  maxLength,
  sameAs,
  helpers,
} from '@vuelidate/validators'

import AuthCard from '@/auth/components/AuthCard.vue'
import { UiInput } from '@/common/components'
import { UiButton } from '@/common/components'
import { signUp, confirmSignUp } from '@/auth/services/cognito'
import {
  errorMessageHandler,
  validatePasswordStrength,
  getPasswordRequirements,
  checkPasswordRequirement,
} from '@/common/utils/validation'

const router = useRouter()

// Custom password validator for Cognito requirements
const passwordValidator = (value: string) => {
  const validation = validatePasswordStrength(value)
  return validation.isValid
}

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
const passwordRequirements = getPasswordRequirements()

const rules = computed(() => ({
  first: {
    required: helpers.withMessage('First name is required', required),
    minLength: helpers.withMessage('First name must be at least 2 characters', minLength(2)),
    maxLength: helpers.withMessage('First name must be at most 64 characters', maxLength(64)),
  },
  last: {
    required: helpers.withMessage('Last name is required', required),
    minLength: helpers.withMessage('Last name must be at least 2 characters', minLength(2)),
    maxLength: helpers.withMessage('Last name must be at most 64 characters', maxLength(64)),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is not valid', emailValidator),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
    passwordValidator: helpers.withMessage(
      'Password does not meet security requirements',
      passwordValidator,
    ),
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
