// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PDFParse } from 'pdf-parse'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
// No line breaks: '2021 - 2022' + '(11 months)' on the next line is not a phone number.
const PHONE = /\+?\d[\d \t().-]{6,}\d/g
const POSTAL_CODE = '17820'
const MIN_DIGITS = 9

function findPii(text: string): string[] {
  const hits: string[] = []
  for (const m of text.matchAll(PHONE)) {
    const digits = m[0].replace(/\D/g, '')
    if (digits.length >= MIN_DIGITS) hits.push(`phone-like "${m[0].trim()}"`)
  }
  if (text.includes(POSTAL_CODE)) hits.push(`postal code ${POSTAL_CODE}`)
  return hits
}

function textSources(): Array<{ label: string; text: string }> {
  // Data layer (decision 029): app/data/cv/*.ts
  const dataDir = join(ROOT, 'app', 'data', 'cv')
  const data = readdirSync(dataDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ label: `app/data/cv/${f}`, text: readFileSync(join(dataDir, f), 'utf8') }))
  const localesDir = join(ROOT, 'i18n', 'locales')
  const locales = existsSync(localesDir)
    ? readdirSync(localesDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => ({
          label: `i18n/locales/${f}`,
          text: readFileSync(join(localesDir, f), 'utf8'),
        }))
    : []
  return [...data, ...locales]
}

function pdfFiles(): string[] {
  const dir = join(ROOT, 'public', 'cv')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => join(dir, f))
}

// pdf-parse reads the real text layer (subset and CID fonts included): this is what bots index.
async function pdfText(file: string): Promise<string> {
  const parser = new PDFParse({ data: readFileSync(file) })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

describe('no personal contact data (regla 04)', () => {
  it.each(textSources())('$label contains no phone number or postal code', ({ text }) => {
    const hits = findPii(text)
    expect(hits, hits.join('; ')).toEqual([])
  })

  const pdfs = pdfFiles()

  if (pdfs.length === 0) {
    it('no PDFs to scan yet (public/cv is empty)', () => {
      expect(pdfs).toEqual([])
    })
  } else {
    it.each(pdfs)('%s contains no phone number or postal code', async (file) => {
      const text = await pdfText(file)
      expect(text.length, 'the PDF must have a text layer').toBeGreaterThan(200)
      const hits = findPii(text)
      expect(hits, hits.join('; ')).toEqual([])
    })
  }
})
