
import React, { useState } from 'react';
import { Track, UserFeedback } from '../types';
import WaveformVisualizer from './WaveformVisualizer';
import { Sliders, Star, Send, CheckCircle, Info } from 'lucide-react';

interface GenerationResultProps {
  track: Track;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onClose: () => void;
  onMaster?: () => void;
  onSubmitFeedback?: (id: string, fb: UserFeedback) => void;
}

const GenerationResult: React.FC<GenerationResultProps> = ({ 
  track, isPlaying, onPlayPause, onClose, onMaster, onSubmitFeedback 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(!!track.feedback);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      day: 'numeric', month: 'short'
    }).format(new Date(date));
  };

  const getGradeColor = (grade?: string) => {
    switch(grade) {
      case 'A': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'F': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) return;
    const fb: UserFeedback = {
      rating,
      comment: suggestion,
      tags: [],
      timestamp: new Date()
    };
    onSubmitFeedback?.(track.id, fb);
    setSubmitted(true);
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-6 duration-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-100/30 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8 relative z-10">
        <div className="flex items-center gap-6 w-full">
            <div className="relative group shrink-0">
                <img src={track.imageUrl} alt={track.title} className="w-28 h-28 rounded-2xl shadow-xl object-cover border border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={onPlayPause}
                  className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-3xl drop-shadow-lg`}></i>
                </button>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-black px-3 py-1 rounded-full border border-pink-100 dark:border-pink-900/50 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={12} /> Music Generated
                    </span>
                    <span className="text-gray-400 text-[10px] font-mono uppercase tracking-wider">{formatDate(track.createdAt)}</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 truncate tracking-tighter">{track.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{track.description}</p>
                
                <div className="flex flex-wrap gap-3">
                  <button onClick={onPlayPause} className="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full text-xs font-black transition-all shadow-lg active:scale-95">
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i> {isPlaying ? 'PAUSE' : 'PLAY MASTER'}
                  </button>
                  {onMaster && (
                    <button onClick={onMaster} className="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-full text-xs font-black transition-all border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95">
                        <Sliders size={14} className="text-pink-500" /> Expertise
                    </button>
                  )}
                </div>
            </div>
        </div>

        {track.score && (
          <div className={`p-6 rounded-[2rem] border flex flex-col items-center justify-center shrink-0 min-w-[140px] shadow-sm ${getGradeColor(track.score.grade)}`}>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Quality</div>
            <div className="text-4xl font-black tracking-tighter mb-1">{track.score.grade}</div>
            <div className="text-xs font-bold">{track.score.overall}%</div>
          </div>
        )}
      </div>

      <div className="bg-gray-50/50 dark:bg-gray-950/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-8 relative group shadow-inner">
          <div className="h-28 w-full">
            <WaveformVisualizer audioUrl={track.audioUrl} height={112} />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Detail Toggle */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900/50 overflow-hidden flex flex-col">
          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <span className="font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-3 group-hover:text-pink-600 transition-colors">
                  <Info size={16} className="text-pink-500" /> Prompt Analysis
              </span>
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
          </button>
          
          {isExpanded && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/30 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Synthetic Prompt</label>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{track.promptUsed}"</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-500">{track.mood}</span>
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-500">{track.duration}S</span>
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-pink-50/30 dark:bg-pink-900/5 border border-pink-100/50 dark:border-pink-800/10 rounded-3xl p-6 flex flex-col">
           {submitted ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <CheckCircle size={24} />
                </div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Feedback Received!</h4>
                <p className="text-xs text-gray-500">Your review helps improve the synthesis engine.</p>
             </div>
           ) : (
             <>
               <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400 mb-4 flex items-center gap-2">
                 <Star size={12} /> Rate your music experience
               </h4>
               <div className="flex gap-2 mb-4">
                 {[1, 2, 3, 4, 5].map(s => (
                   <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className={`transition-all hover:scale-110 ${rating >= s ? 'text-pink-500' : 'text-gray-300 dark:text-gray-700'}`}
                   >
                     <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
                   </button>
                 ))}
               </div>
               <div className="relative">
                 <input 
                  type="text" 
                  placeholder="Review or optional suggestion..." 
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 px-4 pr-12 text-xs font-bold focus:outline-none focus:border-pink-500 transition-colors shadow-sm"
                 />
                 <button 
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pink-500 hover:text-pink-700 disabled:opacity-30 disabled:hover:text-pink-500"
                 >
                   <Send size={16} />
                 </button>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          Close Results
        </button>
      </div>
    </div>
  );
};

export default GenerationResult;
