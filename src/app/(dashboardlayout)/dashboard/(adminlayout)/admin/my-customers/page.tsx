"use client";

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/utils/local-storage";
import { toast } from "sonner";
import { useAuth } from "@/redux/hook/useAuth";

interface AssignedUser {
  _id: string;
  id: string;
  userName: string;
  contactNo: string;
  profileImg: string;
  isDeleted: boolean;
  createdAt: string;
}

const MyAssignedUsersPage = () => {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const token = getFromLocalStorage("accessToken");
  const { user, isAuthenticated } = useAuth();
  const officerId = user?.objectId; // static for this page

  const fetchAssignedUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/customerOfficers/my-users?officerId=${officerId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      const result = await res.json();
      setUsers(result.data || []);
    } catch (error) {
      toast.error("Failed to load assigned users.");
    }
  };

  useEffect(() => {
    if (token) fetchAssignedUsers();
  }, [token]);

  const pageCount = Math.ceil(users.length / entriesPerPage);
  const paginated = users.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        My Assigned Users
      </h2>

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
              <th className="p-3">User Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created At</th>
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
                    alt={user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-3 font-semibold">{user.userName}</td>
                <td className="p-3 font-semibold">{user.contactNo}</td>
                <td className="p-3 text-blue-600">{user.id}</td>
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
                  {new Date(user.createdAt).toLocaleDateString()}
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
          {Math.min(currentPage * entriesPerPage, users.length)} of{" "}
          {users.length} entries
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
    </div>
  );
};

export default MyAssignedUsersPage;
