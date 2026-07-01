import { ref, createApp } from 'vue'
import NotifyContainer from '@/Library/utils/Notify/NotifyContainer.vue'

/* =========================
   Types
========================= */

export type NotifyType = 'default' | 'success' | 'error' | 'warning' | 'info' | string

export type NotifyPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center-center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

/* Accetta un numero (interpretato come px) o qualsiasi stringa CSS valida
   (es. '1.5rem', '2vw', '120%', '20px') */
export type NotifySize = number | string

export interface NotifyColors {
  background?: string
  border?: string
  text?: string
  title?: string
  icon?: string
  iconBackground?: string
  accent?: string
  badgeBackground?: string
  badgeText?: string
  closeColor?: string
  shadow?: string
  progress?: string        // colore della barra di progresso
  progressTrack?: string   // colore del "binario" sotto la barra
}

export interface NotifyAction {
  label: string
  action: () => void
  color?: string
}

export interface NotifyOptions {
  message: string
  html?: boolean               // se true, `message` viene renderizzato come HTML
  title?: string | null
  type?: NotifyType
  colors?: NotifyColors | null
  duration?: number
  position?: NotifyPosition
  icon?: string | null
  loading?: boolean             // mostra uno spinner al posto dell'icona
  progress?: boolean            // mostra la barra di timeout (default: true se duration > 0)
  iconSize?: NotifySize          // default 20 (px)
  textSize?: NotifySize          // default 13 (px)
  titleSize?: NotifySize         // default 13 (px)
  closeButtonSize?: NotifySize   // default 16 (px)
  actions?: NotifyAction[]
  closable?: boolean
  onClose?: (() => void) | null
}

export interface Notification {
  id: number
  message: string
  html: boolean
  title: string | null
  type: NotifyType
  colors: NotifyColors | null
  duration: number
  position: NotifyPosition
  icon: string | null
  loading: boolean
  progress: boolean
  iconSize: NotifySize
  textSize: NotifySize
  titleSize: NotifySize
  closeButtonSize: NotifySize
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

      if (options.colors) existing.colors = options.colors
      if (options.loading !== undefined) existing.loading = options.loading

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

  /* Aggiorna una notifica esistente (utile per spinner → risultato) */
  const update = (id: number, patch: Partial<NotifyOptions>) => {
    const notification = notifications.value.find(n => n.id === id)
    if (!notification) return

    if (patch.message !== undefined) notification.message = patch.message
    if (patch.title !== undefined) notification.title = patch.title ?? null
    if (patch.type !== undefined) notification.type = patch.type
    if (patch.colors !== undefined) notification.colors = patch.colors ?? null
    if (patch.loading !== undefined) notification.loading = patch.loading
    if (patch.html !== undefined) notification.html = patch.html
    if (patch.icon !== undefined) notification.icon = patch.icon ?? null
    if (patch.iconSize !== undefined) notification.iconSize = patch.iconSize
    if (patch.textSize !== undefined) notification.textSize = patch.textSize
    if (patch.titleSize !== undefined) notification.titleSize = patch.titleSize
    if (patch.closeButtonSize !== undefined) notification.closeButtonSize = patch.closeButtonSize

    if (patch.duration !== undefined) {
      notification.duration = patch.duration
      if (notification._timeout) clearTimeout(notification._timeout)
      if (notification.duration > 0) {
        notification._timeout = setTimeout(
          () => dismiss(notification.id),
          notification.duration
        )
      }
    }
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
    update,
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
    html: options.html ?? false,
    title: options.title ?? null,
    type,
    colors: options.colors ?? null,
    duration: options.duration ?? 4000,
    position: options.position ?? 'bottom-right',
    icon: options.icon ?? null,
    loading: options.loading ?? false,
    progress: options.progress ?? ((options.duration ?? 4000) > 0),
    iconSize: options.iconSize ?? 20,
    textSize: options.textSize ?? 13,
    titleSize: options.titleSize ?? 13,
    closeButtonSize: options.closeButtonSize ?? 16,
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