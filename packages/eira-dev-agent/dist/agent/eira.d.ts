import { BaseMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
export declare const AgentStateSchema: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}>;
export type AgentState = typeof AgentStateSchema.State;
export declare function getAgent(): Runnable;
