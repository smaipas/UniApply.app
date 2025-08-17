<template>
  <div :class="['rounded-lg border px-4 py-3 text-sm', styles[tone]]">
    <div v-if="title" class="mb-1 font-semibold">{{ title }}</div>
    <slot />
  </div>
</template>

<script setup lang="ts">
type Tone = 'success' | 'error' | 'info'

withDefaults(
  defineProps<{
    tone?: Tone
    title?: string
  }>(),
  {
    tone: 'info',
  },
)

const styles: Record<Tone, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-secondary/30 bg-secondary/10 text-secondary',
}
</script>
