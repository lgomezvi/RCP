import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
	description: `Get the current weather conditions and temperature for a specific city.`,

	inputSchema: z.object({
		city: z.string().describe('The city name for weather lookup'),
	}),

	execute: async ({ city }) => {
		// For demo: use a simple city-to-coordinates mapping
		// In production, you'd use a geocoding API
		const cityCoordinates: Record<string, { lat: number; lon: number }> = {
			'san francisco': { lat: 37.7749, lon: -122.4194 },
			'new york': { lat: 40.7128, lon: -74.006 },
			london: { lat: 51.5074, lon: -0.1278 },
			tokyo: { lat: 35.6762, lon: 139.6503 },
			paris: { lat: 48.8566, lon: 2.3522 },
		};

		const coords = cityCoordinates[city.toLowerCase()] ||
			cityCoordinates['new york']; // Default fallback

		// Call the free Open-Meteo weather API (no key needed!)
		const response = await fetch(
			`https://api.open-meteo.com/v1/forecast?` +
			`latitude=${coords.lat}&longitude=${coords.lon}&` +
			`current=temperature_2m,weathercode&timezone=auto`
		);

		const weatherData = await response.json();

		return {
			city,
			temperature: weatherData.current.temperature_2m,
			weatherCode: weatherData.current.weathercode,
		};
	},
});
