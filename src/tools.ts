import { z } from "zod";
import { runCLI, formatResult } from "./runner.js";

// ---------------------------------------------------------------------------
// Zod schemas for each tool's input
// ---------------------------------------------------------------------------

export const CoderaceRaceSchema = z.object({
  repo_path: z.string().describe("Absolute path to the repository root"),
  agents: z.string().optional().describe("Comma-separated agent names to race (e.g. 'codex,claude')"),
  task: z.string().optional().describe("Task description to pass to agents"),
});

export const CoderaceReviewSchema = z.object({
  repo_path: z.string().describe("Absolute path to the repository root"),
  diff_source: z
    .enum(["staged", "branch", "diff"])
    .optional()
    .describe("Where to get the diff from (staged/branch/diff)"),
  lanes: z.string().optional().describe("Comma-separated review lane names"),
  cross_reviewers: z.string().optional().describe("Number of cross-reviewers"),
});

export const AgentmdGenerateSchema = z.object({
  repo_path: z.string().describe("Absolute path to the repository root"),
  output: z.string().optional().describe("Output file path (defaults to CLAUDE.md in repo)"),
  minimal: z.boolean().optional().describe("Generate minimal CLAUDE.md"),
  tiered: z.boolean().optional().describe("Generate tiered/layered CLAUDE.md"),
});

export const AgentmdDiffSchema = z.object({
  repo_path: z.string().describe("Absolute path to the repository root"),
  output: z.string().optional().describe("Output file path"),
});

export const AgentlintCheckSchema = z.object({
  diff: z.string().describe("Git diff content (as text) OR a file path to a diff file"),
});

export const AgentlintCheckContextSchema = z.object({
  file: z.string().describe("Path to AGENTS.md or CLAUDE.md to lint"),
});

export const AgentreflectGenerateSchema = z.object({
  from_notes: z.string().optional().describe("Free-form notes to reflect on"),
  from_pytest: z.string().optional().describe("Path to pytest output file"),
  from_git: z.boolean().optional().describe("Reflect from recent git log"),
  apply: z.string().optional().describe("Path to apply suggestions to (AGENTS.md/CLAUDE.md)"),
  yes: z.boolean().optional().describe("Auto-accept all suggestions without prompting"),
});

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

export async function coderaceRace(args: z.infer<typeof CoderaceRaceSchema>): Promise<string> {
  const cmdArgs = ["race"];
  if (args.agents) cmdArgs.push("--agents", args.agents);
  if (args.task) cmdArgs.push("--task", args.task);

  const result = await runCLI("coderace", cmdArgs, { cwd: args.repo_path });
  return formatResult(result);
}

export async function coderaceReview(args: z.infer<typeof CoderaceReviewSchema>): Promise<string> {
  const cmdArgs = ["review"];
  if (args.diff_source) cmdArgs.push("--diff-source", args.diff_source);
  if (args.lanes) cmdArgs.push("--lanes", args.lanes);
  if (args.cross_reviewers) cmdArgs.push("--cross-reviewers", args.cross_reviewers);

  const result = await runCLI("coderace", cmdArgs, { cwd: args.repo_path });
  return formatResult(result);
}

export async function agentmdGenerate(args: z.infer<typeof AgentmdGenerateSchema>): Promise<string> {
  const cmdArgs: string[] = [];
  if (args.output) cmdArgs.push("--output", args.output);
  if (args.minimal) cmdArgs.push("--minimal");
  if (args.tiered) cmdArgs.push("--tiered");

  const result = await runCLI("agentmd", cmdArgs, { cwd: args.repo_path });
  return formatResult(result);
}

export async function agentmdDiff(args: z.infer<typeof AgentmdDiffSchema>): Promise<string> {
  const cmdArgs = ["diff"];
  if (args.output) cmdArgs.push("--output", args.output);

  const result = await runCLI("agentmd", cmdArgs, { cwd: args.repo_path });
  return formatResult(result);
}

export async function agentlintCheck(args: z.infer<typeof AgentlintCheckSchema>): Promise<string> {
  // diff can be raw content (piped) or a file path
  const isFilePath = !args.diff.includes("\n") && args.diff.trim().length < 500;

  let result;
  if (isFilePath) {
    result = await runCLI("agentlint", ["check", args.diff]);
  } else {
    // pipe diff content via stdin
    result = await runCLI("agentlint", ["check", "-"], { stdin: args.diff });
  }
  return formatResult(result);
}

export async function agentlintCheckContext(
  args: z.infer<typeof AgentlintCheckContextSchema>
): Promise<string> {
  const result = await runCLI("agentlint", ["check-context", args.file]);
  return formatResult(result);
}

export async function agentreflectGenerate(
  args: z.infer<typeof AgentreflectGenerateSchema>
): Promise<string> {
  const cmdArgs: string[] = [];
  if (args.from_notes) cmdArgs.push("--from-notes", args.from_notes);
  if (args.from_pytest) cmdArgs.push("--from-pytest", args.from_pytest);
  if (args.from_git) cmdArgs.push("--from-git");
  if (args.apply) cmdArgs.push("--apply", args.apply);
  if (args.yes) cmdArgs.push("--yes");

  const result = await runCLI("agentreflect", cmdArgs);
  return formatResult(result);
}
