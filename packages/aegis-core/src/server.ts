// packages/aegis-core/src/server.ts
// Final Definitive Refactoring by Eira

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { StateGraph, END, START } from '@langchain/langgraph';
import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState, graphState, Task } from './schemas.js';
import { v4 as uuidv4 } from 'uuid';
import { lyraExecutor, caelusExecutor, fornaxExecutor, corvusExecutor } from './agents.js';

const expressApp = express();
expressApp.use(cors({ origin: 'http://localhost:3000' }));
expressApp.use(express.json());
const server = http.createServer(expressApp);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8080;
const clients = new Map<string, WebSocket>();
const workflowApprovalPromises = new Map<string, (decision: string) => void>();

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);
    console.log(`Client ${clientId} connected`);
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === 'human:response' && workflowApprovalPromises.has(data.workflowId)) {
                workflowApprovalPromises.get(data.workflowId)?.(data.decision);
                workflowApprovalPromises.delete(data.workflowId);
            }
        } catch (e) { console.error('Failed to parse incoming WebSocket message:', e); }
    });
    ws.on('close', () => { clients.delete(clientId); });
});
function broadcast(message: object) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
}

// ==============================================================================
// --- AGENT GRAPH LOGIC (Simplified and Corrected) ---
// ==============================================================================

async function delegateTaskNode(state: AgentState, config: RunnableConfig): Promise<Partial<AgentState>> {
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
        } else { resolvedInput = readyTask.input; }
    } catch (e) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'failed', output: { agentResponse: `Failed to resolve dynamic input: ${(e as Error).message}` } };
        return { ...state, tasks: newTasks };
    }
    
    const agentInput = { input: resolvedInput, chat_history: [] };
    const agentMap = { 'Lyra': lyraExecutor, 'Caelus': caelusExecutor, 'Fornax': fornaxExecutor, 'Corvus': corvusExecutor };
    const agentExecutor = agentMap[readyTask.agent as keyof typeof agentMap];

    try {
        const agentOutput = await agentExecutor.invoke(agentInput, config);
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'awaiting_human_approval', output: { agentResponse: agentOutput.output } };
        return { ...state, tasks: newTasks, humanApprovalNeeded: true };
    } catch (error) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: 'failed', output: { agentResponse: `Agent ${readyTask.agent} failed: ${(error as Error).message}` } };
        return { ...state, tasks: newTasks };
    }
}

async function humanApprovalGateNode(state: AgentState, config: RunnableConfig): Promise<Partial<AgentState>> {
    const workflowId = config.configurable?.runId;
    const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
    if (!taskForApproval) return { ...state, humanApprovalNeeded: false };
    
    broadcast({ type: 'gate:approval_required', workflowId, task: taskForApproval });
    const decision = await new Promise<string>((resolve) => { workflowApprovalPromises.set(workflowId!, resolve); });
    
    const newStatus = decision.toLowerCase() === 'approve' ? 'completed' : 'failed';
    const updatedTasks = state.tasks.map(t => t.id === taskForApproval.id ? { ...t, status: newStatus as Task['status'] } : t);
    
    broadcast({ type: 'log', workflowId, message: `Human Partner: Task "${taskForApproval.description}" was ${newStatus}.` });
    return { tasks: updatedTasks, humanApprovalNeeded: false };
}

function routeTasks(state: AgentState): 'human_approval_gate' | 'delegate_task' | '__end__' {
    if (state.humanApprovalNeeded) return "human_approval_gate";
    const hasPendingTasks = state.tasks.some(t =>
        t.status === 'pending' &&
        (t.dependencies ?? []).every(depId => state.tasks.find(dep => dep.id === depId)?.status === 'completed')
    );
    if (hasPendingTasks) return "delegate_task";
    return END;
}

const agentWorkflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode('delegate_task', delegateTaskNode)
  .addNode('human_approval_gate', humanApprovalGateNode)
  .addEdge(START, 'delegate_task')
  .addConditionalEdges('delegate_task', routeTasks)
  .addEdge('human_approval_gate', 'delegate_task')
  .compile();
console.log('Aegis workflow compiled successfully.');

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res, next)).catch(next); };

const handleStartWorkflow = async (req: Request, res: Response) => {
    console.log('Received request to start workflow.');
    const { initialTasks } = req.body;
    if (!initialTasks || !Array.isArray(initialTasks)) {
      return res.status(400).json({ error: 'initialTasks array is required.' });
    }
    const workflowId = `run-${uuidv4()}`;
    const initialState: AgentState = {
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
        } catch (e) {
            console.error(`Workflow ${workflowId} stream error:`, e);
            broadcast({ type: 'workflow:error', workflowId, error: (e as Error).message });
        }
    })();
};
expressApp.post('/api/v1/workflow/start', asyncHandler(handleStartWorkflow));

server.listen(PORT, () => { console.log(`Aegis Core server listening on http://localhost:${PORT}`); });