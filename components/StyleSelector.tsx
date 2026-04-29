import React from 'react';
import { ContentStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: ContentStyle | null;
  onSelect: (style: ContentStyle) => void;
}

const styles = [
  { id: ContentStyle.QuickInsight, title: 'Resep Cepat', desc: 'Fokus pada proses singkat & hasil akhir.' },
  { id: ContentStyle.ProductFocus, title: 'Focus Produk', desc: 'Menampilkan detail produk sebagai pahlawan.' },
  { id: ContentStyle.LiveShowcase, title: 'Mukbang / Review', desc: 'Reaksi, ekspresi, dan pengalaman personal.' },
  { id: ContentStyle.Editorial, title: 'Flatlay & Aesthetic', desc: 'Mengutamakan komposisi artistik dan props.' },
  { id: ContentStyle.DramaticPoster, title: 'Banner Poster', desc: 'Satu gambar resolusi tinggi, pencahayaan sinematik.', span: 'col-span-2' },
];

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {styles.map((style) => (
        <div
          key={style.id}
          onClick={() => onSelect(style.id)}
          className={`
            cursor-pointer p-5 rounded-2xl text-center border-2 transition-all duration-300
            ${style.span || ''}
            ${selectedStyle === style.id 
              ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.02]' 
              : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
            }
          `}
        >
          <h3 className={`font-bold text-sm sm:text-base transition-colors ${selectedStyle === style.id ? 'text-blue-700' : 'text-slate-900'}`}>
            {style.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-2 leading-relaxed">{style.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default StyleSelector;