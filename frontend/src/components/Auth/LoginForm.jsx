import { Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { THEME } from '../../styles/theme';

function LoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  isLoggingIn,
  onSwitchToRegister,
  onForgotPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid place-items-center h-screen bg-zinc-950 px-4">
      <div className="w-full max-w-md p-4 animate-in fade-in zoom-in duration-500">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="text-5xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,.9)]">
              ⟡
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-emerald-50 mb-2">
            FAROS
          </h1>
          <p className="text-sm text-emerald-500 font-medium tracking-wide">
            Navigate your backlog
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className={THEME.label}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              disabled={isLoggingIn}
              className={`${THEME.input} ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={THEME.label}>Password</label>
              <button
                onClick={onForgotPassword}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wider transition-colors cursor-pointer hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoggingIn && onLogin()}
                disabled={isLoggingIn}
                className={`${THEME.input} pr-10 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoggingIn}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors ${
                  isLoggingIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Cold Start Notice */}
          <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-xs leading-relaxed">
              Initial requests may take up to a minute while servers start up.
            </p>
          </div>

          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className={`${THEME.button.primary} w-full py-3 mt-4 flex items-center justify-center gap-2 ${
              isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-500 text-xs font-mono">
            © 2025 Faros Manager
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
