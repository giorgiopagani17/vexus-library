<template>
  <VxFieldWrapper
    v-bind="wrapperProps"
    :multiline="tag === 'textarea'"
    :style="{ '--vx-input-accent': color }"
  >
    <template v-if="$slots['icon-left']" #icon-left>
      <slot name="icon-left" />
    </template>

    <template #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }">
      <!-- File: markup completamente custom (input nativo nascosto ma accessibile + label-bottone + nome file) -->
      <div v-if="isFileInput" class="vx-input__file">
        <input
          :id="fieldId"
          ref="inputRef"
          type="file"
          class="vx-input__file-native"
          :accept="accept"
          :multiple="multiple"
          :disabled="fieldDisabled || loading"
          @change="onFileChange"
          @focus="handleFocus(chromeFocus, $event)"
          @blur="handleBlur(chromeBlur, $event)"
        />
        <label
          :for="fieldId"
          class="vx-input__file-browse"
          :class="{ 'vx-input__file-browse--disabled': fieldDisabled || loading }"
        >
          <Upload :size="14" />
          {{ browseLabel }}
        </label>
        <span class="vx-input__file-name" :class="{ 'vx-input__file-name--placeholder': !fileNames.length }">
          {{ fileNames.length ? fileNames.join(', ') : (placeholder || emptyLabel) }}
        </span>
        <button
          v-if="clearable && hasValue && !fieldDisabled && !loading"
          type="button"
          class="vx-input__clear"
          tabindex="-1"
          aria-label="Cancella"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="14" />
        </button>
      </div>

      <component
        v-else
        :is="tag"
        :id="fieldId"
        ref="inputRef"
        class="vx-input__field"
        :class="{ 'vx-input__field--textarea': tag === 'textarea' }"
        :type="tag === 'input' ? effectiveType : undefined"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="fieldDisabled || loading"
        :readonly="readonly"
        :min="isNumberInput ? min : undefined"
        :max="isNumberInput ? max : undefined"
        :step="isNumberInput ? step : undefined"
        :aria-invalid="computedError ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        @input="onInput"
        @focus="handleFocus(chromeFocus, $event)"
        @blur="handleBlur(chromeBlur, $event)"
      />
    </template>

    <template v-if="!isFileInput && showTrailingGroup" #trailing="{ resolvedIconSize }">
      <div class="vx-input__trailing-group">
        <button
          v-if="isPassword && showPasswordToggle"
          type="button"
          class="vx-input__toggle-btn"
          tabindex="-1"
          :aria-label="passwordVisible ? 'Nascondi password' : 'Mostra password'"
          @mousedown.prevent
          @click="passwordVisible = !passwordVisible"
        >
          <EyeOff v-if="passwordVisible" :size="resolvedIconSize" />
          <Eye v-else :size="resolvedIconSize" />
        </button>

        <div v-if="isNumberInput && spinners" class="vx-input__spinner">
          <button
            type="button"
            class="vx-input__spinner-btn"
            tabindex="-1"
            aria-label="Incrementa"
            :disabled="disabled || loading"
            @mousedown.prevent
            @click="stepValue(1)"
          >
            <ChevronUp :size="12" />
          </button>
          <button
            type="button"
            class="vx-input__spinner-btn"
            tabindex="-1"
            aria-label="Decrementa"
            :disabled="disabled || loading"
            @mousedown.prevent
            @click="stepValue(-1)"
          >
            <ChevronDown :size="12" />
          </button>
        </div>

        <button
          v-if="clearable && hasValue && !disabled"
          type="button"
          class="vx-input__clear"
          tabindex="-1"
          aria-label="Cancella"
          @mousedown.prevent
          @click="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
      </div>
    </template>

    <template v-if="$slots['icon-right']" #icon-right>
      <slot name="icon-right" />
    </template>
  </VxFieldWrapper>
</template>

<script>
/**
 * Tutti i valori nativi validi per l'attributo HTML `type` di <input>
 * gestiti da questo componente.
 *
 * NB: i tipi 'date', 'datetime-local', 'month', 'week', 'time' sono
 * volutamente esclusi. Il rendering nativo del browser per questi tipi
 * (icona calendario/clessidra, popup di selezione) non è restylizzabile
 * in modo coerente col resto del design system: vanno gestiti da
 * componenti dedicati (VxDatePicker, VxTimePicker) che useranno lo
 * stesso VxFieldWrapper ma con un pannello custom al posto dell'input
 * nativo. Stesso discorso vale in prospettiva per 'color' e 'range'.
 *
 * Dichiarato in un blocco <script> separato (module scope) perché
 * `defineProps()` in <script setup> viene compilato/hoistato fuori dalla
 * funzione setup e non può referenziare variabili dichiarate localmente
 * dentro <script setup>: deve poter accedere solo a binding di modulo.
 */
export const INPUT_TYPES = [
  'text',
  'password',
  'email',
  'number',
  'tel',
  'url',
  'file',
  'checkbox',
  'radio',
]
</script>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronUp, Eye, EyeOff, Upload, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'

// Pattern di validazione automatica per email/tel/url. Volutamente
// permissivi (soprattutto tel, che varia molto tra paesi): l'obiettivo è
// intercettare errori di battitura grossolani, non sostituire una vera
// validazione server-side.
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tel: /^[+]?[0-9\s().-]{6,}$/,
  url: /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i,
}

const props = defineProps({
  /**
   * Valore del campo (v-model).
   * Per type="file": File singolo (o null) se `multiple` è false,
   * array di File (eventualmente vuoto) se `multiple` è true.
   */
  modelValue: {
    type: [String, Number, Array, Object],
    default: '',
  },
  /**
   * Tipo nativo dell'input, ignorato se tag="textarea".
   * Vedi INPUT_TYPES sopra per l'elenco supportato.
   */
  type: {
    type: String,
    default: 'text',
    validator: (value) => INPUT_TYPES.includes(value),
  },
  /** 'outline' | 'ghost' | 'text' (text = stile underline) */
  variant: {
    type: String,
    default: 'outline',
  },
  /**
   * Colore del bordo/focus ring (e, per type="file", del bottone "Scegli file").
   * Accetta qualunque valore CSS valido: '#7c3aed', 'rgb(...)',
   * 'rgba(...)', 'red', 'var(--mio-brand)', ecc.
   */
  color: {
    type: String,
    default: '#7c3aed',
  },
  /** 'sm' | 'md' | 'lg' */
  size: {
    type: [String, Object],
    default: 'md',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  /** Mostra spinner al posto del pulsante clear, disabilita l'input */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Occupa tutta la larghezza disponibile */
  block: {
    type: Boolean,
    default: false,
  },
  /** Bordi completamente arrotondati (pillola) */
  pill: {
    type: Boolean,
    default: false,
  },
  /** Override del border-radius, number → px, string → usata così com'è */
  radius: {
    type: [Number, String],
    default: null,
  },
  /** Componente icona (es. da lucide-vue-next), usato se non passi gli slot */
  icon: {
    type: [Object, Function],
    default: null,
  },
  /** 'left' | 'right' — posizione della prop `icon` quando non usi gli slot */
  iconPosition: {
    type: String,
    default: 'left',
  },
  /** Override dimensione icona, number → px, string → usata così com'è */
  iconSize: {
    type: [Number, String],
    default: null,
  },
  /** Mostra una X per svuotare il campo quando c'è un valore */
  clearable: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  /** Etichetta sopra il campo */
  label: {
    type: String,
    default: '',
  },
  /** Testo di aiuto sotto il campo (nascosto se error è true e c'è errorMessage) */
  hint: {
    type: String,
    default: '',
  },
  /** Stato di errore: bordo/focus ring rosso (si somma alla validazione automatica di email/tel/url) */
  error: {
    type: Boolean,
    default: false,
  },
  /** Messaggio mostrato sotto il campo quando error è true */
  errorMessage: {
    type: String,
    default: '',
  },
  /**
   * Override colori custom, scavalca il colore impostato tramite `color`.
   * { background, text, icon, border, focusBorder, focusShadow, placeholder }
   */
  colors: {
    type: Object,
    default: null,
  },
  /** 'ring' (default) | 'lift' | 'glow' | 'none' | 'custom' */
  focusEffect: {
    type: String,
    default: 'ring',
  },
  /** Elemento renderizzato per il campo: 'input' | 'textarea' */
  tag: {
    type: String,
    default: 'input',
  },

  // ===== type="number" =====
  /** Mostra i pulsanti +/- custom (gli spinner nativi del browser sono sempre nascosti) */
  spinners: {
    type: Boolean,
    default: true,
  },
  min: {
    type: [Number, String],
    default: null,
  },
  max: {
    type: [Number, String],
    default: null,
  },
  step: {
    type: [Number, String],
    default: 1,
  },

  // ===== type="password" =====
  /** Mostra l'icona a occhio per rivelare/nascondere la password */
  showPasswordToggle: {
    type: Boolean,
    default: true,
  },

  // ===== type="email" | "tel" | "url" =====
  /** Valida automaticamente il formato al blur e mostra errore se non valido */
  autoValidate: {
    type: Boolean,
    default: true,
  },
  /** Override del messaggio d'errore mostrato quando autoValidate rileva un formato non valido */
  invalidMessage: {
    type: String,
    default: '',
  },

  // ===== type="file" =====
  /** Estensioni/mime-type accettati, passato così com'è all'attributo nativo `accept` */
  accept: {
    type: String,
    default: '',
  },
  /** Consente la selezione di più file */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** Testo del bottone di selezione file */
  browseLabel: {
    type: String,
    default: 'Scegli file',
  },
  /** Testo mostrato quando nessun file è stato selezionato */
  emptyLabel: {
    type: String,
    default: 'Nessun file selezionato',
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'input', 'change'])

const inputRef = ref(null)

// Sottoinsieme di prop da inoltrare al wrapper condiviso (chrome visivo):
// tutto ciò che riguarda label/hint/error/size/variant/colori/focus.
const wrapperProps = computed(() => ({
  size: props.size,
  block: props.block,
  variant: props.variant,
  pill: props.pill,
  radius: props.radius,
  color: props.color,
  colors: props.colors,
  focusEffect: props.focusEffect,
  disabled: props.disabled,
  loading: props.loading,
  error: computedError.value,
  errorMessage: computedErrorMessage.value,
  hint: props.hint,
  label: props.label,
  icon: props.icon,
  iconPosition: props.iconPosition,
  iconSize: props.iconSize,
}))

const isNumberInput = computed(() => props.tag === 'input' && props.type === 'number')
const isPassword = computed(() => props.tag === 'input' && props.type === 'password')
const isFileInput = computed(() => props.tag === 'input' && props.type === 'file')
const isValidatableType = computed(() => props.tag === 'input' && ['email', 'tel', 'url'].includes(props.type))

const hasValue = computed(() => {
  if (isFileInput.value) {
    return props.multiple ? Array.isArray(props.modelValue) && props.modelValue.length > 0 : !!props.modelValue
  }
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
})

const showTrailingGroup = computed(
  () =>
    (isPassword.value && props.showPasswordToggle) ||
    (isNumberInput.value && props.spinners) ||
    (props.clearable && hasValue.value && !props.disabled)
)

function onInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

// Il wrapper espone il proprio onFocus/onBlur (aggiorna isFocused per lo
// stile del box): li richiamiamo e in più emettiamo l'evento pubblico
// del componente, così l'API verso l'esterno resta identica a prima.
function handleFocus(chromeFocus, event) {
  chromeFocus()
  emit('focus', event)
}

function handleBlur(chromeBlur, event) {
  touched.value = true
  runValidation()
  chromeBlur()
  emit('blur', event)
}

function onClear() {
  if (isFileInput.value) {
    fileNames.value = []
    if (inputRef.value) inputRef.value.value = ''
    emit('update:modelValue', props.multiple ? [] : null)
  } else {
    emit('update:modelValue', '')
  }
  emit('clear')
  inputRef.value?.focus?.()
}

// ===== type="number": spinner custom =====

function stepValue(direction) {
  if (props.disabled || props.loading) return
  const stepAmount = Number(props.step) || 1
  const current =
    props.modelValue === '' || props.modelValue === null || props.modelValue === undefined
      ? 0
      : Number(props.modelValue)
  let next = current + direction * stepAmount

  if (props.min !== null && props.min !== '' && !Number.isNaN(Number(props.min))) {
    next = Math.max(next, Number(props.min))
  }
  if (props.max !== null && props.max !== '' && !Number.isNaN(Number(props.max))) {
    next = Math.min(next, Number(props.max))
  }
  // Corregge i tipici errori di floating point (es. 0.1 + 0.2)
  next = Math.round(next * 1e10) / 1e10

  emit('update:modelValue', next)
  emit('input', next)
}

// ===== type="password": mostra/nascondi =====

const passwordVisible = ref(false)
const effectiveType = computed(() => (isPassword.value && passwordVisible.value ? 'text' : props.type))

// ===== type="email"/"tel"/"url": validazione automatica al blur =====

const touched = ref(false)
const internalInvalid = ref(false)

function runValidation() {
  if (!props.autoValidate || !isValidatableType.value) {
    internalInvalid.value = false
    return
  }
  const value = String(props.modelValue ?? '').trim()
  if (!value) {
    // Campo vuoto: nessun errore automatico (per il "richiesto" usare la prop `error` esterna)
    internalInvalid.value = false
    return
  }
  internalInvalid.value = !VALIDATION_PATTERNS[props.type].test(value)
}

// Rivalida mentre si digita, ma solo dopo il primo blur (`touched`), per
// non mostrare l'errore mentre l'utente sta ancora scrivendo la prima volta.
watch(
  () => props.modelValue,
  () => {
    if (touched.value) runValidation()
  }
)
watch(() => props.type, runValidation)

const computedError = computed(() => props.error || internalInvalid.value)
const computedErrorMessage = computed(() => {
  if (props.error) return props.errorMessage
  if (internalInvalid.value) return props.invalidMessage || props.errorMessage || ''
  return props.errorMessage
})

// ===== type="file": nome file + emissione valore =====

const fileNames = ref([])

function onFileChange(event) {
  const files = Array.from(event.target.files || [])
  fileNames.value = files.map((f) => f.name)
  const value = props.multiple ? files : files[0] || null
  emit('update:modelValue', value)
  emit('input', event)
  emit('change', event)
}
</script>

<style lang="scss" scoped>
.vx-input__field {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: var(--input-placeholder, currentColor);
    opacity: 0.5;
  }

  &:disabled {
    cursor: not-allowed;
  }

  // Nasconde gli spinner nativi del browser per type="number": vengono
  // sempre sostituiti da quelli custom (o rimossi del tutto se `spinners`
  // è false), non sono restylizzabili in modo coerente col design system.
  &[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

textarea.vx-input__field,
.vx-input__field--textarea {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 80px;
  height: auto;
  flex: 1 1 auto;
  resize: vertical;
  line-height: 1.5;
  padding: 0;
  margin: 0;
}

.vx-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}

.vx-input__trailing-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vx-input__toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}

.vx-input__spinner {
  display: flex;
  flex-direction: column;
  line-height: 0;
}

.vx-input__spinner-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 11px;
  border: none;
  border-radius: 3px;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 10%, transparent);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }
}

.vx-input__file {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.vx-input__file-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  &:focus-visible + .vx-input__file-browse {
    outline: 2px solid var(--vx-input-accent, #7c3aed);
    outline-offset: 2px;
  }
}

.vx-input__file-browse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  background: color-mix(in srgb, var(--vx-input-accent, #7c3aed) 12%, transparent);
  color: var(--vx-input-accent, #7c3aed);
  transition: background 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--vx-input-accent, #7c3aed) 20%, transparent);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
}

.vx-input__file-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  opacity: 0.75;

  &--placeholder {
    opacity: 0.5;
  }
}
</style>