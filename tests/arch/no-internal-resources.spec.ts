// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { lineOf, readText, repoFiles } from './support/repo-files'

const FILES = repoFiles()

// Rule 02: nothing from a company's internal systems reaches this public repo. The checkable slice is
// markers of those systems; what a diff copies from a private repository stays a human-review matter.
const MARKERS: Record<string, RegExp> = {
  'Atlassian cloud host': /\.atlassian\.(?:net|com)\b/gi,
  'Jira ticket URL': /\/browse\/[A-Z][A-Z0-9]+-\d+/g,
  'Confluence page URL': /\/wiki\/(?:spaces|display)\//gi,
  'Slack message URL': /slack\.com\/(?:archives|app_redirect)|\/\/app\.slack\.com\/client/gi,
  'private-org GitHub URL': /github\.com\/pdpaola/gi,
  'company sub-domain other than the public site':
    /(?:https?:\/\/|@)(?!www\.)[\w-]+\.pdpaola\.[a-z]+/gi,
  'company e-mail address': /[\w.+-]+@pdpaola\./gi,
  'internal-looking hostname':
    /https?:\/\/[\w.-]+\.(?:internal|intranet|corp|lan)(?::\d+)?(?:[/\s'"`)]|$)/gi,
}

// `file` -> why it may name these markers. This spec holds the sample strings its own check needs.
const ALLOWED_FILES: Record<string, string> = {
  'tests/arch/no-internal-resources.spec.ts':
    'contains the sample strings that prove each marker works',
}

function findInternalMarkers(text: string): Array<{ line: number; marker: string }> {
  const hits: Array<{ line: number; marker: string }> = []
  for (const [marker, pattern] of Object.entries(MARKERS)) {
    for (const match of text.matchAll(pattern)) {
      hits.push({ line: lineOf(text, match.index), marker })
    }
  }
  return hits
}

describe('rule 02: no internal company resources', () => {
  it('no internal company resources are referenced', () => {
    const files = FILES.filter((file) => !(file in ALLOWED_FILES))
    expect(files.length).toBeGreaterThan(150)
    const violations: string[] = []
    for (const file of files) {
      const text = readText(file)
      if (text === null) continue
      for (const hit of findInternalMarkers(text)) {
        violations.push(`${file}:${hit.line} ${hit.marker}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('every internal-resource marker matches its sample and public CV facts stay unmatched', () => {
    const samples: Record<string, string> = {
      'Atlassian cloud host': 'https://acme-corp.atlassian.net/jira',
      'Jira ticket URL': 'https://tracker.example.com/browse/ABC-123',
      'Confluence page URL': 'https://wiki.example.com/wiki/spaces/ENG/pages/1',
      'Slack message URL': 'https://acme.slack.com/archives/C1/p1',
      'private-org GitHub URL': 'https://github.com/pdpaola/frontend',
      'company sub-domain other than the public site': 'https://jira.pdpaola.com/x',
      'company e-mail address': 'someone@pdpaola.com',
      'internal-looking hostname': 'http://build.corp:8080/job',
    }
    expect(Object.keys(samples).sort()).toEqual(Object.keys(MARKERS).sort())
    for (const [marker, sample] of Object.entries(samples)) {
      expect(
        findInternalMarkers(sample).map((hit) => hit.marker),
        marker
      ).toContain(marker)
    }
    const publicFacts = [
      "url: 'https://www.pdpaola.com'",
      'https://github.com/danimo17/cv',
      'https://www.linkedin.com/in/uptivya',
      'http://localhost:3000/api/giphy',
    ]
    for (const fact of publicFacts) expect(findInternalMarkers(fact), fact).toEqual([])
  })
})
