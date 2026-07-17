<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>VxSelect</h1>
      <p class="subtitle">
        Componente select flessibile con varianti, colori custom, focus effect,
        icone, stato loading, clearable e supporto a hint ed errori.
      </p>
    </div>

    <!-- Setup -->
    <section class="docs-section">
        <h2>Setup</h2>
        <p>Importa il componente Select nel <code>File.vue</code>:</p>
        <DesignCodeBlock :code="setupCode" />
        </section>

        <!-- Basic -->
        <section class="docs-section">
        <h2>Basic</h2>
        <p>
            <code>VxSelect</code> permette di selezionare un'opzione da una lista.
            Le opzioni possono essere semplici valori oppure oggetti con label/value
            personalizzabili tramite <code>optionLabel</code> e <code>optionValue</code>.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.basic"
            :options="[
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Orange', value: 'orange' }
            ]"
            placeholder="Seleziona un frutto"
            />

            <VxSelect
            v-model="selectExamples.simple"
            :options="['Italia', 'Francia', 'Spagna']"
            placeholder="Nazione"
            />
        </div>

        <DesignCodeBlock :code="basicCode" />
        </section>

        <!-- Option mapping -->
        <section class="docs-section">
        <h2>Option label e value</h2>

        <p>
            Quando usi oggetti puoi controllare quale proprietà viene mostrata e quale
            valore viene salvato tramite <code>optionLabel</code> e
            <code>optionValue</code>.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.user"
            :options="[
                { id: 1, name: 'Mario Rossi' },
                { id: 2, name: 'Anna Verdi' }
            ]"
            optionLabel="name"
            optionValue="id"
            emitValue
            placeholder="Utente"
            />
        </div>

        <DesignCodeBlock :code="optionCode" />
        </section>

        <!-- Search -->
        <section class="docs-section">
        <h2>Searchable</h2>

        <p>
            Di default il campo supporta la ricerca testuale. Digitando nel campo
            vengono filtrate le opzioni disponibili.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.search"
            :options="[
                'React',
                'Vue',
                'Angular',
                'Svelte'
            ]"
            searchable
            placeholder="Cerca framework"
            />
        </div>

        <DesignCodeBlock :code="searchCode" />
        </section>

        <!-- Multiple -->
        <section class="docs-section">
        <h2>Multiple</h2>

        <p>
            Con <code>multiple</code> il valore del <code>v-model</code> diventa un
            array. Le selezioni vengono mostrate come chip tramite
            <code>useChips</code>.
        </p>

        <div class="example-col">
            <VxSelect
            v-model="selectExamples.multiple"
            multiple
            :options="[
                { label:'Vue', value:'vue' },
                { label:'React', value:'react' },
                { label:'Angular', value:'angular' }
            ]"
            emitValue
            placeholder="Tecnologie"
            />
        </div>

        <DesignCodeBlock :code="multipleCode" />
        </section>

        <!-- Chips -->
        <section class="docs-section">
        <h2>Chips</h2>

        <p>
            Le chip della selezione multipla possono essere disabilitate con
            <code>useChips</code>. In quel caso le etichette selezionate vengono
            mostrate come semplice testo separato da virgola.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.noChips"
            multiple
            :options="['A','B','C']"
            :useChips="false"
            />
        </div>

        <DesignCodeBlock :code="chipsCode" />
        </section>

        <!-- Clear -->
        <section class="docs-section">
        <h2>Clearable</h2>

        <p>
            Mostra una X per cancellare rapidamente il valore selezionato.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.clearable"
            clearable
            :options="['Uno','Due','Tre']"
            placeholder="Clear"
            />
        </div>

        <DesignCodeBlock :code="clearCode" />
        </section>

        <!-- Remote -->
        <section class="docs-section">
        <h2>Remote options</h2>

        <p>
            Passando <code>url</code> il componente carica automaticamente le opzioni
            da remoto. Supporta ricerca remota, paginazione e caricamento infinito
            tramite scroll.
        </p>

        <p class="section-note">
            Se l'array di opzioni non si trova direttamente in <code>res.data</code>
            o <code>res.data.content</code>, usa <code>dataPath</code> per indicare
            il percorso (dot notation) all'interno della risposta. Ad esempio l'API
            Rick and Morty restituisce <code>{ info: {...}, results: [...] }</code>,
            quindi serve <code>dataPath="results"</code>. Se l'endpoint richiede
            autenticazione, passa il bearer token con la prop <code>token</code>.
        </p>

        <div class="example-grid">
            <VxSelect
              v-model="selectExamples.remote"
              url="https://rickandmortyapi.com/api/character"
              dataPath="results"
              optionLabel="name"
              optionValue="id"
              searchParam="name"
              emitValue
              placeholder="Cerca personaggi"
            />
        </div>

        <DesignCodeBlock :code="remoteCode" />
        </section>

        <!-- Loading -->
        <section class="docs-section">
        <h2>Loading</h2>

        <p>
            <code>loading</code> mostra lo spinner e blocca l'interazione.
            Durante il caricamento remoto viene gestito automaticamente anche
            <code>isLoading</code>.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.loading"
            loading
            :options="[]"
            placeholder="Caricamento..."
            />
        </div>

        <DesignCodeBlock :code="loadingCode" />
        </section>

        <!-- Slots -->
        <section class="docs-section">
        <h2>Custom option slot</h2>

        <p>
            Puoi personalizzare il rendering delle opzioni tramite lo slot
            <code>option</code>.
        </p>

        <div class="example-col">
            <VxSelect
            v-model="selectExamples.slot"
            :options="[
                { label:'Admin', value:'admin' },
                { label:'User', value:'user' }
            ]"
            >
            <template #option="{ option, selected }">
                <strong>{{ option.label }}</strong>
                <small v-if="selected"> ✓</small>
            </template>
            </VxSelect>
        </div>

        <DesignCodeBlock :code="slotCode" />
        </section>

        <!-- Chrome -->
        <section class="docs-section">
        <h2>Chrome e stile</h2>

        <p>
            Condivide lo stesso wrapper di <code>VxInput</code>: label, hint,
            error, colori, varianti, focus effect, icone, radius e dimensioni.
        </p>

        <div class="example-grid">
            <VxSelect
            v-model="selectExamples.style"
            label="Categoria"
            hint="Scegli una categoria"
            color="#7c3aed"
            :options="['A','B','C']"
            />

            <VxSelect
            v-model="selectExamples.error"
            error
            errorMessage="Campo obbligatorio"
            :options="['A','B']"
            />
        </div>

        <DesignCodeBlock :code="styleCode" />
        </section>

        <!-- Icons -->
        <section class="docs-section">
        <h2>Icone</h2>

        <p>
            Supporta icone tramite prop <code>icon</code> oppure tramite gli slot
            <code>icon-left</code> e <code>icon-right</code>.
        </p>

        <DesignCodeBlock :code="iconCode" />
        </section>

        <!-- Events -->
        <section class="docs-section">
        <h2>Events</h2>

        <p>
            Il componente emette:
            <code>update:modelValue</code>,
            <code>focus</code>,
            <code>blur</code>,
            <code>clear</code>,
            <code>open</code>,
            <code>close</code>,
            <code>filter</code>.
        </p>

        <DesignCodeBlock :code="eventsCode" />
        </section>


        <!-- Props -->
        <section class="docs-section">
        <h2>Opzioni disponibili (VxSelect)</h2>

        <DesignPropsTable
        :columns="propsColumns"
        :rows="propsRows"
        :widths="['140px','200px','90px','1fr']"
        />

    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import VxSelect from '@/Library/components/Select/VxSelect.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import { propsColumns, propsRows } from '@/Docs/metadata/props/Select/selectGeneralProps'
import {
  setupCode,
  iconCode,
  eventsCode,
  basicCode,
  optionCode,
  searchCode,
  multipleCode,
  chipsCode,
  clearCode,
  remoteCode,
  loadingCode,
  slotCode,
  styleCode
} from '@/Docs/metadata/code/Select/selectCodeExamples'

const selectExamples = reactive({
  basic: '',
  simple: '',
  user: null,
  search: '',
  multiple: [],
  noChips: [],
  clearable: '',
  remote: null,
  loading: '',
  slot: null,
  style: '',
  error: '',
})
</script>

<style lang="scss" scoped>
.docs-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

@media (max-width: 600px) {
  .docs-page {
    padding: 0;
  }
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

.example-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba($primary, 0.12);
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 16px;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba($primary, 0.12);
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 16px;
}

.docs-focus-custom {
  :deep(.vx-input--focus-custom.vx-input--focused) {
    scale: 1.02;
    transition: all 0.2s ease-in-out;
  }
}

.docs-props-table {
  margin-top: 16px;
}
</style>