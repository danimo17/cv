// @vitest-environment node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const COMPONENTS_DIR = join(ROOT, 'app', 'components')
const COMPONENTS_DOC = join(ROOT, '.claude', 'docs', 'catalog', 'components.md')
const STATE_DOC = join(ROOT, '.claude', 'docs', 'catalog', 'state.md')

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function tsFiles(dir: string): string[] {
  return walk(dir).filter((f) => f.endsWith('.ts'))
}

function headings(doc: string): Set<string> {
  expect(existsSync(doc), `missing living doc ${doc}`).toBe(true)
  const out = new Set<string>()
  for (const m of readFileSync(doc, 'utf8').matchAll(/^###\s+(\S+)\s*$/gm)) out.add(m[1] as string)
  return out
}

function exportedNames(file: string, ...patterns: RegExp[]): string[] {
  const src = readFileSync(file, 'utf8')
  return patterns.flatMap((pattern) => [...src.matchAll(pattern)].map((m) => m[1] as string))
}

const FUNCTION_EXPORT = /export\s+(?:async\s+)?function\s+(\w+)/g
const CONST_EXPORT = /export\s+const\s+(\w+)\s*=/g
const CLASS_EXPORT = /export\s+class\s+(\w+)/g
const STORE_EXPORT = /export const (use\w+Store)/g

function expectDocumented(names: string[], doc: string, what: string) {
  const documented = headings(doc)
  const missing = names.filter((name) => !documented.has(name))
  expect(missing, `${what} without a ${basename(doc)} block: ${missing.join(', ')}`).toEqual([])
}

describe('living docs stay in sync (regla 07)', () => {
  it('every component has a ### block in .claude/docs/catalog/components.md', () => {
    const documented = headings(COMPONENTS_DOC)
    const components = walk(COMPONENTS_DIR)
      .filter((f) => f.endsWith('.vue'))
      .map((f) => basename(f, '.vue'))
    expect(components.length).toBeGreaterThan(0)
    const missing = components.filter((name) => !documented.has(name))
    expect(missing, `components without a catalog block: ${missing.join(', ')}`).toEqual([])
  })

  it('every documented component still exists', () => {
    const documented = headings(COMPONENTS_DOC)
    const components = new Set(
      walk(COMPONENTS_DIR)
        .filter((f) => f.endsWith('.vue'))
        .map((f) => basename(f, '.vue'))
    )
    const stale = [...documented].filter((name) => !components.has(name))
    expect(stale, `catalog blocks for deleted components: ${stale.join(', ')}`).toEqual([])
  })

  it('every store is documented in .claude/docs/catalog/state.md', () => {
    const stores = tsFiles(join(ROOT, 'app', 'stores')).flatMap((f) =>
      exportedNames(f, STORE_EXPORT)
    )
    expect(stores.length).toBeGreaterThan(0)
    expectDocumented(stores, STATE_DOC, 'stores')
  })

  it('every composable is documented in .claude/docs/catalog/state.md', () => {
    const names = tsFiles(join(ROOT, 'app', 'composables')).flatMap((f) =>
      exportedNames(f, FUNCTION_EXPORT, CONST_EXPORT)
    )
    expect(names.length).toBeGreaterThan(0)
    expectDocumented(names, STATE_DOC, 'composables')
  })

  it('every util is documented in .claude/docs/catalog/state.md', () => {
    // app/utils may not exist (decision 029: pure rules live in app/domain).
    const names = tsFiles(join(ROOT, 'app', 'utils')).flatMap((f) =>
      exportedNames(f, FUNCTION_EXPORT, CONST_EXPORT)
    )
    expectDocumented(names, STATE_DOC, 'utils')
  })

  it('every service class is documented in .claude/docs/catalog/state.md (decisió 029)', () => {
    const names = tsFiles(join(ROOT, 'app', 'services')).flatMap((f) =>
      exportedNames(f, CLASS_EXPORT)
    )
    expect(names.length).toBeGreaterThan(0)
    expectDocumented(names, STATE_DOC, 'services')
  })

  it('every exported domain function is documented in .claude/docs/catalog/state.md', () => {
    const names = tsFiles(join(ROOT, 'app', 'domain')).flatMap((f) =>
      exportedNames(f, FUNCTION_EXPORT)
    )
    expect(names.length).toBeGreaterThan(0)
    expectDocumented(names, STATE_DOC, 'domain functions')
  })

  it('every ui-config export is documented in .claude/docs/catalog/state.md', () => {
    const names = tsFiles(join(ROOT, 'app', 'ui-config')).flatMap((f) =>
      exportedNames(f, FUNCTION_EXPORT, CONST_EXPORT)
    )
    expect(names.length).toBeGreaterThan(0)
    expectDocumented(names, STATE_DOC, 'ui-config exports')
  })
})
