import { CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { THEME } from '../../styles/theme';
import { userService } from '../../services/userService';

function PasswordResetForm({ token, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [status, setStatus] = useState('idle');

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setStatus('loading');

    try {
      await userService.resetPassword({
        token: token,
        new_password: formData.new_password,
      });
      setStatus('success');

      setTimeout(() => onSwitchToLogin(), 3000);
    } catch (err) {
      setStatus('idle');
      toast.error(
        err.response?.data?.detail ||
          'Failed to reset password. Link may be expired.'
      );
    }
  };

  const renderPasswordInput = (label, name, visibilityKey, placeholder) => (
    <div>
      <label className={THEME.label}>{label}</label>
      <div className="relative">
        <input
          type={showPasswords[visibilityKey] ? 'text' : 'password'}
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className={THEME.input}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => toggleVisibility(visibilityKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          tabIndex="-1"
        >
          {showPasswords[visibilityKey] ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>
  );

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-xl animate-in zoom-in duration-300">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Lighthouse Ops
          </p>
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Password Reset!
          </h2>
          <p className="text-zinc-400 mb-6">
            Your password has been successfully updated. Redirecting to login...
          </p>
          <button
            onClick={onSwitchToLogin}
            className={THEME.button.secondary + ' w-full py-3'}
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Lighthouse Ops
        </p>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/30">
            <Lock className="text-emerald-400" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-white">Set New Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {renderPasswordInput(
            'New Password',
            'new_password',
            'new',
            '••••••••'
          )}
          {renderPasswordInput(
            'Confirm Password',
            'confirm_password',
            'confirm',
            '••••••••'
          )}

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
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetForm;
