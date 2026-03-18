import ClientsTable from "@/components/clients/clients-table";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Gérez vos membres et leurs abonnements
        </p>
      </div>
      <ClientsTable />
    </div>
  );
}