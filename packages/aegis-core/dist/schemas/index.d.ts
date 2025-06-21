import { z } from 'zod';
export declare const AddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}, {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}>;
export declare const CustomerSchema: z.ZodObject<{
    id: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zipCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    firstName: string;
    lastName: string;
    createdAt: string;
    phone?: string | undefined;
    billingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
}, {
    email: string;
    id: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    firstName: string;
    lastName: string;
    createdAt: string;
    phone?: string | undefined;
    billingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    } | undefined;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    sku: z.ZodString;
    price: z.ZodNumber;
    inventory: z.ZodNumber;
    optionName: z.ZodString;
    optionValue: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sku: string;
    price: number;
    inventory: number;
    optionName: string;
    optionValue: string;
}, {
    id: string;
    sku: string;
    price: number;
    inventory: number;
    optionName: string;
    optionValue: string;
}>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    vendor: z.ZodString;
    price: z.ZodNumber;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sku: z.ZodString;
        price: z.ZodNumber;
        inventory: z.ZodNumber;
        optionName: z.ZodString;
        optionValue: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        sku: string;
        price: number;
        inventory: number;
        optionName: string;
        optionValue: string;
    }, {
        id: string;
        sku: string;
        price: number;
        inventory: number;
        optionName: string;
        optionValue: string;
    }>, "many">>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    vendor: string;
    description: string;
    createdAt: string;
    price: number;
    tags?: string[] | undefined;
    images?: string[] | undefined;
    variants?: {
        id: string;
        sku: string;
        price: number;
        inventory: number;
        optionName: string;
        optionValue: string;
    }[] | undefined;
}, {
    id: string;
    title: string;
    vendor: string;
    description: string;
    createdAt: string;
    price: number;
    tags?: string[] | undefined;
    images?: string[] | undefined;
    variants?: {
        id: string;
        sku: string;
        price: number;
        inventory: number;
        optionName: string;
        optionValue: string;
    }[] | undefined;
}>;
export declare const LineItemSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    price: number;
    productId: string;
    variantId: string;
}, {
    quantity: number;
    price: number;
    productId: string;
    variantId: string;
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    customerId: z.ZodString;
    lineItems: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        price: number;
        productId: string;
        variantId: string;
    }, {
        quantity: number;
        price: number;
        productId: string;
        variantId: string;
    }>, "many">;
    totalPrice: z.ZodNumber;
    status: z.ZodEnum<["pending", "paid", "fulfilled", "cancelled", "refunded"]>;
    shippingProvider: z.ZodOptional<z.ZodString>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
    createdAt: string;
    customerId: string;
    lineItems: {
        quantity: number;
        price: number;
        productId: string;
        variantId: string;
    }[];
    totalPrice: number;
    shippingProvider?: string | undefined;
    trackingNumber?: string | undefined;
}, {
    id: string;
    status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
    createdAt: string;
    customerId: string;
    lineItems: {
        quantity: number;
        price: number;
        productId: string;
        variantId: string;
    }[];
    totalPrice: number;
    shippingProvider?: string | undefined;
    trackingNumber?: string | undefined;
}>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
//# sourceMappingURL=index.d.ts.map