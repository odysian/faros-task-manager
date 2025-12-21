import { useEffect, useState } from 'react';
import api from './api';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import LoginForm from './components/LoginForm';
import PasswordResetForm from './components/PasswordResetForm';
import RegisterForm from './components/RegisterForm';
import TaskDashboard from './components/TaskDashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  const [urlToken, setUrlToken] = useState(null);

  // Initialize view based on Token presence AND Pathname
  const [currentView, setCurrentView] = useState(() => {
    if (localStorage.getItem('token')) return 'dashboard';
    return 'login';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // HANDLE URL ROUTING MANUALLY
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setUrlToken(token);

      // Route based on Pathname
      if (path === '/verify') {
        setCurrentView('verify');
      } else if (path === '/password-reset') {
        setCurrentView('password-reset');
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        username: username,
        password: password,
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', username);
      setCurrentView('dashboard');
      setError('');
    } catch (err) {
      console.log('Login Error:', err.response?.data);
      setError(
        'Login failed: ' + (err.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const handleRegister = async (regUsername, regPassword, regEmail) => {
    try {
      await api.post('/auth/register', {
        username: regUsername,
        password: regPassword,
        email: regEmail,
      });

      const response = await api.post('/auth/login', {
        username: regUsername,
        password: regPassword,
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', regUsername);
      setCurrentView('dashboard');
      setError('');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        'Registration failed: ' +
          (err.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    setPassword('');
    setCurrentView('login');
  };

  const handleVerificationComplete = () => {
    window.history.replaceState({}, document.title, '/');
    if (localStorage.getItem('token')) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  };

  // --- RENDER VIEWS ---

  if (currentView === 'verify') {
    return (
      <VerifyEmailPage
        token={urlToken}
        onComplete={handleVerificationComplete}
      />
    );
  }

  // NEW: Password Reset View (From Email Link)
  if (currentView === 'password-reset') {
    return (
      <PasswordResetForm
        token={urlToken}
        onSwitchToLogin={() => {
          // Clear URL so refreshing doesn't stick on reset page
          window.history.replaceState({}, document.title, '/');
          setCurrentView('login');
        }}
      />
    );
  }

  // NEW: Forgot Password View (Request Link)
  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordForm onSwitchToLogin={() => setCurrentView('login')} />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <TaskDashboard onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setError('');
          setCurrentView('login');
        }}
        error={error}
      />
    );
  }

  return (
    <LoginForm
      username={username}
      password={password}
      error={error}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onLogin={handleLogin}
      onSwitchToRegister={() => {
        setError('');
        setCurrentView('register');
      }}
      // Pass the switcher function
      onForgotPassword={() => {
        setError('');
        setCurrentView('forgot-password');
      }}
    />
  );
}

export default App;
