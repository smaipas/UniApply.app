<template>
  <teleport to="body">
    <transition name="fade" appear>
      <div v-if="modelValue" class="fixed inset-0 z-[1000] bg-black/40" @click="onOverlayClick" />
    </transition>

    <transition :name="side === 'left' ? 'slide-left' : 'slide-right'" appear>
      <aside
        v-if="modelValue"
        class="fixed top-0 bottom-0 z-[1001] bg-white shadow-2xl"
        :class="[side === 'left' ? 'left-0' : 'right-0', widthClass]"
        @keyup.esc="close"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex h-full flex-col">
          <div class="border-b p-4 text-sm font-semibold text-gray-700">
            <slot name="title">Menu</slot>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <slot />
          </div>
        </div>
      </aside>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    side?: 'left' | 'right'
    widthClass?: string // override width if desired
    closeOnOverlay?: boolean
  }>(),
  {
    side: 'left',
    widthClass: 'w-80',
    closeOnOverlay: true,
  },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function close() {
  emit('update:modelValue', false)
}
function onOverlayClick() {
  if (props.closeOnOverlay) close()
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
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.2s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
