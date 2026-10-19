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

interface TestReference {
  id: string
  mode: 'exact' | 'prefix' | 'unresolvable'
  line: number
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

function orphans(
  references: Array<TestReference & { file: string }>,
  components: ComponentIds,
  allowed: DynamicPrefix[]
): string[] {
  const allowedPrefixes = allowed.map((entry) => entry.prefix)
  const problems: string[] = []
  for (const ref of references) {
    const where = `${ref.file}:${ref.line}`
    if (ref.mode === 'unresolvable') {
      problems.push(`${where} references "${ref.id}", which is not a literal; use a literal id`)
    } else if (ref.mode === 'exact') {
      const covered =
        components.literals.has(ref.id) ||
        allowedPrefixes.some(
          (prefix) => ref.id.startsWith(prefix) && components.boundPrefixes.has(prefix)
        )
      if (!covered) problems.push(`${where} references "${ref.id}", which no component renders`)
    } else if (!allowedPrefixes.includes(ref.id) || !components.boundPrefixes.has(ref.id)) {
      problems.push(`${where} references the dynamic prefix "${ref.id}", which is not documented`)
    }
  }
  return problems
}

function isTestFile(file: string): boolean {
  return TEST_FILE.test(file)
}

interface Source {
  file: string
  text: string
}

function readSources(root: string, paths: string[]): Source[] {
  return paths
    .filter((file) => existsSync(join(root, file)))
    .map((file) => ({ file, text: readFileSync(join(root, file), 'utf8') }))
}

interface Scan {
  references: Array<TestReference & { file: string }>
  components: ComponentIds
}

let scanCount = 0

function scan(): Scan {
  scanCount++
  const files = trackedFiles()
  const references = readSources(ROOT, files.filter(isTestFile)).flatMap((source) =>
    testReferences(source.text).map((ref) => ({ ...ref, file: source.file }))
  )
  const components: ComponentIds = {
    literals: new Set(),
    boundPrefixes: new Set(),
    unresolvableBindings: [],
  }
  for (const source of readSources(
    ROOT,
    files.filter((f) => COMPONENT_FILE.test(f))
  )) {
    const ids = componentIds(source.text)
    ids.literals.forEach((id) => components.literals.add(id))
    ids.boundPrefixes.forEach((id) => components.boundPrefixes.add(id))
    components.unresolvableBindings.push(
      ...ids.unresolvableBindings.map((b) => `${source.file}: ${b}`)
    )
  }
  return { references, components }
}

describe('test ids referenced by tests exist in components (rule 20)', () => {
  let scanned: Scan

  beforeAll(() => {
    scanned = scan()
  })

  it('every test id used in tests exists in a component', () => {
    const { references, components } = scanned
    expect(
      references.length,
      'the scan found no test id references: the patterns broke'
    ).toBeGreaterThan(0)
    expect(
      components.literals.size,
      'the scan found no component test ids: the patterns broke'
    ).toBeGreaterThan(0)
    expect(orphans(references, components, DYNAMIC_PREFIXES)).toEqual([])
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
    const components = componentIds('<div data-testid="kept" /><i :data-testid="`row-${id}`" />')
    const references = testReferences(
      [
        "page.getByTestId('kept')",
        'page.getByTestId("gone")',
        'wrapper.find(\'[data-testid="also-gone"]\')',
        'page.locator(\'[data-testid^="row-"]\')',
        'page.getByTestId(`row-${1}`)',
        'page.getByTestId(someVariable)',
      ].join('\n')
    ).map((ref) => ({ ...ref, file: 'probe' }))
    const withoutAllowlist = orphans(references, components, [])
    expect(
      withoutAllowlist.filter((p) => p.includes('"gone"') || p.includes('"also-gone"'))
    ).toHaveLength(2)
    expect(withoutAllowlist.some((p) => p.includes('"kept"'))).toBe(false)
    expect(withoutAllowlist.some((p) => p.includes('dynamic prefix "row-"'))).toBe(true)
    expect(withoutAllowlist.some((p) => p.includes('someVariable'))).toBe(true)
    const allowed = [{ prefix: 'row-', reason: 'rows are numbered by the data' }]
    const withAllowlist = orphans(references, components, allowed)
    expect(withAllowlist.some((p) => p.includes('row-'))).toBe(false)
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
