// @/Library/core/composables/Input/useFloatingPanel.js
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

export function useFloatingPanel(referenceRef, panelRef, isOpen, options = {}) {
  const gap = options.gap ?? 6
  const viewportPadding = options.viewportPadding ?? 8
  const placement = options.placement ?? 'bottom-start'
  const mobileBreakpoint = options.mobileBreakpoint ?? 640
  const minWidth = options.minWidth ?? null
  const matchReferenceWidth = options.matchReferenceWidth ?? false
  const modalOnMobile = options.modalOnMobile ?? false
  const lockScrollOnMobile = options.lockScrollOnMobile ?? false

  const panelStyle = ref({
    position: 'fixed',
    top: '0px',
    left: '0px',
    transform: 'none',
    visibility: 'hidden',
  })

  const isMobile = ref(false)

  const transitionName = computed(() =>
    isMobile.value && modalOnMobile ? 'vx-datetimepicker-mobile' : 'vx-datetimepicker-float'
  )

  let frameId = 0
  let cleanupFns = []
  let bodyScrollLocked = false
  let previousOverflow = ''
  let previousPaddingRight = ''

  function detectMobile() {
    isMobile.value = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches
  }

  function cleanup() {
    cleanupFns.forEach((fn) => fn())
    cleanupFns = []

    if (frameId) {
      cancelAnimationFrame(frameId)
      frameId = 0
    }
  }

  function lockBodyScroll() {
    if (!lockScrollOnMobile || bodyScrollLocked) return

    bodyScrollLocked = true
    previousOverflow = document.body.style.overflow
    previousPaddingRight = document.body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
  }

  function unlockBodyScroll() {
    if (!lockScrollOnMobile || !bodyScrollLocked) return

    bodyScrollLocked = false
    document.body.style.overflow = previousOverflow
    document.body.style.paddingRight = previousPaddingRight
  }

  function scheduleUpdate() {
    if (!isOpen.value) return

    if (frameId) cancelAnimationFrame(frameId)

    frameId = requestAnimationFrame(() => {
      frameId = 0
      updatePosition()
    })
  }

  function isScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) return false
    const style = window.getComputedStyle(el)
    return /(auto|scroll|overlay)/.test(style.overflowY) || /(auto|scroll|overlay)/.test(style.overflowX)
  }

  function getScrollableAncestors(el) {
    const result = []
    let current = el?.parentElement ?? null

    while (current) {
      if (isScrollable(current)) result.push(current)
      current = current.parentElement
    }

    result.push(window)
    return result
  }

  function getVisibleBounds(el) {
    let top = 0
    let left = 0
    let right = window.innerWidth
    let bottom = window.innerHeight

    let current = el?.parentElement ?? null

    while (current) {
      if (isScrollable(current)) {
        const rect = current.getBoundingClientRect()
        top = Math.max(top, rect.top)
        left = Math.max(left, rect.left)
        right = Math.min(right, rect.right)
        bottom = Math.min(bottom, rect.bottom)
      }
      current = current.parentElement
    }

    return { top, left, right, bottom }
  }

  // NEW: determina se la reference è completamente fuori dall'area visibile
  // (viewport e/o contenitori scrollabili). In tal caso non ha senso "clampare"
  // la posizione: il pannello va chiuso, altrimenti resterebbe ancorato a un
  // punto fittizio (es. top:0) invece di seguire l'input.
  function isReferenceFullyHidden(rect, bounds) {
    return (
      rect.bottom <= bounds.top ||
      rect.top >= bounds.bottom ||
      rect.right <= bounds.left ||
      rect.left >= bounds.right
    )
  }

  function clampReferenceRect(rect, bounds) {
    const width = rect.width
    const height = rect.height

    const clampedTop = Math.min(Math.max(rect.top, bounds.top), bounds.bottom - height)
    const clampedLeft = Math.min(Math.max(rect.left, bounds.left), bounds.right - width)

    return {
      top: clampedTop,
      left: clampedLeft,
      width,
      height,
      right: clampedLeft + width,
      bottom: clampedTop + height,
    }
  }

  function getCoords(referenceRect, panelRect, placementName) {
    const [side, align = 'center'] = placementName.split('-')

    let top = 0
    let left = 0

    if (side === 'bottom') top = referenceRect.bottom + gap
    if (side === 'top') top = referenceRect.top - panelRect.height - gap

    if (align === 'start') left = referenceRect.left
    else if (align === 'end') left = referenceRect.right - panelRect.width
    else left = referenceRect.left + (referenceRect.width - panelRect.width) / 2

    return { top, left }
  }

  function getOverflowScore(coords, panelRect) {
    const vw = window.innerWidth
    const vh = window.innerHeight

    const overflowLeft = Math.max(0, viewportPadding - coords.left)
    const overflowTop = Math.max(0, viewportPadding - coords.top)
    const overflowRight = Math.max(0, coords.left + panelRect.width - (vw - viewportPadding))
    const overflowBottom = Math.max(0, coords.top + panelRect.height - (vh - viewportPadding))

    return {
      total: overflowLeft + overflowTop + overflowRight + overflowBottom,
      overflowLeft,
      overflowTop,
      overflowRight,
      overflowBottom,
    }
  }

  function clampHorizontal(left, panelRect) {
    const vw = window.innerWidth
    const minLeft = viewportPadding
    const maxLeft = Math.max(viewportPadding, vw - viewportPadding - panelRect.width)
    return Math.min(Math.max(left, minLeft), maxLeft)
  }

  function clampVertical(top, panelRect) {
    const vh = window.innerHeight
    const minTop = viewportPadding
    const maxTop = Math.max(viewportPadding, vh - viewportPadding - panelRect.height)
    return Math.min(Math.max(top, minTop), maxTop)
  }

  function getPlacementCandidates(preferred) {
    const map = {
      'bottom-start': ['bottom-start', 'top-start', 'bottom', 'top'],
      'bottom-end': ['bottom-end', 'top-end', 'bottom', 'top'],
      bottom: ['bottom', 'top', 'bottom-start', 'bottom-end'],
      'top-start': ['top-start', 'bottom-start', 'top', 'bottom'],
      'top-end': ['top-end', 'bottom-end', 'top', 'bottom'],
      top: ['top', 'bottom', 'top-start', 'top-end'],
    }

    return map[preferred] || map['bottom-start']
  }

  function getHiddenStyle() {
    return {
      position: 'fixed',
      top: '0px',
      left: '0px',
      transform: 'none',
      visibility: 'hidden',
    }
  }

  // FIX: il transform di centraggio non viene più impostato inline, così le
  // classi CSS della transition (che modificano transform durante l'animazione)
  // possono avere effetto senza essere sovrascritte dallo style inline.
  function applyMobileModal() {
    panelStyle.value = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      visibility: 'visible',
      width: 'min(360px, calc(100vw - 16px))',
      maxWidth: 'calc(100vw - 16px)',
      minWidth:
        minWidth !== null && minWidth !== undefined ? `${Number(minWidth)}px` : undefined,
    }
  }

  function updatePosition() {
    const referenceEl = referenceRef.value
    const panelEl = panelRef.value

    if (!referenceEl || !panelEl || !isOpen.value) return

    detectMobile()

    if (isMobile.value && modalOnMobile) {
      applyMobileModal()
      return
    }

    const rawReferenceRect = referenceEl.getBoundingClientRect()
    const visibleBounds = getVisibleBounds(referenceEl)

    // FIX: se l'input è completamente uscito dall'area visibile (scroll di
    // pagina o di un contenitore), chiudiamo il picker invece di clampare la
    // rect a un valore fittizio che lo ancorerebbe a top:0/left:0.
    if (isReferenceFullyHidden(rawReferenceRect, visibleBounds)) {
      panelStyle.value = getHiddenStyle()
      isOpen.value = false
      return
    }

    const referenceRect = clampReferenceRect(rawReferenceRect, visibleBounds)

    if (matchReferenceWidth) {
      panelEl.style.width = `${referenceRect.width}px`
    } else {
      panelEl.style.width = ''
    }

    if (minWidth !== null && minWidth !== undefined) {
      panelEl.style.minWidth = `${Number(minWidth)}px`
    } else {
      panelEl.style.minWidth = ''
    }

    panelEl.style.position = 'fixed'
    panelEl.style.top = '0px'
    panelEl.style.left = '0px'
    panelEl.style.transform = 'none'
    panelEl.style.visibility = 'hidden'

    const panelRect = panelEl.getBoundingClientRect()
    const placements = getPlacementCandidates(placement)

    let best = null

    for (const candidate of placements) {
      const coords = getCoords(referenceRect, panelRect, candidate)
      const overflow = getOverflowScore(coords, panelRect)

      if (overflow.total === 0) {
        best = { placement: candidate, coords, overflow }
        break
      }

      if (!best || overflow.total < best.overflow.total) {
        best = { placement: candidate, coords, overflow }
      }
    }

    const finalLeft = clampHorizontal(best.coords.left, panelRect)
    const finalTop = clampVertical(best.coords.top, panelRect)

    panelEl.dataset.placement = best.placement

    panelStyle.value = {
      position: 'fixed',
      top: `${finalTop}px`,
      left: `${finalLeft}px`,
      transform: 'none',
      visibility: 'visible',
      width: matchReferenceWidth ? `${referenceRect.width}px` : undefined,
      minWidth:
        minWidth !== null && minWidth !== undefined ? `${Number(minWidth)}px` : undefined,
    }
  }

  async function bindAutoUpdate() {
    await nextTick()

    const referenceEl = referenceRef.value
    const panelEl = panelRef.value

    if (!referenceEl || !panelEl || !isOpen.value) return

    scheduleUpdate()

    const scrollAncestors = Array.from(
      new Set([...getScrollableAncestors(referenceEl), ...getScrollableAncestors(panelEl)])
    )

    const onResize = () => {
      detectMobile()
      scheduleUpdate()
    }

    const onScroll = () => {
      scheduleUpdate()
    }

    window.addEventListener('resize', onResize, { passive: true })
    cleanupFns.push(() => window.removeEventListener('resize', onResize))

    scrollAncestors.forEach((ancestor) => {
      const target = ancestor === window ? window : ancestor
      target.addEventListener('scroll', onScroll, { passive: true, capture: true })
      cleanupFns.push(() => target.removeEventListener('scroll', onScroll, true))
    })

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        scheduleUpdate()
      })

      resizeObserver.observe(referenceEl)
      resizeObserver.observe(panelEl)
      cleanupFns.push(() => resizeObserver.disconnect())
    }
  }

  watch(
    isOpen,
    async (open) => {
      cleanup()

      if (open) {
        detectMobile()

        // FIX: applica subito lo stato "modal centrata" in modo sincrono,
        // nello stesso tick in cui isOpen diventa true. Prima veniva applicato
        // solo dentro bindAutoUpdate() (dopo nextTick + rAF), il che lasciava
        // il pannello nello stato iniziale (top:0/left:0) mentre la
        // <Transition appear> era già partita, causando il salto visivo
        // "dal basso-destra verso il centro".
        if (isMobile.value && modalOnMobile) {
          lockBodyScroll()
          applyMobileModal()
        }

        await bindAutoUpdate()
      } else {
        unlockBodyScroll()
        panelStyle.value = getHiddenStyle()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup()
    unlockBodyScroll()
  })

  return {
    panelStyle,
    isMobile,
    transitionName,
    updatePanelPosition: scheduleUpdate,
    lockBodyScroll,
    unlockBodyScroll,
  }
}