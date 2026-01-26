// app/no-deposit-balance/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/redux/hook/useAuth";

type NormalUser = {
  _id: string;
  user: string;
  id: string;
  name: string;
  userName: string;
  contactNo?: string;
  profileImg?: string;
  lastActiveAt?: string;
  engagementStatus?: string;
  userLevel?: string;
  status?: string;
  customerOfficerId?: string | null;
};

type NoDepositRow = {
  userId: string; // ✅ will be used in assign URL
  id: string; // sbm47890
  totalDeposit: number;
  totalWithdraw: number;
  currentBalance: number;
  currentCoinBalance: number;
  storeDbBalance: number;
  totalCoinDeposit: number;
  totalCoinWithdraw: number;
  lockedBalance: number;
  createdAt?: string;
  updatedAt?: string;
  userBalanceId?: string;
  normalUser: NormalUser;
};

type NoDepositResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    data: NoDepositRow[];
  };
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function formatDT(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://dummy.local");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.pathname + "?" + url.searchParams.toString();
}

// ✅ your token style: Authorization: `${token}`
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

const TableSkeleton = ({ rows = 10 }: { rows?: number }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-slate-50 px-4 py-3">
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="hidden md:block h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
};

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pages = useMemo(() => {
    const windowSize = 7;
    if (totalPages <= windowSize)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const half = Math.floor(windowSize / 2);
    let start = page - half;
    let end = page + half;

    if (start < 1) {
      start = 1;
      end = windowSize;
    }
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - windowSize + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-slate-600">
        Total: <span className="font-medium text-slate-900">{total}</span> •
        Page <span className="font-medium text-slate-900">{page}</span> /{" "}
        <span className="font-medium text-slate-900">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={cx(
            "rounded-xl border px-3 py-2 text-sm shadow-sm",
            page <= 1
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : "bg-white hover:bg-slate-50",
          )}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button
              className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            <span className="px-1 text-slate-500">…</span>
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={cx(
              "rounded-xl border px-3 py-2 text-sm shadow-sm",
              p === page
                ? "border-slate-900 bg-slate-900 text-white"
                : "bg-white hover:bg-slate-50",
            )}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            <span className="px-1 text-slate-500">…</span>
            <button
              className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={cx(
            "rounded-xl border px-3 py-2 text-sm shadow-sm",
            page >= totalPages
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : "bg-white hover:bg-slate-50",
          )}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function AssignModal({
  open,
  onClose,
  row,
  customerOfficerId,
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  row: NoDepositRow | null;
  customerOfficerId: string;
  onAssigned: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const [officer, setOfficer] = useState(customerOfficerId || "S-0001");

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setSubmitting(false);
    setOfficer(user?.id);
  }, [open, customerOfficerId,user]);

  if (!open || !row) return null;

  async function submit() {
    setErr(null);

    const token = getToken();
    if (!token) {
      setErr("Missing access token. Please login again.");
      return;
    }

    const officerId = officer.trim();
    if (!officerId) {
      setErr("Customer Officer ID is required.");
      return;
    }

    try {
      setSubmitting(true);
      const userId = row?.userId;
      if (!userId) {
        setErr("User not selected.");
        return;
      }

      // ✅ IMPORTANT: id is row.userId
      const res = await fetch(`/api/recycleAssign/recycle/assign/${encodeURIComponent(row.userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, // ✅ your format
        },
        body: JSON.stringify({ customerOfficerId: officer }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Assign failed: ${res.status}`);
      }

      await onAssigned();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Failed to assign.");
    } finally {
      setSubmitting(false);
    }
  }

  const u = row.normalUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={submitting ? undefined : onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Assign Customer Officer
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Assign officer to this user.
            </p>
          </div>
          <button
            className={cx(
              "rounded-xl border px-3 py-2 text-sm",
              submitting
                ? "cursor-not-allowed bg-slate-50 text-slate-400"
                : "bg-white hover:bg-slate-50",
            )}
            disabled={submitting}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-500">Name</div>
              <div className="mt-1 font-semibold text-slate-900">
                {u?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">SBM ID</div>
              <div className="mt-1 font-semibold text-slate-900">
                {row.id || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Assign ID (userId)
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {row.userId}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Phone</div>
              <div className="mt-1 font-semibold text-slate-900">
                {u?.contactNo || "—"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-4">
            <label className="block text-sm font-medium text-slate-700">
              Customer Officer ID
            </label>
            <input
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:border-slate-900"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              placeholder="e.g. S-0001"
              disabled={submitting}
            />

            {err && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className={cx(
                  "rounded-xl border px-4 py-2 text-sm shadow-sm",
                  submitting
                    ? "cursor-not-allowed bg-slate-50 text-slate-400"
                    : "bg-white hover:bg-slate-50",
                )}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={cx(
                  "rounded-xl px-4 py-2 text-sm font-medium shadow-sm",
                  submitting
                    ? "cursor-not-allowed bg-slate-300 text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800",
                )}
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t p-4 text-xs text-slate-500">
          After assignment, list refreshes automatically.
        </div>
      </div>
    </div>
  );
}

export default function NoDepositBalancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const page = clampInt(Number(sp.get("page") ?? 1), 1, 999999);
  const limit = clampInt(Number(sp.get("limit") ?? 20), 5, 200);

  const [data, setData] = useState<NoDepositResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [customerOfficerId, setCustomerOfficerId] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<NoDepositRow | null>(null);

  useEffect(() => {
    const officer = (user?.id || "").trim(); // or user?.customerOfficerId
    if (!officer) return;
    setCustomerOfficerId(officer);
  }, [user]);

  function setQuery(next: Partial<{ page: number; limit: number }>) {
    const nextPage = next.page ?? page;
    const nextLimit = next.limit ?? limit;

    router.push(
      buildUrl(pathname, {
        page: String(nextPage),
        limit: String(nextLimit),
      }),
    );
  }

  async function fetchNoDeposit() {
    setLoading(true);
    setErr(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token. Please login again.");

      const url = `/api/no-deposit-balance?page=${encodeURIComponent(
        String(page),
      )}&limit=${encodeURIComponent(String(limit))}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `${token}`, // ✅ EXACT (no Bearer)
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `GET failed: ${res.status}`);
      }

      const json: NoDepositResponse = await res.json();
      if (!json.success) throw new Error(json.message || "Request failed");

      setData(json.data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load no-deposit list");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // ✅ guard: don’t fetch before auth is ready
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNoDeposit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, page, limit]);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const serverPage = data?.page ?? page;
  const serverLimit = data?.limit ?? limit;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                No Deposit Balance
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Users where{" "}
                <span className="font-medium text-slate-900">
                  totalDeposit = 0
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Limit</label>
                <select
                  value={limit}
                  onChange={(e) =>
                    setQuery({ limit: Number(e.target.value), page: 1 })
                  }
                  className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => fetchNoDeposit()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={10} />
          ) : (
            <>
              <div className="mt-6 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Balances</th>
                        <th className="px-4 py-3 font-semibold">Coins</th>
                        <th className="px-4 py-3 font-semibold">Locked</th>
                        <th className="px-4 py-3 font-semibold">Last Active</th>
                        <th className="px-4 py-3 font-semibold">Officer</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-10 text-center text-slate-600"
                            colSpan={8}
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => {
                          const u = r.normalUser;

                          return (
                            <tr
                              key={r.userBalanceId || r.userId}
                              className="hover:bg-slate-50"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                                    {(u?.name || r.id || "U")
                                      .slice(0, 1)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {u?.name || "—"}{" "}
                                      <span className="text-xs text-slate-500">
                                        ({r.id || "—"})
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Level: {u?.userLevel || "—"} •{" "}
                                      {u?.engagementStatus || "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-900">
                                <div className="font-medium">
                                  {u?.userName || "—"}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {u?.contactNo || "—"}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-900">
                                <div className="text-xs text-slate-500">
                                  Current
                                </div>
                                <div className="font-medium">
                                  {r.currentBalance ?? 0}
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                  Store DB
                                </div>
                                <div className="font-medium">
                                  {r.storeDbBalance ?? 0}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-900">
                                <div className="text-xs text-slate-500">
                                  Coin Balance
                                </div>
                                <div className="font-medium">
                                  {r.currentCoinBalance ?? 0}
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                  Total Coin Deposit
                                </div>
                                <div className="font-medium">
                                  {r.totalCoinDeposit ?? 0}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-900">
                                {r.lockedBalance ?? 0}
                              </td>

                              <td className="px-4 py-3 text-slate-700">
                                {formatDT(u?.lastActiveAt)}
                              </td>

                              <td className="px-4 py-3">
                                {u?.customerOfficerId ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    {u.customerOfficerId}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    Unassigned
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                                  onClick={() => {
                                    setSelectedRow(r);
                                    setAssignOpen(true);
                                  }}
                                >
                                  Assign
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5">
                <Pagination
                  page={serverPage}
                  pageSize={serverLimit}
                  total={total}
                  onPageChange={(p) => setQuery({ page: p })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        row={selectedRow}
        customerOfficerId={customerOfficerId}
        onAssigned={async () => {
          await fetchNoDeposit();
        }}
      />
    </div>
  );
}
