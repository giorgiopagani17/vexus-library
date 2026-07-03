export const setupCode = `import VxButton from '@/Library/components/Button/VxButton.vue'`

export const variantCode = `<!-- Variant -->
<VxButton @click="onClick" variant="solid">Solid (default)</Button>
<VxButton @click="onClick" variant="outline">Outline</Button>
<VxButton @click="onClick" variant="ghost">Ghost</Button>
<VxButton @click="onClick" variant="text">Text</Button>`

export const colorCode = `<!-- Color palette -->
<VxButton @click="onClick" color="primary">Primary</Button>
<VxButton @click="onClick" color="secondary">Secondary</Button>
<VxButton @click="onClick" color="positive">Positive</Button>
<VxButton @click="onClick" color="negative">Negative</Button>
<VxButton @click="onClick" color="warning">Warning</Button>
<VxButton @click="onClick" color="info">Info</Button>`

export const colorCustomCode = `<!-- Color custom: hex, rgb, o CSS custom property -->
<VxButton @click="onClick" color="#7c3aed">Hex</Button>
<VxButton @click="onClick" color="var(--brand-color)">CSS var</Button>

<!-- Le variabili SCSS ($primary, ecc.) NON sono utilizzabili a runtime:
     usa il nome token ('primary') oppure var(--vx-primary), entrambi
     derivati dalla stessa palette ed esposti come CSS custom property -->
<VxButton @click="onClick" color="var(--vx-primary)">Palette via var</Button>`

export const sizeCode = `<!-- Size -->
<VxButton @click="onClick" size="sm">Small</Button>
<VxButton @click="onClick" size="md">Medium</Button>
<VxButton @click="onClick" size="lg">Large</Button>`

export const iconCode = `<!-- Icon via prop -->
<VxButton @click="onClick" :icon="Sparkles" iconPosition="left">
  Left icon
</Button>

<VxButton @click="onClick" :icon="Sparkles" iconPosition="right">
  Right icon
</Button>

<!-- Icon via slot -->
<VxButton @click="onClick">
  <template #icon-left>
    <Sparkles />
  </template>
  Slot left
</Button>

<VxButton @click="onClick">
  Slot right
  <template #icon-right>
    <Sparkles />
  </template>
</Button>`

export const loadingCode = `<!-- Loading -->
<VxButton @click="onClick" loading>Loading</Button>

<VxButton @click="onClick" :loading="isLoading">
  Async action
</Button>`

export const disabledCode = `<!-- Disabled -->
<VxButton @click="onClick" disabled>Disabled</Button>

<VxButton @click="onClick" variant="ghost" disabled>
  Ghost disabled
</Button>`

export const blockCode = `<!-- Block full width -->
<VxButton @click="onClick" block>
  Full width
</Button>`

export const radiusCode = `<!-- Radius -->
<VxButton @click="onClick">Default</Button>

<VxButton @click="onClick" :radius="20">
  Custom radius
</Button>

<VxButton @click="onClick" pill>
  Pill button
</Button>`

export const iconOnlyCode = `<!-- Icon only -->
<VxButton @click="onClick" :icon="Sparkles" />

<VxButton @click="onClick" :icon="Sparkles" size="lg" />`

export const colorsOverrideCode = `<!-- Custom colors override -->
<VxButton
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
<VxButton
  @click="onClick"
  :colors="{
    background: 'positive',
    hoverBackground: 'primary'
  }"
>
  Token override
</Button>`

export const eventsCode = `<!-- Click event -->
<VxButton @click="handleClick">
  Click me
</Button>

<script setup>
const handleClick = (event) => {
  console.log('clicked', event)
}
</script>`

export const hoverEffectCode = `<!-- Hover effect -->
<VxButton hoverEffect="brightness">
  Brightness
</Button>


<VxButton hoverEffect="scale">
  Scale
</Button>


<VxButton hoverEffect="lift">
  Lift
</Button>


<VxButton hoverEffect="glow">
  Glow
</Button>


<VxButton variant="text" hoverEffect="underline">
  Underline
</Button>


<VxButton hoverEffect="none">
  None
</Button>


<!-- Custom: nessun effetto integrato, lo gestisci tu -->
<VxButton hoverEffect="custom" class="my-custom-hover">
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