import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async enhancePrompt(apiKey: string, originalPrompt: string): Promise<string> {
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite the following video description to be more cinematic, detailed, and visually descriptive for an AI video generator. Keep it under 50 words. Description: "${originalPrompt}"`,
      });
      
      return response.text || originalPrompt;
    } catch (error) {
      console.error("Prompt Enhancement Error:", error);
      return originalPrompt; // Fallback to original
    }
  }

  public async generateVideo(
    apiKey: string,
    prompt: string, 
    aspectRatio: '16:9' | '9:16' = '16:9',
    onProgress?: (status: string) => void
  ): Promise<string> {
    
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    // Initialize AI client 
    const ai = new GoogleGenAI({ apiKey });

    // Define fallback strategy: Try Fast/High Quality models with different resolutions
    const configurations = [
      { model: 'veo-3.1-fast-generate-preview', resolution: '1080p' },
      { model: 'veo-3.1-generate-preview', resolution: '1080p' },
      { model: 'veo-3.1-fast-generate-preview', resolution: '720p' },
      { model: 'veo-3.1-generate-preview', resolution: '720p' }
    ];

    let operation = null;
    let lastError = null;

    // 1. Attempt generation with fallbacks
    for (const config of configurations) {
      try {
        if (onProgress) onProgress(`Requesting ${config.model} (${config.resolution})...`);
        
        operation = await ai.models.generateVideos({
          model: config.model,
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: config.resolution as '1080p' | '720p',
            aspectRatio: aspectRatio
          }
        });
        
        // If successful, break the loop
        if (operation) {
           console.log(`Successfully started generation with ${config.model} at ${config.resolution}`);
           break;
        }

      } catch (err: any) {
        lastError = err;
        const errorStr = JSON.stringify(err);
        
        // Only continue if it's a 404 (Not Found) or 400 (Bad Request - potentially resolution mismatch)
        // 429 (Quota) should probably fail immediately or handle differently, but here we assume we might find a working model
        const isRecoverable = errorStr.includes('404') || 
                              errorStr.includes('NOT_FOUND') || 
                              err.message?.includes('404') || 
                              err.message?.includes('not found');
        
        if (!isRecoverable) {
          throw err; // Rethrow critical errors like Auth failures
        }
        
        console.warn(`Failed with ${config.model}:`, err.message);
        // Continue to next config
      }
    }

    if (!operation) {
       console.error("All Veo model configurations failed.");
       throw lastError || new Error("Failed to initialize video generation with any Veo model.");
    }

    // 2. Poll for completion
    try {
      if (onProgress) onProgress('Request accepted. Rendering video...');
      
      let pollCount = 0;
      while (!operation.done) {
        pollCount++;
        
        if (onProgress) {
          if (pollCount <= 2) onProgress('Initializing render...');
          else if (pollCount % 4 === 0) onProgress('Synthesizing motion...');
          else if (pollCount % 4 === 1) onProgress('Refining details...');
          else if (pollCount % 4 === 2) onProgress('Processing textures...');
          else onProgress('Finalizing output...');
        }
        
        // Exponential backoff for polling (5s start, cap at 10s)
        const delay = Math.min(5000 + (pollCount * 1000), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (onProgress) onProgress('Download ready...');

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const finalUrl = `${downloadLink}&key=${apiKey}`;
        return finalUrl;
      } else {
        throw new Error("No video URI in response");
      }
    } catch (error) {
      console.error("Video Polling Error:", error);
      throw error;
    }
  }
}