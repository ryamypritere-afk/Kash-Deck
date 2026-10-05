import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  onBack?: () => void;
  currentStep?: number; // 1-indexed, e.g. 1 to 4
  totalSteps?: number; // default 4
  rightAction?: {
    text: string;
    actionText: string;
    onAction: () => void;
  };
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBack,
  currentStep,
  totalSteps = 4,
  rightAction,
  className = ''
}) => {
  return (
    <header className={`w-full flex items-center justify-between pb-6 select-none ${className}`}>
      {/* Left: Brand Logo or Back Button */}
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center text-white shadow-xs">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-emerald-950">CashDeck</span>
          </div>
        )}
      </div>

      {/* Right Side: Either Progress Dots or Right Action Link */}
      <div className="flex items-center gap-4">
        {currentStep !== undefined && totalSteps > 0 && (
          <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }).map((_, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isPast = stepNum < currentStep;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-6 bg-[#047857]'
                      : isPast
                      ? 'w-2 bg-emerald-400'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              );
            })}
          </div>
        )}

        {rightAction && (
          <div className="text-xs sm:text-sm text-slate-500">
            <span>{rightAction.text} </span>
            <button
              type="button"
              onClick={rightAction.onAction}
              className="font-bold text-[#047857] hover:text-emerald-800 hover:underline transition-colors"
            >
              {rightAction.actionText}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
