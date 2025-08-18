<template>
  <div class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <div
      v-if="show"
      class="pointer-events-none absolute z-50 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow"
      :style="{ left: '50%', bottom: '100%', marginBottom: '6px' }"
      role="tooltip"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ text: string }>()

const show = ref(false)
</script>
