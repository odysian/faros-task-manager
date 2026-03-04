import { CheckCircle, Loader2, XCircle } from 'lucide-react'; // Changed Loader to Loader2
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { THEME } from '../styles/theme';

function VerifyEmailPage({ token, onComplete }) {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await authService.verifyEmailToken(token);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');

        // Redirect after delay
        setTimeout(() => {
          onComplete();
        }, 3000);
      } catch (err) {
        console.error('Verification failed:', err);
        setStatus('error');
        setMessage(
          err.response?.data?.detail ||
            'Verification failed. Link may be expired.'
        );
      }
    };

    verifyEmail();
  }, [token, onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-xl">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          FAROS
        </p>
        {/* Loading State */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-emerald-500 mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-white mb-2">
              Verifying Email...
            </h1>
            <p className="text-zinc-500 text-sm">
              Please wait while we secure your account.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-zinc-400 text-sm mb-6">{message}</p>
            <div className="flex items-center gap-2 text-zinc-600 text-xs">
              <Loader2 size={12} className="animate-spin" />
              Redirecting you to the app...
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in shake duration-300">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-red-400/80 text-sm mb-6 bg-red-950/20 px-4 py-2 rounded-lg border border-red-900/30">
              {message}
            </p>
            <button
              onClick={onComplete}
              className={THEME.button.secondary}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
