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
      <div v-if="modelValue" class="fixed inset-0 z-[1101] grid place-items-center p-4">
        <div
          class="w-full rounded-xl bg-white shadow-xl"
          :class="sizes[size]"
          role="dialog"
          aria-modal="true"
        >
          <div class="border-b border-gray-200 px-5 py-4 text-base font-semibold text-gray-800">
            <slot name="title">{{ title }}</slot>
          </div>
          <div class="p-5">
            <slot />
          </div>
          <div class="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
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
type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

withDefaults(
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
