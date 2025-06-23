import { getCurrentTimestampTool } from '../tools/dateTimeTools.js';

// Define the structure for an error log entry
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
  solutionId?: string; // Link to a solution
}

// Define the structure for a solution log entry
interface SolutionLogEntry {
  id: string;
  timestamp: string;
  errorId: string; // Link to the error it solves
  solutionDescription: string;
  codeFix?: string;
  learningPoints: string[];
}

// Simple in-memory store for now. We can persist this to a file later.
const errorLogs: ErrorLogEntry[] = [];
const solutionLogs: SolutionLogEntry[] = [];

/**
 * Logs a new error encountered during execution.
 * @param errorType The type of error (e.g., 'TypeScript', 'ToolFailure', 'LogicError').
 * @param errorMessage The detailed error message.
 * @param context An object containing relevant context like task, sprint, project, file, and code.
 */
export async function logError( // Made async
  errorType: string,
  errorMessage: string,
  context: {
    task?: string;
    sprint?: string;
    projectId?: string;
    fileContext?: string;
    codeSnippet?: string;
  }
): Promise<string> { // Return type is now Promise<string>
  const id = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = await getCurrentTimestampTool.invoke({}); // Corrected tool call: direct string output
  const newError: ErrorLogEntry = {
    id,
    timestamp,
    errorType,
    errorMessage,
    task: context.task || 'N/A',
    sprint: context.sprint || 'N/A',
    projectId: context.projectId || 'N/A',
    fileContext: context.fileContext,
    codeSnippet: context.codeSnippet,
  };
  errorLogs.push(newError);
  console.log(`[Autonomous Learning] Logged new error: ${id} - ${errorMessage}`);
  return id;
}

/**
 * Logs a solution to a previously encountered error.
 * @param errorId The ID of the error this solution addresses.
 * @param solutionDescription A description of how the error was resolved.
 * @param learningPoints Key takeaways from this error/solution cycle.
 * @param codeFix An optional code snippet that represents the fix.
 */
export async function logSolution( // Made async
  errorId: string,
  solutionDescription: string,
  learningPoints: string[],
  codeFix?: string
): Promise<string> { // Return type is now Promise<string>
  const id = `solution_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = await getCurrentTimestampTool.invoke({}); // Corrected tool call: direct string output
  const newSolution: SolutionLogEntry = {
    id,
    timestamp,
    errorId,
    solutionDescription,
    learningPoints,
    codeFix,
  };
  solutionLogs.push(newSolution);

  // Link the solution to the error log
  const error = errorLogs.find(e => e.id === errorId);
  if (error) {
    error.solutionId = id;
  }

  console.log(`[Autonomous Learning] Logged solution: ${id} for error: ${errorId}`);
  return id;
}

/**
 * Retrieves all logged errors.
 */
export function getErrorLogs(): ErrorLogEntry[] {
  return [...errorLogs];
}

/**
 * Retrieves all logged solutions.
 */
export function getSolutionLogs(): SolutionLogEntry[] {
  return [...solutionLogs];
}

/**
 * Clears all logs (for testing or reset purposes).
 */
export function clearLogs() {
  errorLogs.length = 0;
  solutionLogs.length = 0;
  console.log('[Autonomous Learning] All logs cleared.');
}
