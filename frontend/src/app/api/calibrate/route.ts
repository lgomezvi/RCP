import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = 'edge';

// Create an OpenRouter provider instance.
// It automatically uses the OPENROUTER_API_KEY from your .env.local file.
const openrouter = createOpenRouter();

export async function POST(req: Request) {
  try {
    // Get the prompt and messages from the request body
    const { messages } = await req.json();

    const result = await streamText({
      model: openrouter.chat('anthropic/claude-3.5-sonnet'),
      messages, // Pass the messages array to the model
    });

    // Respond with the stream
    return result.toUIMessageStreamResponse();

  } catch (error) {
    // For debugging, log the error to the server console
    console.error(error);

    if (error instanceof Error && error.name === 'APIError') {
      return new Response(JSON.stringify({ error: error.message }), {
        status: (error as any).status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'An unknown error occurred' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }
}