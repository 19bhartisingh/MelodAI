
import { MasteringParams } from "../types";

export class AudioProcessor {
  private ctx: AudioContext;
  private analyzer: AnalyserNode;
  
  // Mastering Chain Nodes
  private lowEQ: BiquadFilterNode;
  private midEQ: BiquadFilterNode;
  private highEQ: BiquadFilterNode;
  private compressor: DynamicsCompressorNode;
  private delay: DelayNode;
  private delayGain: GainNode;
  private delayFeedback: GainNode;
  private reverb: ConvolverNode;
  private reverbGain: GainNode;
  private limiter: DynamicsCompressorNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private masterGain: GainNode;

  // Playback state
  private source: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.ctx.createAnalyser();
    this.analyzer.fftSize = 2048;

    this.lowEQ = this.ctx.createBiquadFilter();
    this.lowEQ.type = 'lowshelf';
    this.lowEQ.frequency.value = 320;

    this.midEQ = this.ctx.createBiquadFilter();
    this.midEQ.type = 'peaking';
    this.midEQ.frequency.value = 1000;

    this.highEQ = this.ctx.createBiquadFilter();
    this.highEQ.type = 'highshelf';
    this.highEQ.frequency.value = 3200;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.25;

    this.delay = this.ctx.createDelay(1.0);
    this.delayGain = this.ctx.createGain();
    this.delayFeedback = this.ctx.createGain();

    this.reverb = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();

    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -0.1;
    this.limiter.ratio.value = 20;

    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    this.masterGain = this.ctx.createGain();

    this.setupImpulse();
    this.wireChain();
  }

  private async setupImpulse() {
    const length = this.ctx.sampleRate * 2;
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i);
      for (let j = 0; j < length; j++) {
        channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
      }
    }
    this.reverb.buffer = impulse;
  }

  private wireChain() {
    // Input -> EQ -> Compressor -> Split
    this.lowEQ.connect(this.midEQ);
    this.midEQ.connect(this.highEQ);
    this.highEQ.connect(this.compressor);

    // Dry Path
    this.compressor.connect(this.dryGain);
    this.dryGain.connect(this.limiter);

    // Wet Path (Reverb)
    this.compressor.connect(this.reverb);
    this.reverb.connect(this.reverbGain);
    this.reverbGain.connect(this.wetGain);

    // Wet Path (Delay)
    this.compressor.connect(this.delay);
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.wetGain);

    this.wetGain.connect(this.limiter);
    this.limiter.connect(this.masterGain);
    this.masterGain.connect(this.analyzer);
    this.masterGain.connect(this.ctx.destination);
  }

  public async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.currentBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    return this.currentBuffer;
  }

  public play() {
    if (!this.currentBuffer) return;
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.currentBuffer;
    this.source.connect(this.lowEQ);
    this.source.loop = true;
    this.source.start();
  }

  public stop() {
    if (this.source) {
      try { this.source.stop(); } catch(e) {}
      this.source.disconnect();
      this.source = null;
    }
  }

  public applySettings(params: MasteringParams, bypass: boolean = false) {
    const time = this.ctx.currentTime + 0.05;
    
    if (bypass) {
        this.lowEQ.gain.setTargetAtTime(0, time, 0.1);
        this.midEQ.gain.setTargetAtTime(0, time, 0.1);
        this.highEQ.gain.setTargetAtTime(0, time, 0.1);
        this.compressor.threshold.setTargetAtTime(0, time, 0.1);
        this.dryGain.gain.setTargetAtTime(1, time, 0.1);
        this.wetGain.gain.setTargetAtTime(0, time, 0.1);
        return;
    }

    this.lowEQ.gain.setTargetAtTime(params.eqLow, time, 0.1);
    this.midEQ.gain.setTargetAtTime(params.eqMid, time, 0.1);
    this.highEQ.gain.setTargetAtTime(params.eqHigh, time, 0.1);
    
    const thresh = -24 - (params.compression * 24);
    this.compressor.threshold.setTargetAtTime(thresh, time, 0.1);
    
    this.reverbGain.gain.setTargetAtTime(params.reverbAmount * 0.6, time, 0.1);
    this.delayGain.gain.setTargetAtTime(params.delayAmount * 0.4, time, 0.1);
    this.delayFeedback.gain.setTargetAtTime(params.delayFeedback, time, 0.1);
    this.delay.delayTime.setTargetAtTime(0.3, time, 0.1);

    this.limiter.threshold.setTargetAtTime(params.limiterThreshold, time, 0.1);
    
    this.dryGain.gain.setTargetAtTime(1.0 - (params.reverbAmount * 0.3), time, 0.1);
    this.wetGain.gain.setTargetAtTime(1.0, time, 0.1);
  }

  public getAnalyzer() {
    return this.analyzer;
  }

  public async renderMasteredWav(buffer: AudioBuffer, params: MasteringParams): Promise<string> {
    const offlineCtx = new OfflineAudioContext(2, buffer.length, buffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;

    // Build the same chain in offline context
    const low = offlineCtx.createBiquadFilter();
    low.type = 'lowshelf'; low.frequency.value = 320; low.gain.value = params.eqLow;
    
    const mid = offlineCtx.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 1000; mid.gain.value = params.eqMid;
    
    const high = offlineCtx.createBiquadFilter();
    high.type = 'highshelf'; high.frequency.value = 3200; high.gain.value = params.eqHigh;

    const comp = offlineCtx.createDynamicsCompressor();
    comp.threshold.value = -24 - (params.compression * 24);

    const limit = offlineCtx.createDynamicsCompressor();
    limit.threshold.value = params.limiterThreshold;

    source.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(comp);
    comp.connect(limit);
    limit.connect(offlineCtx.destination);

    source.start(0);
    const masteredBuffer = await offlineCtx.startRendering();
    return this.bufferToWave(masteredBuffer);
  }

  private bufferToWave(buffer: AudioBuffer): string {
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
            let sample = buffer.getChannelData(ch)[i];
            sample = Math.max(-1, Math.min(1, sample));
            const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, int16, true);
            offset += 2;
        }
    }
    const blob = new Blob([bufferArray], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

export const audioProcessor = new AudioProcessor();
