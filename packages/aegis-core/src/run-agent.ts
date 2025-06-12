// packages/aegis-core/src/run-agent.ts

import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState, graphState, Task } from './schemas.js';
import { v4 as uuidv4 } from 'uuid';
import { lyraExecutor, caelusExecutor, fornaxExecutor, corvusExecutor } from './agents.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function delegateTaskNode(state: AgentState): Promise<Partial<AgentState>> {
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
  let agentInput = { input: currentTask.input, chat_history: [] };

  if (currentTask.agent === 'Corvus') {
    const fornaxTask = state.tasks.find(t => t.id === currentTask.dependencies![0]);
    const fornaxToolOutput = fornaxTask!.output!.toolOutput as string;
    const fornaxOutput = JSON.parse(fornaxToolOutput);
    
    const corvusInputPayload = {
      ...currentTask.input,
      orderId: fornaxOutput.orderId,
      trackingNumber: fornaxOutput.trackingNumber,
    };
    agentInput = { input: corvusInputPayload, chat_history: [] };
    agentOutput = await corvusExecutor.invoke(agentInput);
  } else if (currentTask.agent === 'Lyra') {
    agentOutput = await lyraExecutor.invoke(agentInput);
  } else if (currentTask.agent === 'Caelus') {
    agentOutput = await caelusExecutor.invoke(agentInput);
  } else if (currentTask.agent === 'Fornax') {
    agentOutput = await fornaxExecutor.invoke(agentInput);
  } else {
    agentOutput = { output: "No action taken." };
  }

  currentTask.status = 'awaiting_human_approval';
  
  // DEFINITIVE FIX 2: Access the tool output from the 'intermediateSteps' array.
  const toolOutput = agentOutput.intermediateSteps?.[0]?.observation ?? null;

  currentTask.output = { 
    agentResponse: agentOutput.output,
    toolOutput: toolOutput,
  };
  
  const newTasks = [...tasks];
  newTasks[readyTaskIndex] = currentTask;

  return {
    tasks: newTasks,
    humanApprovalNeeded: true, 
    systemMessages: [`Janus: Task "${currentTask.id}" executed. Awaiting approval.`],
  };
}

async function humanApprovalGateNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log('\n--- HUMAN APPROVAL GATE ---');
    const taskForApproval = state.tasks.find(t => t.status === 'awaiting_human_approval');
    if (!taskForApproval) return { humanApprovalNeeded: false };
  
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
        humanApprovalNeeded: false,
        systemMessages: [`Human Partner: Task "${approvedTask.id}" was ${newStatus}.`],
    };
}
  
function routeTasks(state: AgentState): 'human_approval_gate' | 'delegate_task' | '__end__' {
    console.log('\n--- ROUTING ---');
    if (state.humanApprovalNeeded) return 'human_approval_gate';
    if (state.tasks.some(t => t.status === 'pending')) return 'delegate_task';
    console.log('All tasks resolved. Routing to __end__.');
    return END;
}
  
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

async function main() {
  console.log('\nStarting a new run of the Aegis system...');
  const lyraTaskId = uuidv4();
  const caelusTaskId = uuidv4();
  const fornaxTaskId = uuidv4();

  const lyraTask: Task = {
    id: lyraTaskId,
    description: 'Research the market for high-end, artisanal coffee beans.',
    agent: 'Lyra',
    // The entire object is now the value of the 'input' key.
    input: { input: 'market trends for single-origin, specialty coffee beans' },
    status: 'pending',
  };

  const caelusTask: Task = {
    id: caelusTaskId,
    description: 'Create a Facebook ad for a new artisanal coffee product.',
    agent: 'Caelus',
    input: {
        productName: "Aegis Gold Roast",
        productDescription: "An exclusive, single-origin coffee bean...",
        targetPlatform: 'Facebook'
    },
    status: 'pending',
    dependencies: [lyraTaskId],
  };
  
  const fornaxTask: Task = {
    id: fornaxTaskId,
    description: 'Process a new customer order for Aegis Gold Roast.',
    agent: 'Fornax',
    input: {
      productName: "Aegis Gold Roast",
      productSku: "AGR-001",
      quantity: 2,
      customerName: "John Doe",
      shippingAddress: "123 Main St, Anytown, USA 12345"
    },
    status: 'pending',
    dependencies: [caelusTaskId],
  };

  const corvusTask: Task = {
    id: uuidv4(),
    description: 'Send a shipping confirmation email to the customer.',
    agent: 'Corvus',
    input: {
      customerName: "John",
      customerEmail: "j.doe@example.com",
    },
    status: 'pending',
    dependencies: [fornaxTaskId],
  };

  const initialState = {
    tasks: [lyraTask, caelusTask, fornaxTask, corvusTask],
  };
  
  for await (const event of await app.stream(initialState, { recursionLimit: 100 })) {}
  console.log("\n--- Run Complete ---");
}

main();