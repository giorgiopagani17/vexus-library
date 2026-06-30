<template>
  <div class="not-found">
    <div class="card">
      <div class="glitch-number" data-text="404">404</div>

      <h2>{{ t('errorNotFound.title') }}</h2>

      <p>
        {{ t('errorNotFound.message') }}
      </p>

      <div class="actions">
        <DesignButton :text="$t('buttons.backToHome')" :icon-left="Plus" variant="primary" @click="goHome" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DesignButton from '@/Docs/components/Buttons/DesignButton.vue'

const { t } = useI18n()
const router = useRouter()

const goHome = () => router.push('/')
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba($primary, 0.25);
  padding: 56px 44px;
  border-radius: 24px;
  max-width: 460px;
  backdrop-filter: blur(16px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.glitch-number {
  position: relative;
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 16px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, $primary, $secondary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0.6;
  }

  &::before {
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    background-clip: text;
    animation: glitch-1 3s infinite linear alternate-reverse;
  }

  &::after {
    background: linear-gradient(135deg, $secondary, $primary);
    -webkit-background-clip: text;
    background-clip: text;
    animation: glitch-2 2.5s infinite linear alternate-reverse;
  }
}

h2 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

p {
  opacity: 0.65;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  border-radius: 12px;
  padding: 8px 24px;
  box-shadow: 0 8px 24px rgba($primary, 0.35);
}

.btn-secondary {
  border-radius: 12px;
  padding: 8px 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

@keyframes glitch-1 {
  0%   { clip-path: inset(0 0 90% 0); transform: translate(-2px, 0); }
  20%  { clip-path: inset(20% 0 60% 0); transform: translate(2px, 0); }
  40%  { clip-path: inset(50% 0 30% 0); transform: translate(-1px, 0); }
  60%  { clip-path: inset(70% 0 10% 0); transform: translate(1px, 0); }
  80%  { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 0); }
  100% { clip-path: inset(40% 0 40% 0); transform: translate(2px, 0); }
}

@keyframes glitch-2 {
  0%   { clip-path: inset(60% 0 20% 0); transform: translate(2px, 0); }
  25%  { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 0); }
  50%  { clip-path: inset(80% 0 5% 0); transform: translate(1px, 0); }
  75%  { clip-path: inset(30% 0 50% 0); transform: translate(-2px, 0); }
  100% { clip-path: inset(5% 0 85% 0); transform: translate(2px, 0); }
}
</style>