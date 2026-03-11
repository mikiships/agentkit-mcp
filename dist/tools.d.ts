import { z } from "zod";
export declare const CoderaceRaceSchema: z.ZodObject<{
    repo_path: z.ZodString;
    agents: z.ZodOptional<z.ZodString>;
    task: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CoderaceReviewSchema: z.ZodObject<{
    repo_path: z.ZodString;
    diff_source: z.ZodOptional<z.ZodEnum<{
        staged: "staged";
        branch: "branch";
        diff: "diff";
    }>>;
    lanes: z.ZodOptional<z.ZodString>;
    cross_reviewers: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AgentmdGenerateSchema: z.ZodObject<{
    repo_path: z.ZodString;
    output: z.ZodOptional<z.ZodString>;
    minimal: z.ZodOptional<z.ZodBoolean>;
    tiered: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const AgentmdDiffSchema: z.ZodObject<{
    repo_path: z.ZodString;
    output: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AgentlintCheckSchema: z.ZodObject<{
    diff: z.ZodString;
}, z.core.$strip>;
export declare const AgentlintCheckContextSchema: z.ZodObject<{
    file: z.ZodString;
}, z.core.$strip>;
export declare const AgentreflectGenerateSchema: z.ZodObject<{
    from_notes: z.ZodOptional<z.ZodString>;
    from_pytest: z.ZodOptional<z.ZodString>;
    from_git: z.ZodOptional<z.ZodBoolean>;
    apply: z.ZodOptional<z.ZodString>;
    yes: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare function coderaceRace(args: z.infer<typeof CoderaceRaceSchema>): Promise<string>;
export declare function coderaceReview(args: z.infer<typeof CoderaceReviewSchema>): Promise<string>;
export declare function agentmdGenerate(args: z.infer<typeof AgentmdGenerateSchema>): Promise<string>;
export declare function agentmdDiff(args: z.infer<typeof AgentmdDiffSchema>): Promise<string>;
export declare function agentlintCheck(args: z.infer<typeof AgentlintCheckSchema>): Promise<string>;
export declare function agentlintCheckContext(args: z.infer<typeof AgentlintCheckContextSchema>): Promise<string>;
export declare function agentreflectGenerate(args: z.infer<typeof AgentreflectGenerateSchema>): Promise<string>;
//# sourceMappingURL=tools.d.ts.map