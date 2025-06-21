import 'dotenv/config';
// Read the environment variables and export them as a typed object
export const config = {
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
    throw new Error('Missing required Shopify environment variables. Please check your .env file.');
}
if (!config.resend.apiKey) {
    console.warn('Warning: RESEND_API_KEY is not configured. The CommunicationTool will not work.');
}
if (!config.facebook.accessToken) {
    console.warn('Warning: FACEBOOK_ACCESS_TOKEN is not configured. The FacebookAdsTool will not work.');
}
//# sourceMappingURL=index.js.map