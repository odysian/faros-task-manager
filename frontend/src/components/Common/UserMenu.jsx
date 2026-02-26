import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function UserMenu({ username, email, avatarUrl, onLogout, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 group"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl} // [UPDATED] Use the stable URL directly
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            username?.[0]?.toUpperCase()
          )}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-xs font-bold text-zinc-200 group-hover:text-white">
            {username}
          </p>
          <p className="text-[10px] text-zinc-500 truncate max-w-25">
            {email || 'Loading...'}
          </p>
        </div>

        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="md:hidden p-4 border-b border-zinc-800 bg-zinc-900/50">
            <p className="font-bold text-white">{username}</p>
            <p className="text-xs text-zinc-500">{email}</p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Settings size={16} />
              Account Settings
            </button>

            <div className="h-px bg-zinc-800 my-1 mx-2" />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
