/**
 * useFloatingPanel
 * -----------------
 * Composable riutilizzabile che dà a qualsiasi coppia (reference, floating)
 * un comportamento equivalente al Popper/Modal di MUI X:
 *
 *  - desktop/tablet -> popover ancorato all'input, con flip/shift automatico
 *    e ricalcolo continuo della posizione (scroll, resize, layout shift).
 *  - mobile         -> si trasforma automaticamente in dialog fullscreen/centrata,
 *    senza bisogno di configurazione manuale da parte del consumer.
 *  - lo scroll (della pagina o di un container interno) NON chiude mai il
 *    pannello: lo fa solo seguire l'input ricalcolando la posizione.
 *
 * Dipende da @floating-ui/dom (autoUpdate + flip + shift + size + offset),
 * la stessa libreria (concettualmente) usata da MUI/Base UI per i popper.
 *
 * Firma pensata per essere drop-in compatibile con l'uso già presente in
 * VxDateTimePicker.vue:
 *
 *   const { panelStyle, transitionName, isMobile } = useFloatingPanel(
 *     rootRef, panelRef, isOpen,
 *     { gap: 8, viewportPadding: 8, modalOnMobile: true, lockScrollOnMobile: true, matchReferenceWidth: false }
 *   )
 */

import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from '@floating-ui/dom'

const DEFAULT_MOBILE_BREAKPOINT = 640

// Sotto questa altezza disponibile (in px) consideriamo che non ci sia
// abbastanza spazio per un popover e passiamo automaticamente alla modalità modal.
const MIN_USABLE_VIEWPORT_HEIGHT = 380

export interface UseFloatingPanelOptions {
  gap?: number
  viewportPadding?: number
  modalOnMobile?: boolean
  lockScrollOnMobile?: boolean
  matchReferenceWidth?: boolean
  mobileBreakpoint?: number
  placement?: Placement
}

export interface UseFloatingPanelReturn {
  panelStyle: ComputedRef<CSSProperties>
  transitionName: ComputedRef<string>
  isMobile: Ref<boolean>
  placement: Ref<Placement>
  updatePosition: () => Promise<void>
}

export function useFloatingPanel(
  referenceRef: Ref<HTMLElement | null>,
  floatingRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  options: UseFloatingPanelOptions = {},
): UseFloatingPanelReturn {
  const {
    gap = 8,
    viewportPadding = 8,
    modalOnMobile = true,
    lockScrollOnMobile = true,
    matchReferenceWidth = false,
    mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
    placement = 'bottom-start',
  } = options

  const isMobile = ref(false)

  const coords = ref({
    x: 0,
    y: 0,
  })

  const resolvedPlacement = ref<Placement>(placement)
  const referenceWidth = ref<number | null>(null)

  let stopAutoUpdate: ReturnType<typeof autoUpdate> | null = null

  let previousBodyOverflow = ''
  let scrollLocked = false

  function computeIsMobile(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    const smallWidth = window.innerWidth <= mobileBreakpoint

    const shortViewport =
      (window.visualViewport?.height ?? window.innerHeight) <
      MIN_USABLE_VIEWPORT_HEIGHT

    return smallWidth || shortViewport
  }

  function lockScroll(): void {
    if (scrollLocked || typeof document === 'undefined') {
      return
    }

    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scrollLocked = true
  }

  function unlockScroll(): void {
    if (!scrollLocked || typeof document === 'undefined') {
      return
    }

    document.body.style.overflow = previousBodyOverflow
    scrollLocked = false
  }

  async function updatePosition(): Promise<void> {
    const referenceEl = referenceRef.value
    const floatingEl = floatingRef.value

    if (!referenceEl || !floatingEl) {
      return
    }

    // In modalità modal la posizione è gestita dal CSS.
    if (isMobile.value && modalOnMobile) {
      return
    }

    const result = await computePosition(referenceEl, floatingEl, {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(gap),

        flip({
          padding: viewportPadding,
        }),

        shift({
          padding: viewportPadding,
        }),

        ...(matchReferenceWidth
          ? [
              size({
                padding: viewportPadding,
                apply({ elements }) {
                  referenceWidth.value =
                    elements.reference.getBoundingClientRect().width
                },
              }),
            ]
          : []),
      ],
    })

    coords.value = {
      x: result.x,
      y: result.y,
    }

    resolvedPlacement.value = result.placement
  }

  function stopTracking(): void {
    if (stopAutoUpdate) {
      stopAutoUpdate()
      stopAutoUpdate = null
    }
  }

  function startAutoUpdate(): void {
    stopTracking()

    const referenceEl = referenceRef.value
    const floatingEl = floatingRef.value

    if (!referenceEl || !floatingEl) {
      return
    }

    stopAutoUpdate = autoUpdate(
      referenceEl,
      floatingEl,
      updatePosition,
      {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
      },
    )
  }

  async function activate(): Promise<void> {
    isMobile.value = computeIsMobile()

    await nextTick()

    if (isMobile.value && modalOnMobile) {
      stopTracking()

      if (lockScrollOnMobile) {
        lockScroll()
      }

      return
    }

    unlockScroll()

    await updatePosition()

    startAutoUpdate()
  }

  function deactivate(): void {
    stopTracking()
    unlockScroll()
  }

  function handleViewportChange(): void {
    if (!isOpen.value) {
      return
    }

    const nowMobile = computeIsMobile()

    if (nowMobile === isMobile.value) {
      return
    }

    isMobile.value = nowMobile

    void activate()
  }

  watch(isOpen, (open) => {
    if (open) {
      void activate()
    } else {
      deactivate()
    }
  })

  onMounted(() => {
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)
    window.visualViewport?.addEventListener(
      'resize',
      handleViewportChange,
    )
  })

  onBeforeUnmount(() => {
    deactivate()

    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener(
      'orientationchange',
      handleViewportChange,
    )
    window.visualViewport?.removeEventListener(
      'resize',
      handleViewportChange,
    )
  })

  const panelStyle = computed<CSSProperties>(() => {
    if (isMobile.value && modalOnMobile) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
      }
    }

    return {
      position: 'fixed',
      top: `${coords.value.y}px`,
      left: `${coords.value.x}px`,
      ...(matchReferenceWidth && referenceWidth.value !== null
        ? {
            width: `${referenceWidth.value}px`,
          }
        : {}),
    }
  })

  const transitionName = computed(() =>
    isMobile.value && modalOnMobile
      ? 'vx-anchored-overlay-modal'
      : 'vx-anchored-overlay-float',
  )

  return {
    panelStyle,
    transitionName,
    isMobile,
    placement: resolvedPlacement,
    updatePosition,
  }
}