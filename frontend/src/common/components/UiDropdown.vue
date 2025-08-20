<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <div>
      <slot name="trigger" :toggle="toggle" :isOpen="isOpen">
        <button
          type="button"
          @click="toggle"
          class="inline-flex w-full justify-center gap-x-1.5 rounded-xs bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Options
          <UiIcon :path="mdiChevronDown" class="-mr-1 h-5 w-5 text-gray-400" />
        </button>
      </slot>
    </div>
  </div>

  <!-- Portal the dropdown to body to avoid overflow issues -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownMenuRef"
        class="fixed z-50 w-56 rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none overflow-hidden"
        :style="dropdownStyle"
      >
        <div class="py-1 max-h-64 overflow-y-auto">
          <slot :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { mdiChevronDown } from '@mdi/js'
import { UiIcon } from '@/common/components'

interface Props {
  placement?: 'left' | 'right'
  width?: string
}

withDefaults(defineProps<Props>(), {
  placement: 'right',
  width: 'w-56',
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const dropdownMenuRef = ref<HTMLElement>()
const dropdownStyle = ref({
  top: '0px',
  left: '0px',
})

function toggle() {
  isOpen.value = !isOpen.value

  if (isOpen.value && dropdownRef.value) {
    // Calculate position for the dropdown
    nextTick(() => {
      if (dropdownRef.value && dropdownMenuRef.value) {
        const rect = dropdownRef.value.getBoundingClientRect()
        const dropdownRect = dropdownMenuRef.value.getBoundingClientRect()

        let left = rect.right
        let top = rect.bottom + 8 // 8px gap

        // Check if dropdown would overflow right edge
        if (left + dropdownRect.width > window.innerWidth) {
          left = rect.left - dropdownRect.width
        }

        // Check if dropdown would overflow bottom edge
        if (top + dropdownRect.height > window.innerHeight) {
          top = rect.top - dropdownRect.height - 8
        }

        dropdownStyle.value = {
          top: `${top}px`,
          left: `${left}px`,
        }
      }
    })
  }
}

function close() {
  isOpen.value = false
}

function handleClickOutside(event: Event) {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
    dropdownMenuRef.value &&
    !dropdownMenuRef.value.contains(event.target as Node)
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  close,
  toggle,
})
</script>
