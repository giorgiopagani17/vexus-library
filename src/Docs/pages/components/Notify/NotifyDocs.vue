<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>Notify</h1>
      <p class="subtitle">
        Sistema di notifiche toast completamente personalizzabile: tipi, posizioni,
        azioni custom e durata configurabile.
      </p>
    </div>

    <!-- Installazione -->
    <section class="docs-section">
      <h2>Setup</h2>
      <p>Importa il Notify nel <code>File.vue</code>:</p>
      <DesignCodeBlock :code="setupCode" />
    </section>

    <!-- Tipi -->
    <section class="docs-section">
      <h2>Tipi</h2>
      <p>Cinque varianti predefinite, ognuna con icona e colore automatico.</p>

      <div class="example-row">
        <DesignButton text="Default" @click="notify({ message: 'Notifica generica' })" />
        <DesignButton text="Success" variant="primary" @click="notify({ type: 'success', message: 'Operazione completata!' })" />
        <DesignButton text="Error" @click="notify({ type: 'error', message: 'Qualcosa è andato storto.' })" />
        <DesignButton text="Warning" @click="notify({ type: 'warning', message: 'Attenzione, controlla i dati.' })" />
        <DesignButton text="Info" @click="notify({ type: 'info', message: 'Nuovo aggiornamento disponibile.' })" />
      </div>

      <DesignCodeBlock :code="typesCode" />
    </section>

    <!-- Titolo -->
    <section class="docs-section">
      <h2>Con titolo</h2>
      <p>Aggiungi un <code>title</code> per dare più peso al messaggio.</p>

      <div class="example-row">
        <DesignButton
          text="Mostra con titolo"
          variant="primary"
          @click="notify({
            type: 'success',
            title: 'Salvato!',
            message: 'Le modifiche sono state salvate correttamente.'
          })"
        />
      </div>

      <DesignCodeBlock :code="titleCode" />
    </section>

    <!-- Posizione -->
    <section class="docs-section">
      <h2>Posizione</h2>
      <p>Ogni notifica può apparire in una delle 6 posizioni dello schermo.</p>

      <div class="example-grid">
        <DesignButton
          v-for="pos in positions"
          :key="pos"
          :text="pos"
          variant="ghost"
          @click="notify({ message: `Notifica da ${pos}`, position: pos })"
        />
      </div>

      <DesignCodeBlock :code="positionCode" />
    </section>

    <!-- Durata -->
    <section class="docs-section">
      <h2>Durata</h2>
      <p>
        Di default le notifiche si chiudono dopo <code>4000ms</code>.
        Imposta <code>duration: 0</code> per renderle persistenti (richiede chiusura manuale).
      </p>

      <div class="example-row">
        <DesignButton text="Veloce (1.5s)" variant="ghost" @click="notify({ message: 'Scompare in fretta', duration: 1500 })" />
        <DesignButton text="Lenta (8s)" variant="ghost" @click="notify({ message: 'Resta più a lungo', duration: 8000 })" />
        <DesignButton text="Persistente" variant="primary" @click="notify({ message: 'Chiudimi manualmente', duration: 0 })" />
      </div>

      <DesignCodeBlock :code="durationCode" />
    </section>

    <!-- Azioni -->
    <section class="docs-section">
      <h2>Azioni custom</h2>
      <p>Aggiungi bottoni interattivi con handler personalizzati, utili per conferme o undo.</p>

      <div class="example-row">
        <DesignButton
          text="Mostra con azioni"
          variant="primary"
          @click="notify({
            type: 'warning',
            message: 'Stai per eliminare questo elemento.',
            duration: 0,
            actions: [
              { label: 'Annulla', handler: () => {} },
              { label: 'Elimina', color: '#c10015', handler: () => notify({ type: 'success', message: 'Elemento eliminato.' }) }
            ]
          })"
        />
      </div>

      <DesignCodeBlock :code="actionsCode" />
    </section>

    <!-- Icona custom -->
    <section class="docs-section">
      <h2>Icona custom</h2>
      <p>Sostituisci l'icona automatica con qualsiasi componente icona (es. Lucide).</p>

      <div class="example-row">
        <DesignButton
          text="Icona personalizzata"
          variant="ghost"
          @click="notify({ message: 'Nuova funzionalità disponibile!', icon: Sparkles, position: 'top-center' })"
        />
      </div>

      <DesignCodeBlock :code="iconCode" />
    </section>

    <!-- Dismiss -->
    <section class="docs-section">
      <h2>Chiusura programmatica</h2>
      <p><code>notify()</code> ritorna un <code>id</code> che puoi usare per chiudere la notifica via codice.</p>

      <div class="example-row">
        <DesignButton text="Apri e chiudi dopo 2s" variant="ghost" @click="programmaticDismiss" />
        <DesignButton text="Chiudi tutte" variant="ghost" @click="dismissAll" />
      </div>

      <DesignCodeBlock :code="dismissCode" />
    </section>

    <!-- Props table -->
    <section class="docs-section">
      <h2>Opzioni disponibili</h2>
      <div class="props-table">
        <div class="props-row props-row--header">
          <span>Prop</span>
          <span>Tipo</span>
          <span>Default</span>
          <span>Descrizione</span>
        </div>
        <div v-for="prop in props" :key="prop.name" class="props-row">
          <span class="prop-name">{{ prop.name }}</span>
          <span class="prop-type">{{ prop.type }}</span>
          <span class="prop-default">{{ prop.default }}</span>
          <span class="prop-desc">{{ prop.desc }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'
import { useNotify } from '@/Library/composables/Notify/useNotify'
import DesignButton from '@/Docs/components/Buttons/DesignButton.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'

const { notify, dismiss, dismissAll } = useNotify()

const positions = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right'
]

const programmaticDismiss = () => {
  const id = notify({ message: 'Mi chiuderò tra 2 secondi...', duration: 0 })
  setTimeout(() => dismiss(id), 2000)
}

const props = [
  { name: 'message', type: 'string', default: "''", desc: 'Testo principale della notifica' },
  { name: 'title', type: 'string | null', default: 'null', desc: 'Titolo opzionale sopra il messaggio' },
  { name: 'type', type: "'default' | 'success' | 'error' | 'warning' | 'info'", default: "'default'", desc: 'Variante visiva con icona/colore automatico' },
  { name: 'duration', type: 'number', default: '4000', desc: 'Tempo in ms prima della chiusura automatica. 0 = persistente' },
  { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-right'", desc: 'Posizione sullo schermo' },
  { name: 'icon', type: 'Component | null', default: 'null', desc: 'Icona custom, sovrascrive quella automatica' },
  { name: 'actions', type: 'Array<{ label, handler, color?, closeOnClick? }>', default: '[]', desc: 'Bottoni interattivi dentro la notifica' },
  { name: 'closable', type: 'boolean', default: 'true', desc: 'Mostra/nasconde il pulsante di chiusura manuale' },
  { name: 'onClose', type: '() => void | null', default: 'null', desc: 'Callback eseguita alla chiusura' }
]

const setupCode = `// File.vue
<script setup>
import NotifyContainer from '@/components/NotifyContainer.vue'
<\/script>`

const typesCode = `const { notify } = useNotify()

notify({ message: 'Notifica generica' })
notify({ type: 'success', message: 'Operazione completata!' })
notify({ type: 'error', message: 'Qualcosa è andato storto.' })
notify({ type: 'warning', message: 'Attenzione, controlla i dati.' })
notify({ type: 'info', message: 'Nuovo aggiornamento disponibile.' })`

const titleCode = `notify({
  type: 'success',
  title: 'Salvato!',
  message: 'Le modifiche sono state salvate correttamente.'
})`

const positionCode = `notify({ message: 'Ciao!', position: 'top-center' })
notify({ message: 'Ciao!', position: 'bottom-left' })
// ... e le altre 4 posizioni disponibili`

const durationCode = `notify({ message: 'Scompare in fretta', duration: 1500 })
notify({ message: 'Resta più a lungo', duration: 8000 })
notify({ message: 'Chiudimi manualmente', duration: 0 }) // persistente`

const actionsCode = `notify({
  type: 'warning',
  message: 'Stai per eliminare questo elemento.',
  duration: 0,
  actions: [
    { label: 'Annulla', handler: () => console.log('annullato') },
    {
      label: 'Elimina',
      color: '#c10015',
      handler: () => console.log('eliminato')
    }
  ]
})`

const iconCode = `import { Sparkles } from 'lucide-vue-next'

notify({
  message: 'Nuova funzionalità disponibile!',
  icon: Sparkles,
  position: 'top-center'
})`

const dismissCode = `const { notify, dismiss, dismissAll } = useNotify()

// notify() ritorna un id univoco
const id = notify({ message: 'Mi chiuderò tra 2 secondi...', duration: 0 })

setTimeout(() => dismiss(id), 2000)

// oppure chiudi tutte le notifiche attive
dismissAll()`
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

.props-table {
  border-radius: 14px;
  border: 1px solid rgba($primary, 0.15);
  overflow: hidden;
}

.props-row {
  display: grid;
  grid-template-columns: 130px 200px 90px 1fr;
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

.prop-name {
  font-family: 'Courier New', monospace;
  color: $secondary;
  font-weight: 600;
}

.prop-type {
  font-family: 'Courier New', monospace;
  opacity: 0.6;
  font-size: 12px;
}

.prop-default {
  opacity: 0.5;
  font-family: 'Courier New', monospace;
}

.prop-desc {
  opacity: 0.75;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .props-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>