"use client";

interface StreamingTerminalProps {
  text: string;
}

export default function StreamingTerminal({ text }: StreamingTerminalProps) {
  return (
    <div className="overflow-y-auto p-4 w-full h-full bg-red-700 bg-card text-foreground">
      <pre className="font-bold text-center text:md">{text}</pre>
    </div>
  );
}
