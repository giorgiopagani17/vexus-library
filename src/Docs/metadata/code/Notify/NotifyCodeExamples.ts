export const setupCode = `// File.vue
<script setup>
import { useVxNotify } from '@/Library/hooks/Notify/useVxNotify'

const { VxNotify } = useVxNotify()
<\/script>`

export const typesCode = `const { VxNotify } = useVxNotify()

VxNotify({ message: 'Notifica generica' })
VxNotify({ type: 'success', message: 'Operazione completata!' })
VxNotify({ type: 'error', message: 'Qualcosa è andato storto.' })
VxNotify({ type: 'warning', message: 'Attenzione, controlla i dati.' })
VxNotify({ type: 'info', message: 'Nuovo aggiornamento disponibile.' })`

export const colorsCode = `VxNotify({
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
})

// oppure override parziale sopra un type esistente
VxNotify({
  type: 'success',
  message: 'Success ma con sfondo diverso',
  colors: { background: '#0f766e', shadow: 'rgba(15,118,110,0.35)' }
})`

export const titleCode = `VxNotify({
  type: 'success',
  title: 'Salvato!',
  message: 'Le modifiche sono state salvate correttamente.'
})`

export const htmlCode = `VxNotify({
  type: 'info',
  html: true,
  message: 'Il piano <b>Pro</b> sta per scadere. <a href="/billing">Rinnova ora</a>.',
  duration: 6000
})

// Sanitizza sempre input non fidato prima di passarlo, es:
// import DOMPurify from 'dompurify'
// VxNotify({ html: true, message: DOMPurify.sanitize(userInput) })`

export const loadingCode = `const { VxNotify, update } = useVxNotify()

const id = VxNotify({
  message: 'Caricamento file in corso...',
  loading: true,
  duration: 0,      // resta aperta finché non la aggiorni
  closable: false
})

// quando l'operazione asincrona finisce:
update(id, {
  type: 'success',
  loading: false,
  message: 'File caricato con successo!',
  duration: 3000,
  closable: true
})`

export const progressCode = `VxNotify({ message: 'Mi chiudo tra poco...', duration: 5000, progress: true })
VxNotify({ message: 'Nessuna barra qui', duration: 5000})

// Passando il mouse sopra la notifica, il countdown si mette in pausa`

export const positionCode = `VxNotify({ message: 'Ciao!', position: 'top-center' })
VxNotify({ message: 'Ciao!', position: 'center-center' })
VxNotify({ message: 'Ciao!', position: 'bottom-left' })
// ... e le altre 6 posizioni disponibili`

export const durationCode = `VxNotify({ message: 'Scompare in fretta', duration: 1500 })
VxNotify({ message: 'Resta più a lungo', duration: 8000 })
VxNotify({ message: 'Chiudimi manualmente', duration: 0 }) // persistente`

export const actionsCode = `VxNotify({
  type: 'warning',
  message: 'Stai per eliminare questo elemento.',
  duration: 0,
  actions: [
    { label: 'Annulla', action: () => console.log('annullato') },
    {
      label: 'Elimina',
      color: '#ffffff',
      action: () => console.log('eliminato')
    }
  ]
})`

export const iconCode = `import { Sparkles } from 'lucide-vue-next'

VxNotify({
  message: 'Nuova funzionalità disponibile!',
  icon: Sparkles,
  position: 'top-center'
})`

export const sizeCode = `VxNotify({
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
})`

export const dismissCode = `const { VxNotify, dismiss, dismissAll } = useVxNotify()

// VxNotify() ritorna un id univoco
const id = VxNotify({ message: 'Mi chiuderò tra 2 secondi...', duration: 0 })

setTimeout(() => dismiss(id), 2000)

// oppure chiudi tutte le notifiche attive
dismissAll()`