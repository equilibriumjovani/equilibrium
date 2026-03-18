import InvoicesTable from "@/components/invoices/invoices-table";
import { getLogoBase64 } from "@/lib/logo-base64";

export default function FacturesPage() {
  const logoBase64 = getLogoBase64();
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-900">Factures</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Historique complet des paiements et factures
        </p>
      </div>
      <InvoicesTable logoBase64={logoBase64} />
    </div>
  );
}