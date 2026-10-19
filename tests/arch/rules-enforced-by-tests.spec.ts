// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

// Rule file -> the specs its "How it's checked" paragraph must name (rule 19: an ensure is a gate).
const ENFORCED_BY: Record<string, string[]> = {
  '02-no-company-code.md': ['tests/arch/no-internal-resources.spec.ts'],
  '13-language-english.md': ['tests/arch/language.spec.ts'],
  '14-no-code-comments.md': ['tests/arch/no-code-comments.spec.ts'],
  '15-zero-lint-suppressions.md': ['tests/arch/no-lint-suppressions.spec.ts'],
}

function howItsChecked(ruleFile: string): string {
  const text = readFileSync(join(ROOT, '.claude', 'rules', ruleFile), 'utf8')
  const start = text.indexOf("**How it's checked.**")
  expect(start, `${ruleFile} has a "How it's checked" paragraph`).toBeGreaterThanOrEqual(0)
  const end = text.indexOf('\n\n', start)
  return text.slice(start, end === -1 ? undefined : end)
}

function backlogStatus(slug: string): string | undefined {
  const row = readFileSync(join(ROOT, '.claude', 'backlog.md'), 'utf8')
    .split('\n')
    .find((line) => line.startsWith(`| ${slug} `))
  return row?.split('|')[3]?.trim()
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

  it('the hard-rules table and the backlog agree that these rules are enforced by specs', () => {
    const table = readFileSync(join(ROOT, '.claude', 'hard-rules.md'), 'utf8')
    for (const specs of Object.values(ENFORCED_BY)) {
      for (const spec of specs) expect(table, spec).toContain(spec)
    }
    expect(backlogStatus('arch-no-comments-no-suppressions')).toBe('done')
  })
})
