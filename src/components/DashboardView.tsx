
import React from 'react';
import { Track, User } from '../types';
import { 
  TrendingUp, 
  Music, 
  Award, 
  Activity, 
  Zap, 
  Clock, 
  ArrowUpRight, 
  Star,
  PlayCircle
} from 'lucide-react';
import TrackCard from './TrackCard';

interface DashboardViewProps {
  user: User | null;
  history: Track[];
  onPlay: (track: Track) => void;
  currentTrackId?: string;
  isPlaying: boolean;
  marginClass: string;
  onMaster: (track: Track) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, history, onPlay, currentTrackId, isPlaying, marginClass, onMaster 
}) => {
  const favorites = history.filter(t => t.isFavorite);
  const totalMastered = history.filter(t => t.masteringConfig).length;
  
  const avgQuality = history.length > 0 
    ? Math.round(history.reduce((acc, t) => acc + (t.score?.overall || 0), 0) / history.length) 
    : 0;

  const topGenre = history.length > 0 
    ? history.reduce((acc: any, t) => {
        acc[t.mood] = (acc[t.mood] || 0) + 1;
        return acc;
      }, {})
    : {};
  
  const mostUsedMood = Object.entries(topGenre).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None';

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 ${color}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center text-emerald-500 text-xs font-bold">
          {trend} <ArrowUpRight size={14} className="ml-1" />
        </div>
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</div>
    </div>
  );

  return (
    <div className={`p-8 md:p-12 ${marginClass} pb-40 transition-all duration-500 animate-in fade-in`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white flex items-center gap-4">
            Hello, {user?.name?.split(' ')[0]} <Zap className="text-pink-500 animate-pulse" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Your creative studio is performing at its peak.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard icon={Music} label="Total Mastered" value={totalMastered} trend="+12%" color="text-pink-500" />
          <StatCard icon={Award} label="Avg. Quality" value={`${avgQuality}%`} trend="+5%" color="text-yellow-500" />
          <StatCard icon={Activity} label="Primary Mood" value={mostUsedMood} trend="Stable" color="text-blue-500" />
          <StatCard icon={Star} label="Top Creations" value={favorites.length} trend="+2" color="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <PlayCircle size={24} className="text-pink-500" /> Recent Activity
                </h2>
                <button className="text-pink-500 font-bold hover:underline text-sm">View Archive</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {history.slice(0, 4).map(track => (
                  <TrackCard 
                    key={track.id} 
                    track={track} 
                    onPlay={onPlay} 
                    isPlaying={isPlaying && currentTrackId === track.id} 
                    isCurrent={currentTrackId === track.id}
                    onMaster={onMaster}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-gray-950 p-8 rounded-[2.5rem] border border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <TrendingUp size={20} className="text-pink-500" /> Session Goal
              </h3>
              <div className="space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                    <span>Weekly Target</span>
                    <span className="text-pink-500">{history.length}/10 Tracks</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 w-[70%] shadow-[0_0_12px_rgba(236,72,153,0.5)]"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  You are 3 tracks away from hitting your weekly productivity goal. Start a new session in the Studio to finish.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Clock size={20} className="text-blue-500" /> Cache Utility
              </h3>
              <div className="text-center py-4">
                <div className="text-4xl font-black text-pink-500 mb-2">92%</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synthesis Efficiency</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
