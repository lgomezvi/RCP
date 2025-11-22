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
	console.log('--- Starting Safeguard Check ---');
	try {
		// Extract the last user message for checking
		const userMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

		if (!userMessage || !userMessage.parts) {
			console.log('Safeguard: No user message or parts found. Skipping check.');
			return { is_safe: true };
		}

		// Find the text part of the message
		const textPart = userMessage.parts.find(part => part.type === 'text');

		if (!textPart) {
			console.log('Safeguard: No text part found in the message. Skipping check.');
			return { is_safe: true };
		}

		console.log('Safeguard: Checking prompt:', textPart.text);

		const client = new OpenAI({
			apiKey: process.env.SAFEGUARD_KEY,
			baseURL: "https://api.groq.com/openai/v1",
		});

		const systemPrompt = `You are a safeguard model. Your task is to determine if the user's prompt is safe. Respond with only a JSON object with two keys: "is_safe" (boolean) and "reason" (string). If the prompt is safe, set "is_safe" to true. If it is unsafe, set "is_safe" to false and provide a brief reason.`;

		const completion = await client.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: textPart.text } // Use the text from the text part
			],
			model: "openai/gpt-oss-20b", // DO NOT CHANGE
		});

		const responseContent = completion.choices[0].message.content;
		console.log('Safeguard: Raw response content:', responseContent);


		if (!responseContent) {
			console.error('Safeguard: Returned no content.');
			return { is_safe: false, reason: 'Failed to check prompt safety.' };
		}

		try {
			// The response from the LLM should be a JSON string.
			const parsedResponse = JSON.parse(responseContent);
			console.log('Safeguard: Parsed response:', parsedResponse);
			console.log('--- Safeguard Check Finished ---');
			return parsedResponse;
		} catch (error) {
			console.error('Safeguard: Failed to parse response as JSON.', error);
			return { is_safe: false, reason: 'Invalid response from safeguard.' };
		}

	} catch (error) {
		console.error('Safeguard: Error calling API.', error);
		return { is_safe: false, reason: 'Error checking prompt safety.' };
	}
}


export async function POST(req: Request) {
	try {
		// Get the prompt and messages from the request body
		const { messages }: { messages: UIMessage[] } = await req.json();

		/* 		NOTE: commented out safeguard during development. 
		 *
		 *  		// 1. Query the safeguard first
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
				} */

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
