// hooks/useDashboardData.ts
import { useEffect, useState } from "react";
import { toast } from "sonner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface PromoSummary {
  totalTurnoverCompleted?: number;
  totalTurnoverRequired?: number;
  // add other fields when you use them
}

export interface DashboardData {
  user: any;
  balance: number;
  promoSummary: PromoSummary | null;
}

export function useDashboardData(id?: string, token?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const attempts = 3;

      for (let i = 1; i <= attempts; i++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000); // 12s per attempt

        try {
          const res = await fetch(`/api/dashboard/${id}`, {
            headers: {
              // ✅ your proxy expects "Bearer <token>"
              Authorization: `${token}`,
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          });

          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

          if (!cancelled) setData(json.data as DashboardData);
          return; // success
        } catch (err: any) {
          if (i === attempts) {
            // toast.error(
            //   err?.name === "AbortError"
            //     ? "Request timed out. Try again. dashboard data"
            //     : err?.message || "Failed to load dashboard data"
            // );
          } else {
            // small backoff before retry
            await sleep(600 * i);
          }
        } finally {
          clearTimeout(timer);
        }
      }
      if (!cancelled) setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  return { data, loading };
}
