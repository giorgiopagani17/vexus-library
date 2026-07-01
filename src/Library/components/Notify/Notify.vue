<template>
  <div
    class="notify-toast"
    :class="[
      `notify-toast--${notification.type}`,
      { 'notify-toast--has-progress': showProgress }
    ]"
    :style="cssVars"
  >
    <!-- Badge FUORI dal box clippato, così non viene mai tagliato -->
    <span v-if="notification.count > 1" class="toast-badge">{{ notification.count > 9 ? '9+' : notification.count }}</span>

    <!-- Wrapper con overflow:hidden, contiene tutto ciò che deve rispettare gli angoli arrotondati -->
    <div class="toast-inner">
      <!-- Spinner (priorità massima) -->
      <span v-if="notification.loading" class="toast-icon toast-icon--spinner">
        <Loader2 :size="iconSizePx" class="spin" />
      </span>

      <!-- Icona custom -->
      <component
        v-else-if="notification.icon"
        :is="notification.icon"
        :size="iconSizePx"
        class="toast-icon"
      />

      <!-- Icona di default in base al type -->
      <component
        v-else-if="defaultIcon"
        :is="defaultIcon"
        :size="iconSizePx"
        class="toast-icon"
      />

      <div class="toast-content">
        <p v-if="notification.title" class="toast-title">{{ notification.title }}</p>

        <!-- Contenuto HTML libero -->
        <div v-if="notification.html" class="toast-message" v-html="notification.message" />
        <p v-else class="toast-message">{{ notification.message }}</p>

        <div v-if="notification.actions.length" class="toast-actions">
          <button
            v-for="(action, i) in notification.actions"
            :key="i"
            class="toast-action"
            :style="action.color ? { color: action.color } : {}"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>

      <button v-if="notification.closable" class="toast-close" @click="$emit('close')">
        <X :size="closeSizePx" />
      </button>

      <!-- Barra di progresso timeout -->
      <div v-if="showProgress" class="toast-progress-track">
        <div
          class="toast-progress-bar"
          :key="`${notification.id}-${notification.count}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X, CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-vue-next'

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

const showProgress = computed(() =>
  props.notification.progress && props.notification.duration > 0
)

/* Converte number | string in un valore CSS valido.
   Number → px, string → usata così com'è (rem, %, vw, ecc.) */
const toCssSize = (value) => {
  if (value === undefined || value === null) return null
  return typeof value === 'number' ? `${value}px` : value
}

/* lucide-vue-next accetta `size` come number o stringa CSS: se l'utente passa
   un'unità non-px (es. '1.5rem'), la giriamo così com'è; se passa un numero
   semplice, resta un numero puro (comportamento nativo del componente icona). */
const toIconSize = (value) => {
  if (value === undefined || value === null) return 20
  return typeof value === 'number' ? value : value
}

const iconSizePx = computed(() => toIconSize(props.notification.iconSize))
const closeSizePx = computed(() => toIconSize(props.notification.closeButtonSize))

/* Mappa `colors` + size custom su CSS variables.
   Le chiavi non specificate restano ai default definiti in SCSS. */
const cssVars = computed(() => {
  const n = props.notification
  const c = n.colors || {}

  const colorMap = {
    background: '--toast-bg',
    shadow: '--toast-shadow',
    border: '--toast-border',
    text: '--toast-text',
    title: '--toast-title',
    icon: '--toast-icon',
    accent: '--toast-accent',
    badgeBackground: '--toast-badge-bg',
    badgeText: '--toast-badge-text',
    closeColor: '--toast-close',
    shadow: '--toast-shadow',
    progress: '--toast-progress',
    progressTrack: '--toast-progress-track',
  }

  const vars = {}
  for (const key in colorMap) {
    if (c[key]) vars[colorMap[key]] = c[key]
  }

  vars['--toast-icon-size'] = toCssSize(n.iconSize) ?? '20px'
  vars['--toast-text-size'] = toCssSize(n.textSize) ?? '13px'
  vars['--toast-title-size'] = toCssSize(n.titleSize) ?? '13px'
  vars['--toast-radius'] = toCssSize(n.radius) ?? '14px'
  vars['--toast-close-size'] = toCssSize(n.closeButtonSize) ?? '16px'
  vars['--toast-duration'] = `${n.duration}ms`
  vars['--toast-align-items'] = n.alignItems ?? 'center'

  return vars
})

const handleAction = (action) => {
  action.action?.()
  emit('close')
}
</script>

<style lang="scss" scoped>
.notify-toast {
  /* ===== default (type "default"): background pieno, testo bianco ===== */
  --toast-bg: #{$primary};
  --toast-shadow: color-mix(in srgb, var(--toast-bg) 35%, transparent);
  --toast-border: transparent;
  --toast-text: rgba(255, 255, 255, 0.85);
  --toast-title: #ffffff;
  --toast-icon: #ffffff;
  --toast-accent: #ffffff;
  --toast-badge-bg: #ffffff;
  --toast-badge-text: #{$primary};
  --toast-close: rgba(255, 255, 255, 0.6);
  --toast-progress: rgba(255, 255, 255, 0.9);
  --toast-progress-track: rgba(255, 255, 255, 0.25);
  --toast-icon-size: 20px;
  --toast-text-size: 13px;
  --toast-title-size: 13px;
  --toast-radius: 14px;
  --toast-align-items: center;
  --toast-close-size: 16px;

  /* Container esterno: NIENTE overflow qui, così il badge può sporgere
  senza essere clippato. Non ha background/padding/border-radius propri:
  quelli vivono su .toast-inner. */
  position: relative;
  display: inline-block;
  min-width: 280px;
  max-width: 380px;
  pointer-events: auto;

  &--success {
    --toast-bg: #{$positive};
    --toast-badge-text: #{$positive};
    --toast-shadow: #{rgba($positive, 0.35)};
  }

  &--error {
    --toast-bg: #{$negative};
    --toast-badge-text: #{$negative};
    --toast-shadow: #{rgba($negative, 0.35)};
  }

  &--warning {
    --toast-bg: #{$warning};
    --toast-badge-text: #{$warning};
    --toast-shadow: #{rgba($warning, 0.35)};
  }

  &--info {
    --toast-bg: #{$info};
    --toast-badge-text: #{$info};
    --toast-shadow: #{rgba($info, 0.35)};
  }
}

/* Wrapper interno: qui vivono background, bordo, ombra, angoli arrotondati
e l'overflow:hidden necessario per la progress bar. Essendo il badge fuori
da questo elemento, non viene mai tagliato. */
.toast-inner {
  position: relative;
  display: flex;
  align-items: var(--toast-align-items);
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: var(--toast-radius);
  background: var(--toast-bg);
  border: 1px solid var(--toast-border);
  box-shadow: 0 12px 32px var(--toast-shadow);
  overflow: hidden;

  .notify-toast--has-progress & {
    padding-bottom: 17px; /* spazio per la barra */
  }

  .notify-toast:hover & .toast-progress-bar {
    animation-play-state: paused;
  }
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
  width: var(--toast-icon-size);
  height: var(--toast-icon-size);
  color: var(--toast-icon);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }

  &--spinner {
    background: transparent;
  }
}

.spin {
  animation: toast-spin 0.8s linear infinite;
  width: 100%;
  height: 100%;
}

@keyframes toast-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--toast-title-size);
  font-weight: 700;
  color: var(--toast-title);
  margin: 0 0 2px;
}

.toast-message {
  font-size: var(--toast-text-size);
  color: var(--toast-text);
  line-height: 1.5;
  margin: 0;

  /* contenuto HTML libero: reset base per elementi comuni */
  :deep(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :deep(b),
  :deep(strong) {
    font-weight: 700;
  }

  :deep(ul),
  :deep(ol) {
    margin: 6px 0 0;
    padding-left: 18px;
  }

  :deep(p) {
    margin: 0 0 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
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
  font-weight: 700;
  cursor: pointer;
  color: var(--toast-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
}

.toast-close {
  flex-shrink: 0;
  width: calc(var(--toast-close-size) + 8px);
  height: calc(var(--toast-close-size) + 8px);
  background: none;
  border: none;
  color: var(--toast-close);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;

  :deep(svg) {
    width: var(--toast-close-size);
    height: var(--toast-close-size);
  }

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.15);
  }
}

/* Badge: ora è figlio diretto di .notify-toast (che non ha overflow:hidden),
quindi può sporgere sopra e a sinistra senza essere tagliato. */
.toast-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  min-width: 22px;
  height: 22px;
  padding: 0px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background: var(--toast-badge-bg);
  color: var(--toast-badge-text);
  font-size: 11px;
  font-weight: 700;
  border: 2px solid var(--toast-bg);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.toast-progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--toast-progress-track);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  background: var(--toast-progress);
  transform-origin: left;
  animation: toast-shrink linear forwards;
  animation-duration: var(--toast-duration);
}

@keyframes toast-shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
</style>