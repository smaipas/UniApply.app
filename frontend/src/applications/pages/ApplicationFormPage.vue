<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Application' : 'New Application' }}
        </h1>
        <p v-if="template" class="text-gray-600 mt-1">
          {{ template.title }}
        </p>
      </div>

      <div class="flex space-x-3">
        <UiButton flat @click="printApplication">
          <UiIcon :path="mdiPrinter" class="mr-2" />
          Print
        </UiButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Profile Completion Warning -->
    <div
      v-if="!profileStatus.isComplete"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Profile Incomplete</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>
              You must complete your profile before creating applications.
              {{ profileCompletionMessage }}
            </p>
            <div class="mt-3">
              <UiButton size="sm" @click="goToProfile">Complete Profile</UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Form -->
    <div
      v-else-if="template"
      class="bg-white rounded-lg border border-gray-200"
      ref="applicationFormRef"
    >
      <!-- Form Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ template.title }}</h2>
            <p v-if="template.description" class="text-gray-600 text-sm mt-1">
              {{ template.description }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <StatusChip :status="application?.status || 'DRAFT'" />
            <span v-if="application?.id" class="text-sm text-gray-500">
              ID: {{ application.id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Application History -->
      <div
        v-if="
          application?.approvalSteps &&
          application.approvalSteps.length > 0 &&
          application.status !== 'DRAFT'
        "
        class="px-6 py-4 border-b border-gray-200"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
        <div class="space-y-3">
          <div
            v-for="(step, index) in application.approvalSteps"
            :key="index"
            class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white"
                :class="{
                  'bg-green-500': step.status === 'APPROVED',
                  'bg-red-500': step.status === 'REJECTED',
                  'bg-yellow-500': step.status === 'PENDING_APPROVAL',
                }"
              >
                <UiIcon
                  :path="
                    step.status === 'APPROVED'
                      ? mdiCheck
                      : step.status === 'REJECTED'
                        ? mdiCancel
                        : mdiTimerSand
                  "
                  class="w-5 h-5"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-gray-900">
                  {{ getStepDisplayText(step) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ step.updatedAt ? new Date(step.updatedAt).toLocaleDateString() : 'Pending' }}
                </div>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                Status: <StatusChip :status="step.status" />
              </div>
              <div v-if="step.updatedByFullName" class="text-xs text-gray-500 mt-1">
                By: {{ step.updatedByFullName }}
                <span v-if="step.updatedAt">
                  on {{ new Date(step.updatedAt).toLocaleDateString() }} at
                  {{ new Date(step.updatedAt).toLocaleTimeString() }}
                </span>
              </div>
              <div
                v-if="step.statusText"
                class="text-sm text-gray-700 mt-2 p-2 bg-white rounded border"
              >
                {{ step.statusText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="submitApplication" class="p-6 space-y-6">
        <!-- User Information Section -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Applicant Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ authStore.profile?.firstName }} {{ authStore.profile?.lastName }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ authStore.profile?.email }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ authStore.profile?.mobilePhoneNumber || 'Not provided' }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{
                  authStore.profile?.dateOfBirth
                    ? new Date(authStore.profile.dateOfBirth).toLocaleDateString()
                    : 'Not provided'
                }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ formatGender(authStore.profile?.gender) }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{
                  authStore.profile?.nationality
                    ? getCountryName(authStore.profile.nationality)
                    : 'Not provided'
                }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {{ formatAddress() }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ authStore.profile?.studentId || 'Not provided' }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ formatOfficialIdType(authStore.profile?.userOfficialType) }}
              </label>
              <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {{ authStore.profile?.userOfficialId || 'Not provided' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Approval Users Section -->
        <div v-if="dynamicApprovalSteps.length > 0" class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Approval Assignments
          </h2>

          <div class="space-y-4">
            <div
              v-for="(step, index) in dynamicApprovalSteps"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-medium text-gray-900">{{ step.label }}</h3>
                </div>
              </div>

              <div class="space-y-3">
                <div v-if="!selectedDynamicUsers[index]">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Search for {{ step.label }}
                  </label>
                  <UiInput
                    v-model="dynamicUserQueries[index]"
                    placeholder="Search by name or email..."
                    @input="searchDynamicUser(index)"
                  />
                </div>

                <div
                  v-if="dynamicUserResults[index]?.length > 0"
                  class="max-h-48 overflow-y-auto border rounded-lg"
                >
                  <div
                    v-for="user in dynamicUserResults[index]"
                    :key="user.id"
                    class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    @click="selectDynamicUser(index, user)"
                  >
                    <div>
                      <div class="font-medium">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="text-sm text-gray-600">{{ user.email }}</div>
                    </div>
                    <UiIcon
                      :path="mdiCheck"
                      v-if="selectedDynamicUsers[index]?.id === user.id"
                      class="text-primary"
                    />
                  </div>
                </div>

                <div
                  v-if="
                    dynamicUserQueries[index] &&
                    dynamicUserResults[index]?.length === 0 &&
                    !dynamicUserSearching[index]
                  "
                  class="text-sm text-gray-500"
                >
                  No users found matching "{{ dynamicUserQueries[index] }}"
                </div>

                <div v-if="dynamicUserSearching[index]" class="text-sm text-gray-500">
                  Searching...
                </div>

                <div
                  v-if="selectedDynamicUsers[index]"
                  class="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-green-900">
                        Selected: {{ selectedDynamicUsers[index].firstName }}
                        {{ selectedDynamicUsers[index].lastName }}
                      </div>
                      <div class="text-sm text-green-700">
                        {{ selectedDynamicUsers[index].email }}
                      </div>
                    </div>
                    <UiButton flat color="red" size="sm" @click="clearDynamicUser(index)">
                      Change
                    </UiButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Application Fields Section -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Application Details
          </h2>

          <!-- Dynamic Fields -->
          <div v-for="field in template.fields" :key="field.name" class="space-y-2">
            <label :for="field.name" class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="isFieldRequired(field) && field.label" class="text-red-500">*</span>
            </label>

            <!-- Text Input -->
            <UiInput
              v-if="field.inputType === 'TEXT'"
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.description"
              :disabled="isReadOnly"
              :required="isFieldRequired(field)"
            />

            <!-- Long Text Input -->
            <textarea
              v-else-if="field.inputType === 'LONG_TEXT'"
              :id="field.name"
              v-model="formData[field.name]"
              :placeholder="field.description"
              :disabled="isReadOnly"
              :required="isFieldRequired(field)"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />

            <!-- Number Input -->
            <UiInput
              v-else-if="field.inputType === 'NUMBER'"
              :id="field.name"
              v-model="formData[field.name]"
              type="number"
              :placeholder="field.description"
              :disabled="isReadOnly"
              :required="isFieldRequired(field)"
            />

            <!-- Date Input -->
            <UiDateInput
              v-else-if="field.inputType === 'DATE'"
              :id="field.name"
              v-model="formData[field.name]"
              :label="field.description"
              :disabled="isReadOnly"
              :required="isFieldRequired(field)"
            />

            <!-- Select Input -->
            <select
              v-else-if="field.inputType === 'SELECT' && !field.allowSelectMultipleValues"
              :id="field.name"
              v-model="formData[field.name]"
              :disabled="isReadOnly"
              :required="isFieldRequired(field)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select an option</option>
              <option
                v-for="option in field.options"
                :key="typeof option === 'string' ? option : option.value"
                :value="typeof option === 'string' ? option : option.value"
              >
                {{ typeof option === 'string' ? option : option.label }}
              </option>
            </select>

            <!-- Multi-Select Input -->
            <div
              v-else-if="field.inputType === 'SELECT' && field.allowSelectMultipleValues"
              class="space-y-2"
            >
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="option in field.options"
                  :key="typeof option === 'string' ? option : option.value"
                  class="inline-flex items-center"
                >
                  <input
                    type="checkbox"
                    :value="typeof option === 'string' ? option : option.value"
                    v-model="formData[field.name]"
                    :disabled="isReadOnly"
                    :required="isFieldRequired(field)"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {{ typeof option === 'string' ? option : option.label }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Fixed Text Display -->
            <div v-else-if="field.inputType === 'FIXED_TEXT'" class="p-4 bg-gray-50 rounded-md">
              <div class="text-sm text-gray-700 whitespace-pre-wrap">
                {{ field.fixedTextContent }}
              </div>
            </div>

            <!-- Checkbox Input -->
            <div v-else-if="field.inputType === 'CHECKBOX'" class="flex items-center">
              <UiCheckbox
                :id="field.name"
                v-model="formData[field.name]"
                :disabled="isReadOnly"
                :required="isFieldRequired(field)"
              />
              <label :for="field.name" class="ml-2 text-sm text-gray-700">
                {{ field.description }}
              </label>
            </div>

            <!-- File Input -->
            <div v-else-if="field.inputType === 'FILE'" class="space-y-2">
              <!-- File Display (when file exists) -->
              <div v-if="formData[field.name] && !uploadingFiles[field.name]" class="space-y-3">
                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                  <!-- File Icon/Thumbnail -->
                  <div class="flex-shrink-0">
                    <div
                      v-if="isImageFile(formData[field.name])"
                      class="w-12 h-12 rounded overflow-hidden bg-gray-100"
                    >
                      <img
                        v-if="filePreviewUrls[formData[field.name]]"
                        :src="filePreviewUrls[formData[field.name]]"
                        :alt="getFileName(formData[field.name])"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                        loading="lazy"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <div
                          class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"
                        ></div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center"
                    >
                      <UiIcon
                        :path="getFileIcon(formData[field.name])"
                        class="w-6 h-6 text-gray-500"
                      />
                    </div>
                  </div>

                  <!-- File Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ getFileName(formData[field.name]) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ getFileType(formData[field.name]) }}
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center space-x-2">
                    <UiButton
                      size="sm"
                      flat
                      @click="downloadFile(formData[field.name])"
                      title="Download file"
                    >
                      <UiIcon :path="mdiDownload" class="w-4 h-4" />
                    </UiButton>

                    <!-- Replace/Delete buttons (only in draft mode) -->
                    <template v-if="!isReadOnly && (application?.status === 'DRAFT' || !isEditing)">
                      <UiButton
                        size="sm"
                        flat
                        @click="replaceFile(field.name)"
                        title="Replace file"
                      >
                        <UiIcon :path="mdiPencil" class="w-4 h-4" />
                      </UiButton>
                      <UiButton
                        size="sm"
                        flat
                        color="red"
                        @click="removeFile(field.name)"
                        title="Remove file"
                      >
                        <UiIcon :path="mdiClose" class="w-4 h-4" />
                      </UiButton>
                    </template>
                  </div>
                </div>

                <!-- Hidden file input for replacement -->
                <input
                  :id="`${field.name}-replace`"
                  type="file"
                  :accept="getFileAcceptTypes(formData[field.name])"
                  @change="handleFileUpload($event, field.name)"
                  class="hidden"
                  ref="fileInputRefs"
                />
              </div>

              <!-- File Upload (when no file exists or uploading) -->
              <div v-else class="space-y-2">
                <input
                  :id="field.name"
                  type="file"
                  :disabled="isReadOnly || uploadingFiles[field.name]"
                  :required="isFieldRequired(field)"
                  @change="handleFileUpload($event, field.name)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
                <div
                  v-if="uploadingFiles[field.name]"
                  class="flex items-center gap-2 text-sm text-blue-600"
                >
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Uploading file...
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <p v-if="fieldErrors[field.name]" class="text-sm text-red-600">
              {{ fieldErrors[field.name] }}
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <UiButton flat @click="goBack"> {{ isEditing ? 'Back' : 'Cancel' }} </UiButton>

          <!-- Approval Actions -->
          <template v-if="canApprove">
            <UiButton :disabled="approving" color="green" @click="showApprovalModal">
              {{ approving ? 'Approving...' : 'Approve' }}
            </UiButton>
            <UiButton
              :disabled="rejecting || !canReject"
              color="red"
              flat
              @click="showRejectionModal"
            >
              {{ rejecting ? 'Rejecting...' : 'Reject' }}
            </UiButton>
          </template>

          <!-- Application Actions -->
          <template v-else>
            <UiButton
              v-if="!isReadOnly"
              @click="saveDraft"
              :loading="saving"
              :disabled="saving"
              flat
            >
              <UiIcon :path="mdiContentSave" class="mr-2" />
              {{ isEditing ? 'Save' : 'Save As Draft' }}
            </UiButton>
            <UiButton
              v-if="!isReadOnly && (application?.status === 'DRAFT' || !isEditing)"
              type="submit"
              :loading="submitting"
              :disabled="submitting"
              color="green"
              @click="confirmSubmission"
            >
              <UiIcon :path="mdiSend" class="mr-2" />
              Submit Application
            </UiButton>
          </template>
        </div>
      </form>
    </div>

    <!-- Error State -->
    <div v-else-if="!loading" class="text-center py-12">
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
      <h3 class="text-lg font-medium text-gray-900 mb-2">Template not found</h3>
      <p class="text-gray-600 mb-4">The form template could not be loaded.</p>
      <UiButton @click="goBack">Go Back</UiButton>
    </div>
  </div>

  <!-- Comment Modal -->
  <UiModal v-model="showCommentModal" title="Add Comment" size="md">
    <div class="space-y-4">
      <p class="text-gray-600">
        {{
          pendingAction === 'approve'
            ? 'Add a comment for approval (optional):'
            : 'Add a comment for rejection (optional):'
        }}
      </p>
      <textarea
        v-model="commentText"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Enter your comment here..."
      ></textarea>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <UiButton flat @click="cancelComment">Cancel</UiButton>
        <UiButton :color="pendingAction === 'approve' ? 'green' : 'red'" @click="confirmAction">
          {{ pendingAction === 'approve' ? 'Approve' : 'Reject' }}
        </UiButton>
      </div>
    </template>
  </UiModal>

  <!-- Submission Confirmation Modal -->
  <UiModal v-model="showSubmissionModal" title="Confirm Submission" size="md">
    <div class="space-y-4">
      <p class="text-gray-600">
        Are you sure you want to submit this application? Once submitted, it will be sent for
        approval and you won't be able to make further changes.
      </p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Important</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>
                Please review all information carefully before submitting. You can still save as
                draft if you need to make changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <UiButton flat @click="showSubmissionModal = false">Cancel</UiButton>
        <UiButton color="green" @click="submitApplication">
          {{ submitting ? 'Submitting...' : 'Submit Application' }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  mdiPrinter,
  mdiContentSave,
  mdiSend,
  mdiTimerSand,
  mdiCheck,
  mdiCancel,
  mdiFilePdfBox,
  mdiFileWord,
  mdiFileImage,
  mdiFile,
  mdiClose,
  mdiPencil,
  mdiDownload,
} from '@mdi/js'
import {
  UiButton,
  UiInput,
  UiCheckbox,
  StatusChip,
  UiIcon,
  UiModal,
  UiDateInput,
} from '@/common/components'
import { useToastStore } from '@/common/store/toast'
import { useAuthStore } from '@/auth/store'
import { usePermissions } from '@/common/utils/permissions'

import { checkProfileCompletion, getProfileCompletionMessage } from '@/common/utils/profile'
import { getCountryName } from '@/common/utils/countries'
import { getStepDisplayText } from '@/common/utils/approvalSteps'
import api from '@/app/axios'

interface FormField {
  name: string
  label: string
  description?: string
  inputType:
    | 'TEXT'
    | 'LONG_TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'SELECT'
    | 'CHECKBOX'
    | 'FILE'
    | 'FIXED_TEXT'
  validationRules?: Array<{
    rule: string
    value?: string | number | boolean
    message?: string
  }>
  options?: string[] | Array<{ label: string; value: string }>
  defaultValue?: string | number
  allowSelectMultipleValues?: boolean
  fixedTextContent?: string
}

interface FormTemplate {
  id: string
  title: string
  description?: string
  version?: number
  fields: FormField[]
  active?: boolean
  approvalSteps?: Array<{
    type: 'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'
    role?: string
    user?: {
      id: string
      firstName: string
      lastName: string
    }
    label?: string
  }>
}

interface Application {
  id?: string
  formId: string
  userId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: Record<string, any>
  approvalSteps?: Array<{
    type: 'USER_GROUP' | 'FIXED_USER' | 'DYNAMIC_USER'
    role?: string
    user?: {
      id: string
      firstName: string
      lastName: string
    }
    label?: string
    status: string
    statusText?: string
    updatedAt?: string
    updatedById?: string
    updatedByFullName?: string
  }>
  createdAt?: string
  updatedAt?: string
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const saving = ref(false)
const approving = ref(false)
const rejecting = ref(false)
const showCommentModal = ref(false)
const commentText = ref('')
const pendingAction = ref<'approve' | 'reject' | null>(null)
const showSubmissionModal = ref(false)
const template = ref<FormTemplate | null>(null)
const application = ref<Application | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formData = ref<Record<string, any>>({})
const fieldErrors = ref<Record<string, string>>({})
const uploadingFiles = ref<Record<string, boolean>>({})
const filePreviewUrls = ref<Record<string, string>>({})
const applicationFormRef = ref<HTMLElement | null>(null)

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

// Dynamic approval functionality
const dynamicUserQueries = ref<Record<number, string>>({})
const dynamicUserResults = ref<Record<number, User[]>>({})
const dynamicUserSearching = ref<Record<number, boolean>>({})
const selectedDynamicUsers = ref<Record<number, User | null>>({})

const isEditing = computed(() => !!route.params.id)
const isReadOnly = computed(() => {
  if (!application.value) return false
  return ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(application.value.status)
})

const { canApproveApplication, canRejectApplication } = usePermissions()

const canApprove = computed(() => {
  if (!application.value) return false
  return canApproveApplication(application.value)
})

const canReject = computed(() => {
  if (!application.value) return false
  return canRejectApplication(application.value)
})

const profileStatus = computed(() => checkProfileCompletion(authStore.profile))
const profileCompletionMessage = computed(() => getProfileCompletionMessage(profileStatus.value))

const dynamicApprovalSteps = computed(() => {
  if (!template.value?.approvalSteps) return []
  return template.value.approvalSteps.filter((step) => step.type === 'DYNAMIC_USER')
})

onMounted(async () => {
  await loadData()
})

watch(
  formData,
  async (newFormData) => {
    if (!template.value?.fields) return

    const fileFields = template.value.fields.filter((field) => field.inputType === 'FILE')
    for (const field of fileFields) {
      const fieldValue = newFormData[field.name]
      if (fieldValue && typeof fieldValue === 'string' && isImageFile(fieldValue)) {
        await loadFilePreviewUrl(fieldValue)
      }
    }
  },
  { deep: true },
)

async function loadData() {
  loading.value = true

  try {
    if (isEditing.value) {
      // Load existing application first
      const appResponse = await api.get(`/applications/${route.params.id}`)
      application.value = appResponse.data

      if (application.value) {
        // Load template using the application's formId
        const templateResponse = await api.get(`/forms/${application.value.formId}`)
        template.value = templateResponse.data

        // Load form data from the application
        formData.value = { ...application.value.fields }
      }
    } else {
      // Creating new application - load template from route
      const templateId = (route.query.template as string) || (route.params.templateId as string)

      if (templateId) {
        // Load template
        const templateResponse = await api.get(`/forms/${templateId}`)
        template.value = templateResponse.data

        // Initialize form data with default values
        if (template.value?.fields) {
          template.value.fields.forEach((field) => {
            if (field.defaultValue !== undefined) {
              formData.value[field.name] = field.defaultValue
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to load application data',
    })
  } finally {
    loading.value = false
  }
}

// Dynamic user search functions
async function searchDynamicUser(index: number) {
  const query = dynamicUserQueries.value[index]
  if (!query || query.length < 2) {
    dynamicUserResults.value[index] = []
    return
  }

  // Get the form ID and step index
  const formId = template.value?.id
  if (!formId) {
    console.error('No form template ID available')
    dynamicUserResults.value[index] = []
    return
  }

  // Find the step index in the original template approval steps
  const stepIndex =
    template.value?.approvalSteps?.findIndex(
      (step) =>
        step.type === 'DYNAMIC_USER' && step.label === dynamicApprovalSteps.value[index]?.label,
    ) || 0

  dynamicUserSearching.value[index] = true
  try {
    const params = new URLSearchParams({
      q: query,
      stepIndex: stepIndex.toString(),
    })
    const response = await api.get(`/applications/${formId}/approval-users?${params.toString()}`)
    dynamicUserResults.value[index] = response.data
  } catch (error) {
    console.error('Error searching users:', error)
    dynamicUserResults.value[index] = []
  } finally {
    dynamicUserSearching.value[index] = false
  }
}

function selectDynamicUser(
  index: number,
  user: { id: string; firstName: string; lastName: string; email: string; role: string },
) {
  selectedDynamicUsers.value[index] = user
  dynamicUserResults.value[index] = []
  dynamicUserQueries.value[index] = ''
}

function clearDynamicUser(index: number) {
  selectedDynamicUsers.value[index] = null
  dynamicUserQueries.value[index] = ''
  dynamicUserResults.value[index] = []
}

function isFieldRequired(field: FormField): boolean {
  return field.validationRules?.some((rule) => rule.rule === 'required') || false
}

function validateForm(): boolean {
  fieldErrors.value = {}
  let isValid = true

  if (!template.value?.fields) return false

  template.value.fields.forEach((field) => {
    const value = formData.value[field.name]

    // Check required fields
    if (isFieldRequired(field) && (!value || value === '')) {
      fieldErrors.value[field.name] = `${field.label} is required`
      isValid = false
    }
  })

  return isValid
}

async function submitApplication() {
  if (!validateForm()) return

  submitting.value = true

  try {
    await uploadPendingFiles()

    if (isEditing.value) {
      // When editing, submit the existing application
      if (!application.value?.id) {
        throw new Error('Application ID not found')
      }

      await api.post(`/applications/${application.value.id}/submit`)

      toastStore.show({
        tone: 'success',
        title: 'Success',
        message: 'Application submitted successfully',
      })

      // Redirect to applications list
      router.push('/applications')
    } else {
      // When creating new, create application first then submit
      const userResponse = await api.get('/users/me')
      const currentUser = userResponse.data

      const payload = {
        userId: currentUser.id,
        formId: template.value!.id,
        formTitle: template.value!.title,
        fields: formData.value,
        // Don't send approval steps - they will be created by the backend when submitted
        approvalSteps: [],
      }

      // Create the application (backend will set status to DRAFT)
      const response = await api.post('/applications', payload)
      application.value = response.data

      // Submit the application to change status to PENDING_APPROVAL
      if (application.value?.id) {
        await api.post(`/applications/${application.value.id}/submit`)
      }

      toastStore.show({
        tone: 'success',
        title: 'Success',
        message: 'Application submitted successfully',
      })

      // Redirect to applications list
      router.push('/applications')
    }
  } catch (error) {
    console.error('Failed to submit application:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to submit application',
    })
  } finally {
    submitting.value = false
  }
}

async function saveDraft() {
  saving.value = true

  try {
    await uploadPendingFiles()

    if (isEditing.value) {
      // For updates, only send fields (userId and formId are not allowed in updates)
      const updatePayload = {
        fields: formData.value,
      }

      await api.put(`/applications/${route.params.id}`, updatePayload)
      toastStore.show({
        tone: 'success',
        title: 'Success',
        message: 'Draft saved successfully',
      })
    } else {
      // For new applications, send full payload
      const userResponse = await api.get('/users/me')
      const currentUser = userResponse.data

      const createPayload = {
        userId: currentUser.id,
        formId: template.value!.id,
        formTitle: template.value!.title,
        fields: formData.value,
        // Don't create approval steps for drafts - they will be created when submitted
        approvalSteps: [],
      }

      const response = await api.post('/applications', createPayload)
      application.value = response.data

      toastStore.show({
        tone: 'success',
        title: 'Success',
        message: 'Draft saved successfully',
      })

      // Navigate to edit route for the newly created application
      router.replace(`/applications/${response.data.id}/edit`)
    }
  } catch (error) {
    console.error('Failed to save draft:', error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Failed to save draft',
    })
  } finally {
    saving.value = false
  }
}

function handleFileUpload(event: Event, fieldName: string) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    formData.value[fieldName] = file

    toastStore.show({
      tone: 'success',
      title: 'File selected',
      message: `${file.name} ready for upload`,
    })
  }
}

function getFileName(file: File | string): string {
  if (typeof file === 'string') {
    const parts = file.split('/')
    return parts[parts.length - 1] || file
  }
  return file.name
}

async function uploadPendingFiles(): Promise<void> {
  if (!template.value?.fields) return

  const fileFields = template.value.fields.filter((field) => field.inputType === 'FILE')

  for (const field of fileFields) {
    const fieldValue = formData.value[field.name]

    if (!fieldValue || typeof fieldValue === 'string') continue

    if (!(fieldValue instanceof File)) continue

    const file = fieldValue as File

    try {
      uploadingFiles.value[field.name] = true

      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      const uploadResponse = await api.post('/files/upload', {
        fileData,
        fileName: file.name,
        contentType: file.type,
      })

      const { key } = uploadResponse.data

      formData.value[field.name] = key

      console.log(`File ${file.name} uploaded successfully`)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      throw new Error(`Failed to upload ${file.name}`)
    } finally {
      uploadingFiles.value[field.name] = false
    }
  }
}

async function printApplication() {
  if (!applicationFormRef.value) {
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: 'Application form not found',
    })
    return
  }

  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toastStore.show({
        tone: 'error',
        title: 'Error',
        message: 'Please allow popups to print applications',
      })
      return
    }

    // Clone the application form content
    const formClone = applicationFormRef.value.cloneNode(true) as HTMLElement

    // Remove action buttons and other non-printable elements
    const actionButtons = formClone.querySelectorAll('.flex.justify-end.space-x-3')
    actionButtons.forEach((button) => button.remove())

    // Remove the header buttons (print/download)
    const headerButtons = formClone.querySelectorAll('.flex.space-x-3')
    headerButtons.forEach((button) => button.remove())

    // Remove approval history section
    const approvalElements = formClone.querySelectorAll('h3')
    approvalElements.forEach((h3) => {
      if (h3.textContent?.includes('Approval History')) {
        const parentSection = h3.closest('.px-6, .p-6')
        if (parentSection) {
          parentSection.remove()
        }
      }
    })

    // Replace form field values with display text (same approach as PDF)
    if (template.value?.fields && formData.value) {
      template.value.fields.forEach((field) => {
        const fieldValue = formData.value[field.name]

        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          const fieldElement = formClone.querySelector(`#${field.name}`) as HTMLElement

          if (fieldElement) {
            // Create display value
            const displayValue = document.createElement('div')
            displayValue.className = 'print-field-value'
            displayValue.style.cssText = `
              border: 1px solid #d1d5db;
              border-radius: 4px;
              padding: 8px 12px;
              background-color: #f9fafb;
              margin-top: 4px;
              min-height: 20px;
              font-size: 13px;
              line-height: 1.4;
              color: #374151;
              display: block;
              width: 100%;
              box-sizing: border-box;
              word-wrap: break-word;
              white-space: pre-wrap;
            `

            let displayText = ''
            if (field.inputType === 'SELECT' && field.options) {
              const selectedOption = field.options.find((opt) =>
                typeof opt === 'string' ? opt === fieldValue : opt.value === fieldValue,
              )
              displayText = selectedOption
                ? typeof selectedOption === 'string'
                  ? selectedOption
                  : selectedOption.label
                : fieldValue.toString()
            } else if (field.inputType === 'DATE' && fieldValue) {
              displayText = new Date(fieldValue.toString()).toLocaleDateString()
            } else if (field.inputType === 'FILE') {
              displayText =
                typeof fieldValue === 'string' ? fieldValue : fieldValue.name || 'File selected'
            } else if (field.inputType === 'CHECKBOX') {
              displayText = fieldValue ? 'Yes' : 'No'
            } else {
              displayText = fieldValue.toString()
            }

            displayValue.textContent = displayText || 'Not provided'

            // Replace the field element with the display value
            fieldElement.parentNode?.replaceChild(displayValue, fieldElement)
          }
        }
      })
    }

    // Hide any remaining form elements that weren't replaced
    const allFormElements = formClone.querySelectorAll('input, textarea, select, button')
    allFormElements.forEach((element) => {
      ;(element as HTMLElement).style.display = 'none'
    })

    // Add print-specific styles
    const printStyles = `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: white; 
          color: black; 
          font-size: 13px;
          line-height: 1.4;
        }
        
        /* Maintain visual structure */
        .bg-white { 
          background: white !important; 
          border: 1px solid #e2e8f0 !important;
          border-radius: 4px !important;
          padding: 16px !important;
          margin-bottom: 16px !important;
        }
        
        /* Form sections */
        .space-y-4 > * {
          margin-bottom: 16px !important;
        }
        
        .space-y-6 > * {
          margin-bottom: 24px !important;
        }
        
        /* Grid layouts */
        .grid {
          display: grid !important;
          gap: 16px !important;
        }
        
        .grid-cols-1.md\\:grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        
        /* Form fields */
        .px-3.py-2 {
          padding: 8px 12px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          background: #f9fafb !important;
          margin-top: 4px !important;
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Labels */
        label {
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 4px !important;
          display: block !important;
        }
        
        /* Headers */
        h1, h2, h3 {
          font-size: 15px !important;
          margin-bottom: 12px !important;
          font-weight: 700 !important;
          color: #111827 !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding-bottom: 8px !important;
        }
        
        /* Status chip */
        .text-xs.font-medium.px-2\\.5.py-0\\.5.rounded-sm {
          display: inline-block !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        /* Typography */
        .text-3xl { font-size: 20px !important; }
        .text-2xl { font-size: 18px !important; }
        .text-xl { font-size: 16px !important; }
        .text-lg { font-size: 14px !important; }
        .text-sm { font-size: 12px !important; }
        .text-xs { font-size: 11px !important; }
        
        /* Colors */
        .text-gray-900 { color: #111827 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        
        /* Backgrounds */
        .bg-gray-50 { background: #f9fafb !important; }
        .bg-gray-100 { background: #f3f4f6 !important; }
        .bg-green-500 { background: #10b981 !important; color: white !important; }
        .bg-red-500 { background: #ef4444 !important; color: white !important; }
        .bg-yellow-500 { background: #f59e0b !important; color: white !important; }
        .bg-blue-500 { background: #3b82f6 !important; color: white !important; }
        
        /* Borders */
        .border-gray-200 { border-color: #e5e7eb !important; }
        .border-b { border-bottom: 1px solid #e5e7eb !important; }
        .border-t { border-top: 1px solid #e5e7eb !important; }
        
        /* Spacing */
        .p-6 { padding: 24px !important; }
        .px-6 { padding-left: 24px !important; padding-right: 24px !important; }
        .py-4 { padding-top: 16px !important; padding-bottom: 16px !important; }
        .mb-1 { margin-bottom: 4px !important; }
        .mb-2 { margin-bottom: 8px !important; }
        .mb-4 { margin-bottom: 16px !important; }
        .mt-1 { margin-top: 4px !important; }
        .mt-2 { margin-top: 8px !important; }
        
        /* Flexbox */
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-between { justify-content: space-between !important; }
        .space-x-3 > * + * { margin-left: 12px !important; }
        .space-x-4 > * + * { margin-left: 16px !important; }
        
        /* Status colors */
        .text-green-600 { color: #059669 !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-yellow-600 { color: #d97706 !important; }
        .text-blue-600 { color: #2563eb !important; }
        
        /* Hide elements that shouldn't print */
        .flex.space-x-3 { display: none !important; }
        input, textarea, select, button { display: none !important; }
        
        /* Hide form elements more aggressively */
        input[type="text"], input[type="number"], input[type="date"], input[type="email"] { display: none !important; }
        textarea, select, button, .relative input { display: none !important; }
        
        /* Hide UiInput component wrapper contents */
        .relative { position: static !important; }
        .relative input { display: none !important; }
        label input { display: none !important; }
        label textarea { display: none !important; }
        label select { display: none !important; }
        
        /* Styling for generated field values */
        .print-field-value, .pdf-field-value {
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          padding: 8px 12px !important;
          background: #f9fafb !important;
          margin-top: 4px !important;
          min-height: 20px !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          color: #374151 !important;
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        @media print {
          body { margin: 0; font-size: 13px; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      </style>
    `

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.value?.title || 'Application'} - Print</title>
          ${printStyles}
    </head>
    <body>
          ${formClone.outerHTML}
    </body>
    </html>
  `)

    printWindow.document.close()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  } catch (error) {
    console.error('Print error:', error)
    toastStore.show({
      tone: 'error',
      title: 'Print Error',
      message: 'There was an error preparing the application for printing.',
    })
  }
}

function showApprovalModal() {
  pendingAction.value = 'approve'
  commentText.value = ''
  showCommentModal.value = true
}

function showRejectionModal() {
  pendingAction.value = 'reject'
  commentText.value = ''
  showCommentModal.value = true
}

function confirmSubmission(event: Event) {
  event.preventDefault()
  showSubmissionModal.value = true
}

function cancelComment() {
  showCommentModal.value = false
  pendingAction.value = null
  commentText.value = ''
}

async function confirmAction() {
  if (!application.value?.id || !pendingAction.value) return

  const isApproval = pendingAction.value === 'approve'
  const status = isApproval ? 'APPROVED' : 'REJECTED'

  if (isApproval) {
    approving.value = true
  } else {
    rejecting.value = true
  }

  try {
    const payload: { status: string; comment?: string } = { status }
    if (commentText.value.trim()) {
      payload.comment = commentText.value.trim()
    }

    await api.post(`/applications/${application.value.id}/status`, payload)

    // Reload application data
    await loadData()

    toastStore.show({
      tone: 'success',
      title: 'Success',
      message: `Application ${status.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error(`Failed to ${status.toLowerCase()} application:`, error)
    toastStore.show({
      tone: 'error',
      title: 'Error',
      message: `Failed to ${status.toLowerCase()} application`,
    })
  } finally {
    if (isApproval) {
      approving.value = false
    } else {
      rejecting.value = false
    }
    showCommentModal.value = false
    pendingAction.value = null
    commentText.value = ''
  }
}

function formatAddress(): string {
  const profile = authStore.profile
  if (!profile?.currentAddress) return 'Not provided'

  const parts = [
    profile.currentAddress.street,
    profile.currentAddress.number,
    profile.currentAddress.city,
    profile.currentAddress.province,
    profile.currentAddress.zipCode,
    profile.currentAddress.country ? getCountryName(profile.currentAddress.country) : null,
  ].filter((part) => part && part.trim())

  return parts.length > 0 ? parts.join(', ') : 'Not provided'
}

function formatGender(gender?: string): string {
  if (!gender) return 'Not provided'

  const genderMap: Record<string, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
    PREFER_NOT_TO_SAY: 'Prefer not to say',
  }

  return genderMap[gender] || gender
}

function formatOfficialIdType(type?: string): string {
  if (!type) return 'Official ID'

  const typeMap: Record<string, string> = {
    ID: 'ID Card',
    PASSPORT: 'Passport',
    DRIVING_LICENCE: 'Driving Licence',
    OTHER: 'Other ID',
  }

  return typeMap[type] || type
}

// Removed unused color conversion functions

function goToProfile() {
  router.push('/profile')
}

function goBack() {
  router.back()
}

// File handling functions
function isImageFile(fileKey: string): boolean {
  const fileName = getFileName(fileKey).toLowerCase()
  return (
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.gif') ||
    fileName.endsWith('.webp')
  )
}

function getFileIcon(fileKey: string): string {
  const fileName = getFileName(fileKey).toLowerCase()
  if (fileName.endsWith('.pdf')) {
    return mdiFilePdfBox
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return mdiFileWord
  } else if (isImageFile(fileKey)) {
    return mdiFileImage
  }
  return mdiFile
}

function getFileType(fileKey: string): string {
  const fileName = getFileName(fileKey).toLowerCase()
  if (fileName.endsWith('.pdf')) {
    return 'PDF Document'
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return 'Word Document'
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'JPEG Image'
  } else if (fileName.endsWith('.png')) {
    return 'PNG Image'
  } else if (fileName.endsWith('.gif')) {
    return 'GIF Image'
  } else if (fileName.endsWith('.webp')) {
    return 'WebP Image'
  }
  return 'File'
}

function getFileAcceptTypes(fileKey: string): string {
  const fileName = getFileName(fileKey).toLowerCase()
  if (fileName.endsWith('.pdf')) {
    return '.pdf'
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return '.doc,.docx'
  } else if (isImageFile(fileKey)) {
    return 'image/*'
  }
  return '*/*'
}

async function loadFilePreviewUrl(fileKey: string) {
  if (filePreviewUrls.value[fileKey]) return // Already loaded

  try {
    const response = await api.post('/files/download-url', { fileKey })
    filePreviewUrls.value[fileKey] = response.data.downloadUrl
  } catch (error) {
    console.error('Failed to get file preview URL:', error)
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

async function downloadFile(fileKey: string) {
  try {
    const response = await api.post('/files/download-url', { fileKey })
    const downloadUrl = response.data.downloadUrl

    const fileResponse = await fetch(downloadUrl)
    const blob = await fileResponse.blob()

    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = getFileName(fileKey)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download file:', error)
    toastStore.show({
      tone: 'error',
      title: 'Download Failed',
      message: 'Failed to download file',
    })
  }
}

function replaceFile(fieldName: string) {
  // Trigger the hidden file input
  const fileInput = document.getElementById(`${fieldName}-replace`) as HTMLInputElement
  if (fileInput) {
    fileInput.click()
  }
}

function removeFile(fieldName: string) {
  // Clear the file from form data
  formData.value[fieldName] = null
  toastStore.show({
    tone: 'success',
    title: 'File Removed',
    message: 'File has been removed from the form',
  })
}
</script>

<style scoped>
@media print {
  .flex.space-x-3 {
    display: none !important;
  }

  body {
    font-size: 12px !important;
    line-height: 1.4 !important;
    color: black !important;
    background: white !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .bg-white {
    background: white !important;
  }

  h1,
  h2,
  h3 {
    color: black !important;
  }
}

/* Print and PDF specific styles */
.print-container {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.print-container .bg-white {
  background: white !important;
}

.print-container .text-gray-900 {
  color: black !important;
}

.print-container .text-gray-600 {
  color: #4a5568 !important;
}

.print-container .text-gray-700 {
  color: #2d3748 !important;
}

.print-container .border-gray-200 {
  border-color: #e2e8f0 !important;
}

.print-container .bg-gray-50 {
  background: #f7fafc !important;
}

.print-container .bg-gray-100 {
  background: #edf2f7 !important;
}

.print-container .bg-green-500 {
  background: #48bb78 !important;
}

.print-container .bg-red-500 {
  background: #f56565 !important;
}

.print-container .bg-yellow-500 {
  background: #ed8936 !important;
}

.print-container .text-white {
  color: white !important;
}

.print-container .text-green-600 {
  color: #38a169 !important;
}

.print-container .text-red-600 {
  color: #e53e3e !important;
}

.print-container .text-yellow-600 {
  color: #d69e2e !important;
}
</style>
