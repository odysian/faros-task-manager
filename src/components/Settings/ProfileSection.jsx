import { AlertCircle, Calendar, CheckCircle, Mail, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api';

function ProfileSection({ user }) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tasks/stats');

        setStats([
          { label: 'Tasks Created', value: response.data.total },
          { label: 'Tasks Shared', value: response.data.tasks_shared },
          { label: 'Comments', value: response.data.comments_posted },
        ]);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setStats([
          { label: 'Tasks Created', value: '-' },
          { label: 'Tasks Shared', value: '-' },
          { label: 'Comments', value: '-' },
        ]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleSendVerification = async () => {
    setSendingEmail(true);
    setEmailError('');
    setEmailSent(false);

    try {
      await api.post('/notifications/send-verification');
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err) {
      console.error('Failed to send verification:', err);
      setEmailError(err.response?.data?.detail || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-emerald-900/30 border-2 border-emerald-500/50 flex items-center justify-center text-4xl font-bold text-emerald-400 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.username[0].toUpperCase()}</span>
            )}
          </div>
          <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Upload className="text-white w-6 h-6" />
          </button>
        </div>

        <div className="text-center md:text-left space-y-1">
          <h3 className="text-2xl font-bold text-white">{user.username}</h3>
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 text-sm">
            <Mail size={14} />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 text-xs">
            <Calendar size={12} />
            <span>Member since {joinDate}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800" />

      <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Account Status
        </h4>

        {user.email_verified ? (
          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
            <CheckCircle size={20} />
            <div>
              <p className="font-bold text-sm">Email Verified</p>
              <p className="text-xs text-emerald-500/70">
                Your account is fully secured.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertCircle size={20} />
                <div>
                  <p className="font-bold text-sm">Email Not Verified</p>
                  <p className="text-xs text-amber-500/70">
                    Verify to enable notifications.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSendVerification}
                disabled={sendingEmail || emailSent}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <CheckCircle size={14} />
                    Sent!
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
            </div>

            {emailSent && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-400 text-xs">
                ✓ Verification email sent! Check your inbox at {user.email}
              </div>
            )}

            {emailError && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs">
                ⚠️ {emailError}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
          Activity Overview
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {loadingStats
            ? // Skeleton Loading State
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center h-20 animate-pulse"
                >
                  <div className="h-6 w-12 bg-zinc-800 mx-auto rounded mb-2"></div>
                  <div className="h-3 w-20 bg-zinc-800 mx-auto rounded"></div>
                </div>
              ))
            : // Real Data
              stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center"
                >
                  <p className="text-2xl font-mono text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
