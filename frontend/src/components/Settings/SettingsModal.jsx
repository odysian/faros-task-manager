import { Bell, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
import { THEME } from '../../styles/theme';
import NotificationsSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SecuritySection from './SecuritySection';

function SettingsModal({ onClose, user, onUserUpdate, avatarUrl }) {
  const [activeTab, setActiveTab] = useState('profile');

  const handleContentClick = (e) => e.stopPropagation();

  // UX IMPROVEMENT: Shorter labels to prevent scrolling on mobile
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Alerts', icon: Bell }, // Changed "Notifications" to "Alerts"
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl md:h-150 md:flex-row"
        onClick={handleContentClick}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className={`${THEME.button.ghost} absolute right-4 top-4 z-20 bg-zinc-900/50 hover:bg-zinc-800`}
        >
          <X size={20} />
        </button>

        {/* SIDEBAR */}
        <div className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-900/50 p-4 md:w-64 md:border-b-0 md:border-r">
          <h2 className="text-lg font-bold text-white mb-4 md:mb-6 px-2">
            Settings
          </h2>

          <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full md:flex-none md:justify-start md:gap-3 ${
                  activeTab === tab.id
                    ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-100'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6 pt-14 md:p-8 md:pt-16">
            {activeTab === 'profile' && (
              <ProfileSection
                user={user}
                onUserUpdate={onUserUpdate}
                avatarUrl={avatarUrl}
              />
            )}

            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
