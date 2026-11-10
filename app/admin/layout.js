"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar/header on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F3E8]">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white px-4 shadow lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-700"
          >
            <Menu size={30} />
          </button>

          <h1 className="text-2xl font-bold text-forest">
            Sipology Spot Admin
          </h1>
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar open={open} setOpen={setOpen} />

      {/* Main Content */}
      {/* min-w-0 is required here: flex items default to min-width:auto,
          which lets them refuse to shrink below their content's natural
          width and silently overflow the page horizontally. Without this,
          any wide content inside (like the Banners list) pushes the whole
          layout wider than the viewport instead of wrapping/truncating. */}
      <main className="min-w-0 flex-1 min-h-screen overflow-x-hidden p-4 pt-20 lg:ml-64 lg:p-6 lg:pt-6">
        {children}
      </main>
    </div>
  );
}