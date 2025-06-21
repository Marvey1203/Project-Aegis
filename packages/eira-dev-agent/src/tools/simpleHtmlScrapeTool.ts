// packages/eira-dev-agent/src/tools/simpleHtmlScrapeTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

class SimpleHtmlScrapeTool extends Tool {
  name = 'simpleHtmlScrapeTool';
  description = 'Fetches the raw HTML content of a given URL using a direct HTTP request. Useful for simple pages or when browser-based scraping fails. The input must be a single, valid URL string.';

  // CORRECTED: The .url() validator has been removed.
  // The schema now defines a simple, optional string input.
  schema = z.object({
    input: z.string().optional(),
  }).transform(val => val?.input ?? '');

  protected async _call(url: string): Promise<string> {
    if (!url) {
      return 'Error: URL must be provided as input.';
    }
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        },
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return `Error fetching URL ${url}: ${error.response?.status} ${error.response?.statusText}`;
      }
      return `An unexpected error occurred: ${error.message}`;
    }
  }
}

export const simpleHtmlScrapeTool = new SimpleHtmlScrapeTool();