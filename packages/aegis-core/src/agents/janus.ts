// packages/aegis-core/src/agents/janus.ts

import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { lyraExecutor } from "./lyra.js";
import { fornaxExecutor } from "./fornax.js";
import { argentExecutor } from "./argent.js";
import { corvusExecutor } from "./corvus.js";
import { caelusExecutor } from "./caelus.js";
import { AkashaAgent } from "./akasha.js";

const akashaExecutor = AkashaAgent;

interface AgentExecutorOutput {
  output: string;
}

const JanusState = Annotation.Root({
  input: Annotation<string>(),
  plan: Annotation<string[]>({ reducer: (x, y) => y, default: () => [] }),
  pastSteps: Annotation<Array<[string, string]>>({ reducer: (x, y) => x.concat(y), default: () => [] }),
  productData: Annotation<Record<string, any> | null>({ reducer: (x, y) => y, default: () => null }),
  orderData: Annotation<Record<string, any>[] | null>({ reducer: (x, y) => y, default: () => null }),
  response: Annotation<string>(),
  proposedAdSpend: Annotation<number>({ reducer: (x, y) => y, default: () => 20.00 }),
});

async function planStep(state: typeof JanusState.State) {
  console.log("---JANUS: V1 LAUNCH PLAN INITIATED---");
  const plan = [
    `0. CONSULT_SHORTLIST: Use Akasha to check for promising products.`,
    `1. SCOUT: Use Lyra to find a product based on the input: '${state.input}'.`,
    `2. LIST: Use Fornax to list the scouted product on Shopify.`,
    `3. CHECK_FINANCES: Use Argent to approve the initial ad spend.`,
    `4. MARKET: Use Caelus to create an ad campaign for the new product.`,
    `5. MONITOR: Use Argent to check for new orders for the listed product.`,
    `6. FULFILL: Use Corvus to place a fulfillment order with the supplier.`,
    `7. VERIFY_FULFILLMENT: Use Corvus to verify the supplier order was successful.`,
    `8. NOTIFY: Use Corvus to send a confirmation email to the customer.`,
    `9. REPORT: Use Argent to log the final transaction details.`,
  ];
  return { plan };
}

async function executeStep(state: typeof JanusState.State) {
  console.log("---JANUS: EXECUTING STEP---");
  if (!state.plan || state.plan.length === 0) {
    return { response: "Execution complete. No further steps in the plan." };
  }

  const currentStep = state.plan[0];
  let result: AgentExecutorOutput | null = null;
  let resultOutput = "";
  const updates: Partial<typeof JanusState.State> = {};
  console.log(`Executing: ${currentStep}`);

  try {
    // --- Agent Invocations ---
    if (currentStep.startsWith("0. CONSULT_SHORTLIST")) {
      result = await akashaExecutor.invoke({ query: '{"action": "get"}' }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("1. SCOUT")) {
      result = await lyraExecutor.invoke({ input: state.input }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("2. LIST")) {
      if (!state.productData || state.productData.raw) throw new Error("CRITICAL: Cannot list product, no valid productData from SCOUT step.");
      result = await fornaxExecutor.invoke({ input: JSON.stringify(state.productData) }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("3. CHECK_FINANCES")) {
      result = await argentExecutor.invoke({ input: JSON.stringify({ spend: state.proposedAdSpend }) }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("4. MARKET")) {
      if (!state.productData || state.productData.raw) throw new Error("CRITICAL: Cannot market product, no valid productData from SCOUT step.");
      result = await caelusExecutor.invoke({ input: JSON.stringify(state.productData) }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("5. MONITOR")) {
      result = await argentExecutor.invoke({ input: '{"status": "open"}' }) as AgentExecutorOutput;
    } else if (currentStep.startsWith("6. FULFILL") || currentStep.startsWith("7. VERIFY_FULFILLMENT") || currentStep.startsWith("8. NOTIFY")) {
      if (!state.orderData || state.orderData.length === 0 || state.orderData[0]?.raw) {
        console.log(`Skipping fulfillment step: No valid orders to process.`);
        resultOutput = "No orders to process.";
      } else {
        result = await corvusExecutor.invoke({ input: `Execute step: ${currentStep} with order data: ${JSON.stringify(state.orderData)}` }) as AgentExecutorOutput;
      }
    } else if (currentStep.startsWith("9. REPORT")) {
      if (!state.orderData) throw new Error("Cannot report, no orderData in state.");
      result = await argentExecutor.invoke({ input: JSON.stringify(state.orderData) }) as AgentExecutorOutput;
    } else {
      resultOutput = "Unknown step. Cannot execute.";
    }

    if (result && result.output) {
      resultOutput = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
    } else if (!resultOutput) {
      throw new Error(`Agent for step '${currentStep}' returned a null or empty response.`);
    }

    // --- State Updates and Critical Step Checks (Circuit Breakers) ---
    if (currentStep.startsWith("1. SCOUT")) {
        // ** THE FINAL FIX IS HERE **
        // This regex will find a JSON array or object within the string.
        const jsonMatch = resultOutput.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])|({[\s\S]*})/);

        if (jsonMatch) {
            // We take the first non-null capture group
            const extractedJson = jsonMatch[1] || jsonMatch[2] || jsonMatch[3];
            try {
                updates.productData = JSON.parse(extractedJson);
                console.log("Successfully parsed JSON product data from Lyra.");
            } catch (e: any) {
                throw new Error(`CRITICAL FAILURE IN SCOUT: Failed to parse the extracted JSON. Error: ${e.message}. Halting plan.`);
            }
        } else {
             throw new Error(`CRITICAL FAILURE IN SCOUT: Could not find any JSON in the output from Lyra. Output was: "${resultOutput}". Halting plan.`);
        }
    }
    
    if (currentStep.startsWith("5. MONITOR")) {
      try {
        const parsedOrders = JSON.parse(resultOutput);
        updates.orderData = Array.isArray(parsedOrders) ? parsedOrders : [{ raw: resultOutput }];
      } catch {
        console.log("Could not parse Monitor step output as JSON. Assuming no orders.");
        updates.orderData = [{ raw: resultOutput }];
      }
    }

  } catch (e: any) {
    console.error(`---JANUS: ERROR DURING STEP '${currentStep}'---`);
    console.error(e.message);
    resultOutput = `Error during step '${currentStep}': ${e.message}`;
    if (e.message.startsWith("CRITICAL")) {
      console.log("---JANUS: CRITICAL FAILURE DETECTED, HALTING WORKFLOW---");
      updates.plan = [];
    }
  }

  return {
    ...updates,
    pastSteps: [[currentStep, resultOutput]],
    plan: updates.plan !== undefined ? updates.plan : state.plan.slice(1),
  };
}


function shouldEnd(state: typeof JanusState.State): "continue" | "end" {
  if (!state.plan || state.plan.length === 0) {
    console.log("Plan complete. Ending execution.");
    return "end";
  }
  return "continue";
}

const workflow = new StateGraph(JanusState);

workflow.addNode("planner", planStep);
workflow.addNode("agent", executeStep);
workflow.addEdge(START, "planner" as any);
workflow.addEdge("planner" as any, "agent" as any);
workflow.addConditionalEdges("agent" as any, shouldEnd, {
  continue: "agent" as any,
  end: END,
});

const app = workflow.compile();

console.log("Janus agent graph compiled successfully.");

export { app, JanusState };