import { z } from 'zod';

// --- Zod Schemas for Data Structures ---

export const Agent = z.enum([
  'Janus', 'Lyra', 'Caelus', 'Fornax', 'Corvus', 'Orion'
]);

export const TaskStatus = z.enum([
  'pending', 'in_progress', 'completed', 'failed', 'awaiting_human_approval'
]);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  agent: Agent,
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  status: TaskStatus.default('pending'),
  dependencies: z.array(z.string().uuid()).optional(),
});

// --- TypeScript Types ---

export type Task = z.infer<typeof TaskSchema>;

// This is the TypeScript interface for our state.
export interface AgentState {
  tasks: Task[];
  systemMessages: string[];
  humanApprovalNeeded: boolean;
}

// --- LangGraph State Definition ---

// FIX: Renamed from 'agentState' to 'graphState' to avoid confusion and ensure clean export.
// This object defines how each channel in our AgentState is updated.
export const graphState = {
  tasks: {
    value: (x: Task[], y: Task[]) => y, // Replace the entire list of tasks
    default: () => [],
  },
  systemMessages: {
    value: (x: string[], y: string[]) => x.concat(y), // Add new messages to the log
    default: () => [],
  },
  humanApprovalNeeded: {
    value: (x: boolean, y: boolean) => y, // Last write wins
    default: () => false,
  },
};


// --- Tool Schemas ---

export const RequestHumanApprovalInputSchema = z.object({
  taskId: z.string().uuid(),
  reason: z.string(),
});

export const ResearchProductTrendsInputSchema = z.object({
    topic: z.string(),
    domains: z.array(z.string()).optional(),
});

/**
 * Input schema for Caelus's tool to generate marketing copy.
 */
export const GenerateAdCopyInputSchema = z.object({
  productName: z.string().describe("The name of the product to create ad copy for."),
  productDescription: z.string().describe("A brief description of the product, its features, and target audience."),
  targetPlatform: z.enum(['Facebook', 'Google Ads', 'Twitter', 'Instagram']).describe("The advertising platform for which to tailor the copy."),
});