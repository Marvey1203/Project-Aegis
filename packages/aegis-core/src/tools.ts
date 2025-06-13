// packages/aegis-core/src/tools.ts

// --- Imports ---
import { TavilySearch } from "@langchain/tavily"; // PRESERVED: Your correct import path
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// --- FIXED & NEW IMPORTS ---
import { GenerateAdCopyInputSchema, productSchema } from './schemas.js'; // FIXED: Now imports both schemas
import { shopifyClient } from "./shopify-client.js"; // FIXED: Added '.js' extension

// PRESERVED: Your robust environment variable loading
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_API_KEY) {
    throw new Error("CRITICAL: TAVILY_API_KEY not found...");
}

// PRESERVED: Your Tavily tool factory
export function createWebSearchTool() {
  return new TavilySearch({ maxResults: 3 });
}

// PRESERVED: Your advanced Gemini-powered ad copy tool
const creativeLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash-latest",
  temperature: 0.7,
});

export async function generateAdCopy(input: z.infer<typeof GenerateAdCopyInputSchema>): Promise<string> {
  // Your existing, excellent implementation remains unchanged.
  console.log(`--- TOOL: generateAdCopy ---`);
  console.log(`Generating copy for ${input.productName} on ${input.targetPlatform}`);
  try {
    const systemPrompt = new SystemMessage(`You are an expert copywriter...`);
    const userPrompt = new HumanMessage(`Product Name: ${input.productName}...`);
    const response = await creativeLlm.invoke([systemPrompt, userPrompt]);
    const adCopy = response.content.toString();
    console.log(`Generated Ad Copy: ${adCopy}`);
    return adCopy;
  } catch (error) {
    console.error("Error in generateAdCopy tool:", error);
    return "Error generating ad copy. Please check the logs.";
  }
}

// --- NEW: The Shopify Product Creation Tool ---
/**
 * Creates a new product in the Shopify store.
 * This is a real, production-ready tool for Fornax.
 */
export async function createShopifyProduct(input: z.infer<typeof productSchema>) {
  console.log(`[Tool] Calling Shopify to create product: ${input.title}`);
  
  const PRODUCT_CREATE_MUTATION = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product { id, title, handle, onlineStoreUrl }
        userErrors { field, message }
      }
    }
  `;

  try {
    const response: any = await shopifyClient.request(PRODUCT_CREATE_MUTATION, {
      variables: {
        input: {
          title: input.title,
          bodyHtml: input.description,
          variants: [{ price: input.price.toString() }],
          status: "ACTIVE",
        },
      },
    });

    if (response.data.productCreate.userErrors.length > 0) {
      console.error("[Tool Error] Shopify userErrors:", response.data.productCreate.userErrors);
      throw new Error(`Shopify API Error: ${response.data.productCreate.userErrors[0].message}`);
    }

    const createdProduct = response.data.productCreate.product;
    const result = `Successfully created product in Shopify. Product ID: ${createdProduct.id}. URL: ${createdProduct.onlineStoreUrl}`;
    console.log(`[Tool Success] ${result}`);
    return result;

  } catch (error) {
    console.error("[Tool Error] Failed to create product in Shopify:", error);
    // --- FIXED: Type-safe error handling ---
    if (error instanceof Error) {
        throw new Error(`Failed to create product in Shopify: ${error.message}`);
    }
    throw new Error("An unknown error occurred while creating a product in Shopify.");
  }
}