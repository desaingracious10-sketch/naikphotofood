import React, { useState } from 'react';
import { ContentStyle, UploadedFile } from '../types';
import { fileToDataURL } from '../utils/fileUtils';
import AssetLibrary from './AssetLibrary';

interface InputFormProps {
  selectedStyle: ContentStyle;
  uploadedFiles: Record<string, UploadedFile>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Record<string, UploadedFile>>>;
  descriptions: { product: string; mood: string };
  setDescriptions: React.Dispatch<React.SetStateAction<{ product: string; mood: string }>>;
  onGenerate: () => void;
}

const MOOD_PRESETS = [
  {
    id: 'traditional',
    label: 'Traditional',
    icon: '🏺',
    value: 'Traditional: Pencahayaan hangat (warm light), properti kayu dan bahan alami, nuansa homey, pedesaan, dan otentik.'
  },
  {
    id: 'spicy',
    label: 'Spicy',
    icon: '🌶️',
    value: "Foto produk bergaya cinematic dengan komposisi dramatis. Produk utama ditempatkan di tengah sebagai fokus, dengan efek partikel dinamis seperti bumbu, cahaya, atau elemen pendukung yang tampak ‘meledak’ dari belakang. Latar meja kayu rustic atau permukaan netral, cahaya warm dan kontras tinggi. Tambahkan elemen melayang yang relevan dengan produk (misal cabai, bumbu, percikan air, daun, pecahan bahan, atau partikel energi), depth of field kuat, tekstur sangat detail, suasana ‘explosion of flavor/energy’. Gaya fotografi profesional, vibrant, rich details, atmosfer smoky & glowing highlights."
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    icon: '🎭',
    value: "Desain iklan produk modern yang colorful dan fun. Produk utama ditampilkan dengan efek splash atau pouring yang dramatis dan menggiurkan. pemilihan warna yang cerah penuh warna, tone oranye–kuning vibrant, dan nuansa pasar kuliner yang ramai. Tambahkan elemen cabai, bumbu, atau bahan melayang sesuai produk. . Cahaya bright, vibe ceria, dinamis, dan sangat eye-catching. Cocok untuk iklan viral, gaya humoris dan energik."
  },
  {
    id: 'finedining',
    label: 'Fine Dining',
    icon: '🥂',
    value: "Foto produk bergaya fine-dining premium dengan pencahayaan warm spotlight yang lembut dan dramatis. Produk utama ditampilkan di mangkuk/plate elegan dengan komposisi artistik, detail sangat tajam, dan warna-warna kaya. Latar belakang menggunakan kain gelap atau backdrop premium dengan efek bokeh halus, memberikan nuansa mewah dan eksklusif. Sentuhan highlight emas pada teks atau elemen visual, vibe restoran bintang lima, ambience hangat, clean aesthetic, high-end food commercial photography."
  }
];

const InputForm: React.FC<InputFormProps> = ({ 
  selectedStyle, uploadedFiles, setUploadedFiles, descriptions, setDescriptions, onGenerate 
}) => {
  const [libOpen, setLibOpen] = useState(false);
  const [libTarget, setLibTarget] = useState<'product' | 'model' | 'background' | null>(null);

  const isModelStyle = selectedStyle === ContentStyle.LiveShowcase;
  const isPosterStyle = selectedStyle === ContentStyle.DramaticPoster;

  const handleFileChange = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      try {
        const dataUrl = await fileToDataURL(file);
        const base64 = dataUrl.split(',')[1];
        setUploadedFiles(prev => ({
          ...prev,
          [key]: { name: file.name, type: file.type, base64, dataUrl }
        }));
      } catch (err) {
        console.error("Gagal memproses file:", err);
        alert("Gagal memproses gambar. Silakan coba lagi.");
      } finally {
        // CRITICAL FIX: Reset value input agar user bisa upload file yang sama jika diperlukan tanpa refresh
        fileInput.value = '';
      }
    }
  };

  const handleLibSelect = (base64Full: string, name: string, type: string) => {
    if (libTarget) {
      const key = libTarget === 'product' ? 'productImage' : libTarget === 'model' ? 'modelImage' : 'backgroundImage';
      setUploadedFiles(prev => ({
        ...prev,
        [key]: { name, type, base64: base64Full.split(',')[1], dataUrl: base64Full }
      }));
      setLibOpen(false);
      setLibTarget(null);
    }
  };

  const openLibrary = (type: 'product' | 'model' | 'background') => {
    setLibTarget(type);
    setLibOpen(true);
  };

  const renderUploadField = (key: string, label: string, type: 'product' | 'model' | 'background', required = false) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <div className="flex gap-3">
        <div className="relative flex-grow">
            <input 
              type="file" 
              id={key} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(key, e)}
            />
            <label 
              htmlFor={key}
              className={`
                block w-full rounded-2xl p-4 text-center cursor-pointer border-2 border-dashed transition-all duration-200
                ${uploadedFiles[key] ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-sm'}
              `}
            >
              {uploadedFiles[key] ? (
                <div className="flex items-center justify-center gap-3">
                   <img src={uploadedFiles[key].dataUrl} className="h-10 w-10 object-cover rounded-xl shadow-sm" alt="preview" />
                   <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{uploadedFiles[key].name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-slate-500 text-sm font-medium">Unggah Gambar</span>
                  <span className="text-[10px] text-slate-400">Klik atau drag & drop</span>
                </div>
              )}
            </label>
        </div>
        <button 
          onClick={() => openLibrary(type)}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2 px-5 rounded-2xl shadow-sm transition-all active:scale-95"
        >
          Pilih
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AssetLibrary 
        isOpen={libOpen} 
        onClose={() => setLibOpen(false)} 
        onSelect={handleLibSelect} 
        targetType={libTarget || 'product'} 
      />

      {renderUploadField('productImage', 'Gambar Makanan (Produk Utama)', 'product', true)}
      
      <div>
        <label className="block text-sm font-semibold text-slate-700">Deskripsi Makanan / Konsep Rasa <span className="text-blue-500">*</span></label>
        <textarea 
          rows={3} 
          className="mt-3 block w-full rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 p-4 transition-all outline-none placeholder:text-slate-400"
          placeholder="Contoh: Seblak pedas level dewa dengan topping melimpah..."
          value={descriptions.product}
          onChange={(e) => setDescriptions(prev => ({ ...prev, product: e.target.value }))}
        />
      </div>

      {(isModelStyle || isPosterStyle) && renderUploadField('modelImage', 'Foto Model / Tangan (Opsional)', 'model')}
      
      {renderUploadField('backgroundImage', 'Gambar Latar (Opsional)', 'background')}

      {isPosterStyle && (
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-slate-700 mb-4">Konsep Mood & Lighting <span className="text-blue-500">*</span></label>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {MOOD_PRESETS.map((preset) => {
              const isActive = descriptions.mood === preset.value;
              return (
                <button
                  key={preset.id}
                  onClick={() => setDescriptions(prev => ({ ...prev, mood: preset.value }))}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm transform scale-[1.02]' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50'}
                  `}
                >
                  <span className="text-2xl mb-2">{preset.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{preset.label}</span>
                </button>
              );
            })}
          </div>

          <textarea 
            rows={2} 
            className="block w-full rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 p-4 transition-all outline-none text-sm placeholder:text-slate-400"
            placeholder="Pilih mood di atas atau tulis deskripsi manual..."
            value={descriptions.mood}
            onChange={(e) => setDescriptions(prev => ({ ...prev, mood: e.target.value }))}
          />
        </div>
      )}

      <button 
        onClick={onGenerate}
        disabled={!uploadedFiles.productImage || !descriptions.product || (isPosterStyle && !descriptions.mood)}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-950 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 transform active:scale-[0.98]"
      >
        Generate Konten
      </button>
    </div>
  );
};

export default InputForm;