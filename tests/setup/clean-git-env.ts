// Git sets these variables for hooks; specs that create scratch repos (cwd: tmp dir) would otherwise
// write into the real repository (stray commits, branches and core.hooksPath changes in linked worktrees).
// Repository-redirecting variables and the identity/date overrides (which beat the `git config user.*` the
// fixtures set) are removed; PATH, HOME, GIT_EXEC_PATH and GIT_CONFIG_GLOBAL stay.
const GIT_HOOK_VARIABLES =
  /^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|NAMESPACE|PREFIX|COMMON_DIR|CONFIG_PARAMETERS|CONFIG_COUNT|CONFIG_KEY_\d+|CONFIG_VALUE_\d+|(AUTHOR|COMMITTER)_(NAME|EMAIL|DATE))$/

export function scrubGitEnv(env: NodeJS.ProcessEnv): string[] {
  const removed = Object.keys(env).filter((name) => GIT_HOOK_VARIABLES.test(name))
  for (const name of removed) Reflect.deleteProperty(env, name)
  return removed
}

scrubGitEnv(process.env)
