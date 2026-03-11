import { describe, it, expect, vi, beforeEach } from "vitest";
import { runCLI, formatResult } from "../src/runner";

// ── runner unit tests ──────────────────────────────────────────────────────

describe("runCLI", () => {
  it("returns stdout on success", async () => {
    const result = await runCLI("echo", ["hello world"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("hello world");
  });

  it("returns exit code 127 when command not found", async () => {
    const result = await runCLI("__nonexistent_cli_xyz__", ["--version"]);
    expect(result.exitCode).toBe(127);
    expect(result.stderr).toContain("CLI not found");
  });

  it("captures stderr", async () => {
    const result = await runCLI("sh", ["-c", "echo errtext >&2; exit 1"]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("errtext");
  });

  it("passes stdin to the process", async () => {
    const result = await runCLI("cat", [], { stdin: "hello from stdin" });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hello from stdin");
  });
});

describe("formatResult", () => {
  it("returns CLI-not-found error for exit 127", () => {
    const text = formatResult({ stdout: "", stderr: "CLI not found: agentmd. Install with: pip install agentmd-gen", exitCode: 127 });
    expect(text).toContain("CLI not found");
    expect(text).toContain("agentmd");
  });

  it("returns stdout on success", () => {
    const text = formatResult({ stdout: "generated CLAUDE.md", stderr: "", exitCode: 0 });
    expect(text).toBe("generated CLAUDE.md");
  });

  it("returns (no output) when stdout and stderr are empty on success", () => {
    const text = formatResult({ stdout: "", stderr: "", exitCode: 0 });
    expect(text).toBe("(no output)");
  });

  it("includes stderr on non-zero exit", () => {
    const text = formatResult({ stdout: "", stderr: "something broke", exitCode: 1 });
    expect(text).toContain("something broke");
  });

  it("does not include stderr in output on exit 0", () => {
    const text = formatResult({ stdout: "ok", stderr: "some warnings", exitCode: 0 });
    expect(text).toBe("ok");
    expect(text).not.toContain("some warnings");
  });
});

// ── CLI availability checks ────────────────────────────────────────────────

describe("CLI availability", () => {
  it("coderace CLI is available", async () => {
    const result = await runCLI("coderace", ["--help"]);
    // Exit code might be 0 or 1 (help sometimes exits 0, sometimes not)
    // Just check it's not 127 (not found)
    expect(result.exitCode).not.toBe(127);
  });

  it("agentmd CLI is available", async () => {
    const result = await runCLI("agentmd", ["--help"]);
    expect(result.exitCode).not.toBe(127);
  });

  it("agentlint CLI is available", async () => {
    const result = await runCLI("agentlint", ["--help"]);
    expect(result.exitCode).not.toBe(127);
  });

  it("agentreflect CLI is available", async () => {
    const result = await runCLI("agentreflect", ["--help"]);
    expect(result.exitCode).not.toBe(127);
  });
});

// ── Tool handler smoke tests ───────────────────────────────────────────────

import {
  agentlintCheckContext,
  agentlintCheck,
  agentmdGenerate,
  agentreflectGenerate,
} from "../src/tools";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

describe("agentlint_check_context", () => {
  it("returns non-empty output on a real AGENTS.md", async () => {
    const agentsMd = "/Users/mordecai/.openclaw/workspace/AGENTS.md";
    if (!fs.existsSync(agentsMd)) {
      console.log("Skipping: AGENTS.md not found at expected path");
      return;
    }
    const text = await agentlintCheckContext({ file: agentsMd });
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain("CLI not found");
  });

  it("returns error message for missing file", async () => {
    const text = await agentlintCheckContext({ file: "/nonexistent/AGENTS.md" });
    // Should return something (error message), not crash
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("agentlint_check (diff)", () => {
  it("accepts raw diff content", async () => {
    const sampleDiff = `diff --git a/test.py b/test.py
index 000000..111111 100644
--- /dev/null
+++ b/test.py
@@ -0,0 +1,3 @@
+def hello():
+    return "world"
`;
    const text = await agentlintCheck({ diff: sampleDiff });
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("agentmd_generate", () => {
  it("runs on the agentkit-mcp repo itself", async () => {
    const repoPath = path.resolve(__dirname, "..");
    const tmpOutput = path.join(os.tmpdir(), "agentkit-test-claude.md");
    const text = await agentmdGenerate({ repo_path: repoPath, output: tmpOutput });
    // Should not error with CLI-not-found
    expect(text).not.toContain("CLI not found");
    expect(text.length).toBeGreaterThan(0);
    // Clean up if file was created
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
  });
});

describe("agentreflect_generate", () => {
  it("returns suggestions from notes", async () => {
    const text = await agentreflectGenerate({
      from_notes: "The agent was slow to respond in production. Tests failed 3 times due to missing setup.",
    });
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain("CLI not found");
  });
});
