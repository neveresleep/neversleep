import PostCardSkeleton from '@/components/ui/PostCardSkeleton';

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #E8F4FD 0%, #B8D9F8 50%, #D4EAFF 100%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 pt-[15vh] pb-16">
        {/* Hero skeleton */}
        <div className="animate-pulse flex flex-col items-center gap-6 mb-16">
          {/* Logo / title */}
          <div
            className="h-16 w-56 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.45)' }}
          />
          {/* Subtitle */}
          <div
            className="h-6 w-48 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.35)' }}
          />
          {/* Search bar */}
          <div
            className="h-[60px] w-full max-w-2xl rounded-full"
            style={{ background: 'rgba(255,255,255,0.55)' }}
          />
          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 rounded-full"
                style={{ background: 'rgba(255,255,255,0.45)' }}
              />
            ))}
          </div>
        </div>

        {/* Post cards grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
