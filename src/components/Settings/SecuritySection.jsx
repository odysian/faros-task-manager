import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import api from '../../api';

function SecuritySection() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status !== 'idle') setStatus('idle');
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.new_password.length < 8) {
      setErrorMessage('New password must be at least 8 characters long');
      setStatus('error');
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage('New passwords do not match');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await api.patch('/users/me/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      setStatus('success');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail || 'Failed to change password'
      );
    }
  };

  const renderPasswordInput = (label, name, visibilityKey, placeholder) => (
    <div>
      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswords[visibilityKey] ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors pr-10" // Added pr-10 for icon space
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => toggleVisibility(visibilityKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          tabIndex="-1"
        >
          {showPasswords[visibilityKey] ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Lock className="text-emerald-400" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">Change Password</h4>
            <p className="text-sm text-zinc-400">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {renderPasswordInput(
            'Current Password',
            'current_password',
            'current',
            '••••••••'
          )}
          {renderPasswordInput(
            'New Password',
            'new_password',
            'new',
            '••••••••'
          )}
          {renderPasswordInput(
            'Confirm New Password',
            'confirm_password',
            'confirm',
            '••••••••'
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 p-3 rounded-lg border border-red-900/30">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
              <CheckCircle size={16} />
              Password changed successfully
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SecuritySection;
