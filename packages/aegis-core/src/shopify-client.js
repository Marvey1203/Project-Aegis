"use strict";
// packages/aegis-core/src/shopify-client.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyClient = void 0;
const shopify_api_1 = require("@shopify/shopify-api");
require("@shopify/shopify-api/adapters/node");
// This file relies on environment variables loaded by tools.ts
if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    throw new Error('CRITICAL: Shopify environment variables are not set. Ensure they are in the root .env file.');
}
const shopify = (0, shopify_api_1.shopifyApi)({
    apiVersion: shopify_api_1.LATEST_API_VERSION,
    apiSecretKey: 'aegis-secret', // Not used for private apps, but required by the library
    adminApiAccessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    isCustomStoreApp: true,
    isEmbeddedApp: false, // Add this line to satisfy the required property
    hostName: process.env.SHOPIFY_STORE_DOMAIN.replace(/https?:\/\//, ''),
});
const session = new shopify_api_1.Session({
    id: 'aegis-graphql-session',
    shop: process.env.SHOPIFY_STORE_DOMAIN,
    state: 'aegis-state',
    isOnline: false,
    accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
});
exports.shopifyClient = new shopify.clients.Graphql({ session });
