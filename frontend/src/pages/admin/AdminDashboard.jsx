function AdminDashboardSkeleton() {
  return (
    <div className="px-6 py-12 max-w-4xl">
      <Skeleton className="h-10 w-56 mb-8" />

      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-ink/10 p-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
