// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ROOT } from './support/repo-files'

// Rule file -> the specs its "How it's checked" paragraph and its hard-rules.md row must name (rule 19: an
// ensure is a gate).
const ENFORCED_BY: Record<string, string[]> = {
  '02-no-company-code.md': ['tests/arch/no-internal-resources.spec.ts'],
  '13-language-english.md': ['tests/arch/language.spec.ts'],
  '14-no-code-comments.md': ['tests/arch/no-code-comments.spec.ts'],
  '15-zero-lint-suppressions.md': ['tests/arch/no-lint-suppressions.spec.ts'],
}

function ruleNumber(ruleFile: string): string {
  return ruleFile.slice(0, 2)
}

function howItsChecked(ruleFile: string): string {
  const text = readFileSync(join(ROOT, '.claude', 'rules', ruleFile), 'utf8')
  const start = text.indexOf("**How it's checked.**")
  expect(start, `${ruleFile} has a "How it's checked" paragraph`).toBeGreaterThanOrEqual(0)
  const end = text.indexOf('\n\n', start)
  return text.slice(start, end === -1 ? undefined : end)
}

function hardRulesRow(table: string, number: string): string | undefined {
  return table.split('\n').find((line) => line.startsWith(`| ${number} `))
}

describe('rules enforced by tests', () => {
  it('rules 02, 13, 14 and 15 name the spec that enforces them', () => {
    for (const [ruleFile, specs] of Object.entries(ENFORCED_BY)) {
      const paragraph = howItsChecked(ruleFile)
      for (const spec of specs) {
        expect(paragraph, `${ruleFile} names ${spec}`).toContain(spec)
        expect(existsSync(join(ROOT, spec)), `${spec} exists`).toBe(true)
      }
      expect(paragraph, `${ruleFile} is no longer "consider"/"backlog" only`).not.toMatch(
        /consider|tracked as a backlog/i
      )
    }
  })

  it("each rule's own hard-rules.md row names the same spec", () => {
    const table = readFileSync(join(ROOT, '.claude', 'hard-rules.md'), 'utf8')
    for (const [ruleFile, specs] of Object.entries(ENFORCED_BY)) {
      const row = hardRulesRow(table, ruleNumber(ruleFile))
      expect(row, `${ruleFile} has a row in hard-rules.md`).toBeDefined()
      for (const spec of specs) expect(row, `${ruleFile} row names ${spec}`).toContain(spec)
    }
  })

  it('a spec named only in another rule row does not count for this rule', () => {
    const table = [
      '| 13  | English | `tests/arch/language.spec.ts` |',
      '| 14  | No comments | human review |',
    ].join('\n')
    expect(hardRulesRow(table, '13')).toContain('tests/arch/language.spec.ts')
    expect(hardRulesRow(table, '14')).not.toContain('tests/arch/language.spec.ts')
    expect(hardRulesRow(table, '15')).toBeUndefined()
  })
})
