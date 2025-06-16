"use strict";
// packages/aegis-core/src/run-agent.ts
// Corrected by Eira to align with the final schema.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const langgraph_1 = require("@langchain/langgraph");
const schemas_js_1 = require("./schemas.js");
const uuid_1 = require("uuid");
const agents_js_1 = require("./agents.js");
const readline = __importStar(require("node:readline/promises"));
const node_process_1 = require("node:process");
async function delegateTaskNode(state) {
    console.log('\n--- DELEGATION NODE ---');
    let { tasks } = state;
    const tasksWithCascadedFailures = tasks.map(task => {
        if (task.status === 'pending' && task.dependencies?.some(depId => tasks.find(t => t.id === depId)?.status === 'failed')) {
            console.log(`Janus: Task "${task.description}" is being marked as failed due to a failed dependency.`);
            return { ...task, status: 'failed' };
        }
        return task;
    });
    const currentTasks = tasksWithCascadedFailures;
    const readyTaskIndex = currentTasks.findIndex(t => {
        if (t.status !== 'pending')
            return false;
        return (t.dependencies ?? []).every(depId => currentTasks.find(dep => dep.id === depId)?.status === 'completed');
    });
    if (readyTaskIndex === -1) {
        console.log('Janus: No actionable pending tasks. Work complete or blocked.');
        return { ...state, tasks: currentTasks, humanApprovalNeeded: false };
    }
    const currentTask = { ...currentTasks[readyTaskIndex] };
    console.log(`Janus: Executing: "${currentTask.description}" for agent ${currentTask.agent}.`);
    const newTasks = [...currentTasks];
    newTasks[readyTaskIndex] = { ...currentTask, status: 'in_progress' };
    let agentOutput;
    let agentInput = { input: currentTask.input, chat_history: [] };
    try {
        if (currentTask.agent === 'Corvus') {
            const fornaxTask = newTasks.find(t => t.id === currentTask.dependencies[0]);
            const fornaxToolOutput = fornaxTask.output.toolOutput;
            const fornaxOutput = JSON.parse(fornaxToolOutput);
            const corvusInputPayload = { ...currentTask.input, orderId: fornaxOutput.orderId, trackingNumber: fornaxOutput.trackingNumber };
            agentInput = { input: corvusInputPayload, chat_history: [] };
            agentOutput = await agents_js_1.corvusExecutor.invoke(agentInput);
        }
        else if (currentTask.agent === 'Lyra') {
            agentOutput = await agents_js_1.lyraExecutor.invoke(agentInput);
        }
        else if (currentTask.agent === 'Caelus') {
            agentOutput = await agents_js_1.caelusExecutor.invoke(agentInput);
        }
        else if (currentTask.agent === 'Fornax') {
            agentOutput = await agents_js_1.fornaxExecutor.invoke(agentInput);
        }
        else {
            agentOutput = { output: "No action taken." };
        }
        newTasks[readyTaskIndex] = {
            ...newTasks[readyTaskIndex],
            status: 'awaiting_human_approval',
            output: { agentResponse: agentOutput.output, toolOutput: agentOutput.intermediateSteps?.[0]?.observation ?? null }
        };
        return {
            ...state,
            tasks: newTasks,
            humanApprovalNeeded: true,
            systemMessages: [...state.systemMessages, `Janus: Task "${currentTask.id}" executed. Awaiting approval.`],
        };
    }
    catch (error) {
        newTasks[readyTaskIndex] = { ...newTasks[readyTaskIndex], status: 'failed', output: { agentResponse: error.message } };
        return { ...state, tasks: newTasks };
    }
}
async function humanApprovalGateNode(state) {
    console.log('\n--- HUMAN APPROVAL GATE ---');
    const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
    if (!taskForApproval)
        return { ...state, humanApprovalNeeded: false };
    console.log(`Janus: Paused. The following task requires your approval:`);
    console.log(`  - Task: ${taskForApproval.description}`);
    console.log(`--- AGENT OUTPUT ---`);
    console.dir(taskForApproval.output, { depth: null });
    console.log(`--- END AGENT OUTPUT ---`);
    const rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
    const answer = await rl.question('Do you approve this result? (yes/no): ');
    rl.close();
    const newStatus = answer.toLowerCase() === 'yes' ? 'completed' : 'failed';
    const approvedTask = { ...taskForApproval, status: newStatus };
    const newTasks = state.tasks.map(t => t.id === approvedTask.id ? approvedTask : t);
    return {
        ...state,
        tasks: newTasks,
        humanApprovalNeeded: false,
        systemMessages: [...state.systemMessages, `Human Partner: Task "${approvedTask.id}" was ${newStatus}.`],
    };
}
function routeTasks(state) {
    console.log('\n--- ROUTING ---');
    if (state.humanApprovalNeeded)
        return 'human_approval_gate';
    const hasPendingTasks = state.tasks.some(t => {
        if (t.status !== 'pending')
            return false;
        return (t.dependencies ?? []).every(depId => state.tasks.find(dep => dep.id === depId)?.status === 'completed');
    });
    if (hasPendingTasks)
        return 'delegate_task';
    console.log('All tasks resolved. Routing to __end__.');
    return langgraph_1.END;
}
const workflow = new langgraph_1.StateGraph({ channels: schemas_js_1.graphState })
    .addNode('delegate_task', delegateTaskNode)
    .addNode('human_approval_gate', humanApprovalGateNode)
    .addEdge(langgraph_1.START, 'delegate_task')
    .addConditionalEdges('delegate_task', routeTasks);
const app = workflow.compile();
console.log('Aegis workflow compiled successfully.');
async function main() {
    console.log('\nStarting a new run of the Aegis system...');
    const lyraTaskId = (0, uuid_1.v4)();
    const caelusTaskId = (0, uuid_1.v4)();
    const fornaxTaskId = (0, uuid_1.v4)();
    const lyraTask = { id: lyraTaskId, description: 'Research the market for high-end, artisanal coffee beans.', agent: 'Lyra', input: { input: 'market trends for single-origin, specialty coffee beans' }, status: 'pending', dependencies: [] };
    const caelusTask = { id: caelusTaskId, description: 'Create a Facebook ad for a new artisanal coffee product.', agent: 'Caelus', input: { productName: "Aegis Gold Roast", productDescription: "An exclusive, single-origin coffee bean...", targetPlatform: 'Facebook' }, status: 'pending', dependencies: [lyraTaskId] };
    const fornaxTask = { id: fornaxTaskId, description: 'Process a new customer order for Aegis Gold Roast.', agent: 'Fornax', input: { productName: "Aegis Gold Roast", productSku: "AGR-001", quantity: 2, customerName: "John Doe", shippingAddress: "123 Main St, Anytown, USA 12345" }, status: 'pending', dependencies: [caelusTaskId] };
    const corvusTask = { id: (0, uuid_1.v4)(), description: 'Send a shipping confirmation email to the customer.', agent: 'Corvus', input: { customerName: "John", customerEmail: "j.doe@example.com" }, status: 'pending', dependencies: [fornaxTaskId] };
    const initialState = {
        tasks: [lyraTask, caelusTask, fornaxTask, corvusTask],
        systemMessages: ["Initiating run."],
        humanApprovalNeeded: false,
    };
    for await (const event of await app.stream(initialState, { recursionLimit: 100 })) { }
    console.log("\n--- Run Complete ---");
}
main();
