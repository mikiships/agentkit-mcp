#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  coderaceRace,
  coderaceReview,
  agentmdGenerate,
  agentmdDiff,
  agentlintCheck,
  agentlintCheckContext,
  agentreflectGenerate,
} from "./tools.js";

const server = new McpServer({
  name: "agentkit-mcp",
  version: "0.1.0",
});

// ── coderace_race ──────────────────────────────────────────────────────────
server.registerTool(
  "coderace_race",
  {
    title: "Coderace Race",
    description:
      "Run a multi-agent coding race on a repository. Agents compete to implement a task; best solution wins.",
    inputSchema: {
      repo_path: z.string().describe("Absolute path to the repository root"),
      agents: z
        .string()
        .optional()
        .describe("Comma-separated agent names to race (e.g. 'codex,claude')"),
      task: z.string().optional().describe("Task description to pass to agents"),
    },
  },
  async ({ repo_path, agents, task }) => {
    const text = await coderaceRace({ repo_path, agents, task });
    return { content: [{ type: "text", text }] };
  }
);

// ── coderace_review ────────────────────────────────────────────────────────
server.registerTool(
  "coderace_review",
  {
    title: "Coderace Review",
    description:
      "Run a multi-lane AI code review on staged changes or a branch diff. Returns structured feedback.",
    inputSchema: {
      repo_path: z.string().describe("Absolute path to the repository root"),
      diff_source: z
        .enum(["staged", "branch", "diff"])
        .optional()
        .describe("Where to get the diff from (staged/branch/diff)"),
      lanes: z.string().optional().describe("Comma-separated review lane names"),
      cross_reviewers: z
        .string()
        .optional()
        .describe("Number of cross-reviewers"),
    },
  },
  async ({ repo_path, diff_source, lanes, cross_reviewers }) => {
    const text = await coderaceReview({ repo_path, diff_source, lanes, cross_reviewers });
    return { content: [{ type: "text", text }] };
  }
);

// ── agentmd_generate ───────────────────────────────────────────────────────
server.registerTool(
  "agentmd_generate",
  {
    title: "AgentMD Generate",
    description:
      "Generate a CLAUDE.md / AGENTS.md from a repository. Inspects the codebase and produces an agent context document.",
    inputSchema: {
      repo_path: z.string().describe("Absolute path to the repository root"),
      output: z
        .string()
        .optional()
        .describe("Output file path (defaults to CLAUDE.md in repo root)"),
      minimal: z.boolean().optional().describe("Generate a minimal CLAUDE.md"),
      tiered: z.boolean().optional().describe("Generate a tiered/layered CLAUDE.md"),
    },
  },
  async ({ repo_path, output, minimal, tiered }) => {
    const text = await agentmdGenerate({ repo_path, output, minimal, tiered });
    return { content: [{ type: "text", text }] };
  }
);

// ── agentmd_diff ───────────────────────────────────────────────────────────
server.registerTool(
  "agentmd_diff",
  {
    title: "AgentMD Diff",
    description:
      "Show a diff between the current CLAUDE.md and a freshly generated one. Useful to spot staleness.",
    inputSchema: {
      repo_path: z.string().describe("Absolute path to the repository root"),
      output: z.string().optional().describe("Output file path"),
    },
  },
  async ({ repo_path, output }) => {
    const text = await agentmdDiff({ repo_path, output });
    return { content: [{ type: "text", text }] };
  }
);

// ── agentlint_check ────────────────────────────────────────────────────────
server.registerTool(
  "agentlint_check",
  {
    title: "Agentlint Check",
    description:
      "Lint a git diff for agent-safety issues: missing context, ambiguous instructions, prompt-injection risks.",
    inputSchema: {
      diff: z
        .string()
        .describe(
          "Git diff content (paste the diff text) OR a file path to a .diff file"
        ),
    },
  },
  async ({ diff }) => {
    const text = await agentlintCheck({ diff });
    return { content: [{ type: "text", text }] };
  }
);

// ── agentlint_check_context ────────────────────────────────────────────────
server.registerTool(
  "agentlint_check_context",
  {
    title: "Agentlint Check Context",
    description:
      "Lint an AGENTS.md or CLAUDE.md for freshness, completeness, and structural issues. Returns a freshness score and actionable suggestions.",
    inputSchema: {
      file: z.string().describe("Path to AGENTS.md or CLAUDE.md to lint"),
    },
  },
  async ({ file }) => {
    const text = await agentlintCheckContext({ file });
    return { content: [{ type: "text", text }] };
  }
);

// ── agentreflect_generate ──────────────────────────────────────────────────
server.registerTool(
  "agentreflect_generate",
  {
    title: "Agentreflect Generate",
    description:
      "Generate agent improvement suggestions from notes, pytest output, or git history. Optionally apply them to AGENTS.md / CLAUDE.md.",
    inputSchema: {
      from_notes: z.string().optional().describe("Free-form notes to reflect on"),
      from_pytest: z.string().optional().describe("Path to pytest output file"),
      from_git: z
        .boolean()
        .optional()
        .describe("Reflect from recent git log (runs in cwd)"),
      apply: z
        .string()
        .optional()
        .describe("Path to apply suggestions to (AGENTS.md or CLAUDE.md)"),
      yes: z
        .boolean()
        .optional()
        .describe("Auto-accept all suggestions without prompting"),
    },
  },
  async ({ from_notes, from_pytest, from_git, apply, yes }) => {
    const text = await agentreflectGenerate({ from_notes, from_pytest, from_git, apply, yes });
    return { content: [{ type: "text", text }] };
  }
);

// ── Start ──────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now running; log to stderr so it doesn't pollute stdout (MCP wire format)
  process.stderr.write("agentkit-mcp server started\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
