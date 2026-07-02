export const setupCode = `// File.vue
<script setup>
import NotifyContainer from '@/components/NotifyContainer.vue'
<\/script>`

export const typesCode = `const { notify } = useNotify()

notify({ message: 'Notifica generica' })
notify({ type: 'success', message: 'Operazione completata!' })
notify({ type: 'error', message: 'Qualcosa è andato storto.' })
notify({ type: 'warning', message: 'Attenzione, controlla i dati.' })
notify({ type: 'info', message: 'Nuovo aggiornamento disponibile.' })`

export const colorsCode = `notify({
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
notify({
  type: 'success',
  message: 'Success ma con sfondo diverso',
  colors: { background: '#0f766e', shadow: 'rgba(15,118,110,0.35)' }
})`

export const titleCode = `notify({
  type: 'success',
  title: 'Salvato!',
  message: 'Le modifiche sono state salvate correttamente.'
})`

export const htmlCode = `notify({
  type: 'info',
  html: true,
  message: 'Il piano <b>Pro</b> sta per scadere. <a href="/billing">Rinnova ora</a>.',
  duration: 6000
})

// Sanitizza sempre input non fidato prima di passarlo, es:
// import DOMPurify from 'dompurify'
// notify({ html: true, message: DOMPurify.sanitize(userInput) })`

export const loadingCode = `const { notify, update } = useNotify()

const id = notify({
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

export const progressCode = `notify({ message: 'Mi chiudo tra poco...', duration: 5000, progress: true })
notify({ message: 'Nessuna barra qui', duration: 5000})

// Passando il mouse sopra la notifica, il countdown si mette in pausa`

export const positionCode = `notify({ message: 'Ciao!', position: 'top-center' })
notify({ message: 'Ciao!', position: 'center-center' })
notify({ message: 'Ciao!', position: 'bottom-left' })
// ... e le altre 6 posizioni disponibili`

export const durationCode = `notify({ message: 'Scompare in fretta', duration: 1500 })
notify({ message: 'Resta più a lungo', duration: 8000 })
notify({ message: 'Chiudimi manualmente', duration: 0 }) // persistente`

export const actionsCode = `notify({
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

notify({
  message: 'Nuova funzionalità disponibile!',
  icon: Sparkles,
  position: 'top-center'
})`

export const sizeCode = `notify({
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

export const dismissCode = `const { notify, dismiss, dismissAll } = useNotify()

// notify() ritorna un id univoco
const id = notify({ message: 'Mi chiuderò tra 2 secondi...', duration: 0 })

setTimeout(() => dismiss(id), 2000)

// oppure chiudi tutte le notifiche attive
dismissAll()`