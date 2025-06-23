import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { getTools } from '../tools/index.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Annotation } from '@langchain/langgraph';
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('messages'),
    ]);
    const tools = getTools();
    return prompt.pipe(llm.bindTools(tools));
}
