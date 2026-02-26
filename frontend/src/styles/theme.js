export const THEME = {
  // Common container styles
  card: 'bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all shadow-sm',
  cardHover: 'hover:border-emerald-500/50',

  // Input and Form elements
  input:
    'w-full p-2 rounded bg-zinc-900 border border-zinc-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-zinc-500',
  label:
    'block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1',

  // Buttons
  button: {
    primary:
      'px-4 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-50',
    secondary:
      'px-4 py-2 rounded text-emerald-100 bg-emerald-900/30 border border-emerald-900/50 hover:bg-emerald-900/50 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-50',
    ghost:
      'p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30 transition-all',
    danger:
      'p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all',
  },

  // Badges (Priority, Status)
  badge:
    'px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border shrink-0',
};
