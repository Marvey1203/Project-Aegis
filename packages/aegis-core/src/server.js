"use strict";
// packages/aegis-core/src/server.ts
// Final Definitive Refactoring by Eira
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const langgraph_1 = require("@langchain/langgraph");
const schemas_js_1 = require("./schemas.js");
const uuid_1 = require("uuid");
const agents_js_1 = require("./agents.js");
const expressApp = (0, express_1.default)();
expressApp.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
expressApp.use(express_1.default.json());
const server = http_1.default.createServer(expressApp);
const wss = new ws_1.WebSocketServer({ server });
const PORT = process.env.PORT || 8080;
const clients = new Map();
const workflowApprovalPromises = new Map();
wss.on('connection', (ws) => {
    const clientId = (0, uuid_1.v4)();
    clients.set(clientId, ws);
    console.log(`Client ${clientId} connected`);
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'human:response' && workflowApprovalPromises.has(data.workflowId)) {
                workflowApprovalPromises.get(data.workflowId)?.(data.decision);
                workflowApprovalPromises.delete(data.workflowId);
            }
        }
        catch (e) {
            console.error('Failed to parse incoming WebSocket message:', e);
        }
    });
    ws.on('close', () => { clients.delete(clientId); });
});
function broadcast(message) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN)
            client.send(data);
    });
}
// ==============================================================================
// --- AGENT GRAPH LOGIC (Simplified and Corrected) ---
// ==============================================================================
async function delegateTaskNode(state, config) {
    // --- STEP 1: THE DIAGNOSTIC LOG ---
    // Let's see the exact state the node is receiving.
    console.log("--- RAW STATE RECEIVED BY DELEGATION NODE ---");
    console.dir(state, { depth: null });
    console.log("-------------------------------------------");
    const workflowId = config.configurable?.runId;
    broadcast({ type: 'log', workflowId, message: `--- DELEGATION NODE ---` });
    // The rest of the function remains the same...
    const { tasks } = state;
    const readyTask = tasks.find(task => {
        if (task.status !== 'pending') {
            return false;
        }
        const dependencies = task.dependencies ?? [];
        if (dependencies.length === 0) {
            return true;
        }
        return dependencies.every(depId => {
            const dependencyTask = tasks.find(t => t.id === depId);
            return dependencyTask?.status === 'completed';
        });
    });
    if (!readyTask) {
        broadcast({ type: 'log', workflowId, message: 'Janus: No actionable pending tasks.' });
        return { ...state, humanApprovalNeeded: false };
    }
    const taskIndex = tasks.findIndex(t => t.id === readyTask.id);
    const newTasks = [...tasks];
    newTasks[taskIndex] = { ...readyTask, status: 'in_progress' };
    broadcast({ type: 'log', workflowId, message: `Janus: Executing: "${readyTask.description}" for agent ${readyTask.agent}.` });
    let resolvedInput;
    try {
        if (typeof readyTask.input === 'string' && readyTask.input.trim().startsWith('(state) =>')) {
            const dynamicInputFn = new Function('state', `return (${readyTask.input})(state);`);
            resolvedInput = dynamicInputFn({ ...state, tasks: newTasks });
        }
        else {
            resolvedInput = readyTask.input;
        }
    }
    catch (e) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'failed', output: { agentResponse: `Failed to resolve dynamic input: ${e.message}` } };
        return { ...state, tasks: newTasks };
    }
    const agentInput = { input: resolvedInput, chat_history: [] };
    const agentMap = { 'Lyra': agents_js_1.lyraExecutor, 'Caelus': agents_js_1.caelusExecutor, 'Fornax': agents_js_1.fornaxExecutor, 'Corvus': agents_js_1.corvusExecutor };
    const agentExecutor = agentMap[readyTask.agent];
    try {
        const agentOutput = await agentExecutor.invoke(agentInput, config);
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'awaiting_human_approval', output: { agentResponse: agentOutput.output } };
        return { ...state, tasks: newTasks, humanApprovalNeeded: true };
    }
    catch (error) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'failed', output: { agentResponse: `Agent ${readyTask.agent} failed: ${error.message}` } };
        return { ...state, tasks: newTasks };
    }
}
async function humanApprovalGateNode(state, config) {
    const workflowId = config.configurable?.runId;
    const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
    if (!taskForApproval)
        return { ...state, humanApprovalNeeded: false };
    broadcast({ type: 'gate:approval_required', workflowId, task: taskForApproval });
    const decision = await new Promise((resolve) => { workflowApprovalPromises.set(workflowId, resolve); });
    const newStatus = decision.toLowerCase() === 'approve' ? 'completed' : 'failed';
    const updatedTasks = state.tasks.map(t => t.id === taskForApproval.id ? { ...t, status: newStatus } : t);
    broadcast({ type: 'log', workflowId, message: `Human Partner: Task "${taskForApproval.description}" was ${newStatus}.` });
    return { tasks: updatedTasks, humanApprovalNeeded: false };
}
function routeTasks(state) {
    if (state.humanApprovalNeeded)
        return "human_approval_gate";
    const hasPendingTasks = state.tasks.some(t => t.status === 'pending' &&
        (t.dependencies ?? []).every(depId => state.tasks.find(dep => dep.id === depId)?.status === 'completed'));
    if (hasPendingTasks)
        return "delegate_task";
    return langgraph_1.END;
}
const agentWorkflow = new langgraph_1.StateGraph({ channels: schemas_js_1.graphState })
    .addNode('delegate_task', delegateTaskNode)
    .addNode('human_approval_gate', humanApprovalGateNode)
    .addEdge(langgraph_1.START, 'delegate_task')
    .addConditionalEdges('delegate_task', routeTasks)
    .addEdge('human_approval_gate', 'delegate_task')
    .compile();
console.log('Aegis workflow compiled successfully.');
const asyncHandler = (fn) => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
const handleStartWorkflow = async (req, res) => {
    console.log('Received request to start workflow.');
    const { initialTasks } = req.body;
    if (!initialTasks || !Array.isArray(initialTasks)) {
        return res.status(400).json({ error: 'initialTasks array is required.' });
    }
    const workflowId = `run-${(0, uuid_1.v4)()}`;
    const initialState = {
        tasks: initialTasks,
        systemMessages: [],
        humanApprovalNeeded: false,
    };
    res.status(202).json({ workflowId, message: "Workflow accepted and initiated." });
    (async () => {
        try {
            for await (const event of await agentWorkflow.stream(initialState, { recursionLimit: 100, configurable: { runId: workflowId } })) {
                broadcast({ type: 'state:update', workflowId, data: event });
            }
            broadcast({ type: 'workflow:end', workflowId, message: 'Run Complete' });
            console.log(`\n--- Run ${workflowId} Complete ---`);
        }
        catch (e) {
            console.error(`Workflow ${workflowId} stream error:`, e);
            broadcast({ type: 'workflow:error', workflowId, error: e.message });
        }
    })();
};
expressApp.post('/api/v1/workflow/start', asyncHandler(handleStartWorkflow));
server.listen(PORT, () => { console.log(`Aegis Core server listening on http://localhost:${PORT}`); });
