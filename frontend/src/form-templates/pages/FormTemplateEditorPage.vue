<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ isEdit ? 'Edit' : 'Create' }} Form Template</h1>
      <div class="flex gap-2">
        <UiButton variant="ghost" @click="goBack">Back</UiButton>
        <UiButton :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save' }}</UiButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <UiCard>
        <div class="space-y-4">
          <UiInput label="Title" v-model="form.title" />
          <UiInput label="Description" v-model="form.description" />
          <div class="flex items-center gap-2">
            <input id="active" type="checkbox" v-model="form.active" />
            <label for="active" class="text-sm">Active</label>
          </div>
        </div>
      </UiCard>

      <UiCard>
        <h2 class="mb-2 text-sm font-medium">Approval steps</h2>
        <div class="space-y-2">
          <div v-for="(s, i) in form.approvalSteps" :key="i" class="flex gap-2">
            <UiInput class="flex-1" label="Role" v-model="s.role" />
            <UiButton variant="ghost" @click="removeStep(i)">Remove</UiButton>
          </div>
          <UiButton variant="secondary" @click="addStep">Add step</UiButton>
        </div>
      </UiCard>

      <UiCard class="md:col-span-2">
        <h2 class="mb-2 text-sm font-medium">Fields</h2>
        <div class="space-y-3">
          <div v-for="(f, i) in form.fields" :key="i" class="grid grid-cols-1 gap-2 md:grid-cols-4">
            <UiInput label="Name" v-model="f.name" />
            <UiInput label="Label" v-model="f.label" />
            <UiInput label="Type (TEXT/NUMBER/FILE/DATE/SELECT/CHECKBOX)" v-model="f.inputType" />
            <UiButton variant="ghost" @click="removeField(i)">Remove</UiButton>
          </div>
          <UiButton variant="secondary" @click="addField">Add field</UiButton>
        </div>
      </UiCard>

      <UiCard class="md:col-span-2">
        <h2 class="mb-2 text-sm font-medium">Visible to roles</h2>
        <UiInput label="Comma-separated roles" v-model="visibleRolesCsv" />
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UiButton from '@/common/components/UiButton.vue'
import UiInput from '@/common/components/UiInput.vue'
import UiCard from '@/common/components/UiCard.vue'
import api from '@/app/axios'

type TemplateField = { name: string; label: string; inputType: string; validationRules?: any[] }
type TemplateForm = {
  title: string
  description?: string
  fields: TemplateField[]
  approvalSteps: Array<{ role: string }>
  visibleToRoles: string[]
  active: boolean
}

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const saving = ref(false)
const form = ref<TemplateForm>({
  title: '',
  description: '',
  fields: [],
  approvalSteps: [{ role: 'ADMIN' }],
  visibleToRoles: ['USER', 'ADMIN'],
  active: true,
})
const visibleRolesCsv = computed({
  get: () => form.value.visibleToRoles.join(', '),
  set: (v: string) => {
    form.value.visibleToRoles = v
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  },
})

function addStep() {
  form.value.approvalSteps.push({ role: '' })
}
function removeStep(i: number) {
  form.value.approvalSteps.splice(i, 1)
}
function addField() {
  form.value.fields.push({ name: '', label: '', inputType: 'TEXT', validationRules: [] })
}
function removeField(i: number) {
  form.value.fields.splice(i, 1)
}

async function load() {
  if (!isEdit.value) return
  const res = await api.get(`/forms/${id.value}`)
  const t = res.data as any
  form.value = {
    title: t.title,
    description: t.description,
    fields: t.fields || [],
    approvalSteps: t.approvalSteps?.map((s: any) => ({ role: s.role })) || [],
    visibleToRoles: t.visibleToRoles || [],
    active: !!t.active,
  }
}

async function save() {
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/forms/${id.value}`, form.value)
    } else {
      const res = await api.post('/forms', form.value)
      const newId = (res.data as any)?.id
      if (newId) router.replace(`/form-templates/${newId}`)
    }
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/form-templates')
}

onMounted(load)
</script>
