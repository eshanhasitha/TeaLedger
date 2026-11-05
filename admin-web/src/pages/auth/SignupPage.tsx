import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthHero } from '../../components/layout/AuthHero';
import { SystemStatusModal } from '../../components/modals/SystemStatusModal';
import logoImg from '../../assets/logo.png';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('Nuwara Eliya Central');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status Modal
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { score: 4, label: 'Strong', color: 'bg-[#183a27]', text: 'text-emerald-800' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid estate work email address.');
      return;
    }

    if (!inviteCode.trim()) {
      setErrorMessage('Administrator Access Key is mandatory for elevated estate authority.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('You must accept the Operational Protocol & Data Protection Agreement.');
      return;
    }

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        division,
        inviteCode: inviteCode.trim(),
        password,
        confirmPassword,
        acceptTerms,
      });

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Enrollment failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f5f0]">
      {/* Left Hero Panel (Desktop) */}
      <AuthHero />

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between">
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
              Authorized Personnel Registration
            </span>
          </div>

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
        <div className="mx-auto w-full max-w-md py-6">
          {/* Tabs: Sign In / Create Account */}
          <div className="flex rounded-xl bg-slate-200/70 p-1 mb-6">
            <Link
              to="/login"
              className="flex-1 rounded-lg py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In to Estate
            </Link>
            <button
              type="button"
              className="flex-1 rounded-lg bg-white py-2 text-xs font-bold text-[#183a27] shadow-xs transition-all"
            >
              Request Admin Access
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16271c]">
              Create Admin Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Elevated access registration for estate superintendents & weighbridge officers.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyantha Dissanayake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="p.dissanayake@tealedger.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Estate Division & Invite Key Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Estate Division */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                  Estate Division
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-7 text-xs sm:text-sm text-slate-900 font-medium focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="Nuwara Eliya Central">Nuwara Eliya Central</option>
                    <option value="Haputale Gap Div">Haputale Gap Div</option>
                    <option value="Hatton Dikoya">Hatton Dikoya</option>
                    <option value="Bogawantalawa East">Bogawantalawa East</option>
                    <option value="Maskeliya Valley">Maskeliya Valley</option>
                    <option value="Ratnapura Foothills">Ratnapura Foothills</option>
                  </select>
                </div>
              </div>

              {/* Admin Invite Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5f6f65]">
                    Admin Passcode
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Code: ESTATE-2024
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ESTATE-2024"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-3.5 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 uppercase tracking-wider focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5f6f65] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8cc] bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  I accept the <strong>Operational Protocol & Smallholder Data Protection Policy</strong>. All weighbridge intakes and financial reconciliations logged under this account are legally binding.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183a27] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#122e1e] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Enrolling Administrator...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Create Admin Account</span>
                </>
              )}
            </button>
          </form>

          {/* Quick link back to login */}
          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">
              Already hold an authorized token?{' '}
              <Link to="/login" className="font-bold text-emerald-800 hover:underline">
                Sign in to your estate
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ece8e0] pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Role-Based Access Enforcement (RBAC)</span>
          </div>
          <div>
            <span>TeaLedger Estate V2 &bull; All Rights Reserved</span>
          </div>
        </div>
      </div>

      <SystemStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
      />
    </div>
  );
};
