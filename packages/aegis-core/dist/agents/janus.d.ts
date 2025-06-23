declare const JanusState: import("@langchain/langgraph").AnnotationRoot<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any> | null, Record<string, any> | null>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any>[] | null, Record<string, any>[] | null>;
    response: import("@langchain/langgraph").LastValue<string>;
    proposedAdSpend: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}>;
declare const app: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any> | null, Record<string, any> | null>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any>[] | null, Record<string, any>[] | null>;
    response: import("@langchain/langgraph").LastValue<string>;
    proposedAdSpend: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}>, import("@langchain/langgraph").UpdateType<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any> | null, Record<string, any> | null>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any>[] | null, Record<string, any>[] | null>;
    response: import("@langchain/langgraph").LastValue<string>;
    proposedAdSpend: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}>, "__start__", {
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any> | null, Record<string, any> | null>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any>[] | null, Record<string, any>[] | null>;
    response: import("@langchain/langgraph").LastValue<string>;
    proposedAdSpend: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}, {
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any> | null, Record<string, any> | null>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<Record<string, any>[] | null, Record<string, any>[] | null>;
    response: import("@langchain/langgraph").LastValue<string>;
    proposedAdSpend: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
}, import("@langchain/langgraph").StateDefinition>;
export { app, JanusState };
//# sourceMappingURL=janus.d.ts.map