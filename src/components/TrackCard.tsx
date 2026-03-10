
import React from 'react';
import { Track } from '../types';
import { Sliders } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  isPlaying: boolean;
  isCurrent: boolean;
  onToggleFavorite?: (id: string) => void;
  onExtend?: (track: Track) => void;
  onViewDetails?: (track: Track) => void;
  onDelete?: (id: string) => void;
  onMaster?: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay, isPlaying, isCurrent, onToggleFavorite, onExtend, onViewDetails, onDelete, onMaster }) => {
  const getGradeColor = (grade?: string) => {
    switch(grade) {
      case 'A': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'F': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(track);
    }
  };

  return (
    <article 
      className={`bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-gray-200 dark:border-gray-800 p-4 rounded-xl transition-all group cursor-pointer relative shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${isCurrent ? 'ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-black' : ''}`}
      onClick={() => onPlay(track)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Play ${track.title}. ${track.description}`}
    >
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img src={track.imageUrl} alt="" className="w-full aspect-square object-cover rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        
        {track.score && (
          <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm backdrop-blur-md ${getGradeColor(track.score.grade)}`} title={`Quality Grade: ${track.score.grade}`}>{track.score.grade}</div>
        )}

        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className={`w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isCurrent ? 'scale-110 shadow-pink-500/40' : 'hover:scale-110'}`}><i className={`fas ${isCurrent && isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying && isCurrent ? '' : 'ml-1'}`}></i></div>
        </div>
        
        {onToggleFavorite && (
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(track.id); }} className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${track.isFavorite ? 'bg-pink-500 text-white opacity-100' : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500 opacity-0 group-hover:opacity-100'}`} title={track.isFavorite ? "Remove" : "Add"}>
             <i className={`${track.isFavorite ? 'fas' : 'far'} fa-heart text-xs`}></i>
          </button>
        )}
      </div>
      
      <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1 group-hover:text-pink-500 transition-colors">{track.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">{track.description}</p>
      
      <div className="mt-3 flex flex-wrap gap-2 mb-3">
         <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-bold">{track.mood}</span>
         <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">{track.duration}s</span>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center mt-auto">
         <div className="flex gap-2">
            {onMaster && (
               <button onClick={(e) => { e.stopPropagation(); onMaster(track); }} className="text-gray-400 hover:text-pink-500 transition-colors p-1" title="Open Mastering Studio">
                  <Sliders size={14} />
               </button>
            )}
            <a href={track.audioUrl} download={`${track.title.replace(/\s+/g, '_')}.wav`} onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1" title="Download">
               <i className="fas fa-download"></i>
            </a>
         </div>
         <div className="flex gap-3">
            {onViewDetails && <button onClick={(e) => { e.stopPropagation(); onViewDetails(track); }} className="text-xs font-bold text-pink-500 hover:text-pink-700 dark:hover:text-pink-400 p-1">Analysis</button>}
            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(track.id); }} className="text-gray-400 hover:text-red-500 transition-colors p-1"><i className="fas fa-trash-alt"></i></button>}
         </div>
      </div>
    </article>
  );
};

export default TrackCard;
