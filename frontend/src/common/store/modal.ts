import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Component } from 'vue'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export type ModalPayload = {
  title?: string
  size?: ModalSize
  closeOnOverlay?: boolean
  message?: string
  component?: Component
  componentProps?: Record<string, unknown>
  showDefaultFooter?: boolean
}

type ConfirmOptions = Omit<ModalPayload, 'component' | 'componentProps' | 'showDefaultFooter'> & {
  confirmText?: string
  cancelText?: string
}

export const useModalStore = defineStore('modal', () => {
  const open = ref(false)
  const data = ref<ModalPayload>({})
  const confirmText = ref('Confirm')
  const cancelText = ref('Cancel')

  // internal resolver for confirm()
  let resolver: ((v: boolean) => void) | null = null

  function show(payload: ModalPayload) {
    data.value = {
      size: 'md',
      closeOnOverlay: true,
      showDefaultFooter: false,
      ...payload,
    }
    open.value = true
  }

  function close() {
    open.value = false
    if (resolver) {
      resolver(false) // treat overlay/ESC/close as cancel
      resolver = null
    }
    data.value = {}
  }

  function resolve(value: boolean) {
    if (resolver) {
      resolver(value)
      resolver = null
    }
    open.value = false
  }

  function confirm(options: ConfirmOptions = {}): Promise<boolean> {
    const { title, message, size = 'sm', closeOnOverlay = false } = options
    // allow per-call button labels
    if (options.confirmText) confirmText.value = options.confirmText
    if (options.cancelText) cancelText.value = options.cancelText

    return new Promise<boolean>((r) => {
      resolver = (v: boolean) => {
        resolver = null
        open.value = false
        r(v)
      }
      data.value = {
        title,
        message,
        size,
        closeOnOverlay,
        showDefaultFooter: true,
      }
      open.value = true
    })
  }

  function clear() {
    open.value = false
    data.value = {}
    confirmText.value = 'Confirm'
    cancelText.value = 'Cancel'
    if (resolver) {
      resolver(false)
      resolver = null
    }
  }

  return {
    // state
    open,
    data,
    confirmText,
    cancelText,
    // actions
    show,
    close,
    resolve,
    confirm,
    clear,
  }
})
