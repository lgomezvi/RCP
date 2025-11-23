import { tool } from 'ai';
import { z } from 'zod';

export const sendCommand = tool({
	description: `Sends the user approved actions to the robot`,

	parameters: z.object({
		actions: z.array(z.string()).describe("An array of strings representing robot actions, derived from the documentation. Each string can contain the action name and a corresponding degree value, for example: 'HOME_POSITIONS' or 'ROTATE_BASE 180 DEGREES'."),
	}),

	execute: async ({ actions }) => {
		console.log('--- SEND COMMAND TOOL: execute started ---');
		console.log('SEND COMMAND TOOL: Actions received:', JSON.stringify(actions, null, 2));

		// The endpoint must be an absolute URL when running in the edge.
		const endpointUrl = `http://localhost:8000/command`;
		console.log('SEND COMMAND TOOL: Endpoint URL:', endpointUrl);

		try {
			console.log('SEND COMMAND TOOL: Sending fetch request to /command...');
			const result = await fetch(endpointUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				// 'actions' is now available from destructuring and used in the body
				body: JSON.stringify({ actions }),
			});

			console.log('SEND COMMAND TOOL: Fetch request sent, waiting for results...');
			console.log('SEND COMMAND TOOL: Response status:', result.status);
			console.log('SEND COMMAND TOOL: Response ok:', result.ok);

			if (!result.ok) {
				// Handle HTTP error statuses
				const errorText = await result.text();
				console.error('SEND COMMAND TOOL: API returned an error:', errorText);
				throw new Error(`Failed to send command. API returned status: ${result.status}. Body: ${errorText}`);
			}

			// Read the response body if your API returns confirmation data
			const responseData = await result.json();
			console.log('SEND COMMAND TOOL: Response data:', JSON.stringify(responseData, null, 2));
			console.log('--- SEND COMMAND TOOL: execute finished ---');

			return `Successfully sent the ${actions.length} approved actions to the command endpoint. Server response: ${JSON.stringify(responseData)}`;

		} catch (error) {
			console.error('SEND COMMAND TOOL: Error in execute function:', error);
			return `Error sending command: ${error instanceof Error ? error.message : 'An unknown error occurred'}`;
		}
	},
});
