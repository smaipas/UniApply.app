<template>
  <router-view />

  <UiToast />
  <UiModal
    v-model="isOpen"
    :title="modal.data.title"
    :size="modal.data.size || 'md'"
    :close-on-overlay="modal.data.closeOnOverlay ?? true"
  >
    <component
      v-if="modal.data.component"
      :is="modal.data.component"
      v-bind="modal.data.componentProps"
    />
    <div v-else-if="modal.data.message" class="prose prose-sm max-w-none">
      {{ modal.data.message }}
    </div>

    <template #footer>
      <div v-if="modal.data.showDefaultFooter" class="flex items-center justify-end gap-2">
        <UiButton variant="outline" @click="modal.resolve(false)">Cancel</UiButton>
        <UiButton variant="primary" @click="modal.resolve(true)">Confirm</UiButton>
      </div>
      <slot v-else />
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModalStore } from '@/common/store/modal'
import UiToast from '@/common/components/UiToast.vue'
import UiModal from '@/common/components/UiModal.vue'
import UiButton from '@/common/components/UiButton.vue'

const modal = useModalStore()

const isOpen = computed({
  get: () => modal.open,
  set: (v: boolean) => (v ? (modal.open = true) : modal.close()),
})
</script>
