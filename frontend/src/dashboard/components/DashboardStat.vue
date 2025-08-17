<template>
  <div class="rounded-xs border border-gray-200 bg-white p-4 shadow-sm">
    <div class="text-xs font-medium text-gray-500">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold text-gray-900">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
}>()
</script>
