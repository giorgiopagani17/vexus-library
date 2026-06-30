<template>
  <div class="notify-toast" :class="`notify-toast--${notification.type}`">
    <span v-if="notification.count > 1" class="toast-badge">{{ notification.count }}</span>

    <component :is="notification.icon" v-if="notification.icon" :size="20" class="toast-icon" />
    <component :is="defaultIcon" v-else-if="defaultIcon" :size="20" class="toast-icon" />

    <div class="toast-content">
      <p v-if="notification.title" class="toast-title">{{ notification.title }}</p>
      <p class="toast-message">{{ notification.message }}</p>

      <div v-if="notification.actions.length" class="toast-actions">
        <button
          v-for="(action, i) in notification.actions"
          :key="i"
          class="toast-action"
          :style="{ color: action.color }"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <button v-if="notification.closable" class="toast-close" @click="$emit('close')">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const defaultIcon = computed(() => {
  const map = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }
  return map[props.notification.type] || null
})

const handleAction = (action) => {
  action.handler?.()
  if (action.closeOnClick !== false) emit('close')
}
</script>

<style lang="scss" scoped>
.notify-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 280px;
  max-width: 380px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba($tertiary, 0.97);
  border: 1px solid rgba($primary, 0.2);
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  pointer-events: auto;

  &--success {
    border-color: rgba(#21ba45, 0.35);
    .toast-icon { color: #21ba45; }
  }

  &--error {
    border-color: rgba(#c10015, 0.35);
    .toast-icon { color: #c10015; }
  }

  &--warning {
    border-color: rgba(#f2c037, 0.35);
    .toast-icon { color: #f2c037; }
  }

  &--info {
    border-color: rgba($primary, 0.35);
    .toast-icon { color: $primary; }
  }
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 13px;
  font-weight: 700;
  color: white;
  margin: 0 0 2px;
}

.toast-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}

.toast-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.toast-action {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: $primary;
  padding: 0;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.08);
  }
}

.toast-badge {
  position: absolute;
  top: -14px;
  left: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: $primary;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid $tertiary;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  z-index: 100;
}
</style>