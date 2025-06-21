import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import 'dotenv/config';

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    console.log('Using cached CJ Dropshipping access token.');
    return accessToken;
  }

  console.log('Fetching new CJ Dropshipping access token...');
  const email = process.env.CJ_EMAIL;
  const password = process.env.CJ_PASSWORD;

  if (!email || !password) {
    throw new Error('CJ_EMAIL and CJ_PASSWORD (API Key) must be set in the .env file.');
  }

  try {
    const response = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: email,
      password: password,
    });

    const newAccessToken = response.data?.data?.accessToken;

    // --- CORRECTED LOGIC ---
    if (typeof newAccessToken === 'string' && newAccessToken) {
      accessToken = newAccessToken;
      tokenExpiry = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);
      console.log('Successfully fetched new CJ Dropshipping access token.');
      return accessToken;
    } else {
      // This path now correctly throws an error instead of returning null.
      throw new Error('Failed to retrieve a valid access token from the CJ API response.');
    }
  } catch (error: any) {
    console.error('Error fetching CJ Dropshipping access token:', error.response?.data || error.message);
    throw new Error('Could not authenticate with CJ Dropshipping API.');
  }
}

// --- The rest of the file (CJDropshippingApiTool and CjCreateOrderTool) remains unchanged ---
class CJDropshippingApiTool extends Tool {
  name = 'cjDropshippingApiTool';
  description = 'Searches for products on CJ Dropshipping using their official API. Input should be a product keyword or search term.';
  schema = z.object({ input: z.string().optional(), }).transform(val => val?.input ?? '');
  protected async _call(query: string): Promise<string> {
    if (!query) { return 'Error: Input query must be provided.'; }
    try {
      const token = await getAccessToken();
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: { 'CJ-Access-Token': token, },
        params: { productName: query, pageSize: 5, },
      });
      if (response.data && response.data.data && response.data.data.list) {
        const products = response.data.data.list;
        if (products.length === 0) { return `No products found on CJ Dropshipping for query: '${query}'`; }
        return products.map((p: any) => `Product: ${p.productNameEn}\nSKU: ${p.productSku}\nPrice: $${p.sellPrice}\nImage: ${p.productImage}`).join('\n\n---\n\n');
      } else { return 'Could not parse product list from CJ API response.'; }
    } catch (error: any) {
      console.error('Error searching products on CJ Dropshipping:', error.response?.data || error.message);
      return `Error searching for products: ${error.message}`;
    }
  }
}
export const cjDropshippingApiTool = new CJDropshippingApiTool();

const orderProductSchema = z.object({
  vid: z.string().describe('The variant ID of the product to order.'),
  quantity: z.number().int().positive().describe('The quantity of this variant to order.'),
});
const orderSchema = z.object({
  orderNumber: z.string().describe('A unique identifier for the order from our system.'),
  shippingCountryCode: z.string().length(2).describe('The two-letter country code (e.g., US).'),
  shippingProvince: z.string().describe('The state or province.'),
  shippingCity: z.string().describe('The city.'),
  shippingAddress: z.string().describe('The street address.'),
  shippingCustomerName: z.string().describe('The full name of the customer.'),
  shippingZip: z.string().describe('The postal code.'),
  shippingPhone: z.string().describe('The customer\'s phone number.'),
  logisticName: z.string().describe('The desired shipping method (e.g., "CJPacket Ordinary").'),
  products: z.array(orderProductSchema),
});
class CjCreateOrderTool extends Tool {
  name = 'cjCreateOrderTool';
  description = 'Creates a dropshipping order on CJ Dropshipping. The input must be a JSON string containing all required order details.';
  schema = z.object({ input: z.string().optional(), }).transform(val => val?.input ?? '');
  protected async _call(input: string): Promise<string> {
    if (!input) { return 'Error: Input JSON string for the order must be provided.'; }
    try {
      const orderData = JSON.parse(input);
      const validatedData = orderSchema.parse(orderData);
      const token = await getAccessToken();
      const url = 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2';
      const response = await axios.post(url, validatedData, {
        headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json', },
      });
      if (response.data && response.data.result === true) {
        return `Successfully created CJ Dropshipping order. CJ Order ID: ${response.data.data.orderId}`;
      } else {
        return `Failed to create CJ Dropshipping order. API Response: ${JSON.stringify(response.data)}`;
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) { return `Error: Invalid order data format. ${error.message}`; }
      if (axios.isAxiosError(error)) { return `Error creating CJ order: ${JSON.stringify(error.response?.data)}`; }
      return `An unexpected error occurred: ${error.message}`;
    }
  }
}
export const cjCreateOrderTool = new CjCreateOrderTool();
