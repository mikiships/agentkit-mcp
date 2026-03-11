# agentkit-mcp

[![Works with Claude Code](https://img.shields.io/badge/Works%20with-Claude%20Code-blue)](https://claude.ai/code)
[![npm version](https://img.shields.io/npm/v/agentkit-mcp)](https://www.npmjs.com/package/agentkit-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MCP server that exposes the **agent quality quartet** — [coderace](https://github.com/mikiships/coderace), [agentmd](https://github.com/mikiships/agentmd-gen), [agentlint](https://github.com/mikiships/ai-agentlint), [agentreflect](https://github.com/mikiships/ai-agentreflect) — as tools inside Claude Code and any MCP-compatible client.

No context-switching. Run multi-agent code races, generate CLAUDE.md, lint diffs, and reflect on agent failures — all from within your AI coding session.

## Prerequisites

Install the four Python CLIs:

```bash
pip install coderace agentmd-gen ai-agentlint ai-agentreflect
```

Or with pipx (recommended):

```bash
pipx install coderace
pipx install agentmd-gen
pipx install ai-agentlint
pipx install ai-agentreflect
```

## Install

```bash
npm install -g agentkit-mcp
```

Or use directly without installing via `npx agentkit-mcp`.

## Configure

### Claude Code

```bash
claude mcp add agentkit-mcp npx agentkit-mcp
```

### Manual `.mcp.json`

```json
{
  "mcpServers": {
    "agentkit": {
      "command": "npx",
      "args": ["agentkit-mcp"]
    }
  }
}
```

Place this file in your project root or `~/.claude/`.

## Tools

### `coderace_race`

Run a multi-agent coding race on a repository.

```
repo_path   (required)  Absolute path to the repository root
agents      (optional)  Comma-separated agent names: "codex,claude"
task        (optional)  Task description to pass to agents
```

Example prompt in Claude Code:
> "Run a coderace race on `/Users/me/myrepo` with agents `codex,claude` to implement a binary search function."

---

### `coderace_review`

Multi-lane AI code review on staged changes or a branch diff.

```
repo_path      (required)  Absolute path to the repository root
diff_source    (optional)  staged | branch | diff
lanes          (optional)  Comma-separated lane names
cross_reviewers (optional) Number of cross-reviewers
```

Example:
> "Review the staged changes in `/Users/me/myrepo` using coderace_review."

---

### `agentmd_generate`

Generate a `CLAUDE.md` / `AGENTS.md` from a repository. Inspects code structure, dependencies, and conventions.

```
repo_path  (required)  Absolute path to the repository root
output     (optional)  Output file path (default: CLAUDE.md in repo root)
minimal    (optional)  Generate a minimal file
tiered     (optional)  Generate a tiered/layered file
```

Example:
> "Generate a CLAUDE.md for `/Users/me/myrepo`."

---

### `agentmd_diff`

Show a diff between the current `CLAUDE.md` and a freshly generated one. Spot what's gone stale.

```
repo_path  (required)  Absolute path to the repository root
output     (optional)  Output file path
```

---

### `agentlint_check`

Lint a git diff for agent-safety issues: missing context, ambiguous instructions, prompt-injection risks.

```
diff  (required)  Git diff content (paste text) OR path to a .diff file
```

Example:
> "Lint this diff with agentlint_check: <paste git diff output>"

---

### `agentlint_check_context`

Lint an `AGENTS.md` or `CLAUDE.md` for freshness, completeness, and structural quality. Returns a freshness score and actionable suggestions.

```
file  (required)  Path to AGENTS.md or CLAUDE.md
```

Example:
> "Check if my AGENTS.md at `/Users/me/myrepo/AGENTS.md` is up to date."

---

### `agentreflect_generate`

Generate agent improvement suggestions from notes, pytest output, or git history. Optionally apply them to `AGENTS.md` / `CLAUDE.md`.

```
from_notes   (optional)  Free-form notes to reflect on
from_pytest  (optional)  Path to pytest output file
from_git     (optional)  Reflect from recent git log
apply        (optional)  Path to apply suggestions to
yes          (optional)  Auto-accept all suggestions
```

Example:
> "Use agentreflect_generate with these notes: 'Tests failed 3 times, agent missed the cwd convention.'"

---

## Development

```bash
git clone https://github.com/mikiships/agentkit-mcp
cd agentkit-mcp
npm install
npm run build
npm test
```

To test locally as an MCP server:

```bash
node dist/index.js
```

## License

MIT
