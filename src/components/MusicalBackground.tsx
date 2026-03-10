
import React, { useEffect, useState } from 'react';
import { Music, Music2, Mic, Headphones, Disc, Speaker, Radio, Guitar, Drum, Piano, Waves, Wind, Zap, Bell, Volume2, Mic2, Music3, Music4, PlayCircle } from 'lucide-react';

const ICONS = [Music, Music2, Music3, Music4, Mic, Mic2, Headphones, Disc, Speaker, Radio, Guitar, Drum, Piano, Waves, Wind, Zap, Bell, Volume2, PlayCircle];

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  Icon: React.ElementType;
  rotation: number;
  opacity: number;
  swayX: number;
  swayY: number;
  depth: number;
}

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

const MusicalBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const instrumentCount = 45;
    const newParticles: Particle[] = [];
    for (let i = 0; i < instrumentCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * -120,
        duration: 40 + Math.random() * 80,
        size: 16 + Math.random() * 32,
        Icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        rotation: Math.random() * 360,
        opacity: 0.1 + Math.random() * 0.25,
        swayX: (Math.random() - 0.5) * 200,
        swayY: (Math.random() - 0.5) * 150,
        depth: Math.random(),
      });
    }
    setParticles(newParticles);

    const bubbleCount = 35;
    const newBubbles: Bubble[] = [];
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100,
        size: 3 + Math.random() * 8,
        duration: 12 + Math.random() * 20,
        delay: Math.random() * -25
      });
    }
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000 bg-sky-50 dark:bg-[#020617]">
      {/* 1. Base Aquatic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-blue-100 to-white dark:from-[#0a1e3d] dark:via-[#040d1a] dark:to-[#01040a] opacity-100 transition-colors duration-1000"></div>
      
      {/* 2. Light Shafts (God Rays) */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden opacity-40 dark:opacity-20">
        <div className="absolute top-[-30%] left-[15%] w-[45vw] h-[250vh] bg-gradient-to-b from-white/40 dark:from-cyan-400/30 via-transparent to-transparent blur-[120px] -rotate-[25deg] animate-ray-sway-slow"></div>
        <div className="absolute top-[-40%] left-[55%] w-[30vw] h-[280vh] bg-gradient-to-b from-white/30 dark:from-blue-400/20 via-transparent to-transparent blur-[140px] rotate-[15deg] animate-ray-sway-fast"></div>
      </div>

      {/* 3. Surface Caustics */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay dark:mix-blend-screen pointer-events-none">
        <div className="absolute inset-[-100%] bg-[url('https://www.transparenttextures.com/patterns/water.png')] animate-water-surface scale-150"></div>
      </div>

      {/* 4. Vignette / Depth Filter */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.1)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] transition-colors duration-1000"></div>

      {/* 5. Bubbles */}
      {bubbles.map(b => (
        <div
          key={`bubble-${b.id}`}
          className="absolute rounded-full bg-white/20 dark:bg-cyan-100/10 border border-white/10 backdrop-blur-[1px]"
          style={{
            left: `${b.x}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            bottom: '-20px',
            animation: `aquaticRise ${b.duration}s ease-in infinite`,
            animationDelay: `${b.delay}s`,
            filter: `blur(${b.size > 5 ? '1px' : '0px'})`
          }}
        />
      ))}

      {/* 6. Floating Musical Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transition-opacity duration-1000"
          style={{
            left: `${p.x}%`,
            top: '120%',
            opacity: 0,
            color: `rgba(${120 + (p.depth * 40)}, ${180 + (p.depth * 30)}, ${255}, ${p.opacity})`,
            filter: `blur(${p.depth * 5}px)`,
            animation: `aquaticFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            zIndex: Math.floor((1 - p.depth) * 10),
            // @ts-ignore
            '--p-sway-x': `${p.swayX}px`,
            '--p-sway-y': `${p.swayY}px`,
            '--p-opacity': p.opacity,
            '--p-rotation': `${p.rotation}deg`
          }}
        >
          <p.Icon size={p.size} strokeWidth={0.5 + (1 - p.depth)} className="dark:text-cyan-300 text-blue-500" />
        </div>
      ))}

      <style>{`
        @keyframes aquaticFloat {
          0% { transform: translateY(0) translateX(0) rotate(var(--p-rotation)); opacity: 0; }
          15% { opacity: var(--p-opacity); }
          50% { transform: translateY(-75vh) translateX(var(--p-sway-x)) rotate(calc(var(--p-rotation) + 45deg)); }
          85% { opacity: var(--p-opacity); }
          100% { transform: translateY(-150vh) translateX(calc(var(--p-sway-x) * 0.3)) rotate(calc(var(--p-rotation) + 180deg)); opacity: 0; }
        }

        @keyframes aquaticRise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-60vh) translateX(15px); }
          100% { transform: translateY(-130vh) translateX(-5px); opacity: 0; }
        }

        @keyframes ray-sway-slow {
          0%, 100% { transform: rotate(-25deg) translateX(0); opacity: 0.4; }
          50% { transform: rotate(-22deg) translateX(40px); opacity: 0.6; }
        }

        @keyframes ray-sway-fast {
          0%, 100% { transform: rotate(15deg) translateX(0); opacity: 0.3; }
          50% { transform: rotate(18deg) translateX(-30px); opacity: 0.5; }
        }

        @keyframes water-surface {
          0% { background-position: 0 0; }
          100% { background-position: 800px 800px; }
        }
      `}</style>
    </div>
  );
};

export default MusicalBackground;
