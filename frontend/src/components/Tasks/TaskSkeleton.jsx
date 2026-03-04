function TaskSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-4">
        {/* Checkbox Placeholder */}
        <div className="h-5 w-5 shrink-0 rounded bg-zinc-800" />

        <div className="flex-1 space-y-3">
          {/* Title Placeholder */}
          <div className="h-4 w-3/4 rounded bg-zinc-800" />

          <div className="flex gap-2">
            {/* Badge Placeholders */}
            <div className="h-4 w-12 rounded bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-800" />
          </div>
        </div>

        {/* Buttons Placeholder */}
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg bg-zinc-800" />
          <div className="h-8 w-8 rounded-lg bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export default TaskSkeleton;
