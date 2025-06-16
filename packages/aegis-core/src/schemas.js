"use strict";
// packages/aegis-core/src/schemas.ts
// Definitive version by Eira to support both server and run-agent contexts.
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSchema = exports.productSchema = exports.GenerateAdCopyInputSchema = exports.graphState = exports.TaskSchema = exports.TaskStatus = exports.Agent = void 0;
const zod_1 = require("zod");
exports.Agent = zod_1.z.enum(['Janus', 'Lyra', 'Caelus', 'Fornax', 'Corvus', 'Orion']);
exports.TaskStatus = zod_1.z.enum(['pending', 'in_progress', 'completed', 'failed', 'awaiting_human_approval']);
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    description: zod_1.z.string(),
    agent: exports.Agent,
    input: zod_1.z.any(),
    output: zod_1.z.record(zod_1.z.unknown()).optional(),
    status: exports.TaskStatus.default('pending'),
    dependencies: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
// --- CHANGE 2: The complete and correct graph state definition ---
exports.graphState = {
    tasks: {
        value: (_, y) => y,
        default: () => [],
    },
    systemMessages: {
        value: (x, y) => x.concat(y),
        default: () => [],
    },
    humanApprovalNeeded: {
        value: (_, y) => y,
        default: () => false,
    },
    product: {
        value: (_, y) => y,
        default: () => undefined,
    },
};
// --- Tool Schemas (Unchanged) ---
exports.GenerateAdCopyInputSchema = zod_1.z.object({
    productName: zod_1.z.string().describe("The name of the product to create ad copy for."),
    productDescription: zod_1.z.string().describe("A brief description of the product, its features, and target audience."),
    targetPlatform: zod_1.z.enum(['Facebook', 'Google Ads', 'Twitter', 'Instagram']).describe("The advertising platform for which to tailor the copy."),
});
exports.productSchema = zod_1.z.object({
    title: zod_1.z.string().describe("The title of the product."),
    description: zod_1.z.string().describe("The rich text or HTML description of the product."),
    price: zod_1.z.number().describe("The selling price of the product."),
});
exports.emailSchema = zod_1.z.object({
    to: zod_1.z.string().describe("The recipient's email address. This must be a valid email format."),
    subject: zod_1.z.string().describe("The subject line of the email."),
    htmlBody: zod_1.z.string().describe("The content of the email in HTML format."),
});
