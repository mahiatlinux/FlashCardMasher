import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => {
    const textareaClasses = cn(
      'bg-background-tertiary text-white rounded-lg border border-gray-700 py-2 px-4',
      'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
      'placeholder-gray-500 transition-colors duration-200 min-h-[120px]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
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
        <textarea ref={ref} className={textareaClasses} {...props} />
        {error && (
          <p className="mt-1 text-sm text-error-secondary">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';