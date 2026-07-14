export const setupCode = `import { VxGenerateFiscalCode, VxIsValidFiscalCode, VxUseFiscalCodeValidation } from '@vexus'`

export const generateCode = `import { VxGenerateFiscalCode } from '@vexus'

const cf = VxGenerateFiscalCode({
  name: 'Mario',
  surname: 'Rossi',
  gender: 'M',
  day: 15,
  month: 4,
  year: 1990,
  birthplaceCode: 'H501', // Roma
})

// cf === 'RSSMRA90D15H501U'`

export const validateFormatCode = `import { VxIsValidFiscalCodeFormat, VxIsValidFiscalCodeChecksum, VxIsValidFiscalCode } from '@vexus'

VxIsValidFiscalCodeFormat('RSSMRA90D15H501U')   // true: 16 caratteri, pattern corretto
VxIsValidFiscalCodeChecksum('RSSMRA90D15H501U') // true: il 16° carattere torna
VxIsValidFiscalCode('RSSMRA90D15H501U')          // true: entrambe le verifiche insieme

VxIsValidFiscalCode('RSSMRA90D15H501X') // false: checksum sbagliato`

export const decodeCode = `import { VxDecodeFiscalCode } from '@vexus'

const decoded = VxDecodeFiscalCode('RSSMRA90D15H501U')

// decoded = {
//   gender: 'M',
//   day: 15,
//   month: 4,
//   year: 1990,
//   birthplaceCode: 'H501',
// }

// Su un CF con formato non valido, ritorna null
VxDecodeFiscalCode('non-un-cf') // null`

export const hookBasicCode = `import { VxUseFiscalCodeValidation } from '@vexus'

const { validate, error, minor } = VxUseFiscalCodeValidation()

const invalidFields = await validate({
  name: 'Mario',
  surname: 'Rossi',
  gender: 'M',
  birthdayDate: new Date(1990, 3, 15),
  codiceFiscale: 'RSSMRA90D15H501U',
  birthplaceCode: 'H501',
})

// invalidFields === []  (nessun errore)
// error.value === null
// minor.value === false`

export const hookExistsCode = `import { VxUseFiscalCodeValidation } from '@vexus'

// L'hook non fa ipotesi sul networking del progetto: la verifica di
// esistenza è iniettata da chi lo usa.
const { validate, error } = VxUseFiscalCodeValidation({
  checkExistsFn: async (cf) => {
    const res = await fetch(\`/api/customers/\${cf}/check\`)
    return res.ok
  },
})

const invalidFields = await validate({
  // ...dati anagrafici
  codiceFiscale: 'RSSMRA90D15H501U',
  checkExists: true,
})

// invalidFields === ['cfExists'] se il CF risulta già registrato`

export const hookRequireAdultCode = `const invalidFields = await validate({
  name: 'Mario',
  surname: 'Rossi',
  gender: 'M',
  birthdayDate: new Date(2015, 3, 15), // minorenne
  codiceFiscale: 'RSSMRA15D15H501X',
  birthplaceCode: 'H501',
  requireAdult: true,
})

// invalidFields === ['cf']
// error.value === 'minorUserNotAllowed'
// minor.value === true`