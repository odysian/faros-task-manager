import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { THEME } from '../../styles/theme';

function ForgotPasswordForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await authService.requestPasswordReset(email);
      setStatus('success');
      toast.success('Reset link sent');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || 'Something went wrong. Please try again.'
      );
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-xl animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-emerald-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Check your email
          </h2>
          <p className="text-zinc-400 mb-8">
            If an account exists for <strong>{email}</strong>, we have sent a
            password reset link.
          </p>
          <button
            onClick={onSwitchToLogin}
            className={THEME.button.secondary + ' w-full py-3'}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={onSwitchToLogin}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-zinc-400 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={THEME.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={THEME.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className={
              THEME.button.primary +
              ' w-full py-3 flex items-center justify-center gap-2'
            }
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
