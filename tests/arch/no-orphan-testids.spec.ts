// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

// Rule 20: a test must never reference a data-testid that no component renders. The scan reads the text of
// every tracked or new (non-ignored) test file and component, so a renamed or removed id fails the gate
// instead of failing a Playwright run later. Dynamic ids (a template literal or concatenation in a
// component) are only accepted through DYNAMIC_PREFIXES, each with a reason.

const ROOT = process.cwd()

interface DynamicPrefix {
  prefix: string
  reason: string
}

const DYNAMIC_PREFIXES: DynamicPrefix[] = []

const TEST_FILE = /^(e2e\/.+\.(?:ts|js|mts|mjs)|tests\/unit\/.+\.(?:ts|js|vue))$/
const COMPONENT_FILE = /^app\/.+\.vue$/

const BY_TEST_ID = /\b(?:get|find|query)(?:All)?ByTestId\(\s*(?:(['"`])([^]*?)\1|([^\s)'"`][^)]*))/g
const SELECTOR = /\[data-testid(\^|\*|\$)?=\s*\\?["']?([^"'\\\]]+)/g
const COMPONENT_LITERAL = /(?<![:\w-])data-testid=(["'])([^"'$]+)\1/g
const COMPONENT_BOUND = /:data-testid=(["'])([^]*?)\1/g
const SELF_DEFINED = [
  /['"]data-testid['"]\s*:\s*(['"`])([^'"`$]+)\1/g,
  /(?<!\[)data-testid=\\?(["'])([^"'\\$]+)\\?\1/g,
  /setAttribute\(\s*['"]data-testid['"]\s*,\s*(['"`])([^'"`$]+)\1/g,
]

interface TestReference {
  id: string
  mode: 'exact' | 'prefix' | 'unresolvable'
  line: number
}

function stripComments(text: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, ' ')
  return text
    .replace(/<!--[^]*?-->/g, blank)
    .replace(/\/\*[^]*?\*\//g, blank)
    .replace(
      /(^|[\s;,{(])(\/\/[^\n]*)/g,
      (_match: string, lead: string, comment: string) => lead + blank(comment)
    )
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function prefixBeforeInterpolation(text: string): string | null {
  const template = text.indexOf('${')
  return template === -1 ? null : text.slice(0, template)
}

function testReferences(source: string): TestReference[] {
  const found: TestReference[] = []
  for (const m of source.matchAll(BY_TEST_ID)) {
    const line = lineOf(source, m.index ?? 0)
    if (m[3] !== undefined) {
      found.push({ id: m[3].trim(), mode: 'unresolvable', line })
      continue
    }
    const text = m[2] as string
    const prefix = prefixBeforeInterpolation(text)
    if (prefix === null) found.push({ id: text, mode: 'exact', line })
    else found.push({ id: prefix, mode: 'prefix', line })
  }
  for (const m of source.matchAll(SELECTOR)) {
    const line = lineOf(source, m.index ?? 0)
    const operator = m[1]
    const value = m[2] as string
    found.push({
      id: value,
      mode: operator === '^' ? 'prefix' : operator ? 'unresolvable' : 'exact',
      line,
    })
  }
  return found
}

interface ComponentIds {
  literals: Set<string>
  boundPrefixes: Set<string>
  unresolvableBindings: string[]
}

function componentIds(source: string): ComponentIds {
  const literals = new Set<string>()
  const boundPrefixes = new Set<string>()
  const unresolvableBindings: string[] = []
  for (const m of source.matchAll(COMPONENT_LITERAL)) literals.add(m[2] as string)
  for (const m of source.matchAll(COMPONENT_BOUND)) {
    const expression = (m[2] as string).trim()
    const quoted = /^(['"`])([^]*?)\1$/.exec(expression)
    if (quoted) {
      const prefix = prefixBeforeInterpolation(quoted[2] as string)
      if (prefix === null) literals.add(quoted[2] as string)
      else boundPrefixes.add(prefix)
      continue
    }
    const concatenated = /^(['"`])([^'"`$]+)\1\s*\+/.exec(expression)
    if (concatenated) boundPrefixes.add(concatenated[2] as string)
    else unresolvableBindings.push(expression)
  }
  return { literals, boundPrefixes, unresolvableBindings }
}

function trackedFiles(): string[] {
  const run = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  expect(run.status, run.stderr).toBe(0)
  return run.stdout.split('\n').filter(Boolean)
}

interface Source {
  file: string
  text: string
}

interface TestSource {
  file: string
  references: TestReference[]
  defined: Set<string>
}

function isTestFile(file: string): boolean {
  return TEST_FILE.test(file)
}

function readSources(root: string, paths: string[]): Source[] {
  return paths
    .filter((file) => existsSync(join(root, file)))
    .map((file) => ({ file, text: readFileSync(join(root, file), 'utf8') }))
}

function analyzeTest(source: Source): TestSource {
  const text = stripComments(source.text)
  const defined = new Set<string>()
  for (const pattern of SELF_DEFINED) {
    for (const m of text.matchAll(pattern)) defined.add(m[2] as string)
  }
  return { file: source.file, references: testReferences(text), defined }
}

function analyzeComponents(sources: Source[]): ComponentIds {
  const merged: ComponentIds = {
    literals: new Set(),
    boundPrefixes: new Set(),
    unresolvableBindings: [],
  }
  for (const source of sources) {
    const ids = componentIds(stripComments(source.text))
    ids.literals.forEach((id) => merged.literals.add(id))
    ids.boundPrefixes.forEach((id) => merged.boundPrefixes.add(id))
    merged.unresolvableBindings.push(...ids.unresolvableBindings.map((b) => `${source.file}: ${b}`))
  }
  return merged
}

function orphans(
  tests: TestSource[],
  components: ComponentIds,
  allowed: DynamicPrefix[]
): string[] {
  const allowedPrefixes = allowed.map((entry) => entry.prefix)
  const problems: string[] = []
  for (const test of tests) {
    for (const ref of test.references) {
      const where = `${test.file}:${ref.line}`
      if (ref.mode === 'unresolvable') {
        problems.push(`${where} references "${ref.id}", which is not a literal; use a literal id`)
      } else if (ref.mode === 'exact') {
        const covered =
          components.literals.has(ref.id) ||
          test.defined.has(ref.id) ||
          allowedPrefixes.some(
            (prefix) => ref.id.startsWith(prefix) && components.boundPrefixes.has(prefix)
          )
        if (!covered) problems.push(`${where} references "${ref.id}", which no component renders`)
      } else if (!allowedPrefixes.includes(ref.id) || !components.boundPrefixes.has(ref.id)) {
        problems.push(`${where} references the dynamic prefix "${ref.id}", which is not documented`)
      }
    }
  }
  return problems
}

function problemsFor(tests: Source[], components: Source[], allowed: DynamicPrefix[]): string[] {
  return orphans(tests.map(analyzeTest), analyzeComponents(components), allowed)
}

interface Scan {
  tests: TestSource[]
  components: ComponentIds
}

let scanCount = 0

function scan(): Scan {
  scanCount++
  const files = trackedFiles()
  return {
    tests: readSources(ROOT, files.filter(isTestFile)).map(analyzeTest),
    components: analyzeComponents(
      readSources(
        ROOT,
        files.filter((f) => COMPONENT_FILE.test(f))
      )
    ),
  }
}

describe('test ids referenced by tests exist in components (rule 20)', () => {
  let scanned: Scan

  beforeAll(() => {
    scanned = scan()
  })

  it('every test id used in tests exists in a component', () => {
    const { tests, components } = scanned
    const referenceCount = tests.reduce((total, test) => total + test.references.length, 0)
    expect(
      referenceCount,
      'the scan found no test id references: the patterns broke'
    ).toBeGreaterThan(0)
    expect(
      components.literals.size,
      'the scan found no component test ids: the patterns broke'
    ).toBeGreaterThan(0)
    expect(orphans(tests, components, DYNAMIC_PREFIXES)).toEqual([])
  })

  it('every dynamic data-testid binding in a component is a documented prefix', () => {
    const { components } = scanned
    const documented = DYNAMIC_PREFIXES.map((entry) => entry.prefix)
    expect([...components.boundPrefixes].filter((prefix) => !documented.includes(prefix))).toEqual(
      []
    )
    expect(components.unresolvableBindings).toEqual([])
  })

  it('every documented dynamic prefix has a reason and a matching component binding', () => {
    const { components } = scanned
    for (const entry of DYNAMIC_PREFIXES) {
      expect(entry.reason.trim().length, `reason for ${entry.prefix}`).toBeGreaterThan(10)
      expect(components.boundPrefixes.has(entry.prefix), `binding for ${entry.prefix}`).toBe(true)
    }
  })

  it('the scanner reports an orphan id and accepts a rendered one', () => {
    const components = [
      {
        file: 'app/Row.vue',
        text: '<div data-testid="kept" /><i :data-testid="`row-${id}`" />',
      },
    ]
    const tests = [
      {
        file: 'e2e/probe.spec.ts',
        text: [
          "page.getByTestId('kept')",
          'page.getByTestId("gone")',
          'wrapper.find(\'[data-testid="also-gone"]\')',
          'page.locator(\'[data-testid^="row-"]\')',
          'page.getByTestId(`row-${1}`)',
          'page.getByTestId(someVariable)',
        ].join('\n'),
      },
    ]
    const withoutAllowlist = problemsFor(tests, components, [])
    expect(
      withoutAllowlist.filter((p) => p.includes('"gone"') || p.includes('"also-gone"'))
    ).toHaveLength(2)
    expect(withoutAllowlist.some((p) => p.includes('"kept"'))).toBe(false)
    expect(withoutAllowlist.some((p) => p.includes('dynamic prefix "row-"'))).toBe(true)
    expect(withoutAllowlist.some((p) => p.includes('someVariable'))).toBe(true)
    const allowed = [{ prefix: 'row-', reason: 'rows are numbered by the data' }]
    const withAllowlist = problemsFor(tests, components, allowed)
    expect(withAllowlist.some((p) => p.includes('row-'))).toBe(false)
  })

  it('ids a test supplies itself are defined for that test file only', () => {
    const components = [{ file: 'app/Empty.vue', text: '<div />' }]
    const owner = {
      file: 'tests/unit/components/Own.spec.ts',
      text: [
        "mount(Cmp, { attrs: { 'data-testid': 'from-attrs' } })",
        'const Stub = { template: \'<div data-testid="from-stub" />\' }',
        'const html = `<i data-testid="from-html"></i>`',
        'wrapper.find(\'[data-testid="from-attrs"]\')',
        "wrapper.findByTestId('from-stub')",
        'wrapper.find(\'[data-testid="from-html"]\')',
      ].join('\n'),
    }
    const other = {
      file: 'tests/unit/components/Other.spec.ts',
      text: 'wrapper.find(\'[data-testid="from-attrs"]\')',
    }
    expect(problemsFor([owner], components, [])).toEqual([])
    const problems = problemsFor([owner, other], components, [])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('Other.spec.ts')
    expect(problems[0]).toContain('"from-attrs"')
  })

  it('ids that only appear in comments neither count as references nor as rendered ids', () => {
    const components = [
      { file: 'app/Old.vue', text: '<!-- <div data-testid="commented-out" /> --><i />' },
    ]
    const ignored = {
      file: 'e2e/ignored.spec.ts',
      text: [
        "// page.getByTestId('dead-line')",
        "/* page.getByTestId('dead-block') */",
        "const url = 'https://example.com'",
      ].join('\n'),
    }
    const real = {
      file: 'e2e/real.spec.ts',
      text: "page.getByTestId('commented-out') // page.getByTestId('trailing')",
    }
    expect(problemsFor([ignored], components, [])).toEqual([])
    const problems = problemsFor([real], components, [])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('"commented-out"')
    expect(problems[0]).toContain('e2e/real.spec.ts:1')
  })

  it('a tracked file deleted from the working tree is skipped instead of crashing the scan', () => {
    const dir = mkdtempSync(join(tmpdir(), 'orphan-scan-'))
    try {
      mkdirSync(join(dir, 'e2e'))
      writeFileSync(join(dir, 'e2e', 'kept.spec.ts'), "page.getByTestId('kept')")
      const sources = readSources(dir, ['e2e/gone.spec.ts', 'e2e/kept.spec.ts'])
      expect(sources.map((source) => source.file)).toEqual(['e2e/kept.spec.ts'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('e2e helpers, page objects and fixtures are scanned like the specs', () => {
    for (const file of [
      'e2e/meme-flow.spec.ts',
      'e2e/helpers/open-menu.ts',
      'e2e/pages/MemePage.ts',
      'e2e/fixtures/seed.js',
      'tests/unit/components/MemeCard.spec.ts',
      'tests/unit/helpers/mount.ts',
      'tests/unit/stubs/Stub.vue',
    ]) {
      expect(isTestFile(file), file).toBe(true)
    }
    for (const file of [
      'tests/arch/no-orphan-testids.spec.ts',
      'app/components/cv/Hero.vue',
      'e2e/data.json',
      'playwright.config.ts',
    ]) {
      expect(isTestFile(file), file).toBe(false)
    }
  })

  it('the repository is scanned once for the whole file', () => {
    expect(scanCount).toBe(1)
  })
})
