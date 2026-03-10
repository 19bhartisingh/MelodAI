
import React, { useEffect, useRef } from 'react';

interface SpectrogramProps {
  analyzer: AnalyserNode;
}

const Spectrogram: React.FC<SpectrogramProps> = ({ analyzer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const render = () => {
      analyzer.getByteFrequencyData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Spotify style pink gradient based on frequency
        const hue = 320 + (i / bufferLength) * 40; 
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${dataArray[i] / 255})`;
        
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [analyzer]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={150} 
      className="w-full h-32 rounded-xl bg-gray-950 border border-gray-800"
    />
  );
};

export default Spectrogram;
