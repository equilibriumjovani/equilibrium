import { createServiceClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, getStatusConfig } from "@/lib/utils";
import {
  Users, TrendingUp, Clock, AlertCircle,
  ArrowUpRight, ChevronRight
} from "lucide-react";
import Link from "next/link";
import type { Client, DashboardStats } from "@/types";

async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentClients: Client[];
  lateClients: Client[];
}> {
  const supabase = await createServiceClient();

  // Run status update
  await supabase.rpc("update_client_statuses");

  // Fetch all clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("full_name");

  const allClients = clients ?? [];

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .gte("payment_date", startOfMonth.toISOString().split("T")[0]);

  const revenue = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);

  const stats: DashboardStats = {
    total_clients:  allClients.length,
    revenue_this_month: revenue,
    late_clients:   allClients.filter((c) => c.status === "late").length,
    expiring_soon:  allClients.filter((c) => c.status === "soon").length,
  };

  const recentClients = [...allClients]
    .sort((a, b) =>
      new Date(b.joining_date).getTime() - new Date(a.joining_date).getTime()
    )
    .slice(0, 5);

  const lateClients = allClients.filter((c) => c.status === "late").slice(0, 3);

  return { stats, recentClients, lateClients };
}

export default async function DashboardPage() {
  const { stats, recentClients, lateClients } = await getDashboardData();

  const statCards = [
    {
      label:   "Clients actifs",
      value:   stats.total_clients,
      icon:    Users,
      color:   "blue",
      bg:      "bg-blue-50",
      iconColor: "text-blue-600",
      badge:   null,
    },
    {
      label:   "Revenus ce mois",
      value:   formatCurrency(stats.revenue_this_month),
      icon:    TrendingUp,
      color:   "green",
      bg:      "bg-green-50",
      iconColor: "text-green-600",
      badge:   null,
    },
    {
      label:   "Expirent bientôt",
      value:   stats.expiring_soon,
      icon:    Clock,
      color:   "amber",
      bg:      "bg-amber-50",
      iconColor: "text-amber-600",
      badge:   stats.expiring_soon > 0 ? "Dans 7 jours" : null,
    },
    {
      label:   "En retard",
      value:   stats.late_clients,
      icon:    AlertCircle,
      color:   "red",
      bg:      "bg-red-50",
      iconColor: "text-red-600",
      badge:   stats.late_clients > 0 ? "Action requise" : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
              {card.badge && (
                <span className={`text-[10px] font-medium px-2 py-1 rounded-lg
                  ${card.color === "amber"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-red-50 text-red-600"
                  }`}>
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Recent clients */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Clients récents
            </h2>
            <Link
              href="/clients"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tous <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 bg-gray-50">
              {["Client","Prochain paiement","Sessions","Statut"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            {recentClients.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                Aucun client pour l'instant
              </div>
            ) : (
              recentClients.map((client) => {
                const statusCfg = getStatusConfig(client.status);
                return (
                  <div
                    key={client.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.full_name}
                      </p>
                      <p className="text-xs text-gray-400">{client.phone}</p>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {client.next_payment
                        ? formatDate(client.next_payment, "dd MMM")
                        : "—"}
                    </span>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {client.sessions_per_week}/sem
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusCfg.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Late clients alert */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              En retard
            </h2>
            {lateClients.length > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                {stats.late_clients} client{stats.late_clients > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col gap-2">
            {lateClients.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Tout est à jour !
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Aucun retard de paiement
                </p>
              </div>
            ) : (
              lateClients.map((client) => (
                <Link
                  key={client.id}
                  href="/clients"
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 hover:border-red-200 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.full_name}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Depuis le{" "}
                      {client.next_payment
                        ? formatDate(client.next_payment, "dd MMM")
                        : "—"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}