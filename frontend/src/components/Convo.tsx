'use client';

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react"; 
import SendHorizontalIcon from "./SendHorizontalIcon";
import CirclePauseIcon from "./CirclePauseIcon"; 
import Visualizer from "./AudioVisualizer";  

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  type?: 'transcription' | 'final' | 'agent_response';
}


export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

// NOTE: this is the new conversation code. Do not change this.
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setIsConnected(true);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsConnected(false);
    },
    onMessage: (message) => {
      // Capture ALL messages - transcriptions, agent responses, etc.
      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        role: message.source === 'user' ? 'user' : 'agent',
        content: message.message,
        timestamp: new Date(),
        type: message.type || 'final'
      };
      
      setMessages(prev => [...prev, newMessage]);

      // Check if the message starts with <SEND> tag
      if (newMessage.role === 'agent' && newMessage.content.startsWith('<SEND>')) {
        const outlineContent = newMessage.content.substring('<SEND>'.length).trim();
        console.log('Agent sent outline for backend:', outlineContent);

        // Call the Next.js API endpoint to save the outline
        fetch('/api/save-outline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ actions: [outlineContent] }), // Assuming the outline is a single string for now
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log('Outline successfully sent to backend:', data);
            } else {
              console.error('Failed to send outline to backend:', data);
            }
          })
          .catch(error => {
            console.error('Error sending outline to backend:', error);
          });
      }
    },
    onError: (error) => console.error('Error:', error),
  });


  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

	const response = await fetch('/api/scribe-token');
	const { token } = await response.json();
      console.log('Fetched token:', token);

      // Start the conversation with your agent
      await conversation.startSession({
        // agentId: 'YOUR_AGENT_ID', // Replace with your agent ID
        userId: 'YOUR_CUSTOMER_USER_ID', // Optional field for tracking your end user IDs
        connectionType: 'webrtc', // either "webrtc" or "websocket"
	conversationToken: token,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col justify-between items-center w-full h-full bg-background">
      <div className="flex justify-between items-center p-4 w-full rounded-lg text-foreground bg-card">
        <div className={`${isConnected ? 'bg-[oklch(0.85_0.15_140)]' : 'bg-[oklch(0.25_0.005_270)]'} bg-opacity-50 rounded-md p-1 px-2 border border-white`}>
          <p className={`${isConnected ? 'text-foreground' : 'text-gray-400'}`}>• {isConnected ? 'Online' : 'Offline'}</p>
        </div>
        <button
          onClick={isConnected ? stopConversation : startConversation}
          disabled={conversation.status === 'connecting' || conversation.status === 'disconnecting'}
          className={`p-2 rounded-full ${isConnected ? 'bg-destructive text-foreground' : 'bg-primary text-foreground'} disabled:bg-muted`}
        >
          {isConnected ? <CirclePauseIcon /> : <SendHorizontalIcon />}
        </button>
      </div>

      <div className="overflow-y-auto w-full rounded h-100">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-gray-700 text-foreground' : 'bg-gray-800 text-foreground'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full">
        <Visualizer className="mx-auto w-full h-32 rounded" startVisualizerTrigger={isConnected} />
      </div> 
    </div>
  );
}

