// hooks/useUserData.ts
import { useAuth } from "@/redux/hook/useAuth";
import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useUserData = () => {
  const { user, isAuthenticated } = useAuth();
  const token = getFromLocalStorage("accessToken");
  const objectId = user?.objectId;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // console.log(user)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !objectId) return;

      setLoading(true);

      // up to 2 retries with backoff (0.5s, then 1.5s)
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 12000); // 12s mobile-safe

        if (user?.role === "user") {
          try {
            const res = await fetch(
              // PROXY via Next.js to avoid CORS and mobile TLS quirks (see section 2)
              `/api/normal-users/${objectId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `${token}`, // ✅ add Bearer
                  Accept: "application/json",
                },
                cache: "no-store",
                signal: controller.signal,
              }
            );

            // Handle non-OKs explicitly so we see WHY it failed
            if (!res.ok) {
              const errJson = await res.json().catch(() => ({}));
              throw new Error(errJson?.message || `HTTP ${res.status}`);
            }

            const json = await res.json();
            setUserData(json.data);
            return; // success
          } catch (err: any) {
            if (attempt === maxAttempts) {
              const isAbort = err?.name === "AbortError";
              toast.error(
                isAbort
                  ? "Request timed out. Please try again."
                  : `Failed to fetch user info: ${err?.message || "network error"}`
              );
            } else {
              // small backoff before retry
              await sleep(500 * attempt + 500);
            }
          } finally {
            clearTimeout(t);
            setLoading(false);
          }
        }

      }
    };

    fetchUserData();
  }, [token, objectId]);

  return { userData, loading, isAuthenticated };
};
