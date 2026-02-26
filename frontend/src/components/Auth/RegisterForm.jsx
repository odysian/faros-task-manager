import { Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';

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

  const inputClasses =
    'w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 ' +
    'focus:outline-none transition-all placeholder-zinc-600';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="text-5xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,.9)]">
              ⟡
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            JOIN FAROS
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

        <div className="space-y-6">
          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isRegistering}
              className={`${inputClasses} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isRegistering}
              className={`${inputClasses} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isRegistering}
                className={`${inputClasses} pr-10 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
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
                className={`${inputClasses} pr-10 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-xs leading-relaxed">
              Initial requests may take up to a minute while servers start up.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isRegistering}
            className={`w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] mt-4 flex items-center justify-center gap-2 ${
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
