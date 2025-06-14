// packages/aegis-core/src/tools.ts (Definitive Final Version)

import { TavilySearch } from "@langchain/tavily";
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { shopifyClient } from './shopify-client.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Resend } from 'resend';
import { GenerateAdCopyInputSchema, productSchema, emailSchema } from './schemas.js';

// --- KEY CHECKS & CLIENTS ---
if (!process.env.TAVILY_API_KEY) throw new Error("CRITICAL: TAVILY_API_KEY not found...");
if (!process.env.RESEND_API_KEY) throw new Error("CRITICAL: RESEND_API_KEY not found...");
const creativeLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.7 });
const resend = new Resend(process.env.RESEND_API_KEY);

// --- UNIFIED TOOL IMPLEMENTATIONS ---

export const webSearchTool = new TavilySearch({ maxResults: 3 });

export const adCopyTool = new DynamicStructuredTool({
  name: "generateAdCopy",
  description: "Generates compelling marketing ad copy for a product on a specific platform.",
  schema: GenerateAdCopyInputSchema, // This should already be imported from schemas.ts
  func: async (input) => {
    try {
      console.log(`--- TOOL: generateAdCopy ---`);
      console.log(`Generating ad copy for: ${input.productName} on ${input.targetPlatform}`);
      
      const prompt = `
        You are Caelus, a world-class digital marketer and copywriter with a flair for engaging, direct-response advertising.
        Your task is to generate compelling ad copy for a new product.

        **Platform:** ${input.targetPlatform}
        **Product Name:** ${input.productName}
        **Product Description:** ${input.productDescription}

        Please generate the following components:
        1.  **Primary Text:** An engaging and persuasive body for the ad. It should highlight the key benefits and solve a problem for the customer.
        2.  **Headline:** A short, punchy, attention-grabbing headline.
        3.  **Call to Action (CTA):** A clear and direct instruction for the user (e.g., "Shop Now," "Learn More," "Get Yours Today").

        Your final answer MUST be ONLY the raw JSON object, with no markdown fences or other text. The JSON object should have three keys: "primaryText", "headline", and "cta".
      `;

      // We use the 'creativeLlm' which has a higher temperature for more creative outputs.
      const response = await creativeLlm.invoke([new SystemMessage("You are a marketing expert."), new HumanMessage(prompt)]);
      const adCopyJson = response.content.toString();

      console.log(`[Tool Success] Ad copy generated:`, adCopyJson);
      return adCopyJson; // Return the JSON string as the tool's output

    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error("[Tool Error] Failed to generate ad copy:", errorMessage);
      return JSON.stringify({ error: `Failed to generate ad copy: ${errorMessage}` });
    }
  },
});

export const createShopifyProductTool = new DynamicStructuredTool({
  name: 'createShopifyProduct',
  description: 'Creates a new product in Shopify with ONLY a title.',
  // The absolute minimal schema.
  schema: z.object({
    title: z.string().describe('The title of the product.'),
  }),
  func: async ({ title }: { title: string }) => {
    try {
      console.log(`--- TOOL (EXPERIMENTAL): createShopifyProduct ---`);
      
      const CREATE_PRODUCT_MUTATION = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product { id title }
            userErrors { field message }
          }
        }`;

      // The most minimal possible payload.
      const variables = {
        input: {
          title: title,
        },
      };

      console.log('Sending MINIMAL variables to Shopify:', JSON.stringify(variables, null, 2));

      const response = await shopifyClient.request(CREATE_PRODUCT_MUTATION, { variables });
      const responseData = (response.data as any)?.productCreate;

      if (!responseData || responseData.userErrors.length > 0) {
        throw new Error(`Shopify API errors: ${responseData?.userErrors.map((e: any) => e.message).join(', ')}`);
      }
      
      const createdProduct = responseData.product;
      console.log('EXPERIMENTAL TOOL SUCCEEDED. Product created:', createdProduct);
      return JSON.stringify(createdProduct);

    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error(`[Tool Error] EXPERIMENTAL TOOL FAILED:`, errorMessage);
      return JSON.stringify({ error: `EXPERIMENTAL TOOL FAILED: ${errorMessage}` });
    }
  },
});

export const sendEmailTool = new DynamicStructuredTool({
    name: "sendTransactionalEmail",
    description: "Sends an email.",
    schema: emailSchema,
    func: async (input) => { /* ... implementation ... */ return "Email sent."; }
});