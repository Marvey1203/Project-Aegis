// packages/aegis-core/src/shopify-client.ts

import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

// This file relies on environment variables loaded by tools.ts
if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
  throw new Error('CRITICAL: Shopify environment variables are not set. Ensure they are in the root .env file.');
}

const shopify = shopifyApi({
  apiVersion: LATEST_API_VERSION,
  apiSecretKey: 'aegis-secret', // Not used for private apps, but required by the library
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  isCustomStoreApp: true,
  isEmbeddedApp: false, // Add this line to satisfy the required property
  hostName: process.env.SHOPIFY_STORE_DOMAIN.replace(/https?:\/\//, ''),
});

const session = new Session({
  id: 'aegis-graphql-session',
  shop: process.env.SHOPIFY_STORE_DOMAIN,
  state: 'aegis-state',
  isOnline: false,
  accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
});

export const shopifyClient = new shopify.clients.Graphql({ session });