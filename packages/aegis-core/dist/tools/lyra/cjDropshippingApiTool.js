import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import 'dotenv/config';
// This will hold our access token so we don't have to re-authenticate for every call.
let accessToken = null;
let tokenExpiry = null;
/**
 * A helper function to get a valid access token.
 * It will fetch a new one if the current one is missing or expired.
 */
async function getAccessToken() {
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        console.log('Using cached CJ Dropshipping access token.');
        return accessToken;
    }
    console.log('Fetching new CJ Dropshipping access token...');
    const email = process.env.CJ_EMAIL;
    const password = process.env.CJ_PASSWORD; // Note: The docs mention a 'password' but it's likely the API Key.
    if (!email || !password) {
        throw new Error('CJ_EMAIL and CJ_PASSWORD (API Key) must be set in the .env file.');
    }
    try {
        // This endpoint is a placeholder based on the docs. We may need to adjust it.
        const response = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
            email: email,
            password: password,
        });
        if (response.data && response.data.data.accessToken) {
            accessToken = response.data.data.accessToken;
            // Tokens are valid for 15 days, but we'll refresh more often to be safe.
            tokenExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            console.log('Successfully fetched new CJ Dropshipping access token.');
            if (accessToken === null) {
                throw new Error('Access token is null after successful response.');
            }
            return accessToken;
        }
        else {
            throw new Error('Failed to retrieve access token from CJ API response.');
        }
    }
    catch (error) {
        console.error('Error fetching CJ Dropshipping access token:', error.response?.data || error.message);
        throw new Error('Could not authenticate with CJ Dropshipping API.');
    }
}
class CJDropshippingApiTool extends Tool {
    name = 'cjDropshippingApiTool';
    description = 'Searches for products on CJ Dropshipping using their official API. Input should be a product keyword or search term.';
    // Corrected: The schema now handles an optional input and transforms it to match the base Tool class.
    schema = z.object({
        input: z.string().optional(),
    }).transform(val => val?.input ?? '');
    async _call(query) {
        if (!query) {
            return 'Error: Input query must be provided.';
        }
        try {
            const token = await getAccessToken();
            const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
                headers: {
                    'CJ-Access-Token': token,
                },
                params: {
                    productName: query,
                    pageSize: 5, // Limit to 5 results for now
                },
            });
            if (response.data && response.data.data && response.data.data.list) {
                const products = response.data.data.list;
                if (products.length === 0) {
                    return `No products found on CJ Dropshipping for query: '${query}'`;
                }
                // Format the results into a readable string for the agent
                return products.map((p) => `Product: ${p.productNameEn}\nSKU: ${p.productSku}\nPrice: $${p.sellPrice}\nImage: ${p.productImage}`).join('\n\n---\n\n');
            }
            else {
                return 'Could not parse product list from CJ API response.';
            }
        }
        catch (error) {
            console.error('Error searching products on CJ Dropshipping:', error.response?.data || error.message);
            return `Error searching for products: ${error.message}`;
        }
    }
}
export const cjDropshippingApiTool = new CJDropshippingApiTool();
//# sourceMappingURL=cjDropshippingApiTool.js.map