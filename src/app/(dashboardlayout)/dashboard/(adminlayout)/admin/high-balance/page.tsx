"use client";

import { getFromLocalStorage } from "@/utils/local-storage";
import { useEffect, useState } from "react";

export default function HighBalanceUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = getFromLocalStorage('accessToken');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/admins/users/high-balance/allusers", {
                    headers: {
                        Authorization: token || "",
                    },
                });
                const data = await res.json();
                if (data.success) {
                    // Sort users by balance (high → low)
                    const sorted = data.data.sort(
                        (a: any, b: any) => b.currentBalance - a.currentBalance
                    );
                    setUsers(sorted);
                } else {
                    setError(data.message || "Failed to fetch data.");
                }

            } catch (err) {
                console.error(err);
                setError("Unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading)
        return (
            <p className="text-center text-gray-500 mt-10">Loading high balance users...</p>
        );

    if (error)
        return (
            <div className="p-4 mt-6 text-red-700 bg-red-100 border border-red-200 rounded-lg">
                {error}
            </div>
        );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                High Balance Users
            </h1>

            {users.length === 0 ? (
                <p className="text-gray-500">No users found.</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-100">
                    <table className="min-w-full border-collapse text-sm text-left">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-r border-blue-500">User ID</th>
                                <th className="px-4 py-3 border-r border-blue-500">Name</th>
                                <th className="px-4 py-3 border-r border-blue-500">Username</th>
                                <th className="px-4 py-3 border-r border-blue-500">Contact</th>
                                <th className="px-4 py-3 border-r border-blue-500">Total Deposit</th>
                                <th className="px-4 py-3 border-r border-blue-500">Total Withdraw</th>
                                <th className="px-4 py-3 border-r border-blue-500">Current Balance</th>
                                <th className="px-4 py-3 border-r border-blue-500">Coin Balance</th>
                                <th className="px-4 py-3 border-r border-blue-500">Referral Count</th>
                                <th className="px-4 py-3 border-r border-blue-500">Status</th>
                                <th className="px-4 py-3 border-r border-blue-500">KYC Verified</th>
                                <th className="px-4 py-3 border-r border-blue-500">User Level</th>
                                <th className="px-4 py-3 border-r border-blue-500">Signup Bonus</th>
                                <th className="px-4 py-3 border-r border-blue-500">Last Active</th>
                                <th className="px-4 py-3">Created At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u._id}
                                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-800">{u.id}</td>
                                    <td className="px-4 py-3">{u.userInfo?.name || "N/A"}</td>
                                    <td className="px-4 py-3">{u.userInfo?.userName || "N/A"}</td>
                                    <td className="px-4 py-3">{u.userInfo?.contactNo || "-"}</td>
                                    <td className="px-4 py-3 text-green-600 font-semibold">{u.totalDeposit}</td>
                                    <td className="px-4 py-3 text-red-500 font-semibold">{u.totalWithdraw}</td>
                                    <td className="px-4 py-3 text-blue-600 font-bold">{u.currentBalance.toFixed(2)}</td>
                                    <td className="px-4 py-3">{u.currentCoinBalance}</td>
                                    <td className="px-4 py-3">{u.userInfo?.refferCount}</td>
                                    <td
                                        className={`px-4 py-3 font-medium ${u.userInfo?.status === "active"
                                                ? "text-green-700"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {u.userInfo?.status}
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.userInfo?.kycVerified ? "✅ Yes" : "❌ No"}
                                    </td>
                                    <td className="px-4 py-3">{u.userInfo?.userLevel}</td>
                                    <td className="px-4 py-3">
                                        {u.userInfo?.signupBonusGiven ? "✅" : "❌"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(u.userInfo?.lastActiveAt).toLocaleString("en-BD")}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(u.createdAt).toLocaleString("en-BD")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
