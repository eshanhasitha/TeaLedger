import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
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

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your user ID or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    try {
      await login({ phoneNumber: trimmed, email: trimmed, password, rememberMe: true });
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
    <main className="min-h-screen w-full bg-white flex flex-col lg:flex-row justify-start items-stretch overflow-hidden font-['Inter',sans-serif]">
      {/* Left Half: Deep Forest Green #073B26 */}
      <div className="w-full lg:w-1/2 min-h-[260px] lg:min-h-screen p-8 sm:p-12 lg:p-20 bg-[#073B26] flex flex-col justify-center items-start gap-4 shrink-0">
        <div className="size-14 bg-[#E1F4E8] rounded-xl flex justify-center items-center overflow-hidden shrink-0">
          <img
            className="size-9 object-contain"
            src={logoImg}
            alt="TeaLedger Logo"
          />
        </div>

        <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">
          TeaLedger
        </h1>

        <p className="text-emerald-100/85 text-base sm:text-lg font-normal leading-relaxed max-w-sm">
          Tea leaf collection and farmer accounts, managed in one place.
        </p>
      </div>

      {/* Right Half: White #FFFFFF */}
      <div className="w-full lg:w-1/2 flex-1 lg:min-h-screen px-6 py-10 sm:px-14 lg:px-20 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-[400px] flex flex-col gap-5">
            <div>
              <h2 className="text-[#17201B] text-2xl sm:text-[28px] font-bold tracking-tight">
                Sign in
              </h2>
              <p className="text-[#56625B] text-sm font-normal mt-1">
                Use your administrator account.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-[#FEF2F2] p-3 text-xs text-[#B91C1C] flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="user-identifier"
                  className="text-[#17201B] text-xs font-medium"
                >
                  User ID or email
                </label>
                <input
                  id="user-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@estate.example"
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#E1F4E8] text-[#17201B] placeholder:text-[#56625B]/60 text-sm outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="user-password"
                  className="text-[#17201B] text-xs font-medium"
                >
                  Password
                </label>
                <div className="w-full h-11 px-3.5 bg-white rounded-lg border border-[#DCE2DC] focus-within:border-[#0B5D3B] focus-within:ring-2 focus-within:ring-[#E1F4E8] flex items-center gap-2 transition-all">
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="flex-1 text-[#17201B] placeholder:text-[#56625B]/60 text-sm bg-transparent outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#56625B] hover:text-[#17201B] p-1 rounded transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[#0B5D3B] hover:text-[#08472D] text-xs font-semibold transition-colors hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-[#0B5D3B] hover:bg-[#08472D] text-white rounded-lg inline-flex justify-center items-center gap-2 font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            <p className="text-[#56625B] text-xs font-normal pt-1">
              Administrator accounts are provisioned by the system owner.
            </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
    </main>
  );
};
