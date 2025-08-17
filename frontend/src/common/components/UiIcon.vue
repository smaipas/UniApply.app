<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    :role="title ? 'img' : undefined"
    :aria-label="title || undefined"
    :aria-hidden="title ? undefined : 'true'"
  >
    <title v-if="title">{{ title }}</title>
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    path: string // e.g. mdiAccount
    size?: number // px
    title?: string // accessibility label
  }>(),
  {
    size: 24,
  },
)
</script>
