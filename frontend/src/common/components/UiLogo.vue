<template>
  <img
    :src="src"
    :alt="alt"
    :width="size"
    :height="size"
    class="inline-block select-none"
    draggable="false"
  />
</template>

<script setup lang="ts">
import logoUrl from '@/common/assets/images/uniapply-logo.svg'

withDefaults(
  defineProps<{
    size?: number // px
    alt?: string
    src?: string // optional override, defaults to our svg
  }>(),
  {
    size: 24,
    alt: 'UniApply',
    src: logoUrl,
  },
)
</script>
