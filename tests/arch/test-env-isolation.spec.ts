// @vitest-environment node
import { describe, expect, it } from 'vitest'

const GIT_HOOK_VARIABLES = /^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|COMMON_DIR|PREFIX)$/

describe('test environment isolation', () => {
  it('tests do not inherit the git variables set by git hooks', () => {
    const leaked = Object.keys(process.env).filter((name) => GIT_HOOK_VARIABLES.test(name))
    expect(leaked).toEqual([])
  })
})
