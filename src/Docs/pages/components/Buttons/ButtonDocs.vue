<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>Button</h1>
      <p class="subtitle">
        Componente bottone flessibile con varianti, colori, icone, loading state,
        layout full-width e supporto slot avanzati.
      </p>
    </div>

    <!-- Setup -->
    <section class="docs-section">
      <h2>Setup</h2>
      <p>Importa il Button nel <code>File.vue</code>:</p>
      <DesignCodeBlock :code="setupCode" />
    </section>

    <!-- Variant -->
    <section class="docs-section">
      <h2>Variant</h2>
      <p>Definisce il comportamento visivo del bottone: <code>solid</code>, <code>outline</code>, <code>ghost</code> o <code>text</code>.</p>

      <div class="example-row">
        <Button @click="onClick">Solid (default)</Button>
        <Button @click="onClick" variant="outline">Outline</Button>
        <Button @click="onClick" variant="ghost">Ghost</Button>
        <Button @click="onClick" variant="text">Text</Button>
      </div>

      <DesignCodeBlock :code="variantCode" />
    </section>

    <!-- Color -->
    <section class="docs-section">
      <h2>Color</h2>
      <p>Definisce la palette del bottone tra le sei varianti predefinite.</p>

      <div class="example-row">
        <Button @click="onClick" color="primary">Primary</Button>
        <Button @click="onClick" color="secondary">Secondary</Button>
        <Button @click="onClick" color="positive">Positive</Button>
        <Button @click="onClick" color="negative">Negative</Button>
        <Button @click="onClick" color="warning">Warning</Button>
        <Button @click="onClick" color="info">Info</Button>
      </div>

      <DesignCodeBlock :code="colorCode" />

      <p class="section-note">
        Oltre ai token predefiniti, <code>color</code> accetta anche un valore CSS
        custom qualsiasi: hex, <code>rgb()</code> o una CSS custom property.
      </p>

      <div class="example-row">
        <Button @click="onClick" color="#7c3aed">Hex</Button>
        <Button @click="onClick" color="var(--vx-primary)">Palette via var</Button>
      </div>

      <DesignCodeBlock :code="colorCustomCode" />
    </section>

    <!-- Size -->
    <section class="docs-section">
      <h2>Size</h2>
      <p>Tre dimensioni disponibili: <code>sm</code>, <code>md</code> (default) e <code>lg</code>.</p>

      <div class="example-row">
        <Button @click="onClick" size="sm">Small</Button>
        <Button @click="onClick" size="md">Medium</Button>
        <Button @click="onClick" size="lg">Large</Button>
      </div>

      <DesignCodeBlock :code="sizeCode" />
    </section>

    <!-- Icone -->
    <section class="docs-section">
      <h2>Icone</h2>
      <p>Supporta icone via prop <code>icon</code> o tramite gli slot <code>icon-left</code> / <code>icon-right</code> per un controllo più fine.</p>

      <div class="example-row">
        <Button @click="onClick" :icon="Sparkles" iconPosition="left">Left icon</Button>
        <Button @click="onClick" :icon="Sparkles" iconPosition="right">Right icon</Button>
      </div>

      <div class="example-row">
        <Button @click="onClick">
          <template #icon-left>
            <Sparkles />
          </template>
          Slot left
        </Button>

        <Button @click="onClick">
          Slot right
          <template #icon-right>
            <Sparkles />
          </template>
        </Button>
      </div>

      <DesignCodeBlock :code="iconCode" />
    </section>

    <!-- Loading -->
    <section class="docs-section">
      <h2>Stato di caricamento</h2>
      <p>Imposta <code>loading: true</code> per disabilitare il bottone e mostrare uno spinner interno al posto del contenuto.</p>

      <div class="example-row">
        <Button @click="onClick" loading>Loading</Button>
        <Button @click="onClick" :loading="true">Async action</Button>
      </div>

      <DesignCodeBlock :code="loadingCode" />
    </section>

    <!-- Disabled -->
    <section class="docs-section">
      <h2>Disabled</h2>
      <p>Imposta <code>disabled: true</code> per bloccare l'interazione e ridurre l'opacità del bottone.</p>

      <div class="example-row">
        <Button @click="onClick" disabled>Disabled</Button>
      </div>

      <DesignCodeBlock :code="disabledCode" />
    </section>

    <!-- Block -->
    <section class="docs-section">
      <h2>Block</h2>
      <p>Il bottone occupa tutta la larghezza disponibile del contenitore con <code>block</code>.</p>

      <div class="example-row" style="flex-direction: column;">
        <Button @click="onClick" block>Full width</Button>
      </div>

      <DesignCodeBlock :code="blockCode" />
    </section>

    <!-- Radius -->
    <section class="docs-section">
      <h2>Radius</h2>
      <p>Controlla il border radius del bottone tramite <code>radius</code> (numero in px o stringa) oppure la prop <code>pill</code> per bordi completamente arrotondati.</p>

      <div class="example-row">
        <Button @click="onClick">Default</Button>
        <Button @click="onClick" :radius="20">Custom</Button>
        <Button @click="onClick" pill>Pill</Button>
      </div>

      <DesignCodeBlock :code="radiusCode" />
    </section>

    <!-- Hover effect -->
    <section class="docs-section">
      <h2>Hover effect</h2>
      <p>
        Controlla il comportamento visivo al passaggio del mouse tramite <code>hoverEffect</code>.
        Usa <code>custom</code> per disattivare ogni effetto integrato e gestirlo tu via CSS scoped
        nel parent (<code>:deep(.vx-btn--hover-custom:hover)</code>) o tramite la prop <code>colors</code>.
      </p>

      <div class="example-grid">
        <Button @click="onClick" hoverEffect="brightness">Brightness</Button>
        <Button @click="onClick" hoverEffect="scale">Scale</Button>
        <Button @click="onClick" hoverEffect="lift">Lift</Button>
        <Button @click="onClick" hoverEffect="glow">Glow</Button>
        <Button @click="onClick" variant="text" hoverEffect="underline">Underline</Button>
        <Button @click="onClick" hoverEffect="none">None</Button>
        <Button
          @click="onClick"
          hoverEffect="custom"
          class="docs-hover-custom"
        >
          Custom
        </Button>
      </div>

      <DesignCodeBlock :code="hoverEffectCode" />
    </section>

    <!-- Icon only -->
    <section class="docs-section">
      <h2>Icon only</h2>
      <p>Se non passi contenuto testuale, il bottone si adatta automaticamente a una forma quadrata centrata sull'icona.</p>

      <div class="example-row">
        <Button @click="onClick" :icon="Sparkles" />
      </div>

      <DesignCodeBlock :code="iconOnlyCode" />
    </section>

    <!-- Custom colors -->
    <section class="docs-section">
      <h2>Colori custom</h2>
      <p>
        Ogni bottone è completamente ricolorabile tramite l'oggetto <code>colors</code>.
        Le chiavi non specificate mantengono il default del <code>color</code> scelto. Ogni
        chiave accetta un colore CSS, una custom property (<code>var(--...)</code>) oppure
        il nome di un token della palette interna.
      </p>

      <div class="example-row">
        <Button
          @click="onClick"
          :colors="{
            background: '#7c3aed',
            text: '#ffffff',
            hoverBackground: '#6d28d9'
          }"
        >
          Custom
        </Button>

        <Button
          @click="onClick"
          :colors="{
            background: 'positive',
            hoverBackground: 'primary'
          }"
        >
          Token override
        </Button>
      </div>

      <DesignCodeBlock :code="colorsOverrideCode" />
    </section>

    <!-- Events -->
    <section class="docs-section">
      <h2>Events</h2>
      <p>Il bottone emette <code>click</code> quando non è disabilitato né in stato di loading.</p>

      <div class="example-row">
        <Button @click="onClick">Click me</Button>
      </div>

      <DesignCodeBlock :code="eventsCode" />
    </section>

    <!-- Props table -->
    <section class="docs-section">
      <h2>Opzioni disponibili</h2>
      <DesignPropsTable
        :columns="propsColumns"
        :rows="propsRows"
        :widths="['140px', '180px', '90px', '1fr']"
      />
    </section>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'
import Button from '@/Library/components/Button/Button.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import { useNotify } from '@/Library/hooks/Notify/useNotify'
import { propsColumns, propsRows } from '@/Docs/metadata/props/Button/buttonGeneralProps'
import {
  setupCode,
  variantCode,
  colorCode,
  colorCustomCode,
  sizeCode,
  iconCode,
  loadingCode,
  disabledCode,
  blockCode,
  radiusCode,
  hoverEffectCode,
  iconOnlyCode,
  colorsOverrideCode,
  eventsCode
} from '@/Docs/metadata/code/Button/buttonCodeExamples'

const { notify } = useNotify()

const onClick = () => {
  notify({
    title: 'Button clicked!',
    message: 'You have clicked the button.',
    color: 'positive',
    duration: 3000
  })
}
</script>

<style lang="scss" scoped>
.docs-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.docs-header {
  margin-bottom: 48px;

  h1 {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, $primary, $secondary);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0 0 12px;
  }
}

.subtitle {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.65;
  margin: 0;
}

.docs-section {
  margin-bottom: 56px;

  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  > p {
    font-size: 14px;
    line-height: 1.6;
    opacity: 0.65;
    margin: 0 0 20px;

    code {
      background: rgba($primary, 0.1);
      color: $primary;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
}

.section-note {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.65;
  margin: 0 0 16px;

  code {
    background: rgba($primary, 0.1);
    color: $primary;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
}

.example-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba($primary, 0.12);
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 16px;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba($primary, 0.12);
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 16px;
}

/* Esempio di hover custom gestito direttamente nella pagina docs */
.docs-hover-custom {
  &:hover:not(.vx-btn--disabled) {
    background: repeating-linear-gradient(
      45deg,
      var(--btn-bg),
      var(--btn-bg) 10px,
      color-mix(in srgb, var(--btn-bg) 70%, black) 10px,
      color-mix(in srgb, var(--btn-bg) 70%, black) 20px
    );
  }
}
</style>