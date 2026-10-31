// @vitest-environment node
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

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
const WORKFLOWS_DIR = join(ROOT, '.github', 'workflows')
const CI_WORKFLOW = join(WORKFLOWS_DIR, 'ci.yml')
const ARCH_DIR = join(ROOT, 'tests', 'arch')
const HARD_RULES = join(CLAUDE, 'hard-rules.md')
const RULE_09 = join(CLAUDE, 'rules', '09-gates.md')
const RULE_10 = join(CLAUDE, 'rules', '10-contract-first.md')
const HARD_RULES_ROW_LIMIT = 700

const cleanup: string[] = []
afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true })
})

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

  it('workflow.md states the review convergence policy', () => {
    const workflow = read(WORKFLOW)
    const policy = section(workflow, '## Review policy')
    expect(policy).toMatch(/a\s+finding\s+becomes\s+a\s+test/i)
    expect(policy).toMatch(/search\s+first/i)
    expect(policy).toMatch(/strengthen(?:s|ing)?\s+an\s+existing\s+test/i)
    expect(policy).toMatch(/new\s+one\s+only\s+when\s+none\s+exists/i)
    expect(policy).toMatch(/gate\s+(?:performs|runs)\s+the\s+search/i)
    expect(policy).toMatch(/titles?\s+(?:are|is)\s+unique\s+per\s+file/i)
    expect(policy).toMatch(/not\s+a\s+second\s+review/i)
    expect(policy).toMatch(/at\s+most\s+two\s+review\s+rounds/i)
    expect(policy).toMatch(/only\s+the\s+delta/i)
    expect(policy).toContain('git diff <last-reviewed-sha>..HEAD')
    expect(policy).toContain('workflow-integrity-hardening')
    expect(policy).toMatch(/severity/i)
    expect(policy).toMatch(/normal-use/i)
    expect(policy).toMatch(/cannot\s+return/i)
    expect(policy).toMatch(/gate:push/)
    expect(policy).toMatch(/new\s+bug\s+class/i)
    expect(policy).toMatch(/not\s+semantic/i)
    expect(workflow.indexOf('\n## Review policy')).toBeGreaterThan(workflow.indexOf('\n## Gates'))

    const rule09 = read(RULE_09)
    expect(rule09).toMatch(/a\s+finding\s+becomes\s+a\s+test/i)
    expect(rule09).toMatch(/search\s+first/i)
    expect(rule09).toMatch(/at\s+most\s+two\s+review\s+rounds/i)
    expect(rule09).toMatch(/-\s+finding\s+<id>\s+—\s+outcome:/)

    const decision = read(join(DECISIONS_DIR, '057-close-out-before-single-push.md'))
    expect(decision).toContain(
      '## Amendment 2026-10-06 (third review: findings become tests, search first)'
    )
    expect(read(CATALOG)).toMatch(/findings:\s+none/)

    const formats = [
      /- finding <id> — outcome: .* — proof:/,
      /strengthened/,
      /searched:/,
      /differs:/,
    ]
    for (const template of [HANDOFF_TEMPLATE, CLOSE_TEMPLATE])
      for (const format of formats) expect(read(template)).toMatch(format)
  })

  it('decision 057 and ai-workflow catalog exist', () => {
    const file = readdirSync(DECISIONS_DIR).find((f) => f.startsWith('057-'))
    expect(file, 'decision 057 file').toBe('057-close-out-before-single-push.md')
    const decision = read(join(DECISIONS_DIR, file as string))
    expect(decision).toMatch(/042/)
    expect(decision).toMatch(/051/)
    expect(decision).toContain('## Amendment 2026-10-22 (merge-aware ancestry)')
    expect(decision).toContain('MERGE_HEAD')
    expect(read(CATALOG)).toContain('workflow-steps.json')
    const catalog = read(CATALOG)
    for (const workflow of readdirSync(WORKFLOWS_DIR).filter((f) => /\.ya?ml$/.test(f)))
      expect(catalog, `${workflow} is not documented in the ai-workflow catalog`).toContain(
        `\`${workflow}\``
      )
    expect(read(CATALOG)).toMatch(/ancestor of `HEAD` or of `MERGE_HEAD`/)
  })
})

describe('hook-hardening: the process gaps are mechanical and documented', () => {
  it('decision 059 and the hardening rules are documented', () => {
    const file = readdirSync(DECISIONS_DIR).find((f) => f.startsWith('059-'))
    expect(file, 'decision 059 file').toBe('059-hook-hardening.md')
    const decision = read(join(DECISIONS_DIR, file as string))
    expect(decision).toContain('ALLOW_UNMERGED_FEAT=1')
    expect(decision).toMatch(/`doing` row/)
    expect(decision).toMatch(/Deviation from the original story text/)
    expect(decision).toContain('payload `cwd`')
    expect(decision).toContain('## Shared component consumers')

    const rules: Array<[string, RegExp[]]> = [
      ['06-git-branches.md', [/ALLOW_UNMERGED_FEAT=1/, /doing/, /059/]],
      ['11-directives.md', [/playwright\.config\.ts/, /\.claude\/hooks\/\*/, /059/]],
      ['12-orchestration.md', [/## Subagents/, /15 changed\s+lines/, /059/]],
      ['16-ui-pattern-consistency.md', [/## Shared component consumers/, /059/]],
    ]
    for (const [name, patterns] of rules) {
      const doc = read(join(CLAUDE, 'rules', name))
      const checked = doc.slice(doc.indexOf("**How it's checked.**"))
      for (const pattern of patterns) expect(checked, `${name} ${pattern}`).toMatch(pattern)
    }

    const catalog = read(CATALOG)
    expect(catalog).toContain('## Hook hardening (decision 059)')
    for (const term of [
      'ALLOW_UNMERGED_FEAT=1',
      '## Subagents',
      '## Shared component consumers',
      'payload `cwd`',
      'wrangler.jsonc',
    ])
      expect(catalog, term).toContain(term)
  })

  it('the code-review round of decision 059 is documented in the rules, catalog, standards and templates', () => {
    const decision = read(join(DECISIONS_DIR, '059-hook-hardening.md'))
    expect(decision).toContain('## Amendment 2026-10-19')
    for (const term of [
      'git common dir',
      'mentions',
      'app/assets/css/',
      'Fail closed',
      'workflow-integrity-hardening',
    ])
      expect(decision, term).toContain(term)

    const rule = (name: string): string => read(join(CLAUDE, 'rules', name))
    expect(rule('06-git-branches.md')).toMatch(/git common\s+dir/)
    expect(rule('11-directives.md')).toMatch(/mentions the file name/)
    expect(rule('12-orchestration.md')).toMatch(/app\/assets\/css\//)
    expect(rule('12-orchestration.md')).toMatch(/rename counts as one file/)

    const catalog = read(CATALOG)
    const row = catalog
      .split('\n')
      .find((l) => l.startsWith('| `.claude/hooks/require-contract.sh`'))
    expect(row, 'main require-contract catalog row').toBeDefined()
    for (const term of ['rule 06/18', 'rule 11', 'rule 12', 'rule 16', 'git -C', 'failing closed'])
      expect(row, term).toMatch(new RegExp(term.replace('-', '\\-'), 'i'))
    expect(catalog).toContain('## Test isolation (`tests/setup/clean-git-env.ts`)')
    expect(catalog).toContain('tests/arch/test-env-isolation.spec.ts')

    const testing = read(join(CLAUDE, 'docs', 'standards', 'testing.md'))
    expect(testing).toContain('tests/setup/clean-git-env.ts')
    expect(testing).toContain('GIT_INDEX_FILE')
    expect(testing).toContain('tests/arch/test-env-isolation.spec.ts')

    expect(read(join(CLAUDE, 'templates', 'contract.md'))).toMatch(
      /^## Shared component consumers$/m
    )

    const queued = read(join(CLAUDE, 'tasks', 'workflow-integrity-hardening', 'story.md'))
    for (const term of [
      'checkout --orphan',
      'worktree add -b',
      'branch -c',
      'xargs',
      'ALLOW_UNMERGED_FEAT=1',
      'placeholder row',
    ])
      expect(queued, term).toContain(term)
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
      '::notice::base branch has no --ci/--base gate yet (this PR introduces it), using the PR copy'
    )
    const fallback = ci.indexOf('::notice::')
    expect(ci.indexOf('--base "origin/$BASE_REF"')).toBeLessThan(fallback)
    expect(
      ci.indexOf(`python3 .claude/hooks/${GATE_SCRIPT} --ci "$HEAD_REF" "$HEAD_SHA"`)
    ).toBeGreaterThan(fallback)
  })

  it('ci falls back unless the base copy supports --ci and --base', () => {
    const ci = read(CI_WORKFLOW)
    const probe = ci.slice(ci.indexOf('if git show'), ci.indexOf('::notice::'))
    expect(probe).toMatch(/grep -q -e '--ci' "\$base_gate"/)
    expect(probe).toMatch(/grep -q -e '--base' "\$base_gate"/)
    const useBase = probe.indexOf('python3 "$base_gate"')
    expect(useBase).toBeGreaterThan(probe.indexOf("grep -q -e '--ci'"))
    expect(useBase).toBeGreaterThan(probe.indexOf("grep -q -e '--base'"))
    expect(probe.match(/&&/g)?.length, 'git show, --ci and --base probes chained with &&').toBe(2)
    expect(ci).not.toContain('::notice::base branch has no --ci gate yet')
  })

  it('ci probe: runs the base copy only when it mentions both --ci and --base', () => {
    const ci = read(CI_WORKFLOW)
    const start = ci.indexOf('        run: |\n', ci.indexOf('Workflow gate'))
    const end = ci.indexOf('\n\n  gate:')
    const script = ci
      .slice(start + '        run: |\n'.length, end)
      .split('\n')
      .map((line) => line.slice(10))
      .join('\n')
    expect(script).toContain('base_gate=')

    const run = (baseScript: string | null): string => {
      const dir = mkdtempSync(join(tmpdir(), 'ci-probe-'))
      cleanup.push(dir)
      const git = (...args: string[]): void => {
        const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
        if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
      }
      const hook = (body: string): void => {
        mkdirSync(join(dir, '.claude', 'hooks'), { recursive: true })
        writeFileSync(join(dir, '.claude', 'hooks', GATE_SCRIPT), body)
      }
      git('init', '-q', '-b', 'main')
      git('config', 'user.name', 'Test')
      git('config', 'user.email', 'test@example.com')
      git('config', 'commit.gpgsign', 'false')
      hook(baseScript ?? '# a base with no gate\n')
      git('add', '-A')
      git('commit', '-q', '-m', 'base')
      git('update-ref', 'refs/remotes/origin/main', 'HEAD')
      hook('import sys\nprint("PR-COPY", *sys.argv[1:])\n')
      const r = spawnSync('sh', ['-c', script], {
        cwd: dir,
        encoding: 'utf8',
        env: {
          ...process.env,
          RUNNER_TEMP: dir,
          HEAD_REF: 'feat/x',
          HEAD_SHA: 'abc',
          BASE_REF: 'main',
        },
      })
      expect(r.status, r.stderr).toBe(0)
      return `${r.stdout}${r.stderr}`
    }
    const py = (comment: string): string =>
      `import sys\n# ${comment}\nprint("BASE-COPY", *sys.argv[1:])\n`

    expect(run(py('supports --ci and --base'))).toContain(
      'BASE-COPY --ci feat/x abc --base origin/main'
    )
    const onlyCi = run(py('supports --ci only'))
    expect(onlyCi).toContain('PR-COPY --ci feat/x abc')
    expect(onlyCi).toContain('::notice::base branch has no --ci/--base gate yet')
    expect(run(py('nothing'))).toContain('PR-COPY --ci feat/x abc')
    expect(run(null)).toContain('PR-COPY --ci feat/x abc')
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
