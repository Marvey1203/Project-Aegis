// src/agent/eira.ts
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { allTools as tools } from '../tools/index.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Annotation } from '@langchain/langgraph';
export const AgentStateSchema = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
});
let agent = null;
/**
 * Create the Eira agent with embedded mid-term memory inside system message.
 * @param midTermMemory The string content of mid-term memory to inject.
 */
export function getAgent(midTermMemory) {
    const llm = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-pro',
        maxOutputTokens: 8192,
        temperature: 0,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        verbose: true,
    });
    // Don't include system message in the prompt template - let the workflow handle it
    const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('messages'),
    ]);
    return prompt.pipe(llm.bindTools(tools));
}
