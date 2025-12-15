import { useState } from 'react';
import api from './api';
import LoginForm from './components/LoginForm';
import TaskDashboard from './components/TaskDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        username: username,
        password: password,
      });

      localStorage.setItem('token', response.data.access_token);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      console.log(
        'Error details:',
        JSON.stringify(err.response?.data, null, 2)
      );
      setError(
        'Login failed: ' + (err.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <LoginForm
        username={username}
        password={password}
        error={error}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-zinc-800 pb-6 gap-4">
          {/* Brand Container */}
          <div className="flex items-center gap-4">
            {/* LOGO: No background box, just the icon */}
            <span className="text-4xl text-emerald-500 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] pr-1">
              ⟡
            </span>

            {/* Text Lockup */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                FAROS
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-px w-6 bg-emerald-500/50"></span>
                <p className="text-[0.65rem] text-emerald-500 font-bold tracking-[0.2em] uppercase">
                  Navigate your backlog
                </p>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 hidden md:block">
              Welcome back
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <TaskDashboard />
      </div>
    </div>
  );
}

export default App;
