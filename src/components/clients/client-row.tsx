"use client";

import Link from "next/link";
import { Edit2, Trash2, CreditCard, Calendar, Receipt } from "lucide-react";
import { formatDate, formatCurrency, getStatusConfig, cn } from "@/lib/utils";
import type { Client } from "@/types";

interface ClientRowProps {
  client:   Client;
  onEdit:   (c: Client) => void;
  onDelete: (c: Client) => void;
  onPay:    (c: Client) => void;
}

export default function ClientRow({
  client, onEdit, onDelete, onPay,
}: ClientRowProps) {
  const statusCfg = getStatusConfig(client.status);

  return (
    <div className="grid grid-cols-[2fr_1fr_0.6fr_0.8fr_1fr_0.9fr_1.4fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/70 transition-colors border-b border-gray-50 last:border-0">

      {/* Client info */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {client.full_name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{client.phone}</p>
      </div>

      {/* Joining date */}
      <span className="text-xs text-gray-600">
        {formatDate(client.joining_date)}
      </span>

      {/* Sessions */}
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-600">
            {client.sessions_per_week}
          </span>
        </div>
        <span className="text-xs text-gray-500">/sem</span>
      </div>

      {/* Price */}
      <span className="text-xs font-medium text-gray-700">
        {formatCurrency(client.monthly_price)}
      </span>

      {/* Next payment */}
      <span className={cn(
        "text-xs font-medium",
        client.status === "late" ? "text-red-600" :
        client.status === "soon" ? "text-amber-600" :
        "text-gray-600"
      )}>
        {client.next_payment ? formatDate(client.next_payment, "dd MMM yyyy") : "—"}
      </span>

      {/* Status badge */}
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border w-fit",
        statusCfg.className
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
        {statusCfg.label}
      </span>

      {/* Actions — icônes uniquement */}
      <div className="flex items-center gap-1.5">

        {/* Pay */}
        <button
          onClick={() => onPay(client)}
          title="Enregistrer paiement"
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
            client.status === "late"
              ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              : client.status === "soon"
              ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          )}
        >
          <CreditCard className="w-3.5 h-3.5" />
        </button>

        {/* Sessions */}
        <Link
          href={`/clients/${client.id}/sessions`}
          title="Voir les séances"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
        </Link>

        {/* Factures */}
        <Link
          href={`/clients/${client.id}/factures`}
          title="Voir les factures"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
        >
          <Receipt className="w-3.5 h-3.5" />
        </Link>

        {/* Edit */}
        <button
          onClick={() => onEdit(client)}
          title="Modifier"
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(client)}
          title="Supprimer"
          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors border border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
}