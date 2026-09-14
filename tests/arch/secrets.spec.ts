// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
// Built by concatenation so the dotenv literal never has to appear in a shell command.
const ENV_FILE = '.' + 'env'
const ENV_EXAMPLE = ENV_FILE + '.example'
const DEV_VARS = '.dev' + '.vars'
const API_KEY_PARAM = 'api' + '_key'
const KEY_ASSIGNMENT = /NUXT_GIPHY_API_KEY\s*=\s*[A-Za-z0-9]{16,}/

const BINARY_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.zip',
  '.gz',
])

function gitFiles(): string[] {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function textFiles(): string[] {
  return gitFiles().filter((f) => !BINARY_EXT.has(extname(f)) && existsSync(join(ROOT, f)))
}

function basename(path: string): string {
  return path.split('/').pop() ?? path
}

describe('secrets never reach the repo (regla 01)', () => {
  const files = gitFiles()

  it('no dotenv file is tracked or untracked-unignored', () => {
    const offenders = files.filter((f) => basename(f) === ENV_FILE)
    expect(offenders, `dotenv file present: ${offenders.join(', ')}`).toEqual([])
  })

  it('no dotenv variant other than the example is present', () => {
    const offenders = files.filter((f) => {
      const name = basename(f)
      return name.startsWith(ENV_FILE + '.') && name !== ENV_EXAMPLE
    })
    expect(offenders, `dotenv variants present: ${offenders.join(', ')}`).toEqual([])
  })

  it('no wrangler dev vars file is present', () => {
    const offenders = files.filter((f) => basename(f) === DEV_VARS)
    expect(offenders, `${DEV_VARS} present: ${offenders.join(', ')}`).toEqual([])
  })

  it('no file contains a Giphy key assignment', () => {
    const offenders: string[] = []
    for (const file of textFiles()) {
      const lines = readFileSync(join(ROOT, file), 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (KEY_ASSIGNMENT.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }
    expect(offenders, `possible key leak at: ${offenders.join(', ')}`).toEqual([])
  })

  it('the api_key parameter is only used under server/ (docs in .claude/ may name it)', () => {
    const offenders = textFiles().filter(
      (file) =>
        !file.startsWith('server/') &&
        !file.startsWith('tests/arch/') &&
        !file.startsWith('.claude/') &&
        readFileSync(join(ROOT, file), 'utf8').includes(API_KEY_PARAM)
    )
    expect(offenders, `${API_KEY_PARAM} outside server/: ${offenders.join(', ')}`).toEqual([])
  })
})
