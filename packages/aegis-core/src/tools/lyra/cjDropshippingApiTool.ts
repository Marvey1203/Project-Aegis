// packages/aegis-core/src/tools/lyra/cjDropshippingApiTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

// --- AUTHENTICATION LOGIC (Unchanged) ---
let accessToken: string | null = null;
let tokenExpiry: Date | null = null;
async function getAccessToken(): Promise<string> {
    // ... (This function is correct and does not need to be changed)
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) return accessToken;
    console.log('Fetching new CJ Dropshipping access token...');
    const email = process.env.CJ_EMAIL;
    const apiKey = process.env.CJ_API_KEY;
    if (!email || !apiKey) throw new Error('CJ_EMAIL and CJ_API_KEY must be set in the .env file.');
    try {
        const response = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', { email, password: apiKey });
        const newAccessToken = response.data?.data?.accessToken;
        if (typeof newAccessToken === 'string' && newAccessToken) {
            accessToken = newAccessToken;
            tokenExpiry = new Date(new Date().getTime() + 23 * 60 * 60 * 1000);
            console.log('Successfully fetched new CJ Dropshipping access token.');
            return accessToken;
        } else { throw new Error(`Failed to retrieve a valid access token. Response: ${JSON.stringify(response.data)}`); }
    } catch (error: any) {
        console.error('Error fetching CJ Dropshipping access token:', error.response?.data || error.message);
        throw new Error('Could not authenticate with CJ Dropshipping API.');
    }
}


// --- CJ DROPSHIPPING API TOOL (Product Search) ---
const cjApiSchema = z.object({
  input: z.string().optional(),
  pageSize: z.number().optional().default(10),
}).transform(val => JSON.stringify({ input: val?.input ?? '', pageSize: val?.pageSize ?? 10 }));

class CJDropshippingApiTool extends Tool {
  name = 'cjDropshippingApiTool';
  description = 'Searches for products on CJ Dropshipping. Returns a JSON string of the product list.';
  schema = cjApiSchema;

  protected async _call(arg: string): Promise<string> {
    let input: string = '';
    let pageSize: number = 10;
    try {
      const parsed = JSON.parse(arg);
      input = parsed.input ?? '';
      pageSize = parsed.pageSize ?? 10;
    } catch {}
    if (!input) { return 'Error: Input query must be provided.'; }
    try {
        const token = await getAccessToken();
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
            headers: { 'CJ-Access-Token': token },
            params: { productName: input, pageSize },
        });
        if (response.data?.result === false) {
            return `Error from CJ API: ${response.data.message || 'Unknown error'}`;
        }
        if (response.data?.data?.list) {
            const products = response.data.data.list;
            if (products.length === 0) return `No products found for query: '${input}'`;
            
            const formattedProducts = products.map((p: any) => ({
                productName: p.productNameEn,
                description: p.productDesc || `High-quality ${p.productNameEn}`,
                productSku: p.productSku,
                price: p.sellPrice || '0.00',
                imageUrl: p.productImage,
                vendor: 'CJ Dropshipping',
                productType: p.categoryName || 'General',
            }));
            return JSON.stringify(formattedProducts, null, 2);
        } else {
            return `Error: Could not parse product list from CJ API. Raw response: ${JSON.stringify(response.data)}`;
        }
    } catch (error: any) {
        console.error(`Error searching CJ products for '${input}':`, error.response?.data || error.message);
        return `Error: An unexpected error occurred while searching for products.`;
    }
  }
}
export const cjDropshippingApiTool = new CJDropshippingApiTool();


// --- CJ CREATE ORDER TOOL ---
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


// --- CJ GET ORDER STATUS TOOL ---
class CjGetOrderStatusTool extends Tool {
  name = 'cjGetOrderStatusTool';
  description = 'Retrieves the status of a specific order from CJ Dropshipping using the CJ order number. Input should be the CJ order number.';

  schema = z.object({
    input: z.string().optional(),
  }).transform(val => val?.input ?? '');

  protected async _call(orderId: string): Promise<string> {
    if (!orderId) {
      return 'Error: CJ Order ID must be provided.';
    }

    try {
      const token = await getAccessToken();
      const url = 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail';

      const response = await axios.get(url, {
        headers: { 'CJ-Access-Token': token, },
        params: { orderId: orderId, },
      });

      if (response.data && response.data.result === true && response.data.data) {
        const orderDetail = response.data.data;
        const statusMap: { [key: string]: string } = {
          '1': 'AWAITING_PAYMENT', '2': 'PENDING', '3': 'PROCESSING',
          '4': 'DISPATCHED', '5': 'COMPLETED', '6': 'CANCELLED', '7': 'CLOSED',
        };
        const orderStatus = statusMap[orderDetail.orderStatus] || `UNKNOWN_STATUS_${orderDetail.orderStatus}`;
        return `Status for CJ Order ${orderId}: ${orderStatus}. Tracking number: ${orderDetail.trackingNumber || 'Not yet available'}.`;
      } else {
        return `Failed to get order status from CJ API. Response: ${JSON.stringify(response.data)}`;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) { return `Error getting CJ order status: ${JSON.stringify(error.response?.data)}`; }
      return `An unexpected error occurred: ${error.message}`;
    }
  }
}
export const cjGetOrderStatusTool = new CjGetOrderStatusTool();