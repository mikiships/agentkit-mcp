export interface RunResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
/**
 * Run a CLI command and return its output.
 * If the CLI is not found, returns a structured error.
 */
export declare function runCLI(cmd: string, args: string[], options?: {
    cwd?: string;
    stdin?: string;
    timeoutMs?: number;
}): Promise<RunResult>;
/** Format RunResult as a tool response text */
export declare function formatResult(result: RunResult): string;
//# sourceMappingURL=runner.d.ts.map