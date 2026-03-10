
import { useState, useEffect, useRef } from 'react';
import { 
  Wand2, RefreshCw, Sparkles, Music, ChevronDown, ChevronUp, 
  Globe, Gauge, Layers2, SlidersHorizontal, Mic, Square, Trash2, AudioWaveform,
  Layers, Info, X, Lightbulb, Clock, Zap
} from 'lucide-react';
import { WORLD_INSTRUMENTS } from '../constants.ts';
import { GenerationParams } from '../types.ts';
import { enhancePrompt } from '../services/geminiService.ts';

interface GeneratorPanelProps {
  onGenerate: (prompts: string[], mood: string, params: GenerationParams) => Promise<void>;
  isGenerating: boolean;
  prefillPrompt?: string | null;
  onClearPrefill?: () => void;
  params: GenerationParams;
  setParams: (params: GenerationParams) => void;
}

export default function GeneratorPanel({ 
  onGenerate, 
  isGenerating, 
  prefillPrompt, 
  onClearPrefill, 
  params, 
  setParams 
}: GeneratorPanelProps) {
  const [mood, setMood] = useState<string>(params.mood || 'world');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [worldMode, setWorldMode] = useState('Major/Minor');

  // Audio Input States
  const [isRecording, setIsRecording] = useState(false);
  const [audioInput, setAudioInput] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const setPrompt = (p: string) => {
    setParams({ ...params, prompt: p });
  };

  const handleInstrumentToggle = (inst: string) => {
    setInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioInput(base64);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording failed", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleEnhance = async () => {
    if (!params.prompt || params.prompt.length < 5) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhancePrompt(params.prompt);
        setPrompt(enhanced);
    } catch (e) {
        console.error("Enhancement failed", e);
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleGenerateClick = async () => {
    const finalPrompt = `${params.prompt}. Scale: ${worldMode}. Instruments: ${instruments.join(', ')}`;
    onGenerate([finalPrompt], mood, {
        ...params,
        prompt: finalPrompt,
        mood,
        instruments: instruments.join(', '),
        audioInput: audioInput || undefined
    });
  };

  const handleVariationsClick = async () => {
    const styles = ["Cinematic", "Electronic", "Acoustic"];
    const baseFinalPrompt = `${params.prompt}. Scale: ${worldMode}. Instruments: ${instruments.join(', ')}`;
    const prompts = styles.map(style => `${baseFinalPrompt}. Style variation: ${style}.`);
    
    onGenerate(prompts, mood, {
        ...params,
        prompt: baseFinalPrompt,
        mood,
        instruments: instruments.join(', '),
        audioInput: audioInput || undefined
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const ParamSlider = ({ label, value, min, max, step, onChange, tooltip }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center group/tooltip relative">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                {label}
            </span>
            <span className="text-[10px] font-mono text-pink-500 font-bold">{value}</span>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[9px] p-2 rounded shadow-xl w-48 z-50 border border-gray-700">
                {tooltip}
            </div>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none accent-pink-500 cursor-pointer"
        />
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 max-w-6xl mx-auto mb-20 shadow-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-6 duration-500 relative">
      
      {showInfo && (
        <div className="absolute inset-0 z-50 bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
          <button onClick={() => setShowInfo(false)} className="absolute top-8 right-8 text-gray-400 hover:text-pink-500 transition-colors">
            <X size={28} />
          </button>
          <div className="max-w-3xl text-center space-y-8">
            <div className="bg-pink-500 w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-pink-500/30 mb-4">
              <Lightbulb size={40} />
            </div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Guide: Efficiency Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <h4 className="font-black text-pink-500 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Instant Results
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Our optimized Flash engine targets 20-30s generation. Be specific with textures to help the engine converge faster.</p>
              </div>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <h4 className="font-black text-pink-500 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Power Users
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Press <kbd className="bg-gray-200 dark:bg-gray-800 px-1 rounded text-[10px]">Ctrl+Enter</kbd> to generate music instantly. <kbd className="bg-gray-200 dark:bg-gray-800 px-1 rounded text-[10px]">Space</kbd> to play/pause music.</p>
              </div>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <h4 className="font-black text-pink-500 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} /> Variations
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Use 'Create 3 Variations' to explore multiple stylistic directions at once, saving repetitive prompting time.</p>
              </div>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <h4 className="font-black text-pink-500 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Smart Tiling
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Duration doesn't impact AI generation time! It only affects local synthesis. Generate up to 15m without extra AI latency.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-8 bg-pink-500 hover:bg-pink-600 text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 active:scale-95 transition-all"
            >
              Start Composing
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-10">
            <div className="flex items-center justify-between">
              <nav className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
                  <button onClick={() => setMood('world')} className={`px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${mood === 'world' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'}`}>
                      <Globe size={14} /> Global 
                  </button>
                  <button onClick={() => setMood('happy')} className={`px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${mood !== 'world' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500'}`}>
                      <Music size={14} /> Modern 
                  </button>
              </nav>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={12} className="text-pink-500" /> Composition Input
                        <button 
                            onClick={() => setShowInfo(true)}
                            className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all group"
                            title="How to use efficiently"
                        >
                            <Info size={16} />
                        </button>
                    </div>
                </div>
                <div className="relative">
                  <textarea 
                      value={params.prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g. Deep tribal Indian wedding music with heavy resonant Dhol drums..."
                      className="w-full h-48 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 text-xl md:text-2xl font-black text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 resize-none tracking-tight leading-tight shadow-inner"
                  />
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                      {isRecording ? (
                        <button 
                          onClick={stopRecording}
                          className="bg-red-500 text-white p-4 rounded-full shadow-lg animate-pulse hover:scale-110 transition-transform"
                        >
                          <Square size={20} fill="white" />
                        </button>
                      ) : (
                        <button 
                          onClick={startRecording}
                          className={`p-4 rounded-full shadow-lg transition-transform hover:scale-110 ${audioInput ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                          title="Record audio reference"
                        >
                          <Mic size={20} />
                        </button>
                      )}
                  </div>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-4 py-2 rounded-2xl animate-in fade-in">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-xs font-black uppercase tracking-widest">Recording Reference: {recordingTime}s</span>
                  </div>
                )}

                {audioInput && !isRecording && (
                   <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-2xl border border-emerald-500/20 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                          <AudioWaveform size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Audio Reference Attached</span>
                      </div>
                      <button onClick={() => setAudioInput(null)} className="hover:text-emerald-700">
                          <Trash2 size={16} />
                      </button>
                   </div>
                )}

                <div className="flex gap-2">
                    <button onClick={handleEnhance} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95">
                        {isEnhancing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} ENHANCE PROMPT
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                    <Layers2 size={12} className="text-pink-500" /> World Instruments
                </div>
                <div className="flex flex-wrap gap-2">
                    {WORLD_INSTRUMENTS.map(inst => (
                        <button key={inst} onClick={() => handleInstrumentToggle(inst)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${instruments.includes(inst) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800'}`}>
                            {inst}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <aside className="lg:w-80 space-y-8">
            <div className="bg-gray-50 dark:bg-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-8">
                <div className="flex items-center gap-2 mb-2">
                    <Gauge size={14} className="text-pink-500" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">General Params</span>
                </div>
                
                <div>
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-4">
                        <span>Energy</span><span className="text-pink-500">{params.energyLevel}</span>
                    </div>
                    <input type="range" min="1" max="10" value={params.energyLevel} onChange={(e) => setParams({ ...params, energyLevel: Number(e.target.value) })} className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none accent-pink-500" />
                </div>
                
                <div>
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-4">
                        <span>Duration</span><span className="text-pink-500">{formatDuration(params.duration)}</span>
                    </div>
                    <input type="range" min="10" max="900" step="10" value={params.duration} onChange={(e) => setParams({ ...params, duration: Number(e.target.value) })} className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none accent-pink-500" />
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-between w-full group"
                    >
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal size={14} className="text-pink-500" />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Advanced Settings</span>
                        </div>
                        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showAdvanced && (
                        <div className="mt-8 space-y-8 animate-in slide-in-from-top-2 duration-300">
                            <ParamSlider 
                                label="Temperature" 
                                value={params.temperature} 
                                min={0.1} max={1.5} step={0.1} 
                                onChange={(v: number) => setParams({...params, temperature: v})}
                                tooltip="Creativity vs Determinism"
                            />
                            <ParamSlider 
                                label="Top-K" 
                                value={params.topK} 
                                min={1} max={100} step={1} 
                                onChange={(v: number) => setParams({...params, topK: v})}
                                tooltip="Vocabulary restriction"
                            />
                            <ParamSlider 
                                label="Top-P" 
                                value={params.topP} 
                                min={0.1} max={1.0} step={0.05} 
                                onChange={(v: number) => setParams({...params, topP: v})}
                                tooltip="Nucleus sampling"
                            />
                            <ParamSlider 
                                label="CFG Scale" 
                                value={params.cfgCoef} 
                                min={1.0} max={15.0} step={0.5} 
                                onChange={(v: number) => setParams({...params, cfgCoef: v})}
                                tooltip="Prompt adherence strength"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGenerateClick} 
                disabled={isGenerating || (!params.prompt && !audioInput)} 
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-pink-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                  {isGenerating ? <RefreshCw className="animate-spin" size={24} /> : <Wand2 size={24} />}
                  <span className="text-lg uppercase tracking-widest">{isGenerating ? 'Composing...' : 'Generate Masterpiece'}</span>
              </button>
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-[-10px]">Press Ctrl+Enter</p>

              <button 
                onClick={handleVariationsClick} 
                disabled={isGenerating || !params.prompt} 
                className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black py-4 rounded-[1.5rem] border border-gray-200 dark:border-gray-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-sm"
              >
                  <Layers size={18} />
                  <span className="text-xs uppercase tracking-widest">Create 3 Variations</span>
              </button>
            </div>
        </aside>
      </div>
    </div>
  );
}
