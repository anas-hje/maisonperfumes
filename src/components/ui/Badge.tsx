import React from 'react';

export interface BadgeProps {
  variant?: 'sale' | 'new' | 'soldout';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'new', children, className = '' }: BadgeProps) {
  const variants = {
    sale: 'bg-red-900/80 text-red-100 border border-red-500/30',
    new: 'bg-amber/90 text-graphite',
    soldout: 'bg-obsidian/90 text-quartz/70 border border-white/10'
  };

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider backdrop-blur-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
