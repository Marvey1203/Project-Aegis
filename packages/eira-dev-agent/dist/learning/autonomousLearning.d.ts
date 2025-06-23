interface ErrorLogEntry {
    id: string;
    timestamp: string;
    task: string;
    sprint: string;
    projectId: string;
    errorType: string;
    errorMessage: string;
    fileContext?: string;
    codeSnippet?: string;
    solutionId?: string;
}
interface SolutionLogEntry {
    id: string;
    timestamp: string;
    errorId: string;
    solutionDescription: string;
    codeFix?: string;
    learningPoints: string[];
}
/**
 * Logs a new error encountered during execution.
 * @param errorType The type of error (e.g., 'TypeScript', 'ToolFailure', 'LogicError').
 * @param errorMessage The detailed error message.
 * @param context An object containing relevant context like task, sprint, project, file, and code.
 */
export declare function logError(// Made async
errorType: string, errorMessage: string, context: {
    task?: string;
    sprint?: string;
    projectId?: string;
    fileContext?: string;
    codeSnippet?: string;
}): Promise<string>;
/**
 * Logs a solution to a previously encountered error.
 * @param errorId The ID of the error this solution addresses.
 * @param solutionDescription A description of how the error was resolved.
 * @param learningPoints Key takeaways from this error/solution cycle.
 * @param codeFix An optional code snippet that represents the fix.
 */
export declare function logSolution(// Made async
errorId: string, solutionDescription: string, learningPoints: string[], codeFix?: string): Promise<string>;
/**
 * Retrieves all logged errors.
 */
export declare function getErrorLogs(): ErrorLogEntry[];
/**
 * Retrieves all logged solutions.
 */
export declare function getSolutionLogs(): SolutionLogEntry[];
/**
 * Clears all logs (for testing or reset purposes).
 */
export declare function clearLogs(): void;
export {};
