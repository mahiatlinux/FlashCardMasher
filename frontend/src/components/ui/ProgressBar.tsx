import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'default',
  animated = false,
  className,
}) => {
  // Ensure value is between 0 and max
  const normalizedValue = Math.max(0, Math.min(value, max));
  const percentage = (normalizedValue / max) * 100;
  
  // Determine height based on size
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };
  
  // Determine color based on variant
  const variantClasses = {
    default: 'bg-accent-primary',
    success: 'bg-success-primary',
    warning: 'bg-warning-primary',
    error: 'bg-error-primary',
  };
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-300">{label}</span>}
          {showValue && (
            <span className="text-sm text-gray-300">
              {normalizedValue}/{max}
            </span>
          )}
        </div>
      )}
      
      <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            variantClasses[variant],
            'rounded-full transition-all duration-500',
            animated && 'relative overflow-hidden',
            sizeClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && percentage > 0 && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};