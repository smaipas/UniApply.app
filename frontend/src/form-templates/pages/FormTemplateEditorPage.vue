<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">{{ isEdit ? 'Edit' : 'Create' }} Form Template</h1>
      <div class="flex gap-2">
        <UiButton flat :icon="mdiArrowLeft" @click="goBack">Back</UiButton>
        <UiButton :disabled="!canSave || saving" :icon="mdiFloppy" @click="save">{{
          saving ? 'Saving…' : 'Save'
        }}</UiButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-y-6">
      <UiCard title="General">
        <div class="space-y-4">
          <UiInput label="Title" v-model="form.title" :error="titleError || ''" />
          <UiInput label="Description" v-model="form.description" />
          <UiCheckbox label="Active" v-model="form.active" />
        </div>
      </UiCard>

      <UiCard class="md:col-span-2" title="Fields">
        <div v-if="form.fields.length === 0" class="text-sm text-gray-500 mb-4">No fields yet</div>
        <p v-if="fieldsError" class="text-sm text-red-600 mt-1">At least one field is required</p>
        <div
          v-for="(f, i) in form.fields"
          :key="i"
          class="relative grid grid-cols-1 gap-2 md:grid-cols-3 items-start bg-gray-100 p-4 rounded-md my-2"
        >
          <div class="col-span-4 flex justify-end">
            <UiButton flat color="red" :icon="mdiClose" size="sm" @click="removeField(i)">
              Remove
            </UiButton>
          </div>

          <div class="col-span-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
            <UiInput
              label="Name"
              :model-value="f.name"
              @update:modelValue="(v) => onFieldNameInput(i, v)"
              :error="fieldNameErrors[i]"
            />
            <UiInput label="Label" v-model="f.label" :error="fieldLabelErrors[i]" />
            <UiSelect
              label="Type"
              :model-value="f.inputType"
              :options="fieldTypeOptions"
              placeholder="Select a type…"
              @update:modelValue="(val) => onFieldTypeChange(i, val as string)"
            />
          </div>

          <div v-if="isDefaultApplicable(f.inputType)" class="md:col-span-3">
            <textarea
              v-if="f.inputType === 'LONG_TEXT'"
              rows="10"
              v-model="(f as any).defaultValue"
              class="col-span-3 w-full rounded-xs border bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:ring-2 border-gray-300 focus:border-primary focus:ring-primary/30 disabled:bg-gray-100"
              placeholder="Default prefilled text (optional)"
            ></textarea>
            <template v-else>
              <UiInput
                :type="f.inputType === 'NUMBER' ? 'number' : 'text'"
                v-model="(f as any).defaultValue"
                :placeholder="
                  f.inputType === 'NUMBER'
                    ? 'Default prefilled number (optional)'
                    : 'Default prefilled text (optional)'
                "
              />
            </template>
          </div>

          <div v-if="f.inputType === 'SELECT'" class="md:col-span-3 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Options</label>
              <UiButton flat :icon="mdiPlus" size="sm" @click="addOption(i)">Add option</UiButton>
            </div>
            <div v-if="!f.options || f.options.length === 0" class="text-sm text-gray-500">
              No options yet
            </div>
            <div v-for="(opt, oi) in f.options" :key="oi" class="flex items-center gap-2">
              <UiInput class="flex-1" v-model="(f.options || (f.options = []))[oi]" />
              <UiButton flat color="red" :icon="mdiClose" size="sm" @click="removeOption(i, oi)" />
            </div>
          </div>

          <div class="md:col-span-3 mt-2 space-y-3">
            <div class="text-sm font-bold text-gray-500 border-b border-gray-300 pb-1">
              Validations
            </div>
            <div class="flex items-center gap-3">
              <UiCheckbox
                label="Required"
                :model-value="getRequired(f)"
                @update:modelValue="(v) => setRequired(f, v)"
              />
            </div>

            <div
              v-if="f.inputType === 'TEXT' || f.inputType === 'LONG_TEXT'"
              class="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              <UiInput
                label="Min characters"
                type="number"
                :model-value="getMin(f)"
                @update:modelValue="(v) => setMin(f, toNumberOrNull(v))"
              />
              <UiInput
                label="Max characters"
                type="number"
                :model-value="getMax(f)"
                @update:modelValue="(v) => setMax(f, toNumberOrNull(v))"
              />
            </div>

            <div v-else-if="f.inputType === 'NUMBER'" class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <UiInput
                label="Min value"
                type="number"
                :model-value="getMin(f)"
                @update:modelValue="(v) => setMin(f, toNumberOrNull(v))"
              />
              <UiInput
                label="Max value"
                type="number"
                :model-value="getMax(f)"
                @update:modelValue="(v) => setMax(f, toNumberOrNull(v))"
              />
            </div>

            <div v-else-if="f.inputType === 'FILE'" class="space-y-2">
              <label class="text-sm text-gray-700">Allowed file types</label>
              <div class="flex flex-wrap gap-3">
                <label
                  v-for="ext in fileTypeOptions"
                  :key="ext"
                  class="inline-flex items-center gap-2 text-sm"
                >
                  <UiCheckbox
                    :model-value="getEnumIncludes(f, ext)"
                    @update:modelValue="(v) => toggleEnumValue(f, ext, v)"
                  />
                  <span>.{{ ext }}</span>
                </label>
              </div>
            </div>

            <div v-else-if="f.inputType === 'DATE'" class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <UiInput
                label="From date"
                type="date"
                :model-value="getDateMin(f)"
                @update:modelValue="(v) => setMin(f, v || null)"
              />
              <UiInput
                label="To date"
                type="date"
                :model-value="getDateMax(f)"
                @update:modelValue="(v) => setMax(f, v || null)"
              />
            </div>
          </div>
        </div>
        <UiButton color="secondary" :icon="mdiPlus" outline class="mt-4" @click="addField"
          >Add field</UiButton
        >
      </UiCard>

      <UiCard title="Approval steps">
        <label class="mb-5 block text-sm font-medium text-gray-500">
          Select the user groups that will have to approve the applications created from this
          template.
        </label>
        <div class="space-y-6">
          <div v-for="(s, i) in form.approvalSteps" :key="i" class="relative pl-10">
            <div class="absolute left-0 top-1 flex items-center justify-center">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
              >
                {{ i + 1 }}
              </div>
            </div>
            <div
              v-if="i < form.approvalSteps.length - 1"
              class="absolute left-[12px] top-8 -bottom-6 w-px bg-gray-300"
            ></div>

            <div class="flex items-center gap-3">
              <template v-if="s.role && editingIndex !== i">
                <span class="text-sm font-medium text-gray-800">{{ s.role }}</span>
                <UiButton flat color="red" :icon="mdiClose" size="sm" @click="removeStep(i)" />
              </template>

              <template v-else-if="editingIndex === i">
                <UiSelect
                  class="w-72"
                  v-model="pendingRole"
                  :options="availableRoles(i).map((r) => ({ label: r, value: r }))"
                  placeholder="Select a role…"
                />
                <UiButton flat color="red" :icon="mdiClose" size="sm" @click="cancelEdit(i)" />
                <UiButton
                  flat
                  color="green"
                  :icon="mdiCheck"
                  size="sm"
                  :disabled="!pendingRole"
                  @click="acceptEdit(i)"
                />
              </template>
            </div>
          </div>

          <UiButton
            color="secondary"
            :icon="mdiPlus"
            outline
            :disabled="!canAddStep"
            @click="addStep"
            >Add step</UiButton
          >
          <p v-if="approvalStepsError" class="text-sm text-red-600 mt-1">
            At least one approval group is required
          </p>
        </div>
      </UiCard>

      <UiCard title="Visible to user groups" class="md:col-span-2">
        <label class="mb-5 block text-sm font-medium text-gray-500">
          Select the user groups that will be able to create an application from using this form
          template.
        </label>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
          <label v-for="r in roleOptions" :key="r" class="inline-flex items-center gap-2 text-sm">
            <UiCheckbox
              :model-value="isRoleVisible(r)"
              @update:modelValue="(v) => toggleVisibleRole(r, v)"
            />
            <span>{{ r }}</span>
          </label>
        </div>
        <p v-if="visibleRolesError" class="text-sm text-red-600 mt-1">
          At least one visible user group is required
        </p>
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
import { mdiArrowLeft, mdiFloppy, mdiClose, mdiCheck, mdiPlus } from '@mdi/js'
import type { FormTemplate } from '@uniapply/shared'
import { useRolesStore } from '@/common/store/roles'
import UiSelect from '@/common/components/UiSelect.vue'
import UiCheckbox from '@/common/components/UiCheckbox.vue'

const NAME_RX = /^[a-z0-9-]+$/

type TemplateField = {
  name: string
  label: string
  inputType: string
  defaultValue?: string | number
  options?: string[]
  validationRules?: unknown[]
}
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

const rolesStore = useRolesStore()
const roleOptions = computed(() => rolesStore.roleNames)

// Field name sanitization and errors
function sanitizeFieldName(v: string): string {
  return String(v || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
}
function onFieldNameInput(index: number, value: string) {
  form.value.fields[index].name = sanitizeFieldName(value)
}
const fieldNameErrors = computed<Record<number, string>>(() => {
  const errors: Record<number, string> = {}
  const counts = new Map<string, number>()
  for (const f of form.value.fields) {
    const key = f.name || ''
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  form.value.fields.forEach((f, i) => {
    if (!f.name) {
      errors[i] = 'Name is required'
      return
    }
    if (!NAME_RX.test(f.name)) {
      errors[i] = 'Lowercase letters, numbers, and dash only'
      return
    }
    if ((counts.get(f.name) || 0) > 1) {
      errors[i] = 'Name must be unique'
    }
  })
  return errors
})
const hasFieldNameErrors = computed(() => Object.values(fieldNameErrors.value).some(Boolean))

const fieldLabelErrors = computed<Record<number, string>>(() => {
  const errors: Record<number, string> = {}
  form.value.fields.forEach((f, i) => {
    if (!String(f.label || '').trim()) {
      errors[i] = 'Label is required'
    }
  })
  return errors
})
const hasFieldLabelErrors = computed(() => Object.values(fieldLabelErrors.value).some(Boolean))

// Field type options
const fieldTypeOptions = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Long text', value: 'LONG_TEXT' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'File', value: 'FILE' },
  { label: 'Date', value: 'DATE' },
  { label: 'Select', value: 'SELECT' },
  { label: 'Checkbox', value: 'CHECKBOX' },
]

function isDefaultApplicable(t: string) {
  return t === 'TEXT' || t === 'LONG_TEXT' || t === 'NUMBER'
}

function onFieldTypeChange(index: number, newType: string) {
  const f = form.value.fields[index]
  f.inputType = newType
  delete f.defaultValue
  if (newType === 'SELECT') {
    f.options = []
  } else {
    delete f.options
  }
}

// Inline editor state for approval steps
const editingIndex = ref<number | null>(null)
const pendingRole = ref<string>('')

function availableRoles(currentIndex: number): string[] {
  const used = new Set(
    form.value.approvalSteps
      .map((s, idx) => (idx === currentIndex ? '' : s.role))
      .filter((r): r is string => !!r),
  )
  return roleOptions.value.filter((r) => !used.has(r))
}

const canAddStep = computed(() => {
  const used = new Set(form.value.approvalSteps.map((s) => s.role).filter((r): r is string => !!r))
  return roleOptions.value.some((r) => !used.has(r))
})

function isRoleVisible(role: string): boolean {
  return form.value.visibleToRoles.includes(role)
}
function toggleVisibleRole(role: string, checked: boolean) {
  const set = new Set(form.value.visibleToRoles)
  if (checked) set.add(role)
  else set.delete(role)
  form.value.visibleToRoles = Array.from(set)
}

function addStep() {
  const emptyIdx = form.value.approvalSteps.findIndex((s) => !s.role)
  if (emptyIdx !== -1) {
    editingIndex.value = emptyIdx
    pendingRole.value = ''
    return
  }
  form.value.approvalSteps.push({ role: '' })
  editingIndex.value = form.value.approvalSteps.length - 1
  pendingRole.value = ''
}

function cancelEdit(index: number) {
  if (editingIndex.value === index && !form.value.approvalSteps[index]?.role) {
    form.value.approvalSteps.splice(index, 1)
  }
  editingIndex.value = null
  pendingRole.value = ''
}

function acceptEdit(index: number) {
  if (!pendingRole.value) return
  form.value.approvalSteps[index].role = pendingRole.value
  editingIndex.value = null
  pendingRole.value = ''
}

function removeStep(i: number) {
  form.value.approvalSteps.splice(i, 1)
  if (editingIndex.value !== null && i === editingIndex.value) {
    editingIndex.value = null
    pendingRole.value = ''
  }
}

function addField() {
  form.value.fields.push({ name: '', label: '', inputType: 'TEXT', validationRules: [] })
}
function removeField(i: number) {
  form.value.fields.splice(i, 1)
}

function addOption(fieldIndex: number) {
  const f = form.value.fields[fieldIndex]
  if (!f.options) f.options = []
  f.options.push('')
}
function removeOption(fieldIndex: number, optionIndex: number) {
  const f = form.value.fields[fieldIndex]
  if (!f.options) return
  f.options.splice(optionIndex, 1)
}

async function load() {
  if (!isEdit.value) return
  const res = await api.get(`/forms/${id.value}`)
  const t = res.data as FormTemplate
  const normalizedFields: TemplateField[] = (t.fields || []).map((raw: unknown) => {
    const r = raw as {
      name?: unknown
      label?: unknown
      inputType?: unknown
      defaultValue?: unknown
      validationRules?: unknown
      options?: unknown
    }
    const nf: TemplateField = {
      name: String(r?.name || ''),
      label: String(r?.label || ''),
      inputType: String(r?.inputType || 'TEXT'),
      defaultValue: r?.defaultValue as string | number | undefined,
      validationRules: Array.isArray(r?.validationRules) ? (r.validationRules as unknown[]) : [],
    }
    if (nf.inputType === 'SELECT') {
      const opts = r?.options
      if (Array.isArray(opts)) {
        if (opts.length && typeof opts[0] === 'object') {
          nf.options = (opts as Array<{ label?: string; value?: string }>)
            .map((o) => o?.value ?? o?.label ?? '')
            .map((s) => String(s))
        } else {
          nf.options = (opts as Array<unknown>).map((s) => String(s ?? ''))
        }
      } else {
        nf.options = []
      }
    }
    nf.name = sanitizeFieldName(nf.name)
    return nf
  })
  form.value = {
    title: t.title,
    description: t.description,
    fields: normalizedFields,
    approvalSteps: t.approvalSteps?.map((s: { role: string }) => ({ role: s.role })) || [],
    visibleToRoles: t.visibleToRoles || [],
    active: !!t.active,
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      fields: form.value.fields.map((f) => {
        const out: TemplateField = { ...f, name: sanitizeFieldName(f.name) }
        if (isDefaultApplicable(f.inputType)) {
          if (f.inputType === 'NUMBER') {
            if (out.defaultValue === '' || typeof out.defaultValue === 'undefined')
              delete out.defaultValue
            else out.defaultValue = Number(out.defaultValue)
          }
        } else {
          delete out.defaultValue
        }
        if (f.inputType === 'SELECT') {
          out.options = (f.options || []).map((s) => String(s).trim()).filter((s) => s.length > 0)
        } else {
          delete out.options
        }
        return out as TemplateField
      }),
    }
    if (isEdit.value) {
      await api.put(`/forms/${id.value}`, payload)
    } else {
      const res = await api.post('/forms', payload)
      const newId = (res.data as FormTemplate)?.id
      if (newId) router.replace(`/form-templates/${newId}`)
    }
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/form-templates')
}

// New computed properties for validation
const titleError = computed(() =>
  String(form.value.title || '').trim() ? '' : 'Title is required',
)

const fieldsError = computed(() => form.value.fields.length === 0)

const approvalStepsError = computed(
  () => !form.value.approvalSteps.some((s) => String(s.role || '').trim()),
)

const visibleRolesError = computed(() => form.value.visibleToRoles.length === 0)

const canSave = computed(
  () =>
    !titleError.value &&
    !fieldsError.value &&
    !approvalStepsError.value &&
    !visibleRolesError.value &&
    !hasFieldNameErrors.value &&
    !hasFieldLabelErrors.value,
)

const fileTypeOptions = ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png']

function toNumberOrNull(v: string | number | undefined): number | null {
  const n = Number(v)
  return isFinite(n) ? n : null
}

function getRule(f: TemplateField, rule: 'required' | 'min' | 'max' | 'enum') {
  const arr = (f.validationRules || []) as Array<{ rule: string; value?: unknown }>
  return arr.find((r) => r.rule === rule)
}
function setRule(
  f: TemplateField,
  rule: 'required' | 'min' | 'max' | 'enum',
  value: unknown | null,
) {
  const arr = (f.validationRules || []) as Array<{ rule: string; value?: unknown }>
  const idx = arr.findIndex((r) => r.rule === rule)
  if (
    value === null ||
    typeof value === 'undefined' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    if (idx !== -1) arr.splice(idx, 1)
  } else {
    const entry: { rule: string; value?: unknown } = { rule, value }
    if (idx === -1) arr.push(entry)
    else arr[idx] = entry
  }
  f.validationRules = arr
}

function getRequired(f: TemplateField): boolean {
  return !!getRule(f, 'required')
}
function setRequired(f: TemplateField, v: boolean) {
  setRule(f, 'required', v ? true : null)
}

function getMin(f: TemplateField): number | string | undefined {
  const r = getRule(f, 'min')
  return r?.value as number | string | undefined
}
function setMin(f: TemplateField, v: number | string | null) {
  setRule(f, 'min', v)
}
function getMax(f: TemplateField): number | string | undefined {
  const r = getRule(f, 'max')
  return r?.value as number | string | undefined
}
function setMax(f: TemplateField, v: number | string | null) {
  setRule(f, 'max', v)
}
function getEnum(f: TemplateField): string[] {
  const r = getRule(f, 'enum')
  return Array.isArray(r?.value) ? (r?.value as string[]) : []
}
function getEnumIncludes(f: TemplateField, val: string): boolean {
  return getEnum(f).includes(val)
}
function toggleEnumValue(f: TemplateField, val: string, on: boolean) {
  const current = new Set(getEnum(f))
  if (on) current.add(val)
  else current.delete(val)
  setRule(f, 'enum', Array.from(current))
}

function getDateMin(f: TemplateField): string | undefined {
  const v = getMin(f)
  return typeof v === 'string' ? v : undefined
}
function getDateMax(f: TemplateField): string | undefined {
  const v = getMax(f)
  return typeof v === 'string' ? v : undefined
}

onMounted(async () => {
  await rolesStore.ensureLoaded()
  await load()
})
</script>
