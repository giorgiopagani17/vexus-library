<template>
  <div class="layout">
    <header class="app-header">
      <button class="icon-btn icon-btn--mobile-only" @click="toggleDrawer">
        <Menu :size="20" />
      </button>

      <div class="image-wrapper">
        <img :src="VexusLogo" class="logo-image" alt="Vexus Logo" />
      </div>

      <div class="header-actions">
        <DesignLanguageSwitcher />
      </div>
    </header>

    <aside
      class="sidebar"
      :class="{ 'sidebar--mini': miniState, 'sidebar--hidden': !drawerOpen }"
    >
      <nav class="menu">
        <template v-for="item in menuStructure" :key="item.label">
          <!-- Voce semplice, senza sottomenu -->
          <RouterLink
            v-if="!item.children"
            :to="item.to"
            class="menu-item"
            active-class="menu-item--active"
          >
            <component :is="item.icon" :size="20" />
            <span v-if="!miniState" class="menu-label">{{ item.label }}</span>
            <span v-if="miniState" class="tooltip">{{ item.label }}</span>
          </RouterLink>

          <!-- Voce con sottomenu -->
          <div
            v-else
            class="menu-group"
            :class="{ 'menu-group--open': isGroupOpen(item.label) }"
          >
            <button
              class="menu-item menu-item--group"
              :class="{ 'menu-item--active': isChildActive(item) }"
              @click="toggleGroup(item.label)"
            >
              <component :is="item.icon" :size="20" />
              <span v-if="!miniState" class="menu-label">{{ item.label }}</span>
              <ChevronDown
                v-if="!miniState"
                :size="16"
                class="group-chevron"
              />
              <!-- Niente tooltip qui in mini: ci pensa il flyout -->
            </button>

            <!-- Sottomenu ad accordion (sidebar espansa) -->
            <div v-if="!miniState && isGroupOpen(item.label)" class="submenu-wrapper">
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="submenu-item"
                active-class="submenu-item--active"
              >
                <component :is="child.icon" :size="16" />
                <span class="menu-label">{{ child.label }}</span>
              </RouterLink>
            </div>

            <!-- Sottomenu a flyout (sidebar mini) -->
            <div v-else class="submenu-flyout">
              <div class="submenu-flyout__title">{{ item.label }}</div>
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                :to="child.to"
                class="submenu-item"
                active-class="submenu-item--active"
              >
                <component :is="child.icon" :size="16" />
                <span class="menu-label">{{ child.label }}</span>
              </RouterLink>
            </div>
          </div>
        </template>
      </nav>

      <button class="collapse-btn" @click="miniState = !miniState">
        <component :is="miniState ? ChevronRight : ChevronLeft" :size="18" />
      </button>
    </aside>

    <main class="content" :class="{ 'content--mini': miniState }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DesignLanguageSwitcher from '@/Docs/components/Utils/DesignLanguageSwitcher.vue'
import { useRoute } from 'vue-router'
import VexusLogo from '/vexus_logo.png'
import { useClickOutside } from '@/Library/core/composables/useClickOutside'
import {
  Menu,
  MousePointerClick,
  TextCursorInput,
  Bell,
  Phone,
  Home,
  Blocks,
  Puzzle,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  IdCard,
} from 'lucide-vue-next'

const route = useRoute()
const drawerOpen = ref(true)
const miniState = ref(false)

const menuStructure = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Componenti', icon: Puzzle, to: '/components' },
  { label: 'Documentazione', icon: BookOpen, to: '/docs' },
  { label: 'Impostazioni', icon: Settings, to: '/settings' },
  {
    label: 'Componenti UI',
    icon: Blocks,
    children: [
      { label: 'VxButton', icon: MousePointerClick, to: '/button' },
      { label: 'VxInput', icon: TextCursorInput, to: '/input' },
    ],
  },
  {
    label: 'Composables',
    icon: Puzzle,
    children: [
      { label: 'VxNotify', icon: Bell, to: '/notify' },
      { label: 'VxApi', icon: Phone, to: '/use-api' },
      { label: 'VxFiscalCode', icon: IdCard, to: '/use-fiscal-code' },
    ],
  },
]

const openGroups = ref(new Set())

function isGroupOpen(label) {
  return openGroups.value.has(label)
}

function toggleGroup(label) {
  const next = new Set(openGroups.value)
  if (next.has(label)) {
    next.delete(label)
  } else {
    next.add(label)
  }
  openGroups.value = next
}

function isChildActive(item) {
  return item.children?.some((child) => child.to === route.path) ?? false
}

menuStructure.forEach((item) => {
  if (item.children && isChildActive(item)) {
    openGroups.value.add(item.label)
  }
})

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}
</script>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  background: rgba($tertiary, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba($primary, 0.15);
  z-index: 100;
}

.title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &--mobile-only {
    display: none;
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: rgba($tertiary, 0.95);
  border-right: 1px solid rgba($primary, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.25s ease, transform 0.25s ease;
  z-index: 90;

  &--mini {
    width: 68px;
    overflow: visible;
  }

  &--hidden {
    transform: translateX(-100%);
  }
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 34px;
  height: 34px;
  object-fit: cover;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  white-space: nowrap;
  overflow: visible;
  border: none;
  background: transparent;
  width: 100%;
  box-sizing: border-box; // <-- fix overflow-x: senza questo i <a> sforavano di 28px (padding in content-box)
  font: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);

    .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translate(4px, -50%);
    }
  }

  &--active {
    background: rgba($primary, 0.12);
    color: $primary;

    svg {
      color: $primary;
    }
  }

  &--group {
    justify-content: flex-start;
  }
}

.menu-label {
  font-size: 14px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-chevron {
  transition: transform 0.2s ease;
  flex: 0 0 auto;
}

.menu-group--open .group-chevron {
  transform: rotate(180deg);
}

.submenu-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 4px 18px;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s ease;
}

.menu-group--open .submenu-wrapper {
  max-height: 400px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  box-sizing: border-box;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &--active {
    background: rgba($primary, 0.1);
    color: $primary;

    svg {
      color: $primary;
    }
  }
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translate(0, -50%);
  margin-left: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba($tertiary, 0.95);
  border: 1px solid rgba($primary, 0.25);
  font-size: 13px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 110;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.submenu-flyout {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 8px;
  min-width: 180px;
  padding: 8px;
  border-radius: 10px;
  background: rgba($tertiary, 0.97);
  border: 1px solid rgba($primary, 0.25);
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(4px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 110;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  &__title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: rgba(255, 255, 255, 0.5);
    padding: 4px 10px 8px;
  }

  .submenu-item {
    border-left: none;
    padding: 8px 10px;
  }
}

.menu-group {
  position: relative;
}

.collapse-btn {
  margin-top: auto;
  margin-bottom: 16px;
  align-self: flex-end;
  margin-right: 16px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: rgba($primary, 0.1);
  color: $primary;
  cursor: pointer;

  &:hover {
    background: rgba($primary, 0.18);
  }
}

.content {
  margin-left: 240px;
  margin-top: 64px;
  padding: 24px;
  transition: margin-left 0.25s ease;

  &--mini {
    margin-left: 68px;
  }
}

// Mobile breakpoint
@media (max-width: 768px) {
  .icon-btn--mobile-only {
    display: inline-flex;
  }

  .sidebar {
    transform: translateX(-100%);
    width: 240px !important;

    &:not(.sidebar--hidden) {
      transform: translateX(0);
    }

    &--mini {
      width: 240px;
    }
  }

  .content,
  .content--mini {
    margin-left: 0;
  }

  .tooltip,
  .submenu-flyout {
    display: none;
  }
}
</style>