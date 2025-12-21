import {
  Bell,
  CheckCircle,
  CheckSquare,
  Clock,
  Mail,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api';

function NotificationsSection() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setHasChanges(true);
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.patch(
        '/notifications/preferences',
        preferences
      );
      setPreferences(response.data);
      setHasChanges(false);
      setSuccess('Preferences saved successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchPreferences();
    setHasChanges(false);
    setSuccess('');
    setError('');
  };

  const notificationTypes = [
    {
      key: 'task_shared_with_me',
      label: 'Tasks shared with me',
      description: 'When someone gives you access to their task',
      icon: <Share2 size={20} className="text-zinc-400" />,
    },
    {
      key: 'comment_on_my_task',
      label: 'Comments on my tasks',
      description: 'When someone comments on a task you own',
      icon: <MessageSquare size={20} className="text-zinc-400" />,
    },
    {
      key: 'task_completed',
      label: 'Task completions',
      description: 'When a shared task is marked as complete',
      icon: <CheckSquare size={20} className="text-zinc-400" />,
    },
    {
      key: 'task_due_soon',
      label: 'Due date reminders',
      description: 'Get reminders when tasks are due soon',
      icon: <Clock size={20} className="text-zinc-400" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Failed to load preferences
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bell className="text-emerald-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Email Notifications</h4>
              <p className="text-sm text-zinc-500">
                Receive updates about your tasks via email
              </p>
              {!preferences.email_verified && (
                <div className="mt-2 flex items-center gap-2 text-amber-400 text-xs">
                  <Mail size={14} />
                  <span>Email not verified - notifications disabled</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleToggle('email_enabled')}
            disabled={!preferences.email_verified}
            className={`
              relative w-14 h-7 rounded-full transition-colors
              ${
                preferences.email_enabled && preferences.email_verified
                  ? 'bg-emerald-600'
                  : 'bg-zinc-700'
              }
              ${!preferences.email_verified && 'opacity-50 cursor-not-allowed'}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform
                ${preferences.email_enabled && 'translate-x-7'}
              `}
            />
          </button>
        </div>
      </div>

      <div
        className={`space-y-3 transition-opacity ${
          preferences.email_enabled && preferences.email_verified
            ? 'opacity-100'
            : 'opacity-40'
        }`}
      >
        <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Notify me about
        </h5>

        {notificationTypes.map((type) => (
          <div
            key={type.key}
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="shrink-0">{type.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{type.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggle(type.key)}
                disabled={
                  !preferences.email_enabled || !preferences.email_verified
                }
                className={`
                  relative w-11 h-6 rounded-full transition-colors shrink-0
                  ${preferences[type.key] ? 'bg-emerald-600' : 'bg-zinc-700'}
                  ${
                    (!preferences.email_enabled ||
                      !preferences.email_verified) &&
                    'opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform
                    ${preferences[type.key] && 'translate-x-5'}
                  `}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex-1 text-sm text-zinc-400">
            You have unsaved changes
          </div>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      )}

      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          {preferences.email_verified ? (
            <>
              <CheckCircle className="text-emerald-400" size={16} />
              <span className="text-emerald-400">Email verified</span>
            </>
          ) : (
            <>
              <Mail className="text-amber-400" size={16} />
              <span className="text-amber-400">Email not verified</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsSection;
