"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tavilySearchTool = void 0;
const tavily_1 = require("@langchain/tavily");
if (!process.env.TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY environment variable not set. TavilySearchTool may not function as expected.");
}
exports.tavilySearchTool = new tavily_1.TavilySearch({
    name: "tavilySearchTool",
    description: "A search engine tool powered by Tavily. Useful for when you need to answer questions about current events, find up-to-date information, or perform general web research. Input should be a clear search query.",
    maxResults: 3,
});
