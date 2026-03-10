
import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl: string;
  color?: string;
  height?: number;
}

const WaveformVisualizer: React.FC<WaveformProps> = ({ audioUrl, height = 96 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !audioUrl) return;
    
    let audioContext: AudioContext | null = null;

    const draw = async () => {
      try {
        const ctx = canvasRef.current!.getContext('2d');
        if (!ctx) return;

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
        
        const samples = 80; // Optimized for performance and style
        const blockSize = Math.floor(leftChannel.length / samples);
        const width = canvasRef.current!.width;
        const drawHeight = canvasRef.current!.height;
        const barWidth = width / samples;
        const gap = 3; 
        const centerY = drawHeight / 2;

        ctx.clearRect(0, 0, width, drawHeight);

        for (let i = 0; i < samples; i++) {
          const start = blockSize * i;
          let sumL = 0;
          let sumR = 0;
          let zeroCrossings = 0;

          for (let j = 0; j < blockSize; j++) {
            const idx = start + j;
            if (idx >= leftChannel.length) break;
            
            const l = leftChannel[idx];
            const r = rightChannel[idx];
            
            sumL += l * l;
            sumR += r * r;

            if (j > 0 && idx > 0) {
               const prevL = leftChannel[idx-1];
               if ((l >= 0 && prevL < 0) || (l < 0 && prevL >= 0)) {
                   zeroCrossings++;
               }
            }
          }

          const rmsL = Math.sqrt(sumL / blockSize);
          const rmsR = Math.sqrt(sumR / blockSize);
          
          // Frequency-based Hue (0 to 360)
          const zcrNorm = Math.min(1, (zeroCrossings / blockSize) * 12); 
          const hue = 320 - (zcrNorm * 180); 
          
          // Energy-based Saturation and Lightness
          // Higher RMS = more saturated, more luminous
          const sat = Math.min(100, 50 + (rmsL * 100));
          const light = Math.min(95, 40 + (rmsL * 120));

          const boost = 3.8;
          const hL = Math.min(centerY - 4, Math.max(3, rmsL * centerY * boost));
          const hR = Math.min(centerY - 4, Math.max(3, rmsR * centerY * boost));

          // Top Bars (Left Channel)
          const gradL = ctx.createLinearGradient(0, centerY, 0, centerY - hL);
          gradL.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.max(25, light - 15)}%, 0.8)`);
          gradL.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 1.0)`);
          
          ctx.save();
          // Add "glow" to energetic parts
          if (rmsL > 0.12) {
             ctx.shadowBlur = 10;
             ctx.shadowColor = `hsla(${hue}, 100%, 75%, 0.6)`;
          }
          ctx.fillStyle = gradL;
          drawRoundedRect(ctx, i * barWidth, centerY - hL - 2, barWidth - gap, hL, 3);
          ctx.restore();

          // Bottom Bars (Right Channel)
          const gradR = ctx.createLinearGradient(0, centerY, 0, centerY + hR);
          gradR.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.max(20, light - 20)}%, 0.6)`);
          gradR.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0.8)`);
          
          ctx.save();
          if (rmsR > 0.12) {
             ctx.shadowBlur = 8;
             ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.4)`;
          }
          ctx.fillStyle = gradR;
          drawRoundedRect(ctx, i * barWidth, centerY + 2, barWidth - gap, hR, 3);
          ctx.restore();
        }

      } catch (e) {
        console.error("Waveform visualization error", e);
        setError(true);
      } finally {
          if (audioContext) audioContext.close();
      }
    };

    draw();
  }, [audioUrl, height]);

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
  };

  if (error) return (
    <div className="h-full w-full flex items-center justify-center bg-gray-100/50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800/50 dark:border-gray-700">
        <span className="text-xs text-gray-400 font-mono">Visualization Error</span>
    </div>
  );

  return (
    <canvas 
        ref={canvasRef} 
        width={1000} 
        height={height} 
        className="w-full h-full object-contain" 
    />
  );
};

export default WaveformVisualizer;
