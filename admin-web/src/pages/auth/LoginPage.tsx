import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  Phone,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ForgotPasswordModal } from '../../components/modals/ForgotPasswordModal';
import logoImg from '../../assets/logo.png';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Quick prefill helper for demo & estate testing
  const handlePreFillDemo = () => {
    setPhoneNumber('+94 77 123 4567');
    setPassword('Sunil@Estate2024');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setErrorMessage('Please enter your administrator phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    try {
      await login({ phoneNumber: trimmedPhone, password, rememberMe: true });
      const destination =
        (location.state as LocationState | null)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify credentials and backend status.'
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f7f5f0] flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-10 font-['Inter',sans-serif]">
      {/* 
        Responsive Card Container:
        - Mobile/Tablet: max-w-md or max-w-lg centered card
        - Desktop (lg+): Exactly matches the 1280px x 800px Figma layout
      */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-[1280px] bg-white rounded-2xl lg:rounded-3xl shadow-xl flex flex-col lg:flex-row justify-start items-stretch overflow-hidden border border-slate-200/80 transition-all">
        {/* Left Hero Panel (Compact on mobile, 640px split on desktop) */}
        <div className="w-full lg:w-[480px] xl:w-[640px] p-6 sm:p-10 lg:p-14 xl:p-16 bg-teal-950 flex flex-col justify-center items-start gap-3 sm:gap-4 shrink-0 overflow-hidden relative">
          {/* Subtle Ambient Decorative Gradient Glow */}
          <div className="absolute -top-32 -left-32 w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          {/* Logo container */}
          <div className="size-12 sm:size-14 lg:size-16 bg-emerald-900/60 border border-emerald-500/30 rounded-xl sm:rounded-2xl flex justify-center items-center overflow-hidden shadow-inner shrink-0">
            <img
              className="size-9 sm:size-10 lg:size-12 object-contain"
              src={logoImg}
              alt="TeaLedger Logo"
            />
          </div>

          {/* Brand Title */}
          <div className="self-stretch justify-start text-white text-2xl sm:text-3xl lg:text-4xl font-bold font-['Inter'] tracking-tight">
            TeaLedger
          </div>

          {/* Subtitle */}
          <div className="self-stretch justify-start text-emerald-100/90 text-sm sm:text-base lg:text-lg font-normal font-['Inter'] leading-relaxed max-w-md">
            Tea leaf collection and farmer accounts, managed in one place.
          </div>

          {/* Security Assurance Footer (visible on desktop) */}
          <div className="hidden lg:flex mt-6 xl:mt-8 pt-4 xl:pt-6 border-t border-teal-900/80 text-xs text-emerald-200/60 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Highland Central Factory Station 04 Gateway</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 self-stretch px-6 py-8 sm:px-10 sm:py-10 md:px-14 lg:px-16 xl:px-28 lg:py-14 xl:py-16 flex flex-col justify-center items-start gap-4 sm:gap-5 bg-white overflow-y-auto">
          {/* Form Header */}
          <div className="self-stretch">
            <h1 className="self-stretch justify-start text-slate-900 text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
              Sign in
            </h1>
            <p className="self-stretch justify-start text-slate-500 text-sm sm:text-base font-normal font-['Inter'] mt-1">
              Use your administrator account.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="self-stretch rounded-xl border border-rose-200 bg-rose-50/90 p-3 sm:p-3.5 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Interactive Sign-in Form */}
          <form onSubmit={handleSubmit} className="self-stretch space-y-3.5 sm:space-y-4">
            {/* Field 1: Phone number */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label
                htmlFor="user-phone"
                className="self-stretch justify-start text-slate-600 text-xs font-medium font-['Inter']"
              >
                Phone number
              </label>
              <div className="self-stretch min-h-[46px] sm:min-h-[48px] px-3.5 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-300 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100 flex justify-start items-center gap-2.5 transition-all">
                <Phone className="size-4 text-slate-400 shrink-0" />
                <input
                  id="user-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  disabled={isLoading}
                  autoComplete="tel"
                  className="flex-1 justify-start text-slate-900 placeholder:text-slate-400 text-base font-normal font-['Inter'] bg-transparent outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <label
                htmlFor="user-password"
                className="self-stretch justify-start text-slate-600 text-xs font-medium font-['Inter']"
              >
                Password
              </label>
              <div className="self-stretch min-h-[46px] sm:min-h-[48px] px-3.5 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-300 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100 flex justify-start items-center gap-2.5 transition-all">
                <Lock className="size-4 text-slate-400 shrink-0" />
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="flex-1 justify-start text-slate-900 placeholder:text-slate-400 text-base font-normal font-['Inter'] bg-transparent outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-sm transition-colors focus:outline-none min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password & Demo Fill Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="justify-start text-emerald-800 hover:text-emerald-950 text-xs sm:text-sm font-semibold font-['Inter'] transition-colors hover:underline cursor-pointer"
              >
                Forgot password?
              </button>

              {/* Demo Pre-fill Pill */}
              <button
                type="button"
                onClick={handlePreFillDemo}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-800 transition-colors cursor-pointer p-1"
                title="Fill demo phone number"
              >
                <Sparkles className="size-3 text-emerald-600" />
                <span>Demo Fill</span>
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-style="Primary"
              className="self-stretch w-full min-h-[48px] px-5 py-3 sm:py-3.5 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white rounded-xl inline-flex justify-center items-center gap-2 font-semibold font-['Inter'] text-base transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin text-emerald-300" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Footer Informational Notice */}
          <div className="self-stretch justify-start text-slate-500 text-xs font-normal font-['Inter'] leading-relaxed pt-1 sm:pt-2">
            Administrator accounts are provisioned by the system owner.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
};
