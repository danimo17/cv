// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Decision 058 (contract criteria 35-36): the CI `audit` job (`pnpm audit --audit-level=high`) is a required
// check. Every `overrides` entry in pnpm-workspace.yaml must force a patched floor that a decision explains,
// the lockfile must hold nothing inside the vulnerable range, and every ignored advisory must be documented.

const ROOT = process.cwd()
const WORKSPACE = join(ROOT, 'pnpm-workspace.yaml')
const LOCKFILE = join(ROOT, 'pnpm-lock.yaml')
const DECISIONS_DIR = join(ROOT, '.claude', 'docs', 'decisions')

type Version = [number, number, number]

function unquote(text: string): string {
  return text.replace(/^(['"])(.*)\1$/, '$2')
}

function section(lines: string[], name: string): string[] {
  const start = lines.findIndex((line) => line === `${name}:`)
  if (start === -1) return []
  const body: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (line && !/^\s/.test(line)) break
    body.push(line)
  }
  return body
}

function workspace(): {
  overrides: Array<[string, string]>
  ignored: string[]
  patched: Array<[string, string]>
} {
  const lines = readFileSync(WORKSPACE, 'utf8').split('\n')
  const overrides: Array<[string, string]> = []
  for (const line of section(lines, 'overrides')) {
    const match = /^ {2}(.+?):\s+(.+)$/.exec(line)
    if (match) overrides.push([unquote(match[1]!.trim()), unquote(match[2]!.trim())])
  }
  const audit = section(lines, 'auditConfig')
  const ignored = audit
    .filter((line) => /^\s+-\s/.test(line))
    .map((line) => unquote(line.replace(/^\s+-\s+/, '').trim()))
  const patched: Array<[string, string]> = []
  for (const line of section(lines, 'patchedDependencies')) {
    const match = /^ {2}(.+?):\s+(.+)$/.exec(line)
    if (match) patched.push([unquote(match[1]!.trim()), unquote(match[2]!.trim())])
  }
  return { overrides, ignored, patched }
}

function parseVersion(text: string): Version | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(text)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined
}

function compare(a: Version, b: Version): number {
  for (let index = 0; index < 3; index++) {
    if (a[index]! !== b[index]!) return a[index]! - b[index]!
  }
  return 0
}

function splitSelector(selector: string): { name: string; comparators: string[] } {
  const at = selector.lastIndexOf('@')
  return { name: selector.slice(0, at), comparators: selector.slice(at + 1).split(/\s+/) }
}

function inRange(version: Version, comparators: string[]): boolean {
  return comparators.every((comparator) => {
    const match = /^(>=|<=|>|<|=)?(\d+\.\d+\.\d+)$/.exec(comparator)
    if (!match) return false
    const order = compare(version, parseVersion(match[2]!)!)
    switch (match[1]) {
      case '>=':
        return order >= 0
      case '<=':
        return order <= 0
      case '>':
        return order > 0
      case '<':
        return order < 0
      default:
        return order === 0
    }
  })
}

function patchedBound(comparators: string[], floor: Version): string | undefined {
  const exclusive = comparators.find((comparator) => /^<\d/.test(comparator))
  if (exclusive) {
    const patched = parseVersion(exclusive.slice(1))!
    return compare(floor, patched) >= 0
      ? undefined
      : `floor ${floor.join('.')} is below the patched version ${exclusive.slice(1)}`
  }
  const inclusive = comparators.find((comparator) => /^<=\d/.test(comparator))
  if (inclusive) {
    const vulnerable = parseVersion(inclusive.slice(2))!
    return compare(floor, vulnerable) > 0
      ? undefined
      : `floor ${floor.join('.')} is not above the last vulnerable version ${inclusive.slice(2)}`
  }
  return 'the vulnerable range needs an upper bound, "<patched" or "<=last-vulnerable"'
}

function resolvedVersions(name: string): Version[] {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  const entry = new RegExp(`^ {2}'?${escaped}@(\\d+\\.\\d+\\.\\d+[^'(:\\s]*)'?:`)
  const found: Version[] = []
  for (const line of readFileSync(LOCKFILE, 'utf8').split('\n')) {
    const match = entry.exec(line)
    const version = match ? parseVersion(match[1]!) : undefined
    if (version) found.push(version)
  }
  return found
}

function ignoreEntry(
  text: string,
  ghsa: string
): { name: string; comparators: string[] } | undefined {
  const match = new RegExp(`\`${ghsa}\`:\\s*\`([^\`\\s]+)\`((?:[\\s,]*\`[<>=]+[^\`]*\`)+)`).exec(
    text
  )
  if (!match) return undefined
  const comparators = [...match[2]!.matchAll(/`([^`]+)`/g)].flatMap((token) =>
    token[1]!.split(/\s+/)
  )
  return { name: match[1]!, comparators }
}

function decisions(): Array<{ file: string; text: string }> {
  return readdirSync(DECISIONS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ file, text: readFileSync(join(DECISIONS_DIR, file), 'utf8') }))
}

describe('audit overrides and ignored advisories (decisions 056, 058)', () => {
  it('every audit override has a patched floor and every ignored advisory is documented', () => {
    const { overrides, ignored } = workspace()
    expect(overrides.length).toBeGreaterThan(0)
    const docs = decisions()
    for (const [selector, value] of overrides) {
      const { name, comparators } = splitSelector(selector)
      const floor = /^\^(\d+\.\d+\.\d+)$/.exec(value)
      expect(
        floor,
        `${selector}: the override value must be a caret range "^x.y.z", got "${value}"`
      ).not.toBeNull()
      expect(
        patchedBound(comparators, parseVersion(floor![1]!)!),
        `${selector}: ${value} does not clear the vulnerable range`
      ).toBeUndefined()
      const documented = docs.filter(
        ({ text }) => text.includes(`\`${selector}\``) && text.includes(`\`${value}\``)
      )
      expect(
        documented.length,
        `${selector} → ${value} is not explained in any decision`
      ).toBeGreaterThan(0)
      const vulnerable = resolvedVersions(name).filter((version) => inRange(version, comparators))
      expect(
        vulnerable,
        `${selector}: pnpm-lock.yaml still resolves ${name} inside the vulnerable range`
      ).toEqual([])
    }
    for (const ghsa of ignored) {
      expect(ghsa, 'ignoreGhsas entries are GHSA ids').toMatch(/^GHSA(-[2-9cfghjmpqrvwx]{4}){3}$/)
    }
  })

  it('audit override selectors may close the vulnerable range with <= when the floor is above it', () => {
    expect(patchedBound(['>=1.4.1', '<=1.6.7'], [1, 6, 8])).toBeUndefined()
    expect(patchedBound(['<=20.14.5'], [20, 14, 6])).toBeUndefined()
    expect(patchedBound(['>=1.4.1', '<=1.6.7'], [1, 6, 7])).toMatch(/not above the last vulnerable/)
    expect(patchedBound(['>=2.0.0', '<2.3.0'], [2, 3, 0])).toBeUndefined()
    expect(patchedBound(['>=2.0.0', '<2.3.0'], [2, 2, 9])).toMatch(/below the patched version/)
    expect(patchedBound(['>=2.0.0'], [2, 3, 0])).toMatch(/needs an upper bound/)
  })

  it('every ignored advisory is documented in a decision', () => {
    const { ignored } = workspace()
    const docs = decisions()
    for (const ghsa of ignored) {
      const blocks = docs.flatMap(({ file, text }) =>
        text
          .split(/\n(?=\s*- )|\n\s*\n/)
          .filter((block) => block.includes(ghsa))
          .map((block) => ({ file, block }))
      )
      expect(blocks.length, `${ghsa} is not named in any decision`).toBeGreaterThan(0)
      const complete = blocks.some(({ block }) => {
        const packages = [...block.matchAll(/`([@a-z0-9][^`\s]*)`/g)]
          .map((match) => match[1]!)
          .filter((token) => token !== ghsa && !token.startsWith('GHSA-'))
        return packages.length > 0 && /remove[- ]when/i.test(block)
      })
      expect(
        complete,
        `${ghsa}: its decision entry needs the package name and a remove-when condition`
      ).toBe(true)
    }
  })

  it('every ignored advisory still matches a version the lockfile resolves', () => {
    const { ignored } = workspace()
    const docs = decisions()
    for (const ghsa of ignored) {
      const entry = docs.map(({ text }) => ignoreEntry(text, ghsa)).find((found) => found)
      expect(
        entry,
        `${ghsa}: a decision needs an entry written as "\`${ghsa}\`: \`package\` \`<range>\`"`
      ).toBeDefined()
      expect(
        resolvedVersions(entry!.name).some((version) => inRange(version, entry!.comparators)),
        `${ghsa}: pnpm-lock.yaml no longer resolves ${entry!.name} inside ${entry!.comparators.join(' ')}, so the ignore is stale; remove it from auditConfig.ignoreGhsas with a dated note in its decision`
      ).toBe(true)
    }
  })

  it('an ignore entry is read as its package and its full vulnerable range', () => {
    const text =
      '- `GHSA-aaaa-bbbb-cccc`: `pkg` `>=1.0.0` `<2.0.0`, reached via x. See `GHSA-aaaa-bbbb-cccc` later.'
    expect(ignoreEntry(text, 'GHSA-aaaa-bbbb-cccc')).toEqual({
      name: 'pkg',
      comparators: ['>=1.0.0', '<2.0.0'],
    })
    expect(ignoreEntry('- `GHSA-x`: `pkg` `<=3.0.3`, y', 'GHSA-x')?.comparators).toEqual([
      '<=3.0.3',
    ])
    expect(ignoreEntry('mentions GHSA-x in prose only', 'GHSA-x')).toBeUndefined()
    expect(inRange([0, 9, 0], ['>=1.0.0', '<2.0.0'])).toBe(false)
  })

  it('the lockfile resolves simple-git only at or above the 4.0.1 advisory fix', () => {
    const versions = resolvedVersions('simple-git')
    expect(
      versions.filter((version) => compare(version, [4, 0, 1]) < 0),
      'simple-git below 4.0.1 is inside GHSA-x6jw-m9v5-85vh / GHSA-g4wm-2vf7-vfgr / GHSA-858h-whjf-mvg5'
    ).toEqual([])
  })

  it('the lockfile resolves the advisory packages of decisions 061, 062 and 064 only at or above their patched versions', () => {
    const advisories: Array<[string, Version, Version, string]> = [
      [
        '@modelcontextprotocol/server',
        [2, 0, 0],
        [2, 3, 0],
        'GHSA-jm63-cq47-j5jp / GHSA-46jr-4wx8-v453',
      ],
      ['vite', [8, 3, 0], [8, 3, 3], 'GHSA-587h-7wmj-h5pm'],
      ['launch-editor', [0, 0, 0], [2, 14, 2], 'GHSA-587h-7wmj-h5pm'],
      ['zod', [0, 0, 0], [4, 6, 6], 'GHSA-mrhx-c7xc-m3w5'],
      ['happy-dom', [0, 0, 0], [21, 0, 4], 'GHSA-834v-8h66-3h79 / GHSA-c8p4-j97h-3vg8'],
      ['undici', [7, 0, 0], [7, 30, 1], 'GHSA-xjj6-f33q-929c / GHSA-4w7w-5xrc-9h26'],
      ['undici', [8, 0, 0], [8, 12, 2], 'GHSA-xjj6-f33q-929c / GHSA-4w7w-5xrc-9h26'],
      ['seroval', [0, 0, 0], [1, 6, 8], 'GHSA-97r2-qh9m-474h / GHSA-wp97-x4hv-qvhp'],
      ['@intlify/shared', [11, 1, 10], [11, 4, 14], 'GHSA-83rm-6c8r-g728'],
      ['@intlify/core', [11, 1, 10], [11, 4, 14], 'GHSA-83rm-6c8r-g728'],
      ['@intlify/core-base', [11, 1, 10], [11, 4, 14], 'GHSA-83rm-6c8r-g728'],
      ['vue-i18n', [11, 1, 10], [11, 4, 14], 'GHSA-83rm-6c8r-g728'],
      ['node-forge', [0, 0, 0], [1, 4, 1], 'GHSA-7wch-p9px-956x / GHSA-jc66-7q78-782g'],
      ['serialize-javascript', [0, 0, 0], [7, 1, 3], 'GHSA-gfhx-hw2g-v5hg / GHSA-m5mm-p8h7-m29v'],
      ['glob', [9, 0, 0], [14, 0, 2], 'GHSA-3g3m-2fjr-6pw4'],
      ['nuxt', [3, 13, 0], [4, 6, 2], 'GHSA-vjh5-4x84-xrqp / GHSA-xfq5-w38q-pc2x'],
      ['@nuxt/nitro-server', [4, 2, 0], [4, 6, 2], 'GHSA-vjh5-4x84-xrqp'],
      ['@nuxt/vite-builder', [3, 0, 0], [4, 6, 3], 'GHSA-648h-gw55-m2g7'],
    ]
    for (const [name, from, patched, advisory] of advisories) {
      const versions = resolvedVersions(name)
      expect(versions.length, `pnpm-lock.yaml no longer resolves ${name} at all`).toBeGreaterThan(0)
      expect(
        versions.filter((version) => compare(version, from) >= 0 && compare(version, patched) < 0),
        `${name} in ${from.join('.')} to ${patched.join('.')} (exclusive) is inside ${advisory}`
      ).toEqual([])
    }
  })

  it('the lockfile resolves a single vue version so the Nuxt auto-import types augment it', () => {
    const versions = [...new Set(resolvedVersions('vue').map((version) => version.join('.')))]
    expect(
      versions,
      'two vue copies make vue-tsc miss the ComponentCustomProperties of .nuxt/types/imports.d.ts (decision 064)'
    ).toHaveLength(1)
  })

  it('the catalog paragraph on this arch test is well formed prose', () => {
    const catalog = readFileSync(join(ROOT, '.claude', 'docs', 'catalog', 'ai-workflow.md'), 'utf8')
    const start = catalog.indexOf('**Arch test `tests/arch/audit-overrides.spec.ts`**')
    expect(
      start,
      'the catalog lost the audit-overrides arch test paragraph'
    ).toBeGreaterThanOrEqual(0)
    const paragraph = catalog.slice(start, catalog.indexOf('\n\n', start))
    expect(paragraph.split('`').length % 2, 'unbalanced backticks in the catalog paragraph').toBe(1)
    expect(paragraph.split('(').length, 'unbalanced parentheses in the catalog paragraph').toBe(
      paragraph.split(')').length
    )
    expect(
      paragraph,
      'the removed simple-git patch scenario must not be described as live'
    ).not.toContain('contains `simpleGit as Git`')
  })

  it('every decision that explains an audit override carries a remove-when condition', () => {
    const { overrides } = workspace()
    const docs = decisions()
    for (const [selector, value] of overrides) {
      const explaining = docs.filter(
        ({ text }) => text.includes(`\`${selector}\``) && text.includes(`\`${value}\``)
      )
      expect(
        explaining.some(({ text }) => /remove[- ]when/i.test(text)),
        `${selector} → ${value}: its decision needs a remove-when condition`
      ).toBe(true)
    }
  })

  it('every patched dependency has an existing patch file that still matches the locked version', () => {
    const { patched } = workspace()
    const patchesDir = join(ROOT, 'patches')
    const patchFiles = existsSync(patchesDir) ? readdirSync(patchesDir) : []
    expect(
      patchFiles
        .map((file) => `patches/${file}`)
        .filter((file) => !patched.some(([, patch]) => patch === file)),
      'a file under patches/ that no patchedDependencies entry references is an orphan, delete it'
    ).toEqual([])
    for (const [target, patchPath] of patched) {
      expect(patchPath, `${target}: patch files live under patches/`).toMatch(
        /^patches\/[^/]+\.patch$/
      )
      expect(existsSync(join(ROOT, patchPath)), `${target}: ${patchPath} does not exist`).toBe(true)
      const text = readFileSync(join(ROOT, patchPath), 'utf8')
      const at = target.lastIndexOf('@')
      const name = target.slice(0, at)
      const version = parseVersion(target.slice(at + 1))
      expect(version, `${target}: a patch target needs an exact version`).toBeDefined()
      expect(
        resolvedVersions(name).some((resolved) => compare(resolved, version!) === 0),
        `${target}: pnpm-lock.yaml resolves ${name} at another version; the patch is stale, remove it with its patchedDependencies entry and the overrides that only it needed`
      ).toBe(true)
      expect(text.trim().length, `${patchPath}: the patch file is empty`).toBeGreaterThan(0)
    }
  })

  it('every patched dependency is documented in a decision with a remove-when condition', () => {
    const { patched } = workspace()
    const docs = decisions()
    for (const [target, patchPath] of patched) {
      const blocks = docs.flatMap(({ text }) =>
        text.split(/\n\s*\n/).filter((block) => block.includes(target) && block.includes(patchPath))
      )
      expect(
        blocks.length,
        `${target} (${patchPath}) is not named in any decision`
      ).toBeGreaterThan(0)
      expect(
        blocks.some((block) => /remove[- ]when/i.test(block)),
        `${target}: its decision entry needs a remove-when condition`
      ).toBe(true)
    }
  })
})
