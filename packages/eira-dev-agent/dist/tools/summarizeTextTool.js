// packages/eira-dev-agent/src/tools/summarizeTextTool.ts
import { DynamicTool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
const summarizeTextTool = new DynamicTool({
    name: 'summarizeTextTool',
    description: 'Summarizes a long block of text to be more concise and manageable for memory. Use this after reading a large file or receiving a long tool output. The input to this tool should be the raw text to summarize.',
    func: async (textToSummarize) => {
        if (typeof textToSummarize !== 'string' || !textToSummarize.trim()) {
            return 'Error: Input must be a non-empty string.';
        }
        try {
            // Use the fast model for summarization tasks
            const llm = new ChatGoogleGenerativeAI({
                model: 'gemini-1.5-flash',
                temperature: 0,
            });
            const prompt = `You are an expert summarization engine. Your sole purpose is to provide a concise summary of the following text, focusing on the key entities, functions, structures, and overall purpose. Do not add any preamble or conversational text. Respond only with the summary itself.\n\n--- TEXT TO SUMMARIZE ---\n${textToSummarize}\n--- END OF TEXT ---`;
            const response = await llm.invoke([new HumanMessage(prompt)]);
            const summary = response.content.toString();
            if (!summary) {
                return 'Error: Summarization resulted in an empty string.';
            }
            return `Summary of the text: ${summary}`;
        }
        catch (error) {
            console.error('Error during summarization:', error);
            return `Error: Failed to summarize text. Reason: ${error.message}`;
        }
    },
});
export { summarizeTextTool };
