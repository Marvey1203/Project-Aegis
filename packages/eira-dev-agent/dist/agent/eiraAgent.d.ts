import { AgentExecutor } from "langchain/agents";
import { HumanMessage, AIMessage } from '@langchain/core/messages';
export declare class EiraAgent {
    agentExecutor: AgentExecutor;
    private constructor();
    static create(): EiraAgent;
    run(instruction: string, chatHistory: (HumanMessage | AIMessage)[]): Promise<import("@langchain/core/utils/types", { with: { "resolution-mode": "import" } }).ChainValues>;
}
