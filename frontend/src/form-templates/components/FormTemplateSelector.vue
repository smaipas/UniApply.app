<template>
  <UiModal v-model="isOpen" title="Select Form Template" size="xl">
    <div class="space-y-6">
      <!-- Search/Filter -->
      <UiInput v-model="searchQuery" placeholder="Search form templates..." :icon="mdiMagnify" />

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
            <h3
              class="font-semibold text-gray-900 mb-1 break-words overflow-wrap-anywhere min-w-0 flex-1"
            >
              {{ template.title }}
            </h3>
            <div v-if="selectedTemplate?.id === template.id" class="text-primary">
              <UiIcon :path="mdiCheck" class="h-6 w-6" />
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
          <UiIcon :path="mdiFileDocumentOutline" class="mx-auto h-12 w-12" />
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
import { UiModal, UiButton, UiIcon, UiInput } from '@/common/components'
import { useToastStore } from '@/common/store/toast'
import api from '@/app/axios'
import { mdiMagnify, mdiCheck, mdiFileDocumentOutline } from '@mdi/js'

interface FormTemplate {
  id: string
  title: string
  description?: string
  version?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
