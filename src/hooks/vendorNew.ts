"use client";

import { useCallback, useEffect, useState } from "react";
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
  timestamp: string; // "2025-11-02 15:20:33"
  game_round: string;
}

const STORAGE_KEY_PREFIX = "vendor_ingest_marker_v1"; // versioned in case we change format later

export const useNewVendorTransactions = (
  userId?: string,
  onAfterFetch?: () => void
) => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const dispatch = useDispatch();

  // helper delay
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // compare "YYYY-MM-DD HH:mm:ss" strings lexicographically -> works correctly
  const isRecordNewer = (
    rTimestamp: string,
    rSerial: string,
    markerTimestamp: string,
    markerSerial: string
  ) => {
    if (!markerTimestamp) return true; // first time of day: treat as new
    if (rTimestamp > markerTimestamp) return true;
    if (rTimestamp === markerTimestamp && rSerial > markerSerial) return true;
    return false;
  };

  const getStorageKey = (uid?: string) =>
    `${STORAGE_KEY_PREFIX}:${uid ?? "anon"}`;

  const fetchVendorTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        // `https://loginapi.24gameapi.org/api/huidu.php?user=${userId}`
        `https://txserver.site/huidu.php?user=${userId}`
      );
      const data = await res.json();
      console.log("PHP response:", data);

      // possible shapes:
      // 1) { total_records, data: [ ...records ] }
      // 2) { data: { payload: { records: [...], total_count } } }
      // normalize:
      let vendorRecords: RecordItem[] = [];
      if (Array.isArray(data?.data)) {
        vendorRecords = data.data;
      } else if (data?.data?.payload?.records) {
        vendorRecords = data.data.payload.records;
      } else if (Array.isArray(data?.data?.payload)) {
        // defensive fallback
        vendorRecords = data.data.payload;
      }

      setRecords(vendorRecords);
      setTotalCount(data?.total_records ?? data?.data?.payload?.total_count ?? 0);

      if (!vendorRecords || vendorRecords.length === 0) {
        console.log("No records returned by vendor API.");
        setLoading(false);
        // still invalidate balance? probably not necessary if nothing changed.
        return;
      }

      // === marker logic (per-user, resets at UTC day change) ===
      const key = getStorageKey(userId);
      const todayUTC = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      let savedRaw = null;
      try {
        savedRaw = localStorage.getItem(key);
      } catch (e) {
        console.warn("localStorage read error", e);
      }

      let saved = { date: "", lastTimestamp: "", lastSerial: "" };
      if (savedRaw) {
        try {
          saved = JSON.parse(savedRaw);
        } catch {
          saved = { date: "", lastTimestamp: "", lastSerial: "" };
        }
      }

      // reset marker when UTC date changes
      if (saved.date !== todayUTC) {
        saved = { date: todayUTC, lastTimestamp: "", lastSerial: "" };
      }

      // find new records compared to marker
      const newRecords = vendorRecords.filter((r) =>
        isRecordNewer(r.timestamp, r.serial_number, saved.lastTimestamp, saved.lastSerial)
      );

      if (newRecords.length === 0) {
        console.log("🚫 No new records since last ingest. Skipping ingest.");
        // make sure we persist the (maybe reset) marker so it remains daily
        try {
          localStorage.setItem(key, JSON.stringify(saved));
        } catch (e) {
          console.warn("localStorage write error", e);
        }
        setLoading(false);
        return;
      }

      // determine newest record among newRecords (by timestamp, then serial)
      // sort descending so [0] is newest
      const sortedNew = [...newRecords].sort((a, b) => {
        if (a.timestamp === b.timestamp) return b.serial_number.localeCompare(a.serial_number);
        return b.timestamp.localeCompare(a.timestamp);
      });

      // update marker immediately to avoid rapid focus duplicates
      const newest = sortedNew[0];
      saved.lastTimestamp = newest.timestamp;
      saved.lastSerial = newest.serial_number;
      saved.date = todayUTC;
      try {
        localStorage.setItem(key, JSON.stringify(saved));
      } catch (e) {
        console.warn("localStorage write error", e);
      }

      console.log(`🧩 Sending ${newRecords.length} new records in batches...`);

      // batching send
      const batchSize = 50;
      const delayMs = 500;
      for (let i = 0; i < sortedNew.length; i += batchSize) {
        const batch = sortedNew.slice(i, i + batchSize);
        console.log(`📦 sending batch ${Math.floor(i / batchSize) + 1} (${batch.length})`);

        try {
          const ingestRes = await fetch(
            "https://bm24api.xyz/api/v1/gameRecords-txns/api/transactions/ingest",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: batch }),
            }
          );

          // try to parse response but don't fail everything if parse fails
          let ingestData: any = null;
          try {
            ingestData = await ingestRes.json();
          } catch (e) {
            ingestData = { ok: ingestRes.ok, status: ingestRes.status };
          }
          console.log("✅ batch result:", ingestData);
        } catch (err) {
          console.error("🔴 batch send error:", err);
          // NOTE: we don't revert the saved marker here. If you prefer to revert marker on failure,
          // save a copy of the old marker before overwriting and restore it on fatal failures.
        }

        // delay between batches unless last
        if (i + batchSize < sortedNew.length) {
          await delay(delayMs);
        }
      }

      // invalidate balance tag
      dispatch(baseApi.util.invalidateTags([{ type: "UserBalance" }]));

      if (onAfterFetch) onAfterFetch();
    } catch (err: any) {
      console.error("Error fetching vendor data:", err);
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [dispatch, userId, onAfterFetch]);

  useEffect(() => {
    // initial fetch + focus handler
    fetchVendorTransactions();
    const onFocus = () => fetchVendorTransactions();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchVendorTransactions]);

  return { records, totalCount, loading, error, refetch: fetchVendorTransactions };
};
