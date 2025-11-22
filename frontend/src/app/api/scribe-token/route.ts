import { NextResponse } from 'next/server';

export async function POST() {
	const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

	if (!elevenLabsApiKey) {
		// 1. Correctly check for and handle missing API key
		return NextResponse.json({ error: 'ElevenLabs API key not configured.' }, { status: 500 });
	}

	try {
		// 2. MUST use POST method
		// 3. MUST use the correct endpoint for Scribe Real-Time Token
		const elevenLabsResponse = await fetch(
			'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
			{
				method: 'POST',
				headers: {
					'xi-api-key': elevenLabsApiKey, // Used securely on the server
					'Content-Type': 'application/json',
				},
				// 4. MUST include the required model_id in the body
				body: JSON.stringify({
					model_id: 'scribe_v2',
				}),
			}
		);

		if (!elevenLabsResponse.ok) {
			const errorDetail = await elevenLabsResponse.text();
			// Handle non-200 responses from ElevenLabs
			console.error('ElevenLabs token generation failed:', errorDetail);
			return NextResponse.json({
				error: `ElevenLabs token generation failed: ${elevenLabsResponse.status}`
			}, { status: elevenLabsResponse.status });
		}

		const data = await elevenLabsResponse.json();
		console.log('Generated ElevenLabs token:', data.token);

		// 5. Correctly return a NextResponse object containing the temporary token
		return NextResponse.json({ token: data.token });

	} catch (error) {
		console.error('Error generating scribe token:', error);
		// Use a generic error message for security
		return NextResponse.json({ error: 'Failed to generate scribe token.' }, { status: 500 });
	}
}
