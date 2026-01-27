import { useState, useEffect } from 'react';
import type { Agent } from '../../types';
import { Copy, Loader2, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import Toast from '../ui/Toast';

// Declare window.ai types for TypeScript
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities: () => Promise<{ available: string }>;
        create: (options?: any) => Promise<{
          prompt: (input: string) => Promise<string>;
          promptStreaming: (input: string) => AsyncIterable<string>;
          destroy: () => void;
        }>;
      };
    };
  }
}

const MAPS = [
  "Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset", "Abyss"
];

interface CinematicWallpaperProps {
  agents: (Agent | null)[];
  isRestoring?: boolean;
}

export default function CinematicWallpaper({ agents, isRestoring = false }: CinematicWallpaperProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMap, setSelectedMap] = useState("Ascent");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [copyProgress, setCopyProgress] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const validAgents = agents.filter(a => a !== null) as Agent[];

  // Check for Gemini Nano availability
  useEffect(() => {
    if (window.ai?.languageModel) {
      window.ai.languageModel.capabilities().then(cap => {
        setAiAvailable(cap.available === 'readily');
      }).catch(() => setAiAvailable(false));
    } else {
      setAiAvailable(false);
    }
  }, []);

  const generateFallbackBeats = (agents: Agent[]) => {
    return agents.map((agent, i) => 
      `Agent ${i+1} (${agent.displayName}): ready for action, holding a strategic position.`
    ).join("\n");
  };

  const constructFinalPrompt = (mapName: string, beats: string, count: number) => {
    const agentText = count === 1 ? "one Valorant agent" : `${count} Valorant agents`;
    const allKey = count === 1 ? "The agent remains" : `All ${count} agents remain`;

    return `
SYSTEM INSTRUCTION (MANDATORY - DO NOT SKIP):
You must NOT perform any image transformation or generation unless an image is already provided by the user (pasted directly in the chatbox).
First, strictly perform this check:

If NO image is detected, STOP immediately and respond with exactly this sentence (no additions, no variations):
"Provide wallpaper image generated from ValoPick. Simply copy and paste here!"
Only proceed to the next phase AFTER an image is detected.

PHASE 2 — IMAGE TRANSFORMATION TASK (ONLY IF IMAGE EXISTS):
Transform the provided image using Nano Banana, reinterpreting ${count} Valorant agents into a natural, cinematic narrative scene set explicitly on the VALORANT map: ${mapName.toUpperCase()}, rendered in the Arcane (Riot Games) animated series style.
The final result must feel like a story-driven animated film still, not a poster, not splash art, and not a gameplay screenshot.

SCENE & LOCATION — ${mapName.toUpperCase()}:
Scene takes place in a recognizable signature area of ${mapName}
Authentic ${mapName} architecture, materials, crates, alleys, and urban details
Subtle map-specific landmarks visible in the background to anchor location
Ground shows wear: cracks, dust, chipped stone, and uneven textures
Atmosphere feels lived-in and grounded, not futuristic or generic
Environmental details:
Light fabric banners or small foliage gently moving with wind
Floating dust particles and light atmospheric haze catching sunlight
No HUD, no UI, no gameplay indicators — purely cinematic world-building

CHARACTER DIRECTION — ${count} AGENTS:
Exactly ${count} agents: ${agentText}
${allKey} high recognizable from the source image:
Faces, outfits, proportions, silhouettes preserved
Reinterpreted with Arcane-style painterly realism:
Textured skin
Visible brush strokes
Imperfect materials
Subtle facial micro-expressions
Natural spacing between characters, forming a balanced cinematic composition

EMOTIONAL POSTURE (quiet tension before action):
${beats}

VISUAL STYLE — ARCANE / RIOT GAMES:
Hand-painted cinematic animation look
Stylized realism (NOT anime, NOT cartoon)
Strong silhouettes and readable shapes
Expressive but restrained emotions
Painterly lighting with texture and depth
Composition follows rule of thirds
Mid-to-low camera angle for cinematic weight

LIGHTING & MOOD:
Golden-hour lighting
Warm highlights contrasted with cool, soft shadows
Gentle rim light separating characters from background
Shallow depth of field with cinematic focus falloff
Subtle film grain
Mood: quiet tension, a breath before conflict

TECHNICAL / QUALITY TAGS:
Arcane-style animation, Riot Games cinematic, animated series still, ultra-detailed, painterly realism, concept art quality, volumetric lighting, global illumination, cinematic depth, 4K look

NEGATIVE PROMPT:
generic city, cyberpunk setting, sci-fi interiors, wrong Valorant map elements, non-${mapName} environments, anime style, chibi, cartoon, exaggerated proportions, splash art pose, poster layout, promotional composition, flat lighting, plastic skin, oversaturated colors, distorted anatomy, extra limbs, blurred or warped faces, text, watermark, logo, HUD, UI elements`;
  };

  const generatePrompt = async () => {
    if (validAgents.length === 0) return;
    setIsGenerating(true);

    try {
      const agentNames = validAgents.map(a => a.displayName).join(", ");
      let emotionalBeats = "";

      // Try to use Gemini Nano to generate specific beats
      if (window.ai?.languageModel && aiAvailable !== false) {
        try {
          const session = await window.ai.languageModel.create();
          
          const agentFormat = validAgents.map((a, i) => 
            `Agent ${i+1} (${a.displayName}): [Description]`
          ).join("\n            ");

          const promptInput = `
            Context: A cinematic group shot of ${validAgents.length} Valorant agents: ${agentNames} on the map ${selectedMap}.
            Task: Describe a 1-sentence "Emotional beat" or pose for EACH agent in this scene.
            Style: Arcane (Riot Games) animated film style. Grounded, emotional, immersive.
            
            Format:
            ${agentFormat}
          `;
          
          emotionalBeats = await session.prompt(promptInput);
          session.destroy();
        } catch (e) {
          console.error("Gemini Nano failed, falling back to template", e);
          emotionalBeats = generateFallbackBeats(validAgents);
        }
      } else {
        emotionalBeats = generateFallbackBeats(validAgents);
      }

      const finalPrompt = constructFinalPrompt(selectedMap, emotionalBeats, validAgents.length);
      setGeneratedPrompt(finalPrompt);

    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate when agents or map changes
  useEffect(() => {
    if (validAgents.length > 0) {
        generatePrompt();
    }
  }, [validAgents.map(a => a?.displayName).join(','), selectedMap]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const handleCopyImage = async () => {
    const wallpaperElement = document.getElementById('agent-wallpaper');
    if (!wallpaperElement || isCopying) return;

    setIsCopying(true);
    setCopyProgress(10);
    setShowCopySuccess(false);

    try {
        setCopyProgress(30);
        const canvas = await html2canvas(wallpaperElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0F1923', 
            scale: 2
        });
        
        setCopyProgress(70);
        canvas.toBlob(async (blob) => {
            if(blob) {
                await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
                setCopyProgress(100);
                setTimeout(() => {
                   setIsCopying(false);
                   setShowCopySuccess(true);
                   setCopyProgress(0);
                   
                   // Auto hide success after 3s
                   setTimeout(() => setShowCopySuccess(false), 3000);
                }, 200);
            }
        });
    } catch (e) {
        console.error("Copy failed", e);
        showToast("Failed to copy image");
        setIsCopying(false);
        setCopyProgress(0);
    }
  };

  const handleSaveWallpaper = async () => {
    const wallpaperElement = document.getElementById('agent-wallpaper');
    if (!wallpaperElement) return;

    try {
        const canvas = await html2canvas(wallpaperElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0F1923', 
            scale: 2
        });
        const link = document.createElement('a');
        link.download = `valopick-squad-${selectedMap.toLowerCase()}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    } catch (e) {
        console.error("Download failed", e);
        showToast("Failed to save wallpaper");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    window.open('https://gemini.google.com/app', '_blank');
  };

  if (validAgents.length === 0 && !isRestoring) return null;

  return (
    <section className="w-full mb-12 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
              Cinematic <span className="text-[#FF4655]">Wallpaper</span> <span className="text-white/30 font-semibold">(Experimental)</span>
            </h3>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest">Use prompt to transform Wallpaper into cinematic render using Gemini.</p>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1c252e] border border-gray-700 hover:border-[#FF4655] hover:bg-[#FF4655]/5 text-gray-400 hover:text-white transition-all rounded group"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isExpanded ? "Close Prompt" : "Open Prompt"}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <Toast 
          message={toast.message} 
          isVisible={toast.isVisible} 
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
        <div className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl flex flex-col md:flex-row gap-6">
            
          {/* Left Column: Controls (Original Width) */}
          <div className="md:w-1/4 flex flex-col gap-4">
            <div className="space-y-3">
               <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block">Map :</label>
               <div className="grid grid-cols-2 gap-2">
                  {MAPS.map(map => (
                  <button
                      key={map}
                      onClick={() => setSelectedMap(map)}
                      className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                      selectedMap === map 
                          ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-lg' 
                          : 'bg-[#0F1923] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                  >
                      {map}
                  </button>
                  ))}
               </div>
            </div>
            
            <div className="mt-auto">
               {(isGenerating || isRestoring) && (
                   <div className="flex items-center gap-2 text-[#FF4655] text-xs font-bold uppercase tracking-widest animate-pulse">
                       <Loader2 size={14} className="animate-spin" />
                       {isRestoring ? "Restoring Cinematic Data..." : "Forging Cinematic Prompt..."}
                   </div>
               )}
            </div>
          </div>

          {/* Middle Column: Output Terminal (Flex-1) */}
          <div className="flex-1 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    PROMPT :
                </span>
             </div>
             
             <div className={`flex-1 bg-[#0F1923] border border-gray-700 rounded p-2 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                
                <div className="relative z-10 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 h-[200px] ">
                      {generatedPrompt ? (
                          <div className="whitespace-pre-wrap overflow-y-auto text-[9px] text-[#FF4655]/40 font-mono leading-relaxed pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                              {generatedPrompt.split('**').map((part, i) => 
                                  part.includes('ASCENT') || part.includes(selectedMap.toUpperCase()) ? <span key={i} className=" font-black">{part}</span> : i % 2 === 1 ? <span key={i} className="text-[#facc15] font-semibold">{part}</span> : part
                              )}
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center  gap-4 opacity-50">
                              <RefreshCw size={24} />
                              <p className="uppercase tracking-widest text-[10px]">Waiting for generation sequence...</p>
                          </div>
                      )}
                </div>
             </div>
          </div>

          {/* Right Column: Action Panel (Integrated) */}
          <div className="md:w-auto flex flex-col gap-1 min-w-[180px]">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">Actions :</label>
              

              <p className="text-gray-600 text-[9px] tracking-widest">Copy this prompt into Gemini</p>
              <button 
                  onClick={() => {
                      copyToClipboard();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-[#FF4655] hover:bg-[#b62735] text-white text-xs font-black uppercase tracking-widest rounded shadow-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                  <Copy size={16} className="text-white" /> 
                  <span>Copy Prompt & Open Gemini</span>
              </button>

              <p className="text-gray-600 text-[9px] tracking-widest">Copy image to clipboard, then paste into Gemini</p>
              <button
                  onClick={handleCopyImage}
                  disabled={isGenerating || isCopying}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#0F1923] border border-gray-700 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest rounded transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                   {isCopying ? (
                     <Loader2 size={16} className="text-[#FF4655] animate-spin" />
                   ) : (
                     <Copy size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                   )}
                   <span>{isCopying ? 'Copying...' : 'Copy Image'}</span>
              </button>
              <button 
                  onClick={handleSaveWallpaper}
                  disabled={isGenerating}
                  className="mt-2 w-full flex items-center gap-3 px-4 py-3 bg-[#0F1923]/20 border border-gray-700/50 hover:bg-gray-700 text-gray-300/50 text-xs font-bold uppercase tracking-widest rounded transition-all group disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                  <Download size={16} className="text-gray-500 group-hover:text-white transition-colors" /> 
                  <span>Save Image</span>
              </button>
          </div>
        </div>
      </div>
      {/* Progress Bar & Mini Toast UI */}
      <div className="relative w-full h-1 mt-auto">
        {(isCopying || showCopySuccess) && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ease-out ${showCopySuccess ? 'bg-green-500' : 'bg-[#FF4655]'}`}
              style={{ width: `${isCopying ? copyProgress : 100}%` }}
            />
          </div>
        )}
        
        {showCopySuccess && (
          <div className="absolute right-0 top-2 animate-in slide-in-from-right-2 fade-in duration-300">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-black text-green-500 uppercase tracking-widest">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            Image copied, paste in Gemini</div>
          </div>
        )}
      </div>
    </section>
  );
}
