// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { lineOf, readText, repoFiles } from './support/repo-files'

const FILES = repoFiles()

// Rule 15 (decision 041, decision 060): zero lint/type suppressions anywhere. Tests and e2e are scanned too
// (only rule 14 grants them a comment exception, not rule 15). The one exemption is documentation prose under
// `.claude/` (markdown files that quote the directives while describing the rule); `.claude/hooks`, JSON and
// every other file type there are scanned. This spec builds its own samples from fragments, so it needs no
// exemption: no test file is exempt.
const DIRECTIVES = [
  'eslint-(?:disable|enable)',
  '@ts-' + 'expect-error',
  '@ts-' + 'ignore',
  '@ts-' + 'nocheck',
]
const SUPPRESSION = new RegExp(DIRECTIVES.join('|'), 'g')
const DOC_PROSE = /^\.claude\/.*\.md$/

function isScanned(file: string): boolean {
  return file !== 'pnpm-lock.yaml' && !DOC_PROSE.test(file)
}

function findSuppressions(text: string): Array<{ line: number; directive: string }> {
  return [...text.matchAll(SUPPRESSION)].map((hit) => ({
    line: lineOf(text, hit.index),
    directive: hit[0],
  }))
}

const SAMPLE_PREFIX = ['// ', '/* ', '<!-- ']
const SAMPLE_DIRECTIVES = [
  ['eslint', 'disable-next-line no-console'],
  ['eslint', 'disable'],
  ['eslint', 'enable'],
  ['@ts', 'expect-error'],
  ['@ts', 'ignore'],
  ['@ts', 'nocheck'],
].map(([head, tail]) => `${head}-${tail}`)

describe('rule 15: zero suppressions', () => {
  it('no lint or type suppressions anywhere', () => {
    const files = FILES.filter(isScanned)
    expect(files.length).toBeGreaterThan(100)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of findSuppressions(text)) {
        violations.push(`${file}:${hit.line} ${hit.directive}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('the suppression pattern matches every directive the rule forbids', () => {
    for (const prefix of SAMPLE_PREFIX) {
      for (const directive of SAMPLE_DIRECTIVES) {
        const sample = `${prefix}${directive}`
        expect(findSuppressions(sample), sample).toHaveLength(1)
      }
    }
  })

  it('tests and e2e are scanned and only .claude markdown prose is exempt', () => {
    expect(FILES.some((file) => file.startsWith('tests/') && isScanned(file))).toBe(true)
    expect(FILES.some((file) => file.startsWith('e2e/') && isScanned(file))).toBe(true)
    expect(isScanned('tests/arch/require-contract-hook.spec.ts')).toBe(true)
    expect(isScanned('tests/arch/no-lint-suppressions.spec.ts')).toBe(true)
    expect(isScanned('e2e/meme-flow.spec.ts')).toBe(true)
    expect(isScanned('.claude/hooks/require-contract.py')).toBe(true)
    expect(isScanned('.claude/settings.json')).toBe(true)
    expect(isScanned('.claude/rules/15-zero-lint-suppressions.md')).toBe(false)
    expect(isScanned('docs/guide.md')).toBe(true)
  })

  it('this spec holds no directive of its own', () => {
    const own = readText('tests/arch/no-lint-suppressions.spec.ts') ?? ''
    expect(findSuppressions(own)).toEqual([])
  })
})
