import { Eye, EyeOff, Loader2, Lock, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner'; //
import { userService } from '../../services/userService'; //
import { THEME } from '../../styles/theme'; //

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

  const [loading, setLoading] = useState(false); //

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation with Toasts
    if (formData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters long'); //
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match'); //
      return;
    }

    setLoading(true); //

    try {
      // 2. Use the Service Layer
      await userService.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      }); //

      toast.success('Password changed successfully'); //

      // Clear form on success
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to change password'); //
    } finally {
      setLoading(false); //
    }
  };

  const renderPasswordInput = (label, name, visibilityKey, placeholder) => (
    <div>
      <label className={THEME.label}>{label}</label>
      <div className="relative">
        <input
          type={showPasswords[visibilityKey] ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={THEME.input + ' pr-10'} //
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={THEME.button.primary + ' flex items-center gap-2'} //
            >
              {loading ? (
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
