// packages/aegis-core/src/operational_tools.ts

import { z } from 'zod';
import { ProcessOrderInputSchema } from './schemas.js';
import { SendShippingConfirmationEmailInputSchema } from './schemas.js';


/**
 * A MOCK tool for Fornax to process an order.
 * In a real system, this would call the Shopify and supplier APIs.
 * For now, it simulates the process and returns a fake order confirmation.
 */
export async function processOrder(
  input: z.infer<typeof ProcessOrderInputSchema>
): Promise<string> { // <--- CHANGE: Return a string instead of an object
  console.log(`--- MOCK TOOL: processOrder ---`);
  console.log(`Processing order for ${input.quantity}x ${input.productName} for ${input.customerName}.`);

  // Simulate API call latency
  await new Promise(res => setTimeout(res, 1000));

  // Simulate a successful API call
  const fakeOrderId = `order_${Math.random().toString(36).substring(2, 9)}`;
  const fakeTrackingNumber = `1Z${Math.random().toString().substring(2, 18).toUpperCase()}`;
  
  console.log(`  > Shopify Order ID: ${fakeOrderId}`);
  console.log(`  > Supplier Tracking #: ${fakeTrackingNumber}`);

 
  const result = {
    success: true,
    orderId: fakeOrderId,
    trackingNumber: fakeTrackingNumber,
  };
  
  return JSON.stringify(result); // <--- CHANGE: Stringify the result
}

/**
 * A MOCK tool for Corvus to send a shipping confirmation email.
 * In a real system, this would use an email service API like SendGrid or Postmark.
 */
export async function sendShippingConfirmationEmail(
  input: z.infer<typeof SendShippingConfirmationEmailInputSchema>
): Promise<string> {
  console.log(`--- MOCK TOOL: sendShippingConfirmationEmail ---`);
  console.log(`Sending shipping confirmation for order ${input.orderId} to ${input.customerEmail}.`);

  // Simulate API call latency
  await new Promise(res => setTimeout(res, 500));
  
  const emailBody = `
    Subject: Your Order #${input.orderId} has shipped!

    Hello ${input.customerName},

    Great news! Your order has been shipped and is on its way to you.

    You can track your package here:
    Tracking Number: ${input.trackingNumber}

    Thank you for your business!
    - The Aegis Team
  `;

  console.log("  > Email Body Sent:");
  console.log(emailBody);

  return "Confirmation email sent successfully.";
}