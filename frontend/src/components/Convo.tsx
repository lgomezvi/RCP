'use client';

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react"; 

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
    <div className="flex flex-col justify-between gap-4 items-center h-full">
      <div className="w-full max-w-md bg-gray-800 bg-opacity-75 p-4 rounded-lg text-white flex justify-between items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>

      <div className="overflow-y-auto p-4 w-full max-w-md h-64 rounded border border-gray-300">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={isConnected}
          className="py-2 px-4 text-white bg-blue-500 rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={!isConnected}
          className="py-2 px-4 text-white bg-red-500 rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>
    </div>
  );
}

