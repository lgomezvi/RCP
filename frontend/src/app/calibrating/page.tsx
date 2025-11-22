'use client';

import { useChat } from '@ai-sdk/react';

export default function CalibratingPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/calibrate',
  });

  const customSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col py-12 mx-auto w-full max-w-2xl">
      <div className="overflow-y-auto flex-grow p-4 mb-4 space-y-4 rounded-lg border">
        {messages.length > 0 ? (
          messages.map(m => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <span className="flex justify-center items-center w-8 h-8 rounded-md border shadow select-none shrink-0 bg-background">
                  🤖
                </span>
              )}
              <div
                className={`rounded-lg p-3 max-w-xs md:max-w-md ${
                  m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'user' && (
                <span className="flex justify-center items-center w-8 h-8 rounded-md border shadow select-none shrink-0 bg-background">
                  👤
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            Start a conversation by typing a message below.
          </div>
        )}
      </div>

      <form onSubmit={customSubmit} className="flex items-center space-x-2 w-full">
        <input
          className="flex-1 p-2 rounded-lg border"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <button type="submit" className="p-2 text-white bg-blue-600 rounded-lg">
          Send
        </button>
      </form>
    </div>
  );
}
