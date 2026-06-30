import { ref, createApp } from 'vue'
import NotifyContainer from '@/Library/utils/Notify/NotifyContainer.vue'

/* =========================
   Types
========================= */

export type NotifyType = 'default' | 'success' | 'error' | 'warning' | string

export interface NotifyAction {
  label: string
  action: () => void
}

export interface NotifyOptions {
  message: string
  title?: string | null
  type?: NotifyType
  duration?: number
  position?: string
  icon?: string | null
  actions?: NotifyAction[]
  closable?: boolean
  onClose?: (() => void) | null
}

export interface Notification {
  id: number
  message: string
  title: string | null
  type: NotifyType
  duration: number
  position: string
  icon: string | null
  actions: NotifyAction[]
  closable: boolean
  onClose: (() => void) | null
  count: number
  _timeout: ReturnType<typeof setTimeout> | null
}

/* =========================
   State
========================= */

let idCounter = 0
let mounted = false

const LEAVE_DURATION = 250

export const notifications = ref<Notification[]>([])

/* pending + lock (FONDAMENTALI) */
type Pending = {
  options: NotifyOptions
  message: string
  type: NotifyType
} | null

let pendingPush: Pending = null
let isTransitioning = false
let transitionTimer: ReturnType<typeof setTimeout> | null = null

/* =========================
   Mount container
========================= */

function ensureMounted() {
  if (mounted) return
  mounted = true

  const el = document.createElement('div')
  el.id = 'vexus-notify-root'
  document.body.appendChild(el)

  createApp(NotifyContainer).mount(el)
}

/* =========================
   API
========================= */

export function useNotify() {
  const notify = (options: NotifyOptions) => {
    ensureMounted()

    const message = options.message ?? ''
    const type = options.type ?? 'default'

    /* =========================
       1. merge duplicati
    ========================= */
    const existing = notifications.value.find(
      n => n.message === message && n.type === type
    )

    if (existing) {
      existing.count += 1

      if (existing._timeout) {
        clearTimeout(existing._timeout)
      }

      if (existing.duration > 0) {
        existing._timeout = setTimeout(
          () => dismiss(existing.id),
          existing.duration
        )
      }

      return existing.id
    }

    /* =========================
       2. se in transizione → aggiorna solo pending (NO nuovi timer)
    ========================= */
    if (isTransitioning) {
      pendingPush = { options, message, type }
      return null
    }

    /* =========================
       3. se c'è qualcosa visibile → entra in transizione
    ========================= */
    if (notifications.value.length > 0) {
      notifications.value.forEach(n => {
        if (n._timeout) clearTimeout(n._timeout)
      })

      notifications.value = []

      pendingPush = { options, message, type }

      isTransitioning = true

      if (transitionTimer) {
        clearTimeout(transitionTimer)
      }

      transitionTimer = setTimeout(() => {
        if (pendingPush) {
          pushNotification(
            pendingPush.options,
            pendingPush.message,
            pendingPush.type
          )
          pendingPush = null
        }

        isTransitioning = false
        transitionTimer = null
      }, LEAVE_DURATION)

      return null
    }

    /* =========================
       4. push immediato
    ========================= */
    return pushNotification(options, message, type)
  }

  const dismiss = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index === -1) return

    const notification = notifications.value[index]

    if (notification._timeout) {
      clearTimeout(notification._timeout)
    }

    notification.onClose?.()
    notifications.value.splice(index, 1)
  }

  const dismissAll = () => {
    notifications.value.forEach(n => {
      if (n._timeout) clearTimeout(n._timeout)
      n.onClose?.()
    })

    notifications.value = []
  }

  return {
    notify,
    dismiss,
    dismissAll,
  }
}

/* =========================
   Push notification
========================= */

function pushNotification(
  options: NotifyOptions,
  message: string,
  type: NotifyType
): number {
  const id = ++idCounter

  const notification: Notification = {
    id,
    message,
    title: options.title ?? null,
    type,
    duration: options.duration ?? 4000,
    position: options.position ?? 'bottom-right',
    icon: options.icon ?? null,
    actions: options.actions ?? [],
    closable: options.closable ?? true,
    onClose: options.onClose ?? null,
    count: 1,
    _timeout: null,
  }

  notifications.value.push(notification)

  if (notification.duration > 0) {
    notification._timeout = setTimeout(
      () => dismiss(notification.id),
      notification.duration
    )
  }

  return id
}

/* =========================
   Internal dismiss (safe)
========================= */

function dismiss(id: number) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index === -1) return

  const notification = notifications.value[index]

  if (notification._timeout) {
    clearTimeout(notification._timeout)
  }

  notification.onClose?.()
  notifications.value.splice(index, 1)
}