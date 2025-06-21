import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
const AkashaState = Annotation.Root({
    query: Annotation(),
    dataToStore: Annotation({ reducer: (x, y) => y, default: () => null }),
    retrievalResult: Annotation({ reducer: (x, y) => y, default: () => null }),
});
const storeKnowledgeTool = tool(async ({ key, value }) => {
    console.log(`---AKASHA: Storing knowledge---`);
    console.log(`Key: ${key}`);
    console.log(`Value:`, value);
    return `Successfully stored knowledge under key: ${key}`;
}, {
    name: "storeKnowledge",
    description: "Stores a piece of information in the knowledge base.",
    schema: z.object({
        key: z.string().describe("The unique key to store the information under."),
        value: z.any().describe("The information to store."),
    }),
});
const retrieveKnowledgeTool = tool(async ({ key }) => {
    console.log(`---AKASHA: Retrieving knowledge---`);
    console.log(`Key: ${key}`);
    return `Retrieved knowledge for key: ${key}`;
}, {
    name: "retrieveKnowledge",
    description: "Retrieves a piece of information from the knowledge base.",
    schema: z.object({
        key: z.string().describe("The key of the information to retrieve."),
    }),
});
function determineOperation(state) {
    console.log("---AKASHA: Determining operation---");
    if (state.dataToStore) {
        return "store";
    }
    return "retrieve";
}
async function storeNode(state) {
    const result = await storeKnowledgeTool.invoke({
        key: state.query,
        value: state.dataToStore,
    });
    return { retrievalResult: result };
}
async function retrieveNode(state) {
    const result = await retrieveKnowledgeTool.invoke({ key: state.query });
    return { retrievalResult: result };
}
const workflow = new StateGraph(AkashaState);
workflow.addNode("determineOperation", async (state) => {
    // Wrap determineOperation to return an object for StateGraph compatibility
    const op = determineOperation(state);
    return { operation: op };
});
workflow.addNode("store", storeNode);
workflow.addNode("retrieve", retrieveNode);
workflow.addEdge(START, "determineOperation");
workflow.addConditionalEdges("determineOperation", (state) => determineOperation(state), {
    store: "store",
    retrieve: "retrieve",
});
workflow.addEdge("store", END);
workflow.addEdge("retrieve", END);
const app = workflow.compile();
console.log("Akasha agent graph compiled successfully.");
export { app as AkashaAgent, AkashaState };
//# sourceMappingURL=akasha.js.map