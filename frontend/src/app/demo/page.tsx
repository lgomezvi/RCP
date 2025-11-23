'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from "@/components/DemoChat";
import StreamingTerminal from "@/components/StreamingTerminal";
import ArmView from "@/components/arm/ArmView";
import { MESH_AXIS_MAP } from '@/components/arm/mesh-mapping';

export default function Page() {
  const [terminalText, setTerminalText] = useState('');
  const [highlightedMeshes, setHighlightedMeshes] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const highlightTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket('ws://localhost:8000/ws');

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        ws.current = null;
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    const messageHandler = (event: MessageEvent) => {
      // Clear any existing highlight timeout
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }

      try {
        const data = JSON.parse(event.data);
        console.log("Received data from server:", data);

        if (data.action) {
          setTerminalText((prevText) => prevText + data.action + '\n');
        }
        if (data.parameters && data.parameters.axis) {
          const axis = data.parameters.axis;
          console.log("Extracted axis for highlighting:", axis);

          const meshesToHighlight = MESH_AXIS_MAP[axis] || [];
          console.log("Meshes to highlight based on axis:", meshesToHighlight);

          setHighlightedMeshes(meshesToHighlight);

          // Set a timeout to clear the highlight
          highlightTimeout.current = setTimeout(() => {
            setHighlightedMeshes([]);
          }, 500000);
        }
      } catch (error) {
        // If parsing fails, assume it's a plain text message
        setTerminalText((prevText) => prevText + event.data + '\n');
      }
    };

    if (ws.current) {
      ws.current.onmessage = messageHandler;
    }

    // Cleanup timeout on component unmount
    return () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
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
