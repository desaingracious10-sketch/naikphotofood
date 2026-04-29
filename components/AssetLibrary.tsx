import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { fileToDataURL } from '../utils/fileUtils';

interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (base64: string, name: string, type: string) => void;
  targetType: 'product' | 'model' | 'background';
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ isOpen, onClose, onSelect, targetType }) => {
  const [activeTab, setActiveTab] = useState<'product' | 'model' | 'background'>(targetType);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(targetType);
  }, [targetType, isOpen]);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('Naikphoto_assets');
      if (saved) {
        setAssets(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Gagal memuat aset dari penyimpanan:", e);
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files[0]) {
      setLoading(true);
      const file = fileInput.files[0];
      try {
        // Limit to 1MB to prevent quick Quota Exceeded (increased from 500KB slightly)
        if (file.size > 1024 * 1024) {
          alert("File terlalu besar (Maks 1MB untuk penyimpanan lokal)");
          setLoading(false);
          fileInput.value = ''; // Reset input
          return;
        }
        const dataUrl = await fileToDataURL(file);
        const newAsset: Asset = {
          id: Date.now().toString(),
          name: file.name,
          type: activeTab,
          base64: dataUrl,
          createdAt: Date.now()
        };
        const updated = [newAsset, ...assets];
        
        try {
            localStorage.setItem('Naikphoto_assets', JSON.stringify(updated));
            setAssets(updated);
        } catch (storageErr: any) {
            if (storageErr.name === 'QuotaExceededError' || storageErr.code === 22) {
                alert("Penyimpanan penuh! Hapus beberapa aset lama untuk mengunggah yang baru.");
            } else {
                console.error("Storage error:", storageErr);
            }
        }
      } catch (err) {
        console.error("Error processing asset:", err);
        alert("Gagal memproses aset.");
      } finally {
        setLoading(false);
        fileInput.value = ''; // CRITICAL FIX: Reset value agar user bisa upload ulang file yang sama
      }
    }
  };

  const deleteAsset = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Hapus aset ini?')) {
          const updated = assets.filter(a => a.id !== id);
          setAssets(updated);
          localStorage.setItem('Naikphoto_assets', JSON.stringify(updated));
      }
  };

  const filteredAssets = assets.filter(a => a.type === activeTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-5xl w-full h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Pustaka Aset</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl font-light leading-none">&times;</button>
        </div>

        <div className="flex border-b border-gray-200 mb-6 -mx-2">
          {['product', 'model', 'background'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type as any)}
              className={`py-2 px-4 border-b-4 text-sm sm:text-base font-medium transition ${
                activeTab === type 
                  ? 'border-red-600 text-red-600 bg-white' 
                  : 'border-transparent text-gray-600 hover:text-red-600'
              }`}
            >
              {type === 'product' ? 'Produk Makanan' : type === 'model' ? 'Model/Tangan' : 'Latar/Props'}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center p-10"><div className="loader h-10 w-10 border-4 border-gray-200 rounded-full"></div></div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p>Tidak ada aset bertipe ini. Unggah baru!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  onClick={() => onSelect(asset.base64, asset.name, asset.base64.match(/data:(.*?);/)?.[1] || 'image/png')}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:border-red-600 hover:shadow-md aspect-square"
                >
                  <img src={asset.base64} className="w-full h-full object-cover" alt={asset.name} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-1 truncate text-xs text-center text-gray-600">
                    {asset.name}
                  </div>
                  <button 
                    onClick={(e) => deleteAsset(asset.id, e)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Hapus Aset"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <label className={`
            cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md transition flex items-center
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {loading ? (
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            )}
            Unggah Aset Baru
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
          </label>
          <p className="text-xs text-gray-500">Maks 1MB per aset (Local Storage).</p>
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;