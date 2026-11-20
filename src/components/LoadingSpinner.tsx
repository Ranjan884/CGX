import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center space-y-3"
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`animate-spin text-[#4F7CFF] ${sizeClasses[size]}`} />
      <p className="text-xs text-[#94A3B8] font-medium">
        {message}
      </p>
    </div>
  );
};
