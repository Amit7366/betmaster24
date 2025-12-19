// app/register/page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RegisterFormContent from "@/components/shared/RegisterFormContent";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="bg-secondary p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image src="/sbm777.png" alt="Logo" width={120} height={40} className="h-8 mb-2" />
          <h2 className="text-2xl font-bold text-white">Registration</h2>
          <p className="text-sm text-white mt-1">
            Welcome! Please enter your details.
          </p>
        </div>

        <RegisterFormContent />

        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center text-sm text-accent hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
