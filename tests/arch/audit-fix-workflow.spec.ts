// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

// Decision 063 (task audit-autofix): .github/workflows/audit-fix.yml opens a pull request that fixes new
// `pnpm audit` advisories. It cannot run locally, so every property that keeps it safe is asserted on the file
// text, and the two shell/awk programs that touch pnpm-workspace.yaml are executed against fixtures.

const ROOT = process.cwd()
const WORKFLOW = join(ROOT, '.github', 'workflows', 'audit-fix.yml')
const DECISIONS_DIR = join(ROOT, '.claude', 'docs', 'decisions')
const ISSUE_TITLE = 'audit: advisories left after auto-fix'

const cleanup: string[] = []
afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function workflow(): string {
  expect(existsSync(WORKFLOW), 'missing .github/workflows/audit-fix.yml').toBe(true)
  return readFileSync(WORKFLOW, 'utf8')
}

function children(lines: string[], start: number): string[] {
  const indent = /^\s*/.exec(lines[start]!)![0].length
  const body: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && /^\s*/.exec(line)![0].length <= indent) break
    body.push(line)
  }
  return body
}

function block(text: string, header: RegExp): string[] {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => header.test(line))
  expect(start, `missing block ${header}`).toBeGreaterThanOrEqual(0)
  return children(lines, start)
}

function permissionEntries(text: string): string[] {
  const lines = text.split('\n')
  const entries: string[] = []
  lines.forEach((line, index) => {
    const header = /^\s*permissions:\s*(.*)$/.exec(line)
    if (!header) return
    if (header[1]) entries.push(header[1])
    else
      entries.push(
        ...children(lines, index)
          .filter((entry) => entry.trim())
          .map((entry) => entry.trim())
      )
  })
  return entries
}

function steps(text: string): string[] {
  const lines = block(text, /^ {4}steps:\s*$/)
  const found: string[] = []
  for (const line of lines) {
    if (/^ {6}- /.test(line)) found.push(line)
    else if (found.length > 0) found[found.length - 1] += `\n${line}`
  }
  return found
}

function stepIndex(list: string[], needle: RegExp, from = 0): number {
  const index = list.findIndex((step, position) => position >= from && needle.test(step))
  expect(index, `no step matches ${needle}`).toBeGreaterThanOrEqual(0)
  return index
}

function runAwk(program: string, args: string[], input?: string): string {
  const result = spawnSync('awk', [program, ...args], { encoding: 'utf8', input })
  expect(result.status, result.stderr).toBe(0)
  return result.stdout
}

function tempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'audit-fix-'))
  cleanup.push(dir)
  const file = join(dir, name)
  writeFileSync(file, content)
  return file
}

describe('audit-fix workflow', () => {
  it('audit-fix workflow is scheduled, least-privilege and never merges', () => {
    const text = workflow()

    const triggers = block(text, /^on:\s*$/)
      .filter((line) => /^ {2}\S/.test(line))
      .map((line) => line.trim())
    expect(triggers).toEqual(['schedule:', 'workflow_dispatch:'])
    const cron = block(text, /^ {2}schedule:\s*$/)
      .join('\n')
      .match(/cron:\s*'([^']+)'/)
    expect(cron, 'schedule needs a quoted cron expression').not.toBeNull()
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cron![1]!.split(' ')
    expect([dayOfMonth, month, dayOfWeek]).toEqual(['*', '*', '1'])
    expect(Number(hour)).toBeGreaterThanOrEqual(7)
    expect(Number(minute)).toBeGreaterThanOrEqual(0)
    expect(text).not.toContain('pull_request_target')

    const allowed = [
      'contents: read',
      'contents: write',
      'pull-requests: write',
      'issues: write',
      '{}',
    ]
    const entries = permissionEntries(text)
    expect(entries.length, 'permissions must be declared').toBeGreaterThan(0)
    for (const entry of entries) {
      expect(allowed, `permission "${entry}" is broader than the contract allows`).toContain(entry)
    }
    expect(text).not.toMatch(/permissions:\s*write-all/)

    for (const forbidden of [
      /gh pr merge/,
      /--auto\b/,
      /auto-merge/i,
      /automerge/i,
      /enable-auto/i,
      /git push[^\n]*\b(main|master)\b/,
      /HEAD:(refs\/heads\/)?(main|master)/,
      /refs\/heads\/(main|master)/,
      /--force/,
      /--no-verify/,
    ]) {
      expect(text, `forbidden in audit-fix.yml: ${forbidden}`).not.toMatch(forbidden)
    }
  })

  it('audit-fix workflow pins actions and uses the dedicated token', () => {
    const text = workflow()

    const uses = [...text.matchAll(/^\s*-?\s*uses:\s*(\S+)\s*$/gm)].map((match) => match[1]!)
    expect(uses.length).toBeGreaterThanOrEqual(3)
    for (const action of uses) {
      const [name, ref] = action.split('@')
      if (name!.startsWith('actions/'))
        expect(ref, `${action} needs a version tag`).toMatch(/^v\d+/)
      else expect(ref, `${action} must be pinned by commit SHA`).toMatch(/^[0-9a-f]{40}$/)
    }

    const list = steps(text)
    const checkout = list[stepIndex(list, /uses: actions\/checkout@/)]!
    expect(checkout).toContain('token: ${{ secrets.AUDIT_FIX_TOKEN }}')
    expect(checkout).toContain('persist-credentials: false')
    const pr = list[stepIndex(list, /gh pr create/)]!
    expect(pr).toContain('GH_TOKEN: ${{ secrets.AUDIT_FIX_TOKEN }}')
    expect(pr).not.toMatch(/GH_TOKEN: \$\{\{ (secrets\.GITHUB_TOKEN|github\.token) \}\}/)

    const secrets = [...text.matchAll(/secrets\.(\w+)/g)].map((match) => match[1])
    expect([...new Set(secrets)]).toEqual(['AUDIT_FIX_TOKEN'])
    expect(text).not.toMatch(/\bgh[pousr]_[A-Za-z0-9]{20,}/)
    expect(text).not.toMatch(/github_pat_[A-Za-z0-9_]{20,}/)
  })

  it('audit-fix opens a PR only after the audit passes and never writes an ignore', () => {
    const text = workflow()
    const list = steps(text)

    const install = stepIndex(list, /pnpm install --frozen-lockfile/)
    const fix = stepIndex(list, /pnpm audit --fix=override/, install)
    const reinstall = stepIndex(list, /pnpm install --no-frozen-lockfile/, fix)
    const verify = stepIndex(list, /pnpm audit --audit-level=high/, reinstall)
    const pr = stepIndex(list, /gh pr create/, verify)
    expect([install, fix, reinstall, verify, pr]).toEqual(
      [install, fix, reinstall, verify, pr].sort((a, b) => a - b)
    )
    expect(text).not.toMatch(/pnpm audit --fix(?!=override)/)
    expect(list[install]).toContain('--ignore-scripts')
    expect(list[reinstall]).toContain('--ignore-scripts')

    expect(list[pr]).toContain('git status --porcelain')
    expect(list[pr]).not.toMatch(/if:.*(failure|always|cancelled)\(\)/)
    expect(text).not.toMatch(/continue-on-error/)
    expect(text).toMatch(/git push origin "\$branch"/)
    expect(text).toMatch(/chore\/audit-fix-/)
    expect(text).toContain('fix(deps): auto-fix audit advisories')
    expect(text).toContain('danimo17')
    expect(text).toContain('daniel.spr17@gmail.com')

    const report = stepIndex(list, new RegExp(ISSUE_TITLE.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')))
    expect(report).toBeGreaterThan(verify)
    expect(list[report]).toMatch(/if:.*failure\(\)/)
    expect(list[report]).toContain('issues')
    expect(list[report]).not.toMatch(/AUDIT_FIX_TOKEN/)

    for (const ignore of [
      /--ignore(?!-scripts)/,
      /--ignore-registry-errors/,
      /ignoreGhsas/,
      /auditConfig/,
      /ignore-vulnerability/,
    ]) {
      expect(text, `audit-fix must never write an ignore: ${ignore}`).not.toMatch(ignore)
    }
  })

  it('audit-fix keeps minimumReleaseAgeExclude as it was before pnpm audit --fix', () => {
    const text = workflow()
    const program = /awk '(NR==FNR[^']*)'/.exec(text)
    expect(program, 'the restore awk program is missing').not.toBeNull()

    const original = tempFile(
      'original.yaml',
      [
        'allowBuilds:',
        '  esbuild: true',
        'minimumReleaseAgeExclude:',
        '  - wrangler@4.131.2',
        'minimumReleaseAge: 1440',
        'overrides:',
        "  'a@<1.0.0': '^1.0.0'",
        '',
      ].join('\n')
    )
    const fixed = tempFile(
      'fixed.yaml',
      [
        'allowBuilds:',
        '  esbuild: true',
        'minimumReleaseAgeExclude:',
        '  - wrangler@4.131.2',
        '  - zod@4.6.6',
        "  - '@intlify/core@11.4.14'",
        'minimumReleaseAge: 1440',
        'overrides:',
        "  'a@<1.0.0': '^1.0.0'",
        '  zod@<4.6.6: ^4.6.6',
        '',
      ].join('\n')
    )
    expect(runAwk(program![1]!, [original, fixed])).toBe(
      [
        'allowBuilds:',
        '  esbuild: true',
        'minimumReleaseAgeExclude:',
        '  - wrangler@4.131.2',
        'minimumReleaseAge: 1440',
        'overrides:',
        "  'a@<1.0.0': '^1.0.0'",
        '  zod@<4.6.6: ^4.6.6',
        '',
      ].join('\n')
    )
  })

  it('audit-fix writes a decision that explains every override it adds', () => {
    const text = workflow()
    const program = /awk '(\/\^\\\+ {2}\[\^ -\][^']*)'/.exec(text)
    expect(program, 'the overrides-to-decision awk program is missing').not.toBeNull()

    const diff = [
      '--- a/pnpm-workspace.yaml',
      '+++ b/pnpm-workspace.yaml',
      '@@ -9,0 +10,3 @@',
      "+  '@intlify/core-base@>=11.1.10 <11.4.14': ^11.4.14",
      '+  seroval@<=1.6.7: ^1.6.8',
      '+  - zod@4.6.6',
      '',
    ].join('\n')
    expect(runAwk(program![1]!, [], diff)).toBe(
      [
        '- `@intlify/core-base@>=11.1.10 <11.4.14` to `^11.4.14`',
        '- `seroval@<=1.6.7` to `^1.6.8`',
        '',
      ].join('\n')
    )

    expect(text).toMatch(/\.claude\/docs\/decisions\/audit-fix-\$\{?day\}?\.md/)
    expect(text).toContain('REMOVE-WHEN')
    expect(text).toContain('.claude/docs/decisions/063-audit-autofix-workflow.md')
  })
})

describe('audit-fix decision 063', () => {
  it('audit-fix decision 063 records the design and the one manual step without a token value', () => {
    const file = readdirSync(DECISIONS_DIR).find((name) => name.startsWith('063-'))
    expect(file, 'decision 063 file').toBe('063-audit-autofix-workflow.md')
    const decision = readFileSync(join(DECISIONS_DIR, file as string), 'utf8')

    expect(decision).toContain('AUDIT_FIX_TOKEN')
    expect(decision).toMatch(/fine-grained/i)
    expect(decision).toMatch(/Contents/)
    expect(decision).toMatch(/Pull requests/)
    expect(decision).toMatch(/danimo17\/cv/)
    expect(decision).toMatch(/GITHUB_TOKEN[\s\S]{0,80}do(es)?\s+not\s+trigger/i)
    expect(decision).toMatch(/no auto-merge|never merges/i)
    expect(decision).toMatch(/ignore/i)
    expect(decision).toMatch(/remove[- ]when/i)
    expect(decision).toContain('minimumReleaseAgeExclude')
    expect(decision).toContain('--fix=override')
    expect(decision).toContain('workflow_dispatch')
    expect(decision).not.toMatch(/\bgh[pousr]_[A-Za-z0-9]{20,}/)
    expect(decision).not.toMatch(/github_pat_[A-Za-z0-9_]{20,}/)
  })
})
