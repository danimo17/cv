// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { lineOf, readText, repoFiles } from './support/repo-files'

// Rule 15 (decision 041): zero lint/type suppressions outside tests/ and e2e/. `.claude/` is skipped
// because its docs and hooks quote these directives while describing the rule.
const SUPPRESSION = /eslint-(?:disable|enable)|@ts-expect-error|@ts-ignore|@ts-nocheck/g
const EXEMPT_PREFIXES = ['tests/', 'e2e/', '.claude/']

function scannedFiles(): string[] {
  return repoFiles().filter(
    (file) =>
      !EXEMPT_PREFIXES.some((prefix) => file.startsWith(prefix)) && file !== 'pnpm-lock.yaml'
  )
}

describe('rule 15: zero suppressions', () => {
  it('no lint or type suppressions outside tests', () => {
    const files = scannedFiles()
    expect(files.length).toBeGreaterThan(100)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of text.matchAll(SUPPRESSION)) {
        violations.push(`${file}:${lineOf(text, hit.index)} ${hit[0]}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('the suppression pattern matches every directive the rule forbids', () => {
    const forbidden = [
      '// eslint-disable-next-line no-console',
      '/* eslint-disable */',
      '<!-- eslint-disable vue/no-v-html -->',
      '// @ts-expect-error',
      '// @ts-ignore',
      '// @ts-nocheck',
    ]
    for (const sample of forbidden) {
      expect(sample.match(SUPPRESSION), sample).not.toBeNull()
    }
  })
})
