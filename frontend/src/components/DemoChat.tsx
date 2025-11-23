'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useCallback } from 'react';
import { DefaultChatTransport } from 'ai';

// A new component for the welcome screen
const WelcomeScreen = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-foreground">
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold mb-2">Reptile Calibration AI</h2>
      <p className="mb-6">Start the conversation by asking a question below.</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 border border-input rounded-lg">
          <h3 className="font-semibold mb-1">Example Prompt 1</h3>
          <p>What are the key differences between a python and a boa?</p>
        </div>
        <div className="p-4 border border-input rounded-lg">
          <h3 className="font-semibold mb-1">Example Prompt 2</h3>
          <p>Tell me about the habitat of the Komodo dragon.</p>
        </div>
      </div>
    </div>
  </div>
);

const StatusDisplay = ({ status }: { status: string }) => {
  const statusStyles = {
    ready: { text: 'Agent Ready', bg: 'text-secondary' },
    submitted: { text: 'Sent', bg: 'text-primary' },
    error: { text: 'Error', bg: 'text-destructive' },
  };

  const currentStatus = statusStyles[status] || statusStyles.ready;

  return (
    <h1 className={`text-xl font-bold text-foreground text-center rounded-md ${currentStatus.bg}`}>
      {currentStatus.text}
    </h1>
  );
};

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: '/api/demo',
		}),
	});
  const [chatStatus, setChatStatus] = useState('ready');

  const onPartialChange = useCallback((text: string) => {
    console.log('Transcribed speech:', text);
    setInput(text);
  }, []);

 useEffect(() => {
    setChatStatus(status);
  }, [status]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-4 bg-card rounded-lg">
        <StatusDisplay status={chatStatus} />
      </header>

      {/* Chat message area */}
      <main className="overflow-y-auto flex-1 p-6">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="space-y-6">
            {messages.map(message => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role !== 'user' && (
                  <div className="flex justify-center items-center w-8 h-8 text-xl bg-card text-foreground rounded-full">🤖</div>
                )}
                <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-primary text-foreground rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'}`}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <p key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">{part.text}</p>;
                    }
                  })}
                </div>
                {message.role === 'user' && (
                  <div className="flex justify-center items-center w-8 h-8 text-xl bg-primary text-foreground rounded-full">👤</div>
                )}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="flex gap-3 justify-start">
                <div className="flex justify-center items-center w-8 h-8 text-xl bg-card text-foreground rounded-full">🤖</div>
                <div className="py-3 px-4 max-w-lg bg-secondary text-foreground rounded-2xl rounded-bl-none shadow-md">
                  <p className="text-sm animate-pulse">...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input form area */}
      <footer className="p-4 mt-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!input) return;
            sendMessage({ text: input });
            setInput('');
          }}
          className="flex items-center mx-auto max-w-2xl"
        >
          <input
            className="flex-1 p-4 rounded-lg border border-input text-foreground bg-card focus:outline-none"
            value={input}
            placeholder="Ask me anything..."
            onChange={e => setInput(e.currentTarget.value)}
          />
          <button 
            type="submit" 
            className="py-3 px-5 ml-3 bg-primary text-foreground rounded-full opacity-75 transition-colors hover:bg-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:bg-muted" 
            disabled={status !== 'ready' || !input}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}