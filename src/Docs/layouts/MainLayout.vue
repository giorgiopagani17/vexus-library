<template>
  <div class="layout">
    <header class="app-header">
      <button class="icon-btn icon-btn--mobile-only" @click="toggleDrawer">
        <Menu :size="20" />
      </button>

      <h1 class="title">{{ libraryName }}</h1>

      <div class="header-actions">
        <DesignLanguageSwitcher />
      </div>
    </header>

    <aside
      class="sidebar"
      :class="{ 'sidebar--mini': miniState, 'sidebar--hidden': !drawerOpen }"
    >
      <div class="logo-wrap">
        <span class="logo-bracket">&lt;</span>
        <span class="logo-text">{{ miniState ? libraryNameShort : libraryName }}</span>
        <span class="logo-bracket">/&gt;</span>
      </div>

      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="menu-item"
          active-class="menu-item--active"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="!miniState" class="menu-label">{{ item.label }}</span>
          <span v-if="miniState" class="tooltip">{{ item.label }}</span>
        </RouterLink>
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
import { ref, computed } from 'vue'
import DesignLanguageSwitcher from '@/Docs/components/Utils/DesignLanguageSwitcher.vue'
import { useRoute } from 'vue-router'
import {
  Menu,
  Bell,
  Home,
  Puzzle,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const drawerOpen = ref(true)
const miniState = ref(false)
const libraryName = __APP_NAME__ || 'Vexus'
const libraryNameShort = __APP_NAME_SHORT__ || 'V'

const menuItems = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Componenti', icon: Puzzle, to: '/components' },
  { label: 'Documentazione', icon: BookOpen, to: '/docs' },
  { label: 'Impostazioni', icon: Settings, to: '/settings' },
  { label: 'Notify', icon: Bell, to: '/notify' }
]

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
  transition: width 0.25s ease, transform 0.25s ease;
  z-index: 90;

  &--mini {
    width: 68px;
  }

  &--hidden {
    transform: translateX(-100%);
  }
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 24px 0;
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
}

.logo-text {
  background: linear-gradient(135deg, $primary, $secondary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-bracket {
  opacity: 0.4;
  font-weight: 400;
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
}

.menu-label {
  font-size: 14px;
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

  .tooltip {
    display: none;
  }
}
</style>