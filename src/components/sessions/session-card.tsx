"use client";

import { useState, useEffect } from "react";
import { Check, Save, Loader2, Trash2 } from "lucide-react";
import type { Session } from "@/types";
import { cn } from "@/lib/utils";

// Type local simplifié — plus besoin de date pré-calculée
interface SimpleSlot {
  sessionNumber: number;
}

interface SessionCardProps {
  slot:        SimpleSlot;
  saved?:      Session;
  isSaving:    boolean;
  isDeleting:  boolean;
  onSave:      (sessionNumber: number, date: string, description: string) => void;
  onDelete:    (sessionId: string, sessionNumber: number) => void;
}

export default function SessionCard({
  slot, saved, isSaving, isDeleting, onSave, onDelete,
}: SessionCardProps) {
  const isDone = !!saved?.is_completed;

  const [date,        setDate]        = useState(saved?.session_date ?? "");
  const [description, setDescription] = useState(saved?.description  ?? "");

  useEffect(() => {
    setDate(saved?.session_date ?? "");
    setDescription(saved?.description ?? "");
  }, [saved]);

  function handleSave() {
    if (!date) return;
    onSave(slot.sessionNumber, date, description);
  }

  return (
    <div className={cn(
      "relative flex flex-col gap-3 p-4 rounded-2xl border-[1.5px] transition-all duration-200",
      isDone
        ? "bg-green-50 border-green-200"
        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
    )}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isDone ? "text-green-600" : "text-gray-400"
        )}>
          Séance {slot.sessionNumber}
        </span>

        <div className="flex items-center gap-1.5">
          {isDone && (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          )}
          {isDone && saved && (
            <button
              onClick={() => onDelete(saved.id, slot.sessionNumber)}
              disabled={isDeleting}
              title="Supprimer cette séance"
              className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors"
            >
              {isDeleting
                ? <Loader2 className="w-3 h-3 text-red-400 animate-spin" />
                : <Trash2 className="w-3 h-3 text-red-400" />
              }
            </button>
          )}
        </div>
      </div>

      {/* Date picker */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Date de la séance
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={cn(
            "w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all",
            isDone
              ? "bg-green-100/60 border-green-200 text-green-800"
              : "bg-gray-50 border-gray-200 text-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          )}
        />
        {!date && (
          <p className="text-[10px] text-red-400">Date requise pour enregistrer</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Exercices
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Squat, développé couché, cardio…"
          rows={3}
          className={cn(
            "w-full text-xs rounded-xl px-3 py-2.5 resize-none outline-none transition-all leading-relaxed",
            isDone
              ? "bg-green-100/60 border border-green-200 text-green-800 placeholder:text-green-300"
              : "bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          )}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !date}
        className={cn(
          "flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isDone
            ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        )}
      >
        {isSaving ? (
          <><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement…</>
        ) : isDone ? (
          <><Check className="w-3 h-3" /> Modifier</>
        ) : (
          <><Save className="w-3 h-3" /> Enregistrer</>
        )}
      </button>
    </div>
  );
}