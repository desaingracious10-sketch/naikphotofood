import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StyleSelector from '../components/StyleSelector';
import InputForm from '../components/InputForm';
import RatioModal from '../components/RatioModal';
import ResultsDisplay from '../components/ResultsDisplay';
import ApiKeyModal from '../components/ApiKeyModal';
import { ContentStyle, UploadedFile, AspectRatio, GeneratedContent } from '../types';
import { generateCreativePlan, generateImage, generateVideoPrompt, progressiveDelay } from '../services/geminiService';
import { cropImageToRatio } from '../utils/fileUtils';
import { getAllKeys } from '../utils/apiKeyManager';
import { useAuth } from '../contexts/AuthContext';

const AppDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const [selectedStyle, setSelectedStyle] = useState<ContentStyle | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [descriptions, setDescriptions] = useState({ product: '', mood: '' });
  const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.Square);

  useEffect(() => {
    if (getAllKeys().length === 0) {
      setIsApiKeysOpen(true);
    }
  }, []);

  const handleStyleSelect = (style: ContentStyle) => {
    if (selectedStyle === style) return;
    setSelectedStyle(style);
    setUploadedFiles({});
    setDescriptions({ product: '', mood: '' });
    setResult(null);
  };

  const handleGenerateClick = () => {
    if (getAllKeys().length === 0) {
      setIsApiKeysOpen(true);
      return;
    }
    if (selectedStyle === ContentStyle.DramaticPoster) {
      setRatio(AspectRatio.Square);
      startGeneration(AspectRatio.Square);
    } else {
      setIsRatioModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const startGeneration = async (selectedRatio: AspectRatio) => {
    setIsRatioModalOpen(false);
    setRatio(selectedRatio);
    setIsLoading(true);
    setLoadingMsg('Merancang konsep kreatif...');

    try {
      if (!selectedStyle) throw new Error("Style not selected");

      const plan = await generateCreativePlan(
        selectedStyle,
        descriptions.product,
        descriptions.mood,
        selectedRatio,
        uploadedFiles
      );

      const images: GeneratedContent['images'] = [];
      const prompts = plan.shotPrompts;
      const total = selectedStyle === ContentStyle.DramaticPoster ? 1 : prompts.length;

      for (let i = 0; i < total; i++) {
        await progressiveDelay(i, setLoadingMsg);

        setLoadingMsg(`Membuat visual adegan ${i + 1}/${total}...`);

        try {
          const rawBase64Data = await generateImage(prompts[i], uploadedFiles);
          const imageBase64 = await cropImageToRatio(rawBase64Data, selectedRatio);

          let vidPrompt = '';
          if (selectedStyle !== ContentStyle.DramaticPoster) {
            try {
              vidPrompt = await generateVideoPrompt(imageBase64);
            } catch (e) {
              console.error("Video prompt failed", e);
            }
          }

          images.push({
            base64: imageBase64,
            prompt: prompts[i],
            label: selectedStyle === ContentStyle.DramaticPoster ? 'Poster Utama' : `Adegan ${i + 1}`,
            videoPrompt: vidPrompt,
          });
        } catch (err: any) {
          const msg = err?.message || '';
          console.error(`Adegan ${i + 1} gagal:`, err);

          if (msg.includes('Sesi generate selesai') || msg.includes('API Key tidak valid')) {
            throw err;
          }
        }
      }

      if (images.length === 0) {
        throw new Error("Gagal membuat semua gambar. Silakan coba lagi atau periksa API Key kamu.");
      }

      setResult({
        plan,
        images,
        audioBlob: null,
      });

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Header
        onOpenKeys={() => setIsApiKeysOpen(true)}
        onLogout={handleLogout}
        userName={profile?.full_name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">1</span>
                <h2 className="text-xl font-semibold text-slate-900">Pilih Gaya Konten</h2>
              </div>
              <p className="text-slate-500 mb-6 text-sm">Pilih template visual untuk menentukan fokus konten Anda.</p>

              <StyleSelector selectedStyle={selectedStyle} onSelect={handleStyleSelect} />

              {selectedStyle && (
                <div className="mt-10 pt-10 border-t border-slate-100 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">2</span>
                    <h2 className="text-xl font-semibold text-slate-900">Input Data</h2>
                  </div>
                  <InputForm
                      selectedStyle={selectedStyle}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      descriptions={descriptions}
                      setDescriptions={setDescriptions}
                      onGenerate={handleGenerateClick}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-2">
            <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-xs font-bold shadow-sm">3</span>
                <h2 className="text-xl font-semibold text-slate-900">Hasil Kreatif</h2>
              </div>

              <div className="flex-grow">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <div className="loader h-12 w-12 border-4 border-slate-100 rounded-full mb-6"></div>
                    <p className="text-slate-600 font-medium animate-pulse">{loadingMsg}</p>
                  </div>
                ) : result && selectedStyle ? (
                  <ResultsDisplay
                      content={result}
                      style={selectedStyle}
                      aspectRatio={ratio}
                      onReset={() => setResult(null)}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="max-w-xs text-sm">Pilih gaya konten dan lengkapi data di sebelah kiri untuk melihat hasil ajaib di sini.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      <RatioModal
        isOpen={isRatioModalOpen}
        onClose={() => setIsRatioModalOpen(false)}
        onConfirm={(r) => startGeneration(r)}
      />
      <ApiKeyModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
      />
    </div>
  );
};

export default AppDashboard;
