
import React, { useState, useEffect, useRef } from 'react';
import { Track, MasteringParams } from '../types';
import { audioProcessor } from '../services/audioProcessor';
import Spectrogram from './Spectrogram';
import { 
  Sliders, Zap, Activity, Download, RefreshCw, Layers, 
  ShieldCheck, Waves, ToggleLeft, ToggleRight, Info, Package,
  Play, Pause, Volume2, Music
} from 'lucide-react';
import JSZip from 'jszip';

interface MasteringPanelProps {
  track: Track;
  onUpdateTrack: (updatedTrack: Track) => void;
  onClose: () => void;
  batchTracks?: Track[];
}

const PRESETS: Record<string, MasteringParams> = {
  "Natural": { eqLow: 0, eqMid: 0, eqHigh: 0, compression: 0.2, stereoWidth: 1.0, limiterThreshold: -0.1, reverbAmount: 0.1, delayAmount: 0, delayFeedback: 0.4, presetName: "Natural" },
  "Studio": { eqLow: 2, eqMid: -1, eqHigh: 3, compression: 0.5, stereoWidth: 1.2, limiterThreshold: -0.5, reverbAmount: 0.2, delayAmount: 0.1, delayFeedback: 0.3, presetName: "Studio" },
  "Concert Hall": { eqLow: 4, eqMid: 0, eqHigh: -2, compression: 0.3, stereoWidth: 1.8, limiterThreshold: -1.0, reverbAmount: 0.7, delayAmount: 0.2, delayFeedback: 0.5, presetName: "Concert Hall" },
  "Bedroom": { eqLow: -2, eqMid: 2, eqHigh: -1, compression: 0.7, stereoWidth: 0.8, limiterThreshold: -0.2, reverbAmount: 0.3, delayAmount: 0, delayFeedback: 0, presetName: "Bedroom" },
};

export default function MasteringPanel({ track, onUpdateTrack, onClose, batchTracks = [] }: MasteringPanelProps) {
  const [params, setParams] = useState<MasteringParams>(track.masteringConfig || PRESETS["Natural"]);
  const [isRendering, setIsRendering] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [activePreset, setActivePreset] = useState(track.masteringConfig?.presetName || "Natural");
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);

  useEffect(() => {
    const initAudio = async () => {
        setIsLoadingAudio(true);
        await audioProcessor.loadAudio(track.audioUrl);
        setIsLoadingAudio(false);
    };
    initAudio();
    return () => audioProcessor.stop();
  }, [track.audioUrl]);

  useEffect(() => {
    audioProcessor.applySettings(params, isBypassed);
  }, [params, isBypassed]);

  const togglePreview = () => {
      if (isPreviewing) {
          audioProcessor.stop();
      } else {
          audioProcessor.play();
      }
      setIsPreviewing(!isPreviewing);
  };

  const handleParamChange = (key: keyof MasteringParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setActivePreset("Custom");
  };

  const applyPreset = (name: string) => {
      setActivePreset(name);
      setParams(PRESETS[name]);
  };

  const handleExportMastered = async () => {
    setIsRendering(true);
    try {
        const originalBuffer = await audioProcessor.loadAudio(track.audioUrl);
        const masteredUrl = await audioProcessor.renderMasteredWav(originalBuffer, params);
        
        const updatedTrack: Track = {
            ...track,
            audioUrl: masteredUrl,
            masteringConfig: params,
            title: `${track.title.replace(' (Mastered)', '')} (Mastered)`
        };
        
        onUpdateTrack(updatedTrack);
        
        const link = document.createElement('a');
        link.href = masteredUrl;
        link.download = `${updatedTrack.title}.${exportFormat}`;
        link.click();
    } catch (e) {
        console.error("Mastering export failed", e);
    } finally {
        setIsRendering(false);
    }
  };

  const handleBatchExport = async () => {
      if (batchTracks.length === 0) return;
      setIsRendering(true);
      try {
          const zip = new JSZip();
          for (const t of batchTracks) {
              const buffer = await audioProcessor.loadAudio(t.audioUrl);
              const url = await audioProcessor.renderMasteredWav(buffer, params);
              const blob = await fetch(url).then(r => r.blob());
              zip.file(`${t.title.replace(/\s+/g, '_')}_mastered.wav`, blob);
          }
          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = "Melodai_Batch_Master.zip";
          link.click();
      } catch (e) {
          console.error("Batch export failed", e);
      } finally {
          setIsRendering(false);
      }
  };

  const ControlGroup = ({ title, icon: Icon, children }: any) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-pink-500/30">
        <div className="flex items-center gap-2 mb-6 text-gray-400 font-black uppercase text-[10px] tracking-widest">
            <Icon size={14} className="text-pink-500" /> {title}
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </div>
  );

  const Slider = ({ label, value, min, max, step, onChange, unit = '' }: any) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-gray-500">{label}</span>
            <span className="text-pink-500 font-mono">{value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(step >= 1 ? 0 : 2) : value}{unit}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[3rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        <header className="p-8 border-b border-gray-100 dark:border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-xl shadow-pink-500/20">
                    <Sliders size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Effects</h2>
                    <p className="text-xs text-gray-500 font-medium">Professional grade and spatial engine</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePreview}
                    disabled={isLoadingAudio}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-black transition-all ${
                        isPreviewing 
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    {isLoadingAudio ? <RefreshCw className="animate-spin" size={18} /> : (isPreviewing ? <Pause size={18} /> : <Play size={18} />)}
                    {isPreviewing ? 'STOP PREVIEW' : 'START PREVIEW'}
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>

                <button 
                    onClick={() => setIsBypassed(!isBypassed)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border ${
                        isBypassed ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                    }`}
                >
                    {isBypassed ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {isBypassed ? 'BYPASSED' : 'PROCESSING'}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                    <ShieldCheck size={28} />
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-10 relative">
                <Spectrogram analyzer={audioProcessor.getAnalyzer()} />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-pink-400 border border-pink-500/20 flex items-center gap-2 tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                    REAL-TIME FREQUENCY 
                </div>
            </div>

            <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                    <Layers size={14} className="text-pink-500" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Effect Presets</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    {Object.keys(PRESETS).map(name => (
                        <button 
                            key={name}
                            onClick={() => applyPreset(name)}
                            className={`px-8 py-4 rounded-3xl text-sm font-black transition-all border ${
                                activePreset === name 
                                ? 'bg-pink-500 text-white border-pink-500 shadow-2xl shadow-pink-500/30 -translate-y-1' 
                                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-pink-500/50 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ControlGroup title="Frequency (EQ)" icon={Activity}>
                            <Slider label="Sub/Low End" value={params.eqLow} min={-12} max={12} step={1} onChange={(v: number) => handleParamChange('eqLow', v)} unit="dB" />
                            <Slider label="Mid Presence" value={params.eqMid} min={-12} max={12} step={1} onChange={(v: number) => handleParamChange('eqMid', v)} unit="dB" />
                            <Slider label="High Air" value={params.eqHigh} min={-12} max={12} step={1} onChange={(v: number) => handleParamChange('eqHigh', v)} unit="dB" />
                        </ControlGroup>

                        <ControlGroup title="Dynamics (Comp)" icon={Zap}>
                            <Slider label="Intensity" value={params.compression} min={0} max={1} step={0.01} onChange={(v: number) => handleParamChange('compression', v)} />
                            <Slider label="Ceiling" value={params.limiterThreshold} min={-12} max={0} step={0.1} onChange={(v: number) => handleParamChange('limiterThreshold', v)} unit="dB" />
                            <Slider label="Stereo Width" value={params.stereoWidth} min={0.5} max={2.0} step={0.1} onChange={(v: number) => handleParamChange('stereoWidth', v)} unit="x" />
                        </ControlGroup>
                    </div>

                    <ControlGroup title="Space (Delay & Reverb)" icon={Waves}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <Slider label="Reverb Amount" value={params.reverbAmount} min={0} max={1} step={0.01} onChange={(v: number) => handleParamChange('reverbAmount', v)} />
                            <Slider label="Delay Level" value={params.delayAmount} min={0} max={1} step={0.01} onChange={(v: number) => handleParamChange('delayAmount', v)} />
                            <Slider label="Feedback" value={params.delayFeedback} min={0} max={0.9} step={0.01} onChange={(v: number) => handleParamChange('delayFeedback', v)} />
                        </div>
                    </ControlGroup>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-pink-50 dark:bg-pink-900/10 p-8 rounded-[2.5rem] border border-pink-100 dark:border-pink-800/30">
                        <div className="flex items-start gap-4 text-pink-600 dark:text-pink-400 mb-6">
                            <Info size={24} className="shrink-0 mt-1" />
                            <p className="text-xs leading-relaxed font-bold">
                                Use the <span className="text-pink-500">Preview</span> button above to hear changes in real-time. Settings will be applied to the final export.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-pink-100 dark:border-pink-800/30">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Export Format</label>
                            <div className="flex gap-2">
                                {['wav', 'mp3'].map(fmt => (
                                    <button 
                                        key={fmt}
                                        onClick={() => setExportFormat(fmt as any)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${exportFormat === fmt ? 'bg-pink-500 text-white border-pink-500' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'}`}
                                    >
                                        {fmt.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col space-y-4 shadow-sm">
                        <button 
                            onClick={handleExportMastered}
                            disabled={isRendering}
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-pink-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isRendering ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                            {isRendering ? 'PROCESSING...' : 'APPLY & DOWNLOAD'}
                        </button>
                        
                        {batchTracks.length > 0 && (
                            <button 
                                onClick={handleBatchExport}
                                disabled={isRendering}
                                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Package size={20} />
                                BATCH PROCESS ({batchTracks.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
