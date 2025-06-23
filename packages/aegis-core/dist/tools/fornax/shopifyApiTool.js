// packages/aegis-core/src/tools/fornax/shopifyApiTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { config } from '../../config/index.js';
// --- SCHEMA DEFINITIONS ---
// Defines the structure of a single product *inside* the JSON string
const productDataSchema = z.object({
    productName: z.string().describe("The full title of the product."),
    description: z.string().describe("An engaging, HTML-formatted description of the product."),
    price: z.string().describe("The retail price of the product."),
    imageUrl: z.string().url().describe("A public URL for the main product image."),
    vendor: z.string().optional().default('Aegis Commerce'),
    productType: z.string().optional().default('General'),
});
// The schema for the tool itself. It accepts a single 'input' which is a string.
const shopifyToolSchema = z.object({
    input: z.string().describe("A JSON string representing an array of products to be created."),
});
// --- SHOPIFY CREATE PRODUCT TOOL ---
class ShopifyCreateProductTool extends Tool {
    name = 'shopifyCreateProductTool';
    description = 'Creates multiple new products in Shopify from a JSON array string. For each product, you must provide productName, description, price, and imageUrl.';
    schema = z.object({ input: z.string().optional() }).transform(val => val?.input ?? '');
    async _call(input) {
        const { storeDomain, adminApiAccessToken, apiVersion } = config.shopify;
        const url = `https://${storeDomain}/admin/api/${apiVersion}/products.json`;
        const createdProductsLog = [];
        let productsToCreate;
        // 1. Parse the incoming JSON string from the 'input' field.
        try {
            productsToCreate = z.array(productDataSchema).parse(JSON.parse(input));
        }
        catch (e) {
            return `Error: The provided input was not a valid JSON string representing an array of products. ${e.message}`;
        }
        // 2. Loop through each product and create it.
        for (const product of productsToCreate) {
            try {
                const shopifyProductPayload = {
                    product: {
                        title: product.productName,
                        body_html: product.description,
                        vendor: product.vendor,
                        product_type: product.productType,
                        status: 'draft',
                        variants: [{ price: parseFloat(product.price.split(' ')[0]) || 0.00 }],
                        images: [{ src: product.imageUrl }],
                    },
                };
                const response = await axios.post(url, shopifyProductPayload, {
                    headers: { 'X-Shopify-Access-Token': adminApiAccessToken, 'Content-Type': 'application/json' },
                });
                if (response.status === 201 && response.data.product) {
                    createdProductsLog.push(`${response.data.product.title} (ID: ${response.data.product.id})`);
                }
                else {
                    createdProductsLog.push(`Failed to create ${product.productName} with status ${response.status}.`);
                }
            }
            catch (error) {
                let errorMessage = `Failed to create product "${product.productName}".`;
                if (axios.isAxiosError(error)) {
                    errorMessage += ` Details: ${JSON.stringify(error.response?.data)}`;
                }
                else {
                    errorMessage += ` Details: ${error.message}`;
                }
                console.error(errorMessage);
                createdProductsLog.push(errorMessage);
            }
        }
        if (createdProductsLog.length === 0)
            return "No products were created.";
        return `Batch product creation complete. Results:\n\n- ${createdProductsLog.join('\n- ')}`;
    }
}
// --- SHOPIFY GET ORDERS TOOL (Unchanged but included for completeness) ---
class ShopifyGetOrdersTool extends Tool {
    name = 'shopifyGetOrdersTool';
    description = 'Retrieves a list of orders from Shopify. You can filter by status. Input should be a JSON string with an optional "status" key (e.g., \'{"status": "open"}\').';
    schema = z.object({ input: z.string().optional() }).transform(val => val?.input ?? '{}');
    async _call(input) {
        const { storeDomain, adminApiAccessToken, apiVersion } = config.shopify;
        let params = { status: 'any' };
        try {
            const inputJson = JSON.parse(input);
            if (inputJson.status)
                params.status = inputJson.status;
        }
        catch (e) {
            return 'Error: Invalid JSON input for filtering orders.';
        }
        const url = `https://${storeDomain}/admin/api/${apiVersion}/orders.json`;
        try {
            const response = await axios.get(url, {
                headers: { 'X-Shopify-Access-Token': adminApiAccessToken },
                params: params,
            });
            if (response.status === 200) {
                if (response.data.orders.length === 0)
                    return `No orders found with status: '${params.status}'.`;
                const formattedOrders = response.data.orders.map((order) => ({
                    id: order.id, name: order.name, email: order.email,
                    total_price: order.total_price, financial_status: order.financial_status,
                }));
                return JSON.stringify(formattedOrders, null, 2);
            }
            else {
                return `Shopify API returned status ${response.status}: ${JSON.stringify(response.data)}`;
            }
        }
        catch (error) {
            if (axios.isAxiosError(error))
                return `Error getting orders from Shopify: ${JSON.stringify(error.response?.data)}`;
            return `An unexpected error occurred: ${error.message}`;
        }
    }
}
export const shopifyCreateProductTool = new ShopifyCreateProductTool();
export const shopifyGetOrdersTool = new ShopifyGetOrdersTool();
//# sourceMappingURL=shopifyApiTool.js.map