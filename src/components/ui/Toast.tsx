import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1c252e] border border-green-500/30 shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3 pr-10 relative overflow-hidden group">
        
        {/* Progress/Background effect */}
        <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />

        <CheckCircle2 size={18} className="text-green-500" />
        
        <p className="text-white text-xs font-bold uppercase tracking-widest">
          {message}
        </p>

        <button 
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
