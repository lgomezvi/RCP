// hooks/useScribe.ts
import { useState, useRef, useCallback } from 'react';

export function useScribe({ onPartialChange }: { onPartialChange: (text: string) => void }) {
	const [isRecording, setIsRecording] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const processorRef = useRef<ScriptProcessorNode | null>(null);

	const startRecording = useCallback(async () => {
		try {
			const response = await fetch('/api/scribe-token', { method: 'POST' });
			const { token } = await response.json();

			const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?token=${token}`);
			wsRef.current = ws;

			ws.onopen = () => {
				setIsRecording(true);
				console.log('Scribe WebSocket: Connected');
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('Received event:', data);

				// ✅ Check for the correct event structure
				switch (data.message_type) {
					case 'partial_transcript':
						if (data.text) {
							console.log('Partial:', data.text);
							onPartialChange(data.text);
						}
						break;

					case 'committed_transcript':
						if (data.text) {
							console.log('Committed:', data.text);
							onPartialChange(data.text);
						}
						break;

					case 'session_started':
						console.log('Transcription session started');
						break;

					case 'input_error':
						console.error('Input error:', data.error);
						break;

					default:
						console.log('Unknown message type:', data.message_type, data);
				}
			};

			// Audio setup
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true
				}
			});

			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length === 0) {
				throw new Error('No audio tracks found in the media stream.');
			}
			const mediaStreamSampleRate = audioTracks[0].getSettings().sampleRate || 48000; // Default to 48000 if not available

			const targetSampleRate = 16000; // ElevenLabs expects 16kHz

			const audioContext = new AudioContext({ sampleRate: mediaStreamSampleRate });
			const source = audioContext.createMediaStreamSource(stream);
			const processor = audioContext.createScriptProcessor(4096, 1, 1);

			processor.onaudioprocess = (event) => {
				if (ws.readyState === WebSocket.OPEN) {
                    console.log('Scribe Audio Processor: Processing and sending audio chunk');
					const inputBuffer = event.inputBuffer;
					const inputData = inputBuffer.getChannelData(0); // Float32Array

					let resampledData = inputData;

					// Resample if necessary
					if (mediaStreamSampleRate !== targetSampleRate) {
						const ratio = mediaStreamSampleRate / targetSampleRate;
						const newLength = Math.round(inputData.length / ratio);
						const resampledBuffer = new Float32Array(newLength);

						// Simple linear interpolation for resampling
						for (let i = 0; i < newLength; i++) {
							const index = i * ratio;
							const floor = Math.floor(index);
							const ceil = Math.ceil(index);
							const frac = index - floor;

							const val1 = inputData[floor];
							const val2 = inputData[ceil] || inputData[floor]; // Handle end of array

							resampledBuffer[i] = val1 * (1 - frac) + val2 * frac;
						}
						resampledData = resampledBuffer;
					}

					// Convert to PCM 16-bit
					const pcmData = new Int16Array(resampledData.length);
					for (let i = 0; i < resampledData.length; i++) {
						pcmData[i] = Math.max(-32768, Math.min(32767, resampledData[i] * 32768));
					}

					// Send raw binary audio data
					ws.send(pcmData.buffer);
				}
			};

			source.connect(processor);
			processor.connect(audioContext.destination);

			// Store references for cleanup
			audioContextRef.current = audioContext;
			processorRef.current = processor;

		} catch (err) {
			console.error('Error starting scribe:', err);
			setIsRecording(false);
		}
	}, [onPartialChange]);
	const stopRecording = useCallback(() => {
		setIsRecording(false);
		wsRef.current?.close();
		if (processorRef.current) {
			processorRef.current.disconnect();
			processorRef.current = null;
		}
		if (audioContextRef.current) {
			audioContextRef.current.close();
			audioContextRef.current = null;
		}
	}, []);

	return { isRecording, startRecording, stopRecording };
}
