<template>
  <div class="overflow-x-auto rounded-xs border border-gray-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-gray-50 text-xs font-semibold text-gray-600">
        <tr>
          <th v-for="c in columns" :key="c.key" class="px-4 py-2" :class="c.class">
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!items || items.length === 0">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-gray-500">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-for="(row, i) in items" :key="i" class="border-t hover:bg-gray-50">
          <td v-for="c in columns" :key="c.key" class="px-4 py-2 align-top">
            <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">
              {{ c.formatter ? c.formatter(row[c.key], row) : row[c.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Column<T> = {
  key: keyof T & string
  label: string
  align?: 'left' | 'center' | 'right'
  class?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any, row: T) => string
}

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Record<string, any>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Column<any>[]
  emptyText?: string
}>()
const emptyText = computed(() => props.emptyText ?? 'No data')
</script>
