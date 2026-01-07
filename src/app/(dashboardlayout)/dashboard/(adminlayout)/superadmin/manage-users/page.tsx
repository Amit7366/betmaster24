"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { Phone } from "lucide-react";
import { CallUserModal } from "@/components/modal/CallUserModal";
import { getUserInfo } from "@/services/actions/auth.services";
import Swal from "sweetalert2";

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
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const token = getFromLocalStorage("accessToken");
  const [selectedUser, setSelectedUser] = useState<NormalUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW: details modal state
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

  // NEW: open/close details modal
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

  const filtered = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleGiveSignupBonus = async (userId: string) => {
    const token = getFromLocalStorage("accessToken");
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to give 70 BDT as signup bonus.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
      // Optional: refresh the list if the server returns updated flag
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
      cancelButtonColor: "#d33",
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
      title: "Are you sure?",
      text: "This will delete the user account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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
    <div className="p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border px-2 py-1 rounded text-sm"
          >
            {[5, 10, 15].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm">entries</span>
        </div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="border px-3 py-2 rounded w-full md:w-64 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="p-3">S.L</th>
              <th className="p-3">Avatar</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, index) => {
              const currentBalance = user.balanceSheet?.currentBalance ?? 0;
              const coin = user.balanceSheet?.currentCoinBalance ?? 0;

              return (
                <tr key={user._id} className="border-t bg-white">
                  <td className="p-3">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="p-3">
                    <img
                      src={user.profileImg || "/avatar.png"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </td>
                  <td className="p-3 font-semibold">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-blue-600">{user.id}</td>

                  {/* Dynamic balance */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">
                        {currentBalance.toFixed(2)} BDT
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-600">
                        Coins: {coin}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isDeleted
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {user.isDeleted ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="flex items-center gap-2 py-4">
                    <button
                      disabled={user?.engagementStatus === "booked"}
                      onClick={() => openModal(user)}
                      className={`text-xs text-white px-3 py-2 rounded-md flex items-center gap-2 transition
                        ${
                          user?.engagementStatus === "booked"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 cursor-pointer"
                        }`}
                    >
                      Book For Call
                      <Phone className="w-3 h-3" />
                    </button>

                    <button
                      disabled={user?.signupBonusGiven}
                      onClick={() => handleGiveSignupBonus(user.user)}
                      className={`text-xs text-white px-3 py-2 rounded-md transition ${
                        user?.signupBonusGiven
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Give Signup Bonus
                    </button>

                    {/* NEW: View Details */}
                    <button
                      onClick={() => openDetails(user)}
                      className="text-xs text-white px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition"
                    >
                      View Details
                    </button>

                    {/* Optional actions kept commented as in your original */}
                    {/* <button
                      onClick={() => handleActivateAccount(user.user)}
                      className="text-xs text-white px-3 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 transition"
                    >
                      Active Account
                    </button> */}
                    {/* <button
                      onClick={() => handleDeleteUser(user.user)}
                      className="text-xs text-white px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 transition"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <p>
          Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
          {Math.min(currentPage * entriesPerPage, filtered.length)} of{" "}
          {filtered.length} entries
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
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

      {/* NEW: Details Modal */}
      {isDetailOpen && detailUser && (
        <DetailsModal user={detailUser} onClose={closeDetails} />
      )}
    </div>
  );
};

export default NormalUsersTable;

/** ---------------------------
 * Inline Details Modal
 * --------------------------*/
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1">
      <div className="text-gray-400">{label}</div>
      <div className="col-span-2 font-medium break-words">{value}</div>
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
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="space-y-1">{children}</div>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">User Details — {user.name}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information">
            <Row label="User ObjectId" value={user.user} />
            <Row label="Public ID" value={user.id} />
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email || "-"} />
            <Row label="Contact No" value={user.contactNo || "-"} />
            <Row label="Engagement" value={user.engagementStatus} />
            <Row label="KYC Verified" value={user.kycVerified ? "Yes" : "No"} />
            <Row
              label="Signup Bonus Given"
              value={user.signupBonusGiven ? "Yes" : "No"}
            />
            <Row label="Status" value={user.isDeleted ? "Deleted" : "Active"} />
            <Row
              label="Created At"
              value={
                user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"
              }
            />
            <Row
              label="Avatar"
              value={
                user.profileImg ? (
                  <img
                    src={user.profileImg}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  "—"
                )
              }
            />
          </Section>

          {/* Balance Sheet */}
          <Section title="Balance Sheet">
            <Row
              label="Current Balance"
              value={`${bs?.currentBalance ?? 0} BDT`}
            />
            <Row
              label="Locked Balance"
              value={`${bs?.lockedBalance ?? 0} BDT`}
            />
            <Row label="Total Deposit" value={`${bs?.totalDeposit ?? 0} BDT`} />
            <Row
              label="Total Withdraw"
              value={`${bs?.totalWithdraw ?? 0} BDT`}
            />
            <Row
              label="Current Coin Balance"
              value={bs?.currentCoinBalance ?? 0}
            />
            <Row label="Total Coin Deposit" value={bs?.totalCoinDeposit ?? 0} />
            <Row
              label="Total Coin Withdraw"
              value={bs?.totalCoinWithdraw ?? 0}
            />
            <Row
              label="Last Updated"
              value={
                bs?.updatedAt ? new Date(bs.updatedAt).toLocaleString() : "-"
              }
            />
          </Section>

          {/* Promotion */}
          <Section title="Promotion">
            <Row label="Promo Code" value={p?.promoCode ?? "-"} />
            <Row label="Selected Code" value={p?.selectedPromoCode ?? "-"} />
            <Row label="Usage Type" value={p?.usageType ?? "-"} />
            <Row label="Promo Locked" value={p?.promoIsLocked ? "Yes" : "No"} />
            <Row label="Bonus Rate" value={p ? `${p.bonusRate * 100}%` : "-"} />
            <Row label="Turnover (x)" value={p?.turnoverX ?? "-"} />
            <Row label="Min Deposit" value={p?.minDeposit ?? "-"} />
            <Row label="Max Bonus Cap" value={p?.maxBonusCap ?? "-"} />
            <Row
              label="Max Withdraw Limit"
              value={p?.maxWithdrawLimit ?? "-"}
            />
            <Row label="Bonus Received" value={p?.bonusReceived ?? 0} />
            <Row
              label="Eligible Games"
              value={
                p?.eligibleGames?.length ? p.eligibleGames.join(", ") : "-"
              }
            />
            <Row
              label="Refund Trigger"
              value={p?.refundTrigger ? "Yes" : "No"}
            />
            <Row label="Used Once" value={p?.usedOnce ? "Yes" : "No"} />
            <Row
              label="Last Used At"
              value={
                p?.lastUsedAt ? new Date(p.lastUsedAt).toLocaleString() : "-"
              }
            />
            <Row
              label="Created At"
              value={
                p?.createdAt ? new Date(p.createdAt).toLocaleString() : "-"
              }
            />
            <Row
              label="Updated At"
              value={
                p?.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"
              }
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
