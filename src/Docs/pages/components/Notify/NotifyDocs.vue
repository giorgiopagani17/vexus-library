<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>Notify</h1>
      <p class="subtitle">
        Sistema di notifiche toast completamente personalizzabile: tipi, colori,
        posizioni, contenuto HTML, stati di caricamento e durata configurabile.
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
      <p>Cinque varianti predefinite, ognuna con icona e colore automatico (background pieno del colore del tipo, testo bianco).</p>

      <div class="example-row">
        <DesignButton text="Default" @click="notify({ message: 'Notifica generica' })" />
        <DesignButton text="Success" variant="primary" @click="notify({ type: 'success', message: 'Operazione completata!' })" />
        <DesignButton text="Error" @click="notify({ type: 'error', message: 'Qualcosa è andato storto.' })" />
        <DesignButton text="Warning" @click="notify({ type: 'warning', message: 'Attenzione, controlla i dati.' })" />
        <DesignButton text="Info" @click="notify({ type: 'info', message: 'Nuovo aggiornamento disponibile.' })" />
      </div>

      <DesignCodeBlock :code="typesCode" />
    </section>

    <!-- Colori custom -->
    <section class="docs-section">
      <h2>Colori custom</h2>
      <p>
        Ogni notifica è completamente ricolorabile tramite l'oggetto <code>colors</code>.
        Le chiavi non specificate mantengono il default del <code>type</code> scelto.
      </p>

      <div class="example-row">
        <DesignButton
          text="Colore custom"
          variant="ghost"
          @click="notify({
            message: 'Ho un colore tutto mio!',
            colors: {
              background: '#7c3aed',
              text: 'rgba(255,255,255,0.85)',
              title: '#ffffff',
              icon: '#ffffff',
              accent: '#ffffff',
              badgeBackground: '#ffffff',
              badgeText: '#7c3aed'
            }
          })"
        />
        <DesignButton
          text="Override parziale su type"
          variant="ghost"
          @click="notify({
            type: 'success',
            message: 'Success ma con sfondo diverso',
            colors: { background: '#0f766e', shadow: 'rgba(15,118,110,0.35)' }
          })"
        />
      </div>

      <DesignCodeBlock :code="colorsCode" />

      <DesignPropsTable
        :columns="colorColumns"
        :rows="colorKeys"
        :widths="['160px', '1fr']"
        style="margin-top: 16px;"
      />
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

    <!-- Contenuto HTML -->
    <section class="docs-section">
      <h2>Contenuto HTML</h2>
      <p>
        Imposta <code>html: true</code> per renderizzare markup dentro il messaggio
        (link, grassetto, liste...). <strong>Attenzione:</strong> sanitizza sempre
        l'HTML se contiene input proveniente dall'utente, per evitare XSS.
      </p>

      <div class="example-row">
        <DesignButton
          text="Notifica con HTML"
          variant="ghost"
          @click="notify({
            type: 'info',
            html: true,
            message: 'Il piano <b>Pro</b> sta per scadere. <a href=\'/billing\'>Rinnova ora</a>.',
            duration: 6000
          })"
        />
      </div>

      <DesignCodeBlock :code="htmlCode" />
    </section>

    <!-- Loading / Spinner -->
    <section class="docs-section">
      <h2>Stato di caricamento</h2>
      <p>
        Imposta <code>loading: true</code> per mostrare uno spinner al posto dell'icona,
        utile per operazioni asincrone. Usa <code>update(id, patch)</code> per aggiornare
        la notifica una volta completata l'operazione.
      </p>

      <div class="example-row">
        <DesignButton text="Simula upload" variant="primary" @click="simulateLoading" />
      </div>

      <DesignCodeBlock :code="loadingCode" />
    </section>

    <!-- Progress bar -->
    <section class="docs-section">
      <h2>Barra di progresso</h2>
      <p>
        Le notifiche con <code>duration &gt; 0</code> mostrano automaticamente una barra
        che indica il tempo rimanente prima della chiusura. Disattivabile con
        <code>progress: false</code>. Passa il mouse sopra la notifica per mettere in pausa il countdown.
      </p>

      <div class="example-row">
        <DesignButton text="Con progress bar" variant="ghost" @click="notify({ message: 'Mi chiudo tra poco...', duration: 5000, progress: true })" />
        <DesignButton text="Senza progress bar" variant="ghost" @click="notify({ message: 'Nessuna barra qui', duration: 5000 })" />
      </div>

      <DesignCodeBlock :code="progressCode" />
    </section>

    <!-- Posizione -->
    <section class="docs-section">
      <h2>Posizione</h2>
      <p>Ogni notifica può apparire in una delle 9 posizioni dello schermo.</p>

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
              { label: 'Annulla', action: () => {} },
              { label: 'Elimina', color: '#ffffff', action: () => notify({ type: 'success', message: 'Elemento eliminato.' }) }
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

    <!-- Size custom -->
    <section class="docs-section">
      <h2>Dimensioni custom</h2>
      <p>
        Regola indipendentemente la dimensione di icona, testo e titolo tramite
        <code>iconSize</code>, <code>textSize</code> e <code>titleSize</code> (in px).
      </p>

      <div class="example-row">
        <DesignButton
          text="Notifica grande"
          variant="ghost"
          @click="notify({
            type: 'info',
            title: 'Titolo grande',
            message: 'Testo ingrandito per dare più risalto.',
            iconSize: 32,
            titleSize: 18,
            textSize: 15,
            radius: 20,
            closeButtonSize: 24,
            alignItems: 'flex-end',
            duration: 6000
          })"
        />
      </div>

      <DesignCodeBlock :code="sizeCode" />
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
      <DesignPropsTable
        :columns="generalPropsColumns"
        :rows="generalProps"
        :widths="['130px', '200px', '90px', '1fr']"
      />
    </section>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'
import { useNotify } from '@/Library/composables/Notify/useNotify'
import DesignButton from '@/Docs/components/Buttons/DesignButton.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import { generalPropsColumns, generalProps } from '@/Docs/props/Notify/GeneralProps'
import { colorColumns, colorKeys } from '@/Docs/props/Notify/ColorsProps'
import { setupCode, typesCode, colorsCode, titleCode, htmlCode, loadingCode, progressCode, positionCode, durationCode, actionsCode, iconCode, sizeCode, dismissCode } from '@/Docs/code/Notify/NotifyCodeExamples'

const { notify, dismiss, dismissAll, update } = useNotify()

const positions = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center-center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right'
]

const programmaticDismiss = () => {
  const id = notify({ message: 'Mi chiuderò tra 2 secondi...', duration: 0 })
  setTimeout(() => dismiss(id), 2000)
}

const simulateLoading = () => {
  const id = notify({
    type: 'default',
    message: 'Caricamento file in corso...',
    loading: true,
    duration: 0,
    closable: false
  })

  setTimeout(() => {
    update(id, {
      type: 'success',
      loading: false,
      message: 'File caricato con successo!',
      duration: 3000,
      closable: true
    })
  }, 2500)
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
</style>