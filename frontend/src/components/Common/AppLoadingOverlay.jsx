import { Info } from 'lucide-react';

function AppLoadingOverlay() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-zinc-800 border-t-emerald-500" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-50 mb-3">
          FAROS
        </h1>
        <p className="text-base text-zinc-300">Connecting...</p>

        <div className="mt-6 mx-auto w-fit max-w-full rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4">
          <div className="flex items-start gap-2 text-left">
            <Info size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <p className="text-xs text-zinc-400">
              Initial requests may take up to a minute while servers start up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLoadingOverlay;
