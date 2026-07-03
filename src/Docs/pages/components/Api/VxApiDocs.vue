<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>VxApi</h1>
      <p class="subtitle">
        Client HTTP condiviso con gestione automatica di autenticazione,
        refresh token, notifiche e risposte binarie. Un'unica configurazione
        a livello di app, zero setup nei singoli componenti.
      </p>
    </div>

    <!-- Setup -->
    <section class="docs-section">
      <h2>Setup</h2>
      <p>
        Registra il plugin una sola volta nel <code>main.ts</code> del progetto,
        collegando la libreria allo store di autenticazione e all'env locali.
        In questa pagina il plugin è già registrato con
        <code>baseUrl: 'https://jsonplaceholder.typicode.com/'</code>, così puoi
        provare le chiamate dal vivo.
      </p>
      <DesignCodeBlock :code="setupCode" />
    </section>

    <!-- Uso base -->
    <section class="docs-section">
      <h2>Uso base</h2>
      <p>
        In qualsiasi componente, senza altro setup, importi <code>useVxApi</code>
        e chiami <code>VxRequest(endpoint, options)</code>.
      </p>

      <div class="example-row">
        <DesignButton text="GET /users/1" variant="primary" @click="demoGet" />
      </div>

      <DesignCodeBlock :code="usageCode" />
    </section>

    <!-- GET / POST / query / path params -->
    <section class="docs-section">
      <h2>Query e path params</h2>
      <p>
        <code>pathParams</code> sostituisce i segnaposto <code>:id</code>
        nell'endpoint, <code>query</code> costruisce la query string
        (supporta array per valori ripetuti).
      </p>
      <DesignCodeBlock :code="getPostCode" />
    </section>

    <!-- Notifiche automatiche -->
    <section class="docs-section">
      <h2>Notifiche automatiche</h2>
      <p>
        <code>showNotify</code> mostra automaticamente una notify di successo
        o errore usando il sistema <router-link to="/docs/notify">Notify</router-link>
        della libreria — nessun <code>try/catch</code> manuale richiesto.
      </p>

      <div class="example-row">
        <DesignButton text="Successo" variant="primary" @click="demoSuccess" />
        <DesignButton text="Errore" @click="demoError" />
      </div>

      <DesignCodeBlock :code="notifyCode" />
    </section>

    <!-- Message path custom -->
    <section class="docs-section">
      <h2>Messaggi da strutture custom</h2>
      <p>
        Se il tuo backend non risponde con <code>{ message }</code> o
        <code>{ error: { message } }</code>, usa <code>successMessagePath</code>
        e <code>errorMessagePath</code> per indicare dove si trova il testo
        dentro la risposta, con notazione a punti (supporta anche indici
        di array, es. <code>'errors.0.message'</code>).
      </p>
      <DesignCodeBlock :code="messagePathCode" />
    </section>

    <!-- Loading -->
    <section class="docs-section">
      <h2>Notify di caricamento</h2>
      <p>
        Con <code>showNotifyLoading</code> una notify persistente resta visibile
        per tutta la durata della chiamata e si trasforma da sola in
        success/error al termine, senza gestione manuale dell'id.
      </p>

      <div class="example-row">
        <DesignButton text="Carica lista utenti" variant="ghost" @click="demoLoading" />
      </div>

      <DesignCodeBlock :code="loadingCode" />
    </section>

    <!-- Refresh automatico -->
    <section class="docs-section">
      <h2>Refresh automatico del token</h2>
      <p>
        Su una risposta <code>401</code>, se è presente un refresh token la
        richiesta fallita viene messa in coda, il token viene rinnovato una
        sola volta anche in presenza di più chiamate concorrenti, e la
        richiesta originale riparte automaticamente.
      </p>
      <DesignCodeBlock :code="refreshCode" />
    </section>

    <!-- Blob -->
    <section class="docs-section">
      <h2>Risposte binarie</h2>
      <p>
        Con <code>expectBlob: true</code> (o quando il <code>Content-Type</code>
        della risposta è un binario riconosciuto: zip, pdf, excel...) la
        risposta viene restituita come <code>Blob</code> invece che JSON.
      </p>
      <DesignCodeBlock :code="blobCode" />
    </section>

    <!-- Config -->
    <section class="docs-section">
      <h2>Configurazione del plugin</h2>
      <p>
        Tutto ciò che è specifico del progetto (store di auth, env, i18n)
        vive qui, non nella libreria.
      </p>
      <DesignCodeBlock :code="configCode" />
      <DesignPropsTable
        :columns="configColumns"
        :rows="configRows"
        :widths="['150px', '220px', '110px', '1fr']"
        style="margin-top: 16px;"
      />
    </section>

    <!-- Options table -->
    <section class="docs-section">
      <h2>Opzioni di VxRequest()</h2>
      <DesignPropsTable
        :columns="optionsColumns"
        :rows="optionsRows"
        :widths="['150px', '220px', '110px', '1fr']"
      />
    </section>
  </div>
</template>

<script setup>
import { useVxApi } from '@/Library/hooks/Api/useVxApi'
import DesignButton from '@/Docs/components/Buttons/DesignButton.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import { optionsColumns, optionsRows, configColumns, configRows } from '@/Docs/metadata/props/Api/apiGeneralProps'
import {
  setupCode,
  usageCode,
  getPostCode,
  notifyCode,
  messagePathCode,
  loadingCode,
  refreshCode,
  blobCode,
  configCode,
} from '@/Docs/metadata/code/Api/apiCodeExamples'

const { VxRequest } = useVxApi()

const demoGet = () => {
  VxRequest('users/1', {
    method: 'GET',
    showNotify: true,
    successMessage: 'Utente caricato con successo!',
    errorMessage: "Impossibile caricare l'utente.",
  })
}

const demoSuccess = () => {
  VxRequest('users/1', {
    method: 'GET',
    showNotify: true,
    successMessage: 'Operazione completata!',
  })
}

const demoError = () => {
  VxRequest('questo-endpoint-non-esiste', {
    method: 'GET',
    showOnlyErroNotify: true,
    errorMessage: 'Endpoint non trovato (demo errore).',
  })
}

const demoLoading = () => {
  VxRequest('users', {
    method: 'GET',
    showNotifyLoading: true,
    loadingMessage: 'Carico la lista utenti...',
    successMessage: 'Utenti caricati!',
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
</style>