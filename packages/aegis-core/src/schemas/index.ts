import { z } from 'zod';

// =================================================================================
// Customer Schema
// Represents a single customer in the database.
// =================================================================================
export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

export const CustomerSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the customer"),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  createdAt: z.string().datetime(),
});

// =================================================================================
// Product Schema
// Represents a product available for sale.
// =================================================================================
export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  price: z.number().positive(),
  inventory: z.number().int().nonnegative(),
  optionName: z.string().describe("e.g., 'Color'"),
  optionValue: z.string().describe("e.g., 'Blue'"),
});

export const ProductSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the product"),
  title: z.string(),
  description: z.string(),
  vendor: z.string(),
  price: z.number().positive().describe("The main price of the product"),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(ProductVariantSchema).optional(),
  createdAt: z.string().datetime(),
});

// =================================================================================
// Order Schema
// Represents a customer's order.
// =================================================================================
export const LineItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive().describe("The price of the item at the time of purchase"),
});

export const OrderSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the order"),
  customerId: z.string().uuid(),
  lineItems: z.array(LineItemSchema),
  totalPrice: z.number().positive(),
  status: z.enum(['pending', 'paid', 'fulfilled', 'cancelled', 'refunded']),
  shippingProvider: z.string().optional(),
  trackingNumber: z.string().optional(),
  createdAt: z.string().datetime(),
});

// =================================================================================
// Inferred Types
// Exporting TypeScript types inferred from the Zod schemas for use in the app.
// =================================================================================
export type Customer = z.infer<typeof CustomerSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
