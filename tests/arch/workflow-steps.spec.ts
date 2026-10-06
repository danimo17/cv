// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const CLAUDE = join(ROOT, '.claude')
const STEPS_FILE = join(CLAUDE, 'workflow-steps.json')
const WORKFLOW = join(CLAUDE, 'workflow.md')
const HANDOFF_TEMPLATE = join(CLAUDE, 'templates', 'handoff.md')
const CLOSE_TEMPLATE = join(CLAUDE, 'templates', 'close-checklist.md')
const DECISIONS_DIR = join(CLAUDE, 'docs', 'decisions')
const CATALOG = join(CLAUDE, 'docs', 'catalog', 'ai-workflow.md')
const GATE_SCRIPT = 'require-contract.py'
const PRE_COMMIT_HOOK = join(ROOT, '.githooks', 'pre-commit')
const PRE_PUSH_HOOK = join(ROOT, '.githooks', 'pre-push')
const CI_WORKFLOW = join(ROOT, '.github', 'workflows', 'ci.yml')
const ARCH_DIR = join(ROOT, 'tests', 'arch')
const HARD_RULES = join(CLAUDE, 'hard-rules.md')
const RULE_09 = join(CLAUDE, 'rules', '09-gates.md')
const RULE_10 = join(CLAUDE, 'rules', '10-contract-first.md')
const HARD_RULES_ROW_LIMIT = 700

const PROGRESS_LINE = /^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$/
const ALLOWED_GATES = [
  'require-contract',
  'pre-commit',
  'task-close-gate',
  'push-review-gate',
  'pre-push',
  'ci',
  'human',
]

interface Step {
  id: string
  phase: 'pre-push' | 'post-merge'
  title: string
  gate: string
}

function read(file: string): string {
  expect(existsSync(file), `missing ${file}`).toBe(true)
  return readFileSync(file, 'utf8')
}

function steps(): Step[] {
  return JSON.parse(read(STEPS_FILE)) as Step[]
}

function section(doc: string, heading: string): string {
  const lines = doc.split('\n')
  const start = lines.findIndex((l) => l === heading || l.startsWith(`${heading} `))
  expect(start, `missing section "${heading}"`).toBeGreaterThanOrEqual(0)
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((l) => /^## /.test(l))
  return (end === -1 ? rest : rest.slice(0, end)).join('\n')
}

function progressIds(block: string): string[] {
  return block
    .split('\n')
    .map((l) => PROGRESS_LINE.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => m[2] as string)
}

describe('workflow-steps.json', () => {
  it('is a well-formed ordered step list', () => {
    const list = steps()
    expect(list.map((s) => s.id)).toEqual([
      'story',
      'contract',
      'build',
      'consolidate',
      'validate',
      'handoff',
      'commit',
      'review',
      'close-out',
      'gate-push',
      'push-pr',
      'merge',
      'deploy-check',
    ])
    expect(new Set(list.map((s) => s.id)).size).toBe(list.length)
    for (const s of list) {
      expect(['pre-push', 'post-merge'], `${s.id} phase`).toContain(s.phase)
      expect(ALLOWED_GATES, `${s.id} gate`).toContain(s.gate)
      expect(s.title.trim().length, `${s.id} title`).toBeGreaterThan(0)
    }
    const firstPost = list.findIndex((s) => s.phase === 'post-merge')
    expect(list.slice(firstPost).every((s) => s.phase === 'post-merge')).toBe(true)
  })
})

describe('close-workflow-redesign: workflow documents', () => {
  it('close checklist template has only pre-merge-provable items', () => {
    const doc = read(CLOSE_TEMPLATE)
    expect(doc).not.toMatch(/PR merged/i)
    expect(doc).not.toMatch(/deploy verified/i)

    const checklist = doc.slice(0, doc.indexOf('\n## Review'))
    expect(checklist).toMatch(/^- \[ \] /m)
    expect(checklist).toMatch(/acceptance criterion/i)
    expect(checklist).toMatch(/gate:push/)
    expect(checklist).toMatch(/code-review[\s\S]*effort[\s\S]*date/i)
    expect(checklist).toMatch(/decision/i)
    expect(checklist).toMatch(/catalog/i)
    expect(checklist).toMatch(/standard/i)
    expect(checklist).toMatch(/rule-11/i)
    expect(checklist).toMatch(/backlog[\s\S]*`done`/i)

    const review = section(doc, '## Review')
    expect(review).toMatch(/code-review/)
    const progress = section(doc, '## Workflow progress')
    const prePush = steps()
      .filter((s) => s.phase === 'pre-push')
      .map((s) => s.id)
    expect(progressIds(progress)).toEqual(prePush)
  })

  it('workflow.md, handoff template and gates table match workflow-steps.json', () => {
    const list = steps()
    const workflow = read(WORKFLOW)
    const gatesIndex = workflow.indexOf('\n## Gates')
    expect(gatesIndex).toBeGreaterThan(0)

    const entries = [...workflow.slice(0, gatesIndex).matchAll(/^(\d+)\.\s+\*\*(.+?)\*\*/gm)]
    expect(entries.map((m) => m[2])).toEqual(list.map((s) => s.title))
    expect(entries.map((m) => Number(m[1]))).toEqual(list.map((_, i) => i + 1))

    const handoff = read(HANDOFF_TEMPLATE)
    const firstHeading = handoff.split('\n').find((l) => /^## /.test(l))
    expect(firstHeading).toBe('## Workflow progress')
    const progress = section(handoff, '## Workflow progress')
    const prePush = list.filter((s) => s.phase === 'pre-push').map((s) => s.id)
    expect(progressIds(progress)).toEqual(prePush)
    for (const line of progress.split('\n').filter((l) => PROGRESS_LINE.test(l))) {
      expect(line).toMatch(/^- \[ \] \S+ — evidence:\s*$/)
    }
    expect(handoff).not.toMatch(/Post-merge deploy check/)

    const gates = workflow.slice(gatesIndex)
    const named = [...new Set(list.map((s) => s.gate))].filter((g) => g !== 'human')
    for (const gate of named)
      expect(gates, `Gates table row for ${gate}`).toContain(`| \`${gate}\``)
    expect(gates).not.toMatch(/closing the task/)
  })

  it('workflow.md orders close-out before push and deploy-check after merge', () => {
    const workflow = read(WORKFLOW)
    const at = (title: string) => {
      const i = workflow.search(new RegExp(`^\\d+\\.\\s+\\*\\*${title}\\*\\*`, 'm'))
      expect(i, `entry ${title}`).toBeGreaterThanOrEqual(0)
      return i
    }
    expect(at('Close-out')).toBeLessThan(at('Gate push'))
    expect(at('Gate push')).toBeLessThan(at('Push and PR'))
    expect(at('Push and PR')).toBeLessThan(at('Merge'))
    expect(at('Merge')).toBeLessThan(at('Deploy check'))

    const deploy = workflow.slice(at('Deploy check'), workflow.indexOf('\n## Gates'))
    expect(deploy).toMatch(/non-blocking/i)
    expect(deploy).toMatch(/gh run list/)
    expect(deploy).toMatch(/chat/i)
    expect(deploy).toMatch(/new task/i)
    expect(deploy).toMatch(/never (?:by )?reopen/i)

    const closeOut = workflow.slice(at('Close-out'), at('Gate push'))
    expect(closeOut).toMatch(/closed\/<slug>\.md/)
    expect(closeOut).toMatch(/one PR/i)
  })

  it('workflow.md puts close-out last and documents reopening', () => {
    const workflow = read(WORKFLOW)
    const entry = (title: string): string => {
      const start = workflow.search(new RegExp(`^\\d+\\.\\s+\\*\\*${title}\\*\\*`, 'm'))
      expect(start, `entry ${title}`).toBeGreaterThanOrEqual(0)
      const rest = workflow.slice(start + 1)
      const next = rest.search(/^\d+\.\s+\*\*/m)
      return next === -1 ? rest : rest.slice(0, next)
    }

    const closeOut = entry('Close-out')
    expect(closeOut).toMatch(/last commit before the push/i)
    expect(closeOut).toMatch(/final review of the full diff/i)
    expect(closeOut).toMatch(/user-run `\/code-review`/)
    expect(closeOut).toMatch(/stale/i)
    expect(closeOut).toContain('git revert <close-out sha>')
    expect(closeOut).toMatch(/re-review/i)

    const review = entry('Review')
    expect(review).toMatch(/stale/i)
    expect(review).toContain('/code-review high')

    for (const [name, file] of [
      ['rule 09', RULE_09],
      ['rule 10', RULE_10],
    ] as const) {
      const doc = read(file)
      expect(doc, `${name} last commit`).toMatch(/last commit before the push/i)
      expect(doc, `${name} revert`).toContain('git revert <close-out sha>')
      expect(doc, `${name} stale review`).toMatch(/stale/i)
    }

    const decision = read(join(DECISIONS_DIR, '057-close-out-before-single-push.md'))
    expect(decision).toMatch(/^## Amendment 2026-10-06/m)
    expect(decision).toContain('git revert <close-out sha>')
    expect(read(HANDOFF_TEMPLATE)).toMatch(/last commit before the push/i)
    expect(read(CLOSE_TEMPLATE)).toMatch(/last commit before the push/i)
    expect(read(CATALOG)).toMatch(/stale review/i)
  })

  it('hard-rules rows stay short', () => {
    const rows = read(HARD_RULES)
      .split('\n')
      .filter((line) => line.startsWith('|'))
    expect(rows.length).toBeGreaterThanOrEqual(20)
    const tooLong = rows
      .filter((row) => row.length >= HARD_RULES_ROW_LIMIT)
      .map((row) => row.slice(0, 40))
    expect(
      tooLong,
      `table rows of ${HARD_RULES_ROW_LIMIT} characters or more (details belong in rules/NN-*.md)`
    ).toEqual([])
    for (const id of ['09', '10']) {
      const row = rows.find((r) => r.startsWith(`| ${id} `)) as string
      const rule = row.split('|')[2]!.trim()
      expect(rule.length, `rule ${id} summary`).toBeLessThanOrEqual(330)
    }
  })

  it('decision 057 and ai-workflow catalog exist', () => {
    const file = readdirSync(DECISIONS_DIR).find((f) => f.startsWith('057-'))
    expect(file, 'decision 057 file').toBe('057-close-out-before-single-push.md')
    const decision = read(join(DECISIONS_DIR, file as string))
    expect(decision).toMatch(/042/)
    expect(decision).toMatch(/051/)
    expect(read(CATALOG)).toContain('workflow-steps.json')
  })
})

describe('close-workflow-redesign: the gate holds from any client', () => {
  it('git hooks and CI call the workflow gate script', () => {
    const call = (mode: string): RegExp =>
      new RegExp(`${GATE_SCRIPT.replace('.', '\\.')}"? ${mode}( \\|\\| exit \\$\\?)?$`, 'm')

    const preCommit = read(PRE_COMMIT_HOOK)
    expect(preCommit).toMatch(call('--commit'))
    expect(preCommit.search(call('--commit'))).toBeLessThan(preCommit.indexOf('pnpm gate'))
    expect(preCommit).toMatch(/--commit \|\| exit \$\?/)

    const prePush = read(PRE_PUSH_HOOK)
    expect(prePush).toMatch(call('--pre-push'))
    expect(prePush.search(call('--pre-push'))).toBeLessThan(prePush.indexOf('pnpm gate:push'))
    expect(prePush).toMatch(/--pre-push \|\| exit \$\?/)
    expect(prePush).toMatch(/exec pnpm gate:push/)

    const ci = read(CI_WORKFLOW)
    expect(ci).toContain(`${GATE_SCRIPT} --ci "$HEAD_REF" "$HEAD_SHA"`)
    expect(ci).toMatch(/startsWith\(github\.head_ref, 'feat\/'\)/)
    expect(ci).toContain('github.event.pull_request.head.sha')
    expect(ci).toMatch(/fetch-depth:\s*0/)
    expect(existsSync(join(CLAUDE, 'hooks', GATE_SCRIPT))).toBe(true)
  })

  it('ci runs the base branch copy of the workflow gate', () => {
    const ci = read(CI_WORKFLOW)
    expect(ci).toContain('BASE_REF: ${{ github.base_ref }}')
    expect(ci).toContain(`git show "origin/$BASE_REF:.claude/hooks/${GATE_SCRIPT}"`)
    expect(ci).toMatch(/grep -q -e '--ci'/)
    expect(ci).toContain('--ci "$HEAD_REF" "$HEAD_SHA" --base "origin/$BASE_REF"')
    expect(ci).toContain(
      '::notice::base branch has no --ci gate yet (this PR introduces it), using the PR copy'
    )
    const fallback = ci.indexOf('::notice::')
    expect(ci.indexOf('--base "origin/$BASE_REF"')).toBeLessThan(fallback)
    expect(
      ci.indexOf(`python3 .claude/hooks/${GATE_SCRIPT} --ci "$HEAD_REF" "$HEAD_SHA"`)
    ).toBeGreaterThan(fallback)
  })

  it('arch specs have no test-only hook overrides', () => {
    const needle = ['HOOK_UNDER', 'TEST'].join('_')
    const offenders = readdirSync(ARCH_DIR)
      .filter((f) => f.endsWith('.spec.ts'))
      .filter((f) => readFileSync(join(ARCH_DIR, f), 'utf8').includes(needle))
    expect(offenders, 'specs referencing a test-only hook override').toEqual([])
    expect(read(CATALOG)).not.toContain(needle)
  })
})
