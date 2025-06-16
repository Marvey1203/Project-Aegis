"use strict";
// In packages/aegis-dashboard/src/components/task-card.tsx
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCard = TaskCard;
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
// Status variant map remains the same
const statusVariantMap = {
    'pending': 'secondary',
    'awaiting_human_approval': 'default',
    'completed': 'outline',
    'failed': 'destructive',
};
// Helper function to intelligently render the task input
const renderTaskInput = (input) => {
    if (!input)
        return "No input provided.";
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
function TaskCard({ task }) {
    // Defensive check for the task object itself
    if (!task) {
        return null;
    }
    return (<card_1.Card className="bg-gray-800 border-gray-700 text-white mb-4">
      <card_1.CardHeader>
        <div className="flex justify-between items-center">
          <card_1.CardTitle className="text-lg">{task.description || "Loading task..."}</card_1.CardTitle>
          {/* CRITICAL FIX: Add a check to ensure task.status exists before rendering */}
          {task.status && (<badge_1.Badge variant={statusVariantMap[task.status] || 'secondary'}>
              {task.status.replace(/_/g, ' ').toUpperCase()}
            </badge_1.Badge>)}
        </div>
        <card_1.CardDescription className="text-gray-400">
          Agent: {task.agent} | ID: {task.id?.substring(0, 8) || '...'}
        </card_1.CardDescription>
      </card_1.CardHeader>
      
      <card_1.CardContent>
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
        {task.output?.agentResponse && (<div>
             <h4 className="text-sm font-semibold text-gray-400 mb-1">Agent Output:</h4>
             <pre className="text-sm text-gray-300 font-mono bg-gray-900 p-3 rounded-md whitespace-pre-wrap">
               <code>{task.output.agentResponse}</code>
             </pre>
           </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
