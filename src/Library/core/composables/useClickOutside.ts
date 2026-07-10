import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Invoca `onOutside` quando avviene un mousedown fuori da `rootRef`.
 *
 * @param rootRef Ref dell'elemento da monitorare.
 * @param onOutside Callback eseguita quando il click avviene all'esterno.
 */
export function useClickOutside(
  rootRef: Ref<HTMLElement | null>,
  onOutside: (event: MouseEvent) => void,
): void {
  function handler(event: MouseEvent): void {
    const root = rootRef.value

    if (!root) {
      return
    }

    const target = event.target

    if (!(target instanceof Node)) {
      return
    }

    if (!root.contains(target)) {
      onOutside(event)
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handler)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handler)
  })
}