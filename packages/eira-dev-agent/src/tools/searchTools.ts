import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

const tavilySearchService = new TavilySearchResults({ maxResults: 5 });

class TavilySearchTool extends Tool {
  name = 'tavilySearchTool';
  description = 'A search engine tool powered by Tavily. Useful for when you need to answer questions about current events, find up-to-date information, or perform general web research. Input should be a clear search query.';

  schema = z.object({
    input: z.string().optional(),
  }).transform((val) => val?.input || '');

  protected async _call(input: string): Promise<string> {
    console.log(`Tavily Search Tool executing with query: '${input}'`);
    try {
      const results = await tavilySearchService.invoke(input);

      // --- NEW, MORE ROBUST HANDLING ---
      // First, log the raw result for debugging purposes.
      console.log('Raw Tavily Result:', results);

      // Check if the result is an array before trying to map it.
      if (Array.isArray(results)) {
        if (results.length === 0) {
          return `No results found for query: '${input}'`;
        }
        // If it's an array, format it as before.
        return results
          .map(
            (result: { title: string; url: string; content: string }) =>
              `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.content}\n---`
          )
          .join('\n\n');
      }

      // If the result is NOT an array, it might be a string (e.g., an error message)
      // or another object. We will handle it safely.
      if (typeof results === 'string') {
        return results;
      }

      // For any other type, stringify it to return the content safely.
      return JSON.stringify(results, null, 2);

    } catch (error: any) {
      return `Error performing search: ${error.message}`;
    }
  }
}

export const tavilySearchTool = new TavilySearchTool();
