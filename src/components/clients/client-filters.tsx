"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { MONTHS_FR } from "@/lib/constants";
import type { ClientFilters } from "@/types";
import { cn } from "@/lib/utils";

interface ClientFiltersProps {
  filters:    ClientFilters;
  onChange:   (f: ClientFilters) => void;
  onAdd:      () => void;
  total:      number;
}

export default function ClientFiltersBar({
  filters, onChange, onAdd, total,
}: ClientFiltersProps) {
  const hasActive =
    filters.search ||
    filters.status !== "all" ||
    filters.sessions_per_week !== "all" ||
    filters.joining_month !== "all";

  function reset() {
    onChange({
      search: "", status: "all",
      sessions_per_week: "all", joining_month: "all",
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">

      {/* Search */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-eq-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
        />
        {filters.search && (
          <button onClick={() => onChange({ ...filters, search: "" })}>
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-100 hidden sm:block" />
      <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as ClientFilters["status"] })
        }
        className={cn(
          "px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-eq-blue transition-all",
          filters.status !== "all" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200"
        )}
      >
        <option value="all">Tous les statuts</option>
        <option value="paid">✅ Payé</option>
        <option value="soon">⚠️ Bientôt</option>
        <option value="late">🔴 En retard</option>
      </select>

      {/* Sessions filter */}
      <select
        value={filters.sessions_per_week}
        onChange={(e) =>
          onChange({
            ...filters,
            sessions_per_week:
              e.target.value === "all" ? "all" : (Number(e.target.value) as 3 | 4),
          })
        }
        className={cn(
          "px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-eq-blue transition-all",
          filters.sessions_per_week !== "all"
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-gray-200"
        )}
      >
        <option value="all">3 ou 4 séances</option>
        <option value="3">3 séances / sem</option>
        <option value="4">4 séances / sem</option>
      </select>

      {/* Month filter */}
      <select
        value={filters.joining_month}
        onChange={(e) =>
          onChange({
            ...filters,
            joining_month:
              e.target.value === "all" ? "all" : Number(e.target.value),
          })
        }
        className={cn(
          "px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-eq-blue transition-all",
          filters.joining_month !== "all"
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-gray-200"
        )}
      >
        <option value="all">Mois d'inscription</option>
        {MONTHS_FR.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Reset */}
      {hasActive && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      )}

      {/* Count */}
      <span className="text-xs text-gray-400 hidden lg:block">
        {total} client{total > 1 ? "s" : ""}
      </span>

      {/* Add button */}
      <button
        onClick={onAdd}
        className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-eq-blue text-sm font-semibold text-white hover:opacity-90 transition-all shadow-md shadow-blue-100"
      >
        <span className="text-lg leading-none">+</span>
        Nouveau client
      </button>
    </div>
  );
}