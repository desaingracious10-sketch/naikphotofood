
import React, { useRef, useState } from 'react';
import { GeneratedContent, ContentStyle, AspectRatio } from '../types';
import { generateTTS } from '../services/geminiService';
import { pcmToWav, base64ToArrayBuffer } from '../utils/fileUtils';

interface ResultsDisplayProps {
  content: GeneratedContent;
  style: ContentStyle;
  aspectRatio: AspectRatio;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ content, style, aspectRatio, onReset }) => {
  const [script, setScript] = useState(content.plan?.masterScene.tiktokScript || '');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [voice, setVoice] = useState('Puck');
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isPoster = style === ContentStyle.DramaticPoster;
  const aspectClass = aspectRatio === AspectRatio.Vertical ? 'aspect-[9/16]' : aspectRatio === AspectRatio.Square ? 'aspect-square' : 'aspect-[16/9]';

  const handleTTS = async () => {
    if (!script) return;
    setIsGeneratingAudio(true);
    try {
      const { data, sampleRate } = await generateTTS(script, voice);
      const pcmBuffer = base64ToArrayBuffer(data);
      // PCM to WAV conversion required for simple <audio> playback from blob
      const wavBlob = pcmToWav(pcmBuffer, 1, sampleRate);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      alert('Gagal membuat audio.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDownloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `Naikphoto_${style}_${index + 1}.png`;
    link.click();
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        // Simple feedback
        alert("Prompt berhasil disalin ke clipboard!");
    }).catch(err => {
        console.error("Gagal menyalin: ", err);
    });
  };

  const handleDownloadAll = () => {
    content.images.forEach((img, idx) => handleDownloadImage(img.base64, idx));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">{isPoster ? 'Hasil Poster Iklan' : 'Alur Cerita Visual'}</h2>
        <button onClick={onReset} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Buat Baru</button>
      </div>

      <div className={`grid gap-6 mb-10 ${isPoster ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-2 md:grid-cols-5'}`}>
        {content.images.map((img, idx) => (
          <div key={idx} className="group relative flex flex-col">
            <div 
              className={`bg-slate-100 rounded-2xl overflow-hidden shadow-sm w-full ${aspectClass} relative cursor-pointer hover:shadow-md transition-all duration-300 border border-slate-100`}
              onClick={() => setViewIndex(idx)}
            >
              <img src={img.base64} className="w-full h-full object-cover" alt={`Generated ${idx}`} />
              
              {/* Overlay Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={(e) => { e.stopPropagation(); setViewIndex(idx); }}
                    className="bg-white/90 hover:bg-white text-slate-900 p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all active:scale-90"
                    title="Lihat Detail & Prompt"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleDownloadImage(img.base64, idx); }}
                    className="bg-white/90 hover:bg-white text-slate-900 p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all active:scale-90"
                    title="Unduh Gambar"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">{img.label}</p>
              {!isPoster && (
                <div className="mt-1">
                    <p className="text-[10px] text-slate-500 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" 
                       onClick={() => handleCopyPrompt(img.videoPrompt || '')}
                       title="Klik untuk menyalin prompt video"
                    >
                        {img.videoPrompt || '...'}
                    </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {viewIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setViewIndex(null)}>
          <div 
            className="bg-white rounded-2xl overflow-hidden max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl animate-scale-up" 
            onClick={e => e.stopPropagation()}
          >
             {/* Left: Image */}
             <div className="flex-1 bg-black flex items-center justify-center relative p-2 md:p-4 min-h-[300px]">
                <img 
                  src={content.images[viewIndex].base64} 
                  className="max-w-full max-h-[50vh] md:max-h-[85vh] object-contain rounded-lg" 
                  alt="Full View" 
                />
             </div>
             
             {/* Right: Info */}
             <div className="w-full md:w-96 bg-white p-6 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{content.images[viewIndex].label}</h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">AI Visual Engine</p>
                  </div>
                  <button onClick={() => setViewIndex(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-8 flex-grow">
                   <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Visual Prompt</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {content.images[viewIndex].prompt}
                      </div>
                      <button onClick={() => handleCopyPrompt(content.images[viewIndex].prompt)} className="text-blue-600 text-xs font-bold mt-3 hover:text-blue-800 transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        Salin Prompt
                      </button>
                   </div>

                   {content.images[viewIndex].videoPrompt && (
                     <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Video Motion Prompt</h4>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                          {content.images[viewIndex].videoPrompt}
                        </div>
                        <button onClick={() => handleCopyPrompt(content.images[viewIndex].videoPrompt!)} className="text-blue-600 text-xs font-bold mt-3 hover:text-blue-800 transition-colors flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          Salin Motion Prompt
                        </button>
                     </div>
                   )}
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                   <button 
                      onClick={() => setViewIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
                      disabled={viewIndex === 0}
                      className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                   >
                     &larr; Prev
                   </button>
                   <button 
                      onClick={() => setViewIndex(prev => (prev !== null && prev < content.images.length - 1 ? prev + 1 : prev))}
                      disabled={viewIndex === content.images.length - 1}
                      className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                   >
                     Next &rarr;
                   </button>
                   <button 
                      onClick={() => handleDownloadImage(content.images[viewIndex].base64, viewIndex)}
                      className="col-span-2 w-full bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-950 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                   >
                     Unduh Gambar Ini
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="text-center mb-10 pb-10 border-b border-slate-100">
        <button onClick={handleDownloadAll} className="bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-950 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          Unduh Semua Gambar (.png)
        </button>
      </div>

      {!isPoster && (
        <div className="mt-10 animate-fade-in">
          <h3 className="text-lg font-bold mb-6 text-slate-900">Naskah & Audio</h3>
          <div className="mb-6">
             <label className="block text-sm font-semibold text-slate-700 mb-3">Naskah Video (Editable)</label>
             <textarea 
               rows={4} 
               value={script}
               onChange={(e) => setScript(e.target.value)}
               className="block w-full rounded-2xl p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800"
             />
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <p className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">AI Text-to-Speech</p>
             <div className="flex flex-wrap items-center gap-4">
                <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="bg-white text-slate-900 rounded-xl px-4 py-2.5 text-sm border border-slate-200 outline-none focus:border-blue-600 shadow-sm"
                >
                  <option value="Puck">Puck (Wanita - Ceria)</option>
                  <option value="Charon">Charon (Pria - Ramah)</option>
                  <option value="Kore">Kore (Wanita - Tenang)</option>
                  <option value="Fenrir">Fenrir (Pria - Berat)</option>
                  <option value="Aoede">Aoede (Wanita - Elegan)</option>
                </select>

                <button 
                  onClick={handleTTS}
                  disabled={isGeneratingAudio || !script}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                >
                  {isGeneratingAudio ? 'Memproses...' : 'Buat Audio'}
                </button>

                {audioUrl && (
                  <audio ref={audioRef} controls src={audioUrl} className="h-10 rounded-full" />
                )}
             </div>
          </div>
        </div>
      )}
      
      <div className="mt-12 pt-10 border-t border-slate-100">
         <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest text-center">Lanjut ke Editor / AI Eksternal</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="https://grok.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl text-center shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-xl">𝕏</span> Grok AI
            </a>
            <a href="https://www.meta.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl text-center shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                 <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
               </svg>
               Meta AI
            </a>
         </div>
         <p className="mt-6 text-[10px] text-slate-400 text-center font-medium">Salin prompt di atas dan tempelkan ke platform AI favorit Anda untuk hasil video maksimal.</p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
