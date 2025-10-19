<template>
  <header class="sticky top-0 z-40 bg-white border-b border-slate-200">
    <div class="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
      <div class="flex items-center gap-3">
        <button
          v-if="showMenuButton"
          class="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          @click="emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <UiIcon :path="mdiMenu" />
        </button>

        <div class="relative">
          <UiInput
            placeholder="Search"
            :icon="mdiMagnify"
            @click="openSearch"
            @keydown="handleKeydown"
            readonly
            class="w-64"
          />
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{{ osKey }}</kbd>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />

        <!-- User Avatar Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium border-2 border-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
            title="User menu"
          >
            {{ userInitials }}
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
          >
            <!-- User Name -->
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ fullName }}</p>
            </div>

            <!-- My Profile Button -->
            <button
              @click="goToProfile"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
            >
              <UiIcon :path="mdiAccount" class="w-4 h-4" />
              My Profile
            </button>

            <!-- Separator -->
            <div class="border-t border-gray-100 my-1"></div>

            <!-- Logout Button -->
            <button
              @click="showLogoutModal = true"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
            >
              <UiIcon :path="mdiLogout" class="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <!-- Click outside to close dropdown -->
        <div v-if="showDropdown" class="fixed inset-0 z-40" @click="closeDropdown"></div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <UiModal v-model="showLogoutModal" title="Confirm Logout" size="sm">
      <div class="space-y-4">
        <p class="text-gray-700">
          Are you sure you want to logout? You will need to sign in again to access your account.
        </p>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UiButton flat @click="showLogoutModal = false">Cancel</UiButton>
          <UiButton color="red" @click="confirmLogout">Logout</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Search Modal -->
    <SearchModal />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { mdiMenu, mdiMagnify, mdiAccount, mdiLogout } from '@mdi/js'
import { UiIcon, UiModal, UiButton, UiInput } from '@/common/components'
import SearchModal from './SearchModal.vue'
import { useAuthStore } from '@/auth/store'
import { useSearchStore } from '@/common/store/search'
import { useRouter } from 'vue-router'

withDefaults(defineProps<{ title?: string; showMenuButton?: boolean }>(), {
  showMenuButton: true,
})
const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>()

const auth = useAuthStore()
const searchStore = useSearchStore()
const router = useRouter()
const showDropdown = ref(false)
const showLogoutModal = ref(false)

// OS detection for keyboard shortcuts
const osKey = computed(() => {
  const platform = navigator.platform.toLowerCase()
  if (platform.includes('mac')) {
    return '⌘.'
  } else {
    return 'Ctrl+.'
  }
})

// Computed properties for user info
const fullName = computed(() => {
  const profile = auth.profile
  if (!profile?.firstName || !profile?.lastName) return 'User'
  return `${profile.firstName} ${profile.lastName}`
})

const userInitials = computed(() => {
  const profile = auth.profile
  if (!profile?.firstName || !profile?.lastName) return 'U'
  return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
})

// Dropdown functions
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function closeDropdown() {
  showDropdown.value = false
}

function goToProfile() {
  closeDropdown()
  router.push({ name: 'profile' })
}

function confirmLogout() {
  showLogoutModal.value = false
  closeDropdown()
  auth.logout()
  router.push({ name: 'login' })
}

function openSearch() {
  searchStore.openSearch()
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl+. (period) to open search
  if (event.ctrlKey && event.key === '.') {
    event.preventDefault()
    openSearch()
  }
}

// Global keyboard listener
function handleGlobalKeydown(event: KeyboardEvent) {
  // Ctrl+. (period) to open search from anywhere
  if (event.ctrlKey && event.key === '.' && !searchStore.isOpen) {
    event.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
