"use client";

import { useState } from "react";
import { X, Download, Mail, Loader2, Check, Printer } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import Image from "next/image";
import InvoicePDF from "./invoice-pdf";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { GYM_INFO } from "@/lib/constants";
import type { Invoice } from "@/types";

interface InvoiceViewModalProps {
 invoice: Omit<Invoice, "payments"> & {
  clients?:  { full_name: string; phone: string; email?: string };
  payments?: {
    payment_date: string;
    period_start: string;
    period_end:   string;
    notes?:       string;
  };
};
  logoBase64?: string;
  onClose:     () => void;
  onEmailSent: () => void;
}

export default function InvoiceViewModal({
  invoice, logoBase64, onClose, onEmailSent,
}: InvoiceViewModalProps) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const client  = invoice.clients;
  const payment = invoice.payments;

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const blob = await pdf(
        <InvoicePDF invoice={invoice} logoBase64={logoBase64} />
      ).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF téléchargé !");
    } catch {
      toast.error("Erreur génération PDF");
    } finally {
      setDownloading(false);
    }
  }

  async function handleSendEmail() {
    setSendingEmail(true);
    try {
      const res = await fetch("/api/invoices/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ invoice_id: invoice.id }),
      });
      if (res.ok) {
        toast.success("Email envoyé avec succès !");
        onEmailSent();
      } else {
        toast.error("Erreur lors de l'envoi");
      }
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Printer className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {invoice.invoice_number}
              </h2>
              <p className="text-xs text-gray-400">
                Émise le {formatDate(invoice.issued_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">

            {/* Email button — désactivé */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed">
              <Mail className="w-3.5 h-3.5" />
              Email non configuré
            </div>

            {/* PDF download */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              {downloading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />
              }
              PDF
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Invoice preview body */}
        <div className="p-6">

          {/* Blue banner avec logo */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {logoBase64 ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/15 border border-white/20 p-1 flex-shrink-0">
                  <img
                    src={logoBase64}
                    alt="Equilibrium"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">E</span>
                </div>
              )}
              <div>
                <p className="text-white text-xl font-bold">{GYM_INFO.name}</p>
                <p className="text-blue-200 text-xs mt-0.5">{GYM_INFO.address}</p>
                <p className="text-blue-200 text-xs">{GYM_INFO.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-bold uppercase tracking-widest mb-1">
                Facture
              </p>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <p className="text-white text-xs font-bold">{invoice.invoice_number}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Payé
            </span>
            {invoice.email_sent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                <Check className="w-3 h-3" />
                Email envoyé le {invoice.email_sent_at ? formatDate(invoice.email_sent_at) : "—"}
              </span>
            )}
          </div>

          {/* Two column grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* Client */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Informations client
              </p>
              <InfoRow label="Nom"       value={client?.full_name ?? "—"} />
              <InfoRow label="Téléphone" value={client?.phone     ?? "—"} />
              {client?.email && (
                <InfoRow label="Email" value={client.email} />
              )}
            </div>

            {/* Payment */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Détails paiement
              </p>
              <InfoRow
                label="Date émission"
                value={formatDate(invoice.issued_date)}
              />
              <InfoRow
                label="Date paiement"
                value={payment?.payment_date ? formatDate(payment.payment_date) : "—"}
              />
              <InfoRow
                label="Période"
                value={
                  payment?.period_start && payment?.period_end
                    ? `${formatDate(payment.period_start, "dd MMM")} → ${formatDate(payment.period_end, "dd MMM yyyy")}`
                    : "—"
                }
              />
            </div>
          </div>

          {/* Notes */}
          {payment?.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-amber-800">{payment.notes}</p>
            </div>
          )}

          {/* Amount */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-0.5">Montant total</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-400">Réf.</p>
              <p className="text-sm font-bold text-blue-600">{invoice.invoice_number}</p>
            </div>
          </div>

          {/* Gym footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              {GYM_INFO.name} · {GYM_INFO.address}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {GYM_INFO.phone} · {GYM_INFO.email}
            </p>
            <p className="text-xs text-blue-400 font-medium mt-2">
              Merci pour votre confiance !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}