<template>
  <div class="p-6 space-y-6">
    <UiLoadingOverlay :show="loading" message="Loading form template..." />
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ isEdit ? 'Edit' : 'Create' }} Form Template</h1>
        <p v-if="isEdit && formVersion" class="text-sm text-gray-600 mt-1">
          Version {{ formVersion }}
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton flat :icon="mdiArrowLeft" @click="goBack">Back</UiButton>
        <UiButton
          :disabled="!canSave || saving || !canModifyFormTemplates"
          :icon="mdiFloppy"
          @click="save"
          >{{ saving ? 'Saving…' : 'Save' }}</UiButton
        >
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
          class="relative flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-2 items-start bg-gray-100 p-4 rounded-md my-2"
        >
          <div class="w-full md:col-span-3 flex justify-end">
            <UiButton flat color="red" :icon="mdiClose" size="sm" @click="removeField(i)">
              Remove
            </UiButton>
          </div>

          <div class="w-full md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
            <UiInput
              label="Name"
              :model-value="f.name"
              @update:modelValue="(v) => onFieldNameInput(i, v)"
              :error="fieldNameErrors[i]"
            />
            <UiInput
              label="Label"
              v-model="f.label"
              :error="fieldLabelErrors[i]"
              placeholder="Optional display label"
            />
            <UiSelect
              label="Type"
              :model-value="f.inputType"
              :options="fieldTypeOptions"
              placeholder="Select a type…"
              @update:modelValue="(val) => onFieldTypeChange(i, val as string)"
            />
          </div>

          <div v-if="isDefaultApplicable(f.inputType)" class="w-full md:col-span-3">
            <UiTextarea
              v-if="f.inputType === 'LONG_TEXT'"
              :rows="10"
              v-model="(f as any).defaultValue"
              placeholder="Default prefilled text (optional)"
            />
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

          <div v-if="f.inputType === 'SELECT'" class="w-full md:col-span-3 space-y-2">
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
            <div class="mt-2">
              <UiCheckbox
                label="Allow multiple values selection"
                v-model="f.allowSelectMultipleValues"
              />
            </div>
          </div>

          <div v-if="f.inputType === 'FIXED_TEXT'" class="w-full md:col-span-3 space-y-2">
            <label class="text-sm font-medium text-gray-700">Fixed Text Content</label>
            <UiTextarea
              v-model="f.fixedTextContent"
              :rows="6"
              placeholder="Enter the text content to display..."
            />
          </div>

          <div v-if="f.inputType !== 'FIXED_TEXT'" class="w-full md:col-span-3 mt-2 space-y-3">
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
              <UiDateInput
                label="From date"
                :model-value="getDateMin(f)"
                @update:modelValue="(v: string) => setMin(f, v || null)"
              />
              <UiDateInput
                label="To date"
                :model-value="getDateMax(f)"
                @update:modelValue="(v: string) => setMax(f, v || null)"
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
          Configure the approval workflow for applications created from this template.
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
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-gray-500 uppercase">{{
                    getStepTypeLabel(s.type)
                  }}</span>
                  <span class="text-sm font-medium text-gray-800">
                    {{ getStepDisplayText(s) }}
                  </span>
                </div>
                <div v-if="s.type === 'DYNAMIC_USER' && s.label" class="text-xs text-gray-600">
                  Label: {{ s.label }}
                </div>
              </div>
              <UiButton flat color="red" :icon="mdiClose" size="sm" @click="removeStep(i)" />
            </div>
          </div>

          <UiButton color="secondary" :icon="mdiPlus" outline @click="showApprovalStepModal = true"
            >Add step</UiButton
          >
          <p v-if="approvalStepsError" class="text-sm text-red-600 mt-1">
            At least one approval step is required
          </p>
        </div>
        <div class="mt-6 border-t border-gray-300 pt-6">
          <UiCheckbox
            label="Allow application creators to select approvers from user groups"
            v-model="form.allowApplicationCreatorsToSelectApprover"
          />
          <div v-if="form.allowApplicationCreatorsToSelectApprover" class="space-y-2">
            <label class="text-sm font-medium text-gray-700">
              User groups for approver selection
            </label>
            <div class="grid grid-cols-2 gap-2 md:grid-cols-4 mt-2">
              <label
                v-for="r in roleOptions"
                :key="r"
                class="inline-flex items-center gap-2 text-sm"
              >
                <UiCheckbox
                  :model-value="isApproverSelectionRole(r)"
                  @update:modelValue="(v) => toggleApproverSelectionRole(r, v)"
                />
                <span>{{ r }}</span>
              </label>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Approval Step Modal -->
      <ApprovalStepModal
        v-model="showApprovalStepModal"
        :available-roles="roleOptions"
        :existing-steps="form.approvalSteps"
        @add="addApprovalStep"
      />

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
import { UiButton } from '@/common/components'
import { UiInput, UiCard, UiLoadingOverlay, UiDateInput, UiTextarea } from '@/common/components'
import api from '@/app/axios'
import { mdiArrowLeft, mdiFloppy, mdiClose, mdiPlus } from '@mdi/js'
import type { FormTemplate } from '@uniapply/shared'
import { useRolesStore } from '@/common/store/roles'
import { useToastStore } from '@/common/store/toast'
import { useAuthStore } from '@/auth/store'
import { UiSelect, UiCheckbox } from '@/common/components'
import ApprovalStepModal from '../components/ApprovalStepModal.vue'
import { getStepDisplayText, getStepTypeLabel } from '@/common/utils/approvalSteps'

// Extended user type with access permissions
type UserWithAccess = {
  access?: {
    applications?: {
      create?: boolean
      update?: boolean
      delete?: boolean
      approve?: boolean
      reject?: boolean
      readAll?: boolean
      readOwn?: boolean
    }
    formTemplates?: {
      create?: boolean
      readAll?: boolean
      readActive?: boolean
      update?: boolean
      delete?: boolean
    }
    users?: {
      create?: boolean
      readAll?: boolean
      update?: boolean
      delete?: boolean
    }
    auditLogs?: {
      read?: boolean
    }
    systemSettings?: {
      read?: boolean
      update?: boolean
    }
    roles?: {
      readAll?: boolean
      create?: boolean
      update?: boolean
      delete?: boolean
    }
  }
}

const NAME_RX = /^[a-z0-9-]+$/

type TemplateField = {
  name: string
  label: string
  inputType: string
  defaultValue?: string | number
  options?: string[]
  validationRules?: unknown[]
  allowSelectMultipleValues?: boolean
  fixedTextContent?: string
}
interface ApprovalStep {
  type: 'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'
  role?: string
  user?: {
    id: string
    firstName: string
    lastName: string
  }
  label?: string
}

type TemplateForm = {
  title: string
  description?: string
  fields: TemplateField[]
  approvalSteps: ApprovalStep[]
  visibleToRoles: string[]
  active: boolean
  allowApplicationCreatorsToSelectApprover: boolean
  approverSelectionUserGroups: string[]
}

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const saving = ref(false)
const loading = ref(false)
const formVersion = ref<number | undefined>()
const showApprovalStepModal = ref(false)

const form = ref<TemplateForm>({
  title: '',
  description: '',
  fields: [],
  approvalSteps: [{ type: 'USER_GROUP', role: 'ADMIN' }],
  visibleToRoles: ['USER', 'ADMIN'],
  active: true,
  allowApplicationCreatorsToSelectApprover: false,
  approverSelectionUserGroups: [],
})

const rolesStore = useRolesStore()
const toastStore = useToastStore()
const authStore = useAuthStore()
const roleOptions = computed(() => rolesStore.roleNames)

// Permission check
const canModifyFormTemplates = computed(() => {
  return (authStore.profile as UserWithAccess)?.access?.formTemplates?.update || false
})

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
  { label: 'Fixed text', value: 'FIXED_TEXT' },
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
    f.allowSelectMultipleValues = false
  } else {
    delete f.options
    delete f.allowSelectMultipleValues
  }
  if (newType === 'FIXED_TEXT') {
    f.fixedTextContent = ''
    // Clear validation rules for FIXED_TEXT fields
    f.validationRules = []
  } else {
    delete f.fixedTextContent
  }
}

// Approval step functions

function addApprovalStep(step: ApprovalStep) {
  form.value.approvalSteps.push(step)
}

function removeStep(i: number) {
  form.value.approvalSteps.splice(i, 1)
}

function isRoleVisible(role: string): boolean {
  return form.value.visibleToRoles.includes(role)
}

function toggleVisibleRole(role: string, checked: boolean) {
  const set = new Set(form.value.visibleToRoles)
  if (checked) set.add(role)
  else set.delete(role)
  form.value.visibleToRoles = Array.from(set)
}

function isApproverSelectionRole(role: string): boolean {
  return form.value.approverSelectionUserGroups.includes(role)
}

function toggleApproverSelectionRole(role: string, checked: boolean) {
  const set = new Set(form.value.approverSelectionUserGroups)
  if (checked) set.add(role)
  else set.delete(role)
  form.value.approverSelectionUserGroups = Array.from(set)
}

function addField() {
  form.value.fields.push({
    name: '',
    label: '',
    inputType: 'TEXT',
    validationRules: [],
    allowSelectMultipleValues: false,
    fixedTextContent: '',
  })
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
  loading.value = true
  try {
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
        allowSelectMultipleValues?: unknown
        fixedTextContent?: unknown
      }
      const nf: TemplateField = {
        name: String(r?.name || ''),
        label: String(r?.label || ''),
        inputType: String(r?.inputType || 'TEXT'),
        defaultValue: r?.defaultValue as string | number | undefined,
        validationRules: Array.isArray(r?.validationRules) ? (r.validationRules as unknown[]) : [],
        allowSelectMultipleValues: Boolean(r?.allowSelectMultipleValues),
        fixedTextContent: String(r?.fixedTextContent || ''),
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
      approvalSteps:
        t.approvalSteps?.map(
          (s: {
            role?: string
            type?: string
            user?: { id: string; firstName: string; lastName: string }
            label?: string
          }) => {
            // Handle legacy approval steps (just role)
            if (s.role && !s.type) {
              return { type: 'USER_GROUP' as const, role: s.role }
            }
            // Handle new approval step structure
            return s as ApprovalStep
          },
        ) || [],
      visibleToRoles: t.visibleToRoles || [],
      active: !!t.active,
      allowApplicationCreatorsToSelectApprover: !!t.allowApplicationCreatorsToSelectApprover,
      approverSelectionUserGroups: t.approverSelectionUserGroups || [],
    }
    formVersion.value = t.version
  } catch (error) {
    console.error('Failed to load form template:', error)
    toastStore.error('Failed to load form template')
  } finally {
    loading.value = false
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
          if (!out.allowSelectMultipleValues) {
            delete out.allowSelectMultipleValues
          }
        } else {
          delete out.options
          delete out.allowSelectMultipleValues
        }
        if (f.inputType === 'FIXED_TEXT') {
          if (!out.fixedTextContent || out.fixedTextContent.trim() === '') {
            delete out.fixedTextContent
          }
        } else {
          delete out.fixedTextContent
        }
        return out as TemplateField
      }),
    }
    if (isEdit.value) {
      await api.put(`/forms/${id.value}`, payload)
      toastStore.success('Form template updated successfully')
    } else {
      const res = await api.post('/forms', payload)
      const newId = (res.data as FormTemplate)?.id
      if (newId) {
        router.replace(`/form-templates/${newId}`)
        toastStore.success('Form template created successfully')
      }
    }
  } catch (error) {
    console.error('Failed to save form template:', error)
    toastStore.error('Failed to save form template')
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
  () =>
    !form.value.approvalSteps.some((s) => {
      switch (s.type) {
        case 'USER_GROUP':
        case 'DYNAMIC_USER':
          return String(s.role || '').trim()
        case 'FIXED_USER':
          return s.user && s.user.id
        default:
          return false
      }
    }),
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
  // Roles are now loaded by the layout component
  await load()
})
</script>
