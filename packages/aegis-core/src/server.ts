// packages/aegis-core/src/server.ts

import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState, graphState, Task } from './schemas.js';
import { v4 as uuidv4 } from 'uuid';
import { lyraExecutor, caelusExecutor, fornaxExecutor, corvusExecutor } from './agents.js';

// --- SERVER SETUP ---
const expressApp = express();
expressApp.use(cors({ origin: 'http://localhost:3000' }));
expressApp.use(express.json());
const server = http.createServer(expressApp);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 8080;

const clients = new Map<string, WebSocket>();
const workflowApprovalPromises = new Map<string, (decision: string) => void>();

// --- WebSocket Connection Handling ---
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  console.log(`Client ${clientId} connected`);
  ws.send(JSON.stringify({ type: 'connection:success', clientId }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      if (data.type === 'human:response' && workflowApprovalPromises.has(data.workflowId)) {
        workflowApprovalPromises.get(data.workflowId)?.(data.decision);
        workflowApprovalPromises.delete(data.workflowId);
      }
    } catch (e) { console.error('Failed to parse incoming WebSocket message:', message.toString()); }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(clientId);
  });
});

function broadcast(message: object) {
  const data = JSON.stringify(message);
  for (const client of clients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// --- AGENT GRAPH LOGIC ---
// (Node functions delegateTaskNode, humanApprovalGateNode, and routeTasks are unchanged and correct)
async function delegateTaskNode(state: AgentState, config: { configurable: { runId: string } }): Promise<Partial<AgentState>> {
  const workflowId = config.configurable.runId;
  broadcast({ type: 'log', workflowId, message: `--- DELEGATION NODE ---` });
  
  let { tasks } = state;
  const tasksWithCascadedFailures = tasks.map(task => {
      if (task.status === 'pending' && task.dependencies?.some(depId => tasks.find(t => t.id === depId)?.status === 'failed')) {
        const logMsg = `Janus: Task "${task.description}" is being marked as failed due to a failed dependency.`;
        console.log(logMsg);
        broadcast({ type: 'log', workflowId, message: logMsg });
        return { ...task, status: 'failed' as const };
      }
      return task;
  });
  tasks = tasksWithCascadedFailures;

  const readyTaskIndex = tasks.findIndex(t => {
      if (t.status !== 'pending') return false;
      if (!t.dependencies || t.dependencies.length === 0) return true;
      return t.dependencies.every(depId => tasks.find(dep => dep.id === depId)?.status === 'completed');
  });

  if (readyTaskIndex === -1) {
      const logMsg = 'Janus: No actionable pending tasks. Work complete or blocked.';
      console.log(logMsg);
      broadcast({ type: 'log', workflowId, message: logMsg });
      return { tasks, humanApprovalNeeded: false };
  }

  const currentTask = { ...tasks[readyTaskIndex] };
  const logMsg = `Janus: Executing: "${currentTask.description}" for agent ${currentTask.agent}.`;
  console.log(logMsg);
  broadcast({ type: 'log', workflowId, message: logMsg });

  let agentOutput: any;
  let agentInput = { input: currentTask.input, chat_history: [] };

  if (currentTask.agent === 'Corvus') {
      const fornaxTask = tasks.find(t => t.id === currentTask.dependencies![0]);
      const fornaxToolOutput = fornaxTask!.output!.toolOutput as string; 
      const fornaxOutput = JSON.parse(fornaxToolOutput);
      const corvusInputPayload = { ...currentTask.input, orderId: fornaxOutput.orderId, trackingNumber: fornaxOutput.trackingNumber };
      agentInput = { input: corvusInputPayload, chat_history: [] };
      agentOutput = await corvusExecutor.invoke(agentInput, config);
  } else if (currentTask.agent === 'Lyra') {
      agentOutput = await lyraExecutor.invoke(agentInput, config);
  } else if (currentTask.agent === 'Caelus') {
      agentOutput = await caelusExecutor.invoke(agentInput, config);
  } else if (currentTask.agent === 'Fornax') {
      agentOutput = await fornaxExecutor.invoke(agentInput, config);
  } else {
      agentOutput = { output: "No action taken." };
  }

  currentTask.status = 'awaiting_human_approval'; 
  const toolOutput = agentOutput.intermediateSteps?.[0]?.observation ?? null;
  currentTask.output = { agentResponse: agentOutput.output, toolOutput };
  
  const finalTasks = [...tasks];
  finalTasks[readyTaskIndex] = currentTask;

  return {
      tasks: finalTasks,
      humanApprovalNeeded: true, 
      systemMessages: [`Janus: Task "${currentTask.id}" executed. Awaiting approval.`],
  };
}

async function humanApprovalGateNode(state: AgentState, config: { configurable: { runId: string } }): Promise<Partial<AgentState>> {
  const workflowId = config.configurable.runId;
  console.log('\n--- HUMAN APPROVAL GATE ---');
  const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
  if (!taskForApproval || !workflowId) return { humanApprovalNeeded: false };

  console.log(`Janus: Paused. Waiting for human response on WebSocket for workflow ${workflowId}.`);
  broadcast({ type: 'gate:approval_required', workflowId, task: taskForApproval });

  const decision = await new Promise<string>((resolve) => {
    workflowApprovalPromises.set(workflowId, resolve);
  });

  const newStatus = decision.toLowerCase() === 'approve' ? 'completed' : 'failed';
  const approvedTask = { ...taskForApproval, status: newStatus as Task['status'] };
  const newTasks = state.tasks.map(t => t.id === approvedTask.id ? approvedTask : t);

  broadcast({ type: 'log', workflowId, message: `Human Partner: Task "${approvedTask.id}" was ${newStatus}.` });

  return {
      tasks: newTasks,
      humanApprovalNeeded: false,
      systemMessages: [`Human Partner: Task "${approvedTask.id}" was ${newStatus}.`],
  };
}
  
function routeTasks(state: AgentState): 'human_approval_gate' | 'delegate_task' | '__end__' {
  broadcast({ type: 'log', message: '--- ROUTING ---' });
  if (state.humanApprovalNeeded) return 'human_approval_gate';
  const hasReadyPending = state.tasks.some(t => {
      if (t.status !== 'pending') return false;
      if (!t.dependencies || t.dependencies.length === 0) return true;
      return t.dependencies.every(depId => state.tasks.find(dep => dep.id === depId)?.status === 'completed');
  });
  if (hasReadyPending) {
    broadcast({ type: 'log', message: 'Routing to delegate_task.' });
    return 'delegate_task';
  }
  broadcast({ type: 'log', message: 'All tasks resolved. Routing to __end__.' });
  return END;
}

const agentWorkflow = new StateGraph<AgentState>({ channels: graphState })
  .addNode('delegate_task', delegateTaskNode as any)
  .addNode('human_approval_gate', humanApprovalGateNode as any)
  .addEdge(START, 'delegate_task' as any)
  .addConditionalEdges('delegate_task' as any, routeTasks, {
    human_approval_gate: 'human_approval_gate' as any,
    delegate_task: 'delegate_task' as any,
    __end__: END,
  })
  .addEdge('human_approval_gate' as any, 'delegate_task' as any)
  .compile();
console.log('Aegis workflow compiled successfully.');


// --- API Endpoint Handler Function ---
// DEFINITIVE FIX: Extract the handler logic into a named async function.
const handleStartWorkflow = async (req: Request, res: Response, next: express.NextFunction) => {
  console.log('Received request to start workflow.');
  const { initialTasks } = req.body;

  if (!initialTasks || !Array.isArray(initialTasks)) {
      return res.status(400).json({ error: 'initialTasks array is required.' });
  }

  const workflowId = `run-${uuidv4()}`;
  const initialState = { tasks: initialTasks };

  // Immediately respond to the client so it doesn't time out.
  res.status(202).json({
      workflowId,
      message: "Workflow accepted and initiated. Monitor WebSocket for real-time updates."
  });

  // Now, run the long-running workflow in the background.
  try {
      for await (const event of await agentWorkflow.stream(initialState, { recursionLimit: 100, configurable: { runId: workflowId } })) {
          broadcast({ type: 'state:update', workflowId, data: event });
      }
      broadcast({ type: 'workflow:end', workflowId, message: 'Run Complete' });
      console.log(`\n--- Run ${workflowId} Complete ---`);
  } catch (e) {
      console.error(`Workflow ${workflowId} error:`, e);
      broadcast({ type: 'workflow:error', workflowId, error: (e as Error).message });
      if (next) next(e);
  }
};

// --- API Endpoints ---
expressApp.get('/', (req: Request, res: Response) => {
    res.send('Aegis Core is running.');
});
// DEFINITIVE FIX: The .post() call is now clean and simple.
// Wrap async handler to catch errors and pass to next()
function asyncHandler(fn: (req: Request, res: Response, next: express.NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
expressApp.post('/api/v1/workflow/start', asyncHandler(handleStartWorkflow));


// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Aegis Core server listening on http://localhost:${PORT}`);
});