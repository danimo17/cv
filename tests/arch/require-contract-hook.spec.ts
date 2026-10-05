// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

// Every test builds a throwaway git repo and runs the REAL hook against it with
// CLAUDE_PROJECT_DIR pointing at that repo. The real repo's git state is never touched.

const ROOT = process.cwd()
// HOOK_UNDER_TEST lets the same spec run against another copy of the hook (e.g. a previous revision).
const HOOK = process.env.HOOK_UNDER_TEST ?? join(ROOT, '.claude', 'hooks', 'require-contract.py')
const STEPS_JSON = readFileSync(join(ROOT, '.claude', 'workflow-steps.json'), 'utf8')
const PRE_PUSH = (JSON.parse(STEPS_JSON) as Array<{ id: string; phase: string }>)
  .filter((s) => s.phase === 'pre-push')
  .map((s) => s.id)

const SLUG = 'demo'
const TASK = `.claude/tasks/${SLUG}`
const ARCHIVE = `.claude/tasks/closed/${SLUG}.md`
const COMMIT = 'git commit -m x'
const PUSH = `git push origin feat/${SLUG}`

const cleanup: string[] = []
afterEach(() => {
  for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true })
})

interface Repo {
  dir: string
  write: (files: Record<string, string>) => void
  remove: (path: string) => void
  git: (...args: string[]) => string
  commitAll: (message: string) => void
}

function createRepo(base: Record<string, string>, branch = `feat/${SLUG}`): Repo {
  const dir = mkdtempSync(join(tmpdir(), 'rc-hook-'))
  const hooks = mkdtempSync(join(tmpdir(), 'rc-hook-empty-'))
  cleanup.push(dir, hooks)
  const git = (...args: string[]): string => {
    const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`)
    return r.stdout
  }
  const repo: Repo = {
    dir,
    git,
    write(files) {
      for (const [path, content] of Object.entries(files)) {
        mkdirSync(dirname(join(dir, path)), { recursive: true })
        writeFileSync(join(dir, path), content)
      }
    },
    remove(path) {
      rmSync(join(dir, path), { recursive: true, force: true })
    },
    commitAll(message) {
      git('add', '-A')
      git('commit', '-q', '-m', message)
    },
  }
  git('init', '-q', '-b', 'main')
  git('config', 'user.name', 'Test')
  git('config', 'user.email', 'test@example.com')
  git('config', 'commit.gpgsign', 'false')
  git('config', 'core.hooksPath', hooks)
  repo.write({ '.claude/workflow-steps.json': STEPS_JSON, ...base })
  repo.commitAll('base')
  if (branch !== 'main') git('switch', '-q', '-c', branch)
  return repo
}

function runHook(repo: Repo, command: string): { status: number | null; stderr: string } {
  const r = spawnSync('python3', [HOOK], {
    input: JSON.stringify({ tool_input: { command } }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: repo.dir },
    encoding: 'utf8',
  })
  return { status: r.status, stderr: r.stderr }
}

function expectBlocked(repo: Repo, command: string, ...fragments: string[]): void {
  const { status, stderr } = runHook(repo, command)
  expect(status, `expected exit 2, stderr: ${stderr}`).toBe(2)
  for (const fragment of fragments) expect(stderr).toContain(fragment)
}

function expectAllowed(repo: Repo, command: string): void {
  const { status, stderr } = runHook(repo, command)
  expect(status, `expected exit 0, stderr: ${stderr}`).toBe(0)
}

type Ticks = Record<string, string | null>

function progressBlock(ticks: Ticks = {}, omit: string[] = []): string {
  return PRE_PUSH.filter((id) => !omit.includes(id))
    .map((id) => {
      const evidence = id in ticks ? ticks[id] : id === 'push-pr' ? null : `${id} done`
      return evidence === null ? `- [ ] ${id} — evidence:` : `- [x] ${id} — evidence: ${evidence}`
    })
    .join('\n')
}

const REVIEW_OK =
  '## Review\n\n- [x] checklist\n- [x] code-review ran at high effort, 2026-10-05, no findings\n'

function handoffDoc(opts: { ticks?: Ticks; omit?: string[]; review?: string | null } = {}): string {
  const review = opts.review === undefined ? REVIEW_OK : opts.review
  return [
    `# Handoff: ${SLUG}`,
    '',
    '## Workflow progress',
    '',
    progressBlock(opts.ticks, opts.omit),
    '',
    '## Done (verified)',
    '',
    '- things',
    '',
    ...(review === null ? [] : [review]),
    '## Pending on the user',
    '',
    '- none',
    '',
  ].join('\n')
}

function archiveDoc(
  opts: { ticks?: Ticks; omit?: string[]; review?: string | null; checklist?: string } = {}
): string {
  const review = opts.review === undefined ? REVIEW_OK : opts.review
  return [
    `# Close checklist: ${SLUG}`,
    '',
    opts.checklist ?? '- [x] every criterion verified\n- [x] backlog row set to `done`',
    '',
    ...(review === null ? [] : [review]),
    '## Workflow progress',
    '',
    progressBlock(opts.ticks, opts.omit),
    '',
  ].join('\n')
}

const CONTRACT = '# Contract\n\nGiven a thing, When it runs, Then it works.\n'
const STORY = '# Story\n'

function taskFiles(handoff: string, slug = SLUG): Record<string, string> {
  return {
    [`.claude/tasks/${slug}/story.md`]: STORY,
    [`.claude/tasks/${slug}/contract.md`]: CONTRACT,
    [`.claude/tasks/${slug}/handoff.md`]: handoff,
  }
}

function activeRepo(handoff: string | null, branch = `feat/${SLUG}`): Repo {
  const { [`${TASK}/handoff.md`]: handoffFile, ...rest } = taskFiles(handoff ?? '')
  const files = handoff === null ? rest : { ...rest, [`${TASK}/handoff.md`]: handoffFile }
  return createRepo({ '.claude/tasks/ACTIVE': `${SLUG}\n`, ...files }, branch)
}

function stageClose(repo: Repo, archive: string | null, activeOnDisk = ''): void {
  repo.remove(TASK)
  repo.write({ '.claude/tasks/ACTIVE': activeOnDisk })
  if (archive !== null) repo.write({ [ARCHIVE]: archive })
  repo.git('add', '-A')
}

function closedBranchRepo(archive: string | null): Repo {
  const repo = activeRepo(handoffDoc())
  stageClose(repo, archive)
  repo.git('commit', '-q', '-m', 'close')
  return repo
}

describe('blocks a close with no archive even when ACTIVE is already empty', () => {
  it('ACTIVE emptied in the working tree together with the folder deletion (the original hole)', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, null, '')
    expectBlocked(repo, COMMIT, ARCHIVE, 'task-close-gate')
  })

  it('ACTIVE still naming the task', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, null, `${SLUG}\n`)
    expectBlocked(repo, COMMIT, ARCHIVE)
  })

  it('a slug that ACTIVE never named (closing a second task in the same branch)', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': 'other\n',
      ...taskFiles(handoffDoc(), 'other'),
      ...taskFiles(handoffDoc(), 'old'),
    })
    repo.remove('.claude/tasks/old')
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, '.claude/tasks/closed/old.md')
  })

  it('archive staged as a modification of an existing file does not count as added', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': `${SLUG}\n`,
      ...taskFiles(handoffDoc()),
      [ARCHIVE]: archiveDoc(),
    })
    stageClose(repo, archiveDoc({ checklist: '- [x] changed' }))
    expectBlocked(repo, COMMIT, ARCHIVE)
  })

  it('a partial deletion is not a close: the normal contract check applies', () => {
    const repo = activeRepo(handoffDoc())
    repo.remove(`${TASK}/story.md`)
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'story.md')
  })

  it('a close commit does not require an active contract', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc())
    expectAllowed(repo, COMMIT)
  })

  it('a close commit may only stage files under .claude/', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc())
    repo.write({ 'app/thing.ts': 'export {}\n' })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'outside .claude/')
  })
})

describe('close archive: unchecked box blocks, fully checked passes', () => {
  it('fully checked archive passes, with push-pr still unticked', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc())
    expectAllowed(repo, COMMIT)
  })

  it('an unchecked checklist box blocks and is listed', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(
      repo,
      archiveDoc({ checklist: '- [x] verified\n- [ ] gate:push real output confirmed' })
    )
    expectBlocked(repo, COMMIT, 'unchecked', 'gate:push real output confirmed')
  })

  it('an unchecked box inside the Review section blocks', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ review: '## Review\n\n- [ ] code-review ran\n' }))
    expectBlocked(repo, COMMIT, 'unchecked')
  })

  it('an unticked progress step other than push-pr blocks', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ ticks: { review: null } }))
    expectBlocked(repo, COMMIT, 'unchecked', 'review')
  })

  it('only the push-pr progress line is exempt', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ ticks: { 'push-pr': null } }))
    expectAllowed(repo, COMMIT)
  })

  it('a ticked push-pr line also passes', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ ticks: { 'push-pr': 'PR #1' } }))
    expectAllowed(repo, COMMIT)
  })
})

describe('push gate with ACTIVE set: 054 behavior unchanged', () => {
  it('complete handoff passes', () => {
    expectAllowed(activeRepo(handoffDoc()), PUSH)
  })

  it('handoff missing from HEAD blocks', () => {
    expectBlocked(activeRepo(null), PUSH, `${TASK}/handoff.md`, 'push-review-gate')
  })

  it('no ## Review section blocks', () => {
    expectBlocked(activeRepo(handoffDoc({ review: null })), PUSH, '## Review')
  })

  it('an unchecked box inside ## Review blocks', () => {
    const repo = activeRepo(handoffDoc({ review: '## Review\n\n- [ ] code-review ran\n' }))
    expectBlocked(repo, PUSH, 'unchecked')
  })

  it('a ## Review section that never mentions code-review blocks', () => {
    const repo = activeRepo(handoffDoc({ review: '## Review\n\n- [x] checklist only\n' }))
    expectBlocked(repo, PUSH, 'code-review')
  })

  it('a heading with a suffix still counts as the review section', () => {
    const repo = activeRepo(
      handoffDoc({ review: '## Review (workflow step `review`)\n\n- [x] code-review ran\n' })
    )
    expectAllowed(repo, PUSH)
  })

  it('reads the committed handoff, not the working tree', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [`${TASK}/handoff.md`]: handoffDoc({ review: null }) })
    expectAllowed(repo, PUSH)
  })

  it('reads ACTIVE from HEAD, not from the working tree', () => {
    const repo = activeRepo(handoffDoc({ review: null }))
    repo.write({ '.claude/tasks/ACTIVE': '' })
    expectBlocked(repo, PUSH, '## Review')
  })

  it('branches that are not feat/* are not gated', () => {
    expectAllowed(activeRepo(handoffDoc({ review: null }), 'main'), 'git push origin main')
    expectAllowed(activeRepo(handoffDoc({ review: null }), 'chore/x'), 'git push origin chore/x')
  })
})

describe('push gate with ACTIVE empty reads the closed archive', () => {
  it('complete archive passes', () => {
    expectAllowed(closedBranchRepo(archiveDoc()), PUSH)
  })

  it('missing archive blocks instead of skipping', () => {
    expectBlocked(closedBranchRepo(null), PUSH, ARCHIVE, 'push-review-gate')
  })

  it('an unchecked box in the archive blocks', () => {
    const repo = closedBranchRepo(archiveDoc({ checklist: '- [ ] still to do' }))
    expectBlocked(repo, PUSH, 'unchecked', 'still to do')
  })

  it('an archive review section that never mentions code-review blocks', () => {
    const repo = closedBranchRepo(archiveDoc({ review: '## Review\n\n- [x] checklist only\n' }))
    expectBlocked(repo, PUSH, 'code-review')
  })

  it('an archive without a ## Review section blocks', () => {
    expectBlocked(closedBranchRepo(archiveDoc({ review: null })), PUSH, '## Review')
  })

  it('the slug comes from the branch name', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '', [ARCHIVE]: archiveDoc() }, 'feat/other')
    expectBlocked(repo, 'git push origin feat/other', '.claude/tasks/closed/other.md')
  })

  it('reads the archive from HEAD, not from the working tree', () => {
    const repo = closedBranchRepo(archiveDoc({ checklist: '- [ ] still to do' }))
    repo.write({ [ARCHIVE]: archiveDoc() })
    expectBlocked(repo, PUSH, 'unchecked')
  })

  it('the archive progress block is checked too', () => {
    const repo = closedBranchRepo(archiveDoc({ ticks: { build: '' } }))
    expectBlocked(repo, PUSH, 'build')
  })

  it('an ACTIVE edited in the working tree does not switch the gate back to the handoff', () => {
    const repo = closedBranchRepo(archiveDoc())
    repo.write({ '.claude/tasks/ACTIVE': `${SLUG}\n` })
    expectAllowed(repo, PUSH)
  })
})

describe('ticking a progress step requires evidence', () => {
  const handoffPath = `${TASK}/handoff.md`

  it('a ticked step with empty evidence blocks and names the step', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { build: '' } }) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'build', 'evidence')
  })

  it('whitespace-only evidence counts as empty', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { validate: '   ' } }) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'validate')
  })

  it('every offending step is named', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { build: '', consolidate: '' } }) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'build', 'consolidate')
  })

  it('a tick with evidence passes', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { build: 'abc1234' } }) })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
  })

  it('an unticked step with no evidence is fine', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { build: null } }) })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
  })

  it('a new handoff.md (added, not modified) is checked as well', () => {
    const repo = activeRepo(null)
    repo.write({ [handoffPath]: handoffDoc({ ticks: { story: '' } }) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'story')
  })

  it('a closed archive with a ticked step and no evidence blocks', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ ticks: { review: '' } }))
    expectBlocked(repo, COMMIT, 'review', 'evidence')
  })

  it('ticked lines outside ## Workflow progress are ignored', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({
      [handoffPath]: `${handoffDoc()}\n## Notes\n\n- [x] build — evidence:\n`,
    })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
  })

  it('an unstaged handoff is not inspected', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks: { build: '' } }) })
    expectAllowed(repo, COMMIT)
  })
})

describe('push requires every pre-push step ticked with evidence', () => {
  it('lists every unticked step before push-pr', () => {
    const repo = activeRepo(handoffDoc({ ticks: { build: null, validate: null } }))
    expectBlocked(repo, PUSH, '## Workflow progress', 'build', 'validate')
  })

  it('a ticked step with empty evidence committed to HEAD blocks', () => {
    const repo = activeRepo(handoffDoc({ ticks: { review: '' } }))
    expectBlocked(repo, PUSH, 'review')
  })

  it('a step whose line is missing counts as not ticked', () => {
    const repo = activeRepo(handoffDoc({ omit: ['gate-push'] }))
    expectBlocked(repo, PUSH, 'gate-push')
  })

  it('push-pr is the one step allowed to be unticked', () => {
    expectAllowed(activeRepo(handoffDoc({ ticks: { 'push-pr': null } })), PUSH)
  })

  it('a handoff without a progress section blocks', () => {
    const repo = activeRepo(handoffDoc().replace('## Workflow progress', '## Something else'))
    expectBlocked(repo, PUSH, '## Workflow progress')
  })

  it('ACTIVE-empty pushes check the progress block copied into the archive', () => {
    const repo = closedBranchRepo(archiveDoc({ ticks: { 'close-out': null, 'gate-push': null } }))
    expectBlocked(repo, PUSH, 'close-out', 'gate-push')
  })

  it('reads the step list from workflow-steps.json of the project root', () => {
    const repo = activeRepo(handoffDoc())
    const steps = JSON.parse(STEPS_JSON) as Array<Record<string, string>>
    steps.splice(2, 0, { id: 'extra-step', phase: 'pre-push', title: 'Extra', gate: 'human' })
    repo.write({ '.claude/workflow-steps.json': JSON.stringify(steps) })
    repo.commitAll('add a step')
    expectBlocked(repo, PUSH, 'extra-step')
  })
})

describe('commit rules that predate decision 057 still hold', () => {
  it('--no-verify and -n are blocked', () => {
    const repo = activeRepo(handoffDoc())
    expectBlocked(repo, 'git commit --no-verify -m x', 'Rule 09')
    expectBlocked(repo, 'git commit -n -m x', 'Rule 09')
  })

  it('prose that merely mentions git commit is ignored', () => {
    expectAllowed(activeRepo(null), 'echo "run git commit later"')
  })

  it('ACTIVE set but no contract blocks', () => {
    const repo = activeRepo(handoffDoc())
    repo.remove(`${TASK}/contract.md`)
    expectBlocked(repo, COMMIT, 'Rule 10')
  })

  it('a contract without Given/When/Then blocks', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [`${TASK}/contract.md`]: '# Contract\n\nnothing here\n' })
    expectBlocked(repo, COMMIT, 'Rule 10')
  })

  it('an active task without story.md blocks with a rule 10 message', () => {
    const repo = activeRepo(handoffDoc())
    repo.remove(`${TASK}/story.md`)
    expectBlocked(repo, COMMIT, 'Rule 10', 'story.md')
  })

  it('an active task with story and contract passes', () => {
    expectAllowed(activeRepo(handoffDoc()), COMMIT)
  })

  it('ACTIVE empty: staging a file outside .claude/ blocks', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '' })
    repo.write({ 'app/thing.ts': 'export {}\n' })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'Rule 10', 'outside .claude/')
  })

  it('ACTIVE empty: staging only .claude/ files passes', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '' })
    repo.write({ '.claude/backlog.md': '# backlog\n' })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
  })

  it('staging nuxt.config.ts or eslint.config.mjs without a decision file blocks', () => {
    for (const file of ['nuxt.config.ts', 'eslint.config.mjs']) {
      const repo = activeRepo(handoffDoc())
      repo.write({ [file]: 'export default {}\n' })
      repo.git('add', '-A')
      expectBlocked(repo, COMMIT, 'Rule 11')
      repo.write({ '.claude/docs/decisions/001-x.md': '# x\n' })
      repo.git('add', '-A')
      expectAllowed(repo, COMMIT)
    }
  })
})
