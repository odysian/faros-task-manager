import { Bell, Shield, User, X } from 'lucide-react';
import { useState } from 'react';
import NotificationsSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SecuritySection from './SecuritySection';

function SettingsModal({ onClose, user }) {
  const [activeTab, setActiveTab] = useState('profile');

  // Stop propagation so clicking inside doesn't close
  const handleContentClick = (e) => e.stopPropagation();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl h-150 flex overflow-hidden shadow-2xl"
        onClick={handleContentClick}
      >
        {/* SIDEBAR */}
        <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 p-4 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 px-2">Settings</h2>

          <nav className="space-y-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
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

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div>
              <h3 className="text-xl font-bold text-white capitalize">
                {activeTab}
              </h3>
              <p className="text-sm text-zinc-500">
                Manage your account settings
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'profile' && <ProfileSection user={user} />}

            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'security' && <SecuritySection />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
