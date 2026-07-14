<template>
  <VxFieldWrapper v-bind="wrapperProps" :style="{ '--vx-select-accent': color }">
    <template v-if="$slots['icon-left']" #icon-left>
      <slot name="icon-left" />
    </template>

    <template #default="{ fieldId, disabled: fieldDisabled, onFocus: chromeFocus, onBlur: chromeBlur }">
      <div
        ref="triggerRef"
        class="vx-select__trigger"
        tabindex="0"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-disabled="fieldDisabled || loading"
        @click="toggleOpen(fieldDisabled)"
        @keydown="onTriggerKeydown($event, fieldDisabled)"
        @focus="handleFocus(chromeFocus, $event)"
        @blur="handleBlur(chromeBlur, $event)"
      >
        <div v-if="multiple && useChips && selectedOptions.length" class="vx-select__chips">
          <span v-for="opt in selectedOptions" :key="chipKey(opt)" class="vx-select__chip">
            {{ resolveLabel(opt) }}
            <button
              type="button"
              class="vx-select__chip-remove"
              tabindex="-1"
              aria-label="Rimuovi"
              @mousedown.prevent
              @click.stop="removeChip(opt)"
            >
              <X :size="12" />
            </button>
          </span>
        </div>

        <input
          v-if="searchable"
          :id="fieldId"
          ref="searchInputRef"
          class="vx-select__search"
          type="text"
          autocomplete="off"
          :value="isOpen ? searchText : displayText"
          :placeholder="placeholder"
          :disabled="fieldDisabled || loading"
          @input="onSearchInput"
          @click.stop="openPanel(fieldDisabled)"
        />
        <span v-else class="vx-select__value" :class="{ 'vx-select__value--placeholder': !displayText }">
          {{ displayText || placeholder }}
        </span>
      </div>
    </template>

    <template #trailing="{ resolvedIconSize }">
      <div class="vx-select__trailing-group">
        <span v-if="loading || isLoading" class="vx-select__spinner">
          <Loader2 :size="resolvedIconSize" class="spin" />
        </span>
        <button
          v-else-if="clearable && hasValue && !disabled"
          type="button"
          class="vx-select__clear"
          tabindex="-1"
          aria-label="Cancella"
          @mousedown.prevent
          @click.stop="onClear"
        >
          <X :size="resolvedIconSize" />
        </button>
        <ChevronDown
          :size="resolvedIconSize"
          class="vx-select__chevron"
          :class="{ 'vx-select__chevron--open': isOpen }"
        />
      </div>
    </template>

    <template v-if="$slots['icon-right']" #icon-right>
      <slot name="icon-right" />
    </template>
  </VxFieldWrapper>

  <Teleport to="body">
    <div v-if="isOpen" ref="panelRef" class="vx-select__panel" :style="panelStyle">
      <ul class="vx-select__list" role="listbox">
        <li
          v-for="(opt, idx) in displayedOptions"
          :key="optionKey(opt, idx)"
          class="vx-select__option"
          :class="{
            'vx-select__option--highlighted': idx === highlightedIndex,
            'vx-select__option--selected': isSelected(opt),
          }"
          role="option"
          :aria-selected="isSelected(opt)"
          @mousedown.prevent
          @click="selectOption(opt)"
          @mouseenter="highlightedIndex = idx"
        >
          <slot name="option" :option="opt" :selected="isSelected(opt)">
            {{ resolveLabel(opt) }}
          </slot>
        </li>

        <li v-if="!isLoading && displayedOptions.length === 0" class="vx-select__empty">
          {{ noOptionsLabel }}
        </li>

        <li v-if="url" ref="sentinelRef" class="vx-select__sentinel" aria-hidden="true"></li>

        <li v-if="isLoadingMore" class="vx-select__loading-more">
          <Loader2 :size="16" class="spin" />
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, Loader2, X } from 'lucide-vue-next'
import VxFieldWrapper from '@/Library/core/components/Input/FieldWrapper.vue'
import { useVxApi } from '@/Library/composables/Api/useVxApi'

const props = defineProps({
  /**
   * v-model. Se `multiple` è false: singolo valore (option object, oppure
   * il valore grezzo se `emitValue` è true). Se `multiple` è true: array.
   */
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: null,
  },

  // ===== opzioni locali =====
  options: { type: Array, default: () => [] },
  optionLabel: { type: [String, Function], default: 'label' },
  optionValue: { type: [String, Function], default: 'value' },
  /** Se true, il v-model contiene il valore risolto tramite optionValue invece dell'oggetto intero */
  emitValue: { type: Boolean, default: false },
  transformOption: { type: Function, default: null },

  multiple: { type: Boolean, default: false },
  useChips: { type: Boolean, default: true },
  searchable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  noOptionsLabel: { type: String, default: 'Nessuna opzione disponibile' },

  // ===== chrome, passthrough a VxFieldWrapper =====
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  size: { type: [String, Object], default: 'md' },
  variant: { type: String, default: 'outline' },
  pill: { type: Boolean, default: false },
  radius: { type: [Number, String], default: null },
  color: { type: String, default: null },
  colors: { type: Object, default: null },
  focusEffect: { type: String, default: 'ring' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  iconPosition: { type: String, default: 'left' },
  iconSize: { type: [Number, String], default: null },

  // ===== remote/paginato =====
  /** Se valorizzato, le opzioni vengono caricate da qui invece che da `options` */
  url: { type: String, default: null },
  searchParam: { type: String, default: 'searchTerm' },
  rowsPerPage: { type: Number, default: 10 },
  maxPage: { type: [Number, null], default: null },
  extraParams: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear', 'open', 'close', 'filter'])

const { VxRequest } = useVxApi()

// ===== refs DOM =====
const triggerRef = ref(null)
const searchInputRef = ref(null)
const panelRef = ref(null)
const sentinelRef = ref(null)

// ===== stato pannello =====
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const panelStyle = ref({})

// ===== stato remoto =====
const remoteOptions = ref([])
const currentPage = ref(0)
const totalElements = ref(0)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const searchText = ref('')

let fetchId = 0
let searchTimeout = null
let intersectionObserver = null

// ===== passthrough al wrapper =====
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
  error: props.error,
  errorMessage: props.errorMessage,
  hint: props.hint,
  label: props.label,
  icon: props.icon,
  iconPosition: props.iconPosition,
  iconSize: props.iconSize,
}))

// ===== helpers di risoluzione label/value =====
function resolveLabel(opt) {
  if (opt == null) return ''
  if (typeof props.optionLabel === 'function') return props.optionLabel(opt)
  if (typeof opt === 'object') return String(opt[props.optionLabel] ?? opt.label ?? '')
  return String(opt)
}

function getOptionValue(opt) {
  if (opt == null) return opt
  if (typeof props.optionValue === 'function') return props.optionValue(opt)
  if (typeof opt === 'object') return opt[props.optionValue] ?? opt.value
  return opt
}

function sameValue(a, b) {
  const va = typeof a === 'object' && a !== null ? getOptionValue(a) : a
  const vb = typeof b === 'object' && b !== null ? getOptionValue(b) : b
  return va === vb
}

function optionKey(opt, idx) {
  const v = getOptionValue(opt)
  return v !== undefined && v !== null ? v : idx
}

function chipKey(opt) {
  return String(getOptionValue(opt) ?? resolveLabel(opt))
}

// ===== derivate su modelValue =====
const hasValue = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0
  return props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
})

const selectedOptions = computed(() => {
  if (!props.multiple) return []
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

const displayText = computed(() => {
  if (props.multiple) return ''
  if (!hasValue.value) return ''
  if (!props.emitValue) return resolveLabel(props.modelValue)

  // emitValue: il v-model è un valore grezzo, cerchiamo l'opzione corrispondente per mostrarne la label
  const source = props.url ? remoteOptions.value : props.options
  const match = source.find((o) => getOptionValue(o) === props.modelValue)
  return match ? resolveLabel(match) : String(props.modelValue)
})

function isSelected(opt) {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.some((v) => sameValue(v, opt))
  }
  return sameValue(props.modelValue, opt)
}

// ===== opzioni mostrate =====
const hasMore = computed(() => {
  const loaded = remoteOptions.value.length
  if (loaded === 0) return false
  if (totalElements.value > 0 && loaded >= totalElements.value) return false
  if (props.maxPage !== null && currentPage.value + 1 >= props.maxPage) return false
  return true
})

// Garantisce che il valore già selezionato resti visibile in lista anche
// se non è nella pagina remota attualmente caricata (stessa logica del
// tuo InputSelect Quasar).
function mergePresetValue(opts) {
  if (!hasValue.value) return opts
  const values = props.multiple
    ? selectedOptions.value
    : props.emitValue
      ? [] // valore grezzo: non abbiamo l'oggetto completo da anteporre
      : [props.modelValue]

  const missing = values.filter((v) => {
    if (!v || typeof v !== 'object') return false
    const vKey = getOptionValue(v)
    return !opts.some((o) => getOptionValue(o) === vKey)
  })

  return missing.length ? [...missing, ...opts] : opts
}

const displayedOptions = computed(() => {
  if (props.url) return mergePresetValue(remoteOptions.value)
  if (!props.searchable || !searchText.value.trim()) return props.options
  const term = searchText.value.toLowerCase().trim()
  return props.options.filter((opt) => resolveLabel(opt).toLowerCase().includes(term))
})

// ===== apertura/chiusura pannello =====
function openPanel(disabled) {
  if (disabled || props.loading || isOpen.value) return
  searchText.value = ''
  isOpen.value = true
}

function closePanel() {
  isOpen.value = false
}

function toggleOpen(disabled) {
  if (disabled || props.loading) return
  isOpen.value ? closePanel() : openPanel(disabled)
}

function resetHighlight() {
  highlightedIndex.value = displayedOptions.value.findIndex((o) => isSelected(o))
}

watch(isOpen, async (open) => {
  if (open) {
    emit('open')
    resetHighlight()
    await nextTick()
    computePanelPosition()
    if (props.url && remoteOptions.value.length === 0) {
      fetchOptions(0, false)
    }
    await nextTick()
    setupSentinelObserver()
    window.addEventListener('scroll', onOutsideScroll, true)
    window.addEventListener('resize', computePanelPosition)
    document.addEventListener('mousedown', onDocumentMouseDown, true)
  } else {
    emit('close')
    teardownSentinelObserver()
    window.removeEventListener('scroll', onOutsideScroll, true)
    window.removeEventListener('resize', computePanelPosition)
    document.removeEventListener('mousedown', onDocumentMouseDown, true)
    if (props.url) searchText.value = ''
  }
})

function onDocumentMouseDown(event) {
  if (triggerRef.value?.contains(event.target)) return
  if (panelRef.value?.contains(event.target)) return
  closePanel()
}

function onOutsideScroll(event) {
  if (panelRef.value?.contains(event.target)) return
  computePanelPosition()
}

// ===== posizionamento viewport-aware =====
function computePanelPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const maxPanelHeight = 260
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top
  const openUpward = spaceBelow < maxPanelHeight && spaceAbove > spaceBelow

  panelStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.min(maxPanelHeight, openUpward ? spaceAbove - 12 : spaceBelow - 12)}px`,
    ...(openUpward
      ? { bottom: `${viewportHeight - rect.top + 6}px`, top: 'auto' }
      : { top: `${rect.bottom + 6}px`, bottom: 'auto' }),
  }
}

// ===== infinite scroll remoto (IntersectionObserver al posto del virtual-scroll di Quasar) =====
function setupSentinelObserver() {
  teardownSentinelObserver()
  if (!props.url || !sentinelRef.value || !panelRef.value) return

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) maybeLoadMore()
    },
    { root: panelRef.value, rootMargin: '0px 0px 100px 0px', threshold: 0 }
  )
  intersectionObserver.observe(sentinelRef.value)
}

function teardownSentinelObserver() {
  intersectionObserver?.disconnect()
  intersectionObserver = null
}

function maybeLoadMore() {
  if (!hasMore.value || isLoading.value || isLoadingMore.value) return
  fetchOptions(currentPage.value + 1, true)
}

// ===== ricerca con debounce =====
function onSearchInput(event) {
  const val = event.target.value
  searchText.value = val
  emit('filter', val)
  resetHighlight()

  if (!props.url) return

  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchOptions(0, false)
  }, 400)
}

// ===== fetch remoto, stesso mutex/fetchId del tuo InputSelect =====
async function fetchOptions(page = 0, append = false) {
  if (!props.url) return
  if (page === 0 && isLoading.value) return
  if (page > 0 && isLoadingMore.value) return

  const myId = ++fetchId
  page === 0 ? (isLoading.value = true) : (isLoadingMore.value = true)

  try {
    const query = {
      page,
      size: props.rowsPerPage,
      ...props.extraParams,
    }
    if (searchText.value.trim()) query[props.searchParam] = searchText.value.trim()

    const res = await VxRequest(props.url, { method: 'GET', query })

    // scarta risposte "vecchie" arrivate dopo una ricerca più recente
    if (page === 0 && myId !== fetchId) return

    const raw = res?.data?.content ?? res?.data ?? []

    if (res?.data?.totalElements != null) {
      totalElements.value = res.data.totalElements
    } else if (raw.length < props.rowsPerPage) {
      totalElements.value = (append ? remoteOptions.value.length : 0) + raw.length
    } else {
      totalElements.value = 0
    }

    currentPage.value = page
    const mapped = raw.map((item) => (props.transformOption ? props.transformOption(item) : item))
    remoteOptions.value = append ? [...remoteOptions.value, ...mapped] : mapped

    await nextTick()
    setupSentinelObserver()
  } catch (e) {
    console.error('[VxSelect] Errore nel caricamento delle opzioni remote:', e)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// resetta la cache remota se cambia url/extraParams (stesso watch del componente Quasar)
watch(
  () => JSON.stringify({ url: props.url, extraParams: props.extraParams }),
  () => {
    remoteOptions.value = []
    totalElements.value = 0
    currentPage.value = 0
    if (isOpen.value) fetchOptions(0, false)
  }
)

// ===== selezione =====
function selectOption(opt) {
  const value = props.emitValue ? getOptionValue(opt) : opt

  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.findIndex((v) => sameValue(v, opt))
    if (idx > -1) current.splice(idx, 1)
    else current.push(value)
    emit('update:modelValue', current)
    searchText.value = ''
  } else {
    emit('update:modelValue', value)
    closePanel()
  }
}

function removeChip(opt) {
  const current = Array.isArray(props.modelValue) ? props.modelValue.filter((v) => !sameValue(v, opt)) : []
  emit('update:modelValue', current)
}

function onClear() {
  emit('update:modelValue', props.multiple ? [] : null)
  searchText.value = ''
  emit('clear')
  if (props.url) fetchOptions(0, false)
}

// ===== focus/blur/tastiera =====
function handleFocus(chromeFocus, event) {
  chromeFocus()
  emit('focus', event)
}

function handleBlur(chromeBlur, event) {
  chromeBlur()
  emit('blur', event)
}

function onTriggerKeydown(event, disabled) {
  if (disabled || props.loading) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) return openPanel(disabled)
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, displayedOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) return openPanel(disabled)
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value > -1) {
        selectOption(displayedOptions.value[highlightedIndex.value])
      } else {
        openPanel(disabled)
      }
      break
    case 'Escape':
      closePanel()
      break
    default:
      break
  }
}

onBeforeUnmount(() => {
  teardownSentinelObserver()
  window.removeEventListener('scroll', onOutsideScroll, true)
  window.removeEventListener('resize', computePanelPosition)
  document.removeEventListener('mousedown', onDocumentMouseDown, true)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<style lang="scss" scoped>
.vx-select__trigger {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  min-width: 0;
  cursor: pointer;
  outline: none;
}

.vx-select__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.vx-select__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: color-mix(in srgb, var(--vx-select-accent, $primary) 15%, transparent);
  color: var(--vx-select-accent, $primary);
  white-space: nowrap;
}

.vx-select__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
}

.vx-select__search {
  flex: 1 1 auto;
  min-width: 40px;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &::placeholder {
    color: var(--input-placeholder, currentColor);
    opacity: 0.5;
  }
}

.vx-select__value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--placeholder {
    opacity: 0.5;
  }
}

.vx-select__trailing-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vx-select__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
}

.vx-select__chevron {
  opacity: 0.6;
  transition: transform 0.15s ease;
  flex-shrink: 0;

  &--open {
    transform: rotate(180deg);
  }
}

.vx-select__panel {
  z-index: 2000;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: var(--vx-select-panel-bg, #1a1a1f);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
}

.vx-select__list {
  list-style: none;
  margin: 0;
  padding: 6px;
}

.vx-select__option {
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--highlighted {
    background: color-mix(in srgb, var(--vx-select-accent, $primary) 14%, transparent);
  }

  &--selected {
    color: var(--vx-select-accent, $primary);
    font-weight: 600;
  }
}

.vx-select__empty,
.vx-select__loading-more {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  opacity: 0.6;
}

.vx-select__loading-more {
  display: flex;
  justify-content: center;
}

.vx-select__sentinel {
  height: 1px;
}

.spin {
  animation: vx-select-spin 0.8s linear infinite;
}

@keyframes vx-select-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>