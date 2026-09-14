// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SCANNED_DIRS = ['app', 'server', 'shared']
const TEXT_EXT = /\.(ts|js|mjs|vue|json|css|md|txt|html)$/
// Decisió 029: l'única porta del client a /api/giphy és la capa de servei.
const CLIENT_OWNER = 'app/services/giphy/'

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (TEXT_EXT.test(entry)) out.push(full)
  }
  return out
}

function rel(file: string): string {
  return relative(ROOT, file).split(sep).join('/')
}

function filesContaining(needle: string): string[] {
  return SCANNED_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
    .filter((file) => readFileSync(file, 'utf8').includes(needle))
    .map(rel)
}

describe('Giphy boundary (regla 03)', () => {
  it('only the server talks to api.giphy.com', () => {
    const offenders = filesContaining('api.giphy.com').filter((f) => !f.startsWith('server/'))
    expect(offenders, `api.giphy.com outside server/: ${offenders.join(', ')}`).toEqual([])
  })

  it('the server route to Giphy exists', () => {
    expect(filesContaining('api.giphy.com')).toContain('server/api/giphy/search.get.ts')
  })

  it(`only ${CLIENT_OWNER} (and the server) reference /api/giphy`, () => {
    const offenders = filesContaining('/api/giphy').filter(
      (f) => !f.startsWith(CLIENT_OWNER) && !f.startsWith('server/')
    )
    expect(
      offenders,
      `/api/giphy must only be called from ${CLIENT_OWNER}: ${offenders.join(', ')}`
    ).toEqual([])
  })

  it('the Giphy service owns the /api/giphy call', () => {
    const owners = filesContaining('/api/giphy').filter((f) => f.startsWith(CLIENT_OWNER))
    expect(owners).toContain('app/services/giphy/GiphyService.ts')
  })

  it('no composable talks to /api/giphy any more (decisió 029)', () => {
    const composables = filesContaining('/api/giphy').filter((f) =>
      f.startsWith('app/composables/')
    )
    expect(composables).toEqual([])
  })
})
