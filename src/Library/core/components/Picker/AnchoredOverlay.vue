<template>
  <Teleport to="body">
    <!-- Backdrop solo in modalità modal mobile: click sopra = chiusura esplicita -->
    <Transition name="vx-anchored-overlay-backdrop">
      <div
        v-if="modelValue && isMobile"
        class="vx-anchored-overlay__backdrop"
        @click="close('backdrop')"
      />
    </Transition>

    <Transition :name="transitionName" appear>
      <div
        v-if="modelValue"
        ref="floatingRef"
        class="vx-anchored-overlay"
        :class="{ 'vx-anchored-overlay--mobile-modal': isMobile }"
        :role="isMobile ? 'dialog' : 'dialog'"
        :aria-modal="isMobile ? 'true' : undefined"
        :aria-label="ariaLabel"
        :style="panelStyle"
        @keydown.esc="close('escape')"
      >
        <!-- Il contenuto (calendario, time list, select options, autocomplete list...)
             è completamente intercambiabile: l'overlay si occupa solo di
             apertura/chiusura, anchoring, positioning e responsive behavior. -->
        <slot :is-mobile="isMobile" :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * <AnchoredOverlay v-model="isOpen" :reference="rootRef">
 *   <template #default="{ isMobile, close }">
 *     ...contenuto del picker/select/autocomplete...
 *   </template>
 * </AnchoredOverlay>
 *
 * Responsabilità (e SOLO queste, per rimanere riutilizzabile):
 *  - apertura/chiusura (v-model)
 *  - anchoring persistente all'elemento `reference`
 *  - smart positioning (flip/shift) su desktop/tablet
 *  - conversione automatica in modal fullscreen/centrata su mobile
 *  - nessuna chiusura su scroll/resize: si ricalcola e basta
 *  - chiusura solo per: click outside, ESC (desktop), backdrop/azione
 *    esplicita su mobile, o azione esplicita del contenuto (es. selezione)
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useFloatingPanel } from '@/Library/core/composables/Picker/useFloatingPanel'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Ref (o elemento DOM) a cui l'overlay deve restare ancorato.
  reference: { type: [Object, Function], required: true },
  ariaLabel: { type: String, default: undefined },
  gap: { type: Number, default: 8 },
  viewportPadding: { type: Number, default: 8 },
  modalOnMobile: { type: Boolean, default: true },
  lockScrollOnMobile: { type: Boolean, default: true },
  matchReferenceWidth: { type: Boolean, default: false },
  placement: { type: String, default: 'bottom-start' },
  closeOnClickOutside: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

const floatingRef = ref(null)

// `reference` può essere una ref Vue già puntata all'elemento, o una
// funzione che la restituisce: normalizziamo in una ref semplice da passare
// al composable di positioning.
const referenceRef = ref(null)
watch(
  () => props.reference,
  (r) => {
    referenceRef.value = typeof r === 'function' ? r() : (r?.value ?? r)
  },
  { immediate: true }
)

const { panelStyle, transitionName, isMobile } = useFloatingPanel(
  referenceRef,
  floatingRef,
  () => props.modelValue,
  {
    gap: props.gap,
    viewportPadding: props.viewportPadding,
    modalOnMobile: props.modalOnMobile,
    lockScrollOnMobile: props.lockScrollOnMobile,
    matchReferenceWidth: props.matchReferenceWidth,
    placement: props.placement,
  }
)

function close(reason) {
  emit('update:modelValue', false)
  emit('close', reason)
}

// Click outside: unico punto di chiusura "involontaria" ammesso dal brief,
// oltre a ESC e alla selezione esplicita nel contenuto.
function onDocumentPointerDown(event) {
  if (!props.closeOnClickOutside || !props.modelValue) return
  const target = event.target
  const clickedReference = referenceRef.value?.contains?.(target)
  const clickedFloating = floatingRef.value?.contains?.(target)
  if (!clickedReference && !clickedFloating) close('click-outside')
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape' && props.modelValue && !isMobile.value) close('escape')
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<style scoped>
.vx-anchored-overlay {
  z-index: 1300;
  box-sizing: border-box;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.vx-anchored-overlay--mobile-modal {
  transform: translate(-50%, -50%);
}

.vx-anchored-overlay__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1290;
  background: rgba(0, 0, 0, 0.32);
}

.vx-anchored-overlay-backdrop-enter-active,
.vx-anchored-overlay-backdrop-leave-active {
  transition: opacity 180ms ease;
}
.vx-anchored-overlay-backdrop-enter-from,
.vx-anchored-overlay-backdrop-leave-to {
  opacity: 0;
}

.vx-anchored-overlay-float-enter-active,
.vx-anchored-overlay-float-leave-active {
  transition:
    opacity 180ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 220ms cubic-bezier(0.16, 1, 0.3, 1);
}
.vx-anchored-overlay-float-enter-from,
.vx-anchored-overlay-float-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
  filter: blur(4px);
}
.vx-anchored-overlay-float-enter-to,
.vx-anchored-overlay-float-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.vx-anchored-overlay-modal-enter-active,
.vx-anchored-overlay-modal-leave-active {
  transition:
    opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
.vx-anchored-overlay-modal-enter-from,
.vx-anchored-overlay-modal-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 20px)) scale(0.94);
}
.vx-anchored-overlay-modal-enter-to,
.vx-anchored-overlay-modal-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .vx-anchored-overlay-backdrop-enter-active,
  .vx-anchored-overlay-backdrop-leave-active,
  .vx-anchored-overlay-float-enter-active,
  .vx-anchored-overlay-float-leave-active,
  .vx-anchored-overlay-modal-enter-active,
  .vx-anchored-overlay-modal-leave-active {
    transition-duration: 0.01ms !important;
  }
}
</style>