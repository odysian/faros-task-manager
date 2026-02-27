import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner'; //
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import LoginForm from './components/Auth/LoginForm';
import PasswordResetForm from './components/Auth/PasswordResetForm';
import RegisterForm from './components/Auth/RegisterForm';
import TaskDashboard from './components/Tasks/TaskDashboard';
import LandingPage from './pages/LandingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { authService } from './services/authService'; // Import the service
import { userService } from './services/userService';

function App() {
  const [urlToken, setUrlToken] = useState(null);

  const [currentView, setCurrentView] = useState('landing');
  const [authResolved, setAuthResolved] = useState(false);

  // Lifted state for the login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Handle URL params for verification/reset flows and session bootstrap.
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setUrlToken(token);
      if (path === '/verify') {
        setCurrentView('verify');
        setAuthResolved(true);
      } else if (path === '/password-reset') {
        setCurrentView('password-reset');
        setAuthResolved(true);
      }
      return;
    }

    const resolveAuthSession = async () => {
      try {
        await userService.getProfile();
        setCurrentView('dashboard');
      } catch {
        setCurrentView('landing');
      } finally {
        setAuthResolved(true);
      }
    };

    resolveAuthSession();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentView('landing');
      setUsername('');
      setPassword('');
    };

    window.addEventListener('faros:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('faros:unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Abstracted API call
      await authService.login({
        username: username,
        password: password,
      });

      setCurrentView('dashboard');
      toast.success(`Welcome back, ${username}!`);
    } catch (err) {
      console.error('Login Error:', err);
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (regUsername, regPassword, regEmail) => {
    setIsRegistering(true);
    try {
      // Abstracted API call
      await authService.register({
        username: regUsername,
        password: regPassword,
        email: regEmail,
      });

      // Auto-login after registration
      await authService.login({
        username: regUsername,
        password: regPassword,
      });

      setCurrentView('dashboard');
      toast.success('Account created successfully!');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Keep logout idempotent in UI even if backend is already signed out.
    }
    setUsername('');
    setPassword('');
    setCurrentView('landing');
    toast.info('Logged out');
  };

  const handleVerificationComplete = async () => {
    window.history.replaceState({}, document.title, '/');
    try {
      await userService.getProfile();
      setCurrentView('dashboard');
    } catch {
      setCurrentView('landing');
    }
  };

  if (!authResolved) {
    return (
      <>
        <Toaster position="top-right" richColors theme="dark" />
        <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
          <p className="text-sm text-zinc-500">Loading session...</p>
        </div>
      </>
    );
  }

  // View Router
  let content;
  switch (currentView) {
    case 'verify':
      content = (
        <VerifyEmailPage
          token={urlToken}
          onComplete={handleVerificationComplete}
        />
      );
      break;
    case 'password-reset':
      content = (
        <PasswordResetForm
          token={urlToken}
          onSwitchToLogin={() => {
            window.history.replaceState({}, document.title, '/');
            setCurrentView('login');
          }}
        />
      );
      break;
    case 'forgot-password':
      content = (
        <ForgotPasswordForm onSwitchToLogin={() => setCurrentView('login')} />
      );
      break;
    case 'dashboard':
      content = (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <TaskDashboard onLogout={handleLogout} />
          </div>
        </div>
      );
      break;
    case 'register':
      content = (
        <RegisterForm
          onRegister={handleRegister}
          isRegistering={isRegistering}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      );
      break;
    case 'login':
      content = (
        <LoginForm
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
          onSwitchToRegister={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      );
      break;
    default: // 'landing'
      content = (
        <LandingPage
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      {content}
    </>
  );
}

export default App;
