<template>
  <button class="base-btn" :class="`base-btn--${variant}`" @click="$emit('click', $event)">
    <component :is="iconLeft" v-if="iconLeft" :size="iconSize" class="icon icon--left" />
    <span class="label">{{ text }}</span>
    <component :is="iconRight" v-if="iconRight" :size="iconSize" class="icon icon--right" />
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default', // 'default' | 'primary' | 'ghost'
    validator: (val) => ['default', 'primary', 'ghost'].includes(val)
  },
  iconLeft: {
    type: [Object, Function],
    default: null
  },
  iconRight: {
    type: [Object, Function],
    default: null
  },
  iconSize: {
    type: Number,
    default: 14
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba($primary, 0.15);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba($primary, 0.4);
    background: rgba(255, 255, 255, 0.05);
    color: $primary;
    transform: scale(1.05);

    .icon {
      opacity: 1;
      color: $primary;
    }
  }

  &:active {
    transform: scale(0.97);
  }

  &--primary {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba($primary, 0.15);
    color: white;

    &:hover {
      border-color: rgba($primary, 0.4);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &--ghost {
    background: transparent;
    border-color: transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      color: $primary;

      .icon {
        opacity: 1;
        color: $primary;
      }
    }
  }
}

.label {
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
  font-weight: bold;
}

.icon {
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease, color 0.2s ease;
}
</style>