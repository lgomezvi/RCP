'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from "@/components/DemoChat";
import StreamingTerminal from "@/components/StreamingTerminal";
import ArmView from "@/components/arm/ArmView";
import { MESH_AXIS_MAP } from '@/components/arm/mesh-mapping';

export default function Page() {
  const [terminalText, setTerminalText] = useState('Awaiting robot commands and updates...');
  const [isTerminalPristine, setIsTerminalPristine] = useState(true);
  const [highlightedMeshes, setHighlightedMeshes] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState('Connecting');
  const ws = useRef<WebSocket | null>(null);
  const highlightTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket('ws://localhost:8000/ws');
      setWsStatus('Connecting');

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        setWsStatus('Connected');
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        setWsStatus('Disconnected');
        ws.current = null;
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('Disconnected');
      };
    }

    const messageHandler = (event: MessageEvent) => {
      // Clear any existing highlight timeout
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }

      let messageContent = '';
      try {
        const data = JSON.parse(event.data);
        console.log("Received data from server:", data);
        // Construct the message content from data
        if (data.action) {
          messageContent = data.action + '\n';
        } else {
          // Handle cases where data might not have 'action' but is still valid JSON
          messageContent = JSON.stringify(data, null, 2) + '\n';
        }
      } catch (error) {
        // If parsing fails, assume it's a plain text message
        messageContent = event.data + '\n';
      }

      if (isTerminalPristine) {
        setTerminalText(messageContent);
        setIsTerminalPristine(false);
      } else {
        setTerminalText((prevText) => prevText + messageContent);
      }

      // Handle highlighting separately
      try {
        const data = JSON.parse(event.data);
        if (data.parameters && data.parameters.axis) {
          const axis = data.parameters.axis;
          console.log("Extracted axis for highlighting:", axis);

          const meshesToHighlight = MESH_AXIS_MAP[axis] || [];
          console.log("Meshes to highlight based on axis:", meshesToHighlight);

          setHighlightedMeshes(meshesToHighlight);

          // Set a timeout to clear the highlight
          highlightTimeout.current = setTimeout(() => {
            setHighlightedMeshes([]);
          }, 5000);
        }
      } catch (error) {
        // Ignore parsing errors for highlighting
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

  }, [isTerminalPristine]); // Add isTerminalPristine to dependency array

  return (
    <div className="grid grid-cols-4 gap-0 h-screen bg-background">
      <div className="col-span-3 border-r-2 border-input">
        <Chat />
      </div>
      <div className="grid grid-rows-2 gap-0 min-w-0">
        <div className="border-b-2 bg-card border-input">
          <ArmView highlightedMeshes={highlightedMeshes} />
        </div>
        <div className="flex justify-center items-center bg-card flex-cols">
          <StreamingTerminal 
            text={terminalText} 
            wsStatus={wsStatus} 
            isPristine={isTerminalPristine} 
          />
        </div>
      </div>
    </div>
  );
}
