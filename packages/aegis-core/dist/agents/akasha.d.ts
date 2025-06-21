declare const AkashaState: import("@langchain/langgraph").AnnotationRoot<{
    query: import("@langchain/langgraph").LastValue<string>;
    dataToStore: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    retrievalResult: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
}>;
declare const app: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    query: import("@langchain/langgraph").LastValue<string>;
    dataToStore: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    retrievalResult: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
}>, import("@langchain/langgraph").UpdateType<{
    query: import("@langchain/langgraph").LastValue<string>;
    dataToStore: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    retrievalResult: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
}>, "__start__", {
    query: import("@langchain/langgraph").LastValue<string>;
    dataToStore: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    retrievalResult: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
}, {
    query: import("@langchain/langgraph").LastValue<string>;
    dataToStore: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
    retrievalResult: import("@langchain/langgraph").BinaryOperatorAggregate<any, any>;
}, import("@langchain/langgraph").StateDefinition>;
export { app as AkashaAgent, AkashaState };
//# sourceMappingURL=akasha.d.ts.map