<template>
  <div class="lang-switcher" v-click-away="closeDropdown">
    <button class="lang-trigger" @click="isOpen = !isOpen">
      <span class="flag">{{ currentLang.flag }}</span>
      <span class="code">{{ currentLang.code.toUpperCase() }}</span>
      <ChevronDown :size="14" class="chevron" :class="{ 'chevron--open': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="lang-dropdown">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="lang-option"
          :class="{ 'lang-option--active': lang.code === currentLang.code }"
          @click="selectLang(lang)"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span class="name">{{ lang.name }}</span>
          <Check v-if="lang.code === currentLang.code" :size="16" class="check" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, Check } from 'lucide-vue-next'

const { locale } = useI18n()

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

const isOpen = ref(false)

const currentLang = computed(() =>
  languages.find(l => l.code === locale.value) || languages[0]
)

const selectLang = (lang) => {
  locale.value = lang.code
  localStorage.setItem('lang', lang.code)
  isOpen.value = false
}

const closeDropdown = () => {
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.lang-switcher {
  position: relative;
}

.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba($primary, 0.15);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: rgba($primary, 0.4);
    background: rgba(255, 255, 255, 0.05);
  }
}

.flag {
  font-size: 16px;
  line-height: 1;
}

.code {
  letter-spacing: 0.5px;
}

.chevron {
  opacity: 0.6;
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: rgba($tertiary, 0.97);
  border: 1px solid rgba($primary, 0.2);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  z-index: 300;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lang-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &--active {
    color: $primary;
    background: rgba($primary, 0.1);
  }
}

.name {
  flex: 1;
  text-align: left;
}

.check {
  color: $primary;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>