"use client";

import { useState, useEffect, useCallback } from "react";
import type { Session } from "@/types";

export function useSessions(
  clientId:     string,
  initialMonth: number,
  initialYear:  number
) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [month,    setMonth]    = useState(initialMonth);
  const [year,     setYear]     = useState(initialYear);
  const [saving,   setSaving]   = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `/api/sessions?client_id=${clientId}&month=${month}&year=${year}`
      );
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, [clientId, month, year]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  function navigate(dir: 1 | -1) {
    const date = new Date(year, month - 1 + dir, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  }

  async function saveSession(
    sessionNumber: number,
    sessionDate:   string,
    description:   string
  ) {
    setSaving(sessionNumber);
    try {
      await fetch("/api/sessions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id:      clientId,
          session_number: sessionNumber,
          session_date:   sessionDate,
          description,
          month,
          year,
        }),
      });
      await fetchSessions();
    } finally {
      setSaving(null);
    }
  }

  async function deleteSession(sessionId: string, sessionNumber: number) {
    setDeleting(sessionNumber);
    try {
      await fetch(`/api/sessions?id=${sessionId}`, { method: "DELETE" });
      await fetchSessions();
    } finally {
      setDeleting(null);
    }
  }

  return {
    sessions, loading, month, year,
    saving, deleting, navigate, saveSession, deleteSession,
  };
}