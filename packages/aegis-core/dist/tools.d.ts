import { TavilySearch } from "@langchain/tavily";
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
/**
 * A robust tool to search the CJ Dropshipping catalog for products via their official API.
 * This is vastly superior to scraping.
 */
export declare const getSupplierDataTool: DynamicStructuredTool<z.ZodObject<{
    productQuery: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productQuery?: string;
}, {
    productQuery?: string;
}>, {
    productQuery?: string;
}, {
    productQuery?: string;
}, string>;
/**
 * A general-purpose tool to scrape clean text content from a URL.
 * This is used by the analyzeCompetitors tool.
 */
export declare const scrapeWebsiteTool: DynamicStructuredTool<z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url?: string;
}, {
    url?: string;
}>, {
    url?: string;
}, {
    url?: string;
}, string>;
/**
 * A powerful, multi-step reasoning tool that performs competitive analysis and calculates a retail price.
 */
export declare const analyzeCompetitorsTool: DynamicStructuredTool<z.ZodObject<{
    productName: z.ZodString;
    supplierCost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productName?: string;
    supplierCost?: number;
}, {
    productName?: string;
    supplierCost?: number;
}>, {
    productName?: string;
    supplierCost?: number;
}, {
    productName?: string;
    supplierCost?: number;
}, string>;
export declare const webSearchTool: TavilySearch;
/**
 * Creates a DRAFT product with title, description, and price in a single atomic transaction.
 * This is the primary tool for creating a new product shell.
 */
export declare const createDraftProductTool: DynamicStructuredTool<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
}, {
    description?: string;
    title?: string;
}>, {
    description?: string;
    title?: string;
}, {
    description?: string;
    title?: string;
}, string>;
/**
 * Attaches a new image to an existing Shopify product from a URL.
 */
export declare const attachProductImageTool: DynamicStructuredTool<z.ZodObject<{
    productId: z.ZodString;
    imageUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productId?: string;
    imageUrl?: string;
}, {
    productId?: string;
    imageUrl?: string;
}>, {
    productId?: string;
    imageUrl?: string;
}, {
    productId?: string;
    imageUrl?: string;
}, string>;
/**
 * Updates the price of a specific product variant in Shopify.
 */
export declare const updateVariantPriceTool: DynamicStructuredTool<z.ZodObject<{
    variantId: z.ZodString;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    price?: number;
    variantId?: string;
}, {
    price?: number;
    variantId?: string;
}>, {
    price?: number;
    variantId?: string;
}, {
    price?: number;
    variantId?: string;
}, string>;
/**
 * Updates a product's status, for example to publish it.
 */
export declare const updateProductStatusTool: DynamicStructuredTool<z.ZodObject<{
    productId: z.ZodString;
    status: z.ZodEnum<["ACTIVE", "DRAFT"]>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "DRAFT";
    productId?: string;
}, {
    status?: "ACTIVE" | "DRAFT";
    productId?: string;
}>, {
    status?: "ACTIVE" | "DRAFT";
    productId?: string;
}, {
    status?: "ACTIVE" | "DRAFT";
    productId?: string;
}, string>;
export declare const adCopyTool: DynamicStructuredTool<z.ZodObject<{
    productName: z.ZodString;
    productDescription: z.ZodString;
    targetPlatform: z.ZodEnum<["Facebook", "Google Ads", "Twitter", "Instagram"]>;
}, "strip", z.ZodTypeAny, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}>, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}, string>;
export declare const sendEmailTool: DynamicStructuredTool<z.ZodObject<{
    to: z.ZodString;
    subject: z.ZodString;
    htmlBody: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}>, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}, string>;
