// @/Library/core/composables/Input/useCloseWhenReferenceHidden.js
import { onBeforeUnmount, watch } from 'vue'

export function useCloseWhenReferenceHidden(referenceRef, isOpen, close, options = {}) {
  const threshold = options.threshold ?? 0
  const root = options.root ?? null
  const rootMargin = options.rootMargin ?? '0px'
  const panelRef = options.panelRef ?? null

  let observer = null

  function cleanup() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function isInteractionInside() {
    const active = document.activeElement
    const referenceEl = referenceRef?.value
    const panelEl = panelRef?.value

    if (!active) return false
    if (referenceEl && referenceEl.contains(active)) return true
    if (panelEl && panelEl.contains(active)) return true

    return false
  }

  watch(
    isOpen,
    (open) => {
      cleanup()

      if (!open || !referenceRef.value || typeof IntersectionObserver === 'undefined') {
        return
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.isIntersecting) return
          if (isInteractionInside()) return
          close()
        },
        {
          root,
          rootMargin,
          threshold,
        }
      )

      observer.observe(referenceRef.value)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    cleanup()
  })
}