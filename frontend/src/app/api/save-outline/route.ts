import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	console.log('--- SAVE OUTLINE ROUTE: POST request received ---');
	try {
		const { actions }: { actions: string[] } = await request.json();
		console.log('SAVE OUTLINE ROUTE: Actions received:', JSON.stringify(actions, null, 2));

		if (!actions || !Array.isArray(actions)) {
			console.error('SAVE OUTLINE ROUTE: Invalid request body. Expected { actions: string[] }');
			return NextResponse.json(
				{ success: false, message: 'Invalid request body. Expected { actions: string[] }' },
				{ status: 400 }
			);
		}

		const backendApiUrl = process.env.BACKEND_API_URL;
		console.log('SAVE OUTLINE ROUTE: Backend API URL:', backendApiUrl);

		if (!backendApiUrl) {
			console.error('SAVE OUTLINE ROUTE: BACKEND_API_URL is not defined in environment variables.');
			return NextResponse.json(
				{ success: false, message: 'Backend API URL is not configured.' },
				{ status: 500 }
			);
		}

		console.log('SAVE OUTLINE ROUTE: Sending fetch request to backend...');
		const backendResponse = await fetch(backendApiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				// Add any necessary authentication headers for your backend here
				// 'Authorization': `Bearer ${process.env.BACKEND_AUTH_TOKEN}`,
			},
			body: JSON.stringify({ "actions": actions }),
		});
		console.log('SAVE OUTLINE ROUTE: Fetch request to backend sent.');
		console.log('SAVE OUTLINE ROUTE: Backend response status:', backendResponse.status);
		console.log('SAVE OUTLINE ROUTE: Backend response ok:', backendResponse.ok);

		if (!backendResponse.ok) {
			const errorData = await backendResponse.json();
			console.error('SAVE OUTLINE ROUTE: Backend responded with an error:', backendResponse.status, errorData);
			return NextResponse.json(
				{ success: false, message: `Backend error: ${errorData.message || backendResponse.statusText}` },
				{ status: backendResponse.status }
			);
		}

		const responseData = await backendResponse.json();
		console.log('SAVE OUTLINE ROUTE: Backend response data:', JSON.stringify(responseData, null, 2));
		console.log('--- SAVE OUTLINE ROUTE: finished successfully ---');
		return NextResponse.json({ success: true, data: responseData });

	} catch (error) {
		console.error('SAVE OUTLINE ROUTE: Error in POST handler:', error);
		return NextResponse.json(
			{ success: false, message: 'Internal server error.' },
			{ status: 500 }
		);
	}
}
