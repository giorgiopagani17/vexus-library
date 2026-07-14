<template>
  <div class="props-table" :class="{ 'props-table--compact': columns.length <= 2 }">
    <div class="props-table__scroll">
      <div class="props-table__inner" :style="innerStyle">
        <div class="props-row props-row--header" :style="gridStyle">
          <span v-for="col in columns" :key="col.key">{{ col.label }}</span>
        </div>

        <div
          v-for="row in rows"
          :key="row[rowKey]"
          class="props-row"
          :style="gridStyle"
        >
          <span
            v-for="col in columns"
            :key="col.key"
            :class="col.class"
          >
            {{ row[col.key] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    // es: [{ key: 'name', label: 'Prop', class: 'prop-name' }, ...]
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  },
  rowKey: {
    type: String,
    default: 'name'
  },
  widths: {
    // opzionale: larghezze custom per colonna, es: ['130px', '200px', '90px', '1fr']
    type: Array,
    default: null
  }
})

const gridStyle = computed(() => {
  if (props.widths) {
    return { gridTemplateColumns: props.widths.join(' ') }
  }
  return { gridTemplateColumns: `repeat(${props.columns.length}, 1fr)` }
})

// Larghezza minima del contenuto: somma delle colonne a larghezza fissa +
// un minimo ragionevole per le colonne 'Nfr' (una singola unità 1fr conta
// come 220px minimi, così testi lunghi in descrizione non vengono
// schiacciati). Sotto questa soglia il wrapper scrolla in orizzontale
// invece di impilare le colonne.
const innerStyle = computed(() => {
  if (!props.widths) return { minWidth: '100%' }

  const total = props.widths.reduce((sum, w) => {
    if (typeof w === 'string' && w.trim().endsWith('fr')) {
      const units = parseFloat(w) || 1
      return sum + units * 220
    }
    const px = parseFloat(w)
    return sum + (Number.isFinite(px) ? px : 140)
  }, 0)

  // + gap/padding orizzontali della riga (12px di gap tra colonne + 32px di
  // padding laterale complessivo), per non tagliare l'ultima colonna.
  const gaps = (props.widths.length - 1) * 12 + 32

  return { minWidth: `${total + gaps}px` }
})
</script>

<style lang="scss" scoped>
.props-table {
  border-radius: 14px;
  border: 1px solid rgba($primary, 0.15);
  overflow: hidden;
}

.props-table__scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  // Scrollbar sottile e discreta invece di quella default del browser,
  // ma solo dove supportata: altrove resta quella nativa.
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($primary, 0.25);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.props-table__inner {
  // Stretch: il contenuto riempie sempre tutta la larghezza disponibile
  // (mai più stretto del contenitore), e scrolla solo quando il contenuto
  // naturale (vedi innerStyle) supera quella larghezza.
  width: 100%;
}

.props-row {
  display: grid;
  align-items: stretch;
  gap: 12px;
  padding: 12px 16px;
  font-size: 13px;
  border-bottom: 1px solid rgba($primary, 0.08);

  &:last-child {
    border-bottom: none;
  }

  &--header {
    background: rgba($primary, 0.08);
    font-weight: 700;
    color: $primary;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    // Resta visibile mentre si scrolla orizzontalmente insieme al resto
    // (niente sticky verticale qui, solo coerenza visiva con le righe).
  }
}

.props-row > span {
  // Ogni cella si estende per tutta l'altezza della riga (utile quando una
  // colonna ha testo su più righe e le altre no: niente celle "corte" che
  // sembrano disallineate rispetto al bordo inferiore della riga).
  align-self: stretch;
  display: flex;
  align-items: center;
}

:deep(.prop-name) {
  font-family: 'Courier New', monospace;
  color: $secondary;
  font-weight: 600;
}

:deep(.prop-type) {
  font-family: 'Courier New', monospace;
  opacity: 0.6;
  font-size: 12px;
}

:deep(.prop-default) {
  opacity: 0.5;
  font-family: 'Courier New', monospace;
}

:deep(.prop-desc) {
  opacity: 0.75;
  line-height: 1.5;
}
</style>