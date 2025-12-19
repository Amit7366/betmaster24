"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { baseApi } from "@/redux/api/baseApi";

interface VendorRecord {
  member_account?: string;
  [key: string]: any;
}

interface VendorResponse {
  data?: {
    payload?: {
      records?: VendorRecord[];
      total_count?: number;
    };
  };
}

export const useNewVendorTransactions = (onAfterFetch?: () => void) => {
  const [records, setRecords] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const dispatch = useDispatch();

  const fetchVendorTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      //direact api call
      // const res = await fetch("/api/vendor/transactions");
      // const data: VendorResponse = await res.json();

      // console.log("🎯 Vendor Transactions:", data);

      // const allRecords = data?.data?.payload?.records ?? [];
      // const total = data?.data?.payload?.total_count ?? 0;

      // // ✅ Filter only records whose middle segment starts with "sbm"
      // const filteredRecords = allRecords.filter((record) => {
      //   const member = record.member_account || "";
      //   const parts = member.split("_");
      //   return parts[1]?.toLowerCase().startsWith("sbm");
      // });

      // console.log(`✅ Showing ${filteredRecords.length} / ${total} records`);
      // console.log("🎯 Filtered Vendor Data:", filteredRecords);

      // setRecords(filteredRecords);
      // setTotalCount(total);

      //our php server api call
      const res = await fetch(
        "https://txserver.site/index.php"
      );
      const data = await res.json();
      // console.log('PHP response: ',data);
      setRecords(data?.data);
      setTotalCount(data.total_records);
      const filteredRecords = data?.data ?? [];
      // 🔹 Optionally send filtered data to backend
      if (filteredRecords.length > 0) {
        console.log("🧩 Sending filtered records to ingest API...");
        const ingestRes = await fetch(
          "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records: filteredRecords }),
          }
        );
        const ingestData = await ingestRes.json();
        console.log("🟢 Ingest API Response:", Date.now(), ingestData);
      }

      // ✅ Invalidate UserBalance tag to auto-refetch balance
      dispatch(baseApi.util.invalidateTags([{ type: "UserBalance" }]));

      // ✅ Trigger callback after everything finishes
      if (onAfterFetch) onAfterFetch();
    } catch (err: any) {
      console.error("❌ Error fetching vendor data:", err.message);
      setError(err.message || "Failed to fetch vendor transactions");
    } finally {
      setLoading(false);
    }
  }, [dispatch, onAfterFetch]);

  useEffect(() => {
    fetchVendorTransactions();

    const handleFocus = () => fetchVendorTransactions();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchVendorTransactions]);

  return { records, totalCount, loading, error, refetch: fetchVendorTransactions };
};
