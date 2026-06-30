<template>
  <div class="feature-card">
    <q-icon :name="icon" size="28px" :color="color" />
    <h3 style="margin: 0 0 8px 0;">{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  }
})
</script>

<style lang="scss" scoped>
.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba($primary, 0.15);
  border-radius: 18px;
  padding: 28px 24px;
  backdrop-filter: blur(12px);
  transition: transform 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba($primary, 0.4);
  }

  h3 {
    font-size: 16px;
    margin: 16px 0 8px;
  }

  p {
    font-size: 13px;
    line-height: 1.6;
    opacity: 0.6;
    margin: 0;
  }
}
</style>