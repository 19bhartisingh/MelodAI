
import React, { useState } from 'react';
import { Track, Playlist } from '../types';
import TrackCard from './TrackCard';
import { Search, ListMusic, Plus, FolderHeart, Trash2, Filter, SortDesc, Calendar, Star, Music, Check } from 'lucide-react';

interface LibraryViewProps {
  history: Track[];
  playlists: Playlist[];
  onAddPlaylist: () => void;
  onSelectPlaylist: (playlist: Playlist | null) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (track: Track) => void;
  marginClass: string;
  onMaster: (track: Track) => void;
}

export default function LibraryView({ 
  history, playlists, onAddPlaylist, onSelectPlaylist,
  currentTrackId, isPlaying, onPlay, onToggleFavorite, onDelete, onViewDetails, marginClass, onMaster 
}: LibraryViewProps) {
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  const moods = Array.from(new Set(history.map(t => t.mood)));

  const filteredHistory = history
    .filter(track => {
        const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) || 
                             track.promptUsed.toLowerCase().includes(search.toLowerCase());
        const matchesMood = filterMood === 'all' || track.mood === filterMood;
        const matchesPlaylist = !activePlaylist || activePlaylist.trackIds.includes(track.id);
        return matchesSearch && matchesMood && matchesPlaylist;
    })
    .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'rating') return (b.score?.overall || 0) - (a.score?.overall || 0);
        return a.title.localeCompare(b.title);
    });

  const handlePlaylistClick = (pl: Playlist | null) => {
      setActivePlaylist(pl);
      onSelectPlaylist(pl);
  };

  return (
    <div className={`p-8 md:p-12 ${marginClass} pb-40 min-h-screen transition-all duration-500 flex flex-col lg:flex-row gap-12 animate-in fade-in duration-700`}>
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-12">
          <div className="animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.25em] flex items-center gap-3">
                    <ListMusic size={14} className="text-pink-500" /> Playlists
                  </h3>
                  <button 
                    onClick={onAddPlaylist} 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all shadow-sm"
                  >
                      <Plus size={16} />
                  </button>
              </div>
              <div className="space-y-2">
                  <button 
                    onClick={() => handlePlaylistClick(null)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all ${
                        !activePlaylist ? 'bg-pink-500 text-white shadow-xl shadow-pink-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent'
                    }`}
                  >
                      <FolderHeart size={18} /> Collection
                  </button>
                  {playlists.map(pl => (
                      <button 
                        key={pl.id}
                        onClick={() => handlePlaylistClick(pl)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all border ${
                            activePlaylist?.id === pl.id 
                            ? 'bg-white dark:bg-gray-900 text-pink-500 border-pink-500/30 shadow-sm' 
                            : 'text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                          <div className={`w-2.5 h-2.5 rounded-full ${pl.color || 'bg-blue-500'}`}></div>
                          <span className="truncate">{pl.name}</span>
                          <span className="ml-auto text-[10px] font-mono opacity-50">{pl.trackIds.length}</span>
                      </button>
                  ))}
              </div>
          </div>

          <div className="pt-10 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-left-4 duration-700">
              <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.25em] flex items-center gap-3 mb-6">
                <Filter size={14} className="text-pink-500" /> Filter Mood
              </h3>
              <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setFilterMood('all')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${filterMood === 'all' ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-pink-500/50'}`}
                  >
                      ALL VIBES
                  </button>
                  {moods.map(m => (
                      <button 
                        key={m}
                        onClick={() => setFilterMood(m)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${filterMood === m ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-pink-500/50'}`}
                      >
                          {m}
                      </button>
                  ))}
              </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
                <Music className="text-pink-500" size={18} />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">Vault</span>
            </div>
            <h1 className="text-6xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white">
                {activePlaylist ? activePlaylist.name : 'Your Studio Library'}
            </h1>
            <p className="text-gray-400 text-lg font-medium">{activePlaylist ? activePlaylist.description : 'Every creation, master, and draft in one place.'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search masters..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[2rem]">
                {[
                    { id: 'date', icon: Calendar },
                    { id: 'rating', icon: Star },
                    { id: 'title', icon: Music }
                ].map(opt => (
                    <button 
                        key={opt.id}
                        onClick={() => setSortBy(opt.id as any)}
                        className={`p-2.5 rounded-full transition-all ${sortBy === opt.id ? 'bg-white dark:bg-gray-700 text-pink-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        title={`Sort by ${opt.id}`}
                    >
                        <opt.icon size={18} />
                    </button>
                ))}
            </div>
          </div>
        </header>

        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {filteredHistory.map(track => (
              <TrackCard 
                key={track.id} 
                track={track} 
                isPlaying={isPlaying && currentTrackId === track.id} 
                isCurrent={currentTrackId === track.id} 
                onPlay={onPlay} 
                onToggleFavorite={onToggleFavorite} 
                onViewDetails={onViewDetails} 
                onDelete={onDelete} 
                onMaster={() => onMaster(track)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center border-4 border-dashed border-gray-100 dark:border-gray-800/50 rounded-[4rem]">
            <div className="bg-gray-50 dark:bg-gray-800/30 p-10 rounded-full mb-10 text-gray-300">
              <Search className="w-16 h-16" />
            </div>
            <h3 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">No results in this view</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">Try clearing your filters or return to the home to generate more music.</p>
          </div>
        )}
      </div>
    </div>
  );
};
