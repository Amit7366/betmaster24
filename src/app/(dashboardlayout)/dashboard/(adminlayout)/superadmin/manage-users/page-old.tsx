"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import { Phone } from "lucide-react";
import { CallUserModal } from "@/components/modal/CallUserModal";
import { getUserInfo } from "@/services/actions/auth.services";
import Swal from "sweetalert2";

interface NormalUser {
  _id: string;
  id: string;
  user: string;
  name: string;
  email: string;
  profileImg: string;
  signupBonusGiven: boolean;
  kycVerified: boolean;
  engagementStatus: string;
  isDeleted: boolean;
  createdAt: string;
}

const NormalUsersTable = () => {
  const [users, setUsers] = useState<NormalUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const token = getFromLocalStorage("accessToken");
  const [selectedUser, setSelectedUser] = useState<NormalUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers`,
        {
          headers: { Authorization: `${token}` },
        }
      );
      const result = await res.json();
      setUsers(result.data);
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
            body: JSON.stringify({ bonusAmount: 70 }),
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
            body: JSON.stringify({
              status: "active", // 👈 use whatever your backend expects (e.g. 'active', true, etc.)
            }),
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

      // Refresh list
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
            method: "DELETE", // Assuming it's a DELETE; change to POST if your backend expects that
            headers: {
              Authorization: `${token}`,
            },
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

      // 🔄 Refresh user list after deletion
      fetchUsers();
    }
  };

  // console.log(getUserInfo().objectId);
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
            {paginated.map((user, index) => (
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
                <td className="p-3 text-blue-600">5000 BDT</td>
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
    }
  `}
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
            ))}
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
        <div className="flex gap-1">
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
      {selectedUser && (
        <CallUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          officerId={getUserInfo().objectId}
        />
      )}
    </div>
  );
};

export default NormalUsersTable;
