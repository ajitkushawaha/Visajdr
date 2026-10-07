import { Loader2 } from "lucide-react";

export default function Loading() {

    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  
}