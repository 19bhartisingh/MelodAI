
import { GenerationParams, MusicalScore, NoteEvent } from "../types";

const SAMPLE_RATE = 44100;

const SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const noteToFreq = (note: string): number => {
  try {
    const match = note.match(/^([a-gA-G])(#|b)?(\d)$/);
    if (!match) return 440;
    const letter = match[1].toUpperCase();
    const accidental = match[2] || '';
    const octave = parseInt(match[3]);
    const key = letter + accidental;
    const semitone = SEMITONES[key] || 0;
    const midi = 12 * (octave + 1) + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  } catch {
    return 440;
  }
};

const createReverbImpulse = (ctx: BaseAudioContext, duration: number = 2.5) => {
    const length = ctx.sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
            // Exponential decay noise for natural tail
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 4);
        }
    }
    return impulse;
};

/**
 * High-Fidelity Synthesis Engine
 */
export const renderScoreToAudio = async (score: MusicalScore, duration: number): Promise<string> => {
    const loopDuration = 4.0; 
    const loopCtx = new OfflineAudioContext(2, Math.ceil(SAMPLE_RATE * loopDuration), SAMPLE_RATE);
    
    const masterGain = loopCtx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(loopCtx.destination);

    const reverb = loopCtx.createConvolver();
    reverb.buffer = createReverbImpulse(loopCtx);
    const revGain = loopCtx.createGain();
    revGain.gain.value = 0.2;
    revGain.connect(reverb);
    reverb.connect(masterGain);

    const renderInstrument = (events: NoteEvent[], volume: number, type: 'melody' | 'bass') => {
        if (!events || !Array.isArray(events)) return;
        events.forEach(note => {
            const t = note.startTime || 0;
            const d = Math.max(0.1, note.duration || 0.4);
            const freq = noteToFreq(note.pitch || (type === 'bass' ? "C2" : "C4"));
            const vel = note.velocity || 1.0;

            const carrier = loopCtx.createOscillator();
            const modulator = loopCtx.createOscillator();
            const modGain = loopCtx.createGain();
            const g = loopCtx.createGain();

            if (type === 'melody') {
                // FM synthesis for "organic" string/wind textures
                carrier.type = 'triangle';
                modulator.type = 'sine';
                modulator.frequency.value = freq * 1.5; 
                modGain.gain.value = freq * 0.7 * vel; 
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
            } else {
                // Sub-resonant bass
                carrier.type = 'sine';
                const sub = loopCtx.createOscillator();
                sub.type = 'triangle';
                sub.frequency.value = freq;
                sub.connect(g);
                sub.start(t); sub.stop(t + d);
            }

            carrier.frequency.setValueAtTime(freq, t);
            
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(volume * vel, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + d);
            
            carrier.connect(g);
            g.connect(masterGain);
            if (type === 'melody') g.connect(revGain);
            
            carrier.start(t);
            carrier.stop(t + d);
            modulator.start(t);
            modulator.stop(t + d);
        });
    };

    renderInstrument(score.melody, 0.2, 'melody');
    renderInstrument(score.bass, 0.45, 'bass');

    const drumHit = (t: number, type: 'kick' | 'snare' | 'hat' | 'dhol' | 'tabla') => {
        const g = loopCtx.createGain();
        g.connect(masterGain);

        if (type === 'dhol') {
            // Real-world Dhol simulation: Resonant body + skin slap
            const body = loopCtx.createOscillator();
            body.frequency.setValueAtTime(160, t);
            body.frequency.exponentialRampToValueAtTime(60, t + 0.1);
            
            const slap = loopCtx.createOscillator();
            slap.type = 'square';
            slap.frequency.setValueAtTime(450, t);
            const slapGain = loopCtx.createGain();
            slapGain.gain.setValueAtTime(0.08, t);
            slapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
            
            g.gain.setValueAtTime(0.8, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            
            body.connect(g);
            slap.connect(slapGain); slapGain.connect(g);
            body.start(t); body.stop(t + 0.25);
            slap.start(t); slap.stop(t + 0.25);
        } else if (type === 'kick') {
            const osc = loopCtx.createOscillator();
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
            g.gain.setValueAtTime(0.85, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(g); osc.start(t); osc.stop(t + 0.15);
        } else if (type === 'snare') {
            const osc = loopCtx.createOscillator();
            osc.type = 'triangle'; osc.frequency.value = 200;
            g.gain.setValueAtTime(0.4, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(g); osc.start(t); osc.stop(t + 0.1);
        } else if (type === 'hat') {
            const osc = loopCtx.createOscillator();
            osc.type = 'square'; osc.frequency.value = 14000;
            g.gain.setValueAtTime(0.06, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.connect(g); osc.start(t); osc.stop(t + 0.05);
        }
    };

    if (score.drums?.kick) score.drums.kick.forEach(t => drumHit(t, 'kick'));
    if (score.drums?.snare) score.drums.snare.forEach(t => drumHit(t, 'snare'));
    if (score.drums?.hihat) score.drums.hihat.forEach(t => drumHit(t, 'hat'));
    if (score.drums?.percussion) {
        score.drums.percussion.forEach(p => drumHit(p.time, p.type as any));
    }

    const loopBuffer = await loopCtx.startRendering();
    
    // Tiling Logic for up to 15 minutes
    const finalLenSamples = Math.ceil(SAMPLE_RATE * duration);
    const finalCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    const finalBuffer = finalCtx.createBuffer(2, finalLenSamples, SAMPLE_RATE);
    const loopLenSamples = loopBuffer.length;
    
    for (let offset = 0; offset < finalLenSamples; offset += loopLenSamples) {
        const chunk = Math.min(loopLenSamples, finalLenSamples - offset);
        for (let ch = 0; ch < 2; ch++) {
            finalBuffer.getChannelData(ch).set(loopBuffer.getChannelData(ch).subarray(0, chunk), offset);
        }
    }

    const blob = await bufferToWaveBlob(finalBuffer);
    return URL.createObjectURL(blob);
};

const bufferToWaveBlob = (buffer: AudioBuffer): Promise<Blob> => {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const bufferArray = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArray);

    const writeString = (v: DataView, offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return Promise.resolve(new Blob([bufferArray], { type: 'audio/wav' }));
};

export const generateProceduralAudio = async (params: GenerationParams, score?: MusicalScore): Promise<string> => {
    if (score) {
        return renderScoreToAudio(score, params.duration);
    }
    return "";
};
