import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 md:px-8">
      <div className="w-4/5 max-[600px]:w-[100%] mx-auto border rounded-2xl p-6 shadow-sm bg-white">
        {/* Header Skeleton */}
        <div className="text-center mb-10">
          <Skeleton className="h-8 w-64 mx-auto mb-4 max-[600px]:hidden" />
          <Skeleton className="h-6 w-80 mx-auto max-[600px]:h-8 max-[600px]:w-72" />
        </div>

        {/* Quotation Content Skeleton */}
        <div className="space-y-6">
          {/* Country Info Skeleton */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Skeleton */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40 mx-auto" />
            <Skeleton className="h-12 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
