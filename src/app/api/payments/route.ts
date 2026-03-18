import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getNextPaymentDate, generateInvoiceNumber } from "@/lib/utils";
import { addMonths, getDaysInMonth } from "date-fns";

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();
  const { client_id, amount, notes } = await req.json();

  if (!client_id || !amount) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Fetch client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  const today        = new Date();
  const periodStart  = today.toISOString().split("T")[0];
  const periodEnd    = getNextPaymentDate(periodStart);

  // Insert payment
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      client_id,
      amount,
      payment_date: periodStart,
      period_start: periodStart,
      period_end:   periodEnd,
      notes: notes || null,
    })
    .select()
    .single();

  // Update client status + dates
  await supabase
    .from("clients")
    .update({
      last_payment:  periodStart,
      next_payment:  periodEnd,
      status:        "paid",
    })
    .eq("id", client_id);

  // Create invoice record
  const invoiceNumber = generateInvoiceNumber();
  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      client_id,
      payment_id:     payment?.id,
      invoice_number: invoiceNumber,
      amount,
      issued_date:    periodStart,
    })
    .select()
    .single();

  return NextResponse.json({ payment, invoice }, { status: 201 });
}