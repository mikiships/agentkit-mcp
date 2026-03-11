"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentreflectGenerateSchema = exports.AgentlintCheckContextSchema = exports.AgentlintCheckSchema = exports.AgentmdDiffSchema = exports.AgentmdGenerateSchema = exports.CoderaceReviewSchema = exports.CoderaceRaceSchema = void 0;
exports.coderaceRace = coderaceRace;
exports.coderaceReview = coderaceReview;
exports.agentmdGenerate = agentmdGenerate;
exports.agentmdDiff = agentmdDiff;
exports.agentlintCheck = agentlintCheck;
exports.agentlintCheckContext = agentlintCheckContext;
exports.agentreflectGenerate = agentreflectGenerate;
const zod_1 = require("zod");
const runner_js_1 = require("./runner.js");
// ---------------------------------------------------------------------------
// Zod schemas for each tool's input
// ---------------------------------------------------------------------------
exports.CoderaceRaceSchema = zod_1.z.object({
    repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
    agents: zod_1.z.string().optional().describe("Comma-separated agent names to race (e.g. 'codex,claude')"),
    task: zod_1.z.string().optional().describe("Task description to pass to agents"),
});
exports.CoderaceReviewSchema = zod_1.z.object({
    repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
    diff_source: zod_1.z
        .enum(["staged", "branch", "diff"])
        .optional()
        .describe("Where to get the diff from (staged/branch/diff)"),
    lanes: zod_1.z.string().optional().describe("Comma-separated review lane names"),
    cross_reviewers: zod_1.z.string().optional().describe("Number of cross-reviewers"),
});
exports.AgentmdGenerateSchema = zod_1.z.object({
    repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
    output: zod_1.z.string().optional().describe("Output file path (defaults to CLAUDE.md in repo)"),
    minimal: zod_1.z.boolean().optional().describe("Generate minimal CLAUDE.md"),
    tiered: zod_1.z.boolean().optional().describe("Generate tiered/layered CLAUDE.md"),
});
exports.AgentmdDiffSchema = zod_1.z.object({
    repo_path: zod_1.z.string().describe("Absolute path to the repository root"),
    output: zod_1.z.string().optional().describe("Output file path"),
});
exports.AgentlintCheckSchema = zod_1.z.object({
    diff: zod_1.z.string().describe("Git diff content (as text) OR a file path to a diff file"),
});
exports.AgentlintCheckContextSchema = zod_1.z.object({
    file: zod_1.z.string().describe("Path to AGENTS.md or CLAUDE.md to lint"),
});
exports.AgentreflectGenerateSchema = zod_1.z.object({
    from_notes: zod_1.z.string().optional().describe("Free-form notes to reflect on"),
    from_pytest: zod_1.z.string().optional().describe("Path to pytest output file"),
    from_git: zod_1.z.boolean().optional().describe("Reflect from recent git log"),
    apply: zod_1.z.string().optional().describe("Path to apply suggestions to (AGENTS.md/CLAUDE.md)"),
    yes: zod_1.z.boolean().optional().describe("Auto-accept all suggestions without prompting"),
});
// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------
async function coderaceRace(args) {
    const cmdArgs = ["race"];
    if (args.agents)
        cmdArgs.push("--agents", args.agents);
    if (args.task)
        cmdArgs.push("--task", args.task);
    const result = await (0, runner_js_1.runCLI)("coderace", cmdArgs, { cwd: args.repo_path });
    return (0, runner_js_1.formatResult)(result);
}
async function coderaceReview(args) {
    const cmdArgs = ["review"];
    if (args.diff_source)
        cmdArgs.push("--diff-source", args.diff_source);
    if (args.lanes)
        cmdArgs.push("--lanes", args.lanes);
    if (args.cross_reviewers)
        cmdArgs.push("--cross-reviewers", args.cross_reviewers);
    const result = await (0, runner_js_1.runCLI)("coderace", cmdArgs, { cwd: args.repo_path });
    return (0, runner_js_1.formatResult)(result);
}
async function agentmdGenerate(args) {
    const cmdArgs = [];
    if (args.output)
        cmdArgs.push("--output", args.output);
    if (args.minimal)
        cmdArgs.push("--minimal");
    if (args.tiered)
        cmdArgs.push("--tiered");
    const result = await (0, runner_js_1.runCLI)("agentmd", cmdArgs, { cwd: args.repo_path });
    return (0, runner_js_1.formatResult)(result);
}
async function agentmdDiff(args) {
    const cmdArgs = ["diff"];
    if (args.output)
        cmdArgs.push("--output", args.output);
    const result = await (0, runner_js_1.runCLI)("agentmd", cmdArgs, { cwd: args.repo_path });
    return (0, runner_js_1.formatResult)(result);
}
async function agentlintCheck(args) {
    // diff can be raw content (piped) or a file path
    const isFilePath = !args.diff.includes("\n") && args.diff.trim().length < 500;
    let result;
    if (isFilePath) {
        result = await (0, runner_js_1.runCLI)("agentlint", ["check", args.diff]);
    }
    else {
        // pipe diff content via stdin
        result = await (0, runner_js_1.runCLI)("agentlint", ["check", "-"], { stdin: args.diff });
    }
    return (0, runner_js_1.formatResult)(result);
}
async function agentlintCheckContext(args) {
    const result = await (0, runner_js_1.runCLI)("agentlint", ["check-context", args.file]);
    return (0, runner_js_1.formatResult)(result);
}
async function agentreflectGenerate(args) {
    const cmdArgs = [];
    if (args.from_notes)
        cmdArgs.push("--from-notes", args.from_notes);
    if (args.from_pytest)
        cmdArgs.push("--from-pytest", args.from_pytest);
    if (args.from_git)
        cmdArgs.push("--from-git");
    if (args.apply)
        cmdArgs.push("--apply", args.apply);
    if (args.yes)
        cmdArgs.push("--yes");
    const result = await (0, runner_js_1.runCLI)("agentreflect", cmdArgs);
    return (0, runner_js_1.formatResult)(result);
}
//# sourceMappingURL=tools.js.map