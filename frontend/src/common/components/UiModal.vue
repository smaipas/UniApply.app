<template>
  <teleport to="body">
    <transition name="fade" appear>
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1100] bg-black/40"
        @click="closeOnOverlay ? close() : null"
      />
    </transition>

    <transition name="pop" appear>
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1101] flex items-center justify-center p-4 md:p-4"
      >
        <div
          class="w-full h-full md:h-auto md:rounded-xl bg-white shadow-xl md:max-h-[90vh] flex flex-col"
          :class="sizes[size]"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div
            class="border-b border-gray-200 px-4 md:px-5 py-3 md:py-4 text-base font-semibold text-gray-800 flex-shrink-0"
          >
            <slot name="title">{{ title }}</slot>
          </div>
          <div class="p-4 md:p-5 overflow-y-auto flex-1">
            <slot />
          </div>
          <div
            class="flex items-center justify-end gap-2 border-t border-gray-200 px-4 md:px-5 py-3 flex-shrink-0"
          >
            <slot name="footer">
              <button
                class="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="close"
              >
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: ModalSize
    closeOnOverlay?: boolean
  }>(),
  {
    size: 'md',
    closeOnOverlay: true,
  },
)
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function close() {
  emit('update:modelValue', false)
}

// Handle escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

// Add/remove event listeners when modal opens/closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = '' // Restore background scroll
    }
  },
  { immediate: true },
)

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}
.pop-enter-from,
.pop-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
