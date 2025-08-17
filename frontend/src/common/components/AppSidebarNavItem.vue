<template>
  <RouterLink
    :to="to"
    class="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
  >
    {{ label }}
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ to: string; label: string }>()
</script>
