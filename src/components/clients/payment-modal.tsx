"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Client } from "@/types";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open:    boolean;
  client:  Client;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentModal({
  open, client, onClose, onSaved,
}: PaymentModalProps) {
  const [amount,  setAmount]  = useState(String(client.monthly_price));
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client.id,
        amount:    Number(amount),
        notes,
      }),
    });
    setLoading(false);
    if (res.ok) { onSaved(); onClose(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Enregistrer un paiement
              </h2>
              <p className="text-xs text-gray-400">{client.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-5 pb-2 flex flex-col gap-3">
          <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Dernier paiement</span>
              <span className="text-gray-700 font-medium">
                {client.last_payment ? formatDate(client.last_payment) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Prochain paiement</span>
              <span className={cn(
                "font-medium",
                client.status === "late" ? "text-red-600" : "text-gray-700"
              )}>
                {client.next_payment ? formatDate(client.next_payment) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Tarif habituel</span>
              <span className="text-gray-700 font-medium">
                {formatCurrency(client.monthly_price)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Montant (MAD)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 pr-14 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                MAD
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Notes (optionnel)
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: paiement partiel, espèces…"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handlePay}
            disabled={loading || !amount}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-60 shadow-md shadow-green-100"
          >
            {loading ? "Enregistrement…" : `Confirmer ${formatCurrency(Number(amount))}`}
          </button>
        </div>
      </div>
    </div>
  );
}