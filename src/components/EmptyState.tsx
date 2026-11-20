import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#263148] bg-[#121927]">
      <div className="w-10 h-10 rounded-full bg-[#171F30] border border-[#263148] flex items-center justify-center text-[#94A3B8] mb-3">
        <Icon className="w-5 h-5 text-[#94A3B8]" />
      </div>
      <h3 className="text-sm font-semibold text-[#F5F7FA]">
        {title}
      </h3>
      <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F7CFF] hover:bg-[#3D68E0] rounded-lg transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
