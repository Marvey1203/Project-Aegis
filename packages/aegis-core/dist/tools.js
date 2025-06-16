"use strict";
// packages/aegis-core/src/tools.ts (Eira's implementation of Project Aegis, Phase 1.1)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailTool = exports.adCopyTool = exports.updateProductStatusTool = exports.updateVariantPriceTool = exports.attachProductImageTool = exports.createDraftProductTool = exports.webSearchTool = exports.analyzeCompetitorsTool = exports.scrapeWebsiteTool = exports.getSupplierDataTool = void 0;
var tavily_1 = require("@langchain/tavily");
var zod_1 = require("zod");
var tools_1 = require("@langchain/core/tools");
var shopify_client_js_1 = require("./shopify-client.js");
var google_genai_1 = require("@langchain/google-genai");
var messages_1 = require("@langchain/core/messages");
var resend_1 = require("resend");
var schemas_js_1 = require("./schemas.js");
var cj_client_js_1 = require("./cj-client.js");
var axios_1 = require("axios");
var cheerio = require("cheerio");
// --- KEY CHECKS & CLIENTS ---
if (!process.env.TAVILY_API_KEY)
    throw new Error("CRITICAL: TAVILY_API_KEY not found...");
if (!process.env.RESEND_API_KEY)
    throw new Error("CRITICAL: RESEND_API_KEY not found...");
if (!process.env.CJ_TOKEN)
    throw new Error("CRITICAL: CJ_TOKEN for Dropshipping API not found...");
var llm = new google_genai_1.ChatGoogleGenerativeAI({ model: "gemini-1.5-pro-latest" });
var creativeLlm = new google_genai_1.ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.7 });
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
var CJ_API_TOKEN = process.env.CJ_TOKEN;
var CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0';
// ==============================================================================
// --- LYRA'S SPECIALIST TOOLS (Module 1.1) ---
// ==============================================================================
/**
 * A robust tool to search the CJ Dropshipping catalog for products via their official API.
 * This is vastly superior to scraping.
 */
exports.getSupplierDataTool = new tools_1.DynamicStructuredTool({
    name: "getSupplierData",
    description: "Searches the approved supplier (CJ Dropshipping) API for a product and returns a structured list of the top 5 potential products.",
    schema: zod_1.z.object({
        productQuery: zod_1.z.string().describe("The name of the product to search for."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var data, products, error_1, errorMessage;
        var productQuery = _b.productQuery;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: getSupplierData (Client v2) ---");
                    return [4 /*yield*/, cj_client_js_1.CJApiClient.searchProducts(productQuery)];
                case 1:
                    data = _c.sent();
                    if (!data.result || !data.data || !data.data.list) {
                        throw new Error("CJ API returned unexpected data structure. Message: ".concat(data.message));
                    }
                    products = data.data.list.map(function (p) { return ({
                        supplierProductId: p.productId,
                        title: p.productTitle,
                        supplierCost: parseFloat(p.sellPrice),
                        imageUrl: p.productMainImage,
                    }); });
                    console.log("[Tool Success] Found ".concat(products.length, " potential products from supplier API."));
                    return [2 /*return*/, JSON.stringify(products)];
                case 2:
                    error_1 = _c.sent();
                    errorMessage = error_1.message || String(error_1);
                    console.error("[Tool Error] Failed to get supplier data for \"".concat(productQuery, "\":"), errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to get supplier data: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
/**
 * A general-purpose tool to scrape clean text content from a URL.
 * This is used by the analyzeCompetitors tool.
 */
exports.scrapeWebsiteTool = new tools_1.DynamicStructuredTool({
    name: "scrapeWebsite",
    description: "Extracts clean, readable text content from a given URL. Useful for analyzing product pages, articles, or competitor sites.",
    // --- THE DEFINITIVE FIX: REMOVE THE INCOMPATIBLE .url() VALIDATOR ---
    schema: zod_1.z.object({
        url: zod_1.z.string().describe("The valid URL of the webpage to scrape."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var response, $, textContent, error_2, errorMessage;
        var url = _b.url;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: scrapeWebsite ---");
                    console.log("Scraping URL: ".concat(url));
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            }
                        })];
                case 1:
                    response = _c.sent();
                    $ = cheerio.load(response.data);
                    $('script, style, nav, footer, header, svg, noscript').remove();
                    textContent = $('body').text().replace(/\s\s+/g, ' ').trim();
                    if (!textContent) {
                        return [2 /*return*/, JSON.stringify({ error: "Could not extract any text content from ".concat(url, ".") })];
                    }
                    console.log("[Tool Success] Scraped ".concat(textContent.length, " characters from ").concat(url, "."));
                    return [2 /*return*/, textContent.substring(0, 8000)];
                case 2:
                    error_2 = _c.sent();
                    errorMessage = error_2.message || String(error_2);
                    console.error("[Tool Error] Failed to scrape website ".concat(url, ":"), errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to scrape website: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
/**
 * A powerful, multi-step reasoning tool that performs competitive analysis and calculates a retail price.
 */
exports.analyzeCompetitorsTool = new tools_1.DynamicStructuredTool({
    name: "analyzeCompetitorsAndSetPrice",
    description: "Performs web research to find top competitors for a given product, analyzes their positioning, and calculates a recommended retail price based on supplier cost and target profit margin.",
    schema: zod_1.z.object({
        productName: zod_1.z.string().describe("The name of the product to analyze, e.g., 'ergonomic cat brush'"),
        supplierCost: zod_1.z.number().describe("The cost of the product from the supplier."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var prompt_1, response, result, error_3, errorMessage;
        var productName = _b.productName, supplierCost = _b.supplierCost;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: analyzeCompetitorsAndSetPrice ---");
                    console.log("Analyzing competitors for \"".concat(productName, "\" with supplier cost $").concat(supplierCost));
                    prompt_1 = "\n              You are an expert e-commerce market analyst. Your task is to determine a competitive retail price for a new product.\n              Follow these steps precisely:\n\n              1.  **Market Research:** Perform a web search for \"top selling ".concat(productName, "\" to identify the top 3-5 online competitors.\n              2.  **Price Analysis:** For each competitor, identify their selling price. List the competitor and their price.\n              3.  **Market Average:** Calculate the average selling price across all competitors you found.\n              4.  **Cost-Plus Pricing:** Our cost for the product is $").concat(supplierCost, ". Our target profit margin is 35%. Calculate the cost-plus price using the formula: Price = Cost / (1 - Margin).\n              5.  **Strategic Recommendation:** Compare the market average price with our calculated cost-plus price.\n                  *   If the cost-plus price is AT or BELOW the market average, it is a strong price. Recommend this price.\n                  *   If the cost-plus price is ABOVE the market average, we might be too expensive. Recommend a price that is slightly below the market average to be competitive, but explicitly state that this will lower our profit margin.\n                  *   If no competitor prices can be found, rely solely on the cost-plus pricing calculation.\n              6.  **Final Output:** Return ONLY a JSON object with two keys: \"recommendedPrice\" (a number) and \"analysisSummary\" (a string summarizing your findings and reasoning). Do not include markdown fences.\n            ");
                    return [4 /*yield*/, llm.invoke(prompt_1)];
                case 1:
                    response = _c.sent();
                    result = response.content.toString();
                    console.log("[Tool Success] Competitor analysis complete.");
                    return [2 /*return*/, result];
                case 2:
                    error_3 = _c.sent();
                    errorMessage = error_3.message || String(error_3);
                    console.error("[Tool Error] Failed to analyze competitors for \"".concat(productName, "\":"), errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to analyze competitors: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
exports.webSearchTool = new tavily_1.TavilySearch({ maxResults: 3 });
// ==============================================================================
// --- FORNAX'S DEFINITIVE TOOLS (Phase 1 Complete) ---
// ==============================================================================
/**
 * Creates a DRAFT product with title, description, and price in a single atomic transaction.
 * This is the primary tool for creating a new product shell.
 */
exports.createDraftProductTool = new tools_1.DynamicStructuredTool({
    name: 'createDraftShopifyProduct',
    description: 'Creates a new DRAFT product. Returns the new product ID and its default variant ID.',
    schema: zod_1.z.object({
        title: zod_1.z.string().describe("The title of the product."),
        description: zod_1.z.string().describe("The rich text or HTML description for the product."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var CREATE_PRODUCT_MUTATION, variables, response, responseData, product, variantId, error_4, errorMessage;
        var _c, _d, _e, _f;
        var title = _b.title, description = _b.description;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: createDraftShopifyProduct (Corrected) ---");
                    CREATE_PRODUCT_MUTATION = "\n        mutation productCreate($input: ProductInput!) {\n          productCreate(input: $input) {\n            product { \n              id \n              variants(first: 1) { edges { node { id } } }\n            }\n            userErrors { field message }\n          }\n        }";
                    variables = { input: { title: title, descriptionHtml: description, status: 'DRAFT' } };
                    return [4 /*yield*/, shopify_client_js_1.shopifyClient.request(CREATE_PRODUCT_MUTATION, { variables: variables })];
                case 1:
                    response = _g.sent();
                    responseData = (_c = response.data) === null || _c === void 0 ? void 0 : _c.productCreate;
                    if (((_d = responseData === null || responseData === void 0 ? void 0 : responseData.userErrors) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        throw new Error("Shopify API errors: ".concat(responseData.userErrors.map(function (e) { return e.message; }).join(', ')));
                    }
                    product = responseData.product;
                    variantId = (_f = (_e = product.variants.edges[0]) === null || _e === void 0 ? void 0 : _e.node) === null || _f === void 0 ? void 0 : _f.id;
                    if (!variantId)
                        throw new Error('Could not retrieve variant ID for the new product.');
                    return [2 /*return*/, JSON.stringify({ productId: product.id, variantId: variantId })];
                case 2:
                    error_4 = _g.sent();
                    errorMessage = error_4.message || String(error_4);
                    console.error("[Tool Error] createDraftProductTool FAILED:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Tool createDraftProductTool FAILED: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); },
});
/**
 * Attaches a new image to an existing Shopify product from a URL.
 */
exports.attachProductImageTool = new tools_1.DynamicStructuredTool({
    name: "attachProductImage",
    description: "Uploads and attaches a new product image to an existing product using an image URL.",
    // --- FINAL FIX: Removed the incompatible .url() validator ---
    schema: zod_1.z.object({
        productId: zod_1.z.string().describe("The GID of the product to add the image to, e.g., 'gid://shopify/Product/12345'"),
        imageUrl: zod_1.z.string().describe("The public URL of the image to upload."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var CREATE_MEDIA_MUTATION, variables, response, responseData, error_5, errorMessage;
        var _c, _d;
        var productId = _b.productId, imageUrl = _b.imageUrl;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: attachProductImage ---");
                    CREATE_MEDIA_MUTATION = "\n                mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {\n                    productCreateMedia(media: $media, productId: $productId) {\n                        media { id status }\n                        mediaUserErrors { field message }\n                    }\n                }";
                    variables = { productId: productId, media: [{ originalSource: imageUrl, mediaContentType: "IMAGE" }] };
                    return [4 /*yield*/, shopify_client_js_1.shopifyClient.request(CREATE_MEDIA_MUTATION, { variables: variables })];
                case 1:
                    response = _e.sent();
                    responseData = (_c = response.data) === null || _c === void 0 ? void 0 : _c.productCreateMedia;
                    if (((_d = responseData === null || responseData === void 0 ? void 0 : responseData.mediaUserErrors) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        throw new Error("Shopify API errors: ".concat(responseData.mediaUserErrors.map(function (e) { return e.message; }).join(', ')));
                    }
                    console.log('[Tool Success] Media attached successfully:', responseData.media);
                    return [2 /*return*/, JSON.stringify(responseData.media)];
                case 2:
                    error_5 = _e.sent();
                    errorMessage = error_5.message || String(error_5);
                    console.error("[Tool Error] Failed to attach product image:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to attach product image: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); },
});
/**
 * Updates the price of a specific product variant in Shopify.
 */
exports.updateVariantPriceTool = new tools_1.DynamicStructuredTool({
    name: "updateProductVariantPrice",
    description: "Updates the price of a single, specific product variant.",
    schema: zod_1.z.object({
        variantId: zod_1.z.string().describe("The GID of the product variant to update."),
        price: zod_1.z.number().describe("The new price for the product variant."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var UPDATE_VARIANT_MUTATION, variables, response, responseData, error_6, errorMessage;
        var _c, _d;
        var variantId = _b.variantId, price = _b.price;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: updateProductVariantPrice ---");
                    UPDATE_VARIANT_MUTATION = "\n            mutation productVariantUpdate($input: ProductVariantInput!) {\n                productVariantUpdate(input: $input) {\n                    productVariant { id price }\n                    userErrors { field message }\n                }\n            }";
                    variables = { input: { id: variantId, price: price.toString() } };
                    return [4 /*yield*/, shopify_client_js_1.shopifyClient.request(UPDATE_VARIANT_MUTATION, { variables: variables })];
                case 1:
                    response = _e.sent();
                    responseData = (_c = response.data) === null || _c === void 0 ? void 0 : _c.productVariantUpdate;
                    if (((_d = responseData === null || responseData === void 0 ? void 0 : responseData.userErrors) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        throw new Error("Shopify API errors: ".concat(responseData.userErrors.map(function (e) { return e.message; }).join(', ')));
                    }
                    console.log('[Tool Success] Variant price updated successfully.');
                    return [2 /*return*/, JSON.stringify(responseData.productVariant)];
                case 2:
                    error_6 = _e.sent();
                    errorMessage = error_6.message || String(error_6);
                    console.error("[Tool Error] Failed to update variant price:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to update variant price: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
/**
 * Updates a product's status, for example to publish it.
 */
exports.updateProductStatusTool = new tools_1.DynamicStructuredTool({
    name: "updateProductStatus",
    description: "Updates the status of a product (e.g., to 'ACTIVE' to publish it or 'DRAFT' to unpublish).",
    schema: zod_1.z.object({
        productId: zod_1.z.string().describe("The GID of the product to update, e.g., 'gid://shopify/Product/12345'"),
        status: zod_1.z.enum(['ACTIVE', 'DRAFT']).describe("The new status for the product."),
    }),
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var UPDATE_STATUS_MUTATION, variables, response, responseData, error_7, errorMessage;
        var _c, _d;
        var productId = _b.productId, status = _b.status;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: updateProductStatus ---");
                    UPDATE_STATUS_MUTATION = "\n            mutation productUpdate($input: ProductInput!) {\n                productUpdate(input: $input) {\n                    product { id status }\n                    userErrors { field message }\n                }\n            }";
                    variables = { input: { id: productId, status: status } };
                    return [4 /*yield*/, shopify_client_js_1.shopifyClient.request(UPDATE_STATUS_MUTATION, { variables: variables })];
                case 1:
                    response = _e.sent();
                    responseData = (_c = response.data) === null || _c === void 0 ? void 0 : _c.productUpdate;
                    if (((_d = responseData === null || responseData === void 0 ? void 0 : responseData.userErrors) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        throw new Error("Shopify API errors: ".concat(responseData.userErrors.map(function (e) { return e.message; }).join(', ')));
                    }
                    console.log("[Tool Success] Product status updated to ".concat(status, "."));
                    return [2 /*return*/, JSON.stringify(responseData.product)];
                case 2:
                    error_7 = _e.sent();
                    errorMessage = error_7.message || String(error_7);
                    console.error("[Tool Error] Failed to update product status:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to update product status: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
exports.adCopyTool = new tools_1.DynamicStructuredTool({
    name: "generateAdCopy",
    description: "Generates compelling marketing ad copy for a product on a specific platform.",
    schema: schemas_js_1.GenerateAdCopyInputSchema,
    func: function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var prompt_2, response, adCopyJson, error_8, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("--- TOOL: generateAdCopy ---");
                    console.log("Generating ad copy for: ".concat(input.productName, " on ").concat(input.targetPlatform));
                    prompt_2 = "\n        You are Caelus, a world-class digital marketer and copywriter...\n        Your final answer MUST be ONLY the raw JSON object...\n      ";
                    return [4 /*yield*/, creativeLlm.invoke([new messages_1.SystemMessage("You are a marketing expert."), new messages_1.HumanMessage(prompt_2)])];
                case 1:
                    response = _a.sent();
                    adCopyJson = response.content.toString();
                    console.log("[Tool Success] Ad copy generated:", adCopyJson);
                    return [2 /*return*/, adCopyJson];
                case 2:
                    error_8 = _a.sent();
                    errorMessage = error_8.message || String(error_8);
                    console.error("[Tool Error] Failed to generate ad copy:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to generate ad copy: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); },
});
exports.sendEmailTool = new tools_1.DynamicStructuredTool({
    name: "sendTransactionalEmail",
    description: "Sends an email to a recipient.",
    schema: schemas_js_1.emailSchema,
    func: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var from, _c, data, error, error_9, errorMessage;
        var to = _b.to, subject = _b.subject, htmlBody = _b.htmlBody;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    from = process.env.DEFAULT_EMAIL_FROM || "no-reply@example.com";
                    console.log("--- TOOL: sendTransactionalEmail ---");
                    console.log("Attempting to send email from '".concat(from, "' to '").concat(to, "' with subject '").concat(subject, "'"));
                    return [4 /*yield*/, resend.emails.send({
                            from: from,
                            to: to,
                            subject: subject,
                            html: htmlBody,
                        })];
                case 1:
                    _c = _d.sent(), data = _c.data, error = _c.error;
                    if (error) {
                        console.error("[Tool Error] Resend API Error:", error);
                        throw new Error(error.message);
                    }
                    console.log("[Tool Success] Email sent successfully. Message ID: ".concat(data === null || data === void 0 ? void 0 : data.id));
                    return [2 /*return*/, "Email sent successfully to ".concat(to, ". Message ID: ").concat(data === null || data === void 0 ? void 0 : data.id)];
                case 2:
                    error_9 = _d.sent();
                    errorMessage = error_9.message || String(error_9);
                    console.error("[Tool Error] Failed to send transactional email:", errorMessage);
                    return [2 /*return*/, JSON.stringify({ error: "Failed to send email: ".concat(errorMessage) })];
                case 3: return [2 /*return*/];
            }
        });
    }); }
});
