import { BaseMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
export declare const AgentStateSchema: import("@langchain/langgraph").AnnotationRoot<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
}>;
export type AgentState = typeof AgentStateSchema.State;
/**
 * Create the Eira agent with embedded mid-term memory inside system message.
 * @param midTermMemory The string content of mid-term memory to inject.
 */
export declare function getAgent(midTermMemory: string): Runnable;
