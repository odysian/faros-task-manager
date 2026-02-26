import { AlertCircle, Calendar, Camera, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

function ProfileSection({ user, onUserUpdate, avatarUrl }) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    setCurrentAvatar(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await taskService.getStats();
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

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await userService.updateAvatar(formData);
      const fullUrl = `${import.meta.env.VITE_API_URL}${
        response.data.avatar_url
      }`;
      const cacheBustedUrl = `${fullUrl}?t=${Date.now()}`;
      setCurrentAvatar(cacheBustedUrl);
      if (onUserUpdate) onUserUpdate();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingEmail(true);
    setEmailError('');
    setEmailSent(false);

    try {
      await authService.sendVerificationEmail();
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
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="relative group shrink-0">
          {/* Reduced size w-24 -> w-20 */}
          <div className="w-26 h-26 rounded-full bg-emerald-900/30 border-2 border-emerald-500/50 flex items-center justify-center text-3xl font-bold text-emerald-400 overflow-hidden relative">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.username[0].toUpperCase()}</span>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 hover:bg-emerald-600 text-white rounded-full shadow-lg border border-zinc-700 transition-colors cursor-pointer"
            title="Upload Profile Picture"
          >
            <Camera size={14} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/jpeg,image/png,image/gif"
          />
        </div>

        <div className="text-center md:text-left space-y-0.5 pt-1">
          <h3 className="text-xl font-bold text-white">{user.username}</h3>
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-400 text-sm">
            <Mail size={13} />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-zinc-500 text-xs">
            <Calendar size={11} />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800" />

      {/* 2. CONDITIONAL ACCOUNT STATUS (Only show if unverified) */}
      {!user.email_verified && (
        <>
          <div className="bg-amber-950/10 rounded-xl p-4 border border-amber-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertCircle size={18} className="shrink-0" />
                <div>
                  <p className="font-bold text-sm leading-none">
                    Email Not Verified
                  </p>
                  <p className="text-xs text-amber-500/60 mt-1">
                    Verify to enable email notifications.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendVerification}
                disabled={sendingEmail || emailSent}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingEmail
                  ? 'Sending...'
                  : emailSent
                  ? 'Sent!'
                  : 'Send Verification Email'}
              </button>
            </div>

            {(emailSent || emailError) && (
              <div
                className={`mt-3 p-2 rounded text-xs ${
                  emailSent
                    ? 'bg-emerald-950/30 text-emerald-400'
                    : 'bg-red-950/30 text-red-400'
                }`}
              >
                {emailSent ? `✓ Sent to ${user.email}` : `⚠️ ${emailError}`}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800" />
        </>
      )}

      {/* 3. COMPACT STATS GRID */}
      <div>
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Activity Overview
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {loadingStats
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center h-16 animate-pulse"
                />
              ))
            : stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg text-center hover:bg-zinc-900 transition-colors"
                >
                  <p className="text-xl font-mono text-white leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] md:text-xs text-zinc-500 mt-1 truncate">
                    {stat.label}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileSection;
