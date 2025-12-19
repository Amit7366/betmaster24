"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on these routes
  const hideOnRoutes = ["/", "/login", "/register", "/dashboard/user"];
  const isSuperAdminPath = pathname.startsWith("/dashboard/superadmin");
  const isAdminPath = pathname.startsWith("/dashboard/admin");

  if (hideOnRoutes.includes(pathname) || isSuperAdminPath || isAdminPath) return null;

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition fixed left-5 sm:left-[calc(50%-200px)] top-[130px] z-50"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
