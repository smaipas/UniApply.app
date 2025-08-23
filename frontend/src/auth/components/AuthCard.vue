<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow">
      <!-- Logo header (shown by default, can be hidden via prop) -->
      <div v-if="showLogo" class="mb-6 flex items-center justify-center gap-2">
        <UiLogo :size="logoSize" />
        <span v-if="showBrandText" class="text-lg font-semibold text-gray-900">
          {{ config.appName }}
        </span>
      </div>

      <!-- Optional custom header slot (overrides logo row if used) -->
      <slot name="header" />

      <!-- Main content from each auth page -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiLogo } from '@/common/components'
import { config } from '@/common/utils/config'

withDefaults(
  defineProps<{
    showLogo?: boolean
    showBrandText?: boolean
    logoSize?: number
  }>(),
  {
    showLogo: true,
    showBrandText: true,
    logoSize: 40,
  },
)
</script>
