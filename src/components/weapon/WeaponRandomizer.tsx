import { useState } from 'react';
import { RefreshCw, Crosshair } from 'lucide-react';
import type { Weapon } from '../../types';
import { WEAPON_CATEGORIES } from '../../constants';

interface WeaponRandomizerProps { 
  weapons: Weapon[];
  isRolling: boolean;
  setIsRolling: (v: boolean) => void;
}

export default function WeaponRandomizer({ weapons, isRolling, setIsRolling }: WeaponRandomizerProps) {
    const [result, setResult] = useState<Weapon | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(WEAPON_CATEGORIES));

    const toggleCategory = (cat: string) => {
      setSelectedCategories(prev => 
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );
    };

    const getFilteredWeapons = () => {
      return weapons.filter(w => {
        const catName = Object.keys(WEAPON_CATEGORIES).find(key => WEAPON_CATEGORIES[key as keyof typeof WEAPON_CATEGORIES] === w.category);
        return catName && selectedCategories.includes(catName);
      });
    };
  
    const handleRoll = () => {
      const pool = getFilteredWeapons();
      if (isRolling || pool.length === 0) return;
      
      setIsRolling(true);
      setResult(null);
  
      let ticks = 0;
      const interval = setInterval(() => {
        ticks++;
        const randomWeapon = pool[Math.floor(Math.random() * pool.length)];
        setResult(randomWeapon);
      }, 50);
  
      setTimeout(() => {
        clearInterval(interval);
        const finalWeapon = pool[Math.floor(Math.random() * pool.length)];
        setResult(finalWeapon);
        setIsRolling(false);
      }, 1500);
    };
  
    return (
      <div className="flex flex-col items-center gap-8 w-full">
         <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Weapon <span className="text-[#FF4655]">Randomizer</span></h2>
            <p className="text-gray-400 text-sm">Let the protocol decide.</p>
         </div>

         <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
            {Object.keys(WEAPON_CATEGORIES).map(cat => {
              const isActive = selectedCategories.includes(cat);
              
              let repWeapon;
              if (cat === 'Pistol') {
                 repWeapon = weapons.find(w => w.displayName === 'Classic');
              } else {
                 repWeapon = weapons.find(w => w.category === WEAPON_CATEGORIES[cat as keyof typeof WEAPON_CATEGORIES]);
              }
              
              return (
                <button
                  key={cat}
                  onClick={() => !isRolling && toggleCategory(cat)}
                  disabled={isRolling}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded border transition-all ${
                    isActive 
                      ? 'bg-[#FF4655] border-[#FF4655] text-white' 
                      : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                  } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">{cat}</span>
                  {repWeapon && (
                     <img 
                        src={repWeapon.displayIcon} 
                        alt={cat} 
                        className={`h-6 w-auto object-contain transition-all ${isActive ? 'brightness-200 contrast-0' : 'opacity-50 grayscale'}`} 
                     />
                  )}
                </button>
              );
            })}
         </div>
  
         <div className="relative w-full max-w-lg aspect-video bg-[#1c252e] border-2 border-gray-700 flex items-center justify-center p-8 rounded-lg overflow-hidden group">
            {result ? (
               <div className="flex flex-col items-center relative z-10">
                  <img src={result.displayIcon} alt={result.displayName} className="w-full h-auto drop-shadow-2xl max-h-[200px] object-contain" />
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-black uppercase text-white tracking-widest">{result.displayName}</h3>
                    <p className="text-xs text-[#FF4655] font-bold uppercase tracking-widest">{result.category.split('::').pop()}</p>
                  </div>
               </div>
            ) : (
                <div className="text-gray-600 flex flex-col items-center gap-2">
                   <Crosshair size={48} className="opacity-20" />
                   <span className="text-xs font-mono uppercase tracking-widest opacity-50">System Ready</span>
                </div>
             )}
             
             <div className="absolute inset-0 bg-[#FF4655]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
  
         <button
            onClick={handleRoll}
            disabled={isRolling || getFilteredWeapons().length === 0}
            className={`px-12 py-4 text-lg font-black uppercase tracking-widest transition-all clip-path-polygon relative overflow-hidden ${
              isRolling || getFilteredWeapons().length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#FF4655] hover:bg-[#ff2b3d] text-white shadow-[0_0_20px_rgba(255,70,85,0.4)]'
            }`}
             style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
             {isRolling ? <RefreshCw className="animate-spin" /> : 'GENERATE WEAPON'}
         </button>
      </div>
    );
}
