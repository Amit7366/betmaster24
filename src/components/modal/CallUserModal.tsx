"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getFromLocalStorage } from "@/utils/local-storage";
import type { NormalUser } from "@/types/user"; // ← shared type

type CallUser = Pick<
  NormalUser,
  "_id" | "id" | "user" | "name" | "email" | "profileImg" | "contactNo"
>;

interface CallUserModalProps {
  user: CallUser;      // ← only what we need
  isOpen: boolean;
  onClose: () => void;
  officerId: string;
}

export const CallUserModal = ({
  user,
  isOpen,
  onClose,
  officerId,
}: CallUserModalProps) => {
  const token = getFromLocalStorage("accessToken");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCall = async () => {
    // prefer 'id', fallback to 'user'
    const userId = user.id ?? user.user;
    if (!userId) {
      toast.error("User ID missing");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admins/assign/users/${userId}/assign-officer`;
    const body = { officerId };

    await toast.promise(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ← Bearer is typical
        },
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      }),
      {
        loading: "Assigning officer...",
        success: "User assigned, initiating call...",
        error: "Failed to assign officer.",
      }
    );

    // Call: guard against missing phone
    const phone = user.contactNo ?? "";
    if (phone) window.open(`tel:${phone}`, "_blank");
    else toast.info("No phone number on this user.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg relative p-6 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
        >
          ✖
        </button>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.profileImg || "/avatar.png"}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-blue-500">User ID: {user.id ?? user.user}</p>
          </div>
        </div>

        <hr className="my-4" />

        <button
          onClick={handleCall}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
        >
          📞 Call Now
        </button>
      </div>
    </div>
  );
};
