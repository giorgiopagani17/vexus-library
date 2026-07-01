<template>
  <div
    v-for="position in positions"
    :key="position"
    class="notify-group"
    :class="`notify-group--${position}`"
  >
    <TransitionGroup name="toast">
      <Notify
        v-for="n in byPosition(position)"
        :key="n.id"
        :notification="n"
        @close="dismiss(n.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { notifications, useNotify } from '@/Library/composables/Notify/useNotify'
import Notify from '@/Library/components/Notify/Notify.vue'

const { dismiss } = useNotify()

const positions = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center-center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right'
]

const byPosition = (position) =>
  notifications.value.filter(n => n.position === position)
</script>

<style lang="scss" scoped>
.notify-group {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  pointer-events: none;
  padding: 20px;

  &--top-left    { top: 0; left: 0; }
  &--top-center  { top: 0; left: 50%; transform: translateX(-50%); align-items: center; }
  &--top-right   { top: 0; right: 0; align-items: flex-end; }

  &--center-left    { top: 50%; left: 0; transform: translateY(-50%); }
  &--center-center  { top: 50%; left: 50%; transform: translate(-50%, -50%); align-items: center; }
  &--center-right   { top: 50%; right: 0; transform: translateY(-50%); align-items: flex-end; }

  &--bottom-left   { bottom: 0; left: 0; flex-direction: column-reverse; }
  &--bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); flex-direction: column-reverse; align-items: center; }
  &--bottom-right  { bottom: 0; right: 0; flex-direction: column-reverse; align-items: flex-end; }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
</style>