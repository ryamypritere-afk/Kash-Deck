import React, { ReactNode } from 'react';
import { AuthHeader } from '../common/AuthHeader';

interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  type: 'personal' | 'business';
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
}

export const OnboardingShell: React.FC<OnboardingShellProps> = ({
  currentStep,
  totalSteps = 4,
  type,
  title,
  subtitle,
  onBack,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Progress Dots */}
      <div className="max-w-xl w-full mx-auto">
        <AuthHeader
          onBack={onBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </div>

      {/* Main Content Card */}
      <main className="max-w-xl w-full mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};
