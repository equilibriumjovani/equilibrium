"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Eye, Download, Mail, Trash2,
  Loader2, FileText, Check, Search,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./invoice-pdf";
import InvoiceViewModal from "./invoice-view-modal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Invoice } from "@/types";

interface FullInvoice extends Invoice {
  clients?:  { full_name: string; phone: string; email?: string };
  payments?: {
    payment_date: string;
    period_start: string;
    period_end:   string;
    notes?:       string;
  };
}

interface InvoicesTableProps {
  clientId?: string;
  logoBase64?:  string;  // if set, show only this client's invoices
}

export default function InvoicesTable({ clientId,logoBase64  }: InvoicesTableProps) {
  const [invoices,   setInvoices]   = useState<FullInvoice[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [viewInvoice, setViewInvoice] = useState<FullInvoice | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [emailing,   setEmailing]   = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const url = clientId
        ? `/api/invoices?client_id=${clientId}`
        : "/api/invoices";
      const res  = await fetch(url);
      const data = await res.json();
      setInvoices(data.invoices ?? []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.clients?.full_name.toLowerCase().includes(q) ||
      inv.clients?.phone.includes(q)
    );
  });

  // Stats
  const totalAmount  = invoices.reduce((s, i) => s + i.amount, 0);
  const emailedCount = invoices.filter((i) => i.email_sent).length;
  const thisMonth    = new Date().getMonth();
  const thisYear     = new Date().getFullYear();
  const monthAmount  = invoices
    .filter((i) => {
      const d = new Date(i.issued_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((s, i) => s + i.amount, 0);

  async function handleDelete(inv: FullInvoice) {
    if (!confirm(`Supprimer la facture ${inv.invoice_number} ?`)) return;
    setDeleting(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Facture supprimée");
        fetchInvoices();
      } else {
        toast.error("Erreur suppression");
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownload(inv: FullInvoice) {
    
    setDownloading(inv.id);
    try {
      const blob = await pdf(<InvoicePDF invoice={inv} logoBase64={logoBase64} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${inv.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch {
      toast.error("Erreur PDF");
    } finally {
      setDownloading(null);
    }
  }

  async function handleEmail(inv: FullInvoice) {
    setEmailing(inv.id);
    try {
      const res = await fetch("/api/invoices/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ invoice_id: inv.id }),
      });
      if (res.ok) {
        toast.success("Email envoyé !");
        fetchInvoices();
      } else {
        toast.error("Erreur envoi email");
      }
    } finally {
      setEmailing(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* Stats row */}
        {!clientId && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total factures",  value: invoices.length, color: "blue"  },
              { label: "Revenus totaux",  value: formatCurrency(totalAmount), color: "green" },
              { label: "Ce mois",         value: formatCurrency(monthAmount), color: "purple" },
              { label: "Emails envoyés",  value: `${emailedCount} / ${invoices.length}`, color: "teal" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all max-w-sm">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par numéro, client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="grid grid-cols-[1.2fr_1.4fr_1.2fr_0.8fr_0.7fr_0.8fr_1.1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {[
              "N° Facture", "Client", "Période",
              "Montant", "Date", "Email", "Actions",
            ].map((h) => (
              <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-sm text-gray-400">Chargement…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Aucune facture</p>
              <p className="text-xs text-gray-400">
                Les factures apparaissent après chaque paiement
              </p>
            </div>
          )}

          {/* Rows */}
          {!loading && filtered.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1.2fr_1.4fr_1.2fr_0.8fr_0.7fr_0.8fr_1.1fr] gap-4 px-5 py-4 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              {/* Invoice number */}
              <button
                onClick={() => setViewInvoice(inv)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 text-left truncate"
              >
                {inv.invoice_number}
              </button>

              {/* Client */}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {inv.clients?.full_name ?? "—"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {inv.clients?.phone ?? ""}
                </p>
              </div>

              {/* Period */}
              <span className="text-xs text-gray-600 truncate">
                {inv.payments?.period_start && inv.payments?.period_end
                  ? `${formatDate(inv.payments.period_start, "dd MMM")} → ${formatDate(inv.payments.period_end, "dd MMM yy")}`
                  : "—"}
              </span>

              {/* Amount */}
              <span className="text-xs font-bold text-gray-900">
                {formatCurrency(inv.amount)}
              </span>

              {/* Date */}
              <span className="text-xs text-gray-500">
                {formatDate(inv.issued_date, "dd MMM")}
              </span>

              {/* Email status */}
              <div>
                {inv.email_sent ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-medium text-green-700">
                    <Check className="w-2.5 h-2.5" /> Envoyé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-600">
                    En attente
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {/* View */}
                <button
                  onClick={() => setViewInvoice(inv)}
                  title="Voir la facture"
                  className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 flex items-center justify-center transition-colors"
                >
                  <Eye className="w-3 h-3 text-blue-600" />
                </button>

                {/* PDF */}
                <button
                  onClick={() => handleDownload(inv)}
                  disabled={downloading === inv.id}
                  title="Télécharger PDF"
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  {downloading === inv.id
                    ? <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />
                    : <Download className="w-3 h-3 text-gray-500" />
                  }
                </button>

                {/* Email */}
                <button
                  onClick={() => handleEmail(inv)}
                  disabled={emailing === inv.id}
                  title={inv.email_sent ? "Renvoyer email" : "Envoyer email"}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                    inv.email_sent
                      ? "bg-green-50 hover:bg-green-100 border border-green-100"
                      : "bg-blue-50 hover:bg-blue-100 border border-blue-100"
                  )}
                >
                  {emailing === inv.id
                    ? <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                    : <Mail className={cn("w-3 h-3", inv.email_sent ? "text-green-600" : "text-blue-600")} />
                  }
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(inv)}
                  disabled={deleting === inv.id}
                  title="Supprimer"
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors"
                >
                  {deleting === inv.id
                    ? <Loader2 className="w-3 h-3 text-red-400 animate-spin" />
                    : <Trash2 className="w-3 h-3 text-red-500" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice view modal */}
      {viewInvoice && (
        <InvoiceViewModal
          invoice={viewInvoice}
          logoBase64={logoBase64}
          onClose={() => setViewInvoice(null)}
          onEmailSent={() => { fetchInvoices(); setViewInvoice(null); }}
        />
      )}
    </>
  );
}