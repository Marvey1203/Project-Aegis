// packages/aegis-core/src/agents/akasha.ts
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { productShortlistTool } from '../tools/akasha/productShortlistTool.js';
// FIX: Rename 'result' to 'output' to match the expected interface for Janus.
const AkashaState = Annotation.Root({
    query: Annotation(),
    output: Annotation({
        reducer: (x, y) => y,
        default: () => "",
    }),
});
const akashaSystemMessage = `You are Akasha, the Librarian agent for Project Aegis.
Your primary function is to manage the swarm's collective knowledge, specifically the 'product shortlist'.
You have one tool: 'productShortlistTool'.
- To save a product, your input must be a JSON string: '{"action": "add", "product": {...}}'.
- To retrieve the list of all products, your input must be a JSON string: '{"action": "get"}'.
You must follow these instructions precisely.`;
const tools = [productShortlistTool];
async function agentNode(state) {
    // We assume the input 'query' is the correctly formatted JSON string.
    const toolResult = await productShortlistTool.invoke({ input: state.query });
    // FIX: Return the result under the 'output' key.
    return { output: toolResult };
}
const workflow = new StateGraph(AkashaState);
workflow.addNode("agent", agentNode);
workflow.addEdge(START, "agent");
workflow.addEdge("agent", END);
const app = workflow.compile();
console.log("Akasha agent graph compiled successfully.");
export { app as AkashaAgent, AkashaState };
//# sourceMappingURL=akasha.js.map