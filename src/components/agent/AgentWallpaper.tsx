import { useRef, useState, useEffect } from 'react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';
import { Loader2 } from 'lucide-react';

const THEMES = [
  {
    name: "Protocol",
    id: "protocol",
    base: "bg-[#0F1923]",
    radial: "bg-[radial-gradient(circle_at_50%_0%,_#1b2631_0%,_#0F1923_80%)]", 
    accent: "#FF4655",
    textAccent: "text-[#FF4655]",
    gridOpacity: "opacity-1",
  },
  {
    name: "Kingdom",
    id: "kingdom",
    base: "bg-[#1a1a2e]", 
    radial: "bg-[radial-gradient(circle_at_50%_0%,_#2a235e_0%,_#1a1a2e_80%)]",
    accent: "#facc15", 
    textAccent: "text-[#facc15]", 
    gridOpacity: "opacity-1",
  },
  {
    name: "Omega",
    id: "omega",
    base: "bg-[#18181b]",
    radial: "bg-[radial-gradient(circle_at_50%_0%,_#2e125e_0%,_#18181b_80%)]", 
    accent: "#c084fc",
    textAccent: "text-[#c084fc]",
    gridOpacity: "opacity-1",
  },
  {
    name: "Glitch",
    id: "glitch",
    base: "bg-[#09090b]", 
    radial: "bg-[radial-gradient(circle_at_50%_0%,_#0d4f5e_0%,_#09090b_80%)]", 
    accent: "#22d3ee",
    textAccent: "text-[#22d3ee]",
    gridOpacity: "opacity-1",
  },
  {
    name: "Nature",
    id: "nature",
    base: "bg-[#052e16]",
    radial: "bg-[radial-gradient(circle_at_50%_0%,_#0d381e_0%,_#052e16_80%)]", 
    accent: "#4ade80",
    textAccent: "text-[#4ade80]",
    gridOpacity: "opacity-1",
  }
];

const PATTERNS = [
  {
    id: "grid",
    render: () => (
      <div className="absolute inset-0 opacity-5" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
    )
  },
  {
    id: "dots",
    render: () => (
      <div className="absolute inset-0 opacity-10"
           style={{ 
             backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }} 
      />
    )
  },
  {
    id: "graph",
    render: () => (
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ 
             backgroundImage: `
               linear-gradient(#ffffff 1px, transparent 1px), 
               linear-gradient(90deg, #ffffff 1px, transparent 1px), 
               linear-gradient(#ffffff 0.5px, transparent 0.5px), 
               linear-gradient(90deg, #ffffff 0.5px, transparent 0.5px)
             `, 
             backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
             backgroundPosition: '-1px -1px' 
           }} 
      />
    )
  },
  {
     id: "diagonal",
     render: () => (
        <div className="absolute inset-0 opacity-5"
             style={{ 
               backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)', 
               backgroundSize: '20px 20px' 
             }} 
        />
     )
  },
  {
      id: "cross",
      render: () => (
        <div className="absolute inset-0 -z-10 h-full w-full opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="small-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 20 40 M 0 20 L 40 20" stroke="white" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#small-grid)" />
          </svg>
        </div>
      )
  },
   {
      id: "masked-dots",
      render: () => (
        <div className="absolute inset-0 opacity-10"
             style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                backgroundSize: '30px 30px',
                maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)'
             }} 
        />
      )
  }
];

interface AgentWallpaperProps {
  agents: (Agent | null)[];
  isRolling?: boolean;
  isRestoring?: boolean;
  playerNames?: string[];
}

export default function AgentWallpaper({ agents, isRolling = false, isRestoring = false, playerNames = [] }: AgentWallpaperProps) {
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(() => THEMES[Math.floor(Math.random() * THEMES.length)]);
  const [pattern, setPattern] = useState(() => PATTERNS[Math.floor(Math.random() * PATTERNS.length)]);
  const [mounted, setMounted] = useState(false);
  
  // Trigger animations only after rolling is finished and content is mounted
  useEffect(() => {
    if (!isRolling && !isRestoring) {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isRolling, isRestoring]);
  
  const [overlayStyle, setOverlayStyle] = useState(() => {
     const isLeft = Math.random() > 0.5;
     const initialTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
     return {
         left: isLeft ? '-10%' : 'auto',
         right: !isLeft ? '-10%' : 'auto',
         width: `${40 + Math.random() * 40}%`,
         transform: `skewX(${Math.random() > 0.5 ? '-' : ''}${10 + Math.random() * 20}deg)`,
         background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, ${initialTheme.accent}80, transparent)`,
         opacity: 0.7
     };
  });

  useEffect(() => {
    if (isRolling) {
      const newTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
      const newPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      
      setTheme(newTheme);
      setPattern(newPattern);
      
      const isLeft = Math.random() > 0.5;
      setOverlayStyle({
         left: isLeft ? '-10%' : 'auto',
         right: !isLeft ? '-10%' : 'auto',
         width: `${40 + Math.random() * 40}%`,
         transform: `skewX(${Math.random() > 0.5 ? '-' : ''}${10 + Math.random() * 20}deg)`,
         background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, ${newTheme.accent}80, transparent)`, 
         opacity: 0.5 + Math.random() * 0.4
      });
    }
  }, [isRolling]);

  const validAgents = agents.filter(a => a !== null) as Agent[];

  const getStyle = (index: number, total: number) => {

    const centerIndex = (total - 1) / 2;
    const dist = Math.abs(centerIndex - index);
    const zIndex = Math.round(20 - (dist * 5));
    const scale = 1.3 - (dist * 0.05); 
    const opacity = 1 - (dist * 0.05);
    
    let offsetPercent = 0;
    
    if (total > 1) {
        const step = 18; 
        offsetPercent = (index - centerIndex) * step;
    }
    
    return {
      zIndex,
      transform: `translateX(-50%) scale(${scale})`, 
      left: `calc(50% + ${offsetPercent}%)`,
      opacity
    };
  };

  if(!isRolling && validAgents.length === 0) return null;

  return (
    <section className="w-full flex flex-col gap-4 animate-tactical-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Squad <span className="text-[#FF4655]">
                  {isRolling ? "Generating..." : "Assemble"}
                </span></h3>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                {/* Save Wallpaper button removed */}
            </div>
        </div>

        <div 
            id="agent-wallpaper"
            ref={wallpaperRef}
            className={`relative w-full aspect-[21/11] md:aspect-[2.1/1] overflow-hidden rounded-lg shadow-2xl border border-gray-800 group transition-all duration-500 ${isRolling ? 'opacity-80' : 'opacity-100'} ${theme.base}`}
        >
            {/* Enhanced Background Design with Dynamic Theme */}
            <div className={`absolute inset-0 ${theme.base} overflow-hidden pointer-events-none`}>
                 {/* Radial Gradient Base */}
                 <div className={`absolute inset-0 ${theme.radial}`} />
                 
                 {/* Dynamic Pattern */}
                 {pattern.render()}

                 {/* Randomized Decorative Overlay */}
                 <div 
                    className="absolute top-0 h-full pointer-events-none transition-all duration-1000 ease-in-out"
                    style={{
                        ...overlayStyle,
                        // Ensure it's constrained
                        zIndex: 0 
                    }}
                 />
                

                {/* Bottom Graphic Lines */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <div className="absolute bottom-4 left-0 w-full h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${theme.accent}33, transparent)` }} />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            {(isRolling || isRestoring) ? (
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 z-50">
                   <div className="relative">
                      <div className="absolute inset-0 blur-xl opacity-20 animate-pulse" style={{ backgroundColor: theme.accent }} />
                      <Loader2 size={48} className="animate-spin relative z-10" style={{ color: theme.accent }} />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 animate-pulse">
                      {isRestoring ? "Restoring Composition" : "Forging Composition"}
                   </p>
                   
               </div>
            ) : (
              /* Layer 1: Agent Images */
              <>
                  <div 
                      key={validAgents.map(a => a.uuid).join(',')}
                      className="absolute inset-x-0 bottom-[5%] h-[90%] flex items-end justify-center pointer-events-none"
                  >
                      {validAgents.map((agent, idx) => {
                          const style: any = getStyle(idx, validAgents.length);

                          return (
                              <div 
                                  key={`img-${agent.uuid}`}
                                  className={`absolute bottom-0 w-[40%] md:w-[40%] transition-all origin-bottom pointer-events-auto group/agent ${mounted ? 'animate-agent-reveal' : 'opacity-0'}`}
                                  style={{
                                      ...style,
                                      '--scale': (style.transform.match(/scale\((.*?)\)/) || [])[1] || 1,
                                      clipPath: 'inset(0 12% 0 12%)',
                                      animationDelay: `${idx * 200}ms`
                                  } as React.CSSProperties}
                              >
                                  <img 
                                      src={agent.fullPortrait || agent.displayIcon} 
                                      alt={agent.displayName}
                                      className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-all duration-500"
                                  />
                              </div>
                          );
                      })}
                  </div>

                  /* Layer 2: Text Overlay (Always on top) */
                  <div className="absolute inset-x-0 bottom-[5%] h-[90%] flex items-end justify-center pointer-events-none z-40">
                      {validAgents.map((agent, idx) => {
                          const style = getStyle(idx, validAgents.length);
                          return (
                              <div 
                                  key={`txt-${agent.uuid}`}
                                  className="absolute bottom-0 w-[40%] md:w-[40%] transition-all duration-500 origin-bottom"
                                  style={style}
                              >
                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center ">
                                      {playerNames[idx] && (
                                          <div className="mb-2">
                                              <div className="bg-black/50 -skew-x-12 px-4 py-1 inline-block border-l-2 border-white/80">
                                                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white drop-shadow-xl skew-x-12 block">
                                                      {playerNames[idx]}
                                                  </span>
                                              </div>
                                          </div>
                                      )}
                                      <h4 
                                        className="text-white font-black uppercase text-xs md:text-3xl italic tracking-tighter drop-shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500"
                                        style={{ textShadow: '0 4px 8px rgba(0,0,0,0.8)' }}
                                      >
                                          {agent.displayName}
                                      </h4>
                                      <div className="flex items-center justify-center gap-1 text-white/80 drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-500">
                                           <RoleIcon role={agent.role?.displayName} className="w-4 h-4" />
                                           <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{agent.role?.displayName}</span>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923] via-transparent to-transparent opacity-20 pointer-events-none" />
            
            {/* Logo Watermark */}
             <div className="absolute top-4 left-6 opacity-90">
                 <h2 className="text-xs font-extrabold uppercase">Valo<span className="text-[#FF4655]">Pick</span></h2>
                 <p className="text-[9px] font-semibold opacity-30">valo-pick.vercel.app</p>
             </div>
        </div>
    </section>
  );
}
