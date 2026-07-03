import { onMounted, onUnmounted } from 'vue'

/**
 * Invoca `onOutside` quando avviene un mousedown fuori da `rootRef`.
 * Estratto dal pattern ripetuto in DatePicker/TimePicker.
 *
 * @param {import('vue').Ref<HTMLElement|null>} rootRef
 * @param {(event: MouseEvent) => void} onOutside
 */
export function useClickOutside(rootRef, onOutside) {
  function handler(event) {
    if (rootRef.value && !rootRef.value.contains(event.target)) {
      onOutside(event)
    }
  }

  onMounted(() => document.addEventListener('mousedown', handler))
  onUnmounted(() => document.removeEventListener('mousedown', handler))
}