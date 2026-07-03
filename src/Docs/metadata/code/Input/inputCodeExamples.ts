export const setupCode = `import Input from '@/Library/components/Input/Input.vue'`

export const variantCode = `<VxInput v-model="value" placeholder="Outline" />
<VxInput v-model="value" variant="ghost" placeholder="Ghost" />
<VxInput v-model="value" variant="text" placeholder="Text" />`

export const typeCode = `<VxInput v-model="value" type="password" placeholder="Password" />
<VxInput v-model="value" type="email" placeholder="Email" />
<VxInput v-model="value" type="number" placeholder="Numero" />
<VxInput v-model="value" type="tel" placeholder="Telefono" />
<VxInput v-model="value" type="url" placeholder="URL" />
<VxInput v-model="value" type="search" placeholder="Cerca..." />

<VxInput v-model="value" type="file" />`

export const colorCode = `<VxInput v-model="value" color="#7c3aed" placeholder="Hex" />
<VxInput v-model="value" color="rgb(34, 197, 94)" placeholder="rgb()" />
<VxInput v-model="value" color="crimson" placeholder="Nome CSS" />
<VxInput v-model="value" color="var(--vx-primary)" placeholder="CSS variable" />`

export const sizeCode = `<VxInput v-model="value" size="sm" placeholder="Small" />
<VxInput v-model="value" size="md" placeholder="Medium" />
<VxInput v-model="value" size="lg" placeholder="Large" />`

export const labelHintCode = `<VxInput
  v-model="email"
  label="Email"
  hint="Inserisci l'indirizzo associato al tuo account"
  placeholder="nome@dominio.it"
  block
/>

<VxInput
  v-model="username"
  label="Username"
  error
  errorMessage="Questo username non è disponibile"
  placeholder="Scegli uno username"
  block
/>`

export const iconCode = `<VxInput
  v-model="value"
  :icon="Search"
  iconPosition="left"
  placeholder="Search..."
/>

<VxInput
  v-model="value"
  :icon="Mail"
  iconPosition="right"
  placeholder="Email"
/>

<VxInput v-model="value" placeholder="Slot left">
  <template #icon-left>
    <Search />
  </template>
</Input>

<VxInput v-model="value" placeholder="Slot right">
  <template #icon-right>
    <CircleAlert />
  </template>
</Input>`

export const stateCode = `<VxInput v-model="value" loading placeholder="Loading..." />
<VxInput v-model="value" clearable placeholder="Campo svuotabile" />`

export const accessCode = `<VxInput v-model="value" disabled placeholder="Disabled" />
<VxInput v-model="value" readonly placeholder="Readonly" />`

export const layoutCode = `<VxInput v-model="value" block placeholder="Full width" />
<VxInput v-model="value" :radius="20" placeholder="Custom radius" />
<VxInput v-model="value" pill placeholder="Pill" />`

export const focusEffectCode = `<VxInput v-model="value" focusEffect="ring" placeholder="Ring" />
<VxInput v-model="value" focusEffect="lift" placeholder="Lift" />
<VxInput v-model="value" focusEffect="glow" placeholder="Glow" />
<VxInput v-model="value" focusEffect="none" placeholder="None" />
<VxInput v-model="value" focusEffect="custom" placeholder="Custom" />`

export const textareaCode = `<VxInput
  v-model="message"
  tag="textarea"
  label="Messaggio"
  placeholder="Scrivi qui il tuo messaggio..."
  hint="Puoi ridimensionare verticalmente il campo"
  block
/>`

export const colorsOverrideCode = `<VxInput
  v-model="value"
  :colors="{
    background: '#faf5ff',
    text: '#3b0764',
    border: '#d8b4fe',
    focusBorder: '#7c3aed',
    focusShadow: 'rgba(124, 58, 237, 0.22)',
    placeholder: '#a78bfa'
  }"
  placeholder="Full custom colors"
  block
/>

<VxInput
  v-model="value"
  :colors="{
    background: 'white',
    border: '#4ade80',
    text: '#16a34a',
    focusBorder: '#7c3aed',
    placeholder: '#a78bfa'
  }"
  placeholder="Colori misti"
  block
/>`

export const eventsCode = `<VxInput
  v-model="value"
  clearable
  label="Event demo"
  hint="Apri la console o aggancia una notify per vedere gli eventi"
  placeholder="Interagisci con questo campo"
  block
  @focus="onFocus"
  @blur="onBlur"
  @clear="onClear"
  @input="onInput"
/>`

export const datePickerCode = `import VxDatePicker from '@/Library/components/Input/InputDate.vue'

<VxDatePicker v-model="date" placeholder="Seleziona una data" />

<VxDatePicker
  v-model="date"
  clearable
  color="#22c55e"
  placeholder="Con clear"
/>

<VxDatePicker
  v-model="date"
  min="2026-01-01"
  max="2026-12-31"
  placeholder="Solo 2026"
/>

<VxDatePicker
  v-model="birthDate"
  label="Data di nascita"
  hint="Formato gg/mm/aaaa"
  block
/>`

export const dateRangeCode = `import VxDateRange from '@/Library/components/Input/InputDateRange.vue'

<VxDateRange
  v-model="range"
  :labels="{
    startPlaceholder: 'Data inizio',
    endPlaceholder: 'Data fine'
  }"
/>

<VxDateRange
  v-model="range"
  clearable
  min="2026-01-01"
  max="2026-12-31"
/>
`

export const dateTimeCode = `import VxDateTimePicker from '@/Library/components/Input/InputDateTime.vue'

<VxDateTimePicker v-model="value" />

<VxDateTimePicker
  v-model="value"
  clearable
  :minuteStep="15"
/>

<VxDateTimePicker
  v-model="value"
  separator=" - "
  timeFormat="HH.mm"
/>
`

export const dateTimeRangeCode = `import VxDateTimeRange from '@/Library/components/Input/InputDateTimeRange.vue'

<VxDateTimeRange
  v-model="range"
  :labels="{
    startPlaceholder: 'Data/ora inizio',
    endPlaceholder: 'Data/ora fine'
  }"
/>

<VxDateTimeRange
  v-model="range"
  clearable
  :minuteStep="15"
/>
`

export const timePickerCode = `import VxTimePicker from '@/Library/components/Input/InputTime.vue'

<VxTimePicker v-model="time" placeholder="Seleziona un orario" />

<VxTimePicker v-model="time" clearable color="#f97316" />

<VxTimePicker
  v-model="time"
  :minuteStep="15"
  placeholder="Step 15 min"
/>`

export const colorPickerCode = `import VxColorPicker from '@/Library/components/Input/InputColor.vue'

<VxColorPicker v-model="color" />

<VxColorPicker v-model="color" clearable />

<VxColorPicker v-model="color" :showHex="false" />`

export const rangeCode = `import VxRange from '@/Library/components/Input/InputRange.vue'

<VxRange v-model="value" block />

<VxRange
  v-model="value"
  :min="0"
  :max="10"
  :step="1"
  color="#22c55e"
  block
/>

<VxRange v-model="value" :showValue="false" color="#f97316" block />`