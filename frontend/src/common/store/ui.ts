import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }
  function setSidebar(v: boolean) {
    sidebarOpen.value = v
  }
  function clear() {
    sidebarOpen.value = false
  }
  return { sidebarOpen, toggleSidebar, setSidebar, clear }
})
