<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div class="text-sm text-gray-500">{{ title }}</div>
    <div class="mt-2 text-3xl font-semibold">{{ value }}</div>
    <div v-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; value: number | string; hint?: string }>()
</script>
