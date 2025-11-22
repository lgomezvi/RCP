'use client';

import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react"; 


export default function Conversation() {

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
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
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="py-2 px-4 text-white bg-blue-500 rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="py-2 px-4 text-white bg-red-500 rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}

