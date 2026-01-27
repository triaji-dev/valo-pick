import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string; // Add className prop
}

export default function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative inline-flex ${className}`} // Merge className
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-[100] w-max max-w-[200px]
          ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
          animate-in fade-in zoom-in-95 duration-200`}
        >
          <div className="bg-[#0F1923] border border-gray-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-xl whitespace-nowrap">
            {content}
            {/* Arrow */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F1923] border-r border-b border-gray-700 rotate-45
              ${position === 'top' ? 'bottom-[-5px] border-t-0 border-l-0 border-r-0 border-b-0 border-gray-700/0 md:border-r md:border-b' : 'top-[-5px] border-b-0 border-r-0 transform -rotate-135'}`} // Simplified arrow logic, mostly just a box
              style={position === 'top' ? { bottom: '-4px', borderRight: '1px solid rgb(55 65 81)', borderBottom: '1px solid rgb(55 65 81)' } : { top: '-4px', borderLeft: '1px solid rgb(55 65 81)', borderTop: '1px solid rgb(55 65 81)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
