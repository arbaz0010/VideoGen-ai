import React, { useState, useEffect, useRef } from 'react';
import { Button, GlassCard, Badge } from '../components/UI';
import { GeminiService } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, MonitorPlay, Smartphone, Key, AlertTriangle, Download, 
  RefreshCw, CreditCard, Loader2, Video as VideoIcon,
  Play, Pause, Volume2, VolumeX, Maximize2, ToggleLeft, ToggleRight, ShieldCheck, Layers, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoStatus } from '../types';

export default function Generator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); // 0-100 for generation
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const { user, deductCredits, addVideo, systemConfig } = useApp();
  const gemini = GeminiService.getInstance();
  const COST_PER_VIDEO = 20;

  // Watermark State
  const [useWatermark, setUseWatermark] = useState(true);
  const canRemoveWatermark = user?.plan !== 'Free';

  // Video Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 for playback
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const apiKey = systemConfig.gemini.apiKey || process.env.API_KEY;

  // Initialize watermark preference based on plan
  useEffect(() => {
    if (user) {
      if (user.plan === 'Free') {
        setUseWatermark(true);
      } else {
        // Default to false for paid users, unless system forces it
        setUseWatermark(false);
      }
    }
  }, [user]);

  // Simulated progress bar for generation
  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      setGenerationProgress(5); // Start at 5%
      interval = window.setInterval(() => {
        setGenerationProgress((prev) => {
          // Slow down as it gets closer to 90%
          if (prev >= 90) return prev;
          const increment = Math.max(1, (90 - prev) / 20); 
          return prev + increment;
        });
      }, 1000);
    } else {
      setGenerationProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Video Controls Helpers
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newProgress);
    }
  };

  const handleFullScreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    if (isBatchMode) {
      setError("AI Enhance is not available in Batch Mode");
      return;
    }
    if (!apiKey) {
      setError("System API Key is missing. Cannot enhance prompt.");
      return;
    }
    
    setIsEnhancing(true);
    try {
      const enhanced = await gemini.enhancePrompt(apiKey, prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error(e);
      // Fail silently or show toast, keep original prompt
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideoUrl) return;
    setIsDownloading(true);
    
    try {
      const response = await fetch(generatedVideoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `videogen-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
      // Fallback
      window.open(generatedVideoUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const getPrompts = () => {
    if (isBatchMode) {
      return prompt.split('\n').filter(p => p.trim().length > 0);
    }
    return [prompt.trim()];
  };

  const handleGenerate = async () => {
    const prompts = getPrompts();
    if (prompts.length === 0) return;
    
    if (!apiKey) {
       setError("System Configuration Error: API Key is missing. Please contact administrator.");
       return;
    }

    const totalCost = prompts.length * COST_PER_VIDEO;

    // Check credits
    if (user && user.credits < totalCost) {
      setError(`Insufficient credits. You need ${totalCost} credits for ${prompts.length} videos.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setStatusMessage(isBatchMode ? `Preparing batch generation for ${prompts.length} videos...` : 'Initializing Veo model...');

    // Deduct credits at start
    const success = deductCredits(totalCost);
    if (!success) {
       setIsGenerating(false);
       return;
    }

    try {
      for (let i = 0; i < prompts.length; i++) {
        const currentPrompt = prompts[i];
        if (isBatchMode) {
          setStatusMessage(`Generating video ${i + 1} of ${prompts.length}...`);
        } else {
          setStatusMessage('Dreaming up your video (this may take a minute)...');
        }

        try {
          const videoUrl = await gemini.generateVideo(
            apiKey,
            currentPrompt, 
            aspectRatio,
            !isBatchMode ? (status) => setStatusMessage(status) : undefined
          );
          
          if (!isBatchMode) {
            setGeneratedVideoUrl(videoUrl);
          }
          
          // Save to library
          addVideo({
            prompt: currentPrompt,
            url: videoUrl,
            aspectRatio,
            duration: 5,
            status: VideoStatus.COMPLETED
          });
        } catch (itemErr: any) {
           console.error(`Failed to generate video for prompt: ${currentPrompt}`, itemErr);
           
           // Extract clearer error message for library
           let errorMessage = itemErr.message || "Unknown error";
           if (JSON.stringify(itemErr).includes('404') || errorMessage.includes('404')) {
             errorMessage = "Model not found. Please check Google Cloud Console to enable 'Video Generation API'.";
           }

           // Save failed video
           addVideo({
             prompt: currentPrompt,
             aspectRatio,
             status: VideoStatus.FAILED,
             errorMessage: errorMessage
           });
           
           if (!isBatchMode) throw itemErr; // Re-throw if single mode to trigger main error handler
        }
      }

      setStatusMessage('');
      setGenerationProgress(100);

    } catch (err: any) {
      console.error("Caught generation error:", err);
      
      let displayError = "Generation failed.";
      
      // Check for specific API Key issues or 404s that persisted through the fallback
      const errorString = JSON.stringify(err);
      if (err.message === "API_KEY_MISSING") {
        displayError = "System API Key is invalid or missing. Please contact support.";
      } else if (errorString.includes('404') || err.message?.includes('404') || err.message?.includes('NOT_FOUND')) {
        // Detailed error for 404 after all fallbacks
        displayError = "Veo Models not available. Please verify the API Key has access to Vertex AI / Video Generation API in Google Cloud Console.";
      } else if (err.message) {
         displayError = `Error: ${err.message}`;
      }

      if (!isBatchMode) {
         setError(`${displayError} Credits have been refunded.`);
         deductCredits(-COST_PER_VIDEO); // Refund
      } else {
         setError("Some videos in batch may have failed. Check library for details.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold">Create New Video</h1>
           <p className="text-neutral-400 text-sm">Powered by Gemini Veo 3.1</p>
        </div>
      </div>

      {!apiKey && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-medium">System Configuration Required</p>
            <p className="text-sm opacity-90 mt-1">
              The Gemini API Key has not been configured by the administrator. Video generation is currently disabled.
            </p>
            {user?.role === 'ADMIN' && (
               <Link to="/admin/settings">
                 <Button variant="secondary" className="mt-3 text-xs h-8">Configure API Key</Button>
               </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Controls */}
        <div className="space-y-6">
          <GlassCard>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-neutral-300">Video Prompt</label>
               <div className="flex items-center gap-2">
                  <span className={`text-xs ${isBatchMode ? 'text-white' : 'text-neutral-500'}`}>Batch Mode</span>
                  <button onClick={() => setIsBatchMode(!isBatchMode)}>
                     {isBatchMode ? <ToggleRight className="text-purple-500" /> : <ToggleLeft className="text-neutral-500" />}
                  </button>
               </div>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isBatchMode ? "Enter multiple prompts, one per line...\nCyberpunk city\nOcean sunset\nMountain peak" : "Describe your video in detail... e.g., A cinematic drone shot of a futuristic cyberpunk city at night with neon rain."}
              className="w-full h-40 bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              maxLength={isBatchMode ? 5000 : 1000}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-neutral-500">
               <span>{prompt.length}/{isBatchMode ? 5000 : 1000} characters</span>
               <button 
                onClick={handleEnhancePrompt}
                disabled={!prompt || isEnhancing || !apiKey || isBatchMode}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                 {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
               </button>
            </div>
            {isBatchMode && (
              <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-300 flex items-start gap-2">
                 <Layers size={14} className="mt-0.5" />
                 <p>Batch mode active: Each line represents a separate video generation request.</p>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <label className="block text-sm font-medium text-neutral-300 mb-4">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`relative group overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  aspectRatio === '16:9' 
                    ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-1 ring-white' 
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className={`w-12 h-7 rounded border-2 mb-3 transition-colors ${
                    aspectRatio === '16:9' ? 'border-black bg-black/5' : 'border-current'
                }`} />
                <span className="text-sm font-medium">Landscape</span>
                <span className="text-xs opacity-60">16:9 • YouTube</span>
                
                {aspectRatio === '16:9' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setAspectRatio('9:16')}
                className={`relative group overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  aspectRatio === '9:16' 
                    ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-1 ring-white' 
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className={`w-6 h-10 rounded border-2 mb-3 transition-colors ${
                    aspectRatio === '9:16' ? 'border-black bg-black/5' : 'border-current'
                }`} />
                <span className="text-sm font-medium">Portrait</span>
                <span className="text-xs opacity-60">9:16 • Shorts/Reels</span>
                
                {aspectRatio === '9:16' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </GlassCard>

          {/* Watermark Toggle - Only shown if enabled in system config */}
          {systemConfig.watermark.enabled && (
             <GlassCard className="flex items-center justify-between py-4">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400">
                         <ShieldCheck size={20} />
                     </div>
                     <div>
                         <p className="font-medium text-sm">Watermark</p>
                         <p className="text-xs text-neutral-500">
                             {canRemoveWatermark
                                 ? "Show 'Made with VideoGen' watermark"
                                 : "Upgrade to Pro to remove watermark"}
                         </p>
                     </div>
                 </div>
                 
                 <button 
                     onClick={() => canRemoveWatermark && setUseWatermark(!useWatermark)}
                     disabled={!canRemoveWatermark}
                     className={`transition-colors focus:outline-none ${!canRemoveWatermark ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                 >
                     {useWatermark 
                         ? <ToggleRight size={32} className={canRemoveWatermark ? "text-blue-500" : "text-neutral-500"} /> 
                         : <ToggleLeft size={32} className="text-neutral-600" />
                     }
                 </button>
             </GlassCard>
          )}

          <Button 
            className="w-full py-4 text-lg font-semibold tracking-wide" 
            disabled={!apiKey || !prompt || isGenerating}
            isLoading={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating 
              ? (isBatchMode ? 'Processing Batch...' : 'Generating Video...') 
              : (isBatchMode ? `Generate Batch (${getPrompts().length})` : 'Generate Video')}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <CreditCard size={12} />
            Costs {isBatchMode ? getPrompts().length * COST_PER_VIDEO : COST_PER_VIDEO} credits • Balance: {user?.credits || 0}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6 sticky top-8">
          <div className={`aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center relative shadow-2xl transition-all duration-500 ${isGenerating ? 'ring-1 ring-white/20' : ''}`}>
             
             {/* Background Grid Pattern for empty state */}
             {(!generatedVideoUrl && !isGenerating) && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
             )}

             {isGenerating ? (
               <div className="text-center p-8 z-10 w-full max-w-sm">
                 <div className="w-full bg-neutral-800 h-1.5 rounded-full mb-6 overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300 ease-out relative"
                      style={{ width: `${generationProgress}%` }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent opacity-50"></div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-center gap-3 mb-2">
                   <Loader2 size={18} className="animate-spin text-neutral-400" />
                   <p className="text-white font-medium animate-pulse text-lg">{statusMessage || 'Processing...'}</p>
                 </div>
                 <p className="text-neutral-500 text-sm">Estimated time: 60 seconds per video</p>
               </div>
             ) : generatedVideoUrl ? (
               <div className="relative w-full h-full bg-black group overflow-hidden rounded-xl">
                 <video 
                   ref={videoRef}
                   src={generatedVideoUrl} 
                   autoPlay 
                   loop 
                   playsInline
                   onClick={togglePlay}
                   onPlay={() => setIsPlaying(true)}
                   onPause={() => setIsPlaying(false)}
                   onTimeUpdate={handleTimeUpdate}
                   onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                   className="w-full h-full object-contain cursor-pointer"
                 />

                 {/* Simulated Watermark Overlay if enabled both locally AND globally */}
                 {useWatermark && systemConfig.watermark.enabled && (
                    <div className="absolute bottom-6 right-6 z-10 opacity-70 pointer-events-none">
                       {(systemConfig.watermark.type === 'image' && systemConfig.watermark.imageUrl) ? (
                         <img src={systemConfig.watermark.imageUrl} alt="Watermark" className="h-8 w-auto object-contain" />
                       ) : (
                         <span className="bg-black/40 backdrop-blur-sm text-white/80 px-2 py-1 rounded text-xs font-medium border border-white/10">
                           {systemConfig.watermark.text || 'Made with VideoGen AI'}
                         </span>
                       )}
                    </div>
                 )}
                 
                 {/* Custom Controls Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative group/timeline">
                       <div 
                         className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100" 
                         style={{ width: `${progress}%` }}
                       >
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 shadow-lg scale-0 group-hover/timeline:scale-100 transition-all" />
                       </div>
                       <input 
                         type="range" 
                         min="0" 
                         max="100" 
                         value={progress || 0} 
                         onChange={handleSeek}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <button onClick={togglePlay} className="text-white hover:text-neutral-300 transition-colors">
                             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                          </button>
                          
                          <div className="flex items-center gap-2 group/volume">
                             <button onClick={toggleMute} className="text-white hover:text-neutral-300 transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                             </button>
                             <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="1" 
                                  step="0.05"
                                  value={isMuted ? 0 : volume} 
                                  onChange={handleVolumeChange}
                                  className="w-20 h-1 accent-white bg-white/20 rounded-lg cursor-pointer"
                                />
                             </div>
                          </div>

                          <span className="text-xs font-medium text-white/80 font-mono">
                             {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                       </div>

                       <button onClick={handleFullScreen} className="text-white hover:text-neutral-300 transition-colors">
                          <Maximize2 size={20} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="absolute top-4 right-4 flex gap-2 z-20 pointer-events-none">
                   <Badge color="bg-green-500/90 backdrop-blur-md shadow-lg border-green-400/20 text-white">
                     <span className="flex items-center gap-1"><Sparkles size={10} fill="currentColor" /> Generated</span>
                   </Badge>
                 </div>
               </div>
             ) : (
               <div className="text-center text-neutral-500 p-8 z-10 max-w-sm">
                 <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                   <VideoIcon size={40} className="opacity-50" />
                 </div>
                 <h3 className="text-lg font-medium text-white mb-2">Ready to Create</h3>
                 <p className="text-sm leading-relaxed">
                   {isBatchMode ? 'Enter your prompts (one per line) and hit generate. We will process them sequentially.' : 'Enter your prompt and hit generate. Your AI masterpiece will appear here automatically.'}
                 </p>
               </div>
             )}
          </div>

          {generatedVideoUrl ? (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <Button 
                variant="secondary" 
                className="w-full gap-2" 
                onClick={handleDownload}
                isLoading={isDownloading}
                disabled={isDownloading}
              >
                <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download MP4'}
              </Button>
              <Button variant="ghost" onClick={handleGenerate} className="w-full gap-2 border border-white/10">
                <RefreshCw size={16} /> Regenerate
              </Button>
            </div>
          ) : (
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide opacity-50 hover:opacity-100 transition-opacity duration-300">
               {/* Inspiration pills */}
               {['Cyberpunk City', 'Ocean Sunset', 'Forest Rain', 'Space Station'].map(inspiration => (
                  <button 
                    key={inspiration}
                    onClick={() => setPrompt(prev => {
                      if (isBatchMode) {
                        return prev ? `${prev}\nCinematic shot of ${inspiration.toLowerCase()}...` : `Cinematic shot of ${inspiration.toLowerCase()}...`;
                      }
                      return prev ? prev : `Cinematic shot of ${inspiration.toLowerCase()}...`
                    })}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {inspiration}
                  </button>
               ))}
             </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}