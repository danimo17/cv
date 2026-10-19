// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readText, repoFiles } from './support/repo-files'

const FILES = repoFiles()

// Rule 13 (decision 040, decision 060): everything outside i18n/locales is English. A line is flagged when it
// has (1) a Catalan/Spanish letter (c-cedilla, n-tilde, inverted punctuation, l-middle-dot-l, accented vowel) or
// (2) at least two DISTINCT words from a curated Catalan/Spanish stopword list. The list holds only function
// words that are not English words and are not locale codes (no "no", "per", "en", "es", "ca", "con", "sin"),
// and no content words: an unaccented Catalan or Spanish sentence is caught by its function words, an English
// line that happens to hold one foreign word is not. This stays a heuristic (see decision 060).
const SPANISH_CATALAN_LETTERS = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿ¿¡]|l·l/i
const STOPWORDS = new Set(
  (
    'de la el los las les del dels una uns unes amb els però pero també también això aquest aquesta ' +
    'aquests aquestes perquè porque quan cuando hasta desde muy més más estos estas entre sobre ' +
    'además tiene hace doncs encara només mateix mateixa dins durant'
  ).split(' ')
)
const STOPWORD_THRESHOLD = 2
const WORD = /[\p{L}\p{N}_]+/gu

// The spec holds the word list and the fixtures it detects, so it is the one whole-file exception.
const ALLOWED_FILES: Record<string, string> = {
  'tests/arch/language.spec.ts':
    'defines the stopword list and the Catalan/Spanish fixtures it detects',
}

// Per-token allowlist: only these exact strings are masked in the named files before a line is analyzed, so
// any new prose in the same file or on the same line is still checked. Each entry carries its reason.
// More than ten entries means the heuristic needs rethinking (decision 060).
interface AllowedTokens {
  files: string[]
  tokens: string[]
  reason: string
}
const ALLOWED_TOKENS: AllowedTokens[] = [
  {
    files: [
      'nuxt.config.ts',
      '.claude/docs/decisions/043-locale-switcher-dropdown.md',
      '.claude/docs/decisions/060-arch-rule-gates.md',
    ],
    tokens: ['Català', 'Español'],
    reason: 'native language names shown by the locale switcher (decision 060 names them)',
  },
  {
    files: ['.claude/docs/decisions/040-english-only.md'],
    tokens: ['[àèéíòóúçïü]'],
    reason: 'the accented-vowel character class of the grep used for the inventory',
  },
  {
    files: ['app/data/cv/education.ts'],
    tokens: [
      'Escola Universitària ERAM · Universitat de Girona',
      'Fundación Esplai',
      'IES Frederic Martí',
      'Amaltea Consultoría',
    ],
    reason: 'CV data table: proper names of schools and organizations',
  },
  {
    files: ['app/data/cv/experience.ts'],
    tokens: ["La Bisbal d'Empordà"],
    reason: 'CV data table: proper name of a place',
  },
]
const MAX_ALLOWLIST_ENTRIES = 10

function isScanned(file: string): boolean {
  return !file.startsWith('i18n/locales/') && file !== 'pnpm-lock.yaml' && !(file in ALLOWED_FILES)
}

function maskAllowedTokens(file: string, line: string): string {
  let masked = line
  for (const entry of ALLOWED_TOKENS) {
    if (!entry.files.includes(file)) continue
    for (const token of entry.tokens) masked = masked.split(token).join(' '.repeat(token.length))
  }
  return masked
}

function findNonEnglish(text: string, file = ''): Array<{ line: number; reason: string }> {
  const hits: Array<{ line: number; reason: string }> = []
  text.split('\n').forEach((raw, index) => {
    const line = index + 1
    const content = maskAllowedTokens(file, raw)
    const letter = SPANISH_CATALAN_LETTERS.exec(content)
    if (letter) hits.push({ line, reason: `letter "${letter[0]}"` })
    const found = new Set<string>()
    for (const match of content.toLowerCase().matchAll(WORD)) {
      if (STOPWORDS.has(match[0])) found.add(match[0])
    }
    if (found.size >= STOPWORD_THRESHOLD) {
      hits.push({ line, reason: `Catalan/Spanish function words: ${[...found].join(', ')}` })
    }
  })
  return hits
}

describe('rule 13: everything is English', () => {
  it('files outside i18n locales are English', () => {
    const files = FILES.filter(isScanned)
    expect(files.length).toBeGreaterThan(150)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of findNonEnglish(text, file)) {
        violations.push(`${file}:${hit.line} ${hit.reason}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('the language heuristics flag Catalan and Spanish letters and function words', () => {
    expect(findNonEnglish('El año pasado').map((hit) => hit.reason)).toEqual(['letter "ñ"'])
    expect(findNonEnglish('Això és un test').length).toBeGreaterThan(0)
    expect(findNonEnglish('Pero cuando termina')).toHaveLength(1)
    expect(findNonEnglish('La base de la gate')).toHaveLength(1)
    expect(findNonEnglish('The user wants a simple, native, em dash — and a café.')).toHaveLength(1)
  })

  it('an unaccented Catalan sentence is still caught by its function words', () => {
    const hits = findNonEnglish('Aquesta funcio comprova que els fitxers tenen les regles')
    expect(hits.map((hit) => hit.reason)).toEqual([
      'Catalan/Spanish function words: aquesta, els, les',
    ])
  })

  it('English false positives stay unflagged', () => {
    const english = [
      'Tens of thousands of users read this page.',
      'const para = paragraphs.length',
      'The fins of the fish and the hem of the dress',
      'const que = new Queue()',
      'A lone foreign word such as cuando in an English sentence is not enough.',
      'This makes sense: a plain English sentence, i = 0.',
      'Supports ca, es and en locales (no per-locale files).',
    ]
    for (const line of english) expect(findNonEnglish(line), line).toEqual([])
  })

  it('an allowlisted proper name is masked but new prose around it is still flagged', () => {
    const file = 'app/data/cv/education.ts'
    expect(findNonEnglish("org: 'Fundación Esplai',", file)).toEqual([])
    expect(findNonEnglish("org: 'Fundación Esplai',", 'app/data/cv/experience.ts')).toHaveLength(1)
    expect(findNonEnglish("org: 'Fundación Esplai', note: 'Això és un test'", file)).toHaveLength(1)
    expect(findNonEnglish("note: 'Pero cuando termina'", file)).toHaveLength(1)
    expect(findNonEnglish('Escola Universitària ERAM · Universitat de Girona', file)).toEqual([])
  })

  it('the allowlist stays small, justified and tied to text that still exists', () => {
    expect(ALLOWED_TOKENS.length + Object.keys(ALLOWED_FILES).length).toBeLessThanOrEqual(
      MAX_ALLOWLIST_ENTRIES
    )
    for (const [file, reason] of Object.entries(ALLOWED_FILES)) {
      expect(reason.length, file).toBeGreaterThan(10)
      expect(FILES, file).toContain(file)
    }
    for (const entry of ALLOWED_TOKENS) {
      expect(entry.reason.length, entry.files.join()).toBeGreaterThan(10)
      for (const file of entry.files) {
        const text = readText(file) ?? ''
        for (const token of entry.tokens)
          expect(text, `${file} still has ${token}`).toContain(token)
      }
    }
  })
})
