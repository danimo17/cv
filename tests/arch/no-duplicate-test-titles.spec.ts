// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Rule 09 / review policy (decision 057, third review): a finding is fixed by strengthening an existing test,
// never by adding a second test with the same title. Scope is the nearest enclosing describe, found by
// indentation (the specs are prettier-formatted, so a describe body is indented deeper than its header).

const ROOT = process.cwd()
const SPEC_DIRS = ['tests', 'e2e']
const CALL = /^(\s*)(it|test|describe)(?:\.\w+)*\(\s*(['"`])((?:\\.|(?!\3).)*)\3/
const CALL_EACH = /^(\s*)(it|test|describe)\.each\b/
const EACH_TITLE = /\)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/

interface Entry {
  scope: string
  kind: string
  title: string
  line: number
}

function specFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...specFiles(path))
    else if (/\.spec\.ts$/.test(entry.name)) found.push(path)
  }
  return found
}

function titles(source: string): Entry[] {
  const lines = source.split('\n')
  const stack: Array<{ indent: number; id: string }> = []
  const found: Entry[] = []
  lines.forEach((text, index) => {
    let indent: number
    let kind: string
    let title: string | undefined
    const direct = CALL.exec(text)
    if (direct) {
      indent = direct[1]!.length
      kind = direct[2]!
      title = direct[4]
    } else {
      const each = CALL_EACH.exec(text)
      if (!each) return
      indent = each[1]!.length
      kind = each[2]!
      const window = lines.slice(index, index + 40).join('\n')
      title = EACH_TITLE.exec(window)?.[2]
    }
    if (title === undefined) return
    while (stack.length && stack[stack.length - 1]!.indent >= indent) stack.pop()
    const scope = stack.length ? stack[stack.length - 1]!.id : 'root'
    const line = index + 1
    found.push({ scope, kind: kind === 'describe' ? 'describe' : 'test', title, line })
    if (kind === 'describe') stack.push({ indent, id: `${scope}>${title}@${line}` })
  })
  return found
}

describe('no duplicate test titles helper', () => {
  it('scopes titles by their enclosing describe', () => {
    const source = [
      "describe('a', () => {",
      "  it('x', () => {})",
      "  it('x', () => {})",
      '})',
      "describe('b', () => {",
      "  it('x', () => {})",
      '})',
      "it.each([1, 2])('n %s', () => {})",
    ].join('\n')
    const found = titles(source)
    expect(found.map((e) => `${e.scope.split('@')[0]}|${e.title}`)).toEqual([
      'root|a',
      'root>a|x',
      'root>a|x',
      'root|b',
      'root>b|x',
      'root|n %s',
    ])
  })
})

describe('no spec file repeats a test title', () => {
  const files = SPEC_DIRS.flatMap((dir) => specFiles(join(ROOT, dir)))

  it('finds the spec files', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it('within each spec file no it/test/describe title is repeated in the same describe scope', () => {
    const duplicates: string[] = []
    for (const file of files) {
      const seen = new Map<string, number>()
      for (const entry of titles(readFileSync(file, 'utf8'))) {
        const key = `${entry.scope}|${entry.kind}|${entry.title}`
        const first = seen.get(key)
        if (first !== undefined)
          duplicates.push(
            `${relative(ROOT, file)}:${entry.line} repeats "${entry.title}" (first at line ${first})`
          )
        else seen.set(key, entry.line)
      }
    }
    expect(
      duplicates,
      'strengthen or merge the existing test instead of adding a second one with the same title'
    ).toEqual([])
  })
})
