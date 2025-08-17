<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore, type ToastItem } from '../store/toast'

const toast = useToastStore()
const { items } = storeToRefs(toast)

function toneClasses(t: ToastItem) {
  switch (t.tone) {
    case 'success':
      return 'border-green-300 bg-green-50 text-green-800'
    case 'error':
      return 'border-red-300 bg-red-50 text-red-800'
    default:
      return 'border-secondary/40 bg-secondary/10 text-secondary'
  }
}
</script>

<template>
  <!-- fixed viewport stack, top-right -->
  <div
    class="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[clamp(240px,30vw,420px)] flex-col gap-3"
  >
    <transition-group name="toast" tag="div">
      <div
        v-for="t in items"
        :key="t.id"
        :class="[
          'pointer-events-auto rounded-lg border shadow-md backdrop-blur px-4 py-3',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          toneClasses(t),
        ]"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5">
            <span v-if="t.tone === 'success'">✅</span>
            <span v-else-if="t.tone === 'error'">⛔</span>
            <span v-else>ℹ️</span>
          </div>
          <div class="min-w-0 flex-1">
            <div v-if="t.title" class="truncate text-sm font-semibold">
              {{ t.title }}
            </div>
            <div v-if="t.message" class="mt-0.5 text-sm text-gray-700">
              {{ t.message }}
            </div>
          </div>
          <button
            class="ml-2 text-sm text-gray-500 hover:text-gray-800"
            @click="toast.dismiss(t.id)"
            aria-label="Dismiss"
            title="Dismiss"
          >
            ✖
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
