// packages/aegis-core/src/shopify-client.ts

import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

// Ensure environment variables are loaded
if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
  throw new Error('Shopify environment variables are not set.');
}

const shopify = shopifyApi({
  apiVersion: LATEST_API_VERSION,
  apiSecretKey: 'dummy-secret-key', // Not needed for private apps, but required by the library
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  isCustomStoreApp: true,
  isEmbeddedApp: false, // Add this line to satisfy the required property
  hostName: process.env.SHOPIFY_STORE_DOMAIN,
});

// Create a session object to use for making requests
const session = new Session({
  id: 'aegis-session',
  shop: process.env.SHOPIFY_STORE_DOMAIN,
  state: 'aegis-state',
  isOnline: false,
  accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
});

// Create an authenticated GraphQL client
export const shopifyClient = new shopify.clients.Graphql({ session });