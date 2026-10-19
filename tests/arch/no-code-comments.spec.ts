// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { lineOf, readText, repoFiles } from './support/repo-files'

// Rule 14 (decision 041, decision 052): no comments in code outside .claude/, tests/ and e2e/.
const SCANNED_DIRS = ['app/', 'server/', 'shared/']
const ROOT_CONFIG_FILES = [
  'nuxt.config.ts',
  'eslint.config.mjs',
  'vitest.config.ts',
  'playwright.config.ts',
]
const SCRIPT_EXTENSIONS = ['.ts', '.mts', '.js', '.mjs', '.cjs']
const MARKER_DIRS = ['app/composables/', 'app/stores/']
const REGION_NAMES =
  'Static variables|Reactive variables|Methods|Component data|Lifecycle|State|Getters'
const MARKER = new RegExp(`^// #(region (${REGION_NAMES})|endregion)$`)
const REGEX_PRECEDERS = new Set('(,=:[!&|?{};+-*%<>~^'.split(''))
const REGEX_KEYWORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw'])

interface Found {
  line: number
  text: string
}

function skipQuoted(source: string, start: number): number {
  const quote = source[start]
  let i = start + 1
  while (i < source.length && source[i] !== quote && source[i] !== '\n') {
    if (source[i] === '\\') i++
    i++
  }
  return i + 1
}

function skipRegex(source: string, start: number): number {
  let i = start + 1
  let inClass = false
  while (i < source.length && source[i] !== '\n') {
    const c = source[i]
    if (c === '\\') i++
    else if (c === '[') inClass = true
    else if (c === ']') inClass = false
    else if (c === '/' && !inClass) return i + 1
    i++
  }
  return i
}

function startsRegex(source: string, at: number): boolean {
  let j = at - 1
  while (j >= 0 && (source[j] === ' ' || source[j] === '\t' || source[j] === '\n')) j--
  if (j < 0) return true
  if (REGEX_PRECEDERS.has(source[j]!)) return true
  const word = /[A-Za-z]+$/.exec(source.slice(Math.max(0, j - 10), j + 1))
  return word !== null && REGEX_KEYWORDS.has(word[0])
}

export function findScriptComments(source: string): Found[] {
  const found: Found[] = []
  const frames: Array<{ template: boolean; depth: number }> = [{ template: false, depth: 0 }]
  let i = 0
  while (i < source.length) {
    const frame = frames[frames.length - 1]!
    const c = source[i]!
    const next = source[i + 1]
    if (frame.template) {
      if (c === '\\') i += 2
      else if (c === '`') {
        frames.pop()
        i++
      } else if (c === '$' && next === '{') {
        frames.push({ template: false, depth: 0 })
        i += 2
      } else i++
      continue
    }
    if (c === '"' || c === "'") i = skipQuoted(source, i)
    else if (c === '`') {
      frames.push({ template: true, depth: 0 })
      i++
    } else if (c === '/' && next === '/') {
      let end = source.indexOf('\n', i)
      if (end === -1) end = source.length
      found.push({ line: lineOf(source, i), text: source.slice(i, end).trimEnd() })
      i = end
    } else if (c === '/' && next === '*') {
      let end = source.indexOf('*/', i + 2)
      end = end === -1 ? source.length : end + 2
      found.push({ line: lineOf(source, i), text: source.slice(i, end) })
      i = end
    } else if (c === '/' && startsRegex(source, i)) i = skipRegex(source, i)
    else {
      if (c === '{') frame.depth++
      else if (c === '}') {
        if (frame.depth === 0 && frames.length > 1) frames.pop()
        else frame.depth--
      }
      i++
    }
  }
  return found
}

export function findStyleComments(source: string): Found[] {
  const found: Found[] = []
  let i = 0
  while (i < source.length) {
    const c = source[i]!
    if (c === '"' || c === "'") i = skipQuoted(source, i)
    else if (c === '/' && source[i + 1] === '*') {
      let end = source.indexOf('*/', i + 2)
      end = end === -1 ? source.length : end + 2
      found.push({ line: lineOf(source, i), text: source.slice(i, end) })
      i = end
    } else i++
  }
  return found
}

export function findVueComments(source: string): Found[] {
  const found: Found[] = []
  let template = source
  for (const block of source.matchAll(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const content = block[2]!
    const offset = block.index + block[0].indexOf(content)
    const firstLine = lineOf(source, offset)
    const inner = block[1] === 'script' ? findScriptComments(content) : findStyleComments(content)
    for (const hit of inner) found.push({ line: firstLine + hit.line - 1, text: hit.text })
    template = template.replace(block[0], block[0].replace(/[^\n]/g, ' '))
  }
  for (const hit of template.matchAll(/<!--/g)) {
    found.push({ line: lineOf(source, hit.index), text: '<!--' })
  }
  return found
}

function scannedFiles(): string[] {
  return repoFiles().filter(
    (file) =>
      ROOT_CONFIG_FILES.includes(file) ||
      (SCANNED_DIRS.some((dir) => file.startsWith(dir)) &&
        (file.endsWith('.vue') ||
          file.endsWith('.css') ||
          SCRIPT_EXTENSIONS.some((ext) => file.endsWith(ext))))
  )
}

function violationsIn(file: string, text: string): Found[] {
  const hits = file.endsWith('.vue')
    ? findVueComments(text)
    : file.endsWith('.css')
      ? findStyleComments(text)
      : findScriptComments(text)
  const markersAllowed = MARKER_DIRS.some((dir) => file.startsWith(dir))
  return hits.filter((hit) => !(markersAllowed && MARKER.test(hit.text)))
}

describe('rule 14: no comments in code', () => {
  it('app, server, shared and root config are comment-free', () => {
    const files = scannedFiles()
    expect(files.length).toBeGreaterThan(50)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of violationsIn(file, text)) {
        violations.push(`${file}:${hit.line} ${hit.text.slice(0, 80)}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('the comment scanner ignores strings, regexes and templates and finds real comments', () => {
    const clean = [
      "const url = 'https://example.com/a'",
      'const re = /a\\/\\/b[/]/g',
      'const tpl = `x // ${1 / 2} /* y */`',
      'const half = total / 2 / 3',
    ].join('\n')
    expect(findScriptComments(clean)).toEqual([])
    const dirty = ['const a = 1 // why', '/* block */', 'const b = `${a /* inner */}`'].join('\n')
    expect(findScriptComments(dirty).map((hit) => hit.line)).toEqual([1, 2, 3])
    expect(findStyleComments('.a { content: "/* x */" }\n/* c */').map((hit) => hit.line)).toEqual([
      2,
    ])
    const vue = '<template>\n  <p>x</p>\n  <!-- c -->\n</template>\n<script setup>\n// c\n</script>'
    expect(findVueComments(vue).map((hit) => hit.line)).toEqual([6, 3])
  })

  it('only the exact region markers are allowed, and only in composables and stores', () => {
    const marker = '// #region State\n// #endregion\n// #region Static variables'
    expect(violationsIn('app/stores/giphy.ts', marker)).toEqual([])
    expect(violationsIn('app/composables/useX.ts', marker)).toEqual([])
    expect(violationsIn('app/services/x.ts', marker)).toHaveLength(3)
    expect(violationsIn('app/stores/x.ts', '// #region State because')).toHaveLength(1)
    expect(violationsIn('app/stores/x.ts', '// region State')).toHaveLength(1)
  })
})
