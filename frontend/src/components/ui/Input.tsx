import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, leftIcon, rightIcon, className, ...props }, ref) => {
    const inputClasses = cn(
      'bg-background-tertiary text-white rounded-lg border border-gray-700 py-2 px-4 placeholder-gray-500',
      'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
      'transition-colors duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      error ? 'border-error-primary focus:border-error-primary focus:ring-error-primary' : '',
      fullWidth ? 'w-full' : '',
      className
    );

    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-secondary">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';