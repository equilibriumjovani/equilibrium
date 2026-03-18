import {
  Document, Page, Text, View, StyleSheet, Image as PDFImage,
} from "@react-pdf/renderer";
import { GYM_INFO } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

const styles = StyleSheet.create({
  page: {
    fontFamily:      "Helvetica",
    backgroundColor: "#ffffff",
    padding:         0,
    fontSize:        10,
    color:           "#111827",
  },
  header: {
    backgroundColor: "#1d4ed8",
    padding:         "28 36",
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           14,
  },
  logoContainer: {
    width:           52,
    height:          52,
    borderRadius:    10,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding:         4,
  },
  logoImage: {
    width:  44,
    height: 44,
  },
  logoPlaceholder: {
    width:           52,
    height:          52,
    borderRadius:    10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  gymName: {
    fontSize:     20,
    fontFamily:   "Helvetica-Bold",
    color:        "#ffffff",
    marginBottom: 3,
  },
  gymSub: {
    fontSize:     9,
    color:        "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize:      13,
    fontFamily:    "Helvetica-Bold",
    color:         "#ffffff",
    letterSpacing: 2,
    marginBottom:  6,
  },
  invoiceNumBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius:    6,
    padding:         "4 10",
  },
  invoiceNum: {
    fontSize:   9,
    color:      "#bfdbfe",
    fontFamily: "Helvetica-Bold",
  },
  body: {
    padding: "24 36",
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    borderRadius:    20,
    padding:         "4 12",
    alignSelf:       "flex-start",
    marginBottom:    16,
  },
  statusText: {
    fontSize:   8,
    color:      "#15803d",
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize:      8,
    fontFamily:    "Helvetica-Bold",
    color:         "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom:  8,
    marginTop:     18,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           8,
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius:    8,
    padding:         "10 12",
    flex:            1,
    minWidth:        "45%",
  },
  infoBoxWide: {
    backgroundColor: "#f9fafb",
    borderRadius:    8,
    padding:         "10 12",
    width:           "100%",
  },
  infoLabel: {
    fontSize:     8,
    color:        "#9ca3af",
    marginBottom: 3,
  },
  infoValue: {
    fontSize:   10,
    fontFamily: "Helvetica-Bold",
    color:      "#111827",
  },
  divider: {
    borderBottom:   "1 solid #f3f4f6",
    marginVertical: 14,
  },
  amountBox: {
    backgroundColor: "#eff6ff",
    borderRadius:    12,
    padding:         "16 20",
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    marginTop:       16,
    border:          "1.5 solid #bfdbfe",
  },
  amountLabel: {
    fontSize:   11,
    color:      "#2563eb",
    fontFamily: "Helvetica-Bold",
  },
  amountValue: {
    fontSize:   22,
    fontFamily: "Helvetica-Bold",
    color:      "#1d4ed8",
  },
  notesBox: {
    backgroundColor: "#fffbeb",
    borderRadius:    8,
    padding:         "10 12",
    marginTop:       8,
    border:          "1 solid #fde68a",
  },
  notesText: {
    fontSize: 9,
    color:    "#92400e",
  },
  footer: {
    backgroundColor: "#f9fafb",
    padding:         "14 36",
    borderTop:       "1 solid #f3f4f6",
    alignItems:      "center",
    marginTop:       "auto",
  },
  footerText: {
    fontSize:   8,
    color:      "#9ca3af",
    textAlign:  "center",
    lineHeight: 1.8,
  },
});

interface InvoicePDFProps {
  invoice: Omit<Invoice, "payments"> & {
  clients?:  { full_name: string; phone: string; email?: string };
  payments?: {
    payment_date: string;
    period_start: string;
    period_end:   string;
    notes?:       string;
  };
};
  logoBase64?: string;
}

export default function InvoicePDF({ invoice, logoBase64 }: InvoicePDFProps) {
  const client  = invoice.clients;
  const payment = invoice.payments;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>

            {/* Logo */}
            {logoBase64 ? (
              <View style={styles.logoContainer}>
                <PDFImage src={logoBase64} style={styles.logoImage} />
              </View>
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Helvetica-Bold" }}>
                  E
                </Text>
              </View>
            )}

            {/* Gym info */}
            <View>
              <Text style={styles.gymName}>{GYM_INFO.name}</Text>
              <Text style={styles.gymSub}>{GYM_INFO.address}</Text>
              <Text style={styles.gymSub}>{GYM_INFO.phone}</Text>
            </View>
          </View>

          {/* Invoice ref */}
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <View style={styles.invoiceNumBadge}>
              <Text style={styles.invoiceNum}>{invoice.invoice_number}</Text>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Statut */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓  PAYÉ</Text>
          </View>

          {/* Client */}
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Nom complet</Text>
              <Text style={styles.infoValue}>{client?.full_name ?? "—"}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{client?.phone ?? "—"}</Text>
            </View>
            {client?.email && (
              <View style={styles.infoBoxWide}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{client.email}</Text>
              </View>
            )}
          </View>

          {/* Paiement */}
          <Text style={styles.sectionTitle}>Détails du paiement</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>N° Facture</Text>
              <Text style={styles.infoValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Date d'émission</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.issued_date)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Date de paiement</Text>
              <Text style={styles.infoValue}>
                {payment?.payment_date ? formatDate(payment.payment_date) : "—"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Période couverte</Text>
              <Text style={styles.infoValue}>
                {payment?.period_start && payment?.period_end
                  ? `${formatDate(payment.period_start)} → ${formatDate(payment.period_end)}`
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {payment?.notes && (
            <View style={styles.notesBox}>
              <Text style={[styles.infoLabel, { marginBottom: 3 }]}>Notes</Text>
              <Text style={styles.notesText}>{payment.notes}</Text>
            </View>
          )}

          {/* Montant */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Montant total</Text>
            <Text style={styles.amountValue}>{formatCurrency(invoice.amount)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Émis par */}
          <Text style={styles.sectionTitle}>Émis par</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Salle de sport</Text>
              <Text style={styles.infoValue}>{GYM_INFO.name}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{GYM_INFO.phone}</Text>
            </View>
            <View style={styles.infoBoxWide}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{GYM_INFO.address}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {GYM_INFO.name} · {GYM_INFO.address}{"\n"}
            {GYM_INFO.phone} · {GYM_INFO.email}{"\n"}
            Merci pour votre confiance !
          </Text>
        </View>

      </Page>
    </Document>
  );
}