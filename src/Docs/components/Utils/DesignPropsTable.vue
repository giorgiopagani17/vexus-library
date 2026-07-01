<template>
  <div class="props-table" :class="{ 'props-table--compact': columns.length <= 2 }">
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
</script>

<style lang="scss" scoped>
.props-table {
  border-radius: 14px;
  border: 1px solid rgba($primary, 0.15);
  overflow: hidden;
}

.props-row {
  display: grid;
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
  }
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

@media (max-width: 640px) {
  .props-row {
    grid-template-columns: 1fr !important;
    gap: 4px;
  }
}
</style>