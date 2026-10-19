// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readText, repoFiles } from './support/repo-files'

// Rule 13 (decision 040): everything outside i18n/locales is English. Three heuristics, no dictionary:
// 1. Catalan/Spanish letters (c-cedilla, n-tilde, inverted punctuation, l-middle-dot-l, accented vowels).
// 2. Words that exist in Catalan/Spanish and not in English: one hit in a line is enough.
// 3. Short function words shared by both languages (articles, prepositions): three in one line is enough.
const SPANISH_CATALAN_LETTERS = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿ¿¡]|l·l/i
const NON_ENGLISH_WORDS = new Set(
  (
    'amb els perquè però també això aquest aquesta aquests aquestes fins hem són està estan ' +
    'que pero también porque cuando hasta para qué más está estos estas sobre entre además ' +
    'dels mateix mateixa tots totes tinc tens tenim fer fet feta regla regles lògica logica ' +
    'cobreix arriben verd desplega'
  ).split(' ')
)
const FUNCTION_WORDS = new Set('de la el les los las del una amb per'.split(' '))
const FUNCTION_WORDS_THRESHOLD = 3
const WORD = /[\p{L}\p{N}_]+/gu

// Whole-file allowlist: `file` -> why non-English text is legitimate there. Kept short on purpose; more
// than ten entries means the heuristics need rethinking (see decision 059).
const ALLOWED_FILES: Record<string, string> = {
  'tests/arch/language.spec.ts': 'defines the non-English word lists it searches for',
  '.claude/docs/decisions/040-english-only.md':
    'quotes the accented-vowel grep used for the inventory',
  '.claude/docs/decisions/043-locale-switcher-dropdown.md':
    'names the native language labels (Català, Español) shown by the switcher',
  'nuxt.config.ts': 'the locale registry holds the native language names (Català, Español)',
  'app/data/cv/education.ts': 'CV data table: proper names of schools and organizations',
  'app/data/cv/experience.ts': 'CV data table: proper name of a place',
}

function isScanned(file: string): boolean {
  return !file.startsWith('i18n/locales/') && file !== 'pnpm-lock.yaml' && !(file in ALLOWED_FILES)
}

export function findNonEnglish(text: string): Array<{ line: number; reason: string }> {
  const hits: Array<{ line: number; reason: string }> = []
  text.split('\n').forEach((content, index) => {
    const line = index + 1
    const letter = SPANISH_CATALAN_LETTERS.exec(content)
    if (letter) hits.push({ line, reason: `letter "${letter[0]}"` })
    let functionWords = 0
    for (const match of content.toLowerCase().matchAll(WORD)) {
      const word = match[0]
      if (NON_ENGLISH_WORDS.has(word)) hits.push({ line, reason: `word "${word}"` })
      if (FUNCTION_WORDS.has(word)) functionWords++
    }
    if (functionWords >= FUNCTION_WORDS_THRESHOLD) {
      hits.push({ line, reason: `${functionWords} Catalan/Spanish function words` })
    }
  })
  return hits
}

describe('rule 13: everything is English', () => {
  it('files outside i18n locales are English', () => {
    const files = repoFiles().filter(isScanned)
    expect(files.length).toBeGreaterThan(150)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of findNonEnglish(text)) {
        violations.push(`${file}:${hit.line} ${hit.reason}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('the language heuristics flag Catalan and Spanish and let English through', () => {
    expect(findNonEnglish('Regla 09: cap push build').map((hit) => hit.reason)).toEqual([
      'word "regla"',
    ])
    expect(findNonEnglish('El año pasado').map((hit) => hit.reason)).toEqual(['letter "ñ"'])
    expect(findNonEnglish('Això és un test').length).toBeGreaterThan(0)
    expect(findNonEnglish('Quiero saber cuando termina')).toHaveLength(1)
    expect(findNonEnglish('La logica es a la base de la gate')).toHaveLength(2)
    expect(findNonEnglish('The user wants a simple, native, em dash — and a café.')).toHaveLength(1)
    expect(findNonEnglish('This makes sense: a plain English sentence, i = 0.')).toEqual([])
  })

  it('the whole-file allowlist stays small and every entry has a reason', () => {
    const entries = Object.entries(ALLOWED_FILES)
    expect(entries.length).toBeLessThanOrEqual(10)
    for (const [file, reason] of entries) {
      expect(reason.length, file).toBeGreaterThan(10)
      expect(repoFiles(), file).toContain(file)
    }
  })
})
