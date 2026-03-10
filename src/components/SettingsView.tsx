
import React, { useState } from 'react';
import { User, GenerationParams } from '../types';
import { Settings, Shield, Clock, Database, Moon, Sun, Trash2, Info, User as UserIcon, Lock, Key, RefreshCw } from 'lucide-react';
import { cacheManager } from '../services/cacheService';

interface SettingsViewProps {
  user: User | null;
  params: GenerationParams;
  setParams: (p: GenerationParams) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  marginClass: string;
}

export default function SettingsView({ user, params, setParams, theme, toggleTheme, marginClass }: SettingsViewProps) {
  const [showKey, setShowKey] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  
  const handleClearCache = async () => {
    if (confirm("Permanently clear all cached audio data? This cannot be undone.")) {
        setIsCleaning(true);
        await cacheManager.clear();
        setTimeout(() => {
            setIsCleaning(false);
            window.location.reload();
        }, 1000);
    }
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-10 mb-8 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-2xl text-pink-500">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-8">
            {children}
        </div>
    </div>
  );

  const Control = ({ label, description, children }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 dark:border-gray-800 pb-8 last:border-0 last:pb-0">
        <div className="max-w-md">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{label}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
            {children}
        </div>
    </div>
  );

  return (
    <div className={`p-8 md:p-12 ${marginClass} pb-40 transition-all duration-500 animate-in fade-in duration-700`}>
        <div className="max-w-4xl mx-auto">
            <header className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase">Control Center</span>
                </div>
                <h1 className="text-6xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white">Studio Settings</h1>
                <p className="text-gray-400 text-lg">Personalize your generative workflow and privacy preferences.</p>
            </header>

            <Section title="Profile & API" icon={UserIcon}>
                <Control label="Gemini Integration" description="Current API environment status for Google Gemini models.">
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-xs font-black border border-green-500/20">
                        <Shield size={14} /> ACTIVE
                    </div>
                </Control>
                <Control label="User Identity" description="How you are identified within the MuseGen ecosystem.">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <UserIcon size={16} className="text-gray-400" />
                        <span className="text-sm font-bold">{user?.name}</span>
                    </div>
                </Control>
            </Section>

            <Section title="Audio Preferences" icon={Clock}>
                <Control label="Standard Loop Length" description="The default duration used for new studio generations.">
                    <select 
                        value={params.duration}
                        onChange={(e) => setParams({ ...params, duration: Number(e.target.value) })}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-2xl text-sm font-bold outline-none focus:border-pink-500 transition-colors"
                    >
                        <option value={30}>30 Seconds</option>
                        <option value={60}>1 Minute</option>
                        <option value={300}>5 Minutes</option>
                        <option value={600}>10 Minutes</option>
                        <option value={900}>15 Minutes (Max)</option>
                    </select>
                </Control>
                <Control label="Melody Adherence" description="Default strictness for note-based reference inputs.">
                    <input 
                        type="range" min="1" max="10" 
                        value={params.melodyAdherence || 7}
                        onChange={(e) => setParams({...params, melodyAdherence: Number(e.target.value)})}
                        className="w-32 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none accent-pink-500"
                    />
                </Control>
            </Section>

            <Section title="Interface & Data" icon={Database}>
                <Control label="Display Mode" description="Switch between high-contrast Dark and bright Light themes.">
                    <button 
                        onClick={toggleTheme}
                        className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-3xl text-sm font-black transition-all hover:scale-105"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                    </button>
                </Control>
                <Control label="Intelligent Cache" description="Free up disk space by clearing the local audio database.">
                    <button 
                        onClick={handleClearCache}
                        disabled={isCleaning}
                        className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-3xl text-sm font-black transition-all hover:scale-105 disabled:opacity-50"
                    >
                        {isCleaning ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        CLEAR CACHED DATA
                    </button>
                </Control>
            </Section>

            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 border border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 rounded-[2rem] bg-pink-500 flex items-center justify-center text-white shrink-0 shadow-2xl shadow-pink-500/20">
                    <Info size={32} />
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">About</h4>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                        Melod AI v2.5 Stable. All core DSP processing is local. Caching uses encrypted IndexDB partitions. Google Gemini API keys are injected via secure environmental variables. For full documentation, please refer to the internal producer guide.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
