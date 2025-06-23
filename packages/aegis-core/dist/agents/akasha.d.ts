declare const AkashaState: import("@langchain/langgraph").AnnotationRoot<{
    query: import("@langchain/langgraph").LastValue<string>;
    output: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}>;
declare const app: import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    query: import("@langchain/langgraph").LastValue<string>;
    output: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}>, import("@langchain/langgraph").UpdateType<{
    query: import("@langchain/langgraph").LastValue<string>;
    output: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}>, "__start__", {
    query: import("@langchain/langgraph").LastValue<string>;
    output: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}, {
    query: import("@langchain/langgraph").LastValue<string>;
    output: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
}, import("@langchain/langgraph").StateDefinition>;
export { app as AkashaAgent, AkashaState };
//# sourceMappingURL=akasha.d.ts.map