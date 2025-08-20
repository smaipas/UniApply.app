<template>
  <UiModal v-model="isOpen" title="Select Form Template" size="lg">
    <div class="space-y-6">
      <!-- Search/Filter -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search form templates..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <svg
          class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded mb-3"></div>
          <div class="h-3 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Templates Grid -->
      <div
        v-else-if="filteredTemplates.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer"
          :class="{ 'border-primary bg-primary/5': selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ template.title }}</h3>
            <div v-if="selectedTemplate?.id === template.id" class="text-primary">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <p v-if="template.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ template.description }}
          </p>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>{{ template.fields?.length || 0 }} fields</span>
            <span v-if="template.version" class="bg-gray-100 px-2 py-1 rounded text-xs">
              v{{ template.version }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No templates found' : 'No templates available' }}
        </h3>
        <p class="text-gray-600">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Contact an administrator to create form templates'
          }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <UiButton flat @click="close">Cancel</UiButton>
        <UiButton :disabled="!selectedTemplate" @click="createApplication">
          Create Application
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { UiModal, UiButton } from '@/common/components'
import { useToastStore } from '@/common/store/toast'
import api from '@/app/axios'

interface FormTemplate {
  id: string
  title: string
  description?: string
  version?: number
  fields?: any[]
  active?: boolean
}

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const toastStore = useToastStore()

const loading = ref(false)
const templates = ref<FormTemplate[]>([])
const selectedTemplate = ref<FormTemplate | null>(null)
const searchQuery = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value.filter((t) => t.active)

  const query = searchQuery.value.toLowerCase()
  return templates.value.filter(
    (template) =>
      template.active &&
      (template.title.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query)),
  )
})

async function fetchTemplates() {
  loading.value = true
  try {
    const response = await api.get('/forms')
    templates.value = response.data
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to load form templates',
    })
  } finally {
    loading.value = false
  }
}

function selectTemplate(template: FormTemplate) {
  selectedTemplate.value = template
}

function createApplication() {
  if (!selectedTemplate.value) return

  const templateId = selectedTemplate.value.id
  close()
  router.push(`/applications/new?template=${templateId}`)
}

function close() {
  isOpen.value = false
  selectedTemplate.value = null
  searchQuery.value = ''
}

watch(isOpen, (newValue) => {
  if (newValue) {
    fetchTemplates()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
