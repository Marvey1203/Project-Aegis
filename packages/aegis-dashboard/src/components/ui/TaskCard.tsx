import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define the shape of a Task object for TypeScript
export interface Task {
  id: string;
  description: string;
  agent: string;
  status: 'pending' | 'awaiting_human_approval' | 'completed' | 'failed';
  dependencies?: string[];
  output?: any;
}

// Map statuses to Badge variants for color-coding
const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'pending': 'secondary',
  'awaiting_human_approval': 'default',
  'completed': 'outline',
  'failed': 'destructive',
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{task.description}</CardTitle>
          <Badge variant={statusVariantMap[task.status] || 'secondary'}>
            {task.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          Agent: {task.agent} | ID: {task.id.substring(0, 8)}
        </CardDescription>
      </CardHeader>
      {task.output?.agentResponse && (
        <CardContent>
          <p className="text-sm text-gray-300 font-mono bg-gray-900 p-2 rounded">
            {task.output.agentResponse}
          </p>
        </CardContent>
      )}
    </Card>
  );
}