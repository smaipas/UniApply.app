<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div class="text-center">
      <!-- Spinner animation -->
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
      
      <!-- Loading text -->
      <p class="text-gray-600 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...'
})
</script>
