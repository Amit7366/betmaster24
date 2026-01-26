"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/redux/hook/useAuth";

type NormalUser = {
  _id: string;
  user: string;
  id: string; // like sbm47376
  name: string;
  userName: string; // phone
  contactNo: string;
  profileImg?: string;
  lastActiveAt?: string;
  engagementStatus?: string;
  userLevel?: string;
  status?: string;
  customerOfficerId?: string | null;
};

type RecycleRow = {
  lastSuccessDepositAt?: string;
  successDepositCount?: number;
  totalSuccessDeposit?: number;
  userObjectId?: string;
  normalUser: NormalUser;
};

type RecycleResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    days: number;
    cutoff?: string;
    data: RecycleRow[];
  };
};

const API_BASE = "https://bm24api.xyz/api/v1";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getToken(): string | null {
  // ✅ Replace this with your real auth strategy:
  // - cookie-based token
  // - next-auth session
  // - localStorage
  //
  // Example localStorage:
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken"); // e.g. "eyJhbGci..."
}

function buildUrl(pathname: string, params: Record<string, string>) {
  const url = new URL(pathname, "http://dummy.local");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.pathname + "?" + url.searchParams.toString();
}

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

  // show up to 7 buttons around current
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

        {/* Optional leading jump */}
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

        {/* Optional trailing jump */}
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
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  row: RecycleRow | null;
  onAssigned: () => Promise<void> | void;
}) {
  const [customerOfficerId, setCustomerOfficerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (open) {
      setErr(null);
      setSubmitting(false);
      setCustomerOfficerId(user?.id);
    }
  }, [open, user]);

  if (!open || !row) return null;

  const u = row.normalUser;

  async function submit() {
    setErr(null);
    const token = getToken();
    if (!token) {
      setErr("Missing access token. Please login again.");
      return;
    }
    if (!customerOfficerId.trim()) {
      setErr("Customer Officer ID is required.");
      return;
    }

    try {
      setSubmitting(true);

      console.log(u._id, customerOfficerId.trim());

      const res = await fetch(`/api/recycle/assign/${u._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ customerOfficerId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `PATCH failed: ${res.status}`);
      }

      await onAssigned();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Failed to assign.");
    } finally {
      setSubmitting(false);
    }
  }

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
              Review user info and assign an officer.
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
          {/* User preview */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-500">Name</div>
              <div className="mt-1 font-semibold text-slate-900">
                {u.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">User ID</div>
              <div className="mt-1 font-semibold text-slate-900">
                {u.id || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Phone (userName)
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {u.userName || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Contact</div>
              <div className="mt-1 font-semibold text-slate-900">
                {u.contactNo || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Last Active
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {formatDT(u.lastActiveAt)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Last Success Deposit
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {formatDT(row.lastSuccessDepositAt)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Success Deposit Count
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {row.successDepositCount ?? 0}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">
                Total Success Deposit
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {row.totalSuccessDeposit ?? 0}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border p-4">
            <label className="block text-sm font-medium text-slate-700">
              Customer Officer ID
            </label>
            <input
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-slate-900"
              value={customerOfficerId}
              onChange={(e) => setCustomerOfficerId(e.target.value)}
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
          Tip: After assignment, the list refreshes automatically.
        </div>
      </div>
    </div>
  );
}

export default function RecyclePage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const days = clampInt(Number(sp.get("days") ?? 3), 1, 365);
  const page = clampInt(Number(sp.get("page") ?? 1), 1, 999999);
  const limit = clampInt(Number(sp.get("limit") ?? 20), 5, 200);

  const [data, setData] = useState<RecycleResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState<RecycleRow | null>(null);

  async function fetchData() {
    setLoading(true);
    setErr(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token. Please login again.");

      const url = `/api/recycle?days=${days}&page=${page}&limit=${limit}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `GET failed: ${res.status}`);
      }

      const json: RecycleResponse = await res.json();
      if (!json.success) throw new Error(json.message || "Request failed");

      setData(json.data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, page, limit]);

  function setQuery(
    next: Partial<{ days: number; page: number; limit: number }>,
  ) {
    const nextDays = next.days ?? days;
    const nextPage = next.page ?? page;
    const nextLimit = next.limit ?? limit;

    router.push(
      buildUrl(pathname, {
        days: String(nextDays),
        page: String(nextPage),
        limit: String(nextLimit),
      }),
    );
  }

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
                Recycle Users
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.cutoff ? (
                  <>
                    Cutoff:{" "}
                    <span className="font-medium text-slate-900">
                      {formatDT(data.cutoff)}
                    </span>
                  </>
                ) : (
                  "List of unassigned users with successful deposits older than cutoff."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Days</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) =>
                    setQuery({ days: Number(e.target.value || 3), page: 1 })
                  }
                  className="w-24 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

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
                onClick={() => fetchData()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* States */}
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
                        <th className="px-4 py-3 font-semibold">Last Active</th>
                        <th className="px-4 py-3 font-semibold">
                          Last Deposit
                        </th>
                        <th className="px-4 py-3 font-semibold">Count</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-8 text-center text-slate-600"
                            colSpan={8}
                          >
                            No data found.
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => {
                          const u = r.normalUser;
                          const assigned = Boolean(u.customerOfficerId);

                          return (
                            <tr key={u._id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                                    {(u.name || "U").slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {u.name || "—"}{" "}
                                      <span className="text-xs text-slate-500">
                                        ({u.id || "—"})
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Level: {u.userLevel || "—"} •{" "}
                                      {u.engagementStatus || "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-900">
                                <div className="font-medium">
                                  {u.userName || "—"}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {u.contactNo || "—"}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-700">
                                {formatDT(u.lastActiveAt)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatDT(r.lastSuccessDepositAt)}
                              </td>
                              <td className="px-4 py-3 text-slate-900">
                                {r.successDepositCount ?? 0}
                              </td>
                              <td className="px-4 py-3 text-slate-900">
                                {r.totalSuccessDeposit ?? 0}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={cx(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                    assigned
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700",
                                  )}
                                >
                                  {assigned
                                    ? `Assigned: ${u.customerOfficerId}`
                                    : "Unassigned"}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  className={cx(
                                    "rounded-xl px-3 py-2 text-sm font-medium shadow-sm",
                                    "bg-slate-900 text-white hover:bg-slate-800",
                                  )}
                                  onClick={() => {
                                    setAssignRow(r);
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
        row={assignRow}
        onClose={() => setAssignOpen(false)}
        onAssigned={async () => {
          // After assigning, refresh list
          await fetchData();
        }}
      />
    </div>
  );
}

const TableSkeleton = ({ rows = 8 }: { rows?: number }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-slate-50 px-4 py-3">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
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
