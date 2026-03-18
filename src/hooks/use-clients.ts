"use client";

import { useState, useEffect, useCallback } from "react";
import type { Client, ClientFilters } from "@/types";

const defaultFilters: ClientFilters = {
  search:            "",
  status:            "all",
  sessions_per_week: "all",
  joining_month:     "all",
};

export function useClients() {
  const [clients, setClients]     = useState<Client[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState<ClientFilters>(defaultFilters);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search)            params.set("search", filters.search);
      if (filters.status !== "all")  params.set("status", filters.status);
      if (filters.sessions_per_week !== "all")
        params.set("sessions_per_week", String(filters.sessions_per_week));
      if (filters.joining_month !== "all")
        params.set("joining_month", String(filters.joining_month));

      const res  = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return { clients, loading, filters, setFilters, refetch: fetchClients };
}