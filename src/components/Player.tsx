
import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../types';
import { Maximize2, Minimize2, Heart, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Volume2, Download } from 'lucide-react';

interface PlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onToggleFavorite?: (id: string) => void;
  ambienceType?: 'none' | 'rain' | 'vinyl';
  setAmbienceType?: (type: 'none' | 'rain' | 'vinyl') => void;
  ambienceVolume?: number;
  setAmbienceVolume?: (vol: number) => void;
  ambienceTracks?: Record<string, string>;
}

const Player: React.FC<PlayerProps> = ({ 
    currentTrack, 
    isPlaying, 
    onPlayPause, 
    onToggleFavorite,
    ambienceType = 'none',
    setAmbienceType,
    ambienceVolume = 0.3,
    setAmbienceVolume,
    ambienceTracks = {}
}) => {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isImmersive, setIsImmersive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const immersiveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const initVisualizer = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
  };

  const draw = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const drawFrame = () => {
      animationRef.current = requestAnimationFrame(drawFrame);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Main Progress Bar Visualizer
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const barWidth = (canvasRef.current.width / bufferLength) * 2;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvasRef.current.height;
          ctx.fillStyle = `hsla(330, 100%, 60%, ${dataArray[i] / 255 * 0.5})`;
          ctx.fillRect(x, canvasRef.current.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      }

      // Immersive Visualizer
      if (isImmersive && immersiveCanvasRef.current) {
        const ctx = immersiveCanvasRef.current.getContext('2d')!;
        const width = immersiveCanvasRef.current.width;
        const height = immersiveCanvasRef.current.height;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          const angle = (i / bufferLength) * Math.PI * 2;
          const radius = 150 + val * 0.8;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          ctx.beginPath();
          ctx.arc(x, y, 2 + val * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${330 + i}, 100%, 60%, ${val / 255})`;
          ctx.fill();
          
          // Connect to center
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `hsla(${330 + i}, 100%, 60%, ${val / 255 * 0.1})`;
          ctx.stroke();
        }
      }
    };
    drawFrame();
  };

  const handlePlayPause = () => {
    if (!audioCtxRef.current) initVisualizer();
    else if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    onPlayPause();
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = ambienceVolume;
  }, [ambienceVolume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
        if (!animationRef.current) draw();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    const updateProgress = () => {
        if (audioRef.current) setProgress((audioRef.current.currentTime / (audioRef.current.duration || 30)) * 100);
    };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current?.removeEventListener('timeupdate', updateProgress);
  }, [currentTrack]);

  return (
    <>
      {/* Immersive Visualizer Overlay */}
      {isImmersive && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500 overflow-hidden">
            <canvas 
                ref={immersiveCanvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="w-full h-full"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <img 
                    src={currentTrack?.imageUrl} 
                    className={`w-64 h-64 rounded-[3rem] shadow-2xl mb-12 border-4 border-pink-500/20 transition-transform duration-[2000ms] ${isPlaying ? 'scale-110' : 'scale-100'}`} 
                    alt="" 
                />
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{currentTrack?.title}</h2>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">{currentTrack?.mood}</p>
            </div>
            <button 
                onClick={() => setIsImmersive(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
            >
                <Minimize2 size={32} />
            </button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] pb-safe-area">
        <div className="flex items-center justify-between px-6 h-20 md:h-24 max-w-[1920px] mx-auto relative overflow-hidden">
            
            <div className="flex items-center gap-4 w-3/5 md:w-1/3 min-w-0 z-10">
                {currentTrack ? (
                <>
                    <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shadow-md border border-gray-200 dark:border-gray-700" />
                    <div className="flex flex-col justify-center overflow-hidden">
                        <span className="text-sm font-black text-gray-900 dark:text-white truncate block">{currentTrack.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{currentTrack.description}</span>
                    </div>
                    {onToggleFavorite && (
                        <button onClick={() => onToggleFavorite(currentTrack.id)} className={`hidden md:block ml-2 ${currentTrack.isFavorite ? 'text-pink-500' : 'text-gray-400'}`}>
                            <Heart size={18} fill={currentTrack.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    )}
                </>
                ) : (
                <div className="flex items-center gap-4 opacity-40">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                </div>
                )}
            </div>

            <div className="flex flex-col items-center justify-center w-auto md:w-1/3 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 z-10">
                <div className="flex items-center gap-6 md:gap-8 mb-2">
                    <button className="hidden md:block text-gray-400 hover:text-pink-500"><Shuffle size={18} /></button>
                    <button className="hidden md:block text-gray-400 hover:text-pink-500"><SkipBack size={20} /></button>
                    <button onClick={handlePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 text-white shadow-xl hover:scale-110 active:scale-90 transition-all">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </button>
                    <button className="hidden md:block text-gray-400 hover:text-pink-500"><SkipForward size={20} /></button>
                    <button className="hidden md:block text-gray-400 hover:text-pink-500"><Repeat size={18} /></button>
                </div>
                
                <div className="hidden md:flex w-full max-w-md items-center gap-3 text-[10px] text-gray-400 font-mono relative">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full group cursor-pointer relative overflow-hidden">
                        <canvas ref={canvasRef} width={400} height={10} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />
                        <div className="h-full bg-pink-500 rounded-full relative shadow-[0_0_8px_rgba(236,72,153,0.5)] z-10" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex w-1/3 items-center justify-end gap-5 z-10">
                <button onClick={() => setIsImmersive(!isImmersive)} className="text-gray-400 hover:text-pink-500 transition-colors">
                    <Maximize2 size={20} />
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
                {currentTrack && (
                    <a href={currentTrack.audioUrl} download={`${currentTrack.title}.wav`} className="text-gray-400 hover:text-pink-500"><Download size={20} /></a>
                )}
                <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-gray-400" />
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
            </div>

            <audio ref={audioRef} crossOrigin="anonymous" src={currentTrack?.audioUrl} loop />
            <audio ref={bgAudioRef} src={ambienceType !== 'none' ? ambienceTracks?.[ambienceType] : undefined} loop />
        </div>
      </footer>
    </>
  );
};

export default Player;
