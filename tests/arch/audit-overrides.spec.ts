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
      const upper = comparators.find((comparator) => /^<\d/.test(comparator))
      expect(
        upper,
        `${selector}: the vulnerable range needs an exclusive upper bound "<patched"`
      ).toBeDefined()
      const patched = parseVersion(upper!.slice(1))!
      const floor = /^\^(\d+\.\d+\.\d+)$/.exec(value)
      expect(
        floor,
        `${selector}: the override value must be a caret range "^x.y.z", got "${value}"`
      ).not.toBeNull()
      expect(
        compare(parseVersion(floor![1]!)!, patched),
        `${selector}: floor ${floor![1]} is below the patched version ${upper!.slice(1)}`
      ).toBeGreaterThanOrEqual(0)
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

  it('the lockfile resolves simple-git only at or above the 4.0.1 advisory fix', () => {
    const versions = resolvedVersions('simple-git')
    expect(versions.length, 'pnpm-lock.yaml no longer resolves simple-git at all').toBeGreaterThan(
      0
    )
    expect(
      versions.filter((version) => compare(version, [4, 0, 1]) < 0),
      'simple-git below 4.0.1 is inside GHSA-x6jw-m9v5-85vh / GHSA-g4wm-2vf7-vfgr / GHSA-858h-whjf-mvg5'
    ).toEqual([])
  })

  it('the lockfile resolves the advisory packages of decisions 061 and 062 only at or above their patched versions', () => {
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
    const { overrides, patched } = workspace()
    const hasSimpleGitOverride = overrides.some(([selector]) => selector === 'simple-git@<4.0.1')
    expect(
      patched.length > 0,
      'the simple-git@<4.0.1 override and the @nuxt/devtools patch only work together'
    ).toBe(hasSimpleGitOverride)
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
        `${target}: pnpm-lock.yaml resolves ${name} at another version; the patch is stale, remove it with the patchedDependencies entry and the simple-git@<4.0.1 override`
      ).toBe(true)
      expect(text, `${patchPath}: the patch must switch to the named simple-git export`).toContain(
        'simpleGit as Git'
      )
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
