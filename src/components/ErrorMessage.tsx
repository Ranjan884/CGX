import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showFallbackNotice?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Service Communication Alert',
  message,
  onRetry,
  showFallbackNotice = false
}) => {
  return (
    <div
      className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#121927] text-xs space-y-2"
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-[#F5F7FA]">{title}</div>
          <p className="mt-0.5 text-[#CBD5E1] leading-relaxed">
            {message}
          </p>
          {showFallbackNotice && (
            <p className="mt-1 text-[11px] text-[#94A3B8]">
              Active Session Notice: Operating in local fallback simulation mode to keep platform responsive.
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#171F30] hover:bg-[#161F30] border border-[#263148] text-[#F5F7FA] flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
