"use client";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { Bell } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface TopBarProps {
  user: User;
}
const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/clients":   "Clients",
  "/factures":  "Factures",
};

export default function TopBar({ user }: TopBarProps) {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const initials = user.email?.slice(0, 2).toUpperCase() ?? "OW";
  const pathname  = usePathname();
const baseRoute = "/" + pathname.split("/")[1];
const title     = pageTitles[baseRoute] ?? "Equilibrium";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900 capitalize">
          Tableau de bord
        </h1>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="w-9 h-9 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-eq-blue flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700 leading-none">
              Propriétaire
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[140px]">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}