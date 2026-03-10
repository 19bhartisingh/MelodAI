import { QualityScore, QualityMetrics, MoodAlignmentMetrics } from "../types";

export class QualityScorer {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Main entry point to score an audio file against expected parameters.
   */
  public async scoreAudio(audioUrl: string, expectedDuration: number, expectedTempo?: number): Promise<QualityScore> {
    try {
      // 1. Fetch and Decode
      const response = await fetch(audioUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // 2. Extract Data (Use first channel/mono for analysis)
      const channelData = audioBuffer.getChannelData(0);

      // 3. Run Basic Checks
      const basicMetrics = {
        clipping: this._checkClipping(channelData),
        averageRMS: this._calculateRMS(channelData),
        silencePercentage: this._checkSilence(channelData),
        dynamicRange: this._checkDynamics(channelData, audioBuffer.sampleRate),
        durationAccuracy: Math.abs(audioBuffer.duration - expectedDuration),
        frequencyBalance: this._checkFrequencyBalance(channelData)
      };

      // 4. Run Mood Alignment Checks
      const moodMetrics = this._checkMoodAlignment(channelData, audioBuffer.sampleRate, expectedTempo);

      const metrics: QualityMetrics = {
        ...basicMetrics,
        moodAlignment: moodMetrics
      };

      // 5. Calculate Overall Score
      return this._calculateOverallScore(metrics);

    } catch (error) {
      console.error("Scoring failed:", error);
      // Return a failed score object
      return {
        overall: 0,
        grade: 'F',
        issues: [`Analysis failed: ${(error as Error).message || 'Unknown error'}`],
        metrics: {
          clipping: 0, averageRMS: 0, silencePercentage: 0, 
          dynamicRange: 0, durationAccuracy: 0, frequencyBalance: 0,
          moodAlignment: { detectedBPM: 0, energyLevel: 0, brightness: 0, tempoMatchScore: 0 }
        }
      };
    }
  }

  private _checkClipping(data: Float32Array): number {
    let clips = 0;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) >= 0.99) {
        clips++;
      }
    }
    return clips / data.length;
  }

  private _calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  private _checkSilence(data: Float32Array): number {
    const threshold = 0.01; // -40dB approx
    let silentSamples = 0;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) < threshold) {
        silentSamples++;
      }
    }
    return silentSamples / data.length;
  }

  private _checkDynamics(data: Float32Array, sampleRate: number): number {
    // Calculate RMS in 0.5-second windows to find loud vs quiet parts
    const windowSize = Math.floor(sampleRate / 2); 
    const windows = Math.floor(data.length / windowSize);
    let maxRMS = 0;
    let minRMS = 1;

    for (let w = 0; w < windows; w++) {
      let sum = 0;
      for (let i = 0; i < windowSize; i++) {
        const val = data[w * windowSize + i];
        sum += val * val;
      }
      const rms = Math.sqrt(sum / windowSize);
      if (rms > maxRMS) maxRMS = rms;
      if (rms < minRMS) minRMS = rms;
    }

    // Dynamic range score
    return maxRMS - minRMS;
  }
  
  private _checkFrequencyBalance(data: Float32Array): number {
    // Zero Crossing Rate as proxy for brightness
    let zeroCrossings = 0;
    for(let i=1; i<data.length; i++) {
        if((data[i] >= 0 && data[i-1] < 0) || (data[i] < 0 && data[i-1] >= 0)) {
            zeroCrossings++;
        }
    }
    const zcr = zeroCrossings / data.length;
    // Normalized expectation for music
    return Math.min(1, zcr * 5); 
  }

  private _checkMoodAlignment(data: Float32Array, sampleRate: number, expectedTempo: number = 120): MoodAlignmentMetrics {
      // 1. Energy (RMS)
      const energyLevel = this._calculateRMS(data);
      
      // 2. Brightness (ZCR)
      const brightness = this._checkFrequencyBalance(data);

      // 3. BPM Detection (Simple Peak Autocorrelation)
      const detectedBPM = this._estimateBPM(data, sampleRate);
      
      // 4. Tempo Match Score
      // Allow for half-time/double-time matches
      const ratios = [0.5, 1, 2];
      let bestMatch = 0;
      
      for(const r of ratios) {
          const target = expectedTempo * r;
          const diff = Math.abs(detectedBPM - target);
          const score = Math.max(0, 1 - (diff / 20)); // Lose points if > 20bpm off
          if(score > bestMatch) bestMatch = score;
      }

      return {
          detectedBPM,
          energyLevel: Math.min(1, energyLevel * 2), // Normalize slightly
          brightness,
          tempoMatchScore: bestMatch
      };
  }

  private _estimateBPM(data: Float32Array, sampleRate: number): number {
    // Downsample to 4410Hz for performance (enough for rhythm)
    const downsampleRate = 4410;
    const skip = Math.floor(sampleRate / downsampleRate);
    const n = Math.floor(data.length / skip);
    const lowResData = new Float32Array(n);
    
    // Rectify (Envelope)
    for(let i=0; i<n; i++) {
        lowResData[i] = Math.abs(data[i * skip]);
    }

    // Autocorrelation for lags corresponding to 60-180 BPM
    // 60 BPM = 1 beat per sec = 4410 samples lag
    // 180 BPM = 3 beats per sec = 1470 samples lag
    const minLag = Math.floor(60 / 180 * downsampleRate);
    const maxLag = Math.floor(60 / 60 * downsampleRate);
    
    let maxCorr = 0;
    let bestLag = 0;

    // Search for periodic peaks
    // We only check a subset of samples to save CPU
    const limit = Math.min(lowResData.length, downsampleRate * 5); // Use first 5 seconds

    for (let lag = minLag; lag <= maxLag; lag += 10) {
        let corr = 0;
        for (let i = 0; i < limit - lag; i++) {
            corr += lowResData[i] * lowResData[i + lag];
        }
        if (corr > maxCorr) {
            maxCorr = corr;
            bestLag = lag;
        }
    }

    if (bestLag === 0) return 0;
    return (60 * downsampleRate) / bestLag;
  }

  private _calculateOverallScore(metrics: QualityMetrics): QualityScore {
    const issues: string[] = [];
    let score = 100;

    // 1. Clipping (Heavy Penalty)
    if (metrics.clipping > 0.01) {
      score -= 25;
      issues.push("High distortion detected");
    }

    // 2. Silence (Medium Penalty)
    if (metrics.silencePercentage > 0.2) {
      score -= 20;
      issues.push("Too much silence");
    }

    // 3. Duration (Precision Penalty)
    if (metrics.durationAccuracy > 2) { 
      score -= 10;
      issues.push(`Duration mismatch (+/- ${metrics.durationAccuracy.toFixed(1)}s)`);
    }

    // 4. Dynamics
    if (metrics.dynamicRange < 0.02) {
      score -= 10;
      issues.push("Flat dynamics");
    }

    // 5. Volume
    if (metrics.averageRMS < 0.05) {
      score -= 15;
      issues.push("Volume too low");
    }

    // 6. Tempo Match (Soft Penalty)
    if (metrics.moodAlignment && metrics.moodAlignment.tempoMatchScore < 0.5) {
        score -= 5;
        issues.push("Rhythm inconsistent with mood");
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine Grade
    let grade: QualityScore['grade'] = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';

    return {
      overall: Math.round(score),
      metrics,
      grade,
      issues
    };
  }
}

export const audioScorer = new QualityScorer();