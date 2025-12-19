// components/ui/LoadingOverlay.tsx
"use client";

import { Loader2 } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div>
        <Loader2 className="w-12 h-12 mx-auto text-accent animate-spin" />
        <small className="text-white text-xs animate-pulse">Fatching your games...</small>
      </div>
    </div>
  );
};

export default LoadingOverlay;
