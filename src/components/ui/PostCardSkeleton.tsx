export default function PostCardSkeleton() {
  return (
    <div
      className="rounded-[20px] overflow-hidden border animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderColor: 'rgba(255,255,255,0.75)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
      }}
    >
      {/* Cover image placeholder */}
      <div className="w-full h-40 bg-white/40" />

      <div className="flex flex-col gap-3 p-6">
        {/* Badge */}
        <div className="w-16 h-5 rounded-full bg-white/50" />

        {/* Title — two lines */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-full rounded-lg bg-white/50" />
          <div className="h-5 w-3/4 rounded-lg bg-white/50" />
        </div>

        {/* Description — two lines */}
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-full rounded bg-white/40" />
          <div className="h-4 w-5/6 rounded bg-white/40" />
        </div>

        {/* Tool tags */}
        <div className="flex gap-1.5 mt-auto pt-1">
          <div className="h-5 w-14 rounded-full bg-white/40" />
          <div className="h-5 w-16 rounded-full bg-white/40" />
          <div className="h-5 w-12 rounded-full bg-white/40" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/30">
          <div className="h-3 w-24 rounded bg-white/40" />
          <div className="h-3 w-10 rounded bg-white/40" />
        </div>
      </div>
    </div>
  );
}
