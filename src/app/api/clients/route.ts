import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations";
import { getNextPaymentDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const supabase = await createServiceClient();
  await supabase.rpc("update_client_statuses");

  const { searchParams } = new URL(req.url);
  const search            = searchParams.get("search") ?? "";
  const status            = searchParams.get("status");
  const sessions_per_week = searchParams.get("sessions_per_week");
  const joining_month     = searchParams.get("joining_month");

  let query = supabase
    .from("clients")
    .select("*")
    .order("full_name", { ascending: true });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }
  if (status)            query = query.eq("status", status);
  if (sessions_per_week) query = query.eq("sessions_per_week", Number(sessions_per_week));
  if (joining_month) {
    const m = String(joining_month).padStart(2, "0");
    query = query.like("joining_date", `%-${m}-%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();
  const body     = await req.json();
  const parsed   = clientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const next_payment = data.joining_date
    ? getNextPaymentDate(data.joining_date)
    : null;

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      ...data,
      email:         data.email || null,
      last_payment:  data.joining_date,
      next_payment,
      status:        "paid",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client }, { status: 201 });
}