import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import api from './api';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import LoginForm from './components/Auth/LoginForm';
import PasswordResetForm from './components/Auth/PasswordResetForm';
import RegisterForm from './components/Auth/RegisterForm';
import TaskDashboard from './components/Tasks/TaskDashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  const [urlToken, setUrlToken] = useState(null);

  const [currentView, setCurrentView] = useState(() => {
    if (localStorage.getItem('token')) return 'dashboard';
    return 'login';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setUrlToken(token);

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
      toast.success(`Welcome back, ${username}!`);
    } catch (err) {
      console.log('Login Error:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Login failed');
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
      toast.success('Account created successfully!');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err.response?.data?.detail || 'Registration failed');
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

  let content;
  if (currentView === 'verify') {
    content = (
      <VerifyEmailPage
        token={urlToken}
        onComplete={handleVerificationComplete}
      />
    );
  } else if (currentView === 'password-reset') {
    content = (
      <PasswordResetForm
        token={urlToken}
        onSwitchToLogin={() => {
          window.history.replaceState({}, document.title, '/');
          setCurrentView('login');
        }}
      />
    );
  } else if (currentView === 'forgot-password') {
    content = (
      <ForgotPasswordForm onSwitchToLogin={() => setCurrentView('login')} />
    );
  } else if (currentView === 'dashboard') {
    content = (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <TaskDashboard onLogout={handleLogout} />
        </div>
      </div>
    );
  } else if (currentView === 'register') {
    content = (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setCurrentView('login');
        }}
      />
    );
  } else {
    content = (
      <LoginForm
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setCurrentView('register');
        }}
        onForgotPassword={() => {
          setCurrentView('forgot-password');
        }}
      />
    );
  }

  // 2. Return a single Fragment wrapping the Toaster and the content
  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      {content}
    </>
  );
}

export default App;
