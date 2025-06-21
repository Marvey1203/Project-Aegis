import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { caelusExecutor } from "./caelus.js"; // Import the Caelus agent
// Define the state for our Janus agent
const JanusState = Annotation.Root({
    input: Annotation(),
    plan: Annotation({ reducer: (x, y) => y, default: () => [] }),
    pastSteps: Annotation({ reducer: (x, y) => x.concat(y), default: () => [] }),
    productData: Annotation({ reducer: (x, y) => y, default: () => null }),
    orderData: Annotation({ reducer: (x, y) => y, default: () => null }),
    response: Annotation(),
});
// This function now generates a more complete, realistic plan
async function planStep(state) {
    console.log("---JANUS: PLANNING STEP---");
    // Updated dummy plan to include a marketing step
    const plan = [
        `Delegate to Lyra to find products related to: ${state.input}`,
        `Delegate to Fornax to list the found product.`,
        `Delegate to Caelus to create an ad campaign for the new product.`,
        `Delegate to Argent to check for new orders.`,
        `Delegate to Corvus to handle fulfillment and communication.`,
        "Report completion to the user.",
    ];
    return { plan };
}
// This function now delegates to all our specialized agents
async function executeStep(state) {
    console.log("---JANUS: EXECUTING STEP---");
    if (state.plan.length === 0) {
        return { response: "No plan to execute." };
    }
    const currentStep = state.plan[0];
    let result = "";
    console.log("Executing:", currentStep);
    try {
        if (currentStep.toLowerCase().includes("lyra")) {
            // ... (Lyra delegation logic remains the same)
        }
        else if (currentStep.toLowerCase().includes("fornax")) {
            // ... (Fornax delegation logic remains the same)
        }
        else if (currentStep.toLowerCase().includes("caelus")) { // --- NEW DELEGATION LOGIC FOR CAELUS ---
            console.log("Delegating to Caelus agent...");
            // We would pass more specific data in a real scenario
            const caelusResult = await caelusExecutor.invoke({ input: "Create a new campaign for the latest product." });
            if (typeof caelusResult === 'object' && caelusResult !== null && 'output' in caelusResult) {
                result = caelusResult.output;
            }
            else {
                result = `Received an unexpected response structure from Caelus: ${JSON.stringify(caelusResult)}`;
            }
        }
        else if (currentStep.toLowerCase().includes("argent")) {
            // ... (Argent delegation logic remains the same)
        }
        else if (currentStep.toLowerCase().includes("corvus")) {
            // ... (Corvus delegation logic remains the same)
        }
        else {
            result = `Successfully executed placeholder step: ${currentStep}`;
        }
    }
    catch (e) {
        const error = e;
        result = `Error occurred during delegation: ${error.message}`;
    }
    return {
        pastSteps: [[currentStep, result]],
        plan: state.plan.slice(1),
    };
}
// ... (shouldEnd function and graph definition remain the same)
function shouldEnd(state) {
    console.log("---JANUS: CHECKING IF FINISHED---");
    if (state.plan.length === 0) {
        console.log("Plan complete. Ending execution.");
        return "end";
    }
    return "continue";
}
const workflow = new StateGraph(JanusState);
workflow.addNode("planner", planStep);
workflow.addNode("agent", executeStep);
workflow.addEdge(START, "planner");
workflow.addEdge("planner", "agent");
workflow.addConditionalEdges("agent", shouldEnd, {
    continue: "agent",
    end: END,
});
const app = workflow.compile();
console.log("Janus agent graph compiled successfully.");
export { app, JanusState };
//# sourceMappingURL=janus.js.map