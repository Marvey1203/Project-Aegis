// packages/aegis-core/src/tools/lyra/marketAnalysisTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// This is the structured format we want the tool to return.
const analysisSchema = z.object({
    decision: z.enum(["PROCEED", "HALT"]).describe("The final recommendation based on the analysis."),
    confidenceScore: z.number().min(0).max(1).describe("The confidence in the decision, from 0.0 to 1.0."),
    summary: z.string().describe("A concise summary of the market analysis, trends, and key findings based on the search result snippets."),
});
class MarketAnalysisTool extends Tool {
    name = 'comprehensiveMarketAnalysisTool';
    description = 'Performs a deep-dive market analysis for a product category. It runs multiple targeted searches and returns a synthesized analysis with a clear recommendation.';
    schema = z.object({
        input: z.string().optional().describe("The product category to analyze."),
    }).transform(val => val?.input);
    searchTool = new TavilySearchResults({ maxResults: 5 });
    llm = new ChatGoogleGenerativeAI({ model: 'gemini-2.5-flash' });
    async _call(keyword) {
        if (!keyword) {
            return 'Error: A product category keyword must be provided.';
        }
        console.log(`--- Starting Comprehensive Market Analysis for: ${keyword} ---`);
        try {
            // *** THE FIX: Get the current year dynamically ***
            const currentYear = new Date().getFullYear();
            console.log(`Using current year for analysis: ${currentYear}`);
            // Use the dynamic year in the search query
            const searchQueries = [
                `market size and sales trends for ${keyword} ${currentYear}`,
                `consumer sentiment and reviews for ${keyword}`,
                `top competing brands in the ${keyword} niche`
            ];
            console.log("Running targeted searches...");
            const searchPromises = searchQueries.map(query => this.searchTool.invoke(query));
            const searchResults = await Promise.all(searchPromises);
            const searchSnippets = searchResults.flat().join('\n---\n');
            if (!searchSnippets || searchSnippets.length < 10) {
                return "No relevant search results found. Halting analysis.";
            }
            console.log("Synthesizing search result snippets...");
            const finalAnalysisPrompt = `You are a professional market analyst. Based on the following web search result snippets from the current year (${currentYear}), provide a market analysis for the product category "${keyword}".

        Your analysis must be returned as a single, clean JSON object matching this schema:
        {
          "decision": "'PROCEED' or 'HALT'",
          "confidenceScore": "A number between 0.0 and 1.0",
          "summary": "A concise summary of the market analysis, trends, and key findings."
        }
        
        Analyze the snippets to determine if the market is growing, stable, or declining. Note any key opportunities or risks. Base your 'decision' and 'confidenceScore' entirely on the provided text.
        
        --- SEARCH SNIPPETS ---
        ${searchSnippets}
        --- END OF SNIPPETS ---
        
        Return ONLY the JSON object. JSON ANALYSIS:`;
            const response = await this.llm.invoke(finalAnalysisPrompt);
            const analysisJson = response.content.toString();
            console.log("--- Comprehensive Market Analysis Complete ---");
            return analysisJson;
        }
        catch (error) {
            console.error(`Error during comprehensive market analysis for '${keyword}':`, error);
            return `Error: An unexpected error occurred during market analysis. ${error.message}`;
        }
    }
}
export const marketAnalysisTool = new MarketAnalysisTool();
//# sourceMappingURL=marketAnalysisTool.js.map