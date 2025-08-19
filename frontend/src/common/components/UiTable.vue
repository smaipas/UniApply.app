<template>
  <div class="overflow-x-auto rounded-xs border border-gray-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-primary text-white text-xs font-semibold">
        <tr>
          <th v-for="c in columns" :key="c.key" class="px-4 py-3" :class="c.class">
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Skeleton loader -->
        <template v-if="loading">
          <tr v-for="i in skeletonRows" :key="`skeleton-${i}`" class="border-t border-gray-100">
            <td v-for="c in columns" :key="c.key" class="px-4 py-3 align-top">
              <div class="animate-pulse">
                <div
                  class="h-4 bg-gray-200 rounded"
                  :style="{ width: getSkeletonWidth(c.key) }"
                ></div>
              </div>
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="!items || items.length === 0">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-gray-500">
            {{ emptyText }}
          </td>
        </tr>

        <!-- Data rows -->
        <tr
          v-else
          v-for="(row, i) in items"
          :key="i"
          class="border-t border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
          @click="$emit('rowClick', row)"
        >
          <td v-for="c in columns" :key="c.key" class="px-4 py-3 align-top">
            <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">
              <span
                v-if="c.formatter && c.formatter(row[c.key], row).includes('<')"
                v-html="c.formatter(row[c.key], row)"
              ></span>
              <span v-else>{{ c.formatter ? c.formatter(row[c.key], row) : row[c.key] }}</span>
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
  loading?: boolean
  skeletonRows?: number
}>()

const emit = defineEmits<{
  rowClick: [row: Record<string, any>]
}>()

const emptyText = computed(() => props.emptyText ?? 'No data')

const skeletonRows = computed(() => props.skeletonRows ?? 5)

function getSkeletonWidth(key: string): string {
  // Different widths for different column types
  const widths: Record<string, string> = {
    title: '80%',
    active: '60px',
    updatedAt: '120px',
    // Add more column-specific widths as needed
  }
  return widths[key] || '60%'
}
</script>
