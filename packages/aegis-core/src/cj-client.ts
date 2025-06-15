// packages/aegis-core/src/cj-client.ts
// Eira's implementation of an authentication-aware CJ Dropshipping API client.

import fetch from 'node-fetch';

const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0';

// This simple in-memory cache will store our access token.
// For a production system, a more robust cache like Redis would be better.
let cachedToken: { token: string; expiry: number } | null = null;

/**
 * Fetches a new access token from the CJ Dropshipping API.
 * This should only be called when we don't have a valid cached token.
 * @returns {Promise<string>} The new access token.
 */
async function getNewAccessToken(): Promise<string> {
    console.log("--- CJ API Client: No valid token found. Fetching new access token... ---");
    
    const email = process.env.CJ_EMAIL;
    const password = process.env.CJ_PASSWORD;

    if (!email || !password) {
        throw new Error("CRITICAL: CJ_EMAIL or CJ_PASSWORD not found in environment variables.");
    }

    const response = await fetch(`${CJ_BASE_URL}/v1/authentication/getAccessToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(`CJ Authentication failed with status ${response.status}: ${await response.text()}`);
    }

    const data: any = await response.json();

    if (!data.result || !data.data.accessToken) {
        throw new Error(`CJ Authentication failed: ${data.message || 'No access token in response'}`);
    }

    const token = data.data.accessToken;
    // Cache the token with an expiry time (e.g., 24 hours, in milliseconds)
    cachedToken = {
        token,
        expiry: Date.now() + (24 * 60 * 60 * 1000), 
    };

    console.log("--- CJ API Client: Successfully fetched and cached new access token. ---");
    return token;
}

/**
 * Retrieves the current valid access token, fetching a new one if necessary.
 * @returns {Promise<string>} The valid access token.
 */
async function getValidToken(): Promise<string> {
    if (cachedToken && cachedToken.expiry > Date.now()) {
        console.log("--- CJ API Client: Using cached access token. ---");
        return cachedToken.token;
    }
    return getNewAccessToken();
}

/**
 * The main client object for interacting with the CJ API.
 */
export const CJApiClient = {
    /**
     * Searches for products on CJ Dropshipping.
     * @param {string} productQuery - The search term.
     * @returns {Promise<any>} The list of products from the API.
     */
    searchProducts: async (productQuery: string): Promise<any> => {
        const accessToken = await getValidToken();

        const response = await fetch(`${CJ_BASE_URL}/v1/product/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CJ-Access-Token': accessToken,
            },
            body: JSON.stringify({
                keyword: productQuery,
                pageNum: 1,
                pageSize: 5,
            }),
        });

        if (!response.ok) {
            throw new Error(`CJ product search failed with status ${response.status}: ${await response.text()}`);
        }

        return response.json();
    }
};