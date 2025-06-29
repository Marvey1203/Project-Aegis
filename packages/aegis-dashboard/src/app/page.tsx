// packages/aegis-dashboard/src/app/page.tsx

'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col w-full h-screen max-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 shadow-lg">
        <h1 className="text-2xl font-bold">Aegis Command Center</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`p-4 rounded-lg max-w-3xl ${
                m.role === 'user' ? 'bg-blue-900 self-end' : 'bg-gray-800 self-start'
              }`}
            >
              <strong className="font-bold capitalize block mb-2">
                {m.role === 'user' ? 'Operator' : 'Janus Mission Report'}:
              </strong>
              {/* This class is essential for rendering the report correctly */}
              <div className="text-sm font-mono whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            placeholder="Enter command for Janus..."
            onChange={handleInputChange}
          />
        </form>
      </footer>
    </div>
  );
}