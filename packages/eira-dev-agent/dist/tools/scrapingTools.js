"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedScrapeTool = exports.basicPuppeteerScrapeTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const puppeteer_1 = __importDefault(require("puppeteer"));
const basicToolInputSchema = zod_1.z.object({
    url: zod_1.z.string().describe("The URL of the web page to scrape."),
    waitForSelector: zod_1.z.string().optional().describe("An optional CSS selector to wait for on the page before attempting to extract content. Useful for pages that load content dynamically."),
    targetSelector: zod_1.z.string().optional().describe("An optional CSS selector for a specific element from which to extract text content. If not provided, the text content of the entire body will be returned."),
    timeout: zod_1.z.number().optional().default(30000).describe("Optional timeout in milliseconds for page navigation and waiting for selectors. Defaults to 30 seconds.")
});
async function basicScrapePage(args) {
    let browser = null;
    try {
        console.log(`Launching Puppeteer for URL: ${args.url}`);
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            }
            else {
                req.continue();
            }
        });
        console.log(`Navigating to ${args.url}`);
        await page.goto(args.url, { waitUntil: 'networkidle2', timeout: args.timeout });
        if (args.waitForSelector) {
            console.log(`Waiting for selector: ${args.waitForSelector}`);
            await page.waitForSelector(args.waitForSelector, { timeout: args.timeout });
        }
        let extractedText = null;
        if (args.targetSelector) {
            console.log(`Attempting to extract text from target selector: ${args.targetSelector}`);
            extractedText = await page.$eval(args.targetSelector, (el) => el.textContent?.trim() || '');
            if (extractedText === null || extractedText.trim() === '') {
                console.warn(`Target selector '${args.targetSelector}' not found or had no text content. Falling back to body.`);
                extractedText = await page.evaluate(() => document.body.innerText);
            }
        }
        else {
            console.log('Extracting text from document body.');
            extractedText = await page.evaluate(() => document.body.innerText);
        }
        const cleanedText = extractedText?.replace(/\s\s+/g, ' ').trim() || '';
        console.log(`Extracted and cleaned text (length: ${cleanedText.length}).`);
        return JSON.stringify({
            success: true,
            url: args.url,
            extractedText: cleanedText,
            message: "Content extracted successfully.",
        });
    }
    catch (error) {
        console.error(`Error in basicPuppeteerScrapeTool for URL ${args.url}:`, error);
        return JSON.stringify({
            success: false,
            url: args.url,
            error: error.message || "An unknown error occurred during scraping.",
            message: "Failed to extract content.",
        });
    }
    finally {
        if (browser) {
            console.log('Closing Puppeteer browser.');
            await browser.close();
        }
    }
}
exports.basicPuppeteerScrapeTool = new tools_1.DynamicStructuredTool({
    name: "basicPuppeteerScrapeTool",
    description: "Fetches a web page using Puppeteer (allowing JavaScript rendering) and extracts either the full page text content or the text content of a specific element after an optional wait condition. Useful for basic scraping of dynamically rendered content.",
    schema: basicToolInputSchema,
    func: basicScrapePage,
});
// Advanced Puppeteer Scrape Tool
const advancedToolInputSchema = zod_1.z.object({
    url: zod_1.z.string().describe("The initial URL to navigate to."),
    actions: zod_1.z.array(zod_1.z.object({
        actionType: zod_1.z.enum(['click', 'type', 'waitForSelector', 'waitForTimeout', 'selectOption', 'scrollToElement', 'focus']),
        selector: zod_1.z.string().optional().describe("CSS selector for the element to interact with (required for click, type, selectOption, scrollToElement, focus, and optionally for waitForSelector)."),
        textToType: zod_1.z.string().optional().describe("Text to type into an input field (required for 'type' action)."),
        valueToSelect: zod_1.z.string().optional().describe("The value of the option to select in a <select> element (required for 'selectOption' action)."),
        timeout: zod_1.z.number().optional().describe("Timeout in milliseconds for 'waitForSelector' or 'waitForTimeout'.")
    })).optional().describe("An optional array of actions to perform on the page in sequence before extraction."),
    extractions: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().describe("A name for this piece of extracted data."),
        selector: zod_1.z.string().describe("CSS selector for the element(s) to extract data from."),
        extractType: zod_1.z.enum(['text', 'html', 'attribute', 'count', 'list_text', 'list_html', 'list_attribute']).default('text').describe("Type of data to extract: 'text' (textContent), 'html' (innerHTML), 'attribute' (a specific attribute's value), 'count' (number of elements matching selector), 'list_text' (array of textContents), 'list_html' (array of innerHTMLs), 'list_attribute' (array of attribute values)."),
        attributeName: zod_1.z.string().optional().describe("Name of the attribute to extract if extractType is 'attribute' or 'list_attribute' (e.g., 'href', 'src', 'data-id').")
    })).describe("An array defining what data to extract after all actions are performed."),
    globalTimeout: zod_1.z.number().optional().default(60000).describe("Global timeout in milliseconds for the entire scraping operation. Defaults to 60 seconds.")
});
async function advancedScrapePage(args) {
    let browser = null;
    const operationTimeout = args.globalTimeout || 60000;
    const startTime = Date.now();
    const checkTimeout = () => {
        if (Date.now() - startTime > operationTimeout) {
            throw new Error(`Global operation timeout of ${operationTimeout}ms exceeded.`);
        }
    };
    try {
        console.log(`Launching Puppeteer for advanced scrape of URL: ${args.url}`);
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            }
            else {
                req.continue();
            }
        });
        console.log(`Navigating to ${args.url}`);
        await page.goto(args.url, { waitUntil: 'networkidle2', timeout: operationTimeout });
        checkTimeout();
        if (args.actions) {
            for (const action of args.actions) {
                checkTimeout();
                console.log(`Performing action: ${action.actionType}` + (action.selector ? ` on selector ${action.selector}` : ''));
                try {
                    switch (action.actionType) {
                        case 'click':
                            if (!action.selector)
                                throw new Error("Selector is required for click action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            await page.click(action.selector);
                            break;
                        case 'type':
                            if (!action.selector || typeof action.textToType !== 'string')
                                throw new Error("Selector and textToType are required for type action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            await page.type(action.selector, action.textToType);
                            break;
                        case 'waitForSelector':
                            if (!action.selector)
                                throw new Error("Selector is required for waitForSelector action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            break;
                        case 'waitForTimeout':
                            await new Promise(r => setTimeout(r, action.timeout || 1000)); // Default to 1s if no timeout specified for this action
                            break;
                        case 'selectOption':
                            if (!action.selector || typeof action.valueToSelect !== 'string')
                                throw new Error("Selector and valueToSelect are required for selectOption action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            await page.select(action.selector, action.valueToSelect);
                            break;
                        case 'scrollToElement':
                            if (!action.selector)
                                throw new Error("Selector is required for scrollToElement action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            await page.$eval(action.selector, el => el.scrollIntoView());
                            break;
                        case 'focus':
                            if (!action.selector)
                                throw new Error("Selector is required for focus action.");
                            await page.waitForSelector(action.selector, { timeout: action.timeout || operationTimeout - (Date.now() - startTime) });
                            await page.focus(action.selector);
                            break;
                        default:
                            console.warn(`Unknown action type: ${action.actionType}`);
                    }
                }
                catch (actError) {
                    console.error(`Error performing action ${action.actionType} on selector ${action.selector}: ${actError.message}`);
                    // Decide if we should re-throw or just log and continue. For now, re-throw to halt on action error.
                    throw actError;
                }
            }
        }
        const extractedData = {};
        if (args.extractions) {
            for (const ext of args.extractions) {
                checkTimeout();
                console.log(`Performing extraction: ${ext.name} using selector ${ext.selector} and type ${ext.extractType}`);
                try {
                    switch (ext.extractType) {
                        case 'text':
                            extractedData[ext.name] = await page.$eval(ext.selector, el => el.textContent?.trim() || null);
                            break;
                        case 'html':
                            extractedData[ext.name] = await page.$eval(ext.selector, el => el.innerHTML?.trim() || null);
                            break;
                        case 'attribute':
                            if (!ext.attributeName)
                                throw new Error("attributeName is required for extractType 'attribute'.");
                            extractedData[ext.name] = await page.$eval(ext.selector, (el, attr) => el.getAttribute(attr)?.trim() || null, ext.attributeName);
                            break;
                        case 'count':
                            extractedData[ext.name] = await page.$$eval(ext.selector, els => els.length);
                            break;
                        case 'list_text':
                            extractedData[ext.name] = await page.$$eval(ext.selector, els => els.map(el => el.textContent?.trim() || ''));
                            break;
                        case 'list_html':
                            extractedData[ext.name] = await page.$$eval(ext.selector, els => els.map(el => el.innerHTML?.trim() || ''));
                            break;
                        case 'list_attribute':
                            if (!ext.attributeName)
                                throw new Error("attributeName is required for extractType 'list_attribute'.");
                            extractedData[ext.name] = await page.$$eval(ext.selector, (els, attr) => els.map(el => el.getAttribute(attr)?.trim() || ''), ext.attributeName);
                            break;
                        default:
                            console.warn(`Unknown extraction type: ${ext.extractType}`);
                            extractedData[ext.name] = null;
                    }
                }
                catch (extError) {
                    console.warn(`Could not perform extraction '${ext.name}' for selector '${ext.selector}': ${extError.message}. Setting to null.`);
                    extractedData[ext.name] = null;
                }
            }
        }
        console.log("Advanced scrape completed. Extracted data:", extractedData);
        return JSON.stringify({
            success: true,
            url: args.url,
            extractedData: extractedData,
            message: "Advanced scrape completed successfully.",
        });
    }
    catch (error) {
        console.error(`Error in advancedScrapeTool for URL ${args.url}:`, error);
        return JSON.stringify({
            success: false,
            url: args.url,
            error: error.message || "An unknown error occurred during advanced scraping.",
            message: "Failed to perform advanced scrape.",
        });
    }
    finally {
        if (browser) {
            console.log('Closing Puppeteer browser after advanced scrape.');
            await browser.close();
        }
    }
}
exports.advancedScrapeTool = new tools_1.DynamicStructuredTool({
    name: "advancedScrapeTool",
    description: "Performs advanced web scraping tasks using Puppeteer. This includes navigating to a URL, performing a series of actions (like clicks, typing, waiting for elements), and then extracting multiple pieces of data from the page based on specified selectors.",
    schema: advancedToolInputSchema,
    func: advancedScrapePage,
});
