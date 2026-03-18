import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import InvoicesTable from "@/components/invoices/invoices-table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getLogoBase64 } from "@/lib/logo-base64";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientFacturesPage({ params }: Props) {
  const { id }   = await params;
  const supabase = await createServiceClient();
  const logoBase64 = getLogoBase64();

  const { data: client } = await supabase
    .from("clients")
    .select("full_name, phone")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/clients"
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour aux clients
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Factures — {client.full_name}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {client.phone} · Historique complet des paiements
        </p>
      </div>

      <InvoicesTable clientId={id} />
    </div>
  );
}