
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, Track, MusicalScore } from "../types";

/**
 * Generates a musical composition session using Gemini 3.
 * We use gemini-3-pro-preview for complex structured JSON tasks like music scoring.
 */
export const generateCompleteMusicSession = async (params: GenerationParams): Promise<{ metadata: Partial<Track>, score: MusicalScore }> => {
  try {
    // Ensure we get the latest API key from the environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelId = "gemini-3-pro-preview"; 

    const systemInstruction = `You are a world-class AI Music Producer. 
Your task is to compose a highly creative 4-second musical loop (2 bars at 120BPM).
COMPOSITION RULES:
- DIVERSITY: Do not use the same rhythms every time. Use syncopation and triplets.
- HARMONY: Use complex scales (Dorian, Mixolydian, Phrygian) based on the mood.
- REALISM: Bass should provide a strong rhythmic foundation. Melody should have a clear "call and response" feel.
- JSON FORMAT:
  - tempo: 120.
  - key: e.g. "C Major".
  - melody: Array of {pitch: "C4", startTime: 0.0, duration: 0.25}.
  - drums: Kick, snare, hihat start times.
  - bass: Lower octave (e.g., "G2", "C2").
MOOD CONTEXT: ${params.mood}. 
STYLE: ${params.prompt}.`;

    const contents: any = { parts: [] };
    
    if (params.audioInput) {
      contents.parts.push({
        inlineData: {
          mimeType: "audio/webm",
          data: params.audioInput
        }
      });
      contents.parts.push({ text: `Analyze the provided audio snippet and compose a track that follows its rhythmic or melodic pattern.` });
    }

    contents.parts.push({ text: `Create a professional ${params.mood} composition inspired by: ${params.prompt}. Variation seed: ${params.seed || Math.random()}` });

    const response = await ai.models.generateContent({
      model: modelId,
      contents,
      config: {
        systemInstruction,
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            },
            score: {
              type: Type.OBJECT,
              properties: {
                tempo: { type: Type.NUMBER },
                key: { type: Type.STRING },
                melody: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pitch: { type: Type.STRING },
                      startTime: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    },
                    required: ["pitch", "startTime", "duration"]
                  }
                },
                bass: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pitch: { type: Type.STRING },
                      startTime: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    },
                    required: ["pitch", "startTime", "duration"]
                  }
                },
                drums: {
                  type: Type.OBJECT,
                  properties: {
                    kick: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    snare: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    hihat: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  },
                  required: ["kick", "snare", "hihat"]
                }
              },
              required: ["tempo", "key", "melody", "bass", "drums"]
            }
          },
          required: ["metadata", "score"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");
    return JSON.parse(text);
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    throw new Error(e.message || "Unknown error during AI composition.");
  }
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Improve this music prompt for a professional DAW: "${originalPrompt}"` }] },
      config: {
        systemInstruction: "Add 2-3 specific musical descriptors like 'sidechained bass', 'ethereal reverb', or 'syncopated rhythms'. Keep it under 15 words.",
      }
    });
    return response.text?.trim() || originalPrompt;
  } catch (error) {
    return originalPrompt;
  }
};
