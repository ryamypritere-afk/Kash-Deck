import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Loader2,
  Search,
  Check
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { api, DiscoveredAccountDTO } from '../../services/api';
import { BankLogo } from './BankLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentScreen, setSelectedMoneyAccountId, refreshAccount } = useFinancial();

  // Step 1: Welcome
  // Step 2: Account Creation
  // Step 3: Identity Verification (KYC / Masked NIN)
  // Step 4: Consent
  // Step 5: Financial Account Discovery / Selection
  // Step 6: Connection Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form states
  const [fullName, setFullName] = useState('Ada Okafor');
  const [emailOrPhone, setEmailOrPhone] = useState('ada.okafor@example.ng');
  const [password, setPassword] = useState('••••••••••');
  const [idType, setIdType] = useState<'NIN' | 'BVN'>('NIN');
  const [idNumber, setIdNumber] = useState('29481021842');
  const [maskedId, setMaskedId] = useState('•••••••1842');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Discovered Accounts
  const [discoveredAccounts, setDiscoveredAccounts] = useState<DiscoveredAccountDTO[]>([
    {
      providerAccountId: 'gtb_01',
      bankName: 'GTBank',
      accountName: 'GTBank Individual Current',
      type: 'bank',
      maskedAccountNumber: '•••• 4821',
      balance: 2100000,
      availableBalance: 2100000,
      currency: 'NGN'
    },
    {
      providerAccountId: 'access_01',
      bankName: 'Access Bank',
      accountName: 'Access Premier Checking',
      type: 'bank',
      maskedAccountNumber: '•••• 1934',
      balance: 850000,
      availableBalance: 850000,
      currency: 'NGN'
    },
    {
      providerAccountId: 'uba_01',
      bankName: 'UBA',
      accountName: 'UBA Lion Savings',
      type: 'bank',
      maskedAccountNumber: '•••• 7712',
      balance: 1400000,
      availableBalance: 1400000,
      currency: 'NGN'
    },
    {
      providerAccountId: 'opay_01',
      bankName: 'OPay',
      accountName: 'OPay Wallet Balance',
      type: 'wallet',
      maskedAccountNumber: '•••• 6291',
      balance: 500000,
      availableBalance: 500000,
      currency: 'NGN'
    }
  ]);

  // Selected indices for checkboxes
  const [selectedIndices, setSelectedIndices] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
    3: true
  });

  const [directSearchOpen, setDirectSearchOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  if (!isOpen) return null;

  // Handle Account Creation
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await api.register(fullName, emailOrPhone);
      setIsLoading(false);
      setStep(3); // Continue to Identity Verification
    } catch {
      setIsLoading(false);
      setStep(3);
    }
  };

  // Handle Identity Verification
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.verifyIdentity(idType, idNumber);
      if (res.verification?.maskedId) {
        setMaskedId(res.verification.maskedId);
      }
      setIsLoading(false);
      setStep(4); // Continue to Consent
    } catch {
      setIsLoading(false);
      setStep(4);
    }
  };

  // Handle Consent
  const handleGrantConsent = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.grantConsent(['account_info', 'balances', 'transactions']);
      // Discover accounts via API
      const disc = await api.discoverAccounts();
      if (disc.discoveredAccounts && disc.discoveredAccounts.length > 0) {
        setDiscoveredAccounts(disc.discoveredAccounts);
      }
      setIsLoading(false);
      setStep(5); // Continue to Financial Account Discovery
    } catch {
      setIsLoading(false);
      setStep(5);
    }
  };

  // Handle Connecting Selected Accounts
  const handleConnectSelectedAccounts = async () => {
    setIsLoading(true);
    const toConnect = discoveredAccounts.filter((_, idx) => selectedIndices[idx] !== false);

    try {
      await api.connectAccounts(toConnect);
      setIsLoading(false);
      setStep(6); // Success

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Automatically transition to the Money page as required by Section 9
      setTimeout(() => {
        refreshAccount('all');
        setSelectedMoneyAccountId('all');
        setCurrentScreen('money');
        onClose();
      }, 1800);
    } catch {
      setIsLoading(false);
      setStep(6);
      setTimeout(() => {
        setCurrentScreen('money');
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {step > 1 && step < 6 && (
              <button
                onClick={() => setStep(prev => (prev - 1) as any)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 mr-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-black text-sm">
              CD
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CashDeck Setup
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {step === 1 && 'Welcome'}
                {step === 2 && 'Create Account'}
                {step === 3 && 'Identity Verification'}
                {step === 4 && 'Financial Consent'}
                {step === 5 && 'Connect Accounts'}
                {step === 6 && 'Connection Complete'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* ==========================================
              SCREEN 1: WELCOME (Section 3)
             ========================================== */}
          {step === 1 && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Your money, all in one place.
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Connect your accounts and let CashDeck organize your money automatically.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-left space-y-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-emerald-950">
                    Never manually enter bank balances or past transactions
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-emerald-950">
                    Direct authenticated financial provider synchronization
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-emerald-950">
                    Bank-grade 256-bit encryption with zero password storage
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Get started</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentScreen('money');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  I already have an account
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN 2: ACCOUNT CREATION (Section 4)
             ========================================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Create your CashDeck account
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your contact details to begin. We won&apos;t ask for financial details until we explain why.
                </p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ada Okafor"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email or phone number
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. ada@example.com or 08012345678"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Choose a secure password"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue to Identity Verification</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==========================================
              SCREEN 3: IDENTITY VERIFICATION (Section 5)
             ========================================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Let&apos;s verify you.
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your identity helps us securely connect your financial accounts. Your information is handled according to our privacy and consent requirements.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy Guarantee:</strong> Your full identity number is never displayed across the application or sent to client logs. It is securely masked (e.g. •••••••1842).
                </span>
              </div>

              <form onSubmit={handleVerifyIdentity} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Identity Document Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIdType('NIN')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                        idType === 'NIN'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      National Identity (NIN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdType('BVN')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                        idType === 'BVN'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      Bank Verification (BVN)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {idType} Number (11 digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    placeholder="Enter 11-digit number"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Will be masked as •••••••{idNumber.slice(-4) || '1842'} immediately upon verification.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==========================================
              SCREEN 4: CONSENT (Section 6)
             ========================================== */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Identity Verified: {maskedId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 pt-1">
                  Connect your financial accounts
                </h3>
                <p className="text-xs text-slate-500">
                  CashDeck requires explicit permission to automatically retrieve your account records.
                </p>
              </div>

              {/* Clear permission breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800">
                  CashDeck may access:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[3]" />
                    <div>
                      <strong className="text-slate-900">Account information</strong>
                      <p className="text-[11px] text-slate-500">Bank name, account name, and masked account number.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[3]" />
                    <div>
                      <strong className="text-slate-900">Balance information</strong>
                      <p className="text-[11px] text-slate-500">Current and available balances to show your total net position.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[3]" />
                    <div>
                      <strong className="text-slate-900">Transaction history</strong>
                      <p className="text-[11px] text-slate-500">Deposits, transfers, card purchases and bill settlements.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900">
                <strong>Your control:</strong> You can disconnect any account or revoke consent at any time from your CashDeck Settings. We never ask for your bank password or transaction PIN.
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleGrantConsent}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Continue securely</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-semibold text-xs"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN 5: FINANCIAL ACCOUNT DISCOVERY (Section 7 & 8)
             ========================================== */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Accounts found
                </h3>
                <p className="text-xs text-slate-500">
                  These accounts are available to connect via your verified identity. Select which accounts you want CashDeck to connect.
                </p>
              </div>

              {/* Accounts Checkbox List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {discoveredAccounts.map((acc, idx) => {
                  const isChecked = selectedIndices[idx] !== false;

                  return (
                    <div
                      key={acc.providerAccountId}
                      onClick={() =>
                        setSelectedIndices(prev => ({
                          ...prev,
                          [idx]: !isChecked
                        }))
                      }
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30'
                          : 'border-slate-200 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isChecked ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <BankLogo bankName={acc.bankName} size="md" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{acc.bankName}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {acc.maskedAccountNumber}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">
                          ₦{acc.balance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Bank Search Fallback (Section 8) */}
              {!directSearchOpen ? (
                <button
                  onClick={() => setDirectSearchOpen(true)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline block text-center w-full"
                >
                  Don&apos;t see your bank? Search other institutions
                </button>
              ) : (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Connect your bank directly:
                  </span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bankSearchQuery}
                      onChange={e => setBankSearchQuery(e.target.value)}
                      placeholder="Search Nigerian bank or mobile wallet..."
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleConnectSelectedAccounts}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Connect selected accounts</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN 6: CONNECTION SUCCESS (Section 9)
             ========================================== */}
          {step === 6 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  Your account is connected.
                </h3>
                <p className="text-xs text-slate-500">
                  Taking you directly to your Money dashboard...
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Account connected</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Balance retrieved</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Transactions syncing</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
