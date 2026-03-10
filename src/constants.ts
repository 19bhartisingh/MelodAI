
import { MoodTemplate, ExamplePrompt, ModelOption, GenerationPreset } from './types';

export const INPUT_LIMITS = {
  MIN_CHARS: 10,
  MAX_CHARS: 500,
  HISTORY_LIMIT: 5
};

export const PRESET_INSTRUMENTS = [
  "Piano", "Synth", "Electric Guitar", "Acoustic Guitar", "Drums", 
  "Bass", "Violin", "Cello", "Flute", "Saxophone", "Trumpet", 
  "Pads", "Lead Synth", "808 Bass", "Strings", "Organ"
];

export const WORLD_INSTRUMENTS = [
    "Sitar (India)", "Koto (Japan)", "Oud (Middle East)", "Kalimba (Africa)",
    "Tabla (India)", "Djembe (Africa)", "Guzheng (China)", "Bagpipes (Celtic)",
    "Didgeridoo (Australia)", "Bouzouki (Greece)", "Steel Drum (Caribbean)",
    "Erhu (China)", "Marimba", "Hang Drum", "Pan Flute"
];

export const WORLD_MODES = [
    { name: "Major/Minor", desc: "Standard Western" },
    { name: "Maqam Hicaz", desc: "Middle Eastern (Phrygian Dominant vibes)" },
    { name: "Raga Bhairavi", desc: "Indian Classical (Morning Mood)" },
    { name: "Slendro", desc: "Javanese Gamelan (5-note scale)" },
    { name: "In-Sen", desc: "Japanese Pentatonic" },
    { name: "Hirajoshi", desc: "Japanese Traditional" }
];

export const SFX_OPTIONS = [
  { id: 'rain', label: 'Rain', icon: 'fa-cloud-rain' },
  { id: 'vinyl', label: 'Vinyl', icon: 'fa-compact-disc' },
  { id: 'birds', label: 'Birds', icon: 'fa-kiwi-bird' },
  { id: 'waves', label: 'Ocean', icon: 'fa-water' },
  { id: 'fire', label: 'Fire', icon: 'fa-fire' },
  { id: 'city', label: 'City', icon: 'fa-city' }
];

export const MOOD_TEMPLATES: Record<string, MoodTemplate> = {
  happy: {
    name: 'happy',
    label: 'Happy',
    description: 'Upbeat and cheerful vibes',
    basePrompt: "upbeat, cheerful, major key, bright instruments, energetic rhythm, positive vibes, {tempo} BPM",
    color: 'bg-yellow-500',
    icon: 'fa-smile'
  },
  sad: {
    name: 'sad',
    label: 'Sad',
    description: 'Melancholic and emotional',
    basePrompt: "melancholic, slow tempo, minor key, emotional, piano and strings, reflective, somber mood",
    color: 'bg-blue-600',
    icon: 'fa-sad-tear'
  },
  energetic: {
    name: 'energetic',
    label: 'Energetic',
    description: 'High energy and driving',
    basePrompt: "high energy, fast-paced, driving beat, intense rhythm, powerful, dynamic, {tempo} BPM",
    color: 'bg-red-500',
    icon: 'fa-bolt'
  },
  calm: {
    name: 'calm',
    label: 'Calm',
    description: 'Peaceful and ambient',
    basePrompt: "peaceful, ambient textures, soft pads, slow tempo, meditation, nature sounds, relax",
    color: 'bg-teal-400',
    icon: 'fa-spa'
  },
  world: {
      name: 'world',
      label: 'Global',
      description: 'Ethnic and world textures',
      basePrompt: "ethnic, world music, traditional instruments, exotic scales, complex percussion, global vibes",
      color: 'bg-orange-600',
      icon: 'fa-globe'
  },
  mysterious: {
    name: 'mysterious',
    label: 'Mysterious',
    description: 'Dark and suspenseful',
    basePrompt: "dark atmospheric, minor scales, suspenseful, synth drones, slow build, cinematic thriller",
    color: 'bg-indigo-900',
    icon: 'fa-user-secret'
  }
};

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  { category: 'World', text: "Traditional Japanese Zen garden music with Koto and Shakuhachi flute" },
  { category: 'Energetic', text: "Energetic West African drum ensemble with Djembe and polyrhythms" },
  { category: 'World', text: "Meditative Indian Sitar piece in Raga Bhairavi with Tabla" },
  { category: 'Mysterious', text: "Desert caravan atmosphere with Oud and nomadic percussion" },
  { category: 'Happy', text: "Celtic highland theme with bagpipes and driving folk rhythm" },
  { category: 'Happy', text: "Upbeat pop song with catchy synth melody and driving rhythm" },
  { category: 'Calm', text: "Peaceful lo-fi hip hop beat for studying and relaxing" },
  { category: 'Sad', text: "Somber cinematic piano with deep cello accompaniment and vinyl crackle" },
  { category: 'Energetic', text: "High-energy Cyberpunk techno with aggressive basslines and neon synths" },
  { category: 'Calm', text: "Ethereal ambient pads with soft ocean wave sounds for deep meditation" }
];

export const QUICK_TAGS = [
  "Lo-fi", "Cinematic", "Cyberpunk", "Meditation", "8-bit", "Jazz", "Techno", "Piano", "Nature"
];

export const MODEL_VARIANTS: ModelOption[] = [
  {
    id: 'musicgen-small',
    name: 'MusicGen Small',
    description: 'Fastest generation, good for simple melodies.',
    paramsCount: '300M',
    estTimePerSec: 0.5,
    memoryReq: '2GB',
    useCase: 'Quick Prototyping'
  },
  {
    id: 'musicgen-medium',
    name: 'MusicGen Medium',
    description: 'Balanced quality and speed. Recommended.',
    paramsCount: '1.5B',
    estTimePerSec: 1.0,
    memoryReq: '6GB',
    useCase: 'General Purpose'
  },
  {
    id: 'musicgen-large',
    name: 'MusicGen Large',
    description: 'Highest fidelity, slower generation.',
    paramsCount: '3.3B',
    estTimePerSec: 2.5,
    memoryReq: '12GB',
    useCase: 'Final Production'
  }
];

export const GENERATION_PRESETS: GenerationPreset[] = [
  {
    id: 'standard',
    name: 'Standard Quality',
    modelVariant: 'musicgen-medium',
    duration: 30,
    description: 'Balanced settings for most use cases.'
  }
];
