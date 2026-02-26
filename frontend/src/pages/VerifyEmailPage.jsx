import { CheckCircle, Loader2, XCircle } from 'lucide-react'; // Changed Loader to Loader2
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl">
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
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 rounded-lg transition-all border border-zinc-700"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
