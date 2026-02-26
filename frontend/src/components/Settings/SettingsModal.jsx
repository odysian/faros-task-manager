import { Bell, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
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
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl h-[85vh] md:h-150 flex flex-col md:flex-row overflow-hidden shadow-2xl"
        onClick={handleContentClick}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* SIDEBAR */}
        <div className="w-full md:w-64 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col shrink-0">
          <h2 className="text-lg font-bold text-white mb-4 md:mb-6 px-2">
            Settings
          </h2>

          <nav className="flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 md:gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
                  flex-1 md:flex-none md:w-full justify-center md:justify-start
                  ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 pt-6 md:p-8 custom-scrollbar">
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
