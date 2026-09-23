import React, { ReactNode } from 'react';

interface GlassPanelProps {
  level?: 2 | 3;
  accent?: 'neutral' | 'emerald' | 'amber' | 'cyan' | 'rose';
  className?: string;
  children: ReactNode;
  id?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  level = 2,
  accent = 'neutral',
  className = '',
  children,
  id,
}) => {
  // Level 2 = standard glass, Level 3 = hero glass with stronger depth and subtle highlight
  const baseClasses =
    level === 3
      ? 'rounded-2xl border backdrop-blur-md shadow-xl'
      : 'rounded-xl border backdrop-blur-sm shadow-md';

  let accentClasses = '';
  switch (accent) {
    case 'emerald':
      accentClasses =
        level === 3
          ? 'border-emerald-800/60 bg-gradient-to-b from-[#101b16]/95 to-[#0b1310]/95 shadow-emerald-950/20'
          : 'border-emerald-900/40 bg-[#0e1612]/90';
      break;
    case 'amber':
      accentClasses =
        level === 3
          ? 'border-amber-800/60 bg-gradient-to-b from-[#1c1611]/95 to-[#130f0c]/95 shadow-amber-950/20'
          : 'border-amber-900/40 bg-[#16120e]/90';
      break;
    case 'cyan':
      accentClasses =
        level === 3
          ? 'border-cyan-800/60 bg-gradient-to-b from-[#0e1a22]/95 to-[#091218]/95 shadow-cyan-950/20'
          : 'border-cyan-900/40 bg-[#0c151c]/90';
      break;
    case 'rose':
      accentClasses =
        level === 3
          ? 'border-rose-800/60 bg-gradient-to-b from-[#1e1014]/95 to-[#140b0e]/95 shadow-rose-950/20'
          : 'border-rose-900/40 bg-[#180d11]/90';
      break;
    default:
      accentClasses =
        level === 3
          ? 'border-zinc-800/80 bg-gradient-to-b from-[#141822]/95 to-[#0d1017]/95 shadow-zinc-950/30'
          : 'border-[#1e222d] bg-[#10131a]/90';
      break;
  }

  return (
    <div id={id} className={`${baseClasses} ${accentClasses} ${className}`}>
      {children}
    </div>
  );
};
