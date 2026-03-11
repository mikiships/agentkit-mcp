"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = runCLI;
exports.formatResult = formatResult;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
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
                // Ensure pipx/local bin is on PATH across different user environments
                PATH: [
                    path.join(os.homedir(), ".local/bin"),
                    "/opt/homebrew/bin",
                    "/usr/local/bin",
                    "/usr/bin",
                    "/bin",
                    process.env.PATH ?? "",
                ].join(":"),
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