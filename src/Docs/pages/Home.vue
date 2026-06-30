<template>
  <div class="intro">
    <div class="hero">
      <div class="badge">
        <span class="dot"></span>
        v{{ version }} — {{ $t('home.development') }}
      </div>

      <div class="logo-wrap">
        <h1 class="logo-text">{{ libraryName }}</h1>
      </div>

      <p class="tagline">
        {{ $t('home.taglinePartOne') }} <strong>Vue 3</strong>, {{ $t('home.taglinePartTwo') }}
      </p>

      <div class="cta">
        <DesignButton :text="$t('buttons.startNow')" :icon-left="Plus" variant="primary" @click="doSomething" />
        <DesignButton :text="$t('buttons.documentation')" :icon-left="Plus" variant="primary" @click="doSomething" />
      </div>
    </div>

    <div class="features">
      <DesignCard
        icon="bolt"
        color="primary"
        :title="$t('home.features.fast')"
        :description="$t('home.features.fastDescription')"
      />
      <DesignCard
        icon="extension"
        color="secondary"
        :title="$t('home.features.composable')"
        :description="$t('home.features.composableDescription')"
      />
      <DesignCard
        icon="palette"
        color="primary"
        :title="$t('home.features.customizable')"
        :description="$t('home.features.customizableDescription')"
      />
      <DesignCard
        icon="code"
        color="secondary"
        :title="$t('home.features.typescript')"
        :description="$t('home.features.typescriptDescription')"
      />
    </div>

    <div class="footer">
      <p>Creato con <span class="heart">♥</span> da <strong>Giorgio Pagani</strong></p>
    </div>
  </div>
</template>

<script setup>
import DesignCard from '@/Docs/components/Cards/DesignCard.vue'
import DesignButton from '@/Docs/components/Buttons/DesignButton.vue'

const version = __APP_VERSION__ || '0.1.0'
const libraryName = __APP_NAME__ || 'Vexus'
</script>

<style lang="scss" scoped>
.intro {
  min-height: 100vh;
  padding: 80px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero {
  text-align: center;
  max-width: 640px;
  margin-bottom: 80px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba($primary, 0.3);
  background: rgba($primary, 0.08);
  margin-bottom: 28px;
  color: rgba(255, 255, 255, 0.8);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $secondary;
  box-shadow: 0 0 8px $secondary;
}

.tagline {
  font-size: 17px;
  line-height: 1.6;
  opacity: 0.7;
  margin-bottom: 36px;

  strong {
    color: white;
    opacity: 1;
  }
}

.cta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  border-radius: 12px;
  padding: 10px 28px;
  box-shadow: 0 8px 24px rgba($primary, 0.35);
}

.btn-secondary {
  border-radius: 12px;
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 960px;
  width: 100%;
  margin-bottom: 60px;
}

.footer {
  margin-top: auto;
  font-size: 13px;
  opacity: 0.5;
}

.heart {
  color: $primary;
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
}

.logo-text {
  background: linear-gradient(135deg, $primary, $secondary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}
</style>