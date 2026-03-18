import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createServiceClient();
  const { searchParams } = new URL(req.url);
  const client_id = searchParams.get("client_id");

  let query = supabase
    .from("invoices")
    .select(`
      *,
      clients ( full_name, phone, email ),
      payments ( payment_date, period_start, period_end, notes )
    `)
    .order("created_at", { ascending: false });

  if (client_id) query = query.eq("client_id", client_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data ?? [] });
}