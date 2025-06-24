import { AgentState } from './eira.js';
import { BaseMessage } from '@langchain/core/messages';
export declare const graph: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    retries: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}>, import("@langchain/langgraph").UpdateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    retries: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}>, "tools" | "__start__" | "architect", {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    retries: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}, {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    retries: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}, import("@langchain/langgraph").StateDefinition>;
export declare class EiraAgent {
    private graph;
    static create(): EiraAgent;
    invoke(state: AgentState): Promise<AgentState>;
}
