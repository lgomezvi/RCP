"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

const Visualizer = ({ className }: { className?: string }) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const drawVisualization = useCallback(() => {
    animationFrameIdRef.current = requestAnimationFrame(drawVisualization);

    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !analyser || !dataArray) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    analyser.getByteFrequencyData(dataArray); // Get frequency data

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT); // Clear canvas
    canvasCtx.fillStyle = 'rgb(0, 0, 0)'; // Background color
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] / 2; // Scale height

      canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`; // Bar color
      canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1; // Space between bars
    }
  }, [analyserRef, canvasRef, dataArrayRef]); // Add dependencies

  const setupAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.connect(audioContext.destination); // Connect to destination to hear yourself

      analyser.fftSize = 256; // Controls the number of frequency bins
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsRecording(true);
      drawVisualization();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
    }
  }, [drawVisualization]); // Add drawVisualization as a dependency

  const stopAudioContext = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    setupAudioContext();
    return () => {
      stopAudioContext();
    };
  }, [setupAudioContext, stopAudioContext]);

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        <button onClick={stopAudioContext} disabled={!isRecording} className="py-2 px-4 bg-red-500 text-white rounded">
          Stop Visualizer
        </button>
      </div>
      {isRecording && (
        <canvas ref={canvasRef} width={500} height={75} style={{ border: '1px solid #f76565' }} />
      )}
    </div>
  );
};

export default Visualizer;
