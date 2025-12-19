// app/login/page.tsx or wherever your login page is
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginFormComponent from "@/components/shared/LoginFormComponent";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="bg-secondary p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/sbm777.png" alt="Logo" className="h-8 mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-gray-300 mt-1">Please enter your details.</p>
        </div>

        <LoginFormComponent onSuccess={() => router.push("/dashboard")} />

        <p className="text-sm text-center text-gray-300 mt-4">
          Don’t have an account?{" "}
          <Link href="/register" className="text-yellow-600 hover:underline">
            Sign up
          </Link>
        </p>

        <Link
          href={"/"}
          className="mt-6 flex items-center text-sm text-gray-300 hover:text-purple-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
