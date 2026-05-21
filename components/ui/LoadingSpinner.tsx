export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-2/3" />
    </div>
  );
}
