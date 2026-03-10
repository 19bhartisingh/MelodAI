
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { 
  GenerationParams, 
  Track, 
  ViewState, 
  ExamplePrompt,
  GenerationState,
  User,
  Playlist
} from './types';
import { EXAMPLE_PROMPTS } from './constants';
import { generateCompleteMusicSession } from './services/geminiService';
import { generateProceduralAudio } from './services/audioGenerator'; 
import { cacheManager } from './services/cacheService'; 
import { authService } from './services/authService';
import { audioScorer } from './services/audioScorer';
import Sidebar from './components/Sidebar.tsx';
import Player from './components/Player.tsx';
import TrackCard from './components/TrackCard.tsx';
import QualityDetailsModal from './components/QualityDetailsModal.tsx';
import MusicalBackground from './components/MusicalBackground.tsx';
import GeneratorPanel from './components/GeneratorPanel.tsx';
import GenerationResult from './components/GenerationResult.tsx';
import LandingPage from './components/LandingPage.tsx';
import DashboardView from './components/DashboardView.tsx';

// Performance: Lazy load secondary views
const LibraryView = lazy(() => import('./components/LibraryView.tsx'));
const StatsView = lazy(() => import('./components/StatsView.tsx'));
const MasteringPanel = lazy(() => import('./components/MasteringPanel.tsx'));
const SettingsView = lazy(() => import('./components/SettingsView.tsx'));

import { Sparkles, Music, Flame, Coffee, Zap, Loader2, LayoutGrid, Clock, Wand2, Globe, Moon } from 'lucide-react';

const CATEGORY_STYLE: Record<string, { icon: any, color: string, gradient: string }> = {
  'Happy': { icon: Flame, color: 'text-yellow-500', gradient: 'from-yellow-400 to-orange-500' },
  'Sad': { icon: Coffee, color: 'text-blue-500', gradient: 'from-blue-600 to-indigo-700' },
  'Energetic': { icon: Zap, color: 'text-red-500', gradient: 'from-red-500 to-pink-600' },
  'Calm': { icon: Sparkles, color: 'text-teal-500', gradient: 'from-teal-400 to-emerald-500' },
  'World': { icon: Globe, color: 'text-amber-500', gradient: 'from-amber-400 to-orange-600' },
  'Mysterious': { icon: Moon, color: 'text-purple-500', gradient: 'from-indigo-900 to-purple-900' }
};

const App = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [examplePrompts] = useState<ExamplePrompt[]>(
    [...EXAMPLE_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, 8)
  );
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<string>('standard');
  const [ambienceTracks] = useState<Record<string, string>>({});
  const [ambienceType, setAmbienceType] = useState<'none' | 'rain' | 'vinyl'>('none');
  const [ambienceVolume, setAmbienceVolume] = useState(0.3);
  const [genState, setGenState] = useState<GenerationState>({ status: 'idle', progress: 0, step: '' });
  const [showResult, setShowResult] = useState(false);
  const [detailsTrack, setDetailsTrack] = useState<Track | null>(null);
  const [masteringTrack, setMasteringTrack] = useState<Track | null>(null);
  const [cacheStats, setCacheStats] = useState(cacheManager.getStats());
  const [prefillPrompt, setPrefillPrompt] = useState<string | null>(null);
  
  const [params, setParams] = useState<GenerationParams>({
    prompt: "",
    duration: 30,
    temperature: 0.9,
    topK: 40,
    topP: 0.9,
    cfgCoef: 3.5,
    mood: 'happy',
    modelVariant: 'musicgen-medium',
    energyLevel: 5,
    rhythmicDensity: 5,
    harmonicComplexity: 'balanced',
    melodyAdherence: 7
  });

  const mainMarginClass = currentUser ? (isSidebarCollapsed ? "md:ml-20" : "md:ml-64") : "";

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar: Toggle Play/Pause
      if (e.code === 'Space' && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }

      // Ctrl/Cmd + Enter: Generate Music (only in generate view)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (view === 'generate' && params.prompt.trim().length > 5) {
          e.preventDefault();
          handleGenerate([params.prompt], params.mood || 'happy', params);
        }
      }

      // Ctrl/Cmd + D: Download Current Track
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && currentTrack) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = currentTrack.audioUrl;
        link.download = `${currentTrack.title.replace(/\s+/g, '_')}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, view, params, currentTrack]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('landing');
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('musegen_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) setIsPlaying(!isPlaying);
    else { setCurrentTrack(track); setIsPlaying(true); }
  };

  const handleToggleFavorite = (trackId: string) => {
    setHistory(prev => prev.map(t => t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t));
  };
  
  const handleDeleteTrack = (trackId: string) => {
      if (confirm('Delete this masterpiece?')) {
          setHistory(prev => prev.filter(t => t.id !== trackId));
          if (currentTrack?.id === trackId) { setCurrentTrack(null); setIsPlaying(false); }
      }
  };

  const updateTrack = (updatedTrack: Track) => {
    setHistory(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
    if (currentTrack?.id === updatedTrack.id) setCurrentTrack(updatedTrack);
  };

  const handleGenerate = async (prompts: string[], overrideMood: string, overrideParams: GenerationParams) => {
    const baseParams = { ...params, ...overrideParams };
    setParams(baseParams);
    if (prompts.length === 0 && !baseParams.audioInput) return;
    
    setGenState({ 
      status: 'processing', 
      progress: 0, 
      step: prompts.length > 1 ? 'Batching Variations...' : 'Dreaming...', 
      details: 'Connecting to Studio Engine...' 
    });
    
    const startTime = Date.now();
    const generatedTracks: Track[] = [];

    try {
        for (let i = 0; i < prompts.length; i++) {
          const currentPrompt = prompts[i];
          const seed = (baseParams.seed || Date.now()) + (Math.random() * 1000) + i;
          const currentParams = { ...baseParams, prompt: currentPrompt, seed };
          
          const progressBase = (i / prompts.length) * 100;
          const stepLabel = prompts.length > 1 ? `Variation ${i+1}/${prompts.length}` : 'Masterpiece';
          
          setGenState(prev => ({ ...prev, progress: Math.floor(progressBase + 10), step: stepLabel, details: 'Composing Score...' }));
          
          const cacheKey = await cacheManager.generateKey(currentParams);
          const cached = await cacheManager.get(cacheKey);
          
          let track: Track;

          if (cached) {
            track = { ...cached.track, audioUrl: URL.createObjectURL(cached.audioBlob), createdAt: new Date() };
          } else {
            // Speed optimization: generateCompleteMusicSession now uses Gemini 3 Flash
            const session = await generateCompleteMusicSession(currentParams);
            
            setGenState(prev => ({ ...prev, progress: Math.floor(progressBase + 50), step: stepLabel, details: 'Synthesizing Audio...' }));
            const audioUrl = await generateProceduralAudio(currentParams, session.score);
            
            setGenState(prev => ({ ...prev, progress: Math.floor(progressBase + 80), step: stepLabel, details: 'Finalizing Quality...' }));
            // Speed optimization: scorer is fast for small buffers
            const qualityScore = await audioScorer.scoreAudio(audioUrl, currentParams.duration, session.score.tempo);

            track = {
              id: `t_${Date.now()}_${i}`,
              title: session.metadata.title || `Variation ${i+1}`,
              description: session.metadata.description || "Synthesized Masterpiece",
              imageUrl: `https://picsum.photos/seed/${seed}/400/400`,
              audioUrl,
              duration: currentParams.duration,
              promptUsed: currentPrompt,
              createdAt: new Date(),
              mood: currentParams.mood || 'happy',
              params: currentParams,
              isFavorite: false,
              score: qualityScore,
              generationTime: Date.now() - startTime,
              modelUsed: currentParams.modelVariant
            };

            try {
              const blob = await fetch(audioUrl).then(r => r.blob());
              await cacheManager.set(cacheKey, track, blob);
            } catch(e) { console.warn("Caching error", e); }
          }
          generatedTracks.push(track);
        }

        setHistory(prev => [...generatedTracks, ...prev]);
        setCurrentTrack(generatedTracks[0]);
        setIsPlaying(true);
        setGenState({ status: 'success', progress: 100, step: 'Success!', details: `Generated ${generatedTracks.length} track(s) in ${((Date.now() - startTime)/1000).toFixed(1)}s` });
        setShowResult(true);
        setCacheStats(cacheManager.getStats());

    } catch (error: any) {
      console.error("Master Generation error:", error);
      setGenState({ status: 'error', progress: 0, step: 'Generation Failed', error: error.message || "The studio engine encountered an RPC/Network error. Please try again." });
    }
  };

  const handlePrefillSuggestion = (text: string) => {
    setParams({ ...params, prompt: text });
    setView('generate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    if (!currentUser) return <LandingPage onLogin={handleLogin} />;

    switch (view) {
      case 'dashboard':
        return (
          <DashboardView 
            user={currentUser} 
            history={history} 
            onPlay={handlePlay} 
            currentTrackId={currentTrack?.id} 
            isPlaying={isPlaying} 
            marginClass={mainMarginClass} 
            onMaster={(t) => { setMasteringTrack(t); setView('mastering'); }}
          />
        );
      case 'home':
        return (
          <div className={`p-8 md:p-12 ${mainMarginClass} pb-40 transition-all duration-500 animate-in fade-in`}>
             <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                   <h1 className="text-5xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white">Discover</h1>
                   <p className="text-gray-500 dark:text-gray-400 text-lg">Pick a vibe and let's generate some sound.</p>
                </header>

                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <LayoutGrid size={18} className="text-pink-500" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">Inspiring Styles</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {examplePrompts.map((ex, i) => {
                            const style = CATEGORY_STYLE[ex.category] || { icon: Music, color: 'text-gray-500', gradient: 'from-gray-400 to-gray-600' };
                            const IconComp = style.icon;
                            return (
                                <button 
                                    key={i} 
                                    onClick={() => handlePrefillSuggestion(ex.text)}
                                    className="relative group h-56 rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/10 p-8 text-left animate-in slide-in-from-bottom-2 duration-500 flex flex-col justify-between"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm">
                                            <IconComp size={20} className={style.color} />
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-pink-500 text-white p-2 rounded-full shadow-lg">
                                            <Wand2 size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <span className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${style.color}`}>{ex.category}</span>
                                        <h3 className="text-gray-900 dark:text-white font-black text-lg leading-tight line-clamp-3 group-hover:text-pink-500 transition-colors">{ex.text}</h3>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
             </div>
          </div>
        );
      case 'generate':
          return (
            <div className={`p-8 md:p-12 ${mainMarginClass} pb-40 transition-all duration-500`}>
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Wand2 size={18} className="text-pink-500" />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">Studio</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white">Compose Your Sound</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Synthesis with up to 15-minute length.</p>
                    </header>

                    <GeneratorPanel 
                        onGenerate={handleGenerate} 
                        isGenerating={genState.status === 'processing'} 
                        params={params}
                        setParams={setParams}
                        prefillPrompt={params.prompt}
                        onClearPrefill={() => {}}
                    />

                    {showResult && currentTrack && (
                    <GenerationResult 
                        track={currentTrack} 
                        onClose={() => setShowResult(false)} 
                        onPlayPause={() => handlePlay(currentTrack)}
                        isPlaying={isPlaying}
                        onMaster={() => { setMasteringTrack(currentTrack); setView('mastering'); }}
                        onSubmitFeedback={(id, fb) => updateTrack({ ...currentTrack, feedback: fb })}
                    />
                    )}
                </div>
            </div>
          );
      case 'history':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-pink-500" /></div>}>
            <LibraryView 
                history={history} 
                playlists={playlists} 
                onAddPlaylist={() => {}}
                onSelectPlaylist={() => {}} 
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteTrack}
                onViewDetails={setDetailsTrack}
                marginClass={mainMarginClass}
                onMaster={(t) => { setMasteringTrack(t); setView('mastering'); }}
            />
          </Suspense>
        );
      case 'mastering':
          return masteringTrack ? (
            <Suspense fallback={<div>Loading Mastering Studio...</div>}>
                <MasteringPanel 
                    track={masteringTrack} 
                    onUpdateTrack={updateTrack} 
                    onClose={() => setView('dashboard')} 
                />
            </Suspense>
          ) : null;
      case 'settings':
          return (
            <Suspense fallback={<div>Loading...</div>}>
                <SettingsView user={currentUser} params={params} setParams={setParams} theme={theme} toggleTheme={toggleTheme} marginClass={mainMarginClass} />
            </Suspense>
          );
      case 'test-suite':
          return (
            <Suspense fallback={<div>Loading Analytics...</div>}>
              <StatsView history={history} cacheStats={cacheStats} marginClass={mainMarginClass} />
            </Suspense>
          );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500 font-sans selection:bg-pink-500 selection:text-white">
      <MusicalBackground />
      
      {currentUser && (
        <Sidebar 
          view={view} 
          setView={setView} 
          params={params}
          setParams={setParams}
          currentPreset={currentPreset}
          setCurrentPreset={() => {}}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      )}

      <main className="relative z-10 min-h-screen">
        {renderView()}
      </main>

      {currentUser && (
        <Player 
          currentTrack={currentTrack} 
          isPlaying={isPlaying} 
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onToggleFavorite={handleToggleFavorite}
          ambienceType={ambienceType}
          setAmbienceType={setAmbienceType}
          ambienceVolume={ambienceVolume}
          setAmbienceVolume={setAmbienceVolume}
          ambienceTracks={ambienceTracks}
        />
      )}

      {detailsTrack && (
        <QualityDetailsModal 
          track={detailsTrack} 
          onClose={() => setDetailsTrack(null)} 
          onSubmitFeedback={(id, fb) => updateTrack({ ...detailsTrack, feedback: fb })}
        />
      )}

      {genState.status === 'processing' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-sm border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="relative mb-8">
                    <Loader2 size={64} className="text-pink-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-pink-500">{genState.progress}%</span>
                    </div>
                </div>
                <h3 className="text-xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">{genState.step}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{genState.details}</p>
                <div className="mt-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Target: 20-30s
                </div>
            </div>
        </div>
      )}

      {genState.status === 'error' && (
        <div className="fixed bottom-24 right-8 z-[200] bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 max-w-sm">
            <Zap size={20} className="shrink-0" />
            <div className="text-sm font-bold truncate">{genState.error}</div>
            <button onClick={() => setGenState({ ...genState, status: 'idle' })} className="ml-4 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
};

export default App;
