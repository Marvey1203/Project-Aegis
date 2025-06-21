declare const JanusState: import("@langchain/langgraph").AnnotationRoot<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    response: import("@langchain/langgraph").LastValue<string>;
}>;
declare const app: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    response: import("@langchain/langgraph").LastValue<string>;
}>, import("@langchain/langgraph").UpdateType<{
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    response: import("@langchain/langgraph").LastValue<string>;
}>, "__start__", {
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    response: import("@langchain/langgraph").LastValue<string>;
}, {
    input: import("@langchain/langgraph").LastValue<string>;
    plan: import("@langchain/langgraph").BinaryOperatorAggregate<string[], string[]>;
    pastSteps: import("@langchain/langgraph").BinaryOperatorAggregate<[string, string][], [string, string][]>;
    productData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    orderData: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    response: import("@langchain/langgraph").LastValue<string>;
}, import("@langchain/langgraph").StateDefinition>;
export { app, JanusState };
//# sourceMappingURL=janus.d.ts.map