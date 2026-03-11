#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const tools_js_1 = require("./tools.js");
const server = new mcp_js_1.McpServer({
    name: "agentkit-mcp",
    version: "0.1.0",
});
// ── coderace_race ──────────────────────────────────────────────────────────
server.registerTool("coderace_race", {
    title: "Coderace Race",
    description: "Run a multi-agent coding race on a repository. Agents compete to implement a task; best solution wins.",
    inputSchema: {
        repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
        agents: zod_1.z
            .string()
            .optional()
            .describe("Comma-separated agent names to race (e.g. 'codex,claude')"),
        task: zod_1.z.string().optional().describe("Task description to pass to agents"),
    },
}, async ({ repo_path, agents, task }) => {
    const text = await (0, tools_js_1.coderaceRace)({ repo_path, agents, task });
    return { content: [{ type: "text", text }] };
});
// ── coderace_review ────────────────────────────────────────────────────────
server.registerTool("coderace_review", {
    title: "Coderace Review",
    description: "Run a multi-lane AI code review on staged changes or a branch diff. Returns structured feedback.",
    inputSchema: {
        repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
        diff_source: zod_1.z
            .enum(["staged", "branch", "diff"])
            .optional()
            .describe("Where to get the diff from (staged/branch/diff)"),
        lanes: zod_1.z.string().optional().describe("Comma-separated review lane names"),
        cross_reviewers: zod_1.z
            .string()
            .optional()
            .describe("Number of cross-reviewers"),
    },
}, async ({ repo_path, diff_source, lanes, cross_reviewers }) => {
    const text = await (0, tools_js_1.coderaceReview)({ repo_path, diff_source, lanes, cross_reviewers });
    return { content: [{ type: "text", text }] };
});
// ── agentmd_generate ───────────────────────────────────────────────────────
server.registerTool("agentmd_generate", {
    title: "AgentMD Generate",
    description: "Generate a CLAUDE.md / AGENTS.md from a repository. Inspects the codebase and produces an agent context document.",
    inputSchema: {
        repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
        output: zod_1.z
            .string()
            .optional()
            .describe("Output file path (defaults to CLAUDE.md in repo root)"),
        minimal: zod_1.z.boolean().optional().describe("Generate a minimal CLAUDE.md"),
        tiered: zod_1.z.boolean().optional().describe("Generate a tiered/layered CLAUDE.md"),
    },
}, async ({ repo_path, output, minimal, tiered }) => {
    const text = await (0, tools_js_1.agentmdGenerate)({ repo_path, output, minimal, tiered });
    return { content: [{ type: "text", text }] };
});
// ── agentmd_diff ───────────────────────────────────────────────────────────
server.registerTool("agentmd_diff", {
    title: "AgentMD Diff",
    description: "Show a diff between the current CLAUDE.md and a freshly generated one. Useful to spot staleness.",
    inputSchema: {
        repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
        output: zod_1.z.string().optional().describe("Output file path"),
    },
}, async ({ repo_path, output }) => {
    const text = await (0, tools_js_1.agentmdDiff)({ repo_path, output });
    return { content: [{ type: "text", text }] };
});
// ── agentlint_check ────────────────────────────────────────────────────────
server.registerTool("agentlint_check", {
    title: "Agentlint Check",
    description: "Lint a git diff for agent-safety issues: missing context, ambiguous instructions, prompt-injection risks.",
    inputSchema: {
        diff: zod_1.z
            .string()
            .describe("Git diff content (paste the diff text) OR a file path to a .diff file"),
    },
}, async ({ diff }) => {
    const text = await (0, tools_js_1.agentlintCheck)({ diff });
    return { content: [{ type: "text", text }] };
});
// ── agentlint_check_context ────────────────────────────────────────────────
server.registerTool("agentlint_check_context", {
    title: "Agentlint Check Context",
    description: "Lint an AGENTS.md or CLAUDE.md for freshness, completeness, and structural issues. Returns a freshness score and actionable suggestions.",
    inputSchema: {
        file: zod_1.z.string().describe("Path to AGENTS.md or CLAUDE.md to lint"),
    },
}, async ({ file }) => {
    const text = await (0, tools_js_1.agentlintCheckContext)({ file });
    return { content: [{ type: "text", text }] };
});
// ── agentreflect_generate ──────────────────────────────────────────────────
server.registerTool("agentreflect_generate", {
    title: "Agentreflect Generate",
    description: "Generate agent improvement suggestions from notes, pytest output, or git history. Optionally apply them to AGENTS.md / CLAUDE.md.",
    inputSchema: {
        from_notes: zod_1.z.string().optional().describe("Free-form notes to reflect on"),
        from_pytest: zod_1.z.string().optional().describe("Path to pytest output file"),
        from_git: zod_1.z
            .boolean()
            .optional()
            .describe("Reflect from recent git log (runs in cwd)"),
        apply: zod_1.z
            .string()
            .optional()
            .describe("Path to apply suggestions to (AGENTS.md or CLAUDE.md)"),
        yes: zod_1.z
            .boolean()
            .optional()
            .describe("Auto-accept all suggestions without prompting"),
    },
}, async ({ from_notes, from_pytest, from_git, apply, yes }) => {
    const text = await (0, tools_js_1.agentreflectGenerate)({ from_notes, from_pytest, from_git, apply, yes });
    return { content: [{ type: "text", text }] };
});
// ── Start ──────────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Server is now running; log to stderr so it doesn't pollute stdout (MCP wire format)
    process.stderr.write("agentkit-mcp server started\n");
}
main().catch((err) => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map