// @vitest-environment node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const COMPONENTS_DIR = join(ROOT, 'app', 'components')
const CSS_DIR = join(ROOT, 'app', 'assets', 'css', 'components')
const MAIN_CSS = join(ROOT, 'app', 'assets', 'css', 'main.css')

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function templateOf(vue: string): string {
  const start = vue.indexOf('<template>')
  const end = vue.lastIndexOf('</template>')
  return start === -1 || end === -1 ? '' : vue.slice(start, end)
}

const components = walk(COMPONENTS_DIR)
  .filter((f) => f.endsWith('.vue'))
  .map((file) => ({ file, name: basename(file, '.vue'), block: kebab(basename(file, '.vue')) }))

const mainCss = readFileSync(MAIN_CSS, 'utf8')

describe('one CSS file per component (regla 08)', () => {
  it('finds components', () => {
    expect(components.length).toBeGreaterThan(0)
  })

  describe.each(components)('$name', ({ file, block }) => {
    const cssFile = join(CSS_DIR, `${block}.css`)

    it(`has app/assets/css/components/${block}.css`, () => {
      expect(existsSync(cssFile), `missing ${cssFile}`).toBe(true)
    })

    it(`is imported from main.css`, () => {
      expect(mainCss).toContain(`@import './components/${block}.css'`)
    })

    it(`its CSS file declares .${block}`, () => {
      if (!existsSync(cssFile)) return
      expect(readFileSync(cssFile, 'utf8')).toContain(`.${block}`)
    })

    it(`its template uses the ${block} class`, () => {
      const template = templateOf(readFileSync(file, 'utf8'))
      const forms = [`'${block}`, `"${block}`, `${block} `, `${block}"`]
      const found = forms.some((form) => template.includes(form))
      expect(found, `template of ${basename(file)} does not use class "${block}"`).toBe(true)
    })
  })

  it('has no orphan CSS files under components/', () => {
    const blocks = new Set(components.map((c) => c.block))
    const orphans = readdirSync(CSS_DIR)
      .filter((f) => f.endsWith('.css'))
      .map((f) => basename(f, '.css'))
      .filter((b) => !blocks.has(b))
    expect(orphans, `CSS without a component: ${orphans.join(', ')}`).toEqual([])
  })

  it('has no main.css import for a missing component CSS', () => {
    const imported = [...mainCss.matchAll(/@import '\.\/components\/([\w-]+)\.css'/g)].map(
      (m) => m[1] as string
    )
    const blocks = new Set(components.map((c) => c.block))
    const dangling = imported.filter((b) => !blocks.has(b))
    expect(dangling, `main.css imports without a component: ${dangling.join(', ')}`).toEqual([])
  })
})
