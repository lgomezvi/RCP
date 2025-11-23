'use client';

import { useState, useEffect } from 'react';
import Chat from "@/components/DemoChat";
import StreamingTerminal from "@/components/StreamingTerminal";
import ArmView from "@/components/arm/ArmView";
import { MESH_AXIS_MAP } from '@/components/arm/mesh-mapping';

export default function Page() {
  const [terminalText, setTerminalText] = useState('');
  const [highlightedMeshes, setHighlightedMeshes] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action) {
          setTerminalText((prevText) => prevText + data.action + '\n');
        }
        if (data.parameters && data.parameters.axis) {
          const axis = data.parameters.axis;
          const meshesToHighlight = MESH_AXIS_MAP[axis] || [];
          setHighlightedMeshes(meshesToHighlight);
        }
      } catch (error) {
        // If parsing fails, assume it's a plain text message
        setTerminalText((prevText) => prevText + event.data + '\n');
      }
    };

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-0 h-screen bg-background">
      <div className="col-span-2 border-r-2 border-input">
        <Chat />
      </div>
      <div className="grid grid-rows-2 gap-0">
        <div className="border-b-2 bg-card border-input">
          <ArmView highlightedMeshes={highlightedMeshes} />
        </div>
        <div className="flex justify-center items-center bg-card flex-cols">
          <StreamingTerminal text={terminalText} />
        </div>
      </div>
    </div>
  );
}
