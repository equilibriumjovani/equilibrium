"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Dumbbell, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/clients",   label: "Clients",    icon: Users },
  { href: "/factures",  label: "Factures",   icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm">
    <Image
      src="/logo.png"
      alt="Equilibrium Center"
      width={40}
      height={40}
      className="object-contain w-full h-full"
    />
  </div>
  <div>
    <p className="text-sm font-semibold text-gray-900 leading-none">
      Equilibrium
    </p>
    <p className="text-[10px] text-gray-400 mt-0.5">Center · YSN</p>
  </div>
</div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-eq-blue-light text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-blue-600" : "text-gray-400"
                )}
              />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}