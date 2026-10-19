#!/usr/bin/env python3
"""Workflow gate. One script, three callers (decisions 051, 054 and 057, incl. its 2026-10-05, 2026-10-06 and
second 2026-10-06 amendments).

  require-contract.py                      Claude Code PreToolUse hook (Bash): JSON on stdin
  require-contract.py --commit             git pre-commit: checks the index
  require-contract.py --pre-push           git pre-push: reads "<local ref> <local sha> <remote ref> <remote sha>"
                                           lines on stdin, gates every remote ref refs/heads/feat/<slug> on the
                                           LOCAL SHA's tree
  require-contract.py --ci <branch> <sha> [--base <ref>]
                                           CI: the push checks for one branch + commit; with --base the step
                                           list (workflow-steps.json) is read from that ref, not the PR's copy

Decision 059 adds, to the commit checks: rule 12 delegation (a subagent row in the handoff for multi-file code
commits), a wider rule 11 list of structural config, and rule 16 shared-component consumers; and, to the Claude
hook only, the unmerged-feat-branch check on branch creation. The Claude hook resolves the repository from the
payload cwd (then CLAUDE_PROJECT_DIR, then ".").

Behavior is documented in .claude/docs/catalog/ai-workflow.md; tests in tests/arch/require-contract-hook.spec.ts.
Exit 2 = blocked, the reason is printed on stderr. The task slug of a feat/<slug> branch is <slug>;
.claude/tasks/ACTIVE is only consulted on other branches.

Commit-time state is read from the index and push-time state from the pushed commit's tree (git show
<sha>:path), never from the working tree, so the order of edits before the git command does not change
the verdict.
"""

import functools
import json
import os
import re
import shlex
import subprocess
import sys

CLAUDE_PREFIX = ".claude/"
GATE_CODE_PREFIXES = (".claude/hooks/",)
GATE_CODE_FILES = (".claude/workflow-steps.json",)
REVIEW_HEADING = r"^## Review\b"
CLOSED_PREFIX = ".claude/tasks/closed/"
TASKS_PREFIX = ".claude/tasks/"
FEAT_PREFIX = "feat/"
UNCHECKED = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+\[ \]")
FENCE = re.compile(r"^\s*(```|~~~)")
PROGRESS_LINE = re.compile(r"^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$")
PUSH_PR_OPEN = re.compile(r"^- \[ \] push-pr — evidence:\s*$")
HANDOFF_PATH = re.compile(r"^\.claude/tasks/[^/]+/handoff\.md$")
ARCHIVE_PATH = re.compile(r"^\.claude/tasks/closed/[^/]+\.md$")
HEX_TOKEN = re.compile(r"(?<![0-9A-Za-z])[0-9a-fA-F]{7,40}(?![0-9A-Za-z])")
SHA_EVIDENCE_STEPS = ("commit", "review", "close-out")
SPECIAL_COMMIT_MARKERS = ("MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD", "REVERT_HEAD")
GLOBAL_GIT_OPTIONS = (
    r"((?:\s+(?:(?:-C|-c|--git-dir|--work-tree|--namespace|--exec-path|--config-env|--attr-source|--super-prefix)"
    r"(?:=\S+|\s+(?:\"[^\"]*\"|'[^']*'|\S+))|--?[A-Za-z][\w-]*))*)"
)
ENV_PREFIX = r"(?:[A-Za-z_][A-Za-z0-9_]*=(?:\"[^\"]*\"|'[^']*'|\S+)\s+)*"
GIT_CALL = re.compile(
    r"(?:^|[;&|]\s*)" + ENV_PREFIX + r"git" + GLOBAL_GIT_OPTIONS + r"\s+(commit|push)\b([^\n;&|]*)",
    re.M,
)
HOOKS_PATH_OVERRIDE = re.compile(r"(?<![\w-])(?:-c|--config-env)(?:=|\s+)[\"']?core\.hookspath\b", re.I)
HOOKS_PATH_WRITE = re.compile(
    r"(?:(?:^|[;&|]\s*)" + ENV_PREFIX + r"git" + GLOBAL_GIT_OPTIONS + r"\s+config\b[^\n;&|]*\s"
    r"|GIT_CONFIG_KEY_\d+=[\"']?)core\.hookspath\b",
    re.I | re.M,
)
COMMIT_VALUE_FLAGS = "mFCcSu"
TEST_PREFIXES = ("tests/", "e2e/")
FINDING_LINE = re.compile(r"^\s*[-*+]\s+finding\b")
FINDING_FORMAT = re.compile(r"^\s*[-*+]\s+finding\s+(\S+)\s+—\s+outcome:\s*(\S+)\s+—\s+proof:\s*(.*)$")
PROOF_HEAD = re.compile(r"^(strengthened|new)\s+((?:tests|e2e)/\S+?\.spec\.ts)\s+›\s+(.+)$", re.S)
PROOF_PART = re.compile(r"^(searched|differs):\s*(.*)$", re.S)
EM_DASH_SPLIT = re.compile(r"\s+—\s+")
TITLE_CALL = re.compile(
    r"^[ \t]*(?:it|test|describe)(?:\.\w+)*\(\s*(['\"`])((?:\\.|(?!\1).)*)\1", re.M
)
TITLE_EACH = re.compile(
    r"^[ \t]*(?:it|test|describe)\.each\(\s*\[[\s\S]*?\]\s*\)\(\s*(['\"`])((?:\\.|(?!\1).)*)\1", re.M
)
SLUG_TOKEN = re.compile(r"[a-z0-9][a-z0-9-]+")
FINDING_OUTCOMES = ("fixed", "queued", "no_change_needed")
FIXED_FORMS = (
    "`proof:` of a `fixed` finding must be `strengthened <tests/file.spec.ts> › <test name>` or "
    "`new <tests/file.spec.ts> › <test name> — searched: <term>[, <term>...]` (a spec under tests/ or e2e/)"
)
PUSH_VALUE_FLAGS = ("-o", "--push-option", "--receive-pack", "--exec", "--repo")
NEW_BRANCH_CALL = re.compile(
    r"(?:^|[;&|]\s*)(" + ENV_PREFIX + r")git" + GLOBAL_GIT_OPTIONS + r"\s+(checkout|switch|branch)\b([^\n;&|]*)",
    re.M,
)
RESIDUE = re.compile(r"[^\n;&|]*")
HEREDOC_OPEN = re.compile(
    r"(?<!<)<<(?!<)-?[ \t]*(?:'([^'\n]*)'|\"([^\"\n]*)\"|\\?([A-Za-z_][A-Za-z0-9_]*))"
)
CD_CALL = re.compile(r"(?:^|[;&|]\s*)cd\s+(?:--\s+)?(\"[^\"\n]*\"|'[^'\n]*'|[^\s;&|]+)", re.M)
ALLOW_UNMERGED = re.compile(r"(?<![\w])ALLOW_UNMERGED_FEAT=(?:1|\"1\"|'1')(?!\S)")
CREATE_FLAGS = {
    "checkout": ("-b", "-B"),
    "switch": ("-c", "-C", "--create", "--force-create"),
}
BRANCH_CREATE_FLAGS = ("-f", "--force", "-t", "--track", "--no-track", "-q", "--quiet", "--create-reflog")
BACKLOG_PATH = ".claude/backlog.md"
DELEGATED_PREFIXES = ("app/", "server/", "shared/")
DELEGATION_MAX_FILES = 1
DELEGATION_MAX_LINES = 15
STRUCTURAL_FILES = (
    "nuxt.config.ts",
    "eslint.config.mjs",
    "playwright.config.ts",
    "vitest.config.ts",
    "wrangler.jsonc",
    "pnpm-workspace.yaml",
    ".claude/hard-rules.md",
)
LEGACY_STRUCTURAL_FILES = ("nuxt.config.ts", "eslint.config.mjs")
STRUCTURAL_PREFIXES = (".github/workflows/", ".githooks/", ".claude/hooks/")
RULES_PREFIX = ".claude/rules/"
DECISIONS_PREFIX = ".claude/docs/decisions/"
PACKAGE_JSON = "package.json"
PACKAGE_STRUCTURAL_KEYS = (
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "pnpm",
    "overrides",
    "packageManager",
    "engines",
)
SHARED_COMPONENTS_PREFIX = "app/components/shared/"
SHARED_CONSUMERS_HEADING = r"^## Shared component consumers\b"
USAGE = (
    "usage: require-contract.py [--commit | --pre-push | --ci <branch> <sha> [--base <ref>]] "
    "(no argument: Claude PreToolUse hook, JSON on stdin)"
)

root = "."


def fail(message):
    print(message, file=sys.stderr)
    sys.exit(2)


def git(args):
    try:
        r = subprocess.run(
            ["git"] + args, cwd=root, capture_output=True, text=True, errors="replace",
        )
    except OSError:
        return None
    return r.stdout if r.returncode == 0 else None


def git_ok(args):
    try:
        r = subprocess.run(["git"] + args, cwd=root, capture_output=True)
    except OSError:
        return False
    return r.returncode == 0


def git_nul(args):
    out = git(args)
    return [p for p in out.split("\0") if p] if out else []


def git_show(rev, path):
    return git(["show", f"{rev}:{path}"])


def current_branch():
    return (git(["rev-parse", "--abbrev-ref", "HEAD"]) or "").strip()


def outside_fences(lines):
    fenced = False
    for i, line in enumerate(lines, start=1):
        if FENCE.match(line):
            fenced = not fenced
        elif not fenced:
            yield i, line


def section(content, heading_pattern):
    lines = []
    found = False
    fenced = False
    for line in content.splitlines():
        if FENCE.match(line):
            fenced = not fenced
        elif not fenced:
            if not found:
                if re.match(heading_pattern, line):
                    found = True
                continue
            if re.match(r"^## ", line):
                break
        if found:
            lines.append(line)
    return lines if found else None


def unchecked_items(lines, exempt_push_pr=False):
    return [
        (i, line.strip())
        for i, line in outside_fences(lines)
        if UNCHECKED.match(line) and not (exempt_push_pr and PUSH_PR_OPEN.match(line))
    ]


def progress_entries(content):
    lines = section(content, r"^## Workflow progress\b")
    if lines is None:
        return None
    entries = []
    for _, line in outside_fences(lines):
        m = PROGRESS_LINE.match(line)
        if m:
            entries.append((m.group(2), m.group(1) in ("x", "X"), m.group(3).strip()))
    return entries


def required_push_steps(*revs):
    raw = None
    for rev in revs:
        raw = git_show(rev, ".claude/workflow-steps.json") if rev else None
        if raw is not None:
            break
    try:
        if raw is None:
            with open(os.path.join(root, ".claude", "workflow-steps.json"), encoding="utf-8") as f:
                raw = f.read()
        steps = json.loads(raw)
        return [s["id"] for s in steps if s.get("phase") == "pre-push" and s["id"] != "push-pr"]
    except (OSError, ValueError, KeyError, TypeError):
        fail(
            "Rule 09 (push-review-gate): .claude/workflow-steps.json is missing or malformed — it is the "
            "single list of workflow steps the push gate checks (decision 057)."
        )


def resolve_commit(rev):
    out = git(["rev-parse", "--verify", "--quiet", f"{rev}^{{commit}}"])
    return out.strip() if out and out.strip() else None


def commit_paths(commit):
    parents = (git(["rev-list", "--parents", "-n", "1", commit]) or "").split()[1:]
    if parents:
        return git_nul(["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", parents[0], commit])
    return git_nul(["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "--root", commit])


def slug_of_progress_path(path):
    if ARCHIVE_PATH.match(path):
        return path[len(CLOSED_PREFIX):-len(".md")]
    return path[len(TASKS_PREFIX):].split("/")[0]


def review_section_changed(commit, slug):
    parents = (git(["rev-list", "--parents", "-n", "1", commit]) or "").split()[1:]
    parent = parents[0] if parents else None
    for path in (f"{TASKS_PREFIX}{slug}/handoff.md", f"{CLOSED_PREFIX}{slug}.md"):
        after = git_show(commit, path)
        now = section(after, REVIEW_HEADING) if after is not None else None
        if now is None:
            continue
        before = git_show(parent, path) if parent else None
        was = section(before, REVIEW_HEADING) if before is not None else None
        if now != was:
            return True
    return False


def step_commit(step, evidence, tip, slug):
    tip_commit = resolve_commit(tip)
    resolved = [c for c in (resolve_commit(t) for t in HEX_TOKEN.findall(evidence)) if c]
    if not resolved:
        return None, (
            "evidence must contain a 7-40 character commit sha that resolves to a commit in this "
            "repository"
        )
    ancestors = [c for c in resolved if tip_commit and git_ok(["merge-base", "--is-ancestor", c, tip_commit])]
    if not ancestors:
        return None, (
            "the cited commit sha is not an ancestor of the tip being checked "
            f"({(tip_commit or tip)[:10]}): cite a commit from this branch's history"
        )
    if step != "review":
        return ancestors[0], None
    for commit in ancestors:
        if review_section_changed(commit, slug):
            return commit, None
    return None, (
        "the cited commit sha must be the commit that recorded the review result: one that changed the "
        f"`## Review` section of {TASKS_PREFIX}{slug}/handoff.md or {CLOSED_PREFIX}{slug}.md (a commit that "
        "only ticks progress or edits other sections does not count)"
    )


def evidence_problem(step, evidence, tip, slug):
    if not evidence:
        return "no evidence"
    if step in SHA_EVIDENCE_STEPS:
        return step_commit(step, evidence, tip, slug)[1]
    return None


def is_test_path(path):
    return path.startswith(TEST_PREFIXES)


def is_code_path(path):
    return not is_test_path(path) and (
        not path.startswith(CLAUDE_PREFIX)
        or path.startswith(GATE_CODE_PREFIXES)
        or path in GATE_CODE_FILES
    )


def resolve_base(explicit):
    for candidate in ([explicit] if explicit else ["origin/main", "main"]):
        if resolve_commit(candidate):
            return candidate
    return None


def branch_diff_paths(base_ref, rev):
    out = git(["diff", "--name-only", "--no-renames", "-z", f"{base_ref}...{rev}"])
    if out is None:
        return None
    return [p for p in out.split("\0") if p and is_code_path(p)]


def branch_diff(base_ref, rev, paths):
    out = git(
        ["--literal-pathspecs", "diff", "--binary", "-U0", "--no-renames", "--no-color",
         f"{base_ref}...{rev}", "--"] + paths
    )
    if out is None:
        return None
    return [
        "@@" if line.startswith("@@") else line
        for line in out.splitlines()
        if not line.startswith("index ")
    ]


def changed_branch_code(base_ref, review_commit, tip_commit):
    at_review = branch_diff_paths(base_ref, review_commit)
    at_tip = branch_diff_paths(base_ref, tip_commit)
    if at_review is None or at_tip is None:
        return None
    paths = sorted(set(at_review) | set(at_tip))
    if not paths:
        return []
    old = branch_diff(base_ref, review_commit, paths)
    new = branch_diff(base_ref, tip_commit, paths)
    if old is None or new is None:
        return None
    if old == new:
        return []
    differing = [
        p for p in paths
        if branch_diff(base_ref, review_commit, [p]) != branch_diff(base_ref, tip_commit, [p])
    ]
    return differing or paths


def code_changes_after(review_commit, tip_commit, wanted):
    later = (git(["rev-list", "--reverse", f"{review_commit}..{tip_commit}"]) or "").split()
    hits = []
    for commit in later:
        paths = commit_paths(commit)
        hit = [p for p in paths if wanted(p)]
        if hit:
            hits.append((commit, hit[0], any(is_test_path(p) for p in paths)))
    return hits


def stale_review_problem(content, tip, slug, base_ref=None):
    for step, ticked, evidence in progress_entries(content) or []:
        if step != "review" or not ticked:
            continue
        review_commit, _ = step_commit("review", evidence, tip, slug)
        tip_commit = resolve_commit(tip)
        if not review_commit or not tip_commit:
            return None
        compared = resolve_base(base_ref)
        changed = changed_branch_code(compared, review_commit, tip_commit) if compared else None
        if changed is None:
            hits = code_changes_after(review_commit, tip_commit, is_code_path)
            scope = "commits after it, no base branch to compare with"
            untested = next((h for h in hits if not h[2]), None)
        else:
            if not changed:
                return None
            hits = code_changes_after(review_commit, tip_commit, lambda p: p in changed)
            scope = f"the branch's own diff against {compared}"
            untested = next((h for h in hits if not h[2]), None) if hits else (None, changed[0], False)
        if not untested:
            return None
        commit, path, _ = untested
        where = f"commit {commit[:10]} (after it) changes {path}" if commit else f"{path} differs"
        return (
            f"the review is stale: `review` evidence cites {review_commit[:10]}, but {where} "
            f"({scope}; code outside .claude/, .claude/hooks/ and .claude/workflow-steps.json, with no "
            "change under tests/ or e2e/ in that commit), so the review did not see the final code. A fix "
            "needs its test: a code commit that also changes a file under tests/ or e2e/ does not stale "
            "the review. Otherwise run `/code-review high` on the final diff, record its result in the "
            "## Review section, and re-record the `review` evidence with the sha of the commit that "
            "records it."
        )
    return None


def backlog_slugs(rev):
    rows = (git_show(rev, ".claude/backlog.md") or "").splitlines()
    return {m.group(1) for m in (re.match(r"^\|\s*([a-z0-9][a-z0-9-]*)\s*\|", r) for r in rows) if m}


def test_titles(content):
    found = []
    for pattern in (TITLE_CALL, TITLE_EACH):
        found += [re.sub(r"\\(.)", r"\1", m.group(2)) for m in pattern.finditer(content)]
    return found


def spec_titles(rev):
    if rev == "":
        listing = git_nul(["ls-files", "-z", "--", "tests", "e2e"])
    else:
        listing = git_nul(["ls-tree", "-r", "-z", "--name-only", rev, "--", "tests", "e2e"])
    return {
        path: test_titles(git_show(rev, path) or "") for path in listing if path.endswith(".spec.ts")
    }


def unquote(name):
    if len(name) > 1 and name[0] == name[-1] and name[0] in "\"'`":
        return name[1:-1]
    return name


def fixed_proof_problem(proof, rev, base_ref):
    parts = EM_DASH_SPLIT.split(proof)
    head = PROOF_HEAD.match(parts[0].strip())
    options = {}
    for part in parts[1:]:
        option = PROOF_PART.match(part.strip())
        if not option or option.group(1) in options:
            return FIXED_FORMS
        options[option.group(1)] = option.group(2).strip()
    if not head:
        return FIXED_FORMS
    kind, path, name = head.group(1), head.group(2), unquote(head.group(3).strip())
    at_tip = git_show(rev, path)
    if at_tip is None:
        return f"{path} does not exist in the pushed tree"
    if name not in test_titles(at_tip):
        return f"{path} does not contain a test or describe titled \"{name}\""
    if base_ref is None:
        return "there is no base ref (--base, origin/main or main) to compare the proof against"
    at_base = git_show(base_ref, path)
    if kind == "strengthened":
        if at_base is None or name not in test_titles(at_base):
            return (
                f"strengthened: \"{name}\" must already exist at the base ref ({base_ref}) in {path}; a test "
                "added on this branch is `new <file> › <name> — searched: <terms>`"
            )
        if at_base == at_tip:
            return (
                f"strengthened: {path} is identical to the base ({base_ref}), so no existing test was "
                "improved"
            )
        return None
    for other, titles in spec_titles(base_ref).items():
        if name in titles:
            return (
                f"new: \"{name}\" already exists at the base ({base_ref}) in {other}: strengthen that test "
                "(`strengthened <file> › <name>`) instead of adding a duplicate"
            )
    if "searched" not in options:
        return "new: add `— searched: <term>[, <term>...]` (the terms the gate greps in the test titles)"
    terms = [t.strip() for t in options["searched"].split(",") if t.strip()]
    if not terms:
        return "new: `searched:` needs at least one term"
    hits = []
    for other, titles in spec_titles(rev).items():
        for title in titles:
            if (other, title) != (path, name) and any(t.lower() in title.lower() for t in terms):
                hits.append(f"{other} › {title}")
    if hits and not options.get("differs"):
        shown = "; ".join(hits[:6]) + (f"; and {len(hits) - 6} more" if len(hits) > 6 else "")
        return (
            "a test for this may already exist: strengthen it, or justify with `— differs: <why a new "
            f"test is needed>`. Matching titles: {shown}"
        )
    return None


def finding_proof_problem(outcome, proof, rev, base_ref, slugs):
    if outcome == "no_change_needed":
        return None if proof else "give the reason in `proof:`"
    if outcome == "fixed":
        return fixed_proof_problem(proof, rev, base_ref)
    for token in SLUG_TOKEN.findall(proof):
        story = git_ok(["cat-file", "-e", f"{rev}:{TASKS_PREFIX}{token}/story.md"])
        if token in slugs or story or git_ok(["cat-file", "-e", f"{rev}:{CLOSED_PREFIX}{token}.md"]):
            return None
    return "`proof:` must name a slug that is a row of .claude/backlog.md or an existing task folder/archive"


def review_findings_problems(path, review, rev, base_ref=None):
    found = []
    slugs = backlog_slugs(rev)
    compared = resolve_base(base_ref)
    count = 0
    for _, line in outside_fences(review):
        if not FINDING_LINE.match(line):
            continue
        count += 1
        m = FINDING_FORMAT.match(line)
        if not m:
            found.append(
                f"{path}'s ## Review has a malformed finding line (`- finding <id> — outcome: "
                f"<fixed|queued|no_change_needed> — proof: <text>`): {line.strip()}"
            )
            continue
        fid, outcome, proof = m.group(1), m.group(2), m.group(3).strip()
        problem = (
            f"outcome `{outcome}` is not one of {'/'.join(FINDING_OUTCOMES)}"
            if outcome not in FINDING_OUTCOMES
            else finding_proof_problem(outcome, proof, rev, compared, slugs)
        )
        if problem:
            found.append(f"{path}'s ## Review: finding {fid} ({outcome}): {problem}")
    if not count and "findings: none" not in "\n".join(review).lower():
        found.append(f"{path}'s ## Review has no `- finding <id> — ...` line and no `findings: none`")
    return found


def check_progress_evidence(path, content):
    slug = slug_of_progress_path(path)
    entries = progress_entries(content) or []
    problems = []
    for step, ticked, evidence in entries:
        problem = evidence_problem(step, evidence, "HEAD", slug) if ticked else None
        if problem:
            problems.append(f"{step} ({problem})")
    if problems:
        fail(
            f"Rule 09 (workflow progress): {path} ticks step(s) in ## Workflow progress with invalid "
            f"evidence: {'; '.join(problems)}. Fill `evidence:` (commit sha for commit/review/close-out, "
            "otherwise a gate output line / date) or leave the box unticked — see "
            ".claude/templates/handoff.md."
        )


def progress_problem(path, content, rev, slug, base_ref=None):
    entries = progress_entries(content)
    if entries is None:
        return (
            f"{path} has no ## Workflow progress section — every handoff opens "
            "with it (see .claude/templates/handoff.md)."
        )
    state = {step: (ticked, evidence) for step, ticked, evidence in entries}
    missing = []
    for step in required_push_steps(base_ref, rev):
        ticked, evidence = state.get(step, (False, ""))
        if not ticked:
            missing.append(f"{step} (not ticked)")
            continue
        problem = evidence_problem(step, evidence, rev, slug)
        if problem:
            missing.append(f"{step} ({problem})")
    if missing:
        return (
            f"{path}'s ## Workflow progress has step(s) not ticked with valid "
            f"evidence: {', '.join(missing)}. Tick each one (`- [x] <id> — evidence: <sha / gate line / "
            "date>`) before pushing; only `push-pr` may stay open."
        )
    return None


def staged_changes():
    parts = git_nul(["diff", "--cached", "--name-status", "--no-renames", "-z"])
    return {parts[i + 1]: parts[i][0] for i in range(0, len(parts) - 1, 2)}


def closing_slugs(status):
    tracked = {}
    for path in git_nul(["ls-tree", "-r", "-z", "--name-only", "HEAD", "--", TASKS_PREFIX]):
        parts = path.split("/")
        if len(parts) < 4 or parts[2] == "closed":
            continue
        tracked.setdefault(parts[2], []).append(path)
    return [
        slug for slug, files in sorted(tracked.items()) if all(status.get(f) == "D" for f in files)
    ]


def check_close(slug, status):
    archive = f"{CLOSED_PREFIX}{slug}.md"
    if status.get(archive) != "A":
        fail(
            f"Rule 10 (task-close-gate): this commit deletes {TASKS_PREFIX}{slug}/ but doesn't stage "
            f"{archive} as a new file — closing a task requires an archived, fully-checked "
            "close-checklist in the same commit (see .claude/templates/close-checklist.md)."
        )
    content = git_show("", archive) or ""
    unchecked = unchecked_items(content.splitlines(), exempt_push_pr=True)
    if unchecked:
        items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
        fail(
            f"Rule 10 (task-close-gate): {archive} has {len(unchecked)} unchecked item(s) — every "
            "close-checklist box must be checked before the task can close (only the `push-pr` progress "
            f"line may stay open, it is ticked after the push). Unchecked: {items}"
        )
    review = section(content, REVIEW_HEADING)
    bad = review_findings_problems(archive, review, "") if review is not None else []
    if bad:
        fail(f"Rule 10 (task-close-gate): {'; '.join(bad)}")
    stale = stale_review_problem(content, "HEAD", slug)
    if stale:
        fail(f"Rule 10 (task-close-gate): {archive}: {stale}")


def working_tree_active():
    try:
        with open(os.path.join(root, TASKS_PREFIX, "ACTIVE"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


def task_slug_for_commit():
    branch = current_branch()
    if not branch.startswith(FEAT_PREFIX):
        return working_tree_active()
    slug = branch[len(FEAT_PREFIX):]
    folder_present = os.path.isdir(os.path.join(root, TASKS_PREFIX, slug))
    archived = git_ok(["cat-file", "-e", f":{CLOSED_PREFIX}{slug}.md"])
    return "" if archived and not folder_present else slug


def special_commit_in_progress():
    for name in SPECIAL_COMMIT_MARKERS:
        out = (git(["rev-parse", "--git-path", name]) or "").strip()
        if out and os.path.exists(os.path.join(root, out)):
            return True
    return False


def review_recorded(slug):
    for path in (f"{TASKS_PREFIX}{slug}/handoff.md", f"{CLOSED_PREFIX}{slug}.md"):
        content = git_show("HEAD", path)
        for step, ticked, _ in (progress_entries(content) if content is not None else None) or []:
            if step == "review" and ticked:
                return True
    return False


def untested_code_problem(slug, staged):
    code = [f for f in staged if is_code_path(f)]
    if not code or any(is_test_path(f) for f in staged) or not review_recorded(slug):
        return
    fail(
        "Rule 09 (after a recorded review, every code change needs its test): this commit stages code "
        f"({', '.join(code[:5])}) but no file under tests/ or e2e/. A finding becomes a test: search the "
        "existing tests first and strengthen one, add a new test only when none covers it (.claude/workflow.md "
        "`## Review policy`)."
    )


def branch_is_feat():
    return current_branch().startswith(FEAT_PREFIX)


def package_json_keys(raw):
    if raw is None:
        return None
    try:
        data = json.loads(raw)
    except ValueError:
        return "invalid"
    if not isinstance(data, dict):
        return "invalid"
    return {key: data.get(key) for key in PACKAGE_STRUCTURAL_KEYS}


def package_json_structural():
    before = package_json_keys(git_show("HEAD", PACKAGE_JSON))
    after = package_json_keys(git_show("", PACKAGE_JSON))
    if before == "invalid" or after == "invalid" or after is None:
        return True
    if before is None:
        return any(value is not None for value in after.values())
    return before != after


def is_structural(path, include_wider):
    if path in LEGACY_STRUCTURAL_FILES:
        return True
    if not include_wider:
        return False
    if path in STRUCTURAL_FILES or path.startswith(STRUCTURAL_PREFIXES):
        return True
    if path.startswith(RULES_PREFIX) and path.endswith(".md"):
        return True
    return path == PACKAGE_JSON and package_json_structural()


def structural_problem(status):
    include_wider = not special_commit_in_progress()
    found = [p for p in sorted(status) if is_structural(p, include_wider)]
    if not found:
        return
    if any(p.startswith(DECISIONS_PREFIX) and code != "D" for p, code in status.items()):
        return
    fail(
        f"Rule 11: this commit changes structural config ({', '.join(found)}) but stages no file under "
        f"{DECISIONS_PREFIX}. Architecture/config changes need a decision record in the same commit — write "
        "one (see decision 041 for the pattern) and stage it."
    )


def staged_code_size():
    out = git(["diff", "--cached", "--numstat", "--no-renames", "-z"]) or ""
    files = lines = 0
    for entry in out.split("\0"):
        parts = entry.split("\t", 2)
        if len(parts) != 3 or not parts[2].startswith(DELEGATED_PREFIXES):
            continue
        files += 1
        lines += sum(int(n) for n in parts[:2] if n.isdigit())
    return files, lines


def has_subagent_row(handoff):
    section_lines = section(handoff, r"^## Subagents\b") if handoff is not None else None
    rows = [
        line.strip()
        for _, line in outside_fences(section_lines or [])
        if line.strip().startswith("|")
    ]
    if len(rows) < 3 or not re.fullmatch(r"[|\s:-]+", rows[1]):
        return False
    for row in rows[2:]:
        first = row.strip("|").split("|")[0].strip()
        if first:
            return True
    return False


def delegation_problem(slug):
    files, lines = staged_code_size()
    if files <= DELEGATION_MAX_FILES and lines <= DELEGATION_MAX_LINES:
        return
    handoff_path = f"{TASKS_PREFIX}{slug}/handoff.md"
    if has_subagent_row(git_show("", handoff_path)):
        return
    fail(
        f"Rule 12 (the main thread orchestrates, subagents execute): this commit stages {files} file{'' if files == 1 else 's'} and "
        f"{lines} changed line{'' if lines == 1 else 's'} under app/, server/ or shared/ (more than {DELEGATION_MAX_FILES} file or "
        f"{DELEGATION_MAX_LINES} lines), but the `## Subagents` table of the staged {handoff_path} has no row. "
        "Delegate the work to a subagent and record it there (| Subagent | What it did | Result |), "
        "or keep the change within the threshold."
    )


def shared_component_problem(slug, status):
    shared = sorted(p for p in status if p.startswith(SHARED_COMPONENTS_PREFIX))
    if not shared:
        return
    contract = git_show("", f"{TASKS_PREFIX}{slug}/contract.md")
    body = section(contract, SHARED_CONSUMERS_HEADING) if contract is not None else None
    if body is not None and any(line.strip() for _, line in outside_fences(body)):
        return
    fail(
        f"Rule 16 (UI pattern consistency): this commit changes a shared component ({', '.join(shared)}) but "
        f"{TASKS_PREFIX}{slug}/contract.md has no filled `## Shared component consumers` section. Grep every "
        "consumer (grep -rn \"ComponentName\" app/), list the result there and state whether the change is "
        "applied only here or everywhere."
    )


def commit_checks():
    status = staged_changes()
    staged = list(status)
    closing = closing_slugs(status)

    for slug in closing:
        check_close(slug, status)

    slug = task_slug_for_commit()

    if closing or not slug:
        docs_only_exempt = not closing and special_commit_in_progress()
        if not docs_only_exempt and not all(f.startswith(CLAUDE_PREFIX) for f in staged):
            fail(
                "Rule 10: no active task (a non-feat branch with .claude/tasks/ACTIVE empty, or a "
                "feat/<slug> branch whose task is already closed) or a closing commit, and this commit "
                "touches code outside .claude/ — write a story + contract first."
            )
    else:
        task_dir = os.path.join(root, TASKS_PREFIX, slug)
        if not os.path.isfile(os.path.join(task_dir, "story.md")):
            fail(
                f"Rule 10: no commit without a story. Write {TASKS_PREFIX}{slug}/story.md "
                "(template .claude/templates/story.md)."
            )
        contract = os.path.join(task_dir, "contract.md")
        ok = False
        if os.path.isfile(contract):
            with open(contract, encoding="utf-8") as f:
                ok = "given" in f.read().lower()
        if not ok:
            fail(
                f"Rule 10: no commit without a contract. Write {TASKS_PREFIX}{slug}/contract.md with "
                "Given/When/Then criteria (the slug is the feat/<slug> branch name; on other branches "
                ".claude/tasks/ACTIVE holds it)."
            )

    for path, code in sorted(status.items()):
        if code in ("A", "M") and (HANDOFF_PATH.match(path) or ARCHIVE_PATH.match(path)):
            check_progress_evidence(path, git_show("", path) or "")

    structural_problem(status)

    if slug and not closing and not special_commit_in_progress():
        untested_code_problem(slug, staged)
        shared_component_problem(slug, status)
        if branch_is_feat():
            delegation_problem(slug)


def push_gate(branch, sha, base_ref=None):
    slug = branch[len(FEAT_PREFIX):]
    problems = []

    def review_problems(path, review):
        if review is None:
            return [f"{path} has no ## Review section. Fill it per .claude/templates/handoff.md "
                    "before pushing (workflow step review)."]
        found = []
        unchecked = unchecked_items(review)
        if unchecked:
            items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
            found.append(f"{path}'s ## Review section has {len(unchecked)} unchecked item(s): {items}")
        if not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
            found.append(f"{path}'s ## Review section never mentions code-review having run")
        return found + review_findings_problems(path, review, sha, base_ref)

    handoff_path = f"{TASKS_PREFIX}{slug}/handoff.md"
    archive_path = f"{CLOSED_PREFIX}{slug}.md"
    handoff = git_show(sha, handoff_path)

    if handoff is not None:
        problems += review_problems(handoff_path, section(handoff, r"^## Review\b"))
        problem = progress_problem(handoff_path, handoff, sha, slug, base_ref)
        if problem:
            problems.append(problem)
        stale = stale_review_problem(handoff, sha, slug, base_ref)
        if stale:
            problems.append(f"{handoff_path}: {stale}")
    else:
        archive = git_show(sha, archive_path)
        if archive is None:
            fail(
                f"Rule 09 (push-review-gate): neither {handoff_path} nor {archive_path} exists in the "
                f"pushed commit — a {branch} branch is pushed either with its task still open "
                "(handoff.md with ## Review) or already closed (the archive from "
                ".claude/templates/close-checklist.md, committed)."
            )
        unchecked = unchecked_items(archive.splitlines(), exempt_push_pr=True)
        if unchecked:
            items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
            problems.append(f"{archive_path} has {len(unchecked)} unchecked item(s): {items}")
        review = section(archive, r"^## Review\b")
        if review is None:
            problems.append(
                f"{archive_path} has no ## Review section — paste the handoff's review block into it"
            )
        elif not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
            problems.append(f"{archive_path}'s ## Review section never mentions code-review having run")
        if review is not None:
            problems += review_findings_problems(archive_path, review, sha, base_ref)
        problem = progress_problem(archive_path, archive, sha, slug, base_ref)
        if problem:
            problems.append(problem)
        stale = stale_review_problem(archive, sha, slug, base_ref)
        if stale:
            problems.append(f"{archive_path}: {stale}")

    if len(problems) == 1:
        fail(f"Rule 09 (push-review-gate): {problems[0]}")
    if problems:
        listed = "\n".join(f"  - {p}" for p in problems)
        fail(f"Rule 09 (push-review-gate): {len(problems)} problems blocking the push of {branch}:\n{listed}")


def local_feat_branches():
    out = git(["for-each-ref", "--format=%(refname:short)", f"refs/heads/{FEAT_PREFIX}"]) or ""
    return [b for b in out.splitlines() if b]


def push_targets(rest):
    try:
        tokens = shlex.split(rest)
    except ValueError:
        tokens = rest.split()
    flags = []
    positional = []
    i = 0
    while i < len(tokens):
        token = tokens[i]
        if token == "--":
            positional.extend(tokens[i + 1:])
            break
        if token.startswith("-"):
            flags.append(token)
            if token in PUSH_VALUE_FLAGS:
                i += 1
        else:
            positional.append(token)
        i += 1

    names = [f.split("=")[0] for f in flags]
    deleting = "--delete" in names or any(
        f.startswith("-") and not f.startswith("--") and "d" in f[1:] for f in flags
    )
    if deleting:
        return []

    refspecs = positional[1:]
    branch = current_branch()
    if "--all" in names or "--mirror" in names or any("*" in r for r in refspecs):
        refspecs = local_feat_branches()
    elif not refspecs:
        if "--tags" in names:
            return []
        if branch in ("", "HEAD"):
            fail(
                "Rule 09 (push-review-gate): `git push` with no refspec on a detached HEAD — the branch "
                "being pushed is unknown, so it can't be gated. Name it explicitly "
                "(git push <remote> HEAD:refs/heads/feat/<slug>)."
            )
        refspecs = [branch]

    targets = []
    for spec in refspecs:
        spec = spec.lstrip("+")
        src, _, dst = spec.partition(":") if ":" in spec else (spec, "", spec)
        if not src or not dst:
            continue
        if dst == "HEAD":
            if branch in ("", "HEAD"):
                fail(
                    "Rule 09 (push-review-gate): the push destination HEAD is a detached HEAD — name the "
                    "branch explicitly (HEAD:refs/heads/feat/<slug>)."
                )
            dst = branch
        if dst.startswith("refs/heads/"):
            dst = dst[len("refs/heads/"):]
        if not dst.startswith(FEAT_PREFIX):
            continue
        sha = (git(["rev-parse", "--verify", "--quiet", f"{src}^{{commit}}"]) or "").strip()
        if not sha:
            fail(
                f"Rule 09 (push-review-gate): can't resolve the source `{src}` of the push to {dst} to a "
                "commit, so it can't be gated."
            )
        if (dst, sha) not in targets:
            targets.append((dst, sha))
    return targets


def run_commit_hook(hits):
    if any(sub == "commit" for sub, _ in hits):
        commit_checks()
    for sub, rest in hits:
        if sub == "push":
            for branch, sha in push_targets(rest):
                push_gate(branch, sha)


def skips_hooks(sub, rest):
    if "--no-verify" in rest:
        return True
    if sub != "commit":
        return False
    try:
        tokens = shlex.split(rest)
    except ValueError:
        tokens = rest.split()
    for token in tokens:
        if token.startswith("-") and not token.startswith("--"):
            for letter in token[1:]:
                if letter == "n":
                    return True
                if letter in COMMIT_VALUE_FLAGS:
                    break
    return False


def repo_containing(path):
    if not path or not os.path.isdir(path):
        return None
    try:
        top = subprocess.run(
            ["git", "-C", path, "rev-parse", "--show-toplevel"], capture_output=True, text=True
        )
    except OSError:
        return None
    return top.stdout.strip() if top.returncode == 0 and top.stdout.strip() else None


@functools.lru_cache(maxsize=None)
def common_git_dir(path):
    if not path or not os.path.isdir(path):
        return None
    try:
        out = subprocess.run(
            ["git", "-C", path, "rev-parse", "--git-common-dir"], capture_output=True, text=True
        )
    except OSError:
        return None
    found = out.stdout.strip()
    return os.path.realpath(os.path.join(path, found)) if out.returncode == 0 and found else None


def project_common_dir():
    for candidate in (os.environ.get("CLAUDE_PROJECT_DIR"), os.path.dirname(os.path.abspath(__file__))):
        found = common_git_dir(candidate)
        if found:
            return found
    return None


def is_project_repo(top):
    project = project_common_dir()
    return project is None or common_git_dir(top) == project


def mask_heredocs(cmd):
    lines = cmd.split("\n")
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out.append(line)
        i += 1
        for m in HEREDOC_OPEN.finditer(line):
            delimiter = m.group(1) or m.group(2) or m.group(3)
            end = next((j for j in range(i, len(lines)) if lines[j].strip() == delimiter), None)
            if end is None:
                break
            out.extend("x" * len(body) for body in lines[i:end])
            out.append(lines[end])
            i = end + 1
    return "\n".join(out)


def mask_quotes(text):
    out = list(text)
    i = 0
    while i < len(text):
        quote = text[i]
        if quote == "\\":
            i += 2
        elif quote == "#" and (i == 0 or text[i - 1] in " \t\n;&|("):
            end = text.find("\n", i)
            i = len(text) if end < 0 else end
        elif quote in "'\"":
            j = i + 1
            while j < len(text) and text[j] != quote:
                j += 2 if quote == '"' and text[j] == "\\" else 1
            if j < len(text):
                for k in range(i + 1, j):
                    if out[k] != "\n":
                        out[k] = "x"
            i = j + 1
        else:
            i += 1
    return "".join(out)


def call_matches(pattern, cmd, masked):
    for m in pattern.finditer(masked):
        groups = [cmd[m.start(i):m.end(i)] for i in range(1, pattern.groups + 1)]
        groups[-1] = RESIDUE.match(cmd, m.start(pattern.groups)).group(0)
        yield m.start(), groups


def existing_dir(base, target):
    if not target or "$" in target or "`" in target:
        return None
    path = os.path.expanduser(target)
    if not os.path.isabs(path):
        path = os.path.join(base, path)
    return os.path.normpath(path) if os.path.isdir(path) else None


def call_directory(base, cmd, masked, position, opts):
    current = base
    for m in CD_CALL.finditer(masked):
        if m.end() > position:
            break
        current = existing_dir(current, unquote(cmd[m.start(1):m.end(1)])) or current
    try:
        tokens = shlex.split(opts)
    except ValueError:
        tokens = opts.split()
    for i, token in enumerate(tokens[:-1]):
        if token == "-C":
            current = existing_dir(current, tokens[i + 1]) or current
    return current


def call_root(cmd, masked, position, opts, cwd):
    given = cwd if cwd and os.path.isdir(cwd) else None
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR")
    base = given or project_dir or "."
    directory = call_directory(base, cmd, masked, position, opts)
    top = repo_containing(directory)
    if top is None:
        return (repo_containing(project_dir) or project_dir or ".") if directory == base else None
    if directory == base and given is None:
        return top
    return top if is_project_repo(top) else None


def doing_slugs(backlog):
    found = set()
    for line in (backlog or "").splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")] if line.startswith("|") else []
        if len(cells) > 1 and any(c.lower() == "doing" for c in cells[1:]):
            found.add(cells[0])
    return found


def working_tree_backlog():
    try:
        with open(os.path.join(root, BACKLOG_PATH), encoding="utf-8") as f:
            return f.read()
    except OSError:
        return ""


def created_branch(sub, rest):
    try:
        tokens = shlex.split(rest)
    except ValueError:
        tokens = rest.split()
    if sub in CREATE_FLAGS:
        for i, token in enumerate(tokens):
            if token in CREATE_FLAGS[sub] and i + 1 < len(tokens):
                return tokens[i + 1]
            for prefix in ("--create=", "--force-create="):
                if sub == "switch" and token.startswith(prefix):
                    return token[len(prefix):]
        return None
    positional = []
    for token in tokens:
        if token.startswith("-"):
            if token not in BRANCH_CREATE_FLAGS and not token.startswith("--track="):
                return None
        else:
            positional.append(token)
    return positional[0] if positional else None


def orphaned_feat_branches(new_slug):
    base = resolve_base(None)
    if not base:
        return []
    out = git(
        ["for-each-ref", f"--no-merged={base}", "--format=%(refname)%09%(subject)",
         f"refs/heads/{FEAT_PREFIX}", f"refs/remotes/origin/{FEAT_PREFIX}"]
    ) or ""
    parallel = doing_slugs(working_tree_backlog())
    found = {}
    for line in out.splitlines():
        ref, _, subject = line.partition("\t")
        for prefix, where in ((f"refs/heads/{FEAT_PREFIX}", "local"), (f"refs/remotes/origin/{FEAT_PREFIX}", "remote")):
            if ref.startswith(prefix):
                slug = ref[len(prefix):]
                entry = found.setdefault(slug, {"where": [], "subject": subject, "tips": []})
                entry["where"].append(where)
                entry["tips"].append(ref)
    orphans = []
    for slug, entry in sorted(found.items()):
        if slug == new_slug or slug in parallel:
            continue
        if any(slug in doing_slugs(git_show(tip, BACKLOG_PATH)) for tip in entry["tips"]):
            continue
        orphans.append((slug, entry["where"], entry["subject"]))
    return orphans


def new_branch_check(cmd, masked, cwd):
    global root
    for position, (env, opts, sub, rest) in call_matches(NEW_BRANCH_CALL, cmd, masked):
        name = created_branch(sub, rest)
        if not name or not name.startswith(FEAT_PREFIX) or ALLOW_UNMERGED.search(env):
            continue
        target = call_root(cmd, masked, position, opts, cwd)
        if target is None:
            continue
        root = target
        orphans = orphaned_feat_branches(name[len(FEAT_PREFIX):])
        if not orphans:
            continue
        listed = "\n".join(
            f"  - {FEAT_PREFIX}{slug} ({', '.join(where)}): {subject}" for slug, where, subject in orphans
        )
        fail(
            f"Rule 06/18 (decision 059): creating {name} while {len(orphans)} feat branch(es) are not merged "
            f"into the base branch and are not a `doing` row of {BACKLOG_PATH} (an orphaned branch is lost "
            f"work):\n{listed}\nFinish, merge or delete them, set a legitimately parallel task to `doing` in "
            f"{BACKLOG_PATH}, or for this command only prefix it with `ALLOW_UNMERGED_FEAT=1 `."
        )


def claude_hook():
    global root
    data = json.load(sys.stdin)
    cmd = data.get("tool_input", {}).get("command", "")
    cwd = data.get("cwd")
    without_heredocs = mask_heredocs(cmd)
    masked = mask_quotes(without_heredocs)

    new_branch_check(cmd, masked, cwd)

    calls = []
    for position, (opts, sub, rest) in call_matches(GIT_CALL, cmd, masked):
        target = call_root(cmd, masked, position, opts, cwd)
        if target is not None:
            calls.append((target, opts, sub, rest))
    if not calls:
        return

    if HOOKS_PATH_WRITE.search(without_heredocs):
        fail(
            "Rule 09: setting core.hooksPath (git config, GIT_CONFIG_KEY_*) in a command that commits or "
            "pushes switches the git hooks off exactly like --no-verify, which is not allowed. Pass the "
            "gate (pnpm gate)."
        )

    for _target, opts, sub, rest in calls:
        if skips_hooks(sub, rest):
            fail("Rule 09: --no-verify / -n is not allowed. Pass the gate (pnpm gate).")
        if HOOKS_PATH_OVERRIDE.search(opts):
            fail(
                "Rule 09: overriding core.hooksPath (-c core.hooksPath=..., --config-env) switches the git "
                "hooks off exactly like --no-verify, which is not allowed. Pass the gate (pnpm gate)."
            )

    for target in dict.fromkeys(call[0] for call in calls):
        root = target
        run_commit_hook([(sub, rest) for t, _opts, sub, rest in calls if t == target])


def use_cwd_repo():
    global root
    root = repo_containing(".") or "."


def pre_push_hook():
    use_cwd_repo()
    seen = []
    for line in sys.stdin.read().splitlines():
        parts = line.split()
        if len(parts) < 4:
            continue
        _local_ref, local_sha, remote_ref, _remote_sha = parts[:4]
        if not remote_ref.startswith(f"refs/heads/{FEAT_PREFIX}") or set(local_sha) == {"0"}:
            continue
        target = (remote_ref[len("refs/heads/"):], local_sha)
        if target not in seen:
            seen.append(target)
    for branch, sha in seen:
        push_gate(branch, sha)


def ci_hook(args):
    use_cwd_repo()
    base_ref = None
    if len(args) == 4 and args[2] == "--base":
        base_ref = args[3]
        args = args[:2]
    if len(args) != 2:
        fail(USAGE)
    branch, sha = args
    if branch.startswith("refs/heads/"):
        branch = branch[len("refs/heads/"):]
    if not branch.startswith(FEAT_PREFIX):
        return
    if not git_ok(["cat-file", "-e", f"{sha}^{{commit}}"]):
        fail(f"Rule 09 (push-review-gate): commit {sha} is not in this checkout (fetch-depth: 0?).")
    if base_ref is not None and not git_ok(["cat-file", "-e", f"{base_ref}^{{commit}}"]):
        fail(
            f"Rule 09 (push-review-gate): the --base ref {base_ref} does not resolve to a commit in this "
            "checkout."
        )
    push_gate(branch, sha, base_ref)


def main():
    args = sys.argv[1:]
    if not args:
        claude_hook()
    elif args == ["--commit"]:
        use_cwd_repo()
        commit_checks()
    elif args == ["--pre-push"]:
        pre_push_hook()
    elif args[0] == "--ci":
        ci_hook(args[1:])
    else:
        fail(USAGE)
    sys.exit(0)


main()
