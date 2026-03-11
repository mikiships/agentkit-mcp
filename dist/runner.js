"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = runCLI;
exports.formatResult = formatResult;
const child_process_1 = require("child_process");
/**
 * Run a CLI command and return its output.
 * If the CLI is not found, returns a structured error.
 */
function runCLI(cmd, args, options = {}) {
    return new Promise((resolve) => {
        const timeoutMs = options.timeoutMs ?? 120_000;
        let timedOut = false;
        const child = (0, child_process_1.spawn)(cmd, args, {
            cwd: options.cwd,
            env: {
                ...process.env,
                // Ensure pipx/local bin is on PATH
                PATH: `/Users/mordecai/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
            },
            stdio: ["pipe", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (d) => {
            stdout += d.toString();
        });
        child.stderr.on("data", (d) => {
            stderr += d.toString();
        });
        if (options.stdin) {
            child.stdin.write(options.stdin);
            child.stdin.end();
        }
        else {
            child.stdin.end();
        }
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGTERM");
        }, timeoutMs);
        child.on("error", (err) => {
            clearTimeout(timer);
            if (err.code === "ENOENT") {
                resolve({
                    stdout: "",
                    stderr: `CLI not found: ${cmd}. Install with: pip install ${cliToPackage(cmd)}`,
                    exitCode: 127,
                });
            }
            else {
                resolve({ stdout: "", stderr: err.message, exitCode: 1 });
            }
        });
        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({
                stdout,
                stderr: timedOut ? `Process timed out after ${timeoutMs}ms\n${stderr}` : stderr,
                exitCode: code ?? (timedOut ? 124 : 1),
            });
        });
    });
}
function cliToPackage(cmd) {
    const map = {
        coderace: "coderace",
        agentmd: "agentmd-gen",
        agentlint: "ai-agentlint",
        agentreflect: "ai-agentreflect",
    };
    return map[cmd] ?? cmd;
}
/** Format RunResult as a tool response text */
function formatResult(result) {
    if (result.exitCode === 127) {
        return `Error: ${result.stderr}`;
    }
    const parts = [];
    if (result.stdout.trim())
        parts.push(result.stdout.trim());
    if (result.stderr.trim()) {
        // Only surface stderr if exit was non-zero (treat as warning/info otherwise)
        if (result.exitCode !== 0) {
            parts.push(`[stderr]\n${result.stderr.trim()}`);
        }
    }
    if (parts.length === 0) {
        return result.exitCode === 0
            ? "(no output)"
            : `Command exited with code ${result.exitCode}`;
    }
    return parts.join("\n\n");
}
//# sourceMappingURL=runner.js.map