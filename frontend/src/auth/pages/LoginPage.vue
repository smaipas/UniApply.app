<template>
  <AuthCard>
    <h1 class="mb-6 text-2xl font-semibold text-gray-900">Sign in</h1>
    <form @submit.prevent="submit">
      <div class="space-y-4">
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
          @keyup.enter="submit"
          @blur="v$.password.$touch"
        />
      </div>
      <div class="mt-6 flex items-center justify-between">
        <router-link class="text-sm text-blue-700 hover:underline" to="/forgot-password">
          Forgot password?
        </router-link>
        <UiButton :disabled="loading" @click="submit">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </UiButton>
      </div>
    </form>
    <p class="mt-6 text-sm text-gray-600">
      Don't have an account?
      <router-link class="text-blue-700 hover:underline" to="/signup">Sign up</router-link>
    </p>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
  </AuthCard>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email as emailValidator, helpers } from '@vuelidate/validators'

import AuthCard from '@/auth/components/AuthCard.vue'
import { UiInput } from '@/common/components'
import { UiButton } from '@/common/components'
import { useAuthStore } from '@/auth/store'
import { errorMessageHandler } from '@/common/utils/validation'

const router = useRouter()
const auth = useAuthStore()

const state = reactive({
  email: '',
  password: '',
})
const loading = ref(false)
const error = ref('')

const rules = computed(() => ({
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is not valid', emailValidator),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
  },
}))

const v$ = useVuelidate(rules, state)

async function submit() {
  v$.value.$touch()
  if (v$.value.$invalid) return

  error.value = ''
  loading.value = true
  try {
    await auth.login(state.email, state.password)

    // Redirect to stored path or dashboard
    const redirectPath = auth.redirectAfterLogin || '/dashboard'
    router.push(redirectPath)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
