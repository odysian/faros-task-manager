import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

function VerifyEmailPage({ token, onComplete }) {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    try {
      const response = await api.post('/notifications/verify', { token });
      setStatus('success');
      setMessage(response.data.message);

      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-white mb-2">
              Verifying Email...
            </h1>
            <p className="text-zinc-500 text-sm">
              Please wait while we verify your email address
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-zinc-400 text-sm mb-4">{message}</p>
            <p className="text-zinc-600 text-xs">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-red-400 text-sm mb-4">{message}</p>
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
