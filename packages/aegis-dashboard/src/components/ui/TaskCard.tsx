// In packages/aegis-dashboard/src/components/task-card.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Task interface remains the same
export interface Task {
  id: string;
  description: string;
  agent: string;
  status: 'pending' | 'awaiting_human_approval' | 'completed' | 'failed';
  dependencies?: string[];
  input?: any; // Add the input field to the interface
  output?: any;
}

// Status variant map remains the same
const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'pending': 'secondary',
  'awaiting_human_approval': 'default',
  'completed': 'outline',
  'failed': 'destructive',
};

// Helper function to intelligently render the task input
const renderTaskInput = (input: any) => {
  if (!input) return "No input provided.";
  if (typeof input === 'function') {
    return input.toString();
  }
  if (typeof input === 'object' && input !== null) {
    // We only show the nested 'input' property if it exists, for cleaner display
    const displayInput = input.input ? input.input : input;
    return JSON.stringify(displayInput, null, 2);
  }
  return String(input);
};


export function TaskCard({ task }: { task: Task }) {
  // Defensive check for the task object itself
  if (!task) {
    return null; 
  }

  return (
    <Card className="bg-gray-800 border-gray-700 text-white mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{task.description || "Loading task..."}</CardTitle>
          {/* CRITICAL FIX: Add a check to ensure task.status exists before rendering */}
          {task.status && (
            <Badge variant={statusVariantMap[task.status] || 'secondary'}>
              {task.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-400">
          Agent: {task.agent} | ID: {task.id?.substring(0, 8) || '...'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* NEW UI ELEMENT: Display the task input */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-1">Input Payload:</h4>
          <pre className="text-xs text-amber-200 bg-gray-900 p-3 rounded-md whitespace-pre-wrap break-all">
            <code>
              {renderTaskInput(task.input)}
            </code>
          </pre>
        </div>

        {/* Your existing output rendering */}
        {task.output?.agentResponse && (
           <div>
             <h4 className="text-sm font-semibold text-gray-400 mb-1">Agent Output:</h4>
             <pre className="text-sm text-gray-300 font-mono bg-gray-900 p-3 rounded-md whitespace-pre-wrap">
               <code>{task.output.agentResponse}</code>
             </pre>
           </div>
        )}
      </CardContent>
    </Card>
  );
}