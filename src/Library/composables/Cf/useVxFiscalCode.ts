/**
 * useVxFiscalCode.ts
 * --------------------
 * Un unico modulo con:
 *  1) l'algoritmo del Codice Fiscale italiano, zero dipendenze esterne
 *     (generazione, verifica formale, verifica del carattere di controllo,
 *     decodifica);
 *  2) l'hook Vue `VxUseFiscalCodeValidation` che lo usa per validare un CF
 *     contro dati anagrafici completi.
 *
 * Limiti noti (documentati, non nascosti):
 * - Non gestisce l'omocodia (i codici "duplicati" in cui alcune cifre
 *   numeriche vengono sostituite da lettere per evitare collisioni tra
 *   persone con lo stesso CF calcolato).
 * - `birthplaceCode` (codice catastale del comune, es. 'H501' per Roma) va
 *   sempre fornito da chi chiama: generarlo dal nome del comune
 *   richiederebbe l'intero database ISTAT/Agenzia Entrate (~8000 voci).
 * - La scelta del secolo (1900 vs 2000) in `VxDecodeFiscalCode` è
 *   euristica, non certa (il CF codifica solo le ultime 2 cifre dell'anno).
 */
import { ref } from 'vue'

// ============================================================================
// 1) Algoritmo puro (nessuna dipendenza da Vue, usabile anche fuori da qui)
// ============================================================================

export type CFGender = 'M' | 'F'

export interface VxGenerateFiscalCodeInput {
  name: string
  surname: string
  gender: CFGender
  day: number
  /** 1-12 */
  month: number
  /** anno a 4 cifre, es. 1990 */
  year: number
  /** codice catastale del comune (o stato estero) di nascita, es. 'H501' */
  birthplaceCode: string
}

export interface DecodedCodiceFiscale {
  gender: CFGender
  /** giorno di nascita 1-31 */
  day: number
  /** mese di nascita 1-12 */
  month: number
  /**
   * Anno di nascita a 4 cifre. Il CF codifica solo le ultime 2 cifre
   * dell'anno: la scelta tra secolo 1900/2000 è euristica (vedi
   * `resolveCentury`), quindi su date vicine al 1900 può essere sbagliata.
   */
  year: number
  birthplaceCode: string
}

const MONTH_LETTERS = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T']
const MONTH_LETTER_TO_NUMBER: Record<string, number> = MONTH_LETTERS.reduce(
  (acc, letter, index) => ({ ...acc, [letter]: index + 1 }),
  {}
)

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

// Tabella standard dell'algoritmo del carattere di controllo (fonte:
// specifica pubblica Agenzia delle Entrate). Valori fissi, non "magic
// numbers" arbitrari.
const ODD_POSITION_VALUES: Record<string, number> = {
  '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21,
  K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14,
  U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
}

const CF_FORMAT_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function onlyLetters(value: string): string {
  return stripAccents(value).toUpperCase().replace(/[^A-Z]/g, '')
}

function splitConsonantsVowels(value: string): { consonants: string[]; vowels: string[] } {
  const letters = onlyLetters(value).split('')
  const consonants: string[] = []
  const vowels: string[] = []
  for (const letter of letters) {
    if (VOWELS.has(letter)) vowels.push(letter)
    else consonants.push(letter)
  }
  return { consonants, vowels }
}

function padCode(chars: string[]): string {
  while (chars.length < 3) chars.push('X')
  return chars.slice(0, 3).join('')
}

/** Regola standard per il cognome: prime 3 consonanti, poi vocali, poi 'X'. */
function surnameCode(surname: string): string {
  const { consonants, vowels } = splitConsonantsVowels(surname)
  const chars = consonants.slice(0, 3)
  if (chars.length < 3) chars.push(...vowels.slice(0, 3 - chars.length))
  return padCode(chars)
}

/**
 * Regola standard per il nome: se le consonanti sono 4 o più si prendono
 * 1ª, 3ª e 4ª (non le prime 3) — unica asimmetria rispetto al cognome.
 * Sotto le 4 consonanti si comporta come il cognome.
 */
function nameCode(name: string): string {
  const { consonants, vowels } = splitConsonantsVowels(name)
  if (consonants.length >= 4) {
    return padCode([consonants[0], consonants[2], consonants[3]])
  }
  const chars = consonants.slice(0, 3)
  if (chars.length < 3) chars.push(...vowels.slice(0, 3 - chars.length))
  return padCode(chars)
}

function yearCode(year: number): string {
  return String(year).slice(-2).padStart(2, '0')
}

function monthCode(month: number): string {
  const letter = MONTH_LETTERS[month - 1]
  if (!letter) throw new Error(`Mese non valido: ${month}`)
  return letter
}

function dayCode(day: number, gender: CFGender): string {
  const value = gender === 'F' ? day + 40 : day
  return String(value).padStart(2, '0')
}

/** Carattere di controllo (16° carattere) sui primi 15 caratteri del CF. */
export function computeControlChar(first15Chars: string): string {
  if (first15Chars.length !== 15) {
    throw new Error(`computeControlChar richiede esattamente 15 caratteri, ricevuti ${first15Chars.length}`)
  }

  let sum = 0
  for (let i = 0; i < 15; i += 1) {
    const char = first15Chars[i]
    // Posizioni 1-indexed: dispari (1,3,5...) usano la tabella dedicata,
    // pari (2,4,6...) usano il valore "naturale" (0-9 per cifre, A=0..Z=25).
    const isOddPosition = i % 2 === 0
    if (isOddPosition) {
      const value = ODD_POSITION_VALUES[char]
      if (value === undefined) throw new Error(`Carattere non valido nel CF: '${char}'`)
      sum += value
    } else if (/[0-9]/.test(char)) {
      sum += Number(char)
    } else {
      sum += char.charCodeAt(0) - 65 // A=0 ... Z=25
    }
  }

  return String.fromCharCode(65 + (sum % 26))
}

/** Genera un Codice Fiscale completo (16 caratteri) dai dati anagrafici. */
export function VxGenerateFiscalCode(input: VxGenerateFiscalCodeInput): string {
  const first15 =
    surnameCode(input.surname) +
    nameCode(input.name) +
    yearCode(input.year) +
    monthCode(input.month) +
    dayCode(input.day, input.gender) +
    input.birthplaceCode.trim().toUpperCase().padEnd(4, '0').slice(0, 4)

  return first15 + computeControlChar(first15)
}

/** Verifica solo la forma (16 caratteri, pattern lettere/cifre corretto). */
export function VxIsValidFiscalCodeFormat(codiceFiscale: string): boolean {
  return CF_FORMAT_REGEX.test((codiceFiscale || '').toUpperCase().trim())
}

/** Verifica il carattere di controllo. Assume che il formato sia già valido. */
export function VxIsValidFiscalCodeChecksum(codiceFiscale: string): boolean {
  const cf = (codiceFiscale || '').toUpperCase().trim()
  if (!VxIsValidFiscalCodeFormat(cf)) return false
  return computeControlChar(cf.slice(0, 15)) === cf[15]
}

/** Verifica completa: formato + checksum. Equivalente a `CodiceFiscale.check()`. */
export function VxIsValidFiscalCode(codiceFiscale: string): boolean {
  return VxIsValidFiscalCodeFormat(codiceFiscale) && VxIsValidFiscalCodeChecksum(codiceFiscale)
}

/**
 * Sceglie il secolo (1900 vs 2000) per le 2 cifre di anno codificate nel CF,
 * preferendo l'anno più recente compatibile con "non nel futuro" e con
 * un'età plausibile (<=120 anni).
 */
function resolveCentury(twoDigitYear: number, referenceDate: Date = new Date()): number {
  const currentYear = referenceDate.getFullYear()
  const candidate2000 = 2000 + twoDigitYear
  const date2000 = new Date(candidate2000, 0, 1)
  if (date2000 <= referenceDate && currentYear - candidate2000 <= 120) return candidate2000
  return 1900 + twoDigitYear
}

/** Decodifica un CF sintatticamente valido in dati anagrafici parziali. */
export function VxDecodeFiscalCode(codiceFiscale: string, referenceDate: Date = new Date()): DecodedCodiceFiscale | null {
  const cf = (codiceFiscale || '').toUpperCase().trim()
  if (!VxIsValidFiscalCodeFormat(cf)) return null

  const twoDigitYear = parseInt(cf.slice(6, 8), 10)
  const monthLetter = cf.charAt(8)
  const month = MONTH_LETTER_TO_NUMBER[monthLetter]
  const rawDay = parseInt(cf.slice(9, 11), 10)

  if (!month || !Number.isFinite(twoDigitYear) || !Number.isFinite(rawDay)) return null

  const gender: CFGender = rawDay > 40 ? 'F' : 'M'
  const day = gender === 'F' ? rawDay - 40 : rawDay
  if (day < 1 || day > 31) return null

  return {
    gender,
    day,
    month,
    year: resolveCentury(twoDigitYear, referenceDate),
    birthplaceCode: cf.slice(11, 15),
  }
}

// ============================================================================
// 2) Hook Vue: valida un CF contro dati anagrafici completi
// ============================================================================

export type Gender = CFGender | null
export type InvalidField = 'name' | 'surname' | 'gender' | 'birthdayDate' | 'cf' | 'birthplace' | 'cfExists'

export interface FiscalCodeInput {
  name: string
  surname: string
  gender: Gender
  birthdayDate: Date
  codiceFiscale: string
  /** Codice catastale del comune di nascita (es. 'H501'), usato per il match col CF */
  birthplaceCode?: string
  /** Se true, chiama `checkExistsFn` (se fornito) per verificare duplicati */
  checkExists?: boolean
  /** Se true, respinge (solo con errore 'cf') i CF che corrispondono a un minorenne */
  requireAdult?: boolean
  /** Se true, salta le validazioni anagrafiche/di coerenza e verifica solo formato (+ requireAdult) */
  checkFormatOnly?: boolean
}

export interface VxUseFiscalCodeValidationOptions {
  /**
   * Verifica opzionale se il CF esiste già altrove (es. già registrato).
   * Chiamata solo se `checkExists: true` viene passato a `validate()`.
   * Deve risolvere a `true` se il CF esiste già (= errore), `false` se è
   * libero. Se non fornita, `checkExists` viene ignorato silenziosamente.
   */
  checkExistsFn?: (codiceFiscale: string) => Promise<boolean>
}

function isMinor(birthdayDate: Date, referenceDate: Date = new Date()): boolean {
  const age = referenceDate.getFullYear() - birthdayDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthdayDate.getMonth()
  const dayDiff = referenceDate.getDate() - birthdayDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) return age - 1 < 18
  return age < 18
}

export function VxUseFiscalCodeValidation(options: VxUseFiscalCodeValidationOptions = {}) {
  const error = ref<string | null>(null)
  const minor = ref<boolean>(false)

  async function validate({
    name,
    surname,
    gender,
    birthdayDate,
    codiceFiscale,
    birthplaceCode,
    checkExists = false,
    requireAdult = false,
    checkFormatOnly = false,
  }: FiscalCodeInput): Promise<InvalidField[]> {
    minor.value = false
    const cf = (codiceFiscale || '').toUpperCase().trim()

    // 1. Formato di base
    if (!VxIsValidFiscalCodeFormat(cf)) {
      error.value = 'Codice fiscale non valido'
      return ['cf']
    }

    // 2. Duplicati (solo se richiesto e se è stata iniettata una funzione)
    if (checkExists && options.checkExistsFn) {
      try {
        const exists = await options.checkExistsFn(cf)
        if (exists) {
          error.value = 'Codice fiscale già registrato nel sistema'
          return ['cfExists']
        }
      } catch (e) {
        console.warn('checkExistsFn error (ignorato, si prosegue con la validazione locale):', e)
      }
    }

    // 3. Checksum
    if (!VxIsValidFiscalCodeChecksum(cf)) {
      error.value = 'Codice fiscale non valido'
      return ['cf']
    }

    // 4. requireAdult: decodifica la data di nascita dal CF stesso.
    if (requireAdult) {
      const decoded = VxDecodeFiscalCode(cf)
      if (decoded && isMinor(new Date(decoded.year, decoded.month - 1, decoded.day))) {
        minor.value = true
        error.value = 'minorUserNotAllowed'
        return ['cf']
      }
    }

    if (checkFormatOnly) return []

    const invalidFields: InvalidField[] = []

    // 5. Luogo di nascita: confronto diretto col codice catastale nel CF
    if (birthplaceCode?.trim()) {
      const cfBirthplace = cf.slice(11, 15)
      if (cfBirthplace !== birthplaceCode.trim().toUpperCase().slice(0, 4)) {
        invalidFields.push('birthplace')
      }
    }

    // 6. Dati anagrafici obbligatori
    if (!name?.trim() || !surname?.trim() || !birthdayDate || (gender !== 'M' && gender !== 'F') || !birthplaceCode?.trim()) {
      if (!name?.trim()) invalidFields.push('name')
      if (!surname?.trim()) invalidFields.push('surname')
      if (gender !== 'M' && gender !== 'F') invalidFields.push('gender')
      if (!birthdayDate) invalidFields.push('birthdayDate')
      if (!birthplaceCode?.trim()) invalidFields.push('birthplace')
      error.value = 'Dati mancanti o non validi'
      return [...new Set(invalidFields)]
    }

    // 7. Coerenza CF <-> dati anagrafici: rigenera il CF atteso dai dati
    // forniti e confronta blocco per blocco.
    try {
      const expected = VxGenerateFiscalCode({
        name: name.trim(),
        surname: surname.trim(),
        gender: gender as CFGender,
        day: birthdayDate.getDate(),
        month: birthdayDate.getMonth() + 1,
        year: birthdayDate.getFullYear(),
        birthplaceCode: birthplaceCode.trim(),
      })

      if (cf.slice(0, 3) !== expected.slice(0, 3)) invalidFields.push('surname')
      if (cf.slice(3, 6) !== expected.slice(3, 6)) invalidFields.push('name')
      if (cf.slice(6, 8) !== expected.slice(6, 8)) invalidFields.push('birthdayDate')
      if (cf.slice(8, 9) !== expected.slice(8, 9)) invalidFields.push('birthdayDate')

      if (cf.slice(9, 11) !== expected.slice(9, 11)) {
        const oppositeGender: CFGender = gender === 'M' ? 'F' : 'M'
        const cfOpposite = VxGenerateFiscalCode({
          name: name.trim(),
          surname: surname.trim(),
          gender: oppositeGender,
          day: birthdayDate.getDate(),
          month: birthdayDate.getMonth() + 1,
          year: birthdayDate.getFullYear(),
          birthplaceCode: birthplaceCode.trim(),
        })
        if (cf.slice(9, 11) === cfOpposite.slice(9, 11)) invalidFields.push('gender')
        else invalidFields.push('birthdayDate')
      }
    } catch (e) {
      error.value = 'Errore nella validazione del codice fiscale'
      return ['cf']
    }

    const uniqueInvalidFields = [...new Set(invalidFields)]

    if (uniqueInvalidFields.length === 0) {
      minor.value = isMinor(birthdayDate)
    }

    error.value = uniqueInvalidFields.length ? 'Campi non validi' : null
    return uniqueInvalidFields
  }

  return { validate, error, minor }
}