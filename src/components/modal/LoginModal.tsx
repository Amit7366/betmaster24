// components/modal/LoginModal.tsx
"use client";

import { X } from "lucide-react";
import LoginFormComponent from "../shared/LoginFormComponent";

export default function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center px-4">
      <div className="bg-secondary p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-red-500"
        >
          <X />
        </button>

        <div className="flex flex-col items-center mb-4">
          <img src="/sbm777.png" alt="Logo" className="h-8 mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-gray-300 mt-1">
            Please enter your details.
          </p>
        </div>

        <LoginFormComponent onSuccess={onClose} />
      </div>
    </div>
  );
}
