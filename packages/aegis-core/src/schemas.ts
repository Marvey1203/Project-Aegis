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
  input: z.any(),
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
    product?: { // Add this optional property
    productId: string;
    productUrl: string;
    title: string;
    description: string;
  };
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
    product: {
    value: (x: any, y: any) => y, // Last write wins. The new value replaces the old.
    default: () => undefined,
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
/**
 * Input schema for Fornax's tool to process orders.
 * This schema defines the structure of the input data required to process an order.
 */
export const ProcessOrderInputSchema = z.object({
  productName: z.string().describe("The name of the product that was ordered."),
  productSku: z.string().describe("The unique SKU of the product."),
  // CORRECTED: .gte(1) is functionally the same for an integer and is compatible with the Google API.
  quantity: z.number().int().gte(1).describe("The number of units ordered."), 
  customerName: z.string().describe("The full name of the customer."),
  shippingAddress: z.string().describe("The complete shipping address for the customer."),
});

/**
 * Input schema for Corvus's tool to send a shipping confirmation email.
 */
export const SendShippingConfirmationEmailInputSchema = z.object({
  customerName: z.string().describe("The first name of the customer."),
  customerEmail: z.string().describe("The email address of the customer."), // CORRECTED: Removed the incompatible .email() validator.
  orderId: z.string().describe("The unique ID of the customer's order."),
  trackingNumber: z.string().describe("The shipping carrier's tracking number for the order."),
});

// --- Shopify Product Creation Tool Schema ---
export const productSchema = z.object({
  title: z.string().describe("The title of the product."),
  description: z.string().describe("The detailed description of the product (HTML format is okay)."),
  price: z.number().describe("The selling price of the product."),
});

export const emailSchema = z.object({
  to: z.string().describe("The recipient's email address. This must be a valid email format."),
  subject: z.string().describe("The subject line of the email."),
  htmlBody: z.string().describe("The content of the email in HTML format."),
});