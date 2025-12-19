"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { baseApi } from "@/redux/api/baseApi";

export interface RecordItem {
  agency_uid: string;
  serial_number: string;
  currency_code: string;
  game_uid: string;
  member_account: string;
  bet_amount: string;
  win_amount: string;
  timestamp: string;
  game_round: string;
}

interface VendorResponse {
  data?: {
    payload?: {
      records?: RecordItem[];
      total_count?: number;
    };
  };
}

// 👇 Accept `userId` (or any params) as argument
export const useNewVendorTransactions = (
  userId?: string,
  onAfterFetch?: () => void
) => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const dispatch = useDispatch();

  const fetchVendorTransactions = useCallback(async () => {
    if (!userId) return; // avoid running if no ID
    setLoading(true);
    setError(null);

    // helper: delay between batches
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // our PHP server API call
      // const res = await fetch(`https://txserver.site/index.php?user=${userId}`);
      const res = await fetch(`https://loginapi.24gameapi.org/api/huidu.php?user=${userId}`);
      const data = await res.json();
      console.log("PHP response:", data);

      setRecords(data?.data);
      setTotalCount(data.total_records);

      const filteredRecords = data?.data ?? [];

      // 🔹 Send data in batches if records exist
      if (filteredRecords.length > 0) {
        console.log(
          `🧩 Preparing to send ${filteredRecords.length} records in batches...`
        );

        const batchSize = 50;
        const delayMs = 500;

        for (let i = 0; i < filteredRecords.length; i += batchSize) {
          const batch = filteredRecords.slice(i, i + batchSize);
          console.log(
            `📦 Sending batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`
          );

          try {
            const ingestRes = await fetch(
              "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records: batch }),
              }
            );

            const ingestData = await ingestRes.json();
            console.log(
              `🟢 Batch ${Math.floor(i / batchSize) + 1} success:`,
              Date.now(),
              ingestData
            );
          } catch (err) {
            console.error(
              `🔴 Error in batch ${Math.floor(i / batchSize) + 1}:`,
              err
            );
          }

          // Delay before next request (unless it's the last batch)
          if (i + batchSize < filteredRecords.length) {
            console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
            await delay(delayMs);
          }
        }

        console.log("✅ All batches processed successfully!");
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
  }, [dispatch, userId, onAfterFetch]);

  useEffect(() => {
    fetchVendorTransactions();

    const handleFocus = () => fetchVendorTransactions();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchVendorTransactions]);

  return { records, totalCount, loading, error, refetch: fetchVendorTransactions };
};

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useDispatch } from "react-redux";
// import { baseApi } from "@/redux/api/baseApi";



// export interface RecordItem {
//   agency_uid: string;
//   serial_number: string;
//   currency_code: string;
//   game_uid: string;
//   member_account: string;
//   bet_amount: string;
//   win_amount: string;
//   timestamp: string;
//   game_round: string;
// }

// interface VendorResponse {
//   data?: {
//     payload?: {
//       records?: RecordItem[];
//       total_count?: number;
//     };
//   };
// }


// // 👇 Accept `userId` (or any params) as argument
// export const useNewVendorTransactions = (
//   userId?: string,
//   onAfterFetch?: () => void
// ) => {
//   const [records, setRecords] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   const dispatch = useDispatch();

//   const fetchVendorTransactions = useCallback(async () => {
//      if (!userId) return; // avoid running if no ID
//     setLoading(true);
//     setError(null);

//     try {
      
//       //our php server api call
//       const res = await fetch(
//        `https://txserver.site/index.php?user=${userId}`
//       );
//       const data = await res.json();
//       console.log('PHP response: ',data);
//       setRecords(data?.data);
//       setTotalCount(data.total_records);
//       // localStorage.setItem(userId, data.total_records);
//       const filteredRecords = data?.data ?? [];
//       // 🔹 Optionally send filtered data to backend
//       if (filteredRecords.length > 0) {
//         console.log("🧩 Sending filtered records to ingest API...");
//         const ingestRes = await fetch(
//           "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ records: filteredRecords }),
//           }
//         );
//         const ingestData = await ingestRes.json();
//         console.log("🟢 Ingest API Response:", Date.now(), ingestData);
//       }

//       // ✅ Invalidate UserBalance tag to auto-refetch balance
//       dispatch(baseApi.util.invalidateTags([{ type: "UserBalance" }]));

//       // ✅ Trigger callback after everything finishes
//       if (onAfterFetch) onAfterFetch();
//     } catch (err: any) {
//       console.error("❌ Error fetching vendor data:", err.message);
//       setError(err.message || "Failed to fetch vendor transactions");
//     } finally {
//       setLoading(false);
//     }
//   }, [dispatch, userId, onAfterFetch]);

//   useEffect(() => {
//     fetchVendorTransactions();

//     const handleFocus = () => fetchVendorTransactions();
//     window.addEventListener("focus", handleFocus);
//     return () => window.removeEventListener("focus", handleFocus);
//   }, [fetchVendorTransactions]);

//   return { records, totalCount, loading, error, refetch: fetchVendorTransactions };
// };


// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useDispatch } from "react-redux";
// import { baseApi } from "@/redux/api/baseApi";
// import useStoreUserBalance from "@/hooks/storeUserBalance"; // ✅ import your hook
// import { useGetUserBalanceQuery } from "@/redux/api/balanceApi";
// import { useUserData } from "@/hooks/getMyInfo";

// export interface RecordItem {
//   agency_uid: string;
//   serial_number: string;
//   currency_code: string;
//   game_uid: string;
//   member_account: string;
//   bet_amount: string;
//   win_amount: string;
//   timestamp: string;
//   game_round: string;
// }

// export const useNewVendorTransactions = (
//   userId?: string,
//   onAfterFetch?: () => void
// ) => {
//   const [records, setRecords] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const dispatch = useDispatch();

//   // ✅ Bring in user and balance so the hook can store locally
//   const { userData } = useUserData();
//   const { data: balanceData } = useGetUserBalanceQuery(userData?.objectId ?? "", {
//     skip: !userData?.objectId,
//   });

//   // ✅ Call your localStorage hook whenever records update
//   // const localData = useStoreUserBalance(userData, balanceData, records);

//   const fetchVendorTransactions = useCallback(async () => {
//     if (!userId) return;
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch(`https://txserver.site/index.php?user=${userId}`);
//       const data = await res.json();

//       const fetchedRecords = data?.data ?? [];
//       const total = data?.total_records ?? 0;

//       setRecords(fetchedRecords);
//       setTotalCount(total);

//       if (fetchedRecords.length > 0) {
//         // 🔹 Wait a small delay to ensure localStorage update completes before insert
//         // await new Promise((r) => setTimeout(r, 300));

//         // 🔹 Now insert into MongoDB (after localStorage update)
//         console.log("🧩 Inserting vendor records into Mongo after localStorage update...");
//         const ingestRes = await fetch(
//           "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ records: fetchedRecords }),
//           }
//         );

//         const ingestData = await ingestRes.json();
//         console.log("🟢 Ingest API Response:", ingestData);
//       }

//       // ✅ Refresh balance cache
//       dispatch(baseApi.util.invalidateTags([{ type: "UserBalance" }]));

//       if (onAfterFetch) onAfterFetch();
//     } catch (err: any) {
//       console.error("❌ Error fetching vendor data:", err.message);
//       setError(err.message || "Failed to fetch vendor transactions");
//     } finally {
//       setLoading(false);
//     }
//   }, [dispatch, userId, onAfterFetch]);

//   useEffect(() => {
//     fetchVendorTransactions();
//     const handleFocus = () => fetchVendorTransactions();
//     window.addEventListener("focus", handleFocus);
//     return () => window.removeEventListener("focus", handleFocus);
//   }, [fetchVendorTransactions]);

//   return { records, totalCount, loading, error, refetch: fetchVendorTransactions };
// };
