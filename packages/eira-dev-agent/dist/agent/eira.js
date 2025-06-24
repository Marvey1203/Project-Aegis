import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { getTools } from '../tools/index.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Annotation } from '@langchain/langgraph';
// --- The Agent State remains the same ---
export const AgentStateSchema = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    retries: Annotation({
        value: (x, y) => y,
        default: () => 0,
    }),
});
// --- NEW: A dedicated function for the cheap "Worker" brain ---
export function getWorkerAgent() {
    const llm = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash', // Using the fast and cheap model
        temperature: 0,
        // No safety settings needed for simple routing
    });
    const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('messages'),
    ]);
    const tools = getTools();
    return prompt.pipe(llm.bindTools(tools));
}
// --- This is now the expensive "Architect" brain ---
export function getArchitectAgent() {
    const llm = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-pro', // The powerful, state-of-the-art model
        maxOutputTokens: 8192,
        temperature: 0.2, // Slightly more creative for planning
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        verbose: true,
    });
    const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('messages'),
    ]);
    const tools = getTools();
    return prompt.pipe(llm.bindTools(tools));
}
