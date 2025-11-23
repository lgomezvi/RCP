import { tool } from 'ai';
import { z } from 'zod';

export const sendOutline = tool({
	description: `Sends the user approved actions that have been refined to the robot`,

	parameters: z.object({
		actions: z.array(z.string()).describe("An array of strings representing robot actions, derived from the documentation. Each string can contain the action name and a corresponding degree value, for example: 'HOME_POSITIONS' or 'ROTATE_BASE 180 DEGREES'."),
	}),

	execute: async ({ actions }) => {
		console.log('--- SEND OUTLINE TOOL: execute started ---');
		console.log('SEND OUTLINE TOOL: Actions received:', JSON.stringify(actions, null, 2));

		// The endpoint must be an absolute URL when running in the edge.
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		const endpointUrl = `${baseUrl}/api/save-outline`;
		console.log('SEND OUTLINE TOOL: Endpoint URL:', endpointUrl);

		try {
			console.log('SEND OUTLINE TOOL: Sending fetch request to /api/save-outline...');
			const result = await fetch(endpointUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				// 'actions' is now available from destructuring and used in the body
				body: JSON.stringify({ actions }),
			});

			console.log('SEND OUTLINE TOOL: Fetch request sent, waiting for results...');
			console.log('SEND OUTLINE TOOL: Response status:', result.status);
			console.log('SEND OUTLINE TOOL: Response ok:', result.ok);

			if (!result.ok) {
				// Handle HTTP error statuses
				const errorText = await result.text();
				console.error('SEND OUTLINE TOOL: API returned an error:', errorText);
				throw new Error(`Failed to save outline. API returned status: ${result.status}. Body: ${errorText}`);
			}

			// Read the response body if your API returns confirmation data
			const responseData = await result.json();
			console.log('SEND OUTLINE TOOL: Response data:', JSON.stringify(responseData, null, 2));
			console.log('--- SEND OUTLINE TOOL: execute finished ---');

			return `Successfully sent the ${actions.length} approved actions to the outline endpoint. Server response: ${JSON.stringify(responseData)}`;

		} catch (error) {
			console.error('SEND OUTLINE TOOL: Error in execute function:', error);
			return `Error sending outline: ${error instanceof Error ? error.message : 'An unknown error occurred'}`;
		}
	},
});
