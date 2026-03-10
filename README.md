

# 🎵 **MelodAI – Professional AI Music Studio**



**MelodAI** is a high-performance, professional-grade **AI Music Studio** that transforms text prompts into high-fidelity audio using a hybrid AI + DSP architecture. Designed with a **Spotify-inspired UI**, it serves musicians, content creators, and AI enthusiasts who want both **creative freedom and technical control**.

---

## 🚀 Core Architecture – *The Hybrid Composer*

Unlike black-box audio generators, MelodAI uses a **Hybrid Synthesis Approach**:

### 🎼 Composer (AI Brain)

* 
* Converts text prompts into **structured musical JSON**
* Outputs tempo, key, rhythm, melody, bass, and drum events
* Sub-30 second response time for fast iteration

### 🔊 Synthesizer (Browser DSP)

* Custom **Web Audio API** engine
* Converts musical JSON into layered **WAV audio**
* Runs entirely in the browser for low latency

---

## 🎛️ Studio Interface (Generator)

* **Prompt Enhancement (Magic Wand)**
  Expands simple ideas into professional sound design briefs
* **Audio Referencing**
  Record a hum or beat → AI extracts rhythm & texture
* **World Instrumentation**
  Authentic synthesis of Dhol, Tabla, Sitar
* **Advanced Controls**
  Energy, Temperature, Top-K / Top-P sliders for creativity tuning

---

## 🎚️ Professional Mastering Lab

* **Real-Time Spectrogram** (20Hz–20kHz)
* **Dynamic Processing**
  3-band EQ, Compression, Limiter
* **Spatial Effects**
  Reverb, Stereo Width, Cinematic ambience
* **Batch Export**
  Download mastered tracks as ZIP

---

## 📊 Quality Scorer & Feedback Loop

* **Automated Audio Judge**

  * Clipping detection
  * Dynamic range analysis
  * Silence percentage
  * Tempo stability
* **Grade System**: A–F with percentage score
* **User Feedback**

  * Star ratings (1–5)
  * Custom tags (“Rhythm off”, “Perfect”)
  * Stored locally for prompt optimization

---



* **Sidebar Navigation**

  * Dashboard
  * Discover
  * Library
  * Analytics
* **Global Player**

  * Persistent footer
  * Waveform visualizer
  * Immersive full-screen mode
* **Intelligent Caching**

  * IndexedDB for instant regeneration
  * Saves API usage & time

### ⌨️ Keyboard Shortcuts

* `Ctrl + Enter` → Generate
* `Space` → Play / Pause
* `Ctrl + D` → Download master

---

## 🧱 Technical Stack

* **Frontend**: **React v19**, Tailwind CSS
* **Icons**: Lucide-React, FontAwesome
* **AI**: Google Gemini SDK (`@google/genai`)
* **Audio**: Web Audio API (`OfflineAudioContext`)
* **Storage**:

  * LocalStorage → Auth & preferences
  * IndexedDB → Audio caching

---

## 🌟 Vision

MelodAI is not just a generator—it is a **full end-to-end music production environment**.
It treats AI as a **collaborative producer**, combining automation speed with professional-grade creative control.

---

### 📌 Status

> Actively developed • Performance-optimized • Studio-ready

Below is an **updated README section** you can **append directly** to your existing `README.md`.
It adds **clear, professional steps to run the project locally**.

---

## ⚙️ Getting Started – Run MelodAI Locally

Follow these steps to set up and run **MelodAI** on your local machine.

---

## 📋 Prerequisites

Ensure the following are installed:

* **Node.js** (v18 or later)
* **npm** or **yarn**
* A modern browser (Chrome / Edge recommended)
* **Google Gemini API Key**

---

## 🔑 Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/melodai.git
cd melodai
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```



## ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## 🎧 Using MelodAI

1. Enter a **music prompt** (e.g., *“Lo-fi chill beats with vinyl texture”*)
2. (Optional) Use **Magic Wand** for prompt enhancement
3. Adjust **Energy / Temperature / Top-K / Top-P**
4. Click **Generate** or press `Ctrl + Enter`
5. Master, preview, and **download WAV or ZIP**

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🛠 Troubleshooting

* **No sound?**
  Ensure browser audio permissions are enabled.
* **Slow generation?**
  Check Gemini API quota and network speed.
* **Cache issues?**
  Clear IndexedDB via browser dev tools.

---

## ✅ Recommended Browser Settings

* Enable **Hardware Acceleration**
* Allow **Microphone Access** (for audio referencing)
* Disable aggressive ad/script blockers

---



