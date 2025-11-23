"use client";

interface StreamingTerminalProps {
  text: string;
  wsStatus: string;
  isPristine?: boolean;
}

export default function StreamingTerminal({ text, wsStatus, isPristine = false }: StreamingTerminalProps) {
  const statusColor = {
    'Connecting': 'text-yellow-500',
    'Connected': 'text-green-500',
    'Disconnected': 'text-red-500',
  }[wsStatus] || 'text-gray-500';

  return (
    <div className="flex flex-col w-full h-full bg-card text-foreground">
      <div className="overflow-y-auto flex-grow p-4">
        <pre className={`font-mono text-left text-sm ${isPristine ? 'text-muted-foreground' : ''} whitespace-pre-wrap break-all`}>
          {text}
        </pre>
      </div>
      <div className="flex-shrink-0 p-2 border-t border-input">
        <div className="flex justify-center items-center">
          <span className={`mr-2 ${statusColor}`}>●</span>
          <span className="font-mono">WebSocket: {wsStatus}</span>
        </div>
      </div>
    </div>
  );
}
