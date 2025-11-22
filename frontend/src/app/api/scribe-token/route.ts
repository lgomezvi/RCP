import { NextResponse } from 'next/server';

// app/api/conversation-token/route.ts
export async function GET() {
	const response = await fetch(
		`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${process.env.AGENT_ID}`,
		{
			headers: {
				'xi-api-key': process.env.ELEVENLABS_API_KEY, // Keep this secret!
			}
		}
	);

	const body = await response.json();
	console.log('Elevenlabs API response body:', body);
	console.log('Elevenlabs API token:', body.token);
	return NextResponse.json({ token: body.token });
}
