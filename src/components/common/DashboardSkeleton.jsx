const SkeletonLine = ({ className = '' }) => (
  <div className={`animate-pulse rounded-full bg-slate-200/90 ${className}`} />
);

const SkeletonCard = ({ className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
    <div className="animate-pulse p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-8 w-16" />
        </div>
        <SkeletonLine className="h-12 w-12 rounded-2xl" />
      </div>
      <SkeletonLine className="mt-6 h-3 w-20" />
    </div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="animate-pulse flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <SkeletonLine className="h-3 w-40" />
              <SkeletonLine className="h-8 w-72 max-w-full" />
              <SkeletonLine className="h-4 w-64 max-w-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              <SkeletonLine className="h-11 w-28 rounded-full" />
              <SkeletonLine className="h-11 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="animate-pulse flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-3">
                <SkeletonLine className="h-4 w-56" />
                <SkeletonLine className="h-3 w-40" />
              </div>
              <SkeletonLine className="h-3 w-16" />
            </div>
            <div className="mt-5 space-y-3">
              <SkeletonLine className="h-16 w-full rounded-2xl" />
              <SkeletonLine className="h-16 w-full rounded-2xl" />
              <SkeletonLine className="h-16 w-full rounded-2xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="animate-pulse space-y-4">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-14 w-full rounded-2xl" />
              <SkeletonLine className="h-14 w-full rounded-2xl" />
              <SkeletonLine className="h-14 w-full rounded-2xl" />
              <SkeletonLine className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;