import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState, graphState, Task } from './schemas.js';
import { v4 as uuidv4 } from 'uuid';
import { lyraExecutor, caelusExecutor } from './agents.js';
import * as readline from 'node:readline/promises'; // Import for console input
import { stdin as input, stdout as output } from 'node:process'; // Import for console I/O

// --- NODES ---

async function delegateTaskNode(state: AgentState): Promise<Partial<AgentState>> {
  // This node's logic remains the same.
  console.log('\n--- DELEGATION NODE ---');
  const { tasks } = state;
  const readyTaskIndex = tasks.findIndex(t => {
    if (t.status !== 'pending') return false;
    if (!t.dependencies || t.dependencies.length === 0) return true;
    return t.dependencies.every(depId => tasks.find(dep => dep.id === depId)?.status === 'completed');
  });

  if (readyTaskIndex === -1) {
    console.log('Janus: No pending tasks. Work complete.');
    return { humanApprovalNeeded: false };
  }

  const currentTask = { ...tasks[readyTaskIndex] };
  console.log(`Janus: Executing: "${currentTask.description}" for agent ${currentTask.agent}.`);

  let agentOutput: any;
  if (currentTask.agent === 'Lyra') {
    const taskInput = { ...currentTask.input, chat_history: [] };
    agentOutput = await lyraExecutor.invoke(taskInput);
  } else if (currentTask.agent === 'Caelus') {
    const taskInput = { ...currentTask.input, chat_history: [] };
    agentOutput = await caelusExecutor.invoke({ input: JSON.stringify(taskInput), chat_history: [] });
  } else {
    agentOutput = { output: "No action taken." };
  }

  currentTask.status = 'awaiting_human_approval'; 
  currentTask.output = agentOutput;
  const newTasks = [...tasks];
  newTasks[readyTaskIndex] = currentTask;

  return {
    tasks: newTasks,
    humanApprovalNeeded: true, 
    systemMessages: [`Janus: Task "${currentTask.id}" executed. Awaiting approval.`],
  };
}

// LOGICAL REWRITE: This node now genuinely waits for human interaction.
async function humanApprovalGateNode(state: AgentState): Promise<Partial<AgentState>> {
  console.log('\n--- HUMAN APPROVAL GATE ---');
  const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
  
  if (!taskForApproval) {
    // This should not happen if routing is correct, but it's a safe fallback.
    return { humanApprovalNeeded: false };
  }

  console.log(`Janus: Paused. The following task requires your approval:`);
  console.log(`  - Task: ${taskForApproval.description}`);
  console.log(`--- AGENT OUTPUT ---`);
  console.dir(taskForApproval.output, { depth: null });
  console.log(`--- END AGENT OUTPUT ---`);

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('Do you approve this result? (yes/no): ');
  rl.close();

  const newStatus = answer.toLowerCase() === 'yes' ? 'completed' : 'failed';
  const approvedTask = { ...taskForApproval, status: newStatus as Task['status'] };
  const newTasks = state.tasks.map(t => t.id === approvedTask.id ? approvedTask : t);

  return {
      tasks: newTasks,
      humanApprovalNeeded: false, // Lower the flag, the human has acted.
      systemMessages: [`Human Partner: Task "${approvedTask.id}" was ${newStatus}.`],
  };
}

// --- EDGES ---

function routeTasks(state: AgentState): 'human_approval_gate' | 'delegate_task' | '__end__' {
  // This routing logic remains correct.
  console.log('\n--- ROUTING ---');
  if (state.humanApprovalNeeded) {
    console.log('Routing to human_approval_gate.');
    return 'human_approval_gate';
  }

  const hasPendingTasks = state.tasks.some(t => t.status === 'pending');
  if (hasPendingTasks) {
    console.log('Routing to delegate_task.');
    return 'delegate_task';
  }

  console.log('All tasks resolved. Routing to __end__.');
  return END;
}

// --- GRAPH CONSTRUCTION ---
// The graph structure also remains correct.
console.log('Constructing the Aegis agent workflow...');
const workflow = new StateGraph<AgentState>({ channels: graphState });
workflow.addNode('delegate_task', delegateTaskNode);
workflow.addNode('human_approval_gate', humanApprovalGateNode);
workflow.addEdge(START, 'delegate_task' as any);
workflow.addConditionalEdges(
  'delegate_task' as any,
  routeTasks,
  {
    human_approval_gate: 'human_approval_gate' as any,
    delegate_task: 'delegate_task' as any,
    __end__: END,
  }
);
workflow.addEdge('human_approval_gate' as any, 'delegate_task' as any);
const app = workflow.compile();
console.log('Aegis workflow compiled successfully.');


// --- EXECUTION ---
// The main execution function remains the same.
async function main() {
  console.log('\nStarting a new run of the Aegis system...');
  const lyraTaskId = uuidv4();
  const lyraTask: Task = {
    id: lyraTaskId,
    description: 'Research the market for high-end, artisanal coffee beans.',
    agent: 'Lyra',
    input: { input: 'market trends for single-origin, specialty coffee beans' },
    status: 'pending',
  };
  const caelusTask: Task = {
    id: uuidv4(),
    description: 'Create a Facebook ad for a new artisanal coffee product.',
    agent: 'Caelus',
    input: {
        productName: "Aegis Gold Roast",
        productDescription: "An exclusive, single-origin coffee bean from the high mountains of Colombia, featuring notes of chocolate and citrus. Targeted at coffee connoisseurs.",
        targetPlatform: 'Facebook'
    },
    status: 'pending',
    dependencies: [lyraTaskId],
  };
  const initialState = { tasks: [lyraTask, caelusTask] };
  for await (const event of await app.stream(initialState, { recursionLimit: 100 })) {}
  console.log("\n--- Run Complete ---");
}

main();