"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useClients } from "@/hooks/use-clients";
import ClientFiltersBar from "./client-filters";
import ClientRow from "./client-row";
import ClientModal from "./client-modal";
import PaymentModal from "./payment-modal";
import type { Client } from "@/types";
import { Loader2, Users } from "lucide-react";

export default function ClientsTable() {
  const { clients, loading, filters, setFilters, refetch } = useClients();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editClient,  setEditClient]  = useState<Client | null>(null);
  const [payClient,   setPayClient]   = useState<Client | null>(null);
  const [payOpen,     setPayOpen]     = useState(false);

  function handleEdit(c: Client) {
    setEditClient(c);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditClient(null);
    setModalOpen(true);
  }

  function handlePay(c: Client) {
    setPayClient(c);
    setPayOpen(true);
  }

  async function handleDelete(c: Client) {
    if (!confirm(`Supprimer ${c.full_name} ? Cette action est irréversible.`)) return;

    const res = await fetch(`/api/clients/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${c.full_name} supprimé`);
      refetch();
    } else {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* Filters */}
        <ClientFiltersBar
          filters={filters}
          onChange={setFilters}
          onAdd={handleAdd}
          total={clients.length}
        />

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_0.6fr_0.8fr_1fr_0.9fr_1.4fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {[
              "Client", "Inscription", "Séances",
              "Tarif", "Prochain pmt", "Statut", "Actions",
            ].map((h) => (
              <span
                key={h}
                className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              >
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
          {!loading && clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Aucun client trouvé
              </p>
              <p className="text-xs text-gray-400">
                Modifiez les filtres ou ajoutez un nouveau client
              </p>
            </div>
          )}

          {/* Rows */}
          {!loading && clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPay={handlePay}
            />
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ClientModal
        open={modalOpen}
        client={editClient}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        onSaved={() => { refetch(); toast.success(editClient ? "Client mis à jour" : "Client ajouté !"); }}
      />

      {/* Payment Modal */}
      {payClient && (
        <PaymentModal
          open={payOpen}
          client={payClient}
          onClose={() => { setPayOpen(false); setPayClient(null); }}
          onSaved={() => { refetch(); toast.success("Paiement enregistré !"); }}
        />
      )}
    </>
  );
}