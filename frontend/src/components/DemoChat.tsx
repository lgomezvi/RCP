'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

// A new component for the welcome screen
const WelcomeScreen = () => (
  <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 dark:text-gray-400">
    <div className="max-w-md">
      <h2 className="mb-2 text-2xl font-semibold">Reptile Calibration AI</h2>
      <p className="mb-6">Start the conversation by asking a question below.</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-lg border dark:border-gray-600">
          <h3 className="mb-1 font-semibold">Example Prompt 1</h3>
          <p>What are the key differences between a python and a boa?</p>
        </div>
        <div className="p-4 rounded-lg border dark:border-gray-600">
          <h3 className="mb-1 font-semibold">Example Prompt 2</h3>
          <p>Tell me about the habitat of the Komodo dragon.</p>
        </div>
      </div>
    </div>
  </div>
);

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white">Reptile Calibration</h1>
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
                  <div className="flex justify-center items-center w-8 h-8 text-xl bg-gray-300 rounded-full dark:bg-gray-600">🤖</div>
                )}
                <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'}`}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <p key={`${message.id}-${i}`} className="text-sm whitespace-pre-wrap">{part.text}</p>;
                    }
                  })}
                </div>
                {message.role === 'user' && (
                  <div className="flex justify-center items-center w-8 h-8 text-xl text-white bg-blue-500 rounded-full">👤</div>
                )}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="flex gap-3 justify-start">
                <div className="flex justify-center items-center w-8 h-8 text-xl bg-gray-300 rounded-full dark:bg-gray-600">🤖</div>
                <div className="py-3 px-4 max-w-lg bg-white rounded-2xl rounded-bl-none shadow-md dark:text-gray-200 dark:bg-gray-700">
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
            className="flex-1 p-3 rounded-lg border transition-shadow dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
            value={input}
            placeholder="Ask me anything..."
            onChange={e => setInput(e.currentTarget.value)}
          />
          <button 
            type="submit" 
            className="py-3 px-5 ml-3 text-white bg-blue-600 rounded-full opacity-75 transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-gray-500" 
            disabled={status !== 'ready' || !input}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
