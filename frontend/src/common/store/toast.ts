import { defineStore } from 'pinia'

export type ToastTone = 'success' | 'error' | 'info'
export type ToastItem = {
  id: string
  tone: ToastTone
  title?: string
  message?: string
  duration?: number // ms
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[],
    defaultDuration: 3500,
  }),
  actions: {
    show(partial: Omit<ToastItem, 'id'>) {
      const item: ToastItem = { id: uid(), duration: this.defaultDuration, ...partial }
      this.items.push(item)
      if (item.duration && item.duration > 0) {
        setTimeout(() => this.dismiss(item.id), item.duration)
      }
      return item.id
    },
    success(message: string, title = 'Success', duration?: number) {
      return this.show({ tone: 'success', title, message, duration })
    },
    error(message: string, title = 'Error', duration?: number) {
      return this.show({ tone: 'error', title, message, duration })
    },
    info(message: string, title = 'Info', duration?: number) {
      return this.show({ tone: 'info', title, message, duration })
    },
    dismiss(id: string) {
      this.items = this.items.filter((t) => t.id !== id)
    },
    clear() {
      this.items = []
    },
  },
})
