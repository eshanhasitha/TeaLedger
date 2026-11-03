import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AuthHero } from '../../components/layout/AuthHero';
import { ForgotPasswordModal } from '../../components/modals/ForgotPasswordModal';
import { SystemStatusModal } from '../../components/modals/SystemStatusModal';
import logoImg from '../../assets/logo.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Pre-fill demo credentials
  const handlePreFillDemo = () => {
    setEmail('admin@tealedger.lk');
    setPassword('Sunil@Estate2024');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator work email address or ID.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your estate authorization password.');
      return;
    }

    try {
      await login({ email: email.trim(), password, rememberMe });
      interface LocationState {
        from?: {
          pathname: string;
        };
      }
      const state = location.state as LocationState | null;
      const destination = state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f5f0]">
      {/* Left Hero Panel (Desktop) */}
      <AuthHero />

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Navbar in Form Panel */}
        <div className="flex items-center justify-between">
          {/* Mobile Logo View */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 border border-emerald-100 shadow-2xs">
              <img src={logoImg} alt="TeaLedger Logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <span className="text-base font-bold text-[#162a1e] block">TeaLedger</span>
              <span className="text-[10px] font-semibold text-[#6e7d73] uppercase tracking-wider">
                Estate Admin
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Highland Security Gateway
            </span>
          </div>

          {/* System Status Quick Link */}
          <button
            type="button"
            onClick={() => setIsStatusOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span>System Status</span>
          </button>
        </div>

        {/* Center Container */}
        <div className="mx-auto w-full max-w-md py-8">
          {/* Tabs: Sign In / Create Account */}
          <div className="flex rounded-xl bg-slate-200/70 p-1 mb-8">
            <button
              type="button"
              className="flex-1 rounded-lg bg-white py-2 text-xs font-bold text-[#183a27] shadow-xs transition-all"
            >
              Sign In to Estate
            </button>
            <Link
              to="/signup"
              className="flex-1 rounded-lg py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Request Admin Access
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16271c]">
              Administrator Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your estate credentials to access the central weighbridge ledger.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1.5">
                Work Email / Admin ID
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@tealedger.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5f6f65]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Keep session active for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183a27] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#122e1e] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In to Station 04...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-emerald-300" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Pill for testing */}
          <div className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-900 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Developer & Testing Mode</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700">
              One-click auto-fill credentials for Sunil Jayawardena (Chief Admin)
            </p>
            <button
              type="button"
              onClick={handlePreFillDemo}
              className="mt-2 rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-2xs"
            >
              Auto-Fill Sunil's Credentials
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ece8e0] pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Sri Lanka Tea Board Compliant</span>
          </div>
          <div>
            <span>TeaLedger Estate v2.4.0 &bull; Central Highlands Hub</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        defaultEmail={email}
      />
      <SystemStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
      />
    </div>
  );
};
