function LoginForm({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}) {
  const inputClasses =
    'w-full p-3 rounded bg-zinc-900 border border-zinc-700 text-white ' +
    'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ' +
    'focus:outline-none transition-all placeholder-zinc-600';

  return (
    // Outer Container: Keeps the form centered on the screen
    <div className="grid place-items-center h-screen bg-zinc-950 px-4">
      {/* THE FIX: 
         Removed 'bg-zinc-900/30', 'border', 'shadow-2xl', 'rounded-2xl'.
         Now it is just a transparent wrapper for the width and padding.
      */}
      <div className="w-full max-w-md p-4">
        {/* Header / Logo Section */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* The Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onLogin()}
              className={inputClasses}
            />
          </div>

          <button
            onClick={onLogin}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] mt-4"
          >
            Sign In
          </button>
        </div>

        {/* Footer */}
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
