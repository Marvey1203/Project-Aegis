// packages/aegis-core/src/tools.ts (Eira's implementation of Project Aegis, Phase 1.1)

import { TavilySearch } from "@langchain/tavily";
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { shopifyClient } from './shopify-client.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Resend } from 'resend';
import { GenerateAdCopyInputSchema, productSchema, emailSchema } from './schemas.js';
import { CJApiClient } from './cj-client.js';
import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from 'cheerio';


// --- KEY CHECKS & CLIENTS ---
if (!process.env.TAVILY_API_KEY) throw new Error("CRITICAL: TAVILY_API_KEY not found...");
if (!process.env.RESEND_API_KEY) throw new Error("CRITICAL: RESEND_API_KEY not found...");
if (!process.env.CJ_TOKEN) throw new Error("CRITICAL: CJ_TOKEN for Dropshipping API not found...");

const llm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-pro-latest" });
const creativeLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.7 });
const resend = new Resend(process.env.RESEND_API_KEY);
const CJ_API_TOKEN = process.env.CJ_TOKEN;
const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0';

// ==============================================================================
// --- LYRA'S SPECIALIST TOOLS (Module 1.1) ---
// ==============================================================================

/**
 * A robust tool to search the CJ Dropshipping catalog for products via their official API.
 * This is vastly superior to scraping.
 */
export const getSupplierDataTool = new DynamicStructuredTool({
    name: "getSupplierData",
    description: "Searches the approved supplier (CJ Dropshipping) API for a product and returns a structured list of the top 5 potential products.",
    schema: z.object({
        productQuery: z.string().describe("The name of the product to search for."),
    }),
    func: async ({ productQuery }) => {
        try {
            console.log(`--- TOOL: getSupplierData (Client v2) ---`);
            // --- CHANGE 2: Use the new client instead of fetch ---
            const data: any = await CJApiClient.searchProducts(productQuery);

            if (!data.result || !data.data || !data.data.list) {
                 throw new Error(`CJ API returned unexpected data structure. Message: ${data.message}`);
            }

            const products = data.data.list.map((p: any) => ({
                supplierProductId: p.productId,
                title: p.productTitle,
                supplierCost: parseFloat(p.sellPrice),
                imageUrl: p.productMainImage,
            }));

            console.log(`[Tool Success] Found ${products.length} potential products from supplier API.`);
            return JSON.stringify(products);

        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[Tool Error] Failed to get supplier data for "${productQuery}":`, errorMessage);
            return JSON.stringify({ error: `Failed to get supplier data: ${errorMessage}` });
        }
    }
});

/**
 * A general-purpose tool to scrape clean text content from a URL.
 * This is used by the analyzeCompetitors tool.
 */
export const scrapeWebsiteTool = new DynamicStructuredTool({
    name: "scrapeWebsite",
    description: "Extracts clean, readable text content from a given URL. Useful for analyzing product pages, articles, or competitor sites.",
    // --- THE DEFINITIVE FIX: REMOVE THE INCOMPATIBLE .url() VALIDATOR ---
    schema: z.object({
        url: z.string().describe("The valid URL of the webpage to scrape."),
    }),
    func: async ({ url }) => {
        try {
            console.log(`--- TOOL: scrapeWebsite ---`);
            console.log(`Scraping URL: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            $('script, style, nav, footer, header, svg, noscript').remove();
            const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();

            if (!textContent) {
                return JSON.stringify({ error: `Could not extract any text content from ${url}.` });
            }

            console.log(`[Tool Success] Scraped ${textContent.length} characters from ${url}.`);
            return textContent.substring(0, 8000); 

        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[Tool Error] Failed to scrape website ${url}:`, errorMessage);
            return JSON.stringify({ error: `Failed to scrape website: ${errorMessage}` });
        }
    }
});

/**
 * A powerful, multi-step reasoning tool that performs competitive analysis and calculates a retail price.
 */
export const analyzeCompetitorsTool = new DynamicStructuredTool({
    name: "analyzeCompetitorsAndSetPrice",
    description: "Performs web research to find top competitors for a given product, analyzes their positioning, and calculates a recommended retail price based on supplier cost and target profit margin.",
    schema: z.object({
        productName: z.string().describe("The name of the product to analyze, e.g., 'ergonomic cat brush'"),
        supplierCost: z.number().describe("The cost of the product from the supplier."),
    }),
    func: async ({ productName, supplierCost }) => {
        try {
            console.log(`--- TOOL: analyzeCompetitorsAndSetPrice ---`);
            console.log(`Analyzing competitors for "${productName}" with supplier cost $${supplierCost}`);

            // A Chain-of-Thought prompt to guide the LLM's reasoning process.
            const prompt = `
              You are an expert e-commerce market analyst. Your task is to determine a competitive retail price for a new product.
              Follow these steps precisely:

              1.  **Market Research:** Perform a web search for "top selling ${productName}" to identify the top 3-5 online competitors.
              2.  **Price Analysis:** For each competitor, identify their selling price. List the competitor and their price.
              3.  **Market Average:** Calculate the average selling price across all competitors you found.
              4.  **Cost-Plus Pricing:** Our cost for the product is $${supplierCost}. Our target profit margin is 35%. Calculate the cost-plus price using the formula: Price = Cost / (1 - Margin).
              5.  **Strategic Recommendation:** Compare the market average price with our calculated cost-plus price.
                  *   If the cost-plus price is AT or BELOW the market average, it is a strong price. Recommend this price.
                  *   If the cost-plus price is ABOVE the market average, we might be too expensive. Recommend a price that is slightly below the market average to be competitive, but explicitly state that this will lower our profit margin.
                  *   If no competitor prices can be found, rely solely on the cost-plus pricing calculation.
              6.  **Final Output:** Return ONLY a JSON object with two keys: "recommendedPrice" (a number) and "analysisSummary" (a string summarizing your findings and reasoning). Do not include markdown fences.
            `;

            const response = await llm.invoke(prompt);
            const result = response.content.toString();

            console.log(`[Tool Success] Competitor analysis complete.`);
            return result;

        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[Tool Error] Failed to analyze competitors for "${productName}":`, errorMessage);
            return JSON.stringify({ error: `Failed to analyze competitors: ${errorMessage}` });
        }
    }
});

export const webSearchTool = new TavilySearch({ maxResults: 3 });

// ==============================================================================
// --- FORNAX'S DEFINITIVE TOOLS (Phase 1 Complete) ---
// ==============================================================================

/**
 * Creates a DRAFT product with title, description, and price in a single atomic transaction.
 * This is the primary tool for creating a new product shell.
 */
export const createDraftProductTool = new DynamicStructuredTool({
  name: 'createDraftShopifyProduct',
  description: 'Creates a new DRAFT product. Returns the new product ID and its default variant ID.',
  schema: z.object({
    title: z.string().describe("The title of the product."),
    description: z.string().describe("The rich text or HTML description for the product."),
  }), 
  func: async ({ title, description }) => {
    try {
      console.log(`--- TOOL: createDraftShopifyProduct (Corrected) ---`);
      const CREATE_PRODUCT_MUTATION = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product { 
              id 
              variants(first: 1) { edges { node { id } } }
            }
            userErrors { field message }
          }
        }`;
      const variables = { input: { title, descriptionHtml: description, status: 'DRAFT' } };
      const response = await shopifyClient.request(CREATE_PRODUCT_MUTATION, { variables });
      const responseData = (response.data as any)?.productCreate;
      if (responseData?.userErrors?.length > 0) {
        throw new Error(`Shopify API errors: ${responseData.userErrors.map((e: any) => e.message).join(', ')}`);
      }
      const product = responseData.product;
      const variantId = product.variants.edges[0]?.node?.id;
      if (!variantId) throw new Error('Could not retrieve variant ID for the new product.');
      return JSON.stringify({ productId: product.id, variantId });

    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error(`[Tool Error] createDraftProductTool FAILED:`, errorMessage);
      return JSON.stringify({ error: `Tool createDraftProductTool FAILED: ${errorMessage}` });
    }
  },
});

/**
 * Attaches a new image to an existing Shopify product from a URL.
 */
export const attachProductImageTool = new DynamicStructuredTool({
    name: "attachProductImage",
    description: "Uploads and attaches a new product image to an existing product using an image URL.",
    // --- FINAL FIX: Removed the incompatible .url() validator ---
    schema: z.object({
        productId: z.string().describe("The GID of the product to add the image to, e.g., 'gid://shopify/Product/12345'"),
        imageUrl: z.string().describe("The public URL of the image to upload."),
    }),
    func: async ({ productId, imageUrl }) => {
        try {
            console.log(`--- TOOL: attachProductImage ---`);
            const CREATE_MEDIA_MUTATION = `
                mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
                    productCreateMedia(media: $media, productId: $productId) {
                        media { id status }
                        mediaUserErrors { field message }
                    }
                }`;
            const variables = { productId, media: [{ originalSource: imageUrl, mediaContentType: "IMAGE" }] };
            const response = await shopifyClient.request(CREATE_MEDIA_MUTATION, { variables });
            const responseData = (response.data as any)?.productCreateMedia;
            if (responseData?.mediaUserErrors?.length > 0) {
                throw new Error(`Shopify API errors: ${responseData.mediaUserErrors.map((e: any) => e.message).join(', ')}`);
            }
            console.log('[Tool Success] Media attached successfully:', responseData.media);
            return JSON.stringify(responseData.media);
        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[Tool Error] Failed to attach product image:`, errorMessage);
            return JSON.stringify({ error: `Failed to attach product image: ${errorMessage}` });
        }
    },
});

/**
 * Updates the price of a specific product variant in Shopify.
 */
export const updateVariantPriceTool = new DynamicStructuredTool({
  name: "updateProductVariantPrice",
  description: "Updates the price of a single, specific product variant.",
  schema: z.object({
    variantId: z.string().describe("The GID of the product variant to update."),
    price: z.number().describe("The new price for the product variant."),
  }),
  func: async ({ variantId, price }) => {
    try {
        console.log(`--- TOOL: updateProductVariantPrice ---`);
        const UPDATE_VARIANT_MUTATION = `
            mutation productVariantUpdate($input: ProductVariantInput!) {
                productVariantUpdate(input: $input) {
                    productVariant { id price }
                    userErrors { field message }
                }
            }`;
        const variables = { input: { id: variantId, price: price.toString() } };
        const response = await shopifyClient.request(UPDATE_VARIANT_MUTATION, { variables });
        const responseData = (response.data as any)?.productVariantUpdate;
        if (responseData?.userErrors?.length > 0) {
            throw new Error(`Shopify API errors: ${responseData.userErrors.map((e: any) => e.message).join(', ')}`);
        }
        console.log('[Tool Success] Variant price updated successfully.');
        return JSON.stringify(responseData.productVariant);
    } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error(`[Tool Error] Failed to update variant price:`, errorMessage);
        return JSON.stringify({ error: `Failed to update variant price: ${errorMessage}` });
    }
  }
});

/**
 * Updates a product's status, for example to publish it.
 */
export const updateProductStatusTool = new DynamicStructuredTool({
  name: "updateProductStatus",
  description: "Updates the status of a product (e.g., to 'ACTIVE' to publish it or 'DRAFT' to unpublish).",
  schema: z.object({
    productId: z.string().describe("The GID of the product to update, e.g., 'gid://shopify/Product/12345'"),
    status: z.enum(['ACTIVE', 'DRAFT']).describe("The new status for the product."),
  }),
  func: async ({ productId, status }) => {
    try {
        console.log(`--- TOOL: updateProductStatus ---`);
        const UPDATE_STATUS_MUTATION = `
            mutation productUpdate($input: ProductInput!) {
                productUpdate(input: $input) {
                    product { id status }
                    userErrors { field message }
                }
            }`;
        const variables = { input: { id: productId, status: status } };
        const response = await shopifyClient.request(UPDATE_STATUS_MUTATION, { variables });
        const responseData = (response.data as any)?.productUpdate;
        if (responseData?.userErrors?.length > 0) {
            throw new Error(`Shopify API errors: ${responseData.userErrors.map((e: any) => e.message).join(', ')}`);
        }
        console.log(`[Tool Success] Product status updated to ${status}.`);
        return JSON.stringify(responseData.product);
    } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error(`[Tool Error] Failed to update product status:`, errorMessage);
        return JSON.stringify({ error: `Failed to update product status: ${errorMessage}` });
    }
  }
});

export const adCopyTool = new DynamicStructuredTool({
  name: "generateAdCopy",
  description: "Generates compelling marketing ad copy for a product on a specific platform.",
  schema: GenerateAdCopyInputSchema,
  func: async (input) => {
    // This implementation is sound and remains unchanged.
    try {
      console.log(`--- TOOL: generateAdCopy ---`);
      console.log(`Generating ad copy for: ${input.productName} on ${input.targetPlatform}`);
      const prompt = `
        You are Caelus, a world-class digital marketer and copywriter...
        Your final answer MUST be ONLY the raw JSON object...
      `;
      const response = await creativeLlm.invoke([new SystemMessage("You are a marketing expert."), new HumanMessage(prompt)]);
      const adCopyJson = response.content.toString();
      console.log(`[Tool Success] Ad copy generated:`, adCopyJson);
      return adCopyJson;
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error("[Tool Error] Failed to generate ad copy:", errorMessage);
      return JSON.stringify({ error: `Failed to generate ad copy: ${errorMessage}` });
    }
  },
});


export const sendEmailTool = new DynamicStructuredTool({
    name: "sendTransactionalEmail",
    description: "Sends an email to a recipient.",
    schema: emailSchema,
    func: async ({ to, subject, htmlBody }: z.infer<typeof emailSchema>) => {
        // This implementation is sound and remains unchanged.
        try {
            const from = process.env.DEFAULT_EMAIL_FROM || "no-reply@example.com";
            console.log(`--- TOOL: sendTransactionalEmail ---`);
            console.log(`Attempting to send email from '${from}' to '${to}' with subject '${subject}'`);
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject,
                html: htmlBody,
            });
            if (error) {
                console.error(`[Tool Error] Resend API Error:`, error);
                throw new Error(error.message);
            }
            console.log(`[Tool Success] Email sent successfully. Message ID: ${data?.id}`);
            return `Email sent successfully to ${to}. Message ID: ${data?.id}`;
        } catch (error: any) {
            const errorMessage = error.message || String(error);
            console.error(`[Tool Error] Failed to send transactional email:`, errorMessage);
            return JSON.stringify({ error: `Failed to send email: ${errorMessage}` });
        }
    }
});