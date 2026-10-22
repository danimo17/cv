// Git sets these variables for hooks; specs that create scratch repos (cwd: tmp dir) would otherwise
// write into the real repository (stray commits, branches and core.hooksPath changes in linked worktrees).
const GIT_HOOK_VARIABLES = /^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|COMMON_DIR|PREFIX)$/

for (const name of Object.keys(process.env)) {
  if (GIT_HOOK_VARIABLES.test(name)) Reflect.deleteProperty(process.env, name)
}
