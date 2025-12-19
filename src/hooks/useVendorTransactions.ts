"use client";

import { useState, useCallback } from "react";
import { useSessionTime } from "./useSessionTime";

interface VendorRecord {
  agency_uid: string;
  serial_number: string;
  currency_code: string;
  game_uid: string;
  member_account: string;
  bet_amount: string;
  win_amount: string;
  timestamp: string;
  game_round: string;
  [key: string]: any;
}

export function useVendorTransactions() {
  const [records, setRecords] = useState<VendorRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/vendor/transactions");
      const data = await res.json();
      console.log(data)

      if (data?.data?.payload?.records) {
        const filtered = data.data.payload.records.filter((record: any) => {
          const member = record.member_account || "";
          const parts = member.split("_");
          return parts[1]?.toLowerCase().startsWith("sbm");
        });

        setRecords(filtered);
        setTotalCount(data.data.payload.total_count || 0);

        console.log(
          `✅ Showing ${filtered.length} / ${data.data.payload.total_count} records`
        );
        console.log("🎯 Filtered Vendor Data:", filtered);
        console.log("🎯 Full Vendor Data:", data.data.payload.records);
      

        // 🔹 STEP 2: Send filtered records to MongoDB
        if (filtered.length > 0) {
          console.log("🧩 Ready to send records:", filtered);
          const ingestRes = await fetch(
            "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: filtered }), // ✅ fixed here
            }
          );

          const ingestData = await ingestRes.json();
          console.log("🟢 Ingest API Response:", ingestData);
        }
      } else {
        console.warn("⚠️ No records found in vendor data");
      }
    } catch (err: any) {
      console.error("❌ Error fetching or posting vendor data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { records, totalCount, loading, error, refetch };
}
