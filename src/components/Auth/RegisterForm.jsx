import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function RegisterForm({ onRegister, onSwitchToLogin, error }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }
    setLocalError('');
    onRegister(username, password, email);
  };

  const inputClasses =
    'w-full p-3 rounded bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ' +
    'focus:outline-none transition-all placeholder-zinc-600';

  return (
    <div className="grid place-items-center h-screen bg-zinc-950 px-4">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="text-5xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,.9)]">
              ⟡
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-emerald-50 mb-2">
            JOIN FAROS
          </h1>
          <p className="text-sm text-emerald-500 font-medium tracking-wide">
            Start your journey
          </p>
        </div>

        {(error || localError) && (
          <div className="mb-6 p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm text-center">
            {error || localError}
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
              className={inputClasses}
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
              className={inputClasses}
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
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
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
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] mt-4"
          >
            Create Account
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all cursor-pointer"
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
