<template>
  <div class="docs-page">
    <div class="docs-header">
      <h1>VxInput</h1>
      <p class="subtitle">
        Componente input flessibile con varianti, colori custom, focus effect,
        icone, stato loading, clearable, textarea e supporto a hint ed errori.
        Le varianti dedicate coprono anche date, range, ora, data+ora, colore e slider.
      </p>
    </div>

    <!-- Setup -->
    <section class="docs-section">
      <h2>Setup</h2>
      <p>Importa il componente Input nel <code>File.vue</code>:</p>
      <DesignCodeBlock :code="setupCode" />
    </section>

    <!-- Variant -->
    <section class="docs-section">
      <h2>Variant</h2>
      <p>
        Definisce lo stile visivo del campo: <code>outline</code>,
        <code>ghost</code> o <code>text</code>.
      </p>

      <div class="example-grid">
        <VxInput v-model="variantExamples.outline" placeholder="Outline (default)" />
        <VxInput v-model="variantExamples.ghost" variant="ghost" placeholder="Ghost" />
        <VxInput v-model="variantExamples.text" variant="text" placeholder="Text" />
      </div>

      <DesignCodeBlock :code="variantCode" />
    </section>

    <!-- Type -->
    <section class="docs-section">
      <h2>Type</h2>
      <p>
        La prop <code>type</code> accetta i tipi nativi di
        <code>&lt;input&gt;</code> pensati per un campo di testo:
        <code>text</code>, <code>password</code>, <code>email</code>,
        <code>number</code>, <code>tel</code>, <code>url</code>,
        <code>search</code>, oltre a <code>file</code>, <code>checkbox</code>,
        <code>radio</code>, <code>hidden</code>, <code>button</code>,
        <code>submit</code>, <code>reset</code> e <code>image</code>. Viene
        ignorata se <code>tag="textarea"</code>.
      </p>

      <div class="example-grid">
        <VxInput v-model="typeExamples.password" type="password" placeholder="Password" />
        <VxInput v-model="typeExamples.email" type="email" placeholder="Email" />
        <VxInput v-model="typeExamples.number" type="number" placeholder="Numero" />
        <VxInput v-model="typeExamples.tel" type="tel" placeholder="Telefono" />
        <VxInput v-model="typeExamples.url" type="url" placeholder="URL" />
      </div>

      <div class="example-grid">
        <VxInput v-model="typeExamples.file" type="file" />
      </div>

      <p class="section-note">
        <code>checkbox</code>, <code>radio</code>, <code>hidden</code>,
        <code>button</code>, <code>submit</code>, <code>reset</code> e
        <code>image</code> sono supportati allo stesso modo tramite
        <code>type</code>, ma non sono pensati per lo stile "campo di testo"
        di questo componente: per quei casi valuta un componente dedicato
        (es. <code>VxCheckbox</code>, <code>VxRadio</code>).
      </p>

      <p class="section-note">
        <code>date</code>, <code>datetime-local</code>, <code>month</code>,
        <code>week</code>, <code>time</code>, <code>color</code> e
        <code>range</code> non sono gestiti da questa prop: il rendering
        nativo del browser per questi tipi non è restylizzabile in modo
        coerente col resto del design system. Sono gestiti da componenti
        dedicati che condividono lo stesso "chrome" visivo — vedi le sezioni
        <strong>Date picker</strong>, <strong>Date range</strong>,
        <strong>DateTime picker</strong>, <strong>DateTime range</strong>,
        <strong>Time picker</strong>, <strong>Color picker</strong> e
        <strong>Range</strong> qui sotto.
      </p>

      <DesignCodeBlock :code="typeCode" />
    </section>

    <!-- Date picker -->
    <section class="docs-section">
      <h2>Date picker</h2>
      <p>
        <code>VxDatePicker</code> sostituisce <code>type="date"</code>: stesso
        chrome di <code>Input</code>, ma con un pannello calendario custom al
        posto del rendering nativo del browser. Il valore è una stringa ISO
        <code>'YYYY-MM-DD'</code>. Supporta <code>min</code>/<code>max</code>
        per limitare l'intervallo selezionabile e <code>clearable</code> come
        Input.
      </p>

      <div class="example-grid">
        <VxDatePicker v-model="dateExamples.basic" placeholder="Seleziona una data" />
        <VxDatePicker
          v-model="dateExamples.clearable"
          clearable
          color="#22c55e"
          placeholder="Con clear"
        />
        <VxDatePicker
          v-model="dateExamples.ranged"
          min="2026-01-01"
          max="2026-12-31"
          placeholder="Solo 2026"
        />
      </div>

      <div class="example-col">
        <VxDatePicker
          v-model="dateExamples.labeled"
          label="Data di nascita"
          hint="Formato gg/mm/aaaa"
          block
        />
      </div>

      <DesignCodeBlock :code="datePickerCode" />
    </section>

    <!-- Date range -->
    <section class="docs-section">
      <h2>Date range</h2>
      <p>
        <code>VxDateRange</code> copre l'uso di un intervallo di date con un
        solo input testuale e un calendario dedicato. Il <code>v-model</code>
        è un oggetto con <code>{ start, end }</code> in formato ISO
        <code>'YYYY-MM-DD'</code>. Il campo mostra un placeholder combinato e
        il pannello resta il punto principale per selezionare il range.
      </p>

      <div class="example-col">
        <VxDateRange v-model="dateRangeExamples.basic" />
        <VxDateRange v-model="dateRangeExamples.clearable" clearable />
      </div>

      <DesignCodeBlock :code="dateRangeCode" />
    </section>

    <!-- DateTime picker -->
    <section class="docs-section">
      <h2>DateTime picker</h2>
      <p>
        <code>VxDateTimePicker</code> sostituisce <code>type="datetime-local"</code>:
        unisce selezione della data e dell'orario nello stesso componente. Il
        <code>v-model</code> usa il formato canonico <code>'YYYY-MM-DD HH:MM'</code>
        e l'ora si controlla con <code>minuteStep</code>, <code>timeFormat</code>
        e <code>separator</code>.
      </p>

      <div class="example-grid">
        <VxDateTimePicker v-model="dateTimeExamples.basic" />
        <VxDateTimePicker v-model="dateTimeExamples.clearable" clearable :minuteStep="15" />
        <VxDateTimePicker v-model="dateTimeExamples.custom" separator=" - " timeFormat="HH.mm" />
      </div>

      <DesignCodeBlock :code="dateTimeCode" />
    </section>

    <!-- DateTime range -->
    <section class="docs-section">
      <h2>DateTime range</h2>
      <p>
        <code>VxDateTimeRange</code> estende l'intervallo di date aggiungendo la
        scelta dell'orario per inizio e fine, sempre con un solo input visibile.
        Anche qui il <code>v-model</code> è un oggetto <code>{ start, end }</code>,
        con valori canonici <code>'YYYY-MM-DD HH:MM'</code>.
      </p>

      <div class="example-col">
        <VxDateTimeRange v-model="dateTimeRangeExamples.basic" />
        <VxDateTimeRange v-model="dateTimeRangeExamples.clearable" clearable :minuteStep="15" />
      </div>

      <DesignCodeBlock :code="dateTimeRangeCode" />
    </section>

    <!-- Time picker -->
    <section class="docs-section">
      <h2>Time picker</h2>
      <p>
        <code>VxTimePicker</code> sostituisce <code>type="time"</code>: due
        colonne scorrevoli per ore e minuti. Il valore è una stringa
        <code>'HH:MM'</code> (24h). L'intervallo tra un minuto e l'altro si
        controlla con <code>minuteStep</code> (default 5).
      </p>

      <div class="example-grid">
        <VxTimePicker v-model="timeExamples.basic" placeholder="Seleziona un orario" />
        <VxTimePicker v-model="timeExamples.clearable" clearable color="#f97316" />
        <VxTimePicker v-model="timeExamples.step" :minuteStep="15" placeholder="Step 15 min" />
      </div>

      <DesignCodeBlock :code="timePickerCode" />
    </section>

    <!-- Color picker -->
    <section class="docs-section">
      <h2>Color picker</h2>
      <p>
        <code>VxColorPicker</code> sostituisce <code>type="color"</code>: uno
        swatch cliccabile apre il selettore colore nativo del sistema
        operativo/browser, con lo stesso chrome degli altri campi. Il valore
        è una stringa hex (<code>'#rrggbb'</code>). Disattiva
        <code>showHex</code> se vuoi solo lo swatch.
      </p>

      <div class="example-grid">
        <VxColorPicker v-model="colorPickerExamples.basic" />
        <VxColorPicker v-model="colorPickerExamples.clearable" clearable />
        <VxColorPicker v-model="colorPickerExamples.noHex" :showHex="false" />
      </div>

      <DesignCodeBlock :code="colorPickerCode" />
    </section>

    <!-- Range -->
    <section class="docs-section">
      <h2>Range</h2>
      <p>
        <code>VxRange</code> sostituisce <code>type="range"</code>: slider
        nativo restylizzato, con la porzione riempita e il thumb colorati
        tramite la prop <code>color</code>. Supporta <code>min</code>,
        <code>max</code>, <code>step</code> e mostra il valore corrente a
        destra (disattivabile con <code>showValue</code>).
      </p>

      <div class="example-col">
        <VxRange v-model="rangeExamples.basic" block />
        <VxRange v-model="rangeExamples.stepped" :min="0" :max="10" :step="1" color="#22c55e" block />
        <VxRange v-model="rangeExamples.noValue" :showValue="false" color="#f97316" block />
      </div>

      <DesignCodeBlock :code="rangeCode" />
    </section>

    <!-- Color -->
    <section class="docs-section">
      <h2>Color (bordo/focus)</h2>
      <p>
        Definisce il colore del bordo e del focus ring. Accetta qualsiasi
        valore CSS valido: hex, <code>rgb()</code>/<code>rgba()</code>, nome
        colore CSS o <code>var(--...)</code>.
      </p>

      <div class="example-grid">
        <VxInput v-model="colorExamples.hex" color="#7c3aed" placeholder="Hex" />
        <VxInput v-model="colorExamples.rgb" color="rgb(34, 197, 94)" placeholder="rgb()" />
        <VxInput v-model="colorExamples.named" color="crimson" placeholder="Nome CSS" />
        <VxInput
          v-model="colorExamples.varColor"
          color="var(--vx-primary)"
          placeholder="CSS variable"
        />
      </div>

      <DesignCodeBlock :code="colorCode" />
    </section>

    <!-- Size -->
    <section class="docs-section">
      <h2>Size</h2>
      <p>
        Tre dimensioni disponibili: <code>sm</code>, <code>md</code> (default) e
        <code>lg</code>.
      </p>

      <div class="example-grid">
        <VxInput v-model="sizeExamples.sm" size="sm" placeholder="Small" />
        <VxInput v-model="sizeExamples.md" size="md" placeholder="Medium" />
        <VxInput v-model="sizeExamples.lg" size="lg" placeholder="Large" />
      </div>

      <DesignCodeBlock :code="sizeCode" />
    </section>

    <!-- Label, hint, error -->
    <section class="docs-section">
      <h2>Label e hint</h2>
      <p>
        Puoi mostrare una label sopra il campo e un testo di supporto sotto
        tramite <code>label</code> e <code>hint</code>.
      </p>

      <div class="example-col">
        <VxInput
          v-model="metaExamples.email"
          label="Email"
          hint="Inserisci l'indirizzo associato al tuo account"
          placeholder="nome@dominio.it"
          block
        />

        <VxInput
          v-model="metaExamples.username"
          label="Username"
          error
          errorMessage="Questo username non è disponibile"
          placeholder="Scegli uno username"
          block
        />
      </div>

      <DesignCodeBlock :code="labelHintCode" />
    </section>

    <!-- Icons -->
    <section class="docs-section">
      <h2>Icone</h2>
      <p>
        Supporta icone tramite prop <code>icon</code> oppure tramite gli slot
        <code>icon-left</code> e <code>icon-right</code>.
      </p>

      <div class="example-col">
        <div class="example-row">
          <VxInput
            v-model="iconExamples.left"
            :icon="Search"
            iconPosition="left"
            placeholder="Search..."
          />
          <VxInput
            v-model="iconExamples.right"
            :icon="Mail"
            iconPosition="right"
            placeholder="Email"
          />
        </div>

        <div class="example-row">
          <VxInput v-model="iconExamples.slotLeft" placeholder="Slot left">
            <template #icon-left>
              <Search />
            </template>
          </VxInput>

          <VxInput v-model="iconExamples.slotRight" placeholder="Slot right">
            <template #icon-right>
              <CircleAlert />
            </template>
          </VxInput>
        </div>
      </div>

      <DesignCodeBlock :code="iconCode" />
    </section>

    <!-- Loading and clear -->
    <section class="docs-section">
      <h2>Loading e clear</h2>
      <p>
        Con <code>loading</code> mostri uno spinner e disabiliti il campo; con
        <code>clearable</code> compare una X per svuotare rapidamente il valore.
      </p>

      <div class="example-grid">
        <VxInput v-model="stateExamples.loading" loading placeholder="Loading..." />
        <VxInput v-model="stateExamples.clearable" clearable placeholder="Campo svuotabile" />
      </div>

      <DesignCodeBlock :code="stateCode" />
    </section>

    <!-- Disabled / readonly -->
    <section class="docs-section">
      <h2>Disabled e readonly</h2>
      <p>
        Usa <code>disabled</code> per bloccare completamente l'interazione e
        <code>readonly</code> per mantenere il contenuto selezionabile ma non modificabile.
      </p>

      <div class="example-grid">
        <VxInput v-model="accessExamples.disabled" disabled placeholder="Disabled" />
        <VxInput v-model="accessExamples.readonly" readonly placeholder="Readonly" />
      </div>

      <DesignCodeBlock :code="accessCode" />
    </section>

    <!-- Block, radius, pill -->
    <section class="docs-section">
      <h2>Layout e radius</h2>
      <p>
        Il campo può occupare tutta la larghezza disponibile con <code>block</code>
        e supporta <code>radius</code> custom oppure <code>pill</code>.
      </p>

      <div class="example-col">
        <VxInput v-model="layoutExamples.block" block placeholder="Full width" />
        <div class="example-row">
          <VxInput v-model="layoutExamples.default" placeholder="Default radius" />
          <VxInput v-model="layoutExamples.custom" :radius="20" placeholder="Custom radius" />
          <VxInput v-model="layoutExamples.pill" pill placeholder="Pill" />
        </div>
      </div>

      <DesignCodeBlock :code="layoutCode" />
    </section>

    <!-- Focus effect -->
    <section class="docs-section">
      <h2>Focus effect</h2>
      <p>
        Controlla il comportamento visivo al focus tramite <code>focusEffect</code>:
        <code>ring</code>, <code>lift</code>, <code>glow</code>, <code>none</code>
        o <code>custom</code>.
      </p>

      <div class="example-grid">
        <VxInput v-model="focusExamples.ring" focusEffect="ring" placeholder="Ring" />
        <VxInput v-model="focusExamples.lift" focusEffect="lift" placeholder="Lift" />
        <VxInput v-model="focusExamples.glow" focusEffect="glow" placeholder="Glow" />
        <VxInput v-model="focusExamples.none" focusEffect="none" placeholder="None" />
        <VxInput
          v-model="focusExamples.custom"
          focusEffect="custom"
          class="docs-focus-custom"
          placeholder="Custom"
        />
      </div>

      <DesignCodeBlock :code="focusEffectCode" />
    </section>

    <!-- Textarea -->
    <section class="docs-section">
      <h2>Textarea</h2>
      <p>
        Imposta <code>tag="textarea"</code> per usare lo stesso componente come
        campo multilinea.
      </p>

      <div class="example-col">
        <VxInput
          v-model="textareaExamples.default"
          tag="textarea"
          label="Messaggio"
          placeholder="Scrivi qui il tuo messaggio..."
          hint="Puoi ridimensionare verticalmente il campo"
          block
        />
      </div>

      <DesignCodeBlock :code="textareaCode" />
    </section>

    <!-- Custom colors -->
    <section class="docs-section">
      <h2>Colori custom</h2>
      <p>
        Tramite la prop <code>colors</code> puoi ridefinire background, testo,
        bordo, placeholder e colori del focus, passando qualsiasi valore CSS
        valido.
      </p>

      <div class="example-col">
        <VxInput
          v-model="colorsExamples.customA"
          :colors="{
            background: '#faf5ff',
            text: '#3b0764',
            icon: '#16a34a',
            border: '#d8b4fe',
            focusBorder: '#7c3aed',
            focusShadow: 'rgba(124, 58, 237, 0.22)',
            placeholder: '#a78bfa'
          }"
          :icon="Search"
          placeholder="Full custom colors"
          block
        />

        <VxInput
          v-model="colorsExamples.customB"
          :colors="{
            background: 'white',
            border: '#4ade80',
            text: '#16a34a',
            focusBorder: '#7c3aed',
            placeholder: '#a78bfa'
          }"
          placeholder="Colori misti"
          block
        />
      </div>

      <DesignCodeBlock :code="colorsOverrideCode" />
    </section>

    <!-- Events -->
    <section class="docs-section">
      <h2>Events</h2>
      <p>
        Il componente emette <code>update:modelValue</code>, <code>input</code>,
        <code>focus</code>, <code>blur</code> e <code>clear</code>.
      </p>

      <div class="example-col">
        <VxInput
          v-model="eventsExample"
          clearable
          label="Event demo"
          hint="Apri la console o aggancia una notify per vedere gli eventi"
          placeholder="Interagisci con questo campo"
          block
          @focus="onFocus"
          @blur="onBlur"
          @clear="onClear"
          @input="onInput"
        />
      </div>

      <DesignCodeBlock :code="eventsCode" />
    </section>

    <!-- Related components -->
    <section class="docs-section">
      <h2>Componenti collegati</h2>
      <p>
        <code>VxInput</code> condivide il proprio "chrome" (label, bordo,
        varianti, focus, icone, hint/error) con
        <code>VxFieldWrapper</code>, lo stesso wrapper usato dai componenti
        dedicati per date, range di date, data+ora, range di data+ora, orari,
        colore e slider. Se ti serve uno di quei tipi, guarda la
        documentazione del componente specifico invece di forzarlo su
        <code>VxInput</code>.
      </p>
    </section>

    <!-- Props table -->
    <section class="docs-section">
      <h2>Opzioni disponibili</h2>
      <DesignPropsTable
        :columns="propsColumns"
        :rows="propsRows"
        :widths="['140px', '200px', '90px', '1fr']"
      />
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Search, Mail, CircleAlert } from 'lucide-vue-next'
import VxInput from '@/Library/components/Input/VxInput.vue'
import VxDatePicker from '@/Library/components/Input/VxDatePicker.vue'
import VxDateRange from '@/Library/components/Input/VxDateRange.vue'
import VxDateTimePicker from '@/Library/components/Input/VxDateTimePicker.vue'
import VxDateTimeRange from '@/Library/components/Input/VxDateTimeRange.vue'
import VxTimePicker from '@/Library/components/Input/VxTimePicker.vue'
import VxColorPicker from '@/Library/components/Input/VxColorPicker.vue'
import VxRange from '@/Library/components/Input/VxRange.vue'
import DesignCodeBlock from '@/Docs/components/Utils/DesignCodeBlock.vue'
import DesignPropsTable from '@/Docs/components/Utils/DesignPropsTable.vue'
import { useVxNotify } from '@/Library/hooks/Notify/useVxNotify'
import { propsColumns, propsRows } from '@/Docs/metadata/props/Input/inputGeneralProps'
import {
  setupCode,
  variantCode,
  typeCode,
  colorCode,
  sizeCode,
  labelHintCode,
  iconCode,
  stateCode,
  accessCode,
  layoutCode,
  focusEffectCode,
  textareaCode,
  colorsOverrideCode,
  eventsCode,
  datePickerCode,
  dateRangeCode,
  dateTimeCode,
  dateTimeRangeCode,
  timePickerCode,
  colorPickerCode,
  rangeCode,
} from '@/Docs/metadata/code/Input/inputCodeExamples'

const { VxNotify } = useVxNotify()

const variantExamples = reactive({
  ghost: '',
  text: '',
})

const typeExamples = reactive({
  password: '',
  email: '',
  number: '',
  tel: '',
  url: '',
  search: '',
  file: '',
})

const colorExamples = reactive({
  hex: '',
  rgb: '',
  named: '',
  varColor: '',
})

const sizeExamples = reactive({
  sm: '',
  md: '',
  lg: '',
})

const metaExamples = reactive({
  email: '',
  username: 'giorgio.dev',
})

const iconExamples = reactive({
  left: '',
  right: '',
  slotLeft: '',
  slotRight: '',
})

const stateExamples = reactive({
  loading: 'Caricamento...',
  clearable: 'Testo da cancellare',
})

const accessExamples = reactive({
  disabled: '',
  readonly: 'Valore in sola lettura',
})

const layoutExamples = reactive({
  block: '',
  default: '',
  custom: '',
  pill: '',
})

const focusExamples = reactive({
  ring: '',
  lift: '',
  glow: '',
  none: '',
  custom: '',
})

const textareaExamples = reactive({
  default: '',
})

const colorsExamples = reactive({
  customA: '',
  customB: '',
})

const dateExamples = reactive({
  basic: '',
  clearable: '2026-07-03',
  ranged: '',
  labeled: '',
})

const dateRangeExamples = reactive({
  basic: { start: '', end: '' },
  clearable: { start: '2026-07-01', end: '2026-07-10' },
})

const dateTimeExamples = reactive({
  basic: '2026-07-03 09:30',
  clearable: '2026-07-03 14:45',
  custom: '2026-07-03 17:00',
})

const dateTimeRangeExamples = reactive({
  basic: { start: '', end: '' },
  clearable: { start: '2026-07-01 09:00', end: '2026-07-03 18:00' },
})

const timeExamples = reactive({
  basic: '',
  clearable: '14:30',
  step: '',
})

const colorPickerExamples = reactive({
  basic: '#7c3aed',
  clearable: '#22c55e',
  noHex: '#f97316',
})

const rangeExamples = reactive({
  basic: 50,
  stepped: 5,
  noValue: 30,
})

const eventsExample = ref('')

const onFocus = () => {
  VxNotify({
    title: 'Input focus',
    message: 'Il campo ha ricevuto il focus.',
    color: 'info',
    duration: 2500,
  })
}

const onBlur = () => {
  VxNotify({
    title: 'Input blur',
    message: 'Il campo ha perso il focus.',
    color: 'secondary',
    duration: 2500,
  })
}

const onClear = () => {
  VxNotify({
    title: 'Input cleared',
    message: 'Il valore del campo è stato svuotato.',
    color: 'warning',
    duration: 2500,
  })
}

const onInput = () => {
  // Hook lasciato qui per demo event binding
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
</style>