import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { GYM_INFO } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase        = await createServiceClient();
  const { invoice_id }  = await req.json();

  if (!invoice_id) {
    return NextResponse.json({ error: "invoice_id requis" }, { status: 400 });
  }

  // Fetch full invoice with joins
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      clients ( full_name, phone, email ),
      payments ( payment_date, period_start, period_end, notes )
    `)
    .eq("id", invoice_id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const clientEmail = invoice.clients?.email;
  const ownerEmail  = process.env.OWNER_EMAIL!;

  const subject = `Facture ${invoice.invoice_number} — ${GYM_INFO.name}`;

  const htmlBody = buildEmailHtml(invoice);

  const recipients = [ownerEmail];
  if (clientEmail) recipients.push(clientEmail);

  try {
    await resend.emails.send({
      from:    `${GYM_INFO.name} <onboarding@resend.dev>`,
      to:      recipients,
      subject,
      html:    htmlBody,
    });

    // Mark as sent
    await supabase
      .from("invoices")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", invoice_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
  }
}

function buildEmailHtml(invoice: any): string {
  const client  = invoice.clients;
  const payment = invoice.payments;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; margin: 0; padding: 32px 16px; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1d4ed8, #60a5fa); padding: 32px; }
    .header h1 { color: #fff; font-size: 24px; margin: 0 0 4px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.75); font-size: 13px; margin: 0; }
    .body { padding: 32px; }
    .invoice-num { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 8px; margin-bottom: 24px; letter-spacing: 0.5px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { background: #f9fafb; border-radius: 10px; padding: 12px 14px; }
    .info-label { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
    .info-value { font-size: 13px; font-weight: 600; color: #111827; }
    .amount-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin: 24px 0; }
    .amount-label { font-size: 13px; color: #2563eb; font-weight: 500; }
    .amount-value { font-size: 28px; font-weight: 700; color: #1d4ed8; }
    .footer { background: #f9fafb; padding: 20px 32px; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 11px; color: #9ca3af; margin: 0; text-align: center; line-height: 1.8; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${GYM_INFO.name}</h1>
      <p>${GYM_INFO.address}</p>
    </div>
    <div class="body">
      <div class="invoice-num">${invoice.invoice_number}</div>

      <div class="section">
        <div class="section-title">Informations client</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nom complet</div>
            <div class="info-value">${client?.full_name ?? "—"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Téléphone</div>
            <div class="info-value">${client?.phone ?? "—"}</div>
          </div>
          ${client?.email ? `
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${client.email}</div>
          </div>` : ""}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Détails du paiement</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Date d'émission</div>
            <div class="info-value">${formatDate(invoice.issued_date)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date de paiement</div>
            <div class="info-value">${payment?.payment_date ? formatDate(payment.payment_date) : "—"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Période début</div>
            <div class="info-value">${payment?.period_start ? formatDate(payment.period_start) : "—"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Période fin</div>
            <div class="info-value">${payment?.period_end ? formatDate(payment.period_end) : "—"}</div>
          </div>
        </div>
        ${payment?.notes ? `
        <div class="info-item" style="margin-top:12px">
          <div class="info-label">Notes</div>
          <div class="info-value">${payment.notes}</div>
        </div>` : ""}
      </div>

      <div class="amount-box">
        <div class="amount-label">Montant total</div>
        <div class="amount-value">${formatCurrency(invoice.amount)}</div>
      </div>
    </div>

    <div class="footer">
      <p>
        ${GYM_INFO.name} · ${GYM_INFO.address}<br/>
        ${GYM_INFO.phone} · ${GYM_INFO.email}<br/>
        Merci pour votre confiance !
      </p>
    </div>
  </div>
</body>
</html>`;
}