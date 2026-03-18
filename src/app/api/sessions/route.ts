import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createServiceClient();
  const { searchParams } = new URL(req.url);

  const client_id = searchParams.get("client_id");
  const month     = searchParams.get("month");
  const year      = searchParams.get("year");

  if (!client_id || !month || !year) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("client_id", client_id)
    .eq("month", Number(month))
    .eq("year",  Number(year))
    .order("session_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();
  const body     = await req.json();

  const { client_id, session_number, session_date, description, month, year } = body;

  if (!client_id || !session_number || !month || !year) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .upsert(
      {
        client_id,
        session_number,
        session_date:  session_date || null,
        description:   description  || null,
        month,
        year,
        is_completed:  true,
      },
      { onConflict: "client_id,session_number,month,year" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServiceClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}