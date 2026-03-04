import { Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { THEME } from '../../styles/theme';

function RegisterForm({ onRegister, isRegistering, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (isRegistering) return;
    if (!username || !email || !password) {
      setLocalError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }
    setLocalError('');
    onRegister(username, password, email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
          <div className="mb-3">
            <span className="text-5xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,.9)]">
              ⟡
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            FAROS
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            FAROS
          </h1>
          <p className="text-sm text-emerald-500 font-medium tracking-wide">
            Start your journey
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
            {localError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className={THEME.label}>
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isRegistering}
              className={`${THEME.input} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className={THEME.label}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isRegistering}
              className={`${THEME.input} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className={THEME.label}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isRegistering}
                className={`${THEME.input} pr-10 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isRegistering}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors ${
                  isRegistering ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className={THEME.label}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isRegistering && handleSubmit()}
                disabled={isRegistering}
                className={`${THEME.input} pr-10 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isRegistering}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors ${
                  isRegistering ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Cold Start Notice */}
          <div className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-xs leading-relaxed">
              Initial requests may take up to a minute while servers start up.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isRegistering}
            className={`${THEME.button.primary} mt-4 flex w-full items-center justify-center gap-2 py-3 ${
              isRegistering ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isRegistering ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              disabled={isRegistering}
              className={`text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all ${
                isRegistering ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
