// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Rule 20 and its companions: the text that makes a public-surface change update every reference, and that
// makes the scope of a shared-component change a question asked before the contract, not a surprise after.

const ROOT = process.cwd()
const CLAUDE = join(ROOT, '.claude')
const RULES = join(CLAUDE, 'rules')
const RULE_20 = join(RULES, '20-synchronized-change.md')
const RULE_12 = join(RULES, '12-orchestration.md')
const RULE_11 = join(RULES, '11-directives.md')
const HARD_RULES = join(CLAUDE, 'hard-rules.md')
const CONTRACT_TEMPLATE = join(CLAUDE, 'templates', 'contract.md')
const WORKFLOW = join(CLAUDE, 'workflow.md')
const CATALOG = join(CLAUDE, 'docs', 'catalog', 'ai-workflow.md')

function read(file: string): string {
  expect(existsSync(file), `missing ${file}`).toBe(true)
  return readFileSync(file, 'utf8')
}

function flat(text: string): string {
  return text.replace(/\s+/g, ' ')
}

function section(text: string, heading: string): string {
  const start = text.indexOf(heading)
  expect(start, `missing section ${heading}`).toBeGreaterThanOrEqual(0)
  const rest = text.slice(start + heading.length)
  const next = rest.search(/^## /m)
  return next === -1 ? rest : rest.slice(0, next)
}

describe('rule 20 and the shared component scope question', () => {
  it('rule 20 exists in hard-rules and rules and names its spec', () => {
    const rule = flat(read(RULE_20))
    for (const part of ['**What.**', '**Why.**', '**How to apply.**', "**How it's checked.**"]) {
      expect(rule, `rule 20 part ${part}`).toContain(part)
    }
    expect(rule).toMatch(/public surface/i)
    expect(rule).toMatch(/data-testid/)
    expect(rule).toMatch(/catalog/i)
    expect(rule).toMatch(/unit and e2e/i)
    expect(rule).toMatch(/same change/i)
    expect(rule).toContain('tests/arch/no-orphan-testids.spec.ts')

    const row = read(HARD_RULES)
      .split('\n')
      .find((line) => /^\|\s*20\s*\|/.test(line))
    expect(row, 'hard-rules.md has no row 20').toBeDefined()
    const cells = (row as string).split('|').map((cell) => cell.trim())
    const summary = cells[2] as string
    expect(summary.length, 'row 20 summary stays short').toBeLessThanOrEqual(250)
    expect(summary).toMatch(/public surface/i)
    expect(summary).toMatch(/same change/i)
    expect(cells[3]).toContain('no-orphan-testids.spec.ts')
  })

  it('rule 12 brief requires a repo-wide reference grep', () => {
    const rule = flat(read(RULE_12))
    const line = rule
      .split(/(?<=\.)\s+(?=[A-Z*])/)
      .find((sentence) => /removes or renames/i.test(sentence))
    expect(line, 'rule 12 has no removes-or-renames brief line').toBeDefined()
    expect(line).toMatch(/grep/i)
    for (const place of ['`app/`', '`tests/`', '`e2e/`', '`.claude/docs/`']) {
      expect(line, `rule 12 brief line names ${place}`).toContain(place)
    }
    expect(line).toMatch(/every reference/i)
    expect(line).toMatch(/same change/i)
  })

  it('contract template and workflow require the shared component consumers question', () => {
    const template = read(CONTRACT_TEMPLATE)
    const consumers = flat(section(template, '## Shared component consumers'))
    expect(consumers).toMatch(/grep/i)
    expect(consumers).toMatch(/only here/i)
    expect(consumers).toMatch(/everywhere/i)

    const workflow = flat(read(WORKFLOW))
    const contractStep = workflow.slice(
      workflow.indexOf('2. **Contract**'),
      workflow.indexOf('3. **Build / iterate**')
    )
    expect(contractStep).toMatch(/app\/components\/shared\//)
    expect(contractStep).toMatch(/more than one parent/i)
    expect(contractStep).toMatch(/ask/i)
    expect(contractStep).toContain('Shared component consumers')
    const storyStep = workflow.slice(
      workflow.indexOf('1. **Story**'),
      workflow.indexOf('2. **Contract**')
    )
    expect(storyStep).toMatch(/shared component/i)

    expect(flat(read(RULE_11))).toContain('Shared component consumers')
  })

  it('the catalog documents rule 20 and the orphan specs', () => {
    const catalog = flat(read(CATALOG))
    expect(catalog).toContain('tests/arch/no-orphan-testids.spec.ts')
    expect(catalog).toContain('tests/arch/orphan-refs-docs.spec.ts')
    expect(catalog).toMatch(/rule 20/i)
    expect(catalog).toContain('Shared component consumers')
  })
})
