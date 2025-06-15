// packages/aegis-core/src/schemas.ts
// Definitive version by Eira to support both server and run-agent contexts.

import { z } from 'zod';

export const Agent = z.enum(['Janus', 'Lyra', 'Caelus', 'Fornax', 'Corvus', 'Orion']);
export const TaskStatus = z.enum(['pending', 'in_progress', 'completed', 'failed', 'awaiting_human_approval']);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  agent: Agent,
  input: z.any(),
  output: z.record(z.unknown()).optional(),
  status: TaskStatus.default('pending'),
  dependencies: z.array(z.string().uuid()).optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// --- CHANGE 1: The complete and correct state interface ---
export interface AgentState {
  tasks: Task[];
  systemMessages: string[];
  humanApprovalNeeded: boolean;
  product?: {
    productId: string;
    productUrl: string;
    title: string;
    description: string;
  };
}

// --- CHANGE 2: The complete and correct graph state definition ---
export const graphState = {
  tasks: {
    value: (_: Task[], y: Task[]) => y,
    default: () => [],
  },
  systemMessages: {
    value: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  },
  humanApprovalNeeded: {
    value: (_: boolean, y: boolean) => y,
    default: () => false,
  },
  product: {
    value: (_: any, y: any) => y,
    default: () => undefined,
  },
};

// --- Tool Schemas (Unchanged) ---
export const GenerateAdCopyInputSchema = z.object({
  productName: z.string().describe("The name of the product to create ad copy for."),
  productDescription: z.string().describe("A brief description of the product, its features, and target audience."),
  targetPlatform: z.enum(['Facebook', 'Google Ads', 'Twitter', 'Instagram']).describe("The advertising platform for which to tailor the copy."),
});

export const productSchema = z.object({
  title: z.string().describe("The title of the product."),
  description: z.string().describe("The rich text or HTML description of the product."),
  price: z.number().describe("The selling price of the product."),
});

export const emailSchema = z.object({
  to: z.string().describe("The recipient's email address. This must be a valid email format."),
  subject: z.string().describe("The subject line of the email."),
  htmlBody: z.string().describe("The content of the email in HTML format."),
});