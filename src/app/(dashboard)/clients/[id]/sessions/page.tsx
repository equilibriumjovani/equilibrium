import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import SessionsGrid from "@/components/sessions/sessions-grid";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionsPage({ params }: Props) {
  const { id }   = await params;
  const supabase = await createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Séances — {client.full_name}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Suivi mensuel des séances d'entraînement
        </p>
      </div>
      <SessionsGrid client={client} />
    </div>
  );
}