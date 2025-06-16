"use strict";
// packages/aegis-core/src/agents.ts
// Refactored by Eira to complete Project Aegis Phase I
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
exports.corvusExecutor = exports.fornaxExecutor = exports.caelusExecutor = exports.lyraExecutor = void 0;
exports.createAgentExecutor = createAgentExecutor;
var agents_1 = require("langchain/agents");
var prompts_1 = require("@langchain/core/prompts");
var google_genai_1 = require("@langchain/google-genai");
// --- CHANGE 1: Import all specialist tools for both Lyra and Fornax ---
var tools_js_1 = require("./tools.js");
// --- LLM Client Instantiation (Unchanged) ---
var proLlm = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro-preview-06-05",
    temperature: 0,
});
var flashLlm = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-preview-05-20",
    temperature: 0,
});
// --- Specialized Toolsets ---
var lyraTools = [
    tools_js_1.webSearchTool,
    tools_js_1.getSupplierDataTool,
    tools_js_1.scrapeWebsiteTool,
    tools_js_1.analyzeCompetitorsTool
];
// --- CHANGE 2: Grant Fornax his full suite of granular tools ---
var fornaxTools = [
    tools_js_1.createDraftProductTool,
    tools_js_1.attachProductImageTool,
    tools_js_1.updateVariantPriceTool,
    tools_js_1.updateProductStatusTool
];
var caelusTools = [tools_js_1.adCopyTool];
var corvusTools = [tools_js_1.sendEmailTool];
// --- Agent Factory (Updated to remove chat_history placeholder) ---
function createAgentExecutor(llm, tools, systemMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, agent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = prompts_1.ChatPromptTemplate.fromMessages([
                        ["system", systemMessage],
                        new prompts_1.MessagesPlaceholder("chat_history"),
                        ["human", "{input}"],
                        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
                    ]);
                    return [4 /*yield*/, (0, agents_1.createToolCallingAgent)({ llm: llm, tools: tools, prompt: prompt })];
                case 1:
                    agent = _a.sent();
                    return [2 /*return*/, new agents_1.AgentExecutor({ agent: agent, tools: tools, verbose: true })];
            }
        });
    });
}
// --- Agent Personas (System Messages) ---
var lyraSystemMessage = "You are Lyra, the lead Merchandising and Product Viability Analyst.\nYour mission is to receive a product concept and produce a definitive \"Product Sourcing & Viability Brief\".\nYou must follow this Standard Operating Procedure (SOP) precisely:\n1.  **Understand the Product:** Use 'webSearchTool' to understand the product.\n2.  **Source Suppliers:** Use 'getSupplierDataTool' to find potential suppliers and select the best one.\n3.  **Determine Retail Price:** Use 'analyzeCompetitorsAndSetPrice' to determine a competitive 'recommendedPrice'.\n4.  **Formulate Final Brief:** Synthesize all information into a single, final JSON object with keys: 'product_title', 'product_description', 'supplierCost', 'recommendedPrice', 'supplierProductId', and 'imageUrl'.\nYour final answer MUST be ONLY the raw JSON object.";
// --- CHANGE 3: Enhance Fornax's persona to a full multi-step SOP ---
var fornaxSystemMessage = "You are Fornax, the lead Shopify Store Operator.\nYour mission is to receive a \"Product Sourcing & Viability Brief\" and publish the product to the store.\nYou must follow this Standard Operating Procedure (SOP) with precision:\n1.  **Acknowledge Brief:** The user input will be a JSON object containing all necessary product data.\n2.  **Create Draft:** Use the 'createDraftShopifyProduct' tool with the 'title' and 'description' from the brief. This will return a 'productId' and a 'variantId'.\n3.  **Set the Price:** Use the 'updateProductVariantPrice' tool. You MUST use the 'variantId' from step 2 and the 'price' from the brief.\n4.  **Attach the Image:** Use the 'attachProductImage' tool. You MUST use the 'productId' from step 2 and the 'imageUrl' from the brief.\n5.  **Publish Product:** Use the 'updateProductStatus' tool. You MUST use the 'productId' from step 2 and set the status to 'ACTIVE'.\n6.  **Confirm Completion:** Once all steps are complete, confirm to the user that the product has been successfully published with all details.";
var caelusSystemMessage = "You are Caelus, the Marketer. Your role is to synthesize product information into creative, persuasive, and high-quality marketing copy.";
var corvusSystemMessage = "You are Corvus, the Concierge. Your role is to handle communications reliably and efficiently.";
// --- Agent Instantiation ---
exports.lyraExecutor = await createAgentExecutor(proLlm, lyraTools, lyraSystemMessage);
exports.caelusExecutor = await createAgentExecutor(proLlm, caelusTools, caelusSystemMessage);
exports.fornaxExecutor = await createAgentExecutor(flashLlm, fornaxTools, fornaxSystemMessage);
exports.corvusExecutor = await createAgentExecutor(flashLlm, corvusTools, corvusSystemMessage);
