import React from 'react';
import { AspectRatio } from '../types';

interface RatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ratio: AspectRatio) => void;
}

const RatioModal: React.FC<RatioModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selected, setSelected] = React.useState<AspectRatio | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 animate-scale-up">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Pilih Format Output</h2>
        <p className="text-slate-500 mb-8 text-sm">Pilih rasio aspek konten yang paling sesuai untuk platform Anda.</p>
        
        <div className="space-y-3">
          {[
            { id: AspectRatio.Vertical, label: '9:16 (Vertikal)', desc: 'TikTok, Reels, Shorts', icon: '📱' },
            { id: AspectRatio.Square, label: '1:1 (Persegi)', desc: 'Instagram Feed, Facebook', icon: '◼️' },
            { id: AspectRatio.Landscape, label: '16:9 (Lanskap)', desc: 'YouTube, Web Banner', icon: '💻' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center ${
                selected === opt.id 
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm transform scale-[1.02]' 
                  : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className={`font-bold block transition-colors ${selected === opt.id ? 'text-blue-700' : 'text-slate-900'}`}>{opt.label}</span>
                <span className="text-xs text-slate-500 font-medium">{opt.desc}</span>
              </div>
              <span className="text-2xl grayscale-0">{opt.icon}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95">Batal</button>
          <button 
            onClick={() => selected && onConfirm(selected)} 
            disabled={!selected}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-950 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Mulai
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatioModal;