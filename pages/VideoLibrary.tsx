import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GlassCard, Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Download, Share2, Play, Trash2, AlertCircle, Youtube, Video, ArrowLeft, Loader2 } from 'lucide-react';
import { VideoStatus } from '../types';

export default function VideoLibrary() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { userVideos, deleteVideo } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('All Status');
  const [sortOrder, setSortOrder] = useState<string>('Newest First');

  const handleShare = (url?: string) => {
    if (url && url !== '#') {
      navigator.clipboard.writeText(url);
      alert('Video link copied to clipboard!');
    }
  };

  // --- DETAIL VIEW ---
  if (videoId) {
    const video = userVideos.find(v => v.id === videoId);

    if (!video) {
       return (
         <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <h2 className="text-xl font-bold mb-4 text-white">Video not found</h2>
            <p className="mb-8">The video you are looking for does not exist or has been deleted.</p>
            <Button onClick={() => navigate('/videos')} variant="secondary">Back to Library</Button>
         </div>
       );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/videos')} className="gap-2 pl-0 hover:bg-transparent hover:text-white text-neutral-400">
            <ArrowLeft size={20} /> Back
          </Button>
          <h1 className="text-2xl font-bold truncate flex-1">{video.prompt}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Video Player */}
           <div className="lg:col-span-2 space-y-4">
              <div className="bg-black rounded-xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center relative group">
                  {video.status === VideoStatus.PROCESSING ? (
                     <div className="flex flex-col items-center gap-3 text-neutral-400">
                        <Loader2 className="animate-spin" size={32} />
                        <p>Processing...</p>
                     </div>
                  ) : video.status === VideoStatus.FAILED ? (
                     <div className="flex flex-col items-center gap-3 text-red-400">
                        <AlertCircle size={32} />
                        <p>Generation Failed</p>
                        <p className="text-xs max-w-xs text-center opacity-70">{video.errorMessage}</p>
                     </div>
                  ) : video.url && video.url !== '#' ? (
                     <video src={video.url} controls autoPlay className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-neutral-500">Video URL unavailable</div>
                  )}
              </div>
              <div className="flex justify-between items-center text-sm text-neutral-400 px-1">
                 <span>Generated on {new Date(video.createdAt).toLocaleDateString()} at {new Date(video.createdAt).toLocaleTimeString()}</span>
                 <span className="flex items-center gap-2">
                   {video.aspectRatio} • {video.duration}s • {video.model}
                 </span>
              </div>
           </div>

           {/* Right: Details & Actions */}
           <div className="space-y-6">
              <GlassCard>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-neutral-400">Prompt</h3>
                <p className="text-sm text-neutral-200 leading-relaxed italic">"{video.prompt}"</p>
              </GlassCard>

              <div className="space-y-3">
                 <a 
                   href={video.url} 
                   download={`video-${video.id}.mp4`} 
                   onClick={(e) => (!video.url || video.url === '#') && e.preventDefault()}
                   className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors ${!video.url || video.url === '#' ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-white text-black hover:bg-neutral-200'}`}
                 >
                    <Download size={16} /> Download MP4
                 </a>

                 <div className="grid grid-cols-2 gap-3">
                    <a href="https://studio.youtube.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-[#FF0000] hover:text-white text-neutral-300 py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5">
                       <Youtube size={16} /> YouTube
                    </a>
                     <a href="https://tiktok.com/upload" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-[#00f2ea] hover:text-black text-neutral-300 py-2.5 rounded-lg text-sm font-medium transition-colors border border-white/5">
                       <Video size={16} /> TikTok
                    </a>
                 </div>
                 
                 <Button variant="secondary" className="w-full gap-2" onClick={() => handleShare(video.url)}>
                    <Share2 size={16} /> Copy Link
                 </Button>
                 
                 <div className="pt-4 mt-4 border-t border-white/10">
                   <Button variant="danger" className="w-full gap-2" onClick={() => { 
                      if(confirm('Are you sure you want to delete this video?')) {
                        deleteVideo(video.id); 
                        navigate('/videos'); 
                      }
                   }}>
                      <Trash2 size={16} /> Delete Video
                   </Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  const filteredVideos = userVideos
    .filter(video => {
      if (filterStatus === 'All Status') return true;
      if (filterStatus === 'Completed') return video.status === VideoStatus.COMPLETED;
      if (filterStatus === 'Processing') return video.status === VideoStatus.PROCESSING;
      if (filterStatus === 'Failed') return video.status === VideoStatus.FAILED;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortOrder === 'Newest First') return dateB - dateA;
      if (sortOrder === 'Oldest First') return dateA - dateB;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Videos</h1>
        <div className="flex gap-2 w-full sm:w-auto">
           <select 
             className="bg-neutral-900 border border-neutral-800 text-sm rounded-lg px-3 py-2 outline-none flex-1 sm:flex-none"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option>All Status</option>
             <option>Completed</option>
             <option>Processing</option>
             <option>Failed</option>
           </select>
           <select 
             className="bg-neutral-900 border border-neutral-800 text-sm rounded-lg px-3 py-2 outline-none flex-1 sm:flex-none"
             value={sortOrder}
             onChange={(e) => setSortOrder(e.target.value)}
           >
             <option>Newest First</option>
             <option>Oldest First</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No videos found matching your criteria.
          </div>
        )}
        {filteredVideos.map((video) => (
          <GlassCard key={video.id} className={`p-0 overflow-hidden group transition-all ${video.status === VideoStatus.FAILED ? 'border-red-500/30 bg-red-900/5' : 'hover:border-white/30'}`}>
            <Link to={`/videos/${video.id}`} className="block aspect-video bg-neutral-900 relative">
               {video.status === VideoStatus.FAILED ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/10 text-red-500 p-4 text-center">
                    <AlertCircle size={32} className="mb-2 opacity-80" />
                    <span className="font-bold text-sm">Generation Failed</span>
                 </div>
               ) : video.url && video.url !== '#' ? (
                  <video src={video.url} className="w-full h-full object-cover" />
               ) : (
                 <img 
                   src={`https://picsum.photos/seed/${video.id}/400/225`} 
                   alt={video.prompt} 
                   className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                 />
               )}

               {video.status === VideoStatus.COMPLETED && video.url && video.url !== '#' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto hover:bg-white/30 transition-colors">
                      <Play fill="white" className="ml-1 text-white" size={20} />
                    </div>
                  </div>
               )}
               <span className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-mono ${video.status === VideoStatus.FAILED ? 'bg-red-900/80 text-red-200' : 'bg-black/60'}`}>
                  {video.status === VideoStatus.FAILED ? 'ERROR' : `${video.duration}s`}
               </span>
            </Link>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-1 gap-2">
                <Link to={`/videos/${video.id}`} className="font-medium truncate flex-1 hover:text-white text-neutral-200 transition-colors" title={video.prompt}>
                  {video.prompt}
                </Link>
                <button 
                  onClick={(e) => { e.preventDefault(); deleteVideo(video.id); }}
                  className="text-neutral-500 hover:text-red-500 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-neutral-500 mb-4">{new Date(video.createdAt).toLocaleDateString()} • {video.size || '1080p'}</p>
              
              {video.status === VideoStatus.FAILED ? (
                <div className="mt-2 text-xs">
                   <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-2 rounded mb-1 max-h-20 overflow-y-auto scrollbar-hide">
                     {video.errorMessage || "Unknown error occurred during generation."}
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] text-neutral-500">Credits refunded</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a 
                      href={video.url} 
                      download={`video-${video.id}.mp4`} 
                      className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 py-1.5 rounded text-xs transition-colors"
                      onClick={(e) => (!video.url || video.url === '#') && e.preventDefault()}
                    >
                      <Download size={14} /> Download
                    </a>
                    <button 
                      onClick={() => handleShare(video.url)}
                      className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 w-8 rounded text-xs transition-colors"
                      title="Copy Link"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="flex gap-2 mt-1 pt-2 border-t border-white/5">
                     <a 
                        href="https://studio.youtube.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-red-600 hover:text-white py-1.5 rounded text-[10px] text-neutral-400 transition-colors"
                        title="Upload to YouTube"
                     >
                       <Youtube size={12} /> YouTube
                     </a>
                     <a 
                        href="https://www.tiktok.com/upload" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-pink-600 hover:text-white py-1.5 rounded text-[10px] text-neutral-400 transition-colors"
                        title="Upload to TikTok"
                     >
                       <Video size={12} /> TikTok
                     </a>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}