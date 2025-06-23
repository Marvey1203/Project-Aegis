// packages/aegis-core/src/tools/lyra/googleTrendsAnalysisTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { trends } from 'google-trends-api-client';
// Helper function to create a delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class GoogleTrendsAnalysisTool extends Tool {
    name = 'googleTrendsAnalysisTool';
    description = 'Analyzes the Google search trend for a given keyword over the last 12 months to determine if demand is stable, rising, or declining. Input should be a single product category or keyword.';
    schema = z.object({
        input: z.string().optional().describe("The keyword or product category to analyze."),
    }).transform(val => val.input);
    async _call(keyword) {
        if (!keyword) {
            return 'Error: Keyword must be provided.';
        }
        // FIX: Implement a retry loop with exponential backoff for rate limiting.
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const params = {
                    keywords: [keyword],
                    timeframe: 'today 12-m',
                };
                const interestOverTime = await trends.getInterestOverTime(params);
                const timelineData = interestOverTime[keyword]?.timeline;
                if (!timelineData || timelineData.length < 2) {
                    return `TREND_UNAVAILABLE: Not enough data to analyze for the keyword '${keyword}'.`;
                }
                const midPoint = Math.floor(timelineData.length / 2);
                const firstHalf = timelineData.slice(0, midPoint);
                const secondHalf = timelineData.slice(midPoint);
                const avgFirstHalf = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
                const avgSecondHalf = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;
                if (avgSecondHalf > avgFirstHalf * 1.15)
                    return 'RISING';
                if (avgSecondHalf < avgFirstHalf * 0.85)
                    return 'DECLINING';
                return 'STABLE';
            }
            catch (error) {
                // Check if the error is a rate limit error (HTTP 429)
                if (error.response?.statusCode === 429 && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                    console.warn(`Google Trends rate limited. Retrying in ${delay / 1000}s...`);
                    await sleep(delay);
                }
                else {
                    // If it's not a rate limit error or the last retry, fail permanently.
                    console.error(`Google Trends API call failed for '${keyword}':`, error);
                    return `Error: The Google Trends API call failed. The service may be temporarily unavailable or the keyword is invalid. Please try a different keyword.`;
                }
            }
        }
        // This part is reached if all retries fail.
        return `Error: The Google Trends API call failed after ${maxRetries} attempts due to persistent rate limiting.`;
    }
}
export const googleTrendsAnalysisTool = new GoogleTrendsAnalysisTool();
//# sourceMappingURL=googleTrendsAnalysisTool.js.map