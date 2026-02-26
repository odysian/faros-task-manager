import { Loader2, Search, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';

function UserSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await userService.searchUsers(query);
        setResults(response.data);
        setShowResults(true);
      } catch (err) {
        toast.error('Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (user) => {
    onSelect(user);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a user..."
          className="w-full p-2 pl-9 bg-zinc-950 border border-zinc-700 rounded text-sm text-white focus:border-emerald-500 focus:outline-none placeholder-zinc-600"
        />

        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-emerald-500" />
          ) : (
            <Search size={16} />
          )}
        </div>

        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/50">
                <User
                  size={14}
                  className="text-zinc-400 group-hover:text-emerald-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                  {user.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && !loading && query && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
          <p className="text-xs text-zinc-500">No users found</p>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
