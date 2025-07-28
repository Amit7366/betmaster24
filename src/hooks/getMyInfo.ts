import { useAuth } from "@/redux/hook/useAuth";
import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export const useUserData = () => {
  const { user, isAuthenticated } = useAuth();
  const token = getFromLocalStorage("accessToken");
  const objectId = user?.objectId;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !objectId) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${objectId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        const json = await res.json();
        setUserData(json.data);
      } catch {
        toast.error("Failed to fetch user info");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, objectId]);

  return { userData, loading, isAuthenticated };
};
