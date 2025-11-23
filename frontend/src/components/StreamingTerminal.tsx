"use client";

import { useState, useEffect } from 'react';

export default function StreamingTerminal() {
  const [text, setText] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      setText((prevText) => prevText + event.data + '\n');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="overflow-y-auto p-4 w-full h-full bg-gray-600">
	<h1>Hello</h1>
      <pre>{text}</pre>
    </div>
  );
}
