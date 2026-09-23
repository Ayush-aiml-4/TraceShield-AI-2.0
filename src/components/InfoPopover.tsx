import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  title?: string;
  description: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  description,
  className = '',
  align = 'center',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={title || 'Information'}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-white/[0.1] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-slate-400 inline-flex items-center justify-center"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 z-50 w-64 rounded-xl border border-white/15 bg-[#0f1420]/98 p-3 shadow-2xl backdrop-blur-2xl text-left text-xs ${alignmentClasses}`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-100 mb-1 flex items-center justify-between border-b border-white/[0.1] pb-1.5">
              <span>{title}</span>
            </div>
          )}
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-white/15" />
        </div>
      )}
    </div>
  );
};
