<div align="center">

<img src="https://img.shields.io/badge/MelodAI-Professional%20AI%20Music%20Studio-6366f1?style=for-the-badge&logo=music&logoColor=white" alt="MelodAI" />

<br/>

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-DSP%20Engine-FF6B6B?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

**MelodAI** is a professional-grade AI Music Studio that transforms text prompts into high-fidelity audio using a hybrid AI + DSP architecture — built with a Spotify-inspired interface for musicians, creators, and AI enthusiasts.

[✨ Features](#-features) · [🚀 Quick Start](#-quick-start) · [🏗️ Architecture](#️-architecture) · [🎛️ Studio Guide](#️-studio-guide) · [🛠️ Troubleshooting](#️-troubleshooting)

---

</div>

## 🎵 What is MelodAI?

MelodAI is a **full end-to-end music production environment** that runs entirely in the browser. Unlike black-box audio generators, it exposes the full creative pipeline — from prompt to mastered WAV — giving you both the speed of AI automation and the nuance of professional studio controls.

```
Text Prompt  ──►  Gemini AI (Composer)  ──►  Musical JSON  ──►  Web Audio DSP  ──►  Mastered WAV
```

---

## ✨ Features

### 🎼 AI Composition Engine
- **Prompt-to-Music** — Converts natural language into structured musical JSON (tempo, key, rhythm, melody, bass, drums)
- **Magic Wand Enhancement** — Expands simple ideas into professional sound design briefs automatically
- **Audio Referencing** — Record a hum or beat; AI extracts rhythm & texture as a generation seed
- **World Instrumentation** — Authentic browser synthesis of Dhol, Tabla, and Sitar
- **Creativity Controls** — Energy, Temperature, Top-K, and Top-P sliders for fine-tuned generation

### 🎚️ Professional Mastering Lab
- **Real-Time Spectrogram** — Full 20 Hz–20 kHz visual frequency analysis
- **3-Band EQ** — Independent low / mid / high shelving
- **Dynamic Processing** — Compressor and limiter with adjustable thresholds
- **Spatial Effects** — Reverb and stereo width controls for cinematic ambience
- **Batch Export** — Download all mastered tracks as a single ZIP

### 📊 Quality Scorer & Feedback Loop
- **Automated Audio Judge** — Checks clipping, dynamic range, silence ratio, and tempo stability
- **Grade System** — A–F letter grades with percentage score
- **User Feedback** — 1–5 star ratings with custom tags ("Rhythm off", "Perfect") stored locally for prompt optimization

### 🖥️ Studio Interface
- **Spotify-inspired UI** — Dark theme with sidebar navigation (Dashboard · Discover · Library · Analytics)
- **Global Persistent Player** — Footer player with waveform visualizer and full-screen immersive mode
- **Intelligent Caching** — IndexedDB stores generated audio for instant regeneration without extra API calls

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Generate music |
| `Space` | Play / Pause |
| `Ctrl + D` | Download master |

---

## 🏗️ Architecture

MelodAI uses a two-stage **Hybrid Composer** pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│                        HYBRID COMPOSER                      │
│                                                             │
│  ┌──────────────────────┐     ┌──────────────────────────┐  │
│  │   🎼 AI COMPOSER      │     │   🔊 BROWSER DSP          │  │
│  │  (Google Gemini)     │────►│   (Web Audio API)        │  │
│  │                      │     │                          │  │
│  │  • Prompt parsing    │     │  • OfflineAudioContext   │  │
│  │  • Structural JSON   │     │  • Layered WAV rendering │  │
│  │  • Sub-30s response  │     │  • Zero-latency output   │  │
│  └──────────────────────┘     └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Source Structure

```
src/
├── components/
│   ├── LandingPage.tsx          # Entry / auth screen
│   ├── GeneratorPanel.tsx       # Prompt input & generation controls
│   ├── GenerationResult.tsx     # Playback & result display
│   ├── MasteringPanel.tsx       # EQ, compression, spatial effects
│   ├── Spectrogram.tsx          # Real-time frequency visualizer
│   ├── WaveformVisualizer.tsx   # Waveform display component
│   ├── Player.tsx               # Global persistent player
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── DashboardView.tsx        # Home dashboard
│   ├── LibraryView.tsx          # Track library browser
│   ├── StatsView.tsx            # Analytics & stats
│   ├── SettingsView.tsx         # User preferences
│   ├── TrackCard.tsx            # Track list item
│   ├── QualityDetailsModal.tsx  # Quality score breakdown
│   └── MusicalBackground.tsx    # Animated ambient background
├── services/
│   ├── geminiService.ts         # Google Gemini API integration
│   ├── audioGenerator.ts        # DSP synthesis engine
│   ├── audioProcessor.ts        # Mastering processing chain
│   ├── audioScorer.ts           # Automated quality analysis
│   ├── authService.ts           # Authentication logic
│   └── cacheService.ts          # IndexedDB caching layer
├── App.tsx                      # Root component & routing
├── types.ts                     # Shared TypeScript interfaces
├── constants.ts                 # App-wide constants
└── main.tsx                     # Vite entry point
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19, TypeScript 5.6 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React, FontAwesome |
| **AI Model** | Google Gemini (`@google/genai`) |
| **Audio Engine** | Web Audio API (`OfflineAudioContext`) |
| **Compression** | JSZip |
| **Storage** | LocalStorage (auth/prefs) · IndexedDB (audio cache) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or later
- **npm** or **yarn**
- A modern browser — Chrome or Edge recommended
- A **Google Gemini API Key** ([get one here](https://aistudio.google.com/app/apikey))

### 1 · Clone the repository

```bash
git clone https://github.com/19singhbharti/melodai.git
cd melodai
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Configure environment

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4 · Start the dev server

```bash
npm run dev
```

Open your browser at **http://localhost:5173** and start making music.

---

## 🎛️ Studio Guide

1. **Write a prompt** — e.g. `"Lo-fi chill beats with vinyl crackle and a melancholic piano melody"`
2. **Enhance it** — click the ✨ Magic Wand to expand your prompt into a detailed sound brief
3. **Tune creativity** — adjust Energy, Temperature, Top-K, and Top-P to taste
4. **Generate** — click **Generate** or press `Ctrl + Enter`
5. **Master** — open the Mastering Lab to apply EQ, compression, reverb, and stereo width
6. **Export** — download your track as a WAV or grab all your session tracks as a ZIP

---

## 📦 Production Build

Build an optimized bundle for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The `dist/` directory contains the static output ready to deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## 🛠️ Troubleshooting

| Symptom | Fix |
|---|---|
| **No sound on playback** | Check that your browser has audio permission enabled and is not muted at OS level |
| **Slow or failed generation** | Verify your Gemini API key is valid and you have remaining quota |
| **Stale / incorrect audio after regeneration** | Clear IndexedDB via DevTools → Application → Storage → IndexedDB |
| **Microphone not working for audio referencing** | Allow microphone access in browser site settings |
| **Build fails on TypeScript errors** | Run `npx tsc --noEmit` to surface type errors before building |

### Recommended Browser Settings

- ✅ Enable **Hardware Acceleration**
- ✅ Allow **Microphone Access** (required for audio referencing)
- ✅ Disable aggressive ad/script blockers that interfere with Web Audio API

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Here's how to get involved:

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**MelodAI** — *Where your words become music.*

Made with ♥ using React · Gemini · Web Audio API

</div>
