// packages/aegis-dashboard/src/components/ui/LiveLog.tsx

"use client";

// Define a type for our log messages for type safety
export interface LogMessage {
  type: string;
  message: string;
  workflowId?: string;
  timestamp: string;
}

export function LiveLog({ logs, isConnected }: { logs: LogMessage[], isConnected: boolean }) {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
      <div className="border-b border-gray-700 pb-2 mb-2">
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          ● {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="flex flex-col-reverse">
        {logs.slice().reverse().map((log, index) => (
          <div key={index} className="whitespace-pre-wrap">
            <span className="text-gray-500 mr-2">{log.timestamp}</span>
            <span className={log.type === 'log' ? 'text-cyan-400' : 'text-yellow-400'}>
              [{log.workflowId ? log.workflowId.substring(0, 13) : 'SYSTEM'}]
            </span>
            <span className="ml-2">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}