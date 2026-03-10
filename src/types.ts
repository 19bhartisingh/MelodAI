
export type ModelVariant = 'musicgen-small' | 'musicgen-medium' | 'musicgen-large' | 'musicgen-melody';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface MoodTemplate {
  name: string;
  label: string;
  description: string;
  basePrompt: string;
  color: string;
  icon: string;
}

export interface ExamplePrompt {
  category: string;
  text: string;
}

export interface GenerationPreset {
  id: string;
  name: string;
  modelVariant: ModelVariant;
  duration: number;
  description: string;
}

export interface MasteringParams {
  eqLow: number;    // -12 to 12 dB
  eqMid: number;    // -12 to 12 dB
  eqHigh: number;   // -12 to 12 dB
  compression: number; // 0 to 1
  stereoWidth: number; // 0 to 2
  limiterThreshold: number; // -20 to 0 dB
  reverbAmount: number; // 0 to 1
  delayAmount: number; // 0 to 1
  delayFeedback: number; // 0 to 1
  presetName?: string;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string; 
  duration: number;
  temperature: number;
  topK: number;
  topP: number;
  cfgCoef: number;
  mood?: string;
  seed?: number; 
  modelVariant: ModelVariant;
  energyLevel?: number;
  tempo?: string;
  instruments?: string;
  keySignature?: string; 
  timeSignature?: string; 
  rhythmicDensity?: number; 
  harmonicComplexity?: 'simple' | 'balanced' | 'complex'; 
  referenceMelody?: string; 
  melodyAdherence?: number; 
  sfx?: string[];
  mastering?: MasteringParams;
  audioInput?: string; // Base64 audio data
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: Date;
  color: string;
}

export type ViewState = 'dashboard' | 'home' | 'generate' | 'history' | 'test-suite' | 'mastering' | 'settings' | 'playlist-detail' | 'landing';

export interface MoodAlignmentMetrics {
  detectedBPM: number;
  energyLevel: number;
  brightness: number;
  tempoMatchScore: number;
}

export interface QualityMetrics {
  clipping: number;
  averageRMS: number;
  silencePercentage: number;
  dynamicRange: number;
  durationAccuracy: number;
  frequencyBalance: number;
  moodAlignment?: MoodAlignmentMetrics;
}

export interface QualityScore {
  overall: number;
  metrics: QualityMetrics;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
}

export interface UserFeedback {
  rating: number;
  tags: string[];
  comment?: string;
  timestamp: Date;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  promptUsed: string;
  duration: number;
  imageUrl: string;
  audioUrl: string; 
  createdAt: Date;
  mood: string;
  genre?: string;
  params: GenerationParams;
  isFavorite: boolean;
  score?: QualityScore;
  feedback?: UserFeedback; 
  generationTime?: number;
  parentTrackId?: string; 
  modelUsed?: string;
  fromCache?: boolean;
  masteringConfig?: MasteringParams;
}

export interface ModelOption {
  id: ModelVariant;
  name: string;
  description: string;
  paramsCount: string;
  estTimePerSec: number;
  memoryReq: string;
  useCase: string;
}

export interface NoteEvent {
  pitch: string;
  startTime: number;
  duration: number;
  velocity?: number; // 0.0 to 1.0 for dynamics
}

export interface MusicalScore {
  tempo: number;
  key: string;
  melody: NoteEvent[];
  bass: NoteEvent[];
  harmony?: NoteEvent[];
  drums: {
    kick?: number[];
    snare?: number[];
    hihat?: number[];
    percussion?: { time: number; type: 'dhol' | 'tabla' | 'conga' | 'shaker' }[];
  };
}

export interface PromptAnalysis {
  mood: string;
  energyLevel: number;
  genre: string;
  tempo: string;
  instruments: string[]; 
  context: string[];
  confidence: number;
  harmonicComplexity: 'simple' | 'balanced' | 'complex';
  rhythmicDensity: number; 
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GenerationState {
  status: 'idle' | 'processing' | 'error' | 'success';
  progress: number;
  step: string;
  details?: string;
  error?: string;
}
