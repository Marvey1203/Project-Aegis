// packages/aegis-dashboard/src/components/DashboardClient.tsx

"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { LiveLog, LogMessage } from './ui/LiveLog';
import { TaskCard, Task } from './ui/TaskCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function DashboardClient() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [taskForApproval, setTaskForApproval] = useState<Task | null>(null);
  const [missionInput, setMissionInput] = useState<string>("a product to sell in the coffee niche, that has a potential of 55% + profit margin");
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = 'ws://localhost:8080';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (error) => console.error('WebSocket error:', error);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newLog: LogMessage = { ...data, timestamp: new Date().toLocaleTimeString() };
        
        // Always add system logs
        if (data.type === 'log' || data.type === 'status' || data.type === 'connection:success') {
          setLogs(prev => [...prev, newLog]);
        }

        // DEFINITIVE FIX: Robustly handle state updates from any node in the graph.
        if (data.type === 'state:update') {
          // The event payload 'data.data' is an object where keys are node names.
          // We find the first key that contains a 'tasks' array and use it as the source of truth.
          const nodeNameWithTasks = Object.keys(data.data).find(key => data.data[key]?.tasks);
          if (nodeNameWithTasks) {
            const newTasks = data.data[nodeNameWithTasks].tasks;
            setTasks(newTasks);
            
            // Also, find if any task in the new state is awaiting approval.
            const approvalTask = newTasks.find((t: Task) => t.status === 'awaiting_human_approval');
            if (approvalTask) {
              setTaskForApproval(approvalTask);
              setWorkflowId(data.workflowId);
            }
          }
        }
        
        if (data.type === 'workflow:end' || (data.type === 'human:response' && data.decision === 'approve')) {
          setTaskForApproval(null);
          if (data.type === 'workflow:end') {
            setWorkflowId(null);
          }
        }
        
        if (data.type === 'human:response' && data.decision === 'deny') {
            setTaskForApproval(null);
            setWorkflowId(null); // The workflow will end after cascading failures.
        }


      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => ws.current?.close();
  }, []);

  const startMission = async () => {
    if (!missionInput.trim()) {
      alert("Please enter a mission objective.");
      return;
    }

    setLogs([{ type: 'status', message: `Initiating new mission: ${missionInput}`, timestamp: new Date().toLocaleTimeString() }]);
    setTasks([]);
    setTaskForApproval(null);
    setWorkflowId('pending'); // Use a pending state to disable button

    // This logic now uses the missionInput for the first task
    const lyraTaskId = uuidv4();
    const caelusTaskId = uuidv4();
    const fornaxTaskId = uuidv4();

    const initialTasks = [
      { id: lyraTaskId, description: `Research: ${missionInput}`, agent: 'Lyra', input: { input: missionInput }, status: 'pending', dependencies: [] },
      { id: caelusTaskId, description: 'Create a Facebook ad for the discovered product.', agent: 'Caelus', input: { productName: "Aegis Gold Roast", productDescription: "An exclusive, single-origin coffee bean...", targetPlatform: 'Facebook' }, status: 'pending', dependencies: [lyraTaskId] },
      { id: fornaxTaskId, description: 'Process a customer order for the product.', agent: 'Fornax', input: { productName: "Aegis Gold Roast", productSku: "AGR-001", quantity: 2, customerName: "John Doe", shippingAddress: "123 Main St, Anytown, USA 12345" }, status: 'pending', dependencies: [caelusTaskId] },
      { id: uuidv4(), description: 'Send shipping confirmation to the customer.', agent: 'Corvus', input: { customerName: "John", customerEmail: "j.doe@example.com" }, status: 'pending', dependencies: [fornaxTaskId] }
    ];

    const response = await fetch('http://localhost:8080/api/v1/workflow/start', { // <-- CORRECTED: Full, absolute path
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialTasks }),
    });

    const result = await response.json();
    if (response.ok) {
        setWorkflowId(result.workflowId);
    } else {
        console.error("Failed to start workflow:", result);
        setWorkflowId(null);
    }
  };

  const sendApproval = (decision: 'approve' | 'deny') => {
    if (ws.current && workflowId && taskForApproval) {
      ws.current.send(JSON.stringify({
        type: 'human:response',
        workflowId,
        taskId: taskForApproval.id,
        decision,
      }));
      setTaskForApproval(null);
    }
  };

  const isMissionRunning = workflowId !== null;

  return (
    <>
    <div className="mb-8 flex gap-2">
      <Input 
        type="text" 
        value={missionInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMissionInput(e.target.value)}
        placeholder="Enter research mission for Lyra..."
        className="bg-gray-800 text-white border-gray-700 max-w-lg"
        disabled={isMissionRunning}
      />
      <Button className='cursor-pointer' onClick={startMission} disabled={isMissionRunning}>
        {isMissionRunning ? 'Mission in Progress...' : 'Start New Mission'}
      </Button>
    </div>
      
      {taskForApproval && (
        <Card className="bg-yellow-900/20 border-yellow-700 text-white mb-8 animate-pulse">
          <CardHeader>
            <CardTitle>Human Approval Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TaskCard task={taskForApproval} />
            <div className="flex gap-4">
              <Button onClick={() => sendApproval('approve')} variant="secondary">Approve</Button>
              <Button onClick={() => sendApproval('deny')} variant="destructive">Deny</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Task Queue</h2>
          <div className="max-h-[80vh] overflow-y-auto p-1 space-y-4">
            {tasks.length > 0 ? (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <Card className="bg-gray-800/50 border-gray-700 text-gray-500">
                <CardContent className="p-6">Awaiting mission start...</CardContent>
              </Card>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Live Log</h2>
          <LiveLog logs={logs} isConnected={isConnected} />
        </div>
      </div>
    </>
  );
}

// A simple UUID generator, as we don't have the uuid package on the client-side
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}