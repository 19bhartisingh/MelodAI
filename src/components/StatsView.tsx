
import React from 'react';
import { Track } from '../types';
import { Activity, Database, Zap, Clock, TrendingUp, ShieldCheck, HardDrive, BarChart3 } from 'lucide-react';

interface StatsViewProps {
  history: Track[];
  cacheStats: { hits: number; misses: number; size: number; count: number; hitRate: string };
  marginClass: string;
}

const StatsView: React.FC<StatsViewProps> = ({ history, cacheStats, marginClass }) => {
  const avgGenTime = history.length > 0 
    ? history.reduce((acc, t) => acc + (t.generationTime || 0), 0) / history.length / 1000 
    : 0;

  const qualityDistribution = history.reduce((acc: any, t) => {
    const grade = t.score?.grade || 'N/A';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`p-8 ${marginClass} pb-32 min-h-screen transition-all duration-300`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-2 tracking-tight">System Analytics</h1>
          <p className="text-gray-400">Live performance monitoring and cache intelligence.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={Database} 
            label="Cache Hit Rate" 
            value={`${cacheStats.hitRate}%`} 
            subValue={`${cacheStats.hits} hits / ${cacheStats.misses} misses`} 
            color="text-green-500"
          />
          <StatCard 
            icon={Zap} 
            label="Avg. Speed" 
            value={`${avgGenTime.toFixed(1)}s`} 
            subValue="Per single track generation" 
            color="text-blue-500"
          />
          <StatCard 
            icon={HardDrive} 
            label="Storage Used" 
            value={formatSize(cacheStats.size)} 
            subValue={`${cacheStats.count} items cached`} 
            color="text-purple-500"
          />
          <StatCard 
            icon={Activity} 
            label="Total Creations" 
            value={history.length.toString()} 
            subValue="Tracks in your session history" 
            color="text-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#121212]/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="text-green-500" /> Quality Distribution
            </h3>
            <div className="space-y-6">
              {['A', 'B', 'C', 'D', 'F'].map(grade => {
                const count = qualityDistribution[grade] || 0;
                const percentage = history.length > 0 ? (count / history.length) * 100 : 0;
                return (
                  <div key={grade}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">Grade {grade}</span>
                      <span className="text-gray-500">{count} tracks</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-blue-500' : 'bg-gray-600'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#121212]/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-green-500" /> Cache Efficiency
            </h3>
            <div className="flex flex-col items-center justify-center h-full pb-8">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="96" cy="96" r="80" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    className="text-gray-800"
                  />
                  <circle 
                    cx="96" cy="96" r="80" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeDasharray={502.65} 
                    strokeDashoffset={502.65 - (502.65 * Number(cacheStats.hitRate)) / 100}
                    className="text-green-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{cacheStats.hitRate}%</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500">Optimum</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 text-center px-8">
                Your intelligent cache is saving an estimated <span className="text-white font-bold">{(cacheStats.hits * avgGenTime).toFixed(0)} seconds</span> of API processing time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-[#181818] border border-gray-800/50 p-6 rounded-2xl hover:border-gray-700 transition-all group">
    <div className={`${color} mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
    <div className="text-2xl font-black mb-1">{value}</div>
    <div className="text-[10px] text-gray-500 font-medium">{subValue}</div>
  </div>
);

export default StatsView;
