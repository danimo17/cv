// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const LOCALES_DIR = join(process.cwd(), 'i18n', 'locales')
const BASE = 'en'
const OTHERS = ['ca', 'es'] as const

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

function flatten(value: Json, prefix = '', out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out))
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
    }
  } else {
    out.push(prefix)
  }
  return out
}

function keysOf(locale: string): Set<string> {
  const file = join(LOCALES_DIR, `${locale}.json`)
  expect(existsSync(file), `missing locale file ${file}`).toBe(true)
  const json = JSON.parse(readFileSync(file, 'utf8')) as Json
  return new Set(flatten(json))
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((k) => !b.has(k)).sort()
}

describe('i18n locale parity', () => {
  const base = keysOf(BASE)

  it('en has keys', () => {
    expect(base.size).toBeGreaterThan(0)
  })

  it.each(OTHERS)('%s has exactly the same keys as en', (locale) => {
    const keys = keysOf(locale)
    const missing = diff(base, keys)
    const extra = diff(keys, base)
    const message = [
      `${locale}.json is out of sync with en.json`,
      missing.length ? `missing (${missing.length}):\n  ${missing.join('\n  ')}` : '',
      extra.length ? `extra (${extra.length}):\n  ${extra.join('\n  ')}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    expect(missing.length + extra.length, message).toBe(0)
  })

  it.each(OTHERS)('%s has no empty strings', (locale) => {
    const file = join(LOCALES_DIR, `${locale}.json`)
    const json = JSON.parse(readFileSync(file, 'utf8')) as Json
    const empty: string[] = []
    const walk = (value: Json, path: string) => {
      if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
      else if (value !== null && typeof value === 'object')
        Object.entries(value).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k))
      else if (typeof value === 'string' && value.trim() === '') empty.push(path)
    }
    walk(json, '')
    expect(empty, `${locale}.json has empty values: ${empty.join(', ')}`).toEqual([])
  })
})
