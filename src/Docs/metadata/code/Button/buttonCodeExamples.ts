export const setupCode = `// main.ts
import Button from '@/components/Button.vue'

app.component('Button', Button)`

export const variantCode = `<!-- Variant -->
<Button @click="onClick" variant="solid">Solid (default)</Button>
<Button @click="onClick" variant="outline">Outline</Button>
<Button @click="onClick" variant="ghost">Ghost</Button>
<Button @click="onClick" variant="text">Text</Button>`

export const colorCode = `<!-- Color palette -->
<Button @click="onClick" color="primary">Primary</Button>
<Button @click="onClick" color="secondary">Secondary</Button>
<Button @click="onClick" color="positive">Positive</Button>
<Button @click="onClick" color="negative">Negative</Button>
<Button @click="onClick" color="warning">Warning</Button>
<Button @click="onClick" color="info">Info</Button>`

export const colorCustomCode = `<!-- Color custom: hex, rgb, o CSS custom property -->
<Button @click="onClick" color="#7c3aed">Hex</Button>
<Button @click="onClick" color="var(--brand-color)">CSS var</Button>

<!-- Le variabili SCSS ($primary, ecc.) NON sono utilizzabili a runtime:
     usa il nome token ('primary') oppure var(--vx-primary), entrambi
     derivati dalla stessa palette ed esposti come CSS custom property -->
<Button @click="onClick" color="var(--vx-primary)">Palette via var</Button>`

export const sizeCode = `<!-- Size -->
<Button @click="onClick" size="sm">Small</Button>
<Button @click="onClick" size="md">Medium</Button>
<Button @click="onClick" size="lg">Large</Button>`

export const iconCode = `<!-- Icon via prop -->
<Button @click="onClick" :icon="Sparkles" iconPosition="left">
  Left icon
</Button>

<Button @click="onClick" :icon="Sparkles" iconPosition="right">
  Right icon
</Button>

<!-- Icon via slot -->
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
</Button>`

export const loadingCode = `<!-- Loading -->
<Button @click="onClick" loading>Loading</Button>

<Button @click="onClick" :loading="isLoading">
  Async action
</Button>`

export const disabledCode = `<!-- Disabled -->
<Button @click="onClick" disabled>Disabled</Button>

<Button @click="onClick" variant="ghost" disabled>
  Ghost disabled
</Button>`

export const blockCode = `<!-- Block full width -->
<Button @click="onClick" block>
  Full width
</Button>`

export const radiusCode = `<!-- Radius -->
<Button @click="onClick">Default</Button>

<Button @click="onClick" :radius="20">
  Custom radius
</Button>

<Button @click="onClick" pill>
  Pill button
</Button>`

export const iconOnlyCode = `<!-- Icon only -->
<Button @click="onClick" :icon="Sparkles" />

<Button @click="onClick" :icon="Sparkles" size="lg" />`

export const colorsOverrideCode = `<!-- Custom colors override -->
<Button
  @click="onClick"
  :colors="{
    background: '#7c3aed',
    text: '#ffffff',
    hoverBackground: '#6d28d9',
    border: 'transparent',
    shadow: 'rgba(124,58,237,0.3)'
  }"
>
  Custom button
</Button>

<!-- Le chiavi accettano anche i nomi token della palette interna -->
<Button
  @click="onClick"
  :colors="{
    background: 'positive',
    hoverBackground: 'primary'
  }"
>
  Token override
</Button>`

export const eventsCode = `<!-- Click event -->
<Button @click="handleClick">
  Click me
</Button>

<script setup>
const handleClick = (event) => {
  console.log('clicked', event)
}
</script>`

export const hoverEffectCode = `<!-- Hover effect -->
<Button hoverEffect="brightness">
  Brightness
</Button>


<Button hoverEffect="scale">
  Scale
</Button>


<Button hoverEffect="lift">
  Lift
</Button>


<Button hoverEffect="glow">
  Glow
</Button>


<Button variant="text" hoverEffect="underline">
  Underline
</Button>


<Button hoverEffect="none">
  None
</Button>


<!-- Custom: nessun effetto integrato, lo gestisci tu -->
<Button hoverEffect="custom" class="my-custom-hover">
  Custom
</Button>


<style scoped>
.my-custom-hover {
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
</style>`