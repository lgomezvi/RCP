'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useCallback } from 'react';
import { DefaultChatTransport } from 'ai';
import { TableOfContents } from 'lucide-react';
import robotConfig from '../../robot.json';

// Overlay for displaying robot configuration
const ConfigOverlay = ({ isOpen, onClose, configData }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-60" 
      onClick={onClose}
    >
      <div 
        className="overflow-y-auto p-6 w-full max-w-4xl rounded-lg shadow-2xl bg-card text-foreground max-h-[80vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Robot Configuration</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
        </div>
        
        <h3 className="mt-4 mb-2 text-lg font-semibold">Axes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-2">Axis</th>
                <th className="p-2">Pin</th>
                <th className="p-2">Min Angle</th>
                <th className="p-2">Max Angle</th>
                <th className="p-2">Default Angle</th>
              </tr>
            </thead>
            <tbody>
              {configData.axes.map(axis => (
                <tr key={axis.axis} className="border-b border-input">
                  <td className="p-2 font-mono">{axis.axis}</td>
                  <td className="p-2">{axis.servo_pin}</td>
                  <td className="p-2">{axis.angle_deg.min}</td>
                  <td className="p-2">{axis.angle_deg.max}</td>
                  <td className="p-2">{axis.angle_deg.default}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Actions</h3>
        <div className="space-y-4">
          {configData.actions.map(action => (
            <div key={action.action} className="p-3 text-xs rounded-md bg-muted">
              <p className="mb-2 font-mono font-bold">{action.action}</p>
              <pre className="font-mono whitespace-pre-wrap break-all">{JSON.stringify(action.parameters, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// A new component for the welcome screen
const WelcomeScreen = ({ onPromptClick }: { onPromptClick: (prompt: string) => void }) => {
  const prompts = [
    	"What can you do?",
    	"How do you know what the best course of action for the robot is?",
    	"Can you do a salute?",
	"Tell me more about Reptile and how it works"
  ];

  return (
    <div className="flex flex-col justify-center items-center h-full text-center text-foreground">
      <div className="max-w-2xl">
        <h2 className="mb-2 text-5xl font-semibold">Reptile Control Panel</h2>
        <p className="my-6">Mess around with Reptile here.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="p-4 mt-4 rounded-lg transition-colors cursor-pointer hover:bg-muted"
              onClick={() => onPromptClick(prompt)}
            >
              <p>{prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatusDisplay = ({ status }: { status: string }) => {
  const statusStyles = {
    ready: { text: 'Ready', bg: 'h-full p-4 text-[oklch(0.263 0.0563 163.64)] bg-[oklch(0.2627_0.0574_162.26)]' },
    submitted: { text: 'Sent', bg: 'bg-primary' },
    error: { text: 'Error', bg: 'bg-destructive' },
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
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

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
      <header className="flex justify-between items-center p-4 rounded-lg bg-card">
        <div className="flex-1"></div> {/* Spacer */}
        <div className="flex-1 text-center">
          <StatusDisplay status={chatStatus} />
        </div>
        <div className="flex flex-1 justify-end">
          <button onClick={() => setIsOverlayOpen(true)} className="p-2 rounded-md hover:bg-muted">
            <TableOfContents className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Chat message area */}
      <main className="overflow-y-auto flex-1 p-6">
        {messages.length === 0 ? (
          <WelcomeScreen onPromptClick={setInput} />
        ) : (
          <div className="space-y-6">
            {messages.map(message => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role !== 'user' && (
                  <div className="flex justify-center items-center w-8 h-8 text-xl rounded-full bg-card text-foreground">🤖</div>
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
                  <div className="flex justify-center items-center w-8 h-8 text-xl rounded-full bg-primary text-foreground">👤</div>
                )}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="flex gap-3 justify-start">
                <div className="flex justify-center items-center w-8 h-8 text-xl rounded-full bg-card text-foreground">🤖</div>
                <div className="py-3 px-4 max-w-lg rounded-2xl rounded-bl-none shadow-md bg-secondary text-foreground">
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
            className="flex-1 p-4 rounded-lg border focus:outline-none border-input text-foreground bg-card"
            value={input}
            placeholder="Ask me anything..."
            onChange={e => setInput(e.currentTarget.value)}
          />
          <button 
            type="submit" 
            className="py-3 px-5 ml-3 rounded-full opacity-75 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none bg-primary text-foreground hover:bg-primary focus:ring-primary disabled:bg-muted" 
            disabled={status !== 'ready' || !input}
          >
            Send
          </button>
        </form>
      </footer>
      
      <ConfigOverlay 
        isOpen={isOverlayOpen} 
        onClose={() => setIsOverlayOpen(false)} 
        configData={robotConfig} 
      />
    </div>
  );
}
