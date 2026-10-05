import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiV1 } from '../../services/apiV1';
import { AuthHeader } from '../common/AuthHeader';
import { ShieldVerifyIllustration, SuccessCheckIllustration } from '../common/AuthIllustrations';

interface VerifyScreenProps {
  onSuccess: () => void;
  onBackToLogin?: () => void;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({ onSuccess, onBackToLogin }) => {
  const { user, refreshMe, logout } = useAuth();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // If pasted multiple digits
    if (cleanVal.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleanVal.length && index + i < 6; i++) {
        next[index + i] = cleanVal[i];
      }
      setDigits(next);
      const nextIndex = Math.min(index + cleanVal.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleanVal;
    setDigits(next);

    // Auto advance
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await apiV1.verifyEmail(code);
      await refreshMe();
      setIsVerifiedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    try {
      await apiV1.resendVerification('email');
      setResendCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code');
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // SCREEN 3: VERIFICATION SUCCESS VIEW
  if (isVerifiedSuccess) {
    return (
      <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto">
          <AuthHeader currentStep={3} totalSteps={4} />
        </div>

        <main className="max-w-md w-full mx-auto my-auto py-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
            {/* Illustration: Large Checkmark */}
            <div className="flex justify-center mb-6">
              <SuccessCheckIllustration size={140} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              You're verified!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Your CashDeck account is ready to set up.
            </p>

            <button
              onClick={onSuccess}
              className="w-full mt-8 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              Continue
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-3">
          CashDeck Financial Operating System • NDPA Compliant
        </footer>
      </div>
    );
  }

  // SCREEN 2: VERIFICATION INPUT VIEW
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full mx-auto">
        <AuthHeader
          onBack={onBackToLogin || logout}
          currentStep={2}
          totalSteps={4}
        />
      </div>

      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
          {/* Illustration: Shield with checkmark */}
          <div className="flex justify-center mb-5">
            <ShieldVerifyIllustration size={120} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify your account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            We sent a verification code to{' '}
            <strong className="text-slate-800 font-semibold">{user?.email || 'your email'}</strong>.
          </p>

          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-6 space-y-6">
            {/* 6 OTP digit input boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                    digit
                      ? 'border-[#047857] bg-emerald-50/40 text-slate-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-[#047857] focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              ))}
            </div>

            {/* Resend code & Change link */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-bold text-[#047857] hover:underline"
                  >
                    Resend now
                  </button>
                ) : (
                  <span className="text-slate-400">Resend code in {formatTimer(resendCooldown)}</span>
                )}
              </p>
              <div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                >
                  Change email or phone
                </button>
              </div>
            </div>

            {/* Primary Button */}
            <button
              type="submit"
              disabled={isLoading || digits.join('').length !== 6}
              className="w-full py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};
