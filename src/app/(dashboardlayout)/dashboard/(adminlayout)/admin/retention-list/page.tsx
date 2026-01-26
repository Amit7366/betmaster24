// app/recycle/assigned/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/redux/hook/useAuth";
import { toast } from "sonner";

type AssignedUser = {
  _id: string;
  id: string; // sbm47941
  user: string; // user objectId
  name: string;
  userName: string;
  customerOfficerId: string;
  engagementStatus?: string;
  contactNo?: string;
  userLevel?: string;
  status?: string;
  profileImg?: string;
  lastActiveAt?: string;
};

type AssignedResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: AssignedUser[];
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

const TableSkeleton = ({ rows = 8 }: { rows?: number }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
      <div className="border-b bg-slate-50 px-4 py-3">
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
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

// ✅ BONUS MODAL (dummy submit)
function BonusModal({
  open,
  onClose,
  user,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  user: AssignedUser | null;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setErr(null);
    setSubmitting(false);
  }, [open]);

  if (!open || !user) return null;

  async function submit() {
    setErr(null);

    if (submitting) return; // extra safety

    const token = getToken();
    if (!token) return setErr("Missing access token. Please login again.");

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return setErr("Please enter a valid bonus amount.");
    }

    const targetUserId = user?.user; // objectId
    if (!targetUserId) return setErr("User not selected.");

    const payload = { userId: targetUserId, amount: value };

    setSubmitting(true);

    const promise = (async () => {
      const res = await fetch("/api/recycle/bonus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // your style
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof data === "string"
            ? data
            : data?.message || data?.error || `Bonus failed: ${res.status}`;
        throw new Error(msg);
      }

      if (typeof data !== "string" && data?.success === false) {
        throw new Error(data?.message || "Bonus failed.");
      }

      return data;
    })();

    toast.promise(promise, {
      loading: "Sending retention bonus...",
      success: (data: any) => data?.message || "Retention bonus sent!",
      error: (e) => e?.message || "Failed to send bonus.",
    });

    try {
      await promise; // ✅ only once
      onSuccess?.();
      onClose?.();
      setAmount("");
    } catch (e: any) {
      setErr(e?.message || "Failed to send bonus.");
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
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Give Bonus</h3>
            <p className="mt-1 text-sm text-slate-600">
              User:{" "}
              <span className="font-medium text-slate-900">{user.name}</span>{" "}
              <span className="text-slate-500">({user.id})</span>
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
          <div className="rounded-2xl border p-4">
            <label className="block text-sm font-medium text-slate-700">
              Bonus Amount
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:border-slate-900"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                {submitting ? "Sending..." : "Submit Bonus"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t p-4 text-xs text-slate-500">
          This is a dummy route now. Later we will connect to the real bonus
          API.
        </div>
      </div>
    </div>
  );
}

export default function AssignedRecyclePage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [customerOfficerId, setCustomerOfficerId] = useState("");
  const page = clampInt(Number(sp.get("page") ?? 1), 1, 999999);
  const limit = clampInt(Number(sp.get("limit") ?? 20), 5, 200);

  const [data, setData] = useState<AssignedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ✅ bonus modal state
  const [bonusOpen, setBonusOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);

  function setQuery(
    next: Partial<{ customerOfficerId: string; page: number; limit: number }>,
  ) {
    const nextOfficer =
      (next.customerOfficerId ?? customerOfficerId).trim() || "S-0001";
    const nextPage = next.page ?? page;
    const nextLimit = next.limit ?? limit;

    router.push(
      buildUrl(pathname, {
        customerOfficerId: nextOfficer,
        page: String(nextPage),
        limit: String(nextLimit),
      }),
    );
  }

  async function fetchAssigned() {
    setLoading(true);
    setErr(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token. Please login again.");

      const url = `/api/recycle/assigned?customerOfficerId=${encodeURIComponent(
        customerOfficerId,
      )}&page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `${token}` },
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `GET failed: ${res.status}`);
      }

      const json: AssignedResponse = await res.json();
      if (!json.success) throw new Error(json.message || "Request failed");

      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Failed to load assigned list");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const officer = (user?.id || "").trim();
    if (!officer) return;
    setCustomerOfficerId(officer);
  }, [user]);

  const ready = isAuthenticated && !!customerOfficerId?.trim();

  useEffect(() => {
    if (!ready) return;
    fetchAssigned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, customerOfficerId, page, limit]);

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const serverPage = data?.meta?.page ?? page;
  const serverLimit = data?.meta?.limit ?? limit;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Assigned Recycle List
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Showing users assigned to officer{" "}
                <span className="font-medium text-slate-900">
                  {customerOfficerId || "—"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Officer</label>
                <input
                  value={customerOfficerId}
                  onChange={(e) =>
                    setQuery({ customerOfficerId: e.target.value, page: 1 })
                  }
                  className="w-36 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
                  placeholder="S-0001"
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
                onClick={() => fetchAssigned()}
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
                        <th className="px-4 py-3 font-semibold">Officer</th>
                        <th className="px-4 py-3 font-semibold">Engagement</th>
                        <th className="px-4 py-3 font-semibold">Level</th>
                        <th className="px-4 py-3 font-semibold">Last Active</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Bonus
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
                            No assigned users found.
                          </td>
                        </tr>
                      ) : (
                        rows.map((u) => (
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
                                    Username: {u.userName || "—"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-slate-900">
                              <div className="font-medium">
                                {u.contactNo || "—"}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                {u.customerOfficerId || "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-slate-700">
                              {u.engagementStatus || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {u.userLevel || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {formatDT(u.lastActiveAt)}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={cx(
                                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                  u.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-700",
                                )}
                              >
                                {u.status || "—"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setBonusOpen(true);
                                }}
                              >
                                Give Bonus
                              </button>
                            </td>
                          </tr>
                        ))
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

      <BonusModal
        open={bonusOpen}
        onClose={() => setBonusOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          // optional: refresh list after bonus
          fetchAssigned();
        }}
      />
    </div>
  );
}

// // app/recycle/assigned/page.tsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useAuth } from "@/redux/hook/useAuth";

// type AssignedUser = {
//   _id: string;
//   id: string; // sbm47941
//   user: string;
//   name: string;
//   userName: string;
//   customerOfficerId: string;
//   engagementStatus?: string;
//   contactNo?: string;
//   userLevel?: string;
//   status?: string;
//   profileImg?: string;
//   lastActiveAt?: string;
// };

// type AssignedResponse = {
//   success: boolean;
//   statusCode: number;
//   message: string;
//   meta: {
//     total: number;
//     page: number;
//     limit: number;
//   };
//   data: AssignedUser[];
// };

// function cx(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// function clampInt(v: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, v));
// }

// function formatDT(iso?: string) {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "—";
//   return new Intl.DateTimeFormat(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function buildUrl(pathname: string, params: Record<string, string>) {
//   const url = new URL(pathname, "http://dummy.local");
//   Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
//   return url.pathname + "?" + url.searchParams.toString();
// }

// // ✅ your token style: Authorization: `${token}`
// function getToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("accessToken");
// }

// const TableSkeleton = ({ rows = 8 }: { rows?: number }) => {
//   return (
//     <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
//       <div className="border-b bg-slate-50 px-4 py-3">
//         <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
//       </div>

//       <div className="divide-y">
//         {Array.from({ length: rows }).map((_, i) => (
//           <div key={i} className="flex items-center gap-4 px-4 py-4">
//             <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
//             <div className="flex-1 space-y-2">
//               <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
//               <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
//             </div>
//             <div className="hidden sm:block h-4 w-24 animate-pulse rounded bg-slate-200" />
//             <div className="hidden md:block h-4 w-28 animate-pulse rounded bg-slate-200" />
//             <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// function Pagination({
//   page,
//   pageSize,
//   total,
//   onPageChange,
// }: {
//   page: number;
//   pageSize: number;
//   total: number;
//   onPageChange: (p: number) => void;
// }) {
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   const pages = useMemo(() => {
//     const windowSize = 7;
//     if (totalPages <= windowSize)
//       return Array.from({ length: totalPages }, (_, i) => i + 1);

//     const half = Math.floor(windowSize / 2);
//     let start = page - half;
//     let end = page + half;

//     if (start < 1) {
//       start = 1;
//       end = windowSize;
//     }
//     if (end > totalPages) {
//       end = totalPages;
//       start = totalPages - windowSize + 1;
//     }

//     return Array.from({ length: end - start + 1 }, (_, i) => start + i);
//   }, [page, totalPages]);

//   return (
//     <div className="flex flex-wrap items-center justify-between gap-3">
//       <div className="text-sm text-slate-600">
//         Total: <span className="font-medium text-slate-900">{total}</span> •
//         Page <span className="font-medium text-slate-900">{page}</span> /{" "}
//         <span className="font-medium text-slate-900">{totalPages}</span>
//       </div>

//       <div className="flex items-center gap-2">
//         <button
//           className={cx(
//             "rounded-xl border px-3 py-2 text-sm shadow-sm",
//             page <= 1
//               ? "cursor-not-allowed bg-slate-50 text-slate-400"
//               : "bg-white hover:bg-slate-50",
//           )}
//           disabled={page <= 1}
//           onClick={() => onPageChange(page - 1)}
//         >
//           Prev
//         </button>

//         {pages[0] > 1 && (
//           <>
//             <button
//               className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
//               onClick={() => onPageChange(1)}
//             >
//               1
//             </button>
//             <span className="px-1 text-slate-500">…</span>
//           </>
//         )}

//         {pages.map((p) => (
//           <button
//             key={p}
//             className={cx(
//               "rounded-xl border px-3 py-2 text-sm shadow-sm",
//               p === page
//                 ? "border-slate-900 bg-slate-900 text-white"
//                 : "bg-white hover:bg-slate-50",
//             )}
//             onClick={() => onPageChange(p)}
//           >
//             {p}
//           </button>
//         ))}

//         {pages[pages.length - 1] < totalPages && (
//           <>
//             <span className="px-1 text-slate-500">…</span>
//             <button
//               className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
//               onClick={() => onPageChange(totalPages)}
//             >
//               {totalPages}
//             </button>
//           </>
//         )}

//         <button
//           className={cx(
//             "rounded-xl border px-3 py-2 text-sm shadow-sm",
//             page >= totalPages
//               ? "cursor-not-allowed bg-slate-50 text-slate-400"
//               : "bg-white hover:bg-slate-50",
//           )}
//           disabled={page >= totalPages}
//           onClick={() => onPageChange(page + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function AssignedRecyclePage() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const sp = useSearchParams();
//   const { user, isAuthenticated } = useAuth();

//   const [customerOfficerId, setCustomerOfficerId] = useState("");
//   const page = clampInt(Number(sp.get("page") ?? 1), 1, 999999);
//   const limit = clampInt(Number(sp.get("limit") ?? 20), 5, 200);

//   const [data, setData] = useState<AssignedResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);

//   function setQuery(
//     next: Partial<{ customerOfficerId: string; page: number; limit: number }>,
//   ) {
//     const nextOfficer =
//       (next.customerOfficerId ?? customerOfficerId).trim() || "S-0001";
//     const nextPage = next.page ?? page;
//     const nextLimit = next.limit ?? limit;

//     router.push(
//       buildUrl(pathname, {
//         customerOfficerId: nextOfficer,
//         page: String(nextPage),
//         limit: String(nextLimit),
//       }),
//     );
//   }

//   async function fetchAssigned() {
//     setLoading(true);
//     setErr(null);

//     try {
//       const token = getToken();
//       if (!token) throw new Error("Missing access token. Please login again.");

//       const url = `/api/recycle/assigned?customerOfficerId=${encodeURIComponent(
//         customerOfficerId,
//       )}&page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`;

//       const res = await fetch(url, {
//         method: "GET",
//         headers: {
//           Authorization: `${token}`, // ✅ EXACT as you said (no Bearer)
//         },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(txt || `GET failed: ${res.status}`);
//       }

//       const json: AssignedResponse = await res.json();
//       if (!json.success) throw new Error(json.message || "Request failed");

//       setData(json);
//     } catch (e: any) {
//       setErr(e?.message || "Failed to load assigned list");
//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   }
//   useEffect(() => {
//     const officer = (user?.id || "").trim(); // (or user?.customerOfficerId)
//     if (!officer) return; // ✅ don't set empty
//     setCustomerOfficerId(officer);
//   }, [user]);

//   const ready = isAuthenticated && !!customerOfficerId?.trim();

//   useEffect(() => {
//     if (!ready) return; // ✅ prevents first empty call
//     fetchAssigned();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ready, customerOfficerId, page, limit]);

//   const rows = data?.data ?? [];
//   const total = data?.meta?.total ?? 0;
//   const serverPage = data?.meta?.page ?? page;
//   const serverLimit = data?.meta?.limit ?? limit;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="mx-auto max-w-7xl p-4 sm:p-6">
//         <div className="rounded-2xl border bg-white p-5 shadow-sm">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <h1 className="text-xl font-semibold text-slate-900">
//                 Assigned Recycle List
//               </h1>
//               <p className="mt-1 text-sm text-slate-600">
//                 Showing users assigned to officer{" "}
//                 <span className="font-medium text-slate-900">
//                   {customerOfficerId || "—"}
//                 </span>
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex items-center gap-2">
//                 <label className="text-sm text-slate-600">Officer</label>
//                 <input
//                   value={customerOfficerId}
//                   onChange={(e) =>
//                     setQuery({ customerOfficerId: e.target.value, page: 1 })
//                   }
//                   className="w-36 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
//                   placeholder="S-0001"
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <label className="text-sm text-slate-600">Limit</label>
//                 <select
//                   value={limit}
//                   onChange={(e) =>
//                     setQuery({ limit: Number(e.target.value), page: 1 })
//                   }
//                   className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"
//                 >
//                   {[10, 20, 50, 100].map((n) => (
//                     <option key={n} value={n}>
//                       {n}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <button
//                 onClick={() => fetchAssigned()}
//                 className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
//               >
//                 Refresh
//               </button>
//             </div>
//           </div>

//           {err && (
//             <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//               {err}
//             </div>
//           )}

//           {loading ? (
//             <TableSkeleton rows={10} />
//           ) : (
//             <>
//               <div className="mt-6 overflow-hidden rounded-2xl border">
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-left text-sm">
//                     <thead className="bg-slate-100 text-slate-700">
//                       <tr>
//                         <th className="px-4 py-3 font-semibold">User</th>
//                         <th className="px-4 py-3 font-semibold">Phone</th>
//                         <th className="px-4 py-3 font-semibold">Officer</th>
//                         <th className="px-4 py-3 font-semibold">Engagement</th>
//                         <th className="px-4 py-3 font-semibold">Level</th>
//                         <th className="px-4 py-3 font-semibold">Last Active</th>
//                         <th className="px-4 py-3 font-semibold">Status</th>
//                       </tr>
//                     </thead>

//                     <tbody className="divide-y">
//                       {rows.length === 0 ? (
//                         <tr>
//                           <td
//                             className="px-4 py-10 text-center text-slate-600"
//                             colSpan={7}
//                           >
//                             No assigned users found.
//                           </td>
//                         </tr>
//                       ) : (
//                         rows.map((u) => (
//                           <tr key={u._id} className="hover:bg-slate-50">
//                             <td className="px-4 py-3">
//                               <div className="flex items-center gap-3">
//                                 <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
//                                   {(u.name || "U").slice(0, 1).toUpperCase()}
//                                 </div>
//                                 <div>
//                                   <div className="font-medium text-slate-900">
//                                     {u.name || "—"}{" "}
//                                     <span className="text-xs text-slate-500">
//                                       ({u.id || "—"})
//                                     </span>
//                                   </div>
//                                   <div className="text-xs text-slate-500">
//                                     Username: {u.userName || "—"}
//                                   </div>
//                                 </div>
//                               </div>
//                             </td>

//                             <td className="px-4 py-3 text-slate-900">
//                               <div className="font-medium">
//                                 {u.contactNo || "—"}
//                               </div>
//                             </td>

//                             <td className="px-4 py-3">
//                               <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
//                                 {u.customerOfficerId || "—"}
//                               </span>
//                             </td>

//                             <td className="px-4 py-3 text-slate-700">
//                               {u.engagementStatus || "—"}
//                             </td>
//                             <td className="px-4 py-3 text-slate-700">
//                               {u.userLevel || "—"}
//                             </td>
//                             <td className="px-4 py-3 text-slate-700">
//                               {formatDT(u.lastActiveAt)}
//                             </td>

//                             <td className="px-4 py-3">
//                               <span
//                                 className={cx(
//                                   "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
//                                   u.status === "active"
//                                     ? "bg-emerald-50 text-emerald-700"
//                                     : "bg-slate-100 text-slate-700",
//                                 )}
//                               >
//                                 {u.status || "—"}
//                               </span>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div className="mt-5">
//                 <Pagination
//                   page={serverPage}
//                   pageSize={serverLimit}
//                   total={total}
//                   onPageChange={(p) => setQuery({ page: p })}
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
