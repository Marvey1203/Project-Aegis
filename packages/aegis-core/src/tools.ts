// packages/aegis-core/src/tools.ts

import { TavilySearch } from "@langchain/tavily";

import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Resend } from 'resend'; // <-- Import Resend

import { GenerateAdCopyInputSchema, productSchema, emailSchema } from './schemas.js';
import { shopifyClient } from "./shopify-client.js";


// Key checks
if (!process.env.TAVILY_API_KEY) throw new Error("CRITICAL: TAVILY_API_KEY not found...");
if (!process.env.RESEND_API_KEY) throw new Error("CRITICAL: RESEND_API_KEY not found...");

// --- CLIENT INITIALIZATIONS ---
const creativeLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.7 });
const resend = new Resend(process.env.RESEND_API_KEY);

// --- TOOL IMPLEMENTATIONS ---

export function createWebSearchTool() {
  return new TavilySearch({ maxResults: 3 });
}

export async function generateAdCopy(input: z.infer<typeof GenerateAdCopyInputSchema>): Promise<string> {
  // Your existing, excellent implementation for Caelus's tool
  console.log(`--- TOOL: generateAdCopy ---`);
  // ... your implementation remains here ...
  return `Ad copy for ${input.productName}`; // Placeholder for brevity
}

// in packages/aegis-core/src/tools.ts

// Find the createShopifyProduct function
export async function createShopifyProduct(input: z.infer<typeof productSchema>): Promise<object> {
  console.log(`--- TOOL: createShopifyProduct ---`);
  console.log(`Calling Shopify to create product: ${input.title}`);
  
  const PRODUCT_CREATE_MUTATION = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
          onlineStoreUrl
          descriptionHtml
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response: any = await shopifyClient.request(PRODUCT_CREATE_MUTATION, {
      variables: {
        input: {
          title: input.title,
          descriptionHtml: input.description,
          status: "ACTIVE",
          // THIS IS THE CRITICAL FIX for the $0.00 price issue.
          variants: [{ price: input.price.toString() }],
        },
      },
    });

    if (response.data.productCreate.userErrors.length > 0) {
      const errorMessages = response.data.productCreate.userErrors.map((e: any) => e.message).join(", ");
      console.error(`[Tool Error] Shopify userErrors: ${errorMessages}`);
      return { error: `Shopify API Error: ${errorMessages}` };
    }

    const createdProduct = response.data.productCreate.product;
    const result = {
      productId: createdProduct.id,
      productUrl: createdProduct.onlineStoreUrl,
      title: createdProduct.title,
      description: createdProduct.descriptionHtml,
    };
    console.log(`[Tool Success] Outputting structured product data:`, result);
    return result;

  } catch (error) {
    console.error("[Tool Error] Failed to create product in Shopify:", error);
    return { error: `Failed to create product in Shopify: ${(error as Error).message}` };
  }
}


/**
 * Sends an email using the Resend API. This is Corvus's tool.
 */
export async function sendTransactionalEmail(input: z.infer<typeof emailSchema>): Promise<string> {
  console.log(`--- TOOL: sendTransactionalEmail ---`);
  console.log(`Calling Resend to send email to: ${input.to}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Aegis Systems <notifications@your-verified-domain.com>', // IMPORTANT: REPLACE THIS
      to: [input.to],
      subject: input.subject,
      html: input.htmlBody,
    });

    if (error) {
      console.error("[Tool Error] Resend API error:", error);
      return `Resend API Error: ${error.message}`;
    }

    const result = `Successfully sent email. Message ID: ${data?.id}`;
    console.log(`[Tool Success] ${result}`);
    return result;

  } catch (error) {
    console.error("[Tool Error] Failed to send email via Resend:", error);
    if (error instanceof Error) {
        return `Failed to send email via Resend: ${error.message}`;
    }
    return "An unknown error occurred while sending an email via Resend.";
  }
}