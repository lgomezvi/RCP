// hooks/useScribe.ts
import { useState, useRef, useCallback } from 'react';

export function useScribe({ onPartialChange }: { onPartialChange: (text: string) => void }) {
	const [isRecording, setIsRecording] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);

	const startRecording = useCallback(async () => {
		try {
			// 1. Get a secure temporary token from your Next.js backend
			const response = await fetch('/api/scribe-token', { method: 'POST' });
			const { token } = await response.json();

			// 2. Connect to ElevenLabs Realtime WebSocket
			//wss://api.elevenlabs.io/v1/speech-to-text/realtime
			const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?token=${token}`);
			wsRef.current = ws;

			ws.onopen = () => {
				setIsRecording(true);
				console.log('Connected to Scribe');
			};

			// 3. Handle incoming text
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				// 'partial' events give you the current streaming text
				// 'final' events commit the text. 
				// For the chat bar, we just want to update the input with whatever is current.
				if (data.type === 'transcript' && data.text) {
					onPartialChange(data.text);
				}
			};

			// 4. Capture Microphone Audio
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
			// Note: In production, ensure you convert audio to the format ElevenLabs expects (16kHz PCM typically).
			// For this example, we assume the backend or standard connection handles it, or use a library like RecordRTC.

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
					ws.send(event.data);
				}
			};

			mediaRecorder.start(100); // slice audio every 100ms
			mediaRecorderRef.current = mediaRecorder;

		} catch (err) {
			console.error('Error starting scribe:', err);
			setIsRecording(false);
		}
	}, [onPartialChange]);

	const stopRecording = useCallback(() => {
		setIsRecording(false);
		wsRef.current?.close();
		mediaRecorderRef.current?.stop();
	}, []);

	return { isRecording, startRecording, stopRecording };
}
