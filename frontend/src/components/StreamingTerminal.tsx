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
    <div className="relative w-full h-full">
      <div className="overflow-y-auto absolute inset-0 p-4 bg-gray-600">
        <pre className="mx-auto w-full leading-6 text-center text-white text-md">{text}</pre>
      </div>
      <div className="absolute bottom-0 py-4 mx-auto w-full h-1/6 text-center bg-white">
				MODEL STATUS GOES HERE 
      </div>
    </div>
  );
}
