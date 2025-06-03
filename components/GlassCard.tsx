
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div 
      className={`bg-blue-600/10 backdrop-filter backdrop-blur-lg border border-blue-400/20 shadow-2xl rounded-xl p-6 sm:p-8 ${className || ''}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;