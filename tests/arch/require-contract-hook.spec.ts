// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

// Every test builds a throwaway git repo and runs the REAL hook against it, either as the Claude
// hook (stdin JSON + CLAUDE_PROJECT_DIR) or through its CLI modes (--commit, --pre-push, --ci, cwd = repo).
// The real repo's git state is never touched. "@SHA@" in a fixture is replaced by a real commit sha of
// the throwaway repo when the file is written.

const ROOT = process.cwd()
const HOOK = join(ROOT, '.claude', 'hooks', 'require-contract.py')
const STEPS_JSON = readFileSync(join(ROOT, '.claude', 'workflow-steps.json'), 'utf8')
const SHA_STEPS = ['commit', 'review', 'close-out']
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

const ZERO_SHA = '0'.repeat(40)

interface Repo {
  dir: string
  sha: string
  fullSha: string
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
    sha: '',
    fullSha: '',
    git,
    write(files) {
      for (const [path, content] of Object.entries(files)) {
        mkdirSync(dirname(join(dir, path)), { recursive: true })
        writeFileSync(join(dir, path), content.replaceAll('@SHA@', repo.sha))
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
  repo.write({ '.claude/workflow-steps.json': STEPS_JSON })
  repo.commitAll('seed')
  repo.fullSha = git('rev-parse', 'HEAD').trim()
  repo.sha = repo.fullSha.slice(0, 10)
  repo.write(base)
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

function runCli(repo: Repo, args: string[], stdin = ''): { status: number | null; stderr: string } {
  const env = { ...process.env }
  delete env.CLAUDE_PROJECT_DIR
  const r = spawnSync('python3', [HOOK, ...args], {
    cwd: repo.dir,
    input: stdin,
    env,
    encoding: 'utf8',
  })
  return { status: r.status, stderr: r.stderr }
}

function expectCliBlocked(
  result: { status: number | null; stderr: string },
  ...fragments: string[]
): void {
  expect(result.status, `expected exit 2, stderr: ${result.stderr}`).toBe(2)
  for (const fragment of fragments) expect(result.stderr).toContain(fragment)
}

function expectCliAllowed(result: { status: number | null; stderr: string }): void {
  expect(result.status, `expected exit 0, stderr: ${result.stderr}`).toBe(0)
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
      const defaultEvidence = SHA_STEPS.includes(id) ? `@SHA@ (${id})` : `${id} done`
      const evidence = id in ticks ? ticks[id] : id === 'push-pr' ? null : defaultEvidence
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

  it('every problem is reported at once: review and progress together', () => {
    const repo = activeRepo(
      handoffDoc({
        review: '## Review\n\n- [ ] code-review ran\n',
        ticks: { build: null, review: null },
      })
    )
    expectBlocked(
      repo,
      PUSH,
      '2 problems',
      '## Review',
      'unchecked',
      '## Workflow progress',
      'build'
    )
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

  it('non-feat branch: ACTIVE keeps its meaning (set to a task without contract blocks)', () => {
    const repo = activeRepo(handoffDoc(), 'chore/x')
    repo.remove(`${TASK}/contract.md`)
    expectBlocked(repo, COMMIT, 'Rule 10', 'contract')
  })

  it('non-feat branch: ACTIVE set to a complete task passes', () => {
    expectAllowed(activeRepo(handoffDoc(), 'chore/x'), COMMIT)
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

  it('non-feat branch, ACTIVE empty: staging a file outside .claude/ blocks', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '' }, 'chore/x')
    repo.write({ 'app/thing.ts': 'export {}\n' })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'Rule 10', 'outside .claude/')
  })

  it('non-feat branch, ACTIVE empty: staging only .claude/ files passes', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '' }, 'chore/x')
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

describe('slug comes from the feat branch name, ACTIVE is ignored on feat branches', () => {
  it('commit: ACTIVE naming another task does not matter, the branch slug is checked', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': 'other\n',
      ...taskFiles(handoffDoc(), 'other'),
      ...taskFiles(handoffDoc()),
    })
    expectAllowed(repo, COMMIT)
  })

  it('commit: ACTIVE naming this task does not satisfy a branch whose slug has no task', () => {
    const repo = createRepo(
      { '.claude/tasks/ACTIVE': `${SLUG}\n`, ...taskFiles(handoffDoc()) },
      'feat/other'
    )
    expectBlocked(repo, COMMIT, 'Rule 10', '.claude/tasks/other/story.md')
  })

  it('commit: an empty or missing ACTIVE does not disable the checks on a feat branch', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': '' })
    repo.write({ 'app/thing.ts': 'export {}\n' })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'Rule 10', `${TASK}/story.md`)
    const noFile = createRepo({ 'README.md': 'x\n' })
    noFile.write({ 'app/thing.ts': 'export {}\n' })
    noFile.git('add', '-A')
    expectBlocked(noFile, COMMIT, 'Rule 10', `${TASK}/story.md`)
  })

  it('commit: a missing contract for the branch slug blocks even if ACTIVE points at a complete task', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': 'other\n',
      ...taskFiles(handoffDoc(), 'other'),
      [`${TASK}/story.md`]: STORY,
    })
    expectBlocked(repo, COMMIT, 'Rule 10', 'contract')
  })

  it('commit: after the task is closed on the branch only .claude/ files may be staged', () => {
    const repo = closedBranchRepo(archiveDoc())
    repo.write({ '.claude/backlog.md': '# backlog\n' })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
    repo.write({ 'app/thing.ts': 'export {}\n' })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'Rule 10', 'outside .claude/')
  })

  it('push: the handoff of the branch slug is gated, not the one ACTIVE points to', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': 'other\n',
      ...taskFiles(handoffDoc(), 'other'),
      ...taskFiles(handoffDoc({ ticks: { build: null } })),
    })
    expectBlocked(repo, PUSH, `${TASK}/handoff.md`, 'build')
  })

  it('push: a complete handoff of the branch slug passes whatever ACTIVE holds', () => {
    for (const active of ['', 'other\n', `${SLUG}\n`]) {
      const repo = createRepo({ '.claude/tasks/ACTIVE': active, ...taskFiles(handoffDoc()) })
      expectAllowed(repo, PUSH)
    }
  })

  it('push: a handoff in the tree is read even when ACTIVE is empty', () => {
    const repo = createRepo({
      '.claude/tasks/ACTIVE': '',
      ...taskFiles(handoffDoc({ review: null })),
    })
    expectBlocked(repo, PUSH, '## Review')
  })

  it('push: neither the handoff nor the archive in the tree blocks, naming both paths', () => {
    const repo = createRepo({ '.claude/tasks/ACTIVE': `${SLUG}\n` })
    expectBlocked(repo, PUSH, `${TASK}/handoff.md`, ARCHIVE, 'push-review-gate')
  })
})

describe('push gate follows the pushed refspec, not the checked-out branch', () => {
  const badRepo = (branch = `feat/${SLUG}`): Repo =>
    activeRepo(handoffDoc({ ticks: { build: null } }), branch)

  it('a feat branch pushed by name while another branch is checked out is gated', () => {
    const repo = badRepo()
    repo.git('switch', '-q', '-c', 'chore/x')
    expectBlocked(repo, `git push origin feat/${SLUG}`, 'build')
    expectBlocked(repo, `git push origin feat/${SLUG}:feat/${SLUG}`, 'build')
    expectBlocked(repo, `git push origin refs/heads/feat/${SLUG}:refs/heads/feat/${SLUG}`, 'build')
  })

  it('the destination decides: a clean source pushed to a feat branch without a task is blocked', () => {
    const repo = activeRepo(handoffDoc())
    expectBlocked(repo, 'git push origin HEAD:refs/heads/feat/other', '.claude/tasks/other/')
    expectBlocked(repo, `git push origin feat/${SLUG}:feat/other`, 'feat/other')
  })

  it('the tip of the source ref is gated, not the checked-out commit', () => {
    const repo = activeRepo(handoffDoc())
    repo.git('branch', 'good')
    repo.write({ [`${TASK}/handoff.md`]: handoffDoc({ ticks: { build: null } }) })
    repo.commitAll('regress the handoff')
    expectAllowed(repo, `git push origin good:feat/${SLUG}`)
    expectBlocked(repo, `git push origin HEAD:feat/${SLUG}`, 'build')
    expectBlocked(repo, `git push origin HEAD:refs/heads/feat/${SLUG}`, 'build')
    expectBlocked(repo, `git push origin feat/${SLUG}`, 'build')
  })

  it('flags, remote and a forced refspec are parsed', () => {
    const repo = badRepo()
    for (const cmd of [
      'git push --force origin HEAD',
      'git push -f origin HEAD',
      'git push -u origin HEAD',
      'git push --force-with-lease=feat/demo origin HEAD',
      `git push origin +feat/${SLUG}`,
      `git push --set-upstream --no-thin origin feat/${SLUG}`,
      `git push -o ci.skip origin feat/${SLUG}`,
      `git push origin HEAD:feat/${SLUG}; echo done`,
    ])
      expectBlocked(repo, cmd, 'build')
  })

  it('no refspec means the current branch', () => {
    expectBlocked(badRepo(), 'git push', 'build')
    expectBlocked(badRepo(), 'git push origin', 'build')
    expectAllowed(activeRepo(handoffDoc()), 'git push')
    expectAllowed(activeRepo(handoffDoc()), 'git push origin')
  })

  it('a detached HEAD with no refspec is blocked with a clear message', () => {
    const repo = activeRepo(handoffDoc())
    repo.git('checkout', '-q', '--detach')
    expectBlocked(repo, 'git push', 'detached')
    expectBlocked(repo, 'git push origin', 'detached')
  })

  it('a detached HEAD with an explicit feat destination is gated on HEAD', () => {
    const repo = badRepo()
    repo.git('checkout', '-q', '--detach')
    expectBlocked(repo, `git push origin HEAD:feat/${SLUG}`, 'build')
  })

  it('destinations that are not feat/* are not gated', () => {
    const repo = badRepo()
    expectAllowed(repo, 'git push origin HEAD:main')
    expectAllowed(repo, 'git push origin HEAD:chore/y')
    expectAllowed(repo, `git push origin feat/${SLUG}:refs/tags/v1`)
    expectAllowed(repo, 'git push origin --tags')
  })

  it('deleting a remote branch is not gated', () => {
    const repo = badRepo()
    expectAllowed(repo, `git push origin --delete feat/${SLUG}`)
    expectAllowed(repo, `git push -d origin feat/${SLUG}`)
    expectAllowed(repo, `git push origin :feat/${SLUG}`)
  })

  it('--all, --mirror and wildcard refspecs gate every local feat branch', () => {
    const repo = badRepo()
    repo.git('switch', '-q', 'main')
    expectBlocked(repo, 'git push --all origin', 'build')
    expectBlocked(repo, 'git push origin refs/heads/*:refs/heads/*', 'build')
    expectBlocked(repo, 'git push --mirror origin', 'build')
  })

  it('an unresolvable source blocks instead of skipping', () => {
    const repo = activeRepo(handoffDoc())
    expectBlocked(repo, `git push origin nope:feat/${SLUG}`, 'nope')
  })

  it('several pushes in one command are all gated', () => {
    const repo = activeRepo(handoffDoc())
    repo.git('branch', 'feat/bad')
    expectBlocked(repo, `git push origin feat/${SLUG}; git push origin feat/bad`, 'feat/bad')
  })
})

describe('git pre-push mode gates the pushed ref', () => {
  const line = (branch: string, sha: string, local = `refs/heads/${branch}`): string =>
    `${local} ${sha} refs/heads/${branch} ${ZERO_SHA}\n`
  const head = (repo: Repo): string => repo.git('rev-parse', 'HEAD').trim()

  it('a complete handoff passes', () => {
    const repo = activeRepo(handoffDoc())
    expectCliAllowed(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, head(repo))))
  })

  it('an incomplete handoff blocks and names the missing steps, with the Claude hook messages', () => {
    const repo = activeRepo(handoffDoc({ ticks: { build: null, validate: null } }))
    const result = runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, head(repo)))
    expectCliBlocked(
      result,
      'Rule 09 (push-review-gate)',
      '## Workflow progress',
      'build',
      'validate'
    )
    expect(result.stderr).toBe(runHook(repo, PUSH).stderr)
  })

  it('gates the pushed sha, not the checked-out HEAD', () => {
    const repo = activeRepo(handoffDoc())
    const good = head(repo)
    repo.write({ [`${TASK}/handoff.md`]: handoffDoc({ ticks: { build: null } }) })
    repo.commitAll('regress the handoff')
    expectCliAllowed(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, good)))
    expectCliBlocked(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, head(repo))), 'build')
  })

  it('gates feat branches while a non-feat branch is checked out', () => {
    const repo = activeRepo(handoffDoc({ ticks: { build: null } }))
    repo.git('switch', '-q', '-c', 'chore/x')
    expectCliBlocked(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, head(repo))), 'build')
  })

  it('the remote ref decides the slug and whether to gate', () => {
    const repo = activeRepo(handoffDoc())
    const stdin = `refs/heads/local-name ${head(repo)} refs/heads/feat/other ${ZERO_SHA}\n`
    expectCliBlocked(runCli(repo, ['--pre-push'], stdin), '.claude/tasks/other/')
    expectCliAllowed(runCli(repo, ['--pre-push'], line('chore/x', head(repo))))
    const others =
      `refs/tags/v1 ${head(repo)} refs/tags/v1 ${ZERO_SHA}\n` +
      `refs/heads/main ${head(repo)} refs/heads/main ${head(repo)}\n`
    expectCliAllowed(runCli(repo, ['--pre-push'], others))
  })

  it('deleting a remote branch (all-zero local sha) is not gated', () => {
    const repo = activeRepo(handoffDoc({ ticks: { build: null } }))
    const stdin = `(delete) ${ZERO_SHA} refs/heads/feat/${SLUG} ${head(repo)}\n`
    expectCliAllowed(runCli(repo, ['--pre-push'], stdin))
  })

  it('every pushed ref is gated: one bad ref blocks the whole push', () => {
    const repo = activeRepo(handoffDoc())
    const good = head(repo)
    repo.write({ [`${TASK}/handoff.md`]: handoffDoc({ ticks: { build: null } }) })
    repo.commitAll('regress the handoff')
    const stdin = line(`feat/${SLUG}`, good) + line(`feat/${SLUG}`, head(repo))
    expectCliBlocked(runCli(repo, ['--pre-push'], stdin), 'build')
  })

  it('an empty stdin (nothing to push) passes', () => {
    expectCliAllowed(runCli(activeRepo(handoffDoc()), ['--pre-push'], ''))
  })

  it('a closed archive in the pushed tree is read', () => {
    const repo = closedBranchRepo(archiveDoc())
    expectCliAllowed(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, head(repo))))
    const bad = closedBranchRepo(archiveDoc({ checklist: '- [ ] still to do' }))
    expectCliBlocked(
      runCli(bad, ['--pre-push'], line(`feat/${SLUG}`, head(bad))),
      'unchecked',
      'still to do'
    )
  })

  it('ACTIVE in the working tree and the checked-out branch are irrelevant', () => {
    const repo = activeRepo(handoffDoc())
    const good = head(repo)
    repo.git('switch', '-q', 'main')
    repo.write({ '.claude/tasks/ACTIVE': 'other\n' })
    expectCliAllowed(runCli(repo, ['--pre-push'], line(`feat/${SLUG}`, good)))
  })
})

describe('--commit and --ci CLI modes run the same checks', () => {
  it('--commit blocks and allows exactly like the Claude hook on git commit', () => {
    const repo = activeRepo(handoffDoc())
    expectCliAllowed(runCli(repo, ['--commit']))
    repo.remove(`${TASK}/contract.md`)
    const blocked = runCli(repo, ['--commit'])
    expectCliBlocked(blocked, 'Rule 10', 'contract')
    expect(blocked.stderr).toBe(runHook(repo, COMMIT).stderr)
  })

  it('--commit checks the staged close archive and progress evidence', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, null)
    expectCliBlocked(runCli(repo, ['--commit']), ARCHIVE, 'task-close-gate')
    const tick = activeRepo(handoffDoc())
    tick.write({ [`${TASK}/handoff.md`]: handoffDoc({ ticks: { build: '' } }) })
    tick.git('add', '-A')
    expectCliBlocked(runCli(tick, ['--commit']), 'build', 'evidence')
  })

  it('--commit ignores CLAUDE_PROJECT_DIR and works on the repository of the cwd', () => {
    const repo = activeRepo(handoffDoc())
    const other = activeRepo(handoffDoc())
    other.remove(`${TASK}/contract.md`)
    const r = spawnSync('python3', [HOOK, '--commit'], {
      cwd: repo.dir,
      env: { ...process.env, CLAUDE_PROJECT_DIR: other.dir },
      encoding: 'utf8',
    })
    expect(r.status, r.stderr).toBe(0)
  })

  it('--ci <branch> <sha> gates the given commit like a push', () => {
    const repo = activeRepo(handoffDoc())
    const good = repo.git('rev-parse', 'HEAD').trim()
    expectCliAllowed(runCli(repo, ['--ci', `feat/${SLUG}`, good]))
    repo.write({ [`${TASK}/handoff.md`]: handoffDoc({ ticks: { review: null } }) })
    repo.commitAll('regress')
    const bad = repo.git('rev-parse', 'HEAD').trim()
    expectCliBlocked(runCli(repo, ['--ci', `feat/${SLUG}`, bad]), 'review', 'push-review-gate')
    expectCliAllowed(runCli(repo, ['--ci', `feat/${SLUG}`, good]))
  })

  it('--ci accepts refs/heads/ prefixes, skips non-feat branches and rejects bad usage', () => {
    const repo = activeRepo(handoffDoc({ ticks: { build: null } }))
    const sha = repo.git('rev-parse', 'HEAD').trim()
    expectCliBlocked(runCli(repo, ['--ci', `refs/heads/feat/${SLUG}`, sha]), 'build')
    expectCliAllowed(runCli(repo, ['--ci', 'dependabot/npm_and_yarn/x', sha]))
    expectCliBlocked(runCli(repo, ['--ci', `feat/${SLUG}`]), 'usage')
    expectCliBlocked(runCli(repo, ['--ci', `feat/${SLUG}`, 'f'.repeat(40)]), 'f'.repeat(40))
  })

  it('--ci reads a closed archive from the given commit', () => {
    const repo = closedBranchRepo(archiveDoc())
    const sha = repo.git('rev-parse', 'HEAD').trim()
    expectCliAllowed(runCli(repo, ['--ci', `feat/${SLUG}`, sha]))
  })

  it('an unknown mode is rejected', () => {
    expectCliBlocked(runCli(activeRepo(handoffDoc()), ['--nope']), 'usage')
  })
})

describe('evidence must be a real commit sha for commit/review/close-out', () => {
  const handoffPath = `${TASK}/handoff.md`
  const stage = (ticks: Ticks): Repo => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: handoffDoc({ ticks }) })
    repo.git('add', '-A')
    return repo
  }

  it.each(SHA_STEPS)(
    '%s: free text or an unknown sha blocks at commit time and names the step',
    (id) => {
      expectBlocked(stage({ [id]: 'looks good to me' }), COMMIT, id, 'sha')
      expectBlocked(stage({ [id]: 'deadbee' }), COMMIT, id, 'sha')
      expectBlocked(stage({ [id]: `${'a'.repeat(40)} (no such commit)` }), COMMIT, id)
    }
  )

  it.each(SHA_STEPS)('%s: a real short, long or embedded sha passes', (id) => {
    expectAllowed(stage({ [id]: '@SHA@' }), COMMIT)
    const long = stage({ [id]: 'x' })
    long.write({ [handoffPath]: handoffDoc({ ticks: { [id]: long.fullSha } }) })
    long.git('add', '-A')
    expectAllowed(long, COMMIT)
    const seven = stage({ [id]: 'x' })
    seven.write({ [handoffPath]: handoffDoc({ ticks: { [id]: seven.fullSha.slice(0, 7) } }) })
    seven.git('add', '-A')
    expectAllowed(seven, COMMIT)
    expectAllowed(stage({ [id]: 'reviewed at @SHA@, code-review high, 2026-10-05' }), COMMIT)
  })

  it('a hex token shorter than 7 characters is not enough', () => {
    const repo = stage({ review: 'x' })
    repo.write({ [handoffPath]: handoffDoc({ ticks: { review: repo.fullSha.slice(0, 6) } }) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'review')
  })

  it('a sha glued to other word characters does not count', () => {
    expectBlocked(stage({ commit: 'zz@SHA@zz' }), COMMIT, 'commit')
  })

  it('a branch name that is not hex is not accepted as evidence', () => {
    expectBlocked(stage({ review: 'feat/demo HEAD' }), COMMIT, 'review')
  })

  it('every other step stays free text, only non-empty', () => {
    const repo = stage({
      story: 'a note',
      contract: 'criteria 1-16',
      build: 'ok',
      consolidate: 'gate green',
      validate: 'seen',
      handoff: 'written',
      'gate-push': 'green',
      'push-pr': 'PR #1',
    })
    expectAllowed(repo, COMMIT)
  })

  it('an empty evidence and a bad sha are both named', () => {
    expectBlocked(stage({ build: '', review: 'nope' }), COMMIT, 'build', 'review')
  })

  it('an unticked sha step with no evidence is fine', () => {
    expectAllowed(stage({ review: null, commit: null, 'close-out': null }), COMMIT)
  })

  it('the close archive gets the same check at commit time', () => {
    const repo = activeRepo(handoffDoc())
    stageClose(repo, archiveDoc({ ticks: { 'close-out': 'not a sha' } }))
    expectBlocked(repo, COMMIT, 'close-out', 'sha')
  })

  it('push: a handoff in HEAD with an unresolvable sha blocks', () => {
    for (const id of SHA_STEPS) {
      const repo = activeRepo(handoffDoc({ ticks: { [id]: 'deadbee' } }))
      expectBlocked(repo, PUSH, id, 'sha')
    }
  })

  it('push: the archive in HEAD with a non-sha review evidence blocks', () => {
    const repo = closedBranchRepo(archiveDoc({ ticks: { review: 'checked it' } }))
    expectBlocked(repo, PUSH, 'review', 'sha')
  })

  it('push: real shas pass', () => {
    expectAllowed(activeRepo(handoffDoc()), PUSH)
    expectAllowed(closedBranchRepo(archiveDoc()), PUSH)
  })

  it('git modes resolve the sha in the repo being checked', () => {
    const repo = activeRepo(handoffDoc({ ticks: { review: 'deadbee' } }))
    const stdin = `refs/heads/feat/demo ${repo.fullSha} refs/heads/feat/demo ${ZERO_SHA}\n`
    const head = repo.git('rev-parse', 'HEAD').trim()
    expectCliBlocked(runCli(repo, ['--pre-push'], stdin.replace(repo.fullSha, head)), 'review')
  })
})

describe('uppercase [X] ticks are parsed', () => {
  const handoffPath = `${TASK}/handoff.md`
  const upper = (doc: string): string => doc.replaceAll('- [x] ', '- [X] ')

  it('an uppercase tick with empty evidence blocks at commit time', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: upper(handoffDoc({ ticks: { build: '' } })) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'build', 'evidence')
  })

  it('an uppercase tick with evidence passes', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: upper(handoffDoc({ ticks: { build: 'done' } })) })
    repo.git('add', '-A')
    expectAllowed(repo, COMMIT)
  })

  it('an uppercase tick on a sha step is sha-checked', () => {
    const repo = activeRepo(handoffDoc())
    repo.write({ [handoffPath]: upper(handoffDoc({ ticks: { commit: 'nope' } })) })
    repo.git('add', '-A')
    expectBlocked(repo, COMMIT, 'commit', 'sha')
  })

  it('push: a fully [X]-ticked handoff passes, a missing evidence still blocks', () => {
    expectAllowed(activeRepo(upper(handoffDoc())), PUSH)
    expectBlocked(activeRepo(upper(handoffDoc({ ticks: { validate: '' } }))), PUSH, 'validate')
  })

  it('archive: [X] boxes count as checked, a ticked push-pr in [X] passes', () => {
    const repo = activeRepo(handoffDoc())
    const checklist = '- [X] verified\n- [X] backlog row set to `done`'
    stageClose(repo, upper(archiveDoc({ checklist, ticks: { 'push-pr': 'PR #1' } })))
    expectAllowed(repo, COMMIT)
  })

  it('archive push gate: an [X]-ticked archive passes', () => {
    expectAllowed(closedBranchRepo(upper(archiveDoc())), PUSH)
  })
})
