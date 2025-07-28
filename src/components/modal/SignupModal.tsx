// components/modal/RegisterModal.tsx
"use client";

import { X } from "lucide-react";
import Image from "next/image";
import RegisterFormContent from "../shared/RegisterFormContent";

export default function RegisterModal({
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
          <Image src="/sbm777.png" alt="Logo" width={120} height={40} />
          <h2 className="text-2xl font-bold text-white">Create an Account</h2>
          <p className="text-sm text-accent mt-1">Please enter your details.</p>
        </div>

        <RegisterFormContent onSuccess={onClose} />
      </div>
    </div>
  );
}
