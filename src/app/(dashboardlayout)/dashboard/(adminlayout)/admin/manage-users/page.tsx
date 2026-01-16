"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { CallUserModal } from "@/components/modal/CallUserModal";
import { getUserInfo } from "@/services/actions/auth.services";
import Swal from "sweetalert2";
import { Search, X } from "lucide-react";

interface BalanceSheet {
  _id: string;
  userId: string;
  id: string;
  totalDeposit: number;
  totalWithdraw: number;
  currentBalance: number;
  currentCoinBalance: number;
  totalCoinDeposit: number;
  totalCoinWithdraw: number;
  lockedBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface Promotion {
  _id: string;
  userId: string;
  bonusRate: number;
  bonusReceived: number;
  createdAt: string;
  eligibleGames: string[];
  lastUsedAt: string | null;
  maxBonusCap: number | null;
  maxWithdrawLimit: number | null;
  minDeposit: number;
  promoCode: string;
  promoIsLocked: boolean;
  refundTrigger: boolean;
  selectedPromoCode: string;
  turnoverX: number;
  updatedAt: string;
  usageType: "once" | "multi";
  usedOnce: boolean;
}

interface NormalUser {
  _id: string;
  id: string; // invoice-like id (e.g., sbm47415)
  user: string; // objectId
  name: string;
  email: string;
  profileImg: string;
  signupBonusGiven: boolean;
  kycVerified: boolean;
  engagementStatus: string;
  isDeleted: boolean;
  createdAt: string;
  contactNo?: string;
  balanceSheet?: BalanceSheet;
  promotion?: Promotion;
}

const NormalUsersTable = () => {
  const [users, setUsers] = useState<NormalUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const token = getFromLocalStorage("accessToken");

  const [selectedUser, setSelectedUser] = useState<NormalUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Details modal state
  const [detailUser, setDetailUser] = useState<NormalUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers`,
        { headers: { Authorization: `${token}` } }
      );
      const result = await res.json();
      setUsers(result.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const openModal = (user: NormalUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const openDetails = (user: NormalUser) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };
  const closeDetails = () => {
    setDetailUser(null);
    setIsDetailOpen(false);
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // UX: reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, searchTerm]);

  const pageCount = Math.ceil(filtered.length / entriesPerPage);

  const paginated = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
  }, [filtered, currentPage, entriesPerPage]);

  const handleGiveSignupBonus = async (userId: string) => {
    const token = getFromLocalStorage("accessToken");
    const result = await Swal.fire({
      title: "Give signup bonus?",
      text: "You are about to give signup bonus to this user.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, give bonus",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/users/${userId}/give-signup-bonus`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({ bonusAmount: 50 }),
          }
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to give bonus");
          return res.json();
        }),
        {
          loading: "Giving signup bonus...",
          success: "Signup bonus given successfully!",
          error: "Failed to give signup bonus.",
        }
      );
      fetchUsers();
    }
  };

  const handleActivateAccount = async (userId: string) => {
    const token = getFromLocalStorage("accessToken");
    const result = await Swal.fire({
      title: "Activate Account?",
      text: "This will mark the user account as active.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, activate",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/users/${userId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({ status: "active" }),
          }
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to activate user");
          return res.json();
        }),
        {
          loading: "Activating user...",
          success: "User account activated!",
          error: "Failed to activate user.",
        }
      );
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const token = getFromLocalStorage("accessToken");
    const result = await Swal.fire({
      title: "Delete user?",
      text: "This will delete the user account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#0f172a",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${userId}`,
          {
            method: "DELETE",
            headers: { Authorization: `${token}` },
          }
        ).then((res) => {
          if (!res.ok) throw new Error("Failed to delete user");
          return res.json();
        }),
        {
          loading: "Deleting user...",
          success: "User deleted successfully!",
          error: "Failed to delete user.",
        }
      );
      fetchUsers();
    }
  };

  return (
    <section className="min-h-screen bg-slate-50/70 py-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-900">Normal Users</h1>
          <p className="text-sm text-slate-500">
            Search users, view balances, and manage bonus / details.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            {/* Left */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {[20, 40, 60].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-600">entries</span>
            </div>

            {/* Right (search) */}
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              />
              {!!searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">S.L</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {paginated.map((user, index) => {
                  const currentBalance = user.balanceSheet?.currentBalance ?? 0;

                  return (
                    <tr
                      key={user._id}
                      className="bg-white hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 text-slate-600">
                        {(currentPage - 1) * entriesPerPage + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-slate-200 bg-slate-100">
                            {user.profileImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.profileImg}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-[160px]">
                            <div className="font-semibold text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.email || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {user.id}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">
                          {currentBalance.toFixed(2)}{" "}
                          <span className="text-slate-500">BDT</span>
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                            user.isDeleted
                              ? "bg-rose-50 text-rose-700 ring-rose-100"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-100",
                          ].join(" ")}
                        >
                          {user.isDeleted ? "Deleted" : "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {/* Book for call kept commented like your original */}
                          {/* <button
                            disabled={user?.engagementStatus === "booked"}
                            onClick={() => openModal(user)}
                            className={`h-9 rounded-xl px-3 text-xs font-semibold text-white transition
                              ${
                                user?.engagementStatus === "booked"
                                  ? "bg-slate-300 cursor-not-allowed"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                          >
                            Book For Call
                          </button> */}

                          {/* <button
                            disabled={user?.signupBonusGiven}
                            onClick={() => handleGiveSignupBonus(user.user)}
                            className={[
                              "h-9 rounded-xl px-3 text-xs font-semibold text-white transition",
                              user?.signupBonusGiven
                                ? "bg-slate-300 cursor-not-allowed"
                                : "bg-slate-900 hover:bg-slate-800",
                            ].join(" ")}
                          >
                            Give Signup Bonus
                          </button> */}

                          <button
                            onClick={() => openDetails(user)}
                            className="h-9 rounded-xl px-3 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition"
                          >
                            View Details
                          </button>

                          {/* Optional actions kept commented as in your original */}
                          {/* <button
                            onClick={() => handleActivateAccount(user.user)}
                            className="h-9 rounded-xl px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                          >
                            Activate
                          </button> */}
                          {/* <button
                            onClick={() => handleDeleteUser(user.user)}
                            className="h-9 rounded-xl px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition"
                          >
                            Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="text-sm font-semibold text-slate-800">
                        No users found
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Try a different search term.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(currentPage - 1) * entriesPerPage + (filtered.length ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * entriesPerPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>{" "}
              entries
            </p>

            <div className="flex flex-wrap gap-1">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={[
                    "h-9 min-w-[36px] rounded-xl border px-3 text-xs font-semibold transition",
                    currentPage === i + 1
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Call modal */}
        {selectedUser && (
          <CallUserModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={closeModal}
            officerId={getUserInfo().objectId}
          />
        )}

        {/* Details Modal */}
        {isDetailOpen && detailUser && (
          <DetailsModal user={detailUser} onClose={closeDetails} />
        )}
      </div>
    </section>
  );
};

export default NormalUsersTable;

/** ---------------------------
 * Details Modal (Modern UI)
 * --------------------------*/
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="sm:col-span-2 text-sm font-semibold text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-slate-800">{title}</h4>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function DetailsModal({
  user,
  onClose,
}: {
  user: NormalUser;
  onClose: () => void;
}) {
  const bs = user.balanceSheet;
  const p = user.promotion;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-center p-3 sm:p-6">
        <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-black/10">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                User Details — {user.name}
              </h3>
              <p className="text-xs text-slate-500">
                {user.id} • {user.isDeleted ? "Deleted" : "Active"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Close
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Section title="Basic Information">
                <Row label="User ObjectId" value={user.user} />
                <Row label="Public ID" value={user.id} />
                <Row label="Name" value={user.name} />
                <Row label="Email" value={user.email || "—"} />
                <Row label="Contact No" value={user.contactNo || "—"} />
                <Row label="Engagement" value={user.engagementStatus || "—"} />
                <Row label="KYC Verified" value={user.kycVerified ? "Yes" : "No"} />
                <Row
                  label="Signup Bonus Given"
                  value={user.signupBonusGiven ? "Yes" : "No"}
                />
                <Row label="Status" value={user.isDeleted ? "Deleted" : "Active"} />
                <Row
                  label="Created At"
                  value={
                    user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"
                  }
                />
                <Row
                  label="Avatar"
                  value={
                    user.profileImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profileImg}
                        alt={user.name}
                        className="h-10 w-10 rounded-full ring-1 ring-slate-200 object-cover"
                      />
                    ) : (
                      "—"
                    )
                  }
                />
              </Section>

              <Section title="Balance Sheet">
                <Row
                  label="Current Balance"
                  value={`${(bs?.currentBalance ?? 0).toFixed(2)} BDT`}
                />
                <Row
                  label="Locked Balance"
                  value={`${(bs?.lockedBalance ?? 0).toFixed(2)} BDT`}
                />
                <Row label="Total Deposit" value={`${bs?.totalDeposit ?? 0} BDT`} />
                <Row label="Total Withdraw" value={`${bs?.totalWithdraw ?? 0} BDT`} />
                <Row label="Current Coin Balance" value={bs?.currentCoinBalance ?? 0} />
                <Row label="Total Coin Deposit" value={bs?.totalCoinDeposit ?? 0} />
                <Row label="Total Coin Withdraw" value={bs?.totalCoinWithdraw ?? 0} />
                <Row
                  label="Last Updated"
                  value={bs?.updatedAt ? new Date(bs.updatedAt).toLocaleString() : "—"}
                />
              </Section>

              <div className="lg:col-span-2">
                <Section title="Promotion">
                  <Row label="Promo Code" value={p?.promoCode ?? "—"} />
                  <Row label="Selected Code" value={p?.selectedPromoCode ?? "—"} />
                  <Row label="Usage Type" value={p?.usageType ?? "—"} />
                  <Row label="Promo Locked" value={p?.promoIsLocked ? "Yes" : "No"} />
                  <Row label="Bonus Rate" value={p ? `${p.bonusRate * 100}%` : "—"} />
                  <Row label="Turnover (x)" value={p?.turnoverX ?? "—"} />
                  <Row label="Min Deposit" value={p?.minDeposit ?? "—"} />
                  <Row label="Max Bonus Cap" value={p?.maxBonusCap ?? "—"} />
                  <Row label="Max Withdraw Limit" value={p?.maxWithdrawLimit ?? "—"} />
                  <Row label="Bonus Received" value={p?.bonusReceived ?? 0} />
                  <Row
                    label="Eligible Games"
                    value={p?.eligibleGames?.length ? p.eligibleGames.join(", ") : "—"}
                  />
                  <Row label="Refund Trigger" value={p?.refundTrigger ? "Yes" : "No"} />
                  <Row label="Used Once" value={p?.usedOnce ? "Yes" : "No"} />
                  <Row
                    label="Last Used At"
                    value={p?.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : "—"}
                  />
                  <Row
                    label="Created At"
                    value={p?.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                  />
                  <Row
                    label="Updated At"
                    value={p?.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                  />
                </Section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white px-5 py-4 text-xs text-slate-500">
            Tip: Keep this modal for admin view only. Sensitive data should be
            role-protected.
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { getFromLocalStorage } from "@/utils/local-storage";
// import { Phone } from "lucide-react";
// import { CallUserModal } from "@/components/modal/CallUserModal";
// import { getUserInfo } from "@/services/actions/auth.services";
// import Swal from "sweetalert2";

// interface BalanceSheet {
//   _id: string;
//   userId: string;
//   id: string;
//   totalDeposit: number;
//   totalWithdraw: number;
//   currentBalance: number;
//   currentCoinBalance: number;
//   totalCoinDeposit: number;
//   totalCoinWithdraw: number;
//   lockedBalance: number;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Promotion {
//   _id: string;
//   userId: string;
//   bonusRate: number;
//   bonusReceived: number;
//   createdAt: string;
//   eligibleGames: string[];
//   lastUsedAt: string | null;
//   maxBonusCap: number | null;
//   maxWithdrawLimit: number | null;
//   minDeposit: number;
//   promoCode: string;
//   promoIsLocked: boolean;
//   refundTrigger: boolean;
//   selectedPromoCode: string;
//   turnoverX: number;
//   updatedAt: string;
//   usageType: "once" | "multi";
//   usedOnce: boolean;
// }

// interface NormalUser {
//   _id: string;
//   id: string; // invoice-like id (e.g., sbm47415)
//   user: string; // objectId
//   name: string;
//   email: string;
//   profileImg: string;
//   signupBonusGiven: boolean;
//   kycVerified: boolean;
//   engagementStatus: string;
//   isDeleted: boolean;
//   createdAt: string;
//   contactNo?: string;
//   balanceSheet?: BalanceSheet;
//   promotion?: Promotion;
// }

// const NormalUsersTable = () => {
//   const [users, setUsers] = useState<NormalUser[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(20);
//   const [currentPage, setCurrentPage] = useState(1);
//   const token = getFromLocalStorage("accessToken");
//   const [selectedUser, setSelectedUser] = useState<NormalUser | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // NEW: details modal state
//   const [detailUser, setDetailUser] = useState<NormalUser | null>(null);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers`,
//         { headers: { Authorization: `${token}` } }
//       );
//       const result = await res.json();
//       setUsers(result.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load users");
//     }
//   };

//   const openModal = (user: NormalUser) => {
//     setSelectedUser(user);
//     setIsModalOpen(true);
//   };
//   const closeModal = () => {
//     setSelectedUser(null);
//     setIsModalOpen(false);
//   };

//   // NEW: open/close details modal
//   const openDetails = (user: NormalUser) => {
//     setDetailUser(user);
//     setIsDetailOpen(true);
//   };
//   const closeDetails = () => {
//     setDetailUser(null);
//     setIsDetailOpen(false);
//   };

//   useEffect(() => {
//     if (token) fetchUsers();
//   }, [token]);

//   const filtered = users.filter((user) =>
//     user.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const pageCount = Math.ceil(filtered.length / entriesPerPage);
//   const paginated = filtered.slice(
//     (currentPage - 1) * entriesPerPage,
//     currentPage * entriesPerPage
//   );

//   const handleGiveSignupBonus = async (userId: string) => {
//     const token = getFromLocalStorage("accessToken");
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You are about to give 70 BDT as signup bonus.",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, give bonus",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       await toast.promise(
//         fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/users/${userId}/give-signup-bonus`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `${token}`,
//             },
//             body: JSON.stringify({ bonusAmount: 50 }),
//           }
//         ).then((res) => {
//           if (!res.ok) throw new Error("Failed to give bonus");
//           return res.json();
//         }),
//         {
//           loading: "Giving signup bonus...",
//           success: "Signup bonus given successfully!",
//           error: "Failed to give signup bonus.",
//         }
//       );
//       // Optional: refresh the list if the server returns updated flag
//       fetchUsers();
//     }
//   };

//   const handleActivateAccount = async (userId: string) => {
//     const token = getFromLocalStorage("accessToken");
//     const result = await Swal.fire({
//       title: "Activate Account?",
//       text: "This will mark the user account as active.",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#16a34a",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, activate",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       await toast.promise(
//         fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/users/${userId}/status`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `${token}`,
//             },
//             body: JSON.stringify({ status: "active" }),
//           }
//         ).then((res) => {
//           if (!res.ok) throw new Error("Failed to activate user");
//           return res.json();
//         }),
//         {
//           loading: "Activating user...",
//           success: "User account activated!",
//           error: "Failed to activate user.",
//         }
//       );
//       fetchUsers();
//     }
//   };

//   const handleDeleteUser = async (userId: string) => {
//     const token = getFromLocalStorage("accessToken");
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "This will delete the user account.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       await toast.promise(
//         fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${userId}`,
//           {
//             method: "DELETE",
//             headers: { Authorization: `${token}` },
//           }
//         ).then((res) => {
//           if (!res.ok) throw new Error("Failed to delete user");
//           return res.json();
//         }),
//         {
//           loading: "Deleting user...",
//           success: "User deleted successfully!",
//           error: "Failed to delete user.",
//         }
//       );
//       fetchUsers();
//     }
//   };

//   return (
//     <div className="p-6">
//       {/* Controls */}
//       <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
//         <div className="flex items-center gap-2">
//           <label className="text-sm">Show</label>
//           <select
//             value={entriesPerPage}
//             onChange={(e) => setEntriesPerPage(Number(e.target.value))}
//             className="border px-2 py-1 rounded text-sm"
//           >
//             {[20, 40, 60].map((n) => (
//               <option key={n}>{n}</option>
//             ))}
//           </select>
//           <span className="text-sm">entries</span>
//         </div>
//         <input
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search by name..."
//           className="border px-3 py-2 rounded w-full md:w-64 text-sm"
//         />
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm text-left border border-gray-200">
//           <thead className="bg-gray-100 text-gray-700 font-medium">
//             <tr>
//               <th className="p-3 text-xs">S.L</th>
//               {/* <th className="p-3">Avatar</th> */}
//               <th className="p-3 text-xs">Name</th>
//               {/* <th className="p-3">Email</th> */}
//               <th className="p-3 text-xs">User ID</th>
//               <th className="p-3 text-xs">Balance</th>
//               <th className="p-3 text-xs">Status</th>
//               <th className="p-3 text-xs">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginated.map((user, index) => {
//               const currentBalance = user.balanceSheet?.currentBalance ?? 0;
//               const coin = user.balanceSheet?.currentCoinBalance ?? 0;

//               return (
//                 <tr key={user._id} className="border-t bg-white text-xs">
//                   <td className="p-2">
//                     {(currentPage - 1) * entriesPerPage + index + 1}
//                   </td>
//                   {/* <td className="p-3">
//                     <img
//                       src={user.profileImg || "/avatar.png"}
//                       alt={user.name}
//                       className="w-10 h-10 rounded-full"
//                     />
//                   </td> */}
//                   <td className="p-2 font-semibold">{user.name}</td>
//                   {/* <td className="p-3">{user.email}</td> */}
//                   <td className="p-2 text-blue-600">{user.id }</td>

//                   {/* Dynamic balance */}
//                   <td className="p-2">
//                     <div className="flex items-center gap-2">
//                       <span className="text-blue-600">
//                         {currentBalance.toFixed(2)} BDT
//                       </span>
//                       {/* <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-600">
//                         Coins: {coin}
//                       </span> */}
//                     </div>
//                   </td>

//                   <td className="p-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         user.isDeleted
//                           ? "bg-red-100 text-red-600"
//                           : "bg-green-100 text-green-600"
//                       }`}
//                     >
//                       {user.isDeleted ? "Deleted" : "Active"}
//                     </span>
//                   </td>
//                   {/* <td className="p-3 text-gray-600">
//                     {user?.createdAt
//                       ? new Date(user.createdAt).toLocaleDateString()
//                       : "-"}
//                   </td> */}
//                   <td className="flex items-center gap-2 py-2">
//                     {/* <button
//                       disabled={user?.engagementStatus === "booked"}
//                       onClick={() => openModal(user)}
//                       className={`text-xs text-white px-3 py-2 rounded-md flex items-center gap-2 transition
//                         ${
//                           user?.engagementStatus === "booked"
//                             ? "bg-gray-400 cursor-not-allowed"
//                             : "bg-green-500 hover:bg-green-600 cursor-pointer"
//                         }`}
//                     >
//                       Book For Call
//                       <Phone className="w-3 h-3" />
//                     </button> */}

//                     <button
//                       disabled={user?.signupBonusGiven}
//                       onClick={() => handleGiveSignupBonus(user.user)}
//                       className={`text-xs text-white px-3 py-2 rounded-md transition ${
//                         user?.signupBonusGiven
//                           ? "bg-gray-400 cursor-not-allowed"
//                           : "bg-blue-500 hover:bg-blue-600"
//                       }`}
//                     >
//                       Give Signup Bonus
//                     </button>

//                     {/* NEW: View Details */}
//                     <button
//                       onClick={() => openDetails(user)}
//                       className="text-xs text-white px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition"
//                     >
//                       View Details
//                     </button>

//                     {/* Optional actions kept commented as in your original */}
//                     {/* <button
//                       onClick={() => handleActivateAccount(user.user)}
//                       className="text-xs text-white px-3 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 transition"
//                     >
//                       Active Account
//                     </button> */}
//                     {/* <button
//                       onClick={() => handleDeleteUser(user.user)}
//                       className="text-xs text-white px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 transition"
//                     >
//                       Delete
//                     </button> */}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4 text-sm">
//         <p>
//           Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
//           {Math.min(currentPage * entriesPerPage, filtered.length)} of{" "}
//           {filtered.length} entries
//         </p>
//         <div className="flex flex-wrap gap-1">
//           {Array.from({ length: pageCount }, (_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`px-3 py-1 border rounded ${
//                 currentPage === i + 1 ? "bg-blue-600 text-white" : ""
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Existing Call modal */}
//       {selectedUser && (
//         <CallUserModal
//           user={selectedUser}
//           isOpen={isModalOpen}
//           onClose={closeModal}
//           officerId={getUserInfo().objectId}
//         />
//       )}

//       {/* NEW: Details Modal */}
//       {isDetailOpen && detailUser && (
//         <DetailsModal user={detailUser} onClose={closeDetails} />
//       )}
//     </div>
//   );
// };

// export default NormalUsersTable;

// /** ---------------------------
//  * Inline Details Modal
//  * --------------------------*/
// function Row({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="grid grid-cols-3 gap-2 py-1">
//       <div className="text-gray-400">{label}</div>
//       <div className="col-span-2 font-medium break-words">{value}</div>
//     </div>
//   );
// }

// function Section({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-gray-50 rounded-lg p-4 border">
//       <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
//       <div className="space-y-1">{children}</div>
//     </div>
//   );
// }

// function DetailsModal({
//   user,
//   onClose,
// }: {
//   user: NormalUser;
//   onClose: () => void;
// }) {
//   const bs = user.balanceSheet;
//   const p = user.promotion;

//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden h-screen overflow-y-auto">
//         <div className="flex items-center justify-between px-6 py-4 border-b">
//           <h3 className="text-lg font-semibold">User Details — {user.name}</h3>
//           <button
//             onClick={onClose}
//             className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
//           >
//             Close
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Basic Info */}
//           <Section title="Basic Information">
//             <Row label="User ObjectId" value={user.user} />
//             <Row label="Public ID" value={user.id} />
//             <Row label="Name" value={user.name} />
//             <Row label="Email" value={user.email || "-"} />
//             <Row label="Contact No" value={user.contactNo || "-"} />
//             <Row label="Engagement" value={user.engagementStatus} />
//             <Row label="KYC Verified" value={user.kycVerified ? "Yes" : "No"} />
//             <Row
//               label="Signup Bonus Given"
//               value={user.signupBonusGiven ? "Yes" : "No"}
//             />
//             <Row label="Status" value={user.isDeleted ? "Deleted" : "Active"} />
//             <Row
//               label="Created At"
//               value={
//                 user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"
//               }
//             />
//             <Row
//               label="Avatar"
//               value={
//                 user.profileImg ? (
//                   <img
//                     src={user.profileImg}
//                     alt={user.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                 ) : (
//                   "—"
//                 )
//               }
//             />
//           </Section>

//           {/* Balance Sheet */}
//           <Section title="Balance Sheet">
//             <Row
//               label="Current Balance"
//               value={`${bs?.currentBalance ?? 0} BDT`}
//             />
//             <Row
//               label="Locked Balance"
//               value={`${bs?.lockedBalance ?? 0} BDT`}
//             />
//             <Row label="Total Deposit" value={`${bs?.totalDeposit ?? 0} BDT`} />
//             <Row
//               label="Total Withdraw"
//               value={`${bs?.totalWithdraw ?? 0} BDT`}
//             />
//             <Row
//               label="Current Coin Balance"
//               value={bs?.currentCoinBalance ?? 0}
//             />
//             <Row label="Total Coin Deposit" value={bs?.totalCoinDeposit ?? 0} />
//             <Row
//               label="Total Coin Withdraw"
//               value={bs?.totalCoinWithdraw ?? 0}
//             />
//             <Row
//               label="Last Updated"
//               value={
//                 bs?.updatedAt ? new Date(bs.updatedAt).toLocaleString() : "-"
//               }
//             />
//           </Section>

//           {/* Promotion */}
//           <Section title="Promotion">
//             <Row label="Promo Code" value={p?.promoCode ?? "-"} />
//             <Row label="Selected Code" value={p?.selectedPromoCode ?? "-"} />
//             <Row label="Usage Type" value={p?.usageType ?? "-"} />
//             <Row label="Promo Locked" value={p?.promoIsLocked ? "Yes" : "No"} />
//             <Row label="Bonus Rate" value={p ? `${p.bonusRate * 100}%` : "-"} />
//             <Row label="Turnover (x)" value={p?.turnoverX ?? "-"} />
//             <Row label="Min Deposit" value={p?.minDeposit ?? "-"} />
//             <Row label="Max Bonus Cap" value={p?.maxBonusCap ?? "-"} />
//             <Row
//               label="Max Withdraw Limit"
//               value={p?.maxWithdrawLimit ?? "-"}
//             />
//             <Row label="Bonus Received" value={p?.bonusReceived ?? 0} />
//             <Row
//               label="Eligible Games"
//               value={
//                 p?.eligibleGames?.length ? p.eligibleGames.join(", ") : "-"
//               }
//             />
//             <Row
//               label="Refund Trigger"
//               value={p?.refundTrigger ? "Yes" : "No"}
//             />
//             <Row label="Used Once" value={p?.usedOnce ? "Yes" : "No"} />
//             <Row
//               label="Last Used At"
//               value={
//                 p?.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : "-"
//               }
//             />
//             <Row
//               label="Created At"
//               value={
//                 p?.createdAt ? new Date(p.createdAt).toLocaleString() : "-"
//               }
//             />
//             <Row
//               label="Updated At"
//               value={
//                 p?.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"
//               }
//             />
//           </Section>
//         </div>
//       </div>
//     </div>
//   );
// }
