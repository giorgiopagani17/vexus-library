<template>
  <div class="code-block">
    <button class="copy-btn" @click="copy">
      <Check v-if="copied" :size="14" />
      <Copy v-else :size="14" />
    </button>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

defineProps({
  code: {
    type: String,
    required: true
  }
})

const copied = ref(false)

const copy = async (event) => {
  const code = event.currentTarget.parentElement.querySelector('code').textContent
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<style lang="scss" scoped>
.code-block {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba($primary, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

pre {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba($primary, 0.15);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba($primary, 0.35);
    color: $primary;
  }
}
</style>