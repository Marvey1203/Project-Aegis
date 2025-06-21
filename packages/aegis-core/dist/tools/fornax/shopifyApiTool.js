import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { config } from '../../config/index.js';
// --- EXISTING TOOL (No changes) ---
const productSchema = z.object({
    title: z.string().describe("The title of the product."),
    body_html: z.string().describe("The description of the product, in HTML format."),
    vendor: z.string().describe("The vendor of the product."),
    product_type: z.string().describe("The type of product."),
    status: z.enum(['active', 'archived', 'draft']).default('draft').describe("The status of the product."),
});
class ShopifyCreateProductTool extends Tool {
    name = 'shopifyCreateProductTool';
    description = 'Creates a new product in Shopify...'; // (description unchanged)
    schema = z.object({ input: z.string().optional(), }).transform(val => val?.input ?? '');
    async _call(input) {
        // ... (implementation unchanged)
        if (!input) {
            return 'Error: Input JSON string must be provided.';
        }
        const { storeDomain, adminApiAccessToken, apiVersion } = config.shopify;
        try {
            const productData = JSON.parse(input);
            const validatedData = productSchema.parse(productData);
            const url = `https://${storeDomain}/admin/api/${apiVersion}/products.json`;
            const response = await axios.post(url, { product: validatedData }, {
                headers: { 'X-Shopify-Access-Token': adminApiAccessToken, 'Content-Type': 'application/json' },
            });
            if (response.status === 201) {
                return `Successfully created product with ID: ${response.data.product.id}`;
            }
            else {
                return `Shopify API returned status ${response.status}: ${JSON.stringify(response.data)}`;
            }
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return `Error: Invalid product data format. ${error.message}`;
            }
            if (axios.isAxiosError(error)) {
                return `Error creating product in Shopify: ${JSON.stringify(error.response?.data)}`;
            }
            return `An unexpected error occurred: ${error.message}`;
        }
    }
}
// --- NEW TOOL ---
class ShopifyGetOrdersTool extends Tool {
    name = 'shopifyGetOrdersTool';
    description = 'Retrieves a list of orders from Shopify. You can filter by status. Input should be a JSON string with an optional "status" key (e.g., \'{"status": "open"}\').';
    schema = z.object({
        input: z.string().optional(),
    }).transform(val => val?.input ?? '{}'); // Default to empty JSON object if no input
    async _call(input) {
        const { storeDomain, adminApiAccessToken, apiVersion } = config.shopify;
        let params = { status: 'any' };
        try {
            const inputJson = JSON.parse(input);
            if (inputJson.status) {
                params.status = inputJson.status;
            }
        }
        catch (e) {
            return 'Error: Invalid JSON input for filtering orders.';
        }
        const url = `https://${storeDomain}/admin/api/${apiVersion}/orders.json`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'X-Shopify-Access-Token': adminApiAccessToken,
                    'Content-Type': 'application/json',
                },
                params: params,
            });
            if (response.status === 200) {
                if (response.data.orders.length === 0) {
                    return `No orders found with status: '${params.status}'.`;
                }
                // Format the response for the agent
                const formattedOrders = response.data.orders.map((order) => ({
                    id: order.id,
                    name: order.name,
                    email: order.email,
                    total_price: order.total_price,
                    financial_status: order.financial_status,
                }));
                return JSON.stringify(formattedOrders, null, 2);
            }
            else {
                return `Shopify API returned status ${response.status}: ${JSON.stringify(response.data)}`;
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return `Error getting orders from Shopify: ${JSON.stringify(error.response?.data)}`;
            }
            return `An unexpected error occurred: ${error.message}`;
        }
    }
}
// Export both tools
export const shopifyCreateProductTool = new ShopifyCreateProductTool();
export const shopifyGetOrdersTool = new ShopifyGetOrdersTool();
//# sourceMappingURL=shopifyApiTool.js.map