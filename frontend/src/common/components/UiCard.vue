<template>
  <div class="rounded-xs border border-gray-200 bg-white shadow-sm">
    <div
      v-if="title"
      class="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-800"
    >
      {{ title }}
    </div>
    <div :class="padded ? 'p-4' : ''">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    padded?: boolean
  }>(),
  {
    title: '',
    padded: true,
  },
)
</script>
