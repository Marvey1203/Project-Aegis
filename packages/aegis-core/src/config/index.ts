// packages/aegis-core/src/config/index.ts

// REMOVED: import 'dotenv/config'; <<< THIS WAS THE PROBLEM

// Define a type for our configuration for type safety
interface AppConfig {
  shopify: {
    storeDomain: string;
    adminApiAccessToken: string;
    apiVersion: string;
  };
  resend: {
    apiKey: string;
  };
  facebook: {
    accessToken: string;
  };
}

// Read the environment variables and export them as a typed object
export const config: AppConfig = {
  shopify: {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
    adminApiAccessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '',
    apiVersion: '2024-07',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },
  facebook: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
  },
};

// Add a check to ensure all critical variables are loaded
if (!config.shopify.storeDomain || !config.shopify.adminApiAccessToken) {
  // Let's add a log to see what the values are, just in case.
  console.log('SHOPIFY_STORE_DOMAIN value:', process.env.SHOPIFY_STORE_DOMAIN);
  console.log('SHOPIFY_ADMIN_API_ACCESS_TOKEN value:', process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN);
  throw new Error('Missing required Shopify environment variables. Please check your .env file.');
}

if (!config.resend.apiKey) {
  console.warn('Warning: RESEND_API_KEY is not configured. The CommunicationTool will not work.');
}

if (!config.facebook.accessToken) {
  console.warn('Warning: FACEBOOK_ACCESS_TOKEN is not configured. The FacebookAdsTool will not work.');
}