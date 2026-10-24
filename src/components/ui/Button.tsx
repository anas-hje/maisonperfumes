import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-graphite disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      // Gold stays the primary action; the glow is what makes it read as lit rather
      // than printed, which is most of the futuristic effect on a near-black page.
      primary:
        'bg-gradient-to-b from-amber to-[#C08F32] text-graphite hover:from-[#E7B65A] hover:to-amber shadow-[0_10px_30px_-10px_rgba(217,164,65,0.6)] hover:shadow-[0_14px_42px_-10px_rgba(217,164,65,0.75)]',
      secondary:
        'glass-surface text-light hover:text-amber hover:border-amber/45 hover:bg-white/[0.07]',
      ghost: 'bg-transparent text-quartz hover:text-amber hover:bg-white/5',
    };
    
    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-base px-6 py-3',
      lg: 'text-lg px-8 py-4'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
