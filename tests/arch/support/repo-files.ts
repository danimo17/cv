import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = process.cwd()

export function repoFiles(): string[] {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function readText(file: string): string | null {
  let buffer: Buffer
  try {
    buffer = readFileSync(join(ROOT, file))
  } catch {
    return null
  }
  if (buffer.includes(0)) return null
  return buffer.toString('utf8')
}

export function lineOf(text: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++
  return line
}
