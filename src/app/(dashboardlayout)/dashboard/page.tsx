// // src/app/page.tsx
// "use client";

// import { useSidebar } from "@/context/SidebarContext";
// import LeftSidebar from "@/components/sidebar/leftsidebar";
// import ChatPanel from "@/components/sidebar/ChatPanel";
// import Hero from "@/components/home/Hero";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";

// export default function Home() {

//   const auth = useSelector((state: RootState) => state.auth);
//   const { user, isAuthenticated } = auth;
//   console.log(user)

//   if (!isAuthenticated) {
//     return <div className="text-red-500">You are not logged in.</div>;
//   }
//   const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

//   return (
//     <div className="flex flex-col sm:flex-row justify-between bg-background">
//       {/* Mobile Sidebar (only shown if open) */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 sm:hidden bg-black bg-opacity-50"
//           onClick={() => setIsSidebarOpen(false)}
//         >
//           <aside
//             className="absolute left-0 top-0 h-full w-64 bg-graybg p-2 shadow-lg animate-slideIn overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <LeftSidebar />
//           </aside>
//         </div>
//       )}

//       {/* Static Sidebar */}
//       <aside className="hidden sm:block w-full sm:w-[15%] bg-graybg p-2">
//         <LeftSidebar />
//       </aside>

//       <main className="w-full sm:w-[70%]">
//         <Hero />
//       </main>

//       <aside className="hidden sm:block w-full sm:w-[15%] p-2">
//         <ChatPanel />
//       </aside>
//     </div>
//   );
// }
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/services/actions/auth.services";

const DashboardPage = () => {
  const router = useRouter();
  const userInfo = getUserInfo();
  // console.log('dashboard:',userInfo);
  useEffect(() => {
    userInfo ?  router.push("dashboard/" + userInfo.role.toLowerCase()): router.push("/login"); // 🔁 Your target route
  }, [router]);

  return <div>...</div>;
};

export default DashboardPage;
