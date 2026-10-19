// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

// Rule 20: a test must never reference a data-testid that no component renders. The scan reads the text of
// every tracked or new (non-ignored) test file (e2e/**/*.ts and tests/unit/**, helpers and page objects
// included) and every component, comments stripped, so a renamed or removed id fails the gate instead of
// failing a Playwright run later. Ids a test file supplies itself (attrs, stubs, inline templates) count as
// rendered for that file only. What cannot be resolved to a literal (a regex, a prop, a *= or $= selector, an
// id a component builds at run time) is accepted only through ALLOWLISTS, each entry with a reason.

const ROOT = process.cwd()

interface Allowed {
  value: string
  reason: string
}

interface Allowlists {
  prefixes: Allowed[]
  exact: Allowed[]
  unresolved: Allowed[]
}

const ALLOWLISTS: Allowlists = { prefixes: [], exact: [], unresolved: [] }

const TEST_FILE = /^(e2e\/.+\.(?:ts|js|mts|mjs)|tests\/unit\/.+\.(?:ts|js|vue))$/
const COMPONENT_FILE = /^app\/.+\.vue$/

const BY_TEST_ID = /\b(?:get|find|query)(?:All)?ByTestId\(/g
const SELECTOR = /\[data-testid([\^*$~|])?=\s*\\?["']?([^"'\\\]]+)/g
const COMPONENT_LITERAL = /(?<![:\w-])data-testid=(["'])([^"'$]+)\1/g
const COMPONENT_BOUND = /:data-testid=(["'])([^]*?)\1/g
const CONSTANT =
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*string)?\s*=\s*(['"`])((?:(?!\2)[^\\\n])*)\2(?:\s+as\s+const)?\s*(?=[;,\n]|$)/g
const SELF_DEFINED = [
  /['"]data-testid['"]\s*:\s*(['"`])([^'"`$]+)\1/g,
  /(?<!\[)data-testid=\\?(["'])([^"'\\$]+)\\?\1/g,
  /setAttribute\(\s*['"]data-testid['"]\s*,\s*(['"`])([^'"`$]+)\1/g,
]

type Mode = 'exact' | 'prefix' | 'dashprefix' | 'unresolvable'

interface TestReference {
  id: string
  mode: Mode
  line: number
}

interface Resolved {
  id: string
  mode: 'exact' | 'prefix'
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

function readArgument(text: string, start: number): string {
  let quote = ''
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i] as string
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = ''
    } else if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) {
      if (depth === 0) return text.slice(start, i)
      depth--
    } else if (ch === ',' && depth === 0) return text.slice(start, i)
  }
  return text.slice(start)
}

function splitTernary(expression: string): [string, string] | null {
  let quote = ''
  let depth = 0
  let question = -1
  let nested = 0
  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i] as string
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = ''
    } else if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth--
    else if (
      depth === 0 &&
      ch === '?' &&
      expression[i + 1] !== '.' &&
      expression[i + 1] !== '?' &&
      expression[i - 1] !== '?'
    ) {
      if (question === -1) question = i
      else nested++
    } else if (depth === 0 && ch === ':' && question !== -1) {
      if (nested === 0) return [expression.slice(question + 1, i), expression.slice(i + 1)]
      nested--
    }
  }
  return null
}

function resolveExpression(
  expression: string,
  constants: Map<string, string>,
  depth = 0
): Resolved[] | null {
  const expr = expression.trim()
  if (depth > 5 || expr === '') return null
  const literal = /^(['"`])((?:(?!\1)[^\\])*)\1(?:\s+as\s+const)?$/.exec(expr)
  if (literal) {
    const text = literal[2] as string
    const prefix = prefixBeforeInterpolation(text)
    return [prefix === null ? { id: text, mode: 'exact' } : { id: prefix, mode: 'prefix' }]
  }
  const concatenated = /^(['"`])([^'"`$]+)\1\s*\+/.exec(expr)
  if (concatenated) return [{ id: concatenated[2] as string, mode: 'prefix' }]
  const ternary = splitTernary(expr)
  if (ternary) {
    const whenTrue = resolveExpression(ternary[0], constants, depth + 1)
    const whenFalse = resolveExpression(ternary[1], constants, depth + 1)
    return whenTrue && whenFalse ? [...whenTrue, ...whenFalse] : null
  }
  const constant = constants.get(expr)
  if (constant !== undefined) return resolveExpression(constant, constants, depth + 1)
  return null
}

function constantsOf(text: string): Map<string, string> {
  const constants = new Map<string, string>()
  for (const m of text.matchAll(CONSTANT)) {
    constants.set(m[1] as string, `${m[2]}${m[3]}${m[2]}`)
  }
  return constants
}

function selectorReference(
  operator: string | undefined,
  value: string,
  line: number
): TestReference {
  if (operator === undefined) return { id: value, mode: 'exact', line }
  if (operator === '^') return { id: value, mode: 'prefix', line }
  if (operator === '|') return { id: value, mode: 'dashprefix', line }
  if (operator === '~' && !/\s/.test(value)) return { id: value, mode: 'exact', line }
  return { id: `[data-testid${operator}="${value}"]`, mode: 'unresolvable', line }
}

function testReferences(source: string): TestReference[] {
  const constants = constantsOf(source)
  const found: TestReference[] = []
  for (const m of source.matchAll(BY_TEST_ID)) {
    const line = lineOf(source, m.index ?? 0)
    const expression = readArgument(source, (m.index ?? 0) + m[0].length).trim()
    const resolved = resolveExpression(expression, constants)
    if (resolved) for (const r of resolved) found.push({ id: r.id, mode: r.mode, line })
    else found.push({ id: expression, mode: 'unresolvable', line })
  }
  for (const m of source.matchAll(SELECTOR)) {
    found.push(selectorReference(m[1], m[2] as string, lineOf(source, m.index ?? 0)))
  }
  return found
}

interface ComponentIds {
  literals: Set<string>
  boundPrefixes: Set<string>
  unresolvableBindings: Array<{ file: string; expression: string }>
}

function componentIds(source: string, file = ''): ComponentIds {
  const literals = new Set<string>()
  const boundPrefixes = new Set<string>()
  const unresolvableBindings: ComponentIds['unresolvableBindings'] = []
  for (const m of source.matchAll(COMPONENT_LITERAL)) literals.add(m[2] as string)
  for (const m of source.matchAll(COMPONENT_BOUND)) {
    const expression = (m[2] as string).trim()
    const resolved = resolveExpression(expression, new Map())
    if (!resolved) {
      unresolvableBindings.push({ file, expression })
      continue
    }
    for (const r of resolved) (r.mode === 'exact' ? literals : boundPrefixes).add(r.id)
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
    const ids = componentIds(stripComments(source.text), source.file)
    ids.literals.forEach((id) => merged.literals.add(id))
    ids.boundPrefixes.forEach((id) => merged.boundPrefixes.add(id))
    merged.unresolvableBindings.push(...ids.unresolvableBindings)
  }
  return merged
}

function withDefaults(allowed: Partial<Allowlists>): Allowlists {
  return { prefixes: [], exact: [], unresolved: [], ...allowed }
}

function orphans(
  tests: TestSource[],
  components: ComponentIds,
  allowed: Partial<Allowlists>
): string[] {
  const lists = withDefaults(allowed)
  const allowedPrefixes = lists.prefixes.map((entry) => entry.value)
  const allowedExact = new Set(lists.exact.map((entry) => entry.value))
  const allowedUnresolved = new Set(lists.unresolved.map((entry) => entry.value))
  const problems: string[] = []
  for (const test of tests) {
    const known = (id: string) =>
      components.literals.has(id) || test.defined.has(id) || allowedExact.has(id)
    for (const ref of test.references) {
      const where = `${test.file}:${ref.line}`
      if (ref.mode === 'unresolvable') {
        if (!allowedUnresolved.has(ref.id)) {
          problems.push(
            `${where} references "${ref.id}", which is not a literal; use a literal id, a same-file string constant or an allowlist entry with a reason`
          )
        }
      } else if (ref.mode === 'exact') {
        const covered =
          known(ref.id) ||
          allowedPrefixes.some(
            (prefix) => ref.id.startsWith(prefix) && components.boundPrefixes.has(prefix)
          )
        if (!covered) problems.push(`${where} references "${ref.id}", which no component renders`)
      } else if (ref.mode === 'dashprefix') {
        const covered =
          [...components.literals, ...test.defined, ...allowedExact].some(
            (id) => id === ref.id || id.startsWith(`${ref.id}-`)
          ) ||
          allowedPrefixes.some(
            (prefix) =>
              components.boundPrefixes.has(prefix) &&
              (prefix.startsWith(`${ref.id}-`) || `${ref.id}-`.startsWith(prefix))
          )
        if (!covered) {
          problems.push(
            `${where} references "${ref.id}" or "${ref.id}-...", which no component renders`
          )
        }
      } else if (!allowedPrefixes.includes(ref.id) || !components.boundPrefixes.has(ref.id)) {
        problems.push(`${where} references the dynamic prefix "${ref.id}", which is not documented`)
      }
    }
  }
  return problems
}

function bindingProblems(components: ComponentIds, allowed: Partial<Allowlists>): string[] {
  const lists = withDefaults(allowed)
  const prefixes = new Set(lists.prefixes.map((entry) => entry.value))
  const unresolved = new Set(lists.unresolved.map((entry) => entry.value))
  return [
    ...[...components.boundPrefixes]
      .filter((prefix) => !prefixes.has(prefix))
      .map((prefix) => `a component binds the dynamic prefix "${prefix}", which is not documented`),
    ...components.unresolvableBindings
      .filter((binding) => !unresolved.has(binding.expression))
      .map(
        (binding) =>
          `${binding.file} binds data-testid to "${binding.expression}", which is not a literal; document it with a reason`
      ),
  ]
}

function allowlistProblems(
  tests: TestSource[],
  components: ComponentIds,
  allowed: Partial<Allowlists>
): string[] {
  const lists = withDefaults(allowed)
  const references = tests.flatMap((test) => test.references)
  const problems: string[] = []
  const checks: Array<[string, Allowed[], (value: string) => boolean]> = [
    ['prefix', lists.prefixes, (value) => components.boundPrefixes.has(value)],
    [
      'exact id',
      lists.exact,
      (value) => references.some((ref) => ref.mode === 'exact' && ref.id === value),
    ],
    [
      'unresolved expression',
      lists.unresolved,
      (value) =>
        references.some((ref) => ref.mode === 'unresolvable' && ref.id === value) ||
        components.unresolvableBindings.some((binding) => binding.expression === value),
    ],
  ]
  for (const [kind, entries, inUse] of checks) {
    for (const entry of entries) {
      if (entry.reason.trim().length <= 10) {
        problems.push(`${kind} "${entry.value}" has no reason`)
      }
      if (!inUse(entry.value)) problems.push(`${kind} "${entry.value}" is not used by anything`)
    }
  }
  return problems
}

function problemsFor(
  tests: Source[],
  components: Source[],
  allowed: Partial<Allowlists> = {}
): string[] {
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
    expect(orphans(tests, components, ALLOWLISTS)).toEqual([])
  })

  it('every dynamic data-testid binding in a component is a documented prefix', () => {
    expect(bindingProblems(scanned.components, ALLOWLISTS)).toEqual([])
  })

  it('every allowlist entry has a reason and is still in use', () => {
    expect(allowlistProblems(scanned.tests, scanned.components, ALLOWLISTS)).toEqual([])
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
    const withoutAllowlist = problemsFor(tests, components)
    expect(
      withoutAllowlist.filter((p) => p.includes('"gone"') || p.includes('"also-gone"'))
    ).toHaveLength(2)
    expect(withoutAllowlist.some((p) => p.includes('"kept"'))).toBe(false)
    expect(withoutAllowlist.some((p) => p.includes('dynamic prefix "row-"'))).toBe(true)
    expect(withoutAllowlist.some((p) => p.includes('someVariable'))).toBe(true)
    const allowed = { prefixes: [{ value: 'row-', reason: 'rows are numbered by the data' }] }
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
    expect(problemsFor([owner], components)).toEqual([])
    const problems = problemsFor([owner, other], components)
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
    expect(problemsFor([ignored], components)).toEqual([])
    const problems = problemsFor([real], components)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('"commented-out"')
    expect(problems[0]).toContain('e2e/real.spec.ts:1')
  })

  it('a ternary of literals in a component binding renders every branch', () => {
    const components = [
      {
        file: 'app/Toggle.vue',
        text: [
          "<i :data-testid=\"open ? 'toggle-open' : 'toggle-closed'\" />",
          "<b :data-testid=\"a ? 'deep-a' : b ? 'deep-b' : 'deep-c'\" />",
        ].join('\n'),
      },
    ]
    const tests = [
      {
        file: 'e2e/toggle.spec.ts',
        text: ['toggle-open', 'toggle-closed', 'deep-a', 'deep-b', 'deep-c', 'toggle-gone']
          .map((id) => `page.getByTestId('${id}')`)
          .join('\n'),
      },
    ]
    expect(bindingProblems(analyzeComponents(components), {})).toEqual([])
    const problems = problemsFor(tests, components)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('"toggle-gone"')
  })

  it('an exact id allowlist entry covers an id a component builds at run time', () => {
    const components = [{ file: 'app/Slot.vue', text: '<i :data-testid="idFromProp" />' }]
    const tests = [{ file: 'e2e/slot.spec.ts', text: "page.getByTestId('slot-main')" }]
    expect(problemsFor(tests, components).join('\n')).toContain('"slot-main"')
    const allowed = {
      exact: [{ value: 'slot-main', reason: 'the page passes this id into the slot' }],
      unresolved: [{ value: 'idFromProp', reason: 'the id arrives as a prop of the slot' }],
    }
    expect(problemsFor(tests, components, allowed)).toEqual([])
    expect(bindingProblems(analyzeComponents(components), {}).join('\n')).toContain('idFromProp')
    expect(bindingProblems(analyzeComponents(components), allowed)).toEqual([])
  })

  it('a same-file string constant resolves a test id argument', () => {
    const components = [{ file: 'app/Card.vue', text: '<div data-testid="card" />' }]
    const resolved = {
      file: 'e2e/constants.spec.ts',
      text: ["const CARD = 'card'", 'const ROW = `row-${1}`', 'page.getByTestId(CARD)'].join('\n'),
    }
    const missing = {
      file: 'e2e/missing.spec.ts',
      text: ["const GONE = 'gone-id'", 'page.getByTestId(GONE)', 'page.getByTestId(CARD)'].join(
        '\n'
      ),
    }
    expect(problemsFor([resolved], components)).toEqual([])
    const problems = problemsFor([missing], components)
    expect(problems.some((p) => p.includes('"gone-id"'))).toBe(true)
    expect(problems.some((p) => p.includes('"CARD"') && p.includes('literal'))).toBe(true)
  })

  it('regex arguments and unresolved expressions need an explicit allowlist entry', () => {
    const components = [{ file: 'app/Meme.vue', text: '<div data-testid="meme-card" />' }]
    const tests = [
      {
        file: 'e2e/regex.spec.ts',
        text: ['page.getByTestId(/^meme-(card|use)$/)', 'page.getByTestId(items[0].id)'].join('\n'),
      },
    ]
    const without = problemsFor(tests, components)
    expect(without).toHaveLength(2)
    expect(without[0]).toContain('/^meme-(card|use)$/')
    expect(without[1]).toContain('items[0].id')
    const allowed = {
      unresolved: [
        { value: '/^meme-(card|use)$/', reason: 'matches every meme control at once' },
        { value: 'items[0].id', reason: 'the id comes from the seeded fixture item' },
      ],
    }
    expect(problemsFor(tests, components, allowed)).toEqual([])
  })

  it('attribute selector operators are supported or fail loudly', () => {
    const components = [
      { file: 'app/Lang.vue', text: '<i data-testid="lang-en" /><b data-testid="meme-card" />' },
    ]
    const supported = {
      file: 'e2e/operators.spec.ts',
      text: [
        'page.locator(\'[data-testid~="meme-card"]\')',
        'page.locator(\'[data-testid|="lang"]\')',
        'page.locator(\'[data-testid~="meme-gone"]\')',
        'page.locator(\'[data-testid|="nothing"]\')',
      ].join('\n'),
    }
    const problems = problemsFor([supported], components)
    expect(problems).toHaveLength(2)
    expect(problems.join('\n')).toContain('"meme-gone"')
    expect(problems.join('\n')).toContain('"nothing"')
    const loud = {
      file: 'e2e/loud.spec.ts',
      text: [
        'page.locator(\'[data-testid*="card"]\')',
        'page.locator(\'[data-testid$="-use"]\')',
      ].join('\n'),
    }
    const loudProblems = problemsFor([loud], components)
    expect(loudProblems).toHaveLength(2)
    expect(loudProblems[0]).toContain('[data-testid*="card"]')
    expect(loudProblems[1]).toContain('[data-testid$="-use"]')
    const allowed = {
      unresolved: [
        { value: '[data-testid*="card"]', reason: 'any card control is accepted here' },
        { value: '[data-testid$="-use"]', reason: 'any use control is accepted here' },
      ],
    }
    expect(problemsFor([loud], components, allowed)).toEqual([])
  })

  it('stale or reasonless allowlist entries are reported', () => {
    const components = [{ file: 'app/Row.vue', text: '<i :data-testid="`row-${id}`" />' }]
    const tests = [{ file: 'e2e/row.spec.ts', text: 'page.getByTestId(`row-${1}`)' }]
    const healthy = { prefixes: [{ value: 'row-', reason: 'rows are numbered by the data' }] }
    expect(
      allowlistProblems(tests.map(analyzeTest), analyzeComponents(components), healthy)
    ).toEqual([])
    const broken = {
      prefixes: [
        { value: 'row-', reason: 'short' },
        { value: 'col-', reason: 'columns are numbered by the data' },
      ],
      exact: [{ value: 'unused-id', reason: 'nothing references this id any more' }],
      unresolved: [{ value: 'gone()', reason: 'nothing uses this expression any more' }],
    }
    const problems = allowlistProblems(
      tests.map(analyzeTest),
      analyzeComponents(components),
      broken
    )
    expect(problems).toHaveLength(4)
    expect(problems.join('\n')).toContain('"row-" has no reason')
    expect(problems.join('\n')).toContain('"col-"')
    expect(problems.join('\n')).toContain('"unused-id"')
    expect(problems.join('\n')).toContain('"gone()"')
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
