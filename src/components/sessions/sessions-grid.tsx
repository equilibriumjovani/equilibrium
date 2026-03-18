"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSessions } from "@/hooks/use-sessions";
import SessionCard from "./session-card";
import { generateSessionSlots } from "@/lib/utils";
import type { Client } from "@/types";
import { MONTHS_FR } from "@/lib/constants";

interface SessionsGridProps {
  client: Client;
}
interface SimpleSlot {
  sessionNumber: number;
}

export default function SessionsGrid({ client }: SessionsGridProps) {
  const today = new Date();

  const {
  sessions, loading, month, year,
  saving, deleting, navigate, saveSession, deleteSession,  // ← ajouter les deux
} = useSessions(client.id, today.getMonth() + 1, today.getFullYear());

  // Generate all session slots for this month
 const slots = useMemo<SimpleSlot[]>(() => {
  const count = client.sessions_per_week === 3 ? 12 : 16;
  return Array.from({ length: count }, (_, i) => ({
    sessionNumber: i + 1,
  }));
}, [client.sessions_per_week]);

  // Map saved sessions by session_number for quick lookup
  const savedMap = useMemo(() => {
    const map: Record<number, (typeof sessions)[0]> = {};
    sessions.forEach((s) => { map[s.session_number] = s; });
    return map;
  }, [sessions]);

  const completedCount = sessions.filter((s) => s.is_completed).length;
  const totalSlots     = slots.length;
  const progressPct    = totalSlots > 0
    ? Math.round((completedCount / totalSlots) * 100)
    : 0;

  const monthLabel = `${MONTHS_FR[month - 1]} ${year}`;
  const gridCols   = client.sessions_per_week === 3 ? 3 : 4;

  return (
    <div className="flex flex-col gap-4">

      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux clients
        </Link>
      </div>

      {/* Client info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-eq-blue flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-semibold">
              {client.full_name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {client.full_name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {client.sessions_per_week} séances / semaine · {client.phone}
            </p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[130px] text-center capitalize">
            {monthLabel}
          </span>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl font-semibold text-blue-600">
            {completedCount}
          </span>
          <span className="text-sm text-gray-400">/ {totalSlots}</span>
        </div>

        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-eq-blue rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="text-xs text-gray-400 flex-shrink-0">
          {progressPct}% complétées ce mois
        </span>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 ml-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-[10px] text-gray-400">Complétée</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-[10px] text-gray-400">Aujourd'hui</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="text-[10px] text-gray-400">À venir</span>
          </div>
        </div>
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-sm text-gray-400">Chargement des séances…</span>
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {slots.map((slot) => (
            <SessionCard
              key={slot.sessionNumber}
              slot={slot}
              saved={savedMap[slot.sessionNumber]}
              isSaving={saving === slot.sessionNumber}
              isDeleting={deleting === slot.sessionNumber}  
              onSave={saveSession}
              onDelete={deleteSession}  
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && slots.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <p className="text-sm text-gray-400">
            Aucune séance prévue pour ce mois
          </p>
        </div>
      )}
    </div>
  );
}