<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>VxFiscalCode</h1>
      <p class="subtitle">
        Libreria a zero dipendenze per generare e validare il Codice Fiscale
        italiano (algoritmo implementato internamente, nessuna libreria
        esterna), più un hook Vue riutilizzabile tra progetti diversi per
        validare CF contro dati anagrafici.
      </p>
    </div>

    <!-- Setup -->
    <section class="docs-section">
      <h2>Setup</h2>
      <p>
        Un unico modulo, <code>useVxFiscalCode.ts</code>, contiene sia
        l'implementazione dell'algoritmo del Codice Fiscale italiano (generazione,
        validazione formale, controllo del carattere di controllo e decodifica),
        sia l'hook Vue <code>VxUseFiscalCodeValidation</code> che utilizza queste
        funzioni per validare un Codice Fiscale rispetto ai dati anagrafici forniti.
      </p>
      <DesignCodeBlock :code="setupCode" />
    </section>

    <!-- Generate -->
    <section class="docs-section">
      <h2>Generare un Codice Fiscale</h2>
      <p>
        <code>VxGenerateFiscalCode(input)</code> calcola il CF completo
        (16 caratteri, checksum incluso) da nome, cognome, sesso, data di
        nascita e codice catastale del comune di nascita.
        <code>birthplaceCode</code> va sempre fornito da chi chiama: la
        libreria non include il database dei comuni italiani.
      </p>

      <div class="example-col">
        <div class="example-row">
          <VxInput v-model="generateForm.name" label="Nome" placeholder="Mario" block />
          <VxInput v-model="generateForm.surname" label="Cognome" placeholder="Rossi" block />
        </div>

        <div class="example-row">
          <VxRadio v-model="generateForm.gender" name="gen-gender" value="M" label="M" />
          <VxRadio v-model="generateForm.gender" name="gen-gender" value="F" label="F" />
        </div>

        <div class="example-row">
          <VxDate v-model="generateForm.birthdayDate" label="Data di nascita" block />
          <VxInput
            v-model="generateForm.birthplaceCode"
            label="Codice catastale"
            hint="es. H501 per Roma"
            placeholder="H501"
            block
          />
        </div>

        <div class="docs-result" :class="{ 'docs-result--error': !generatedCF }">
          <span class="docs-result-label">Codice Fiscale generato</span>
          <span class="docs-result-value">{{ generatedCF || '—' }}</span>
        </div>
      </div>

      <DesignCodeBlock :code="generateCode" />

      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="generateInputRows"
        :widths="['160px', '160px', '110px', '1fr']"
      />
    </section>

    <!-- Validate -->
    <section class="docs-section">
      <h2>Validare formato e checksum</h2>
      <p>
        Tre funzioni indipendenti: <code>VxIsValidFiscalCodeFormat</code>
        verifica solo la forma (pattern lettere/cifre),
        <code>VxIsValidFiscalCodeChecksum</code> verifica il 16° carattere
        di controllo, <code>VxIsValidFiscalCode</code> fa entrambe le cose
        — equivalente al vecchio <code>CodiceFiscale.check()</code>.
      </p>

      <div class="example-col">
        <VxInput v-model="validateInput" label="Codice Fiscale" placeholder="RSSMRA90D15H501U" block />

        <div class="example-row docs-badges">
          <span class="docs-badge" :class="formatValid ? 'docs-badge--ok' : 'docs-badge--ko'">
            Formato {{ formatValid ? 'valido' : 'non valido' }}
          </span>
          <span class="docs-badge" :class="checksumValid ? 'docs-badge--ok' : 'docs-badge--ko'">
            Checksum {{ checksumValid ? 'valido' : 'non valido' }}
          </span>
        </div>
      </div>

      <DesignCodeBlock :code="validateFormatCode" />

      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="functionsRows"
        :widths="['260px', '280px', '160px', '1fr']"
      />
    </section>

    <!-- Decode -->
    <section class="docs-section">
      <h2>Decodificare un Codice Fiscale</h2>
      <p>
        <code>VxDecodeFiscalCode(cf)</code> estrae sesso, data di nascita e
        codice catastale da un CF sintatticamente valido. La scelta del
        secolo (1900 vs 2000) per l'anno è euristica: il CF codifica solo le
        ultime 2 cifre, quindi su date molto vecchie può essere ambigua.
      </p>

      <div class="example-col">
        <VxInput v-model="decodeInput" label="Codice Fiscale" placeholder="RSSMRA90D15H501U" block />

        <div v-if="decoded" class="docs-result">
          <span class="docs-result-label">Decodificato</span>
          <span class="docs-result-value">
            {{ decoded.gender }} · {{ String(decoded.day).padStart(2, '0') }}/{{ String(decoded.month).padStart(2, '0') }}/{{ decoded.year }} · {{ decoded.birthplaceCode }}
          </span>
        </div>
        <div v-else class="docs-result docs-result--error">
          <span class="docs-result-label">Decodificato</span>
          <span class="docs-result-value">null (formato non valido)</span>
        </div>
      </div>

      <DesignCodeBlock :code="decodeCode" />

      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="decodeOutputRows"
        :widths="['160px', '160px', '110px', '1fr']"
      />
    </section>

    <!-- Hook -->
    <section class="docs-section">
      <h2>Hook VxUseFiscalCodeValidation</h2>
      <p>
        Valida un CF contro dati anagrafici completi (non solo formato e
        checksum): confronta cognome/nome/data/luogo con quelli ricalcolati
        dal CF stesso, e riporta quali campi sono incoerenti. L'hook non fa
        ipotesi sul networking del progetto: il controllo duplicati
        (<code>checkExists</code>) è opzionale e iniettato da chi lo usa
        tramite <code>checkExistsFn</code>.
      </p>

      <div class="example-col">
        <div class="example-row">
          <VxInput v-model="hookForm.name" label="Nome" block />
          <VxInput v-model="hookForm.surname" label="Cognome" block />
        </div>

        <div class="example-row">
          <VxRadio v-model="hookForm.gender" name="hook-gender" value="M" label="M" />
          <VxRadio v-model="hookForm.gender" name="hook-gender" value="F" label="F" />
        </div>

        <div class="example-row">
          <VxDate v-model="hookForm.birthdayDate" label="Data di nascita" block />
          <VxInput v-model="hookForm.birthplaceCode" label="Codice catastale" block />
        </div>

        <VxInput v-model="hookForm.codiceFiscale" label="Codice Fiscale da validare" block />

        <VxCheckbox v-model="hookForm.requireAdult" label="Richiedi maggiorenne (requireAdult)" />

        <button type="button" class="docs-button" @click="runHookValidation">
          Valida
        </button>

        <div v-if="hookResult" class="docs-result" :class="{ 'docs-result--error': hookResult.invalidFields.length }">
          <span class="docs-result-label">Risultato</span>
          <span class="docs-result-value">
            invalidFields: [{{ hookResult.invalidFields.join(', ') }}] · error: {{ hookResult.error ?? 'null' }} · minor: {{ hookResult.minor }}
          </span>
        </div>
      </div>

      <DesignCodeBlock :code="hookBasicCode" />

      <h3 class="docs-subheading">Con controllo duplicati</h3>
      <p>
        Passa <code>checkExistsFn</code> in fase di creazione dell'hook per
        collegare il tuo client HTTP (fetch, axios, il tuo <code>useApi</code>
        interno, qualsiasi cosa): la libreria resta agnostica rispetto a
        come il progetto chiama le API.
      </p>
      <DesignCodeBlock :code="hookExistsCode" />

      <h3 class="docs-subheading">Con requireAdult</h3>
      <p>
        Se <code>requireAdult</code> è true, un CF che corrisponde a un
        minorenne viene respinto subito (solo errore <code>'cf'</code>,
        <code>error.value === 'minorUserNotAllowed'</code>) prima di
        qualunque altra validazione anagrafica.
      </p>
      <DesignCodeBlock :code="hookRequireAdultCode" />

      <h3 class="docs-subheading">Opzioni dell'hook</h3>
      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="hookOptionsRows"
        :widths="['160px', '260px', '110px', '1fr']"
      />

      <h3 class="docs-subheading">Input di validate()</h3>
      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="validateInputRows"
        :widths="['160px', '200px', '110px', '1fr']"
      />

      <h3 class="docs-subheading">Output</h3>
      <DesignPropsTable
        class="docs-props-table"
        :columns="propsColumns"
        :rows="validateReturnRows"
        :widths="['160px', '260px', '110px', '1fr']"
      />
    </section>

    <!-- Limiti noti -->
    <section class="docs-section">
      <h2>Limiti noti</h2>
      <p>
        Documentati apertamente, non nascosti:
      </p>
      <ul class="docs-list">
        <li>
          <strong>Omocodia non gestita</strong>: i CF "duplicati" (dove alcune
          cifre numeriche vengono sostituite da lettere per evitare collisioni
          tra persone con lo stesso CF calcolato) non sono generati né
          riconosciuti come varianti valide dello stesso CF base.
        </li>
        <li>
          <strong>Nessun database comuni</strong>: <code>birthplaceCode</code>
          va sempre fornito da chi chiama. Generarlo da un nome di comune
          richiederebbe l'intero database ISTAT/Agenzia Entrate (~8000 voci,
          inclusi i comuni soppressi/accorpati), fuori scopo per una libreria
          a zero dipendenze — è un modulo dati separato, non un algoritmo.
        </li>
        <li>
          <strong>Secolo dell'anno euristico</strong>: <code>VxDecodeFiscalCode</code>
          sceglie tra 1900 e 2000 in base a "non nel futuro" + "età
          plausibile (≤120 anni)". Due persone nate esattamente 100 anni una
          dall'altra, stesso giorno/mese, sono indistinguibili dal solo CF.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import VxInput from '@/Library/components/Input/VxInput.vue'
import VxDate from '@/Library/components/Input/VxDate.vue'
import VxCheckbox from '@/Library/components/Input/VxCheckbox.vue'
import VxRadio from '@/Library/components/Input/VxRadio.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import {
  VxGenerateFiscalCode,
  VxIsValidFiscalCodeFormat,
  VxIsValidFiscalCodeChecksum,
  VxDecodeFiscalCode,
  VxUseFiscalCodeValidation
} from '@/Library/composables/Cf/useVxFiscalCode'
import {
  propsColumns,
  generateInputRows,
  decodeOutputRows,
  functionsRows,
  hookOptionsRows,
  validateInputRows,
  validateReturnRows,
} from '@/Docs/metadata/props/Cf/fiscalCodeGeneralProps'
import {
  setupCode,
  generateCode,
  validateFormatCode,
  decodeCode,
  hookBasicCode,
  hookExistsCode,
  hookRequireAdultCode,
} from '@/Docs/metadata/code/Cf/fiscalCodeCodeExample'

// ===== Generate demo =====
const generateForm = reactive({
  name: 'Mario',
  surname: 'Rossi',
  gender: 'M',
  birthdayDate: '1990-04-15',
  birthplaceCode: 'H501',
})

const generatedCF = computed(() => {
  if (!generateForm.name || !generateForm.surname || !generateForm.birthdayDate || !generateForm.birthplaceCode) {
    return ''
  }
  const [year, month, day] = generateForm.birthdayDate.split('-').map(Number)
  try {
    return VxGenerateFiscalCode({
      name: generateForm.name,
      surname: generateForm.surname,
      gender: generateForm.gender,
      day,
      month,
      year,
      birthplaceCode: generateForm.birthplaceCode,
    })
  } catch (e) {
    return ''
  }
})

// ===== Validate demo =====
const validateInput = ref('RSSMRA90D15H501U')
const formatValid = computed(() => VxIsValidFiscalCodeFormat(validateInput.value))
const checksumValid = computed(() => VxIsValidFiscalCodeChecksum(validateInput.value))

// ===== Decode demo =====
const decodeInput = ref('RSSMRA90D15H501U')
const decoded = computed(() => VxDecodeFiscalCode(decodeInput.value))

// ===== Hook demo =====
const hookForm = reactive({
  name: 'Mario',
  surname: 'Rossi',
  gender: 'M',
  birthdayDate: '1990-04-15',
  birthplaceCode: 'H501',
  codiceFiscale: 'RSSMRA90D15H501U',
  requireAdult: false,
})

const { validate, error, minor } = VxUseFiscalCodeValidation()
const hookResult = ref(null)

async function runHookValidation() {
  const [year, month, day] = hookForm.birthdayDate.split('-').map(Number)
  const invalidFields = await validate({
    name: hookForm.name,
    surname: hookForm.surname,
    gender: hookForm.gender,
    birthdayDate: new Date(year, month - 1, day),
    codiceFiscale: hookForm.codiceFiscale,
    birthplaceCode: hookForm.birthplaceCode,
    requireAdult: hookForm.requireAdult,
  })

  hookResult.value = {
    invalidFields,
    error: error.value,
    minor: minor.value,
  }
}
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

.docs-subheading {
  font-size: 15px;
  font-weight: 700;
  margin: 24px 0 8px;
}

.docs-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.7;
  opacity: 0.75;

  li {
    margin-bottom: 10px;
  }

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
  align-items: flex-end;
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

.docs-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba($primary, 0.08);

  &--error {
    background: rgba($negative, 0.08);
  }
}

.docs-result-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.6;
}

.docs-result-value {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
}

.docs-badges {
  gap: 10px;
}

.docs-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;

  &--ok {
    background: rgba(#22c55e, 0.14);
    color: #16a34a;
  }

  &--ko {
    background: rgba($negative, 0.12);
    color: $negative;
  }
}

.docs-button {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: $primary;
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
}

.docs-props-table {
  margin-top: 20px;
}
</style>