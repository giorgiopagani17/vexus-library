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

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
// `size` viene ora usato solo per sincronizzare eventualmente la larghezza
// con la reference (matchReferenceWidth), MAI per limitare l'altezza.

const DEFAULT_MOBILE_BREAKPOINT = 640
// Sotto questa altezza disponibile (in px) consideriamo che non ci sia
// "abbastanza spazio" per un popover decente e passiamo comunque in modalità
// modal, anche su viewport tecnicamente più larghi di mobileBreakpoint
// (es. tastiera virtuale aperta su tablet in landscape).
const MIN_USABLE_VIEWPORT_HEIGHT = 380

// NOTA: qui non applichiamo più alcun vincolo di altezza (niente `size()` /
// maxHeight) al pannello: il contenuto non deve MAI generare uno scroll
// interno. `flip` si occupa di scegliere sopra/sotto in base allo spazio
// disponibile; se davvero non c'è spazio da nessuna parte, il pannello può
// sconfinare leggermente piuttosto che introdurre una scrollbar interna.

export function useFloatingPanel(referenceRef, floatingRef, isOpen, options = {}) {
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
  const coords = ref({ x: 0, y: 0 })
  const resolvedPlacement = ref(placement)
  const referenceWidth = ref(null)

  let stopAutoUpdate = null
  let previousBodyOverflow = ''
  let scrollLocked = false

  function computeIsMobile() {
    if (typeof window === 'undefined') return false
    const smallWidth = window.innerWidth <= mobileBreakpoint
    const shortViewport =
      (window.visualViewport?.height ?? window.innerHeight) < MIN_USABLE_VIEWPORT_HEIGHT
    return smallWidth || shortViewport
  }

  function lockScroll() {
    if (scrollLocked || typeof document === 'undefined') return
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scrollLocked = true
  }

  function unlockScroll() {
    if (!scrollLocked || typeof document === 'undefined') return
    document.body.style.overflow = previousBodyOverflow
    scrollLocked = false
  }

  async function updatePosition() {
    const referenceEl = referenceRef.value
    const floatingEl = floatingRef.value
    if (!referenceEl || !floatingEl) return
    // In modalità modal la posizione è fissa via CSS (centrata), non serve
    // interpellare Floating UI.
    if (isMobile.value && modalOnMobile) return

    const result = await computePosition(referenceEl, floatingEl, {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(gap),
        // 1) prova sotto, se non c'è spazio prova sopra (e viceversa se il
        //    placement iniziale fosse "top-*"): esattamente il requisito
        //    "smart positioning" del brief.
        flip({ padding: viewportPadding }),
        // 2) se anche dopo il flip il pannello sconfina lateralmente,
        //    lo trasla per restare dentro la viewport senza staccarsi
        //    dall'input.
        shift({ padding: viewportPadding }),
        // 3) SOLO se richiesto, sincronizza la larghezza del pannello con
        //    quella dell'input. Non viene mai applicato alcun vincolo di
        //    altezza: il pannello deve poter mostrare tutto il proprio
        //    contenuto senza scroll interno.
        ...(matchReferenceWidth
          ? [
              size({
                padding: viewportPadding,
                apply({ elements }) {
                  referenceWidth.value = elements.reference.getBoundingClientRect().width
                },
              }),
            ]
          : []),
      ],
    })

    coords.value = { x: result.x, y: result.y }
    resolvedPlacement.value = result.placement
  }

  function startAutoUpdate() {
    stopTracking()
    const referenceEl = referenceRef.value
    const floatingEl = floatingRef.value
    if (!referenceEl || !floatingEl) return

    // autoUpdate ascolta scroll (pagina + container interni con overflow),
    // resize della finestra e layout shift, e richiama updatePosition ad
    // ogni evento: è il meccanismo che garantisce l'anchoring persistente
    // richiesto dal punto 2/3/4 del brief, senza mai chiudere il pannello.
    stopAutoUpdate = autoUpdate(referenceEl, floatingEl, updatePosition, {
      ancestorScroll: true,
      ancestorResize: true,
      elementResize: true,
      layoutShift: true,
    })
  }

  function stopTracking() {
    if (stopAutoUpdate) {
      stopAutoUpdate()
      stopAutoUpdate = null
    }
  }

  async function activate() {
    isMobile.value = computeIsMobile()
    await nextTick()
    if (isMobile.value && modalOnMobile) {
      if (lockScrollOnMobile) lockScroll()
      stopTracking()
    } else {
      unlockScroll()
      await updatePosition()
      startAutoUpdate()
    }
  }

  function deactivate() {
    stopTracking()
    unlockScroll()
  }

  watch(isOpen, (open) => {
    if (open) activate()
    else deactivate()
  })

  // Reagisce a resize/orientationchange/tastiera virtuale (visualViewport)
  // ANCHE mentre il pannello è già aperto: se si attraversa il breakpoint
  // popover<->modal a runtime, il componente si riconfigura da solo, senza
  // mai chiudersi.
  function handleViewportChange() {
    if (!isOpen.value) return
    const wasMobile = isMobile.value
    const nowMobile = computeIsMobile()
    if (wasMobile === nowMobile) {
      // stessa modalità: se siamo in popover, autoUpdate gestisce già il
      // ricalcolo; se siamo in modal non serve fare nulla.
      return
    }
    isMobile.value = nowMobile
    activate()
  }

  onMounted(() => {
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)
    window.visualViewport?.addEventListener('resize', handleViewportChange)
  })

  onBeforeUnmount(() => {
    deactivate()
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('orientationchange', handleViewportChange)
    window.visualViewport?.removeEventListener('resize', handleViewportChange)
  })

  const panelStyle = computed(() => {
    if (isMobile.value && modalOnMobile) {
      // Il centraggio vero e proprio (translate -50%/-50%) resta demandato
      // alla classe CSS `--mobile-modal`, così le classi di transition
      // possono sovrascrivere `transform` in modo pulito durante enter/leave.
      return { position: 'fixed', top: '50%', left: '50%' }
    }

    return {
      position: 'fixed',
      top: `${coords.value.y}px`,
      left: `${coords.value.x}px`,
      ...(matchReferenceWidth && referenceWidth.value
        ? { width: `${referenceWidth.value}px` }
        : {}),
    }
  })

  const transitionName = computed(() =>
    isMobile.value && modalOnMobile ? 'vx-anchored-overlay-modal' : 'vx-anchored-overlay-float'
  )

  return {
    panelStyle,
    transitionName,
    isMobile,
    placement: resolvedPlacement,
    updatePosition,
  }
}