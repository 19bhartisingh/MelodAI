import React, { useState } from 'react';
import { Track, QualityMetrics, UserFeedback } from '../types';

interface QualityDetailsModalProps {
  track: Track;
  onClose: () => void;
  onSubmitFeedback: (trackId: string, feedback: UserFeedback) => void;
}

const QualityDetailsModal: React.FC<QualityDetailsModalProps> = ({ track, onClose, onSubmitFeedback }) => {
  const [rating, setRating] = useState<number>(track.feedback?.rating || 0);
  const [selectedTags, setSelectedTags] = useState<string[]>(track.feedback?.tags || []);
  const [comment, setComment] = useState<string>(track.feedback?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updated categories based on request
  const feedbackCategories = [
    "Perfect!", "Doesn't match mood", "Poor audio quality", 
    "Too repetitive", "Good Melody", "Too Quiet", 
    "Distorted", "Unexpected ending", "Rhythm off"
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
        onSubmitFeedback(track.id, {
            rating,
            tags: selectedTags,
            comment,
            timestamp: new Date()
        });
        setIsSubmitting(false);
        onClose();
    }, 500);
  };

  const MetricBar = ({ label, value, max, thresholdLow, thresholdHigh, inverse = false, unit = '', helpText = '' }: any) => {
    // Normal: Low is bad (red), High is good (green)
    // Inverse: Low is good (green), High is bad (red)
    
    let color = 'bg-gray-300';
    let percentage = Math.min(100, (value / max) * 100);
    
    if (inverse) {
        if (value <= thresholdLow) color = 'bg-green-500';
        else if (value <= thresholdHigh) color = 'bg-yellow-400';
        else color = 'bg-red-500';
    } else {
        if (value >= thresholdHigh) color = 'bg-green-500';
        else if (value >= thresholdLow) color = 'bg-yellow-400';
        else color = 'bg-red-500';
    }

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide" title={helpText}>{label} <i className="fas fa-info-circle text-gray-300 ml-1"></i></span>
                <span className="text-xs font-mono text-gray-500">{value.toFixed(3)}{unit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
  };

  const metrics = track.score?.metrics;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* LEFT: Quality Analysis */}
        <div className="md:w-1/2 p-6 md:p-8 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
             <div className="flex justify-between items-center mb-6 md:hidden">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <i className="fas fa-chart-bar text-pink-500"></i> Quality
                 </h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-black">
                    <i className="fas fa-times text-xl"></i>
                 </button>
            </div>
            <h2 className="hidden md:flex text-xl font-bold mb-6 items-center gap-2 text-gray-800">
                <i className="fas fa-chart-bar text-pink-500"></i> Quality Analysis
            </h2>
            
            {track.score ? (
                <>
                    <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                            track.score.grade === 'A' ? 'border-green-200 text-green-600 bg-green-50' :
                            track.score.grade === 'B' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                            track.score.grade === 'F' ? 'border-red-200 text-red-600 bg-red-50' :
                            'border-yellow-200 text-yellow-600 bg-yellow-50'
                        }`}>
                            {track.score.grade}
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Overall Score</div>
                            <div className="text-2xl font-bold text-gray-900">{track.score.overall}/100</div>
                        </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-2">
                        <MetricBar 
                            label="Clipping / Distortion" 
                            value={metrics?.clipping || 0} 
                            max={0.05} thresholdLow={0.005} thresholdHigh={0.02} 
                            inverse={true}
                            helpText="Percentage of audio samples that exceed maximum volume, causing harsh distortion."
                        />
                        <MetricBar 
                            label="Dynamic Range" 
                            value={metrics?.dynamicRange || 0} 
                            max={0.5} thresholdLow={0.05} thresholdHigh={0.15} 
                            inverse={false}
                            helpText="Difference between loud and quiet parts. Higher is generally better for musicality."
                        />
                        <MetricBar 
                            label="Silence" 
                            value={metrics?.silencePercentage || 0} 
                            max={0.5} thresholdLow={0.05} thresholdHigh={0.2} 
                            inverse={true}
                            helpText="Percentage of track that is silent. Too much silence indicates generation failure."
                        />
                        {metrics?.moodAlignment && (
                             <MetricBar 
                                label="Tempo Stability" 
                                value={metrics.moodAlignment.tempoMatchScore} 
                                max={1} thresholdLow={0.5} thresholdHigh={0.8} 
                                inverse={false}
                                helpText="How well the detected rhythm matches the expected BPM for the mood."
                            />
                        )}
                         <MetricBar 
                            label="Spectral Balance" 
                            value={metrics?.frequencyBalance || 0} 
                            max={1} thresholdLow={0.2} thresholdHigh={0.6} 
                            inverse={false}
                            helpText="Distribution of frequencies. Higher means brighter sound."
                        />
                    </div>

                    {track.score.issues.length > 0 && (
                        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                            <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Detected Issues</h4>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                {track.score.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-gray-400 py-10">
                    <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Analysis data unavailable</p>
                </div>
            )}
        </div>

        {/* RIGHT: User Feedback */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="hidden md:flex justify-between items-start mb-6">
                 <h2 className="text-xl font-bold text-gray-800">Your Feedback</h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-black">
                    <i className="fas fa-times text-xl"></i>
                 </button>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 md:hidden">Your Feedback</h2>

            <div className="flex-1">
                <p className="text-gray-600 text-sm mb-4">Help us improve the AI model by rating this generation.</p>
                
                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                        >
                            <i className="fas fa-star"></i>
                        </button>
                    ))}
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">What did you think?</label>
                    <div className="flex flex-wrap gap-2">
                        {feedbackCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => toggleTag(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                    selectedTags.includes(cat) 
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment Box */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Additional Comments (Optional)</label>
                    <textarea 
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-pink-500 focus:outline-none resize-none h-24"
                        placeholder="Describe what you heard..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                </div>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : "Submit Feedback"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default QualityDetailsModal;