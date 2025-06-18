import { BaseMessage } from "@langchain/core/messages";
export declare const graph: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}>, import("@langchain/langgraph").UpdateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}>, "__start__" | "agent" | "tools", {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}, {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}, import("@langchain/langgraph").StateDefinition>;
export declare class EiraAgent {
    private graph;
    static create(): EiraAgent;
    run(userInput: string, chatHistory: BaseMessage[]): Promise<BaseMessage[]>;
    private invoke;
}
