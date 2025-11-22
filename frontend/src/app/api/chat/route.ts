import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import OpenAI from "openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Set the runtime to edge
export const runtime = 'edge';

// Create an OpenRouter provider instance.
// It automatically uses the OPENROUTER_API_KEY from your .env.local file.
const openrouter = createOpenRouter();

// Helper function to query the safeguard API
async function checkSafeguard(messages: UIMessage[]) {
	try {
		// Extract the last user message for checking
		const userMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

		if (!userMessage) {
			// If there's no user message, consider it safe by default
			return { is_safe: true };
		}

		const client = new OpenAI({
			apiKey: process.env.SAFEGUARD_KEY,
			baseURL: "https://api.groq.com/openai/v1",

		})

		const response = await client.responses.create({
			model: "openai/gpt-oss-20b",
			input: , # TODO: make a prompt here!

		});
		const response = await fetch('https://api.grok.com/v1/safeguard', { // Replace with your actual Grok API endpoint
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.SAFEGUARD_KEY}`,
			},
			body: JSON.stringify({ prompt: userMessage.content }),
		});

		if (!response.ok) {
			console.error('Safeguard API returned an error:', response.status, await response.text());
			// Default to unsafe if the API fails
			return { is_safe: false, reason: 'Failed to check prompt safety.' };
		}

		return await response.json();
	} catch (error) {
		console.error('Error calling safeguard API:', error);
		return { is_safe: false, reason: 'Error checking prompt safety.' };
	}
}


export async function POST(req: Request) {
	try {
		// Get the prompt and messages from the request body
		const { messages }: { messages: UIMessage[] } = await req.json();

		// 1. Query the safeguard first
		const safeguardResult = await checkSafeguard(messages);

		// 2. Check the result from the safeguard
		if (!safeguardResult.is_safe) {
			// 3a. If it's not safe, return a 400 response
			return new Response(JSON.stringify({
				error: 'Your request could not be processed as it was deemed unsafe.',
				reason: safeguardResult.reason,
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 3b. If it is safe, proceed to query the main LLM
		const result = await streamText({
			model: openrouter.chat('google/gemini-2.5-flash-lite-preview-09-2025'),
			messages: convertToModelMessages(messages), // Pass the messages array to the model
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
