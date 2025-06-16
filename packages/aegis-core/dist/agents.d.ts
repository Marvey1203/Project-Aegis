import { AgentExecutor } from "langchain/agents";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
export declare function createAgentExecutor(llm: ChatGoogleGenerativeAI, tools: any[], systemMessage: string): Promise<AgentExecutor>;
export declare const lyraExecutor: AgentExecutor;
export declare const caelusExecutor: AgentExecutor;
export declare const fornaxExecutor: AgentExecutor;
export declare const corvusExecutor: AgentExecutor;
