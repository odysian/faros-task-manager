function TaskSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-3 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Checkbox Placeholder */}
        <div className="w-5 h-5 bg-zinc-800 rounded shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Title Placeholder */}
          <div className="h-4 bg-zinc-800 rounded w-3/4" />

          <div className="flex gap-2">
            {/* Badge Placeholders */}
            <div className="h-4 bg-zinc-800 rounded w-12" />
            <div className="h-4 bg-zinc-800 rounded w-16" />
          </div>
        </div>

        {/* Buttons Placeholder */}
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default TaskSkeleton;
