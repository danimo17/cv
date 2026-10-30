// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scrubGitEnv } from '../setup/clean-git-env'

const REDIRECTING_VARIABLES = [
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_INDEX_FILE',
  'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_NAMESPACE',
  'GIT_PREFIX',
  'GIT_COMMON_DIR',
  'GIT_CONFIG_PARAMETERS',
  'GIT_CONFIG_COUNT',
  'GIT_CONFIG_KEY_0',
  'GIT_CONFIG_VALUE_0',
  'GIT_CONFIG_KEY_12',
  'GIT_CONFIG_VALUE_12',
]
const IDENTITY_VARIABLES = [
  'GIT_AUTHOR_NAME',
  'GIT_AUTHOR_EMAIL',
  'GIT_AUTHOR_DATE',
  'GIT_COMMITTER_NAME',
  'GIT_COMMITTER_EMAIL',
  'GIT_COMMITTER_DATE',
]
const KEPT_VARIABLES = [
  'PATH',
  'HOME',
  'GIT_EXEC_PATH',
  'GIT_CONFIG_GLOBAL',
  'GIT_CONFIG_KEY',
  'GITHUB_TOKEN',
]

describe('test environment isolation', () => {
  it('tests do not inherit the git variables set by git hooks', () => {
    const risky = [...REDIRECTING_VARIABLES, ...IDENTITY_VARIABLES]
    const leaked = Object.keys(process.env).filter((name) => risky.includes(name))
    expect(leaked).toEqual([])
  })

  it('scrubGitEnv removes every variable that redirects or re-identifies a git call', () => {
    const env: NodeJS.ProcessEnv = {}
    const risky = [...REDIRECTING_VARIABLES, ...IDENTITY_VARIABLES]
    for (const name of risky) env[name] = 'x'
    const removed = scrubGitEnv(env)
    expect(env).toEqual({})
    expect(removed.sort()).toEqual([...risky].sort())
  })

  it('scrubGitEnv leaves unrelated variables untouched', () => {
    const env: NodeJS.ProcessEnv = {}
    for (const name of KEPT_VARIABLES) env[name] = 'x'
    expect(scrubGitEnv(env)).toEqual([])
    expect(Object.keys(env).sort()).toEqual([...KEPT_VARIABLES].sort())
  })

  it('vitest.config.ts registers the setup file in setupFiles', () => {
    const config = readFileSync(join(process.cwd(), 'vitest.config.ts'), 'utf8')
    expect(config).toMatch(/setupFiles:\s*\[[^\]]*['"]tests\/setup\/clean-git-env\.ts['"]/)
  })
})
