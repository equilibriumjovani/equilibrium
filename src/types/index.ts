export type ClientStatus = "paid" | "soon" | "late";

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  joining_date: string;
  sessions_per_week: 3 | 4;
  monthly_price: number;
  last_payment?: string;
  next_payment?: string;
  status: ClientStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  notes?: string;
  created_at: string;
  clients?: Pick<Client, "full_name" | "phone" | "email">;
}

export interface Session {
  id: string;
  client_id: string;
  session_number: number;
  session_date?: string;
  description?: string;
  month: number;
  year: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  payment_id?: string;
  invoice_number: string;
  amount: number;
  issued_date: string;
  pdf_url?: string;
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
  clients?: Pick<Client, "full_name" | "phone" | "email">;
  payments?: Payment;
}

export interface ClientFilters {
  search: string;
  status: ClientStatus | "all";
  sessions_per_week: 3 | 4 | "all";
  joining_month: number | "all";
}

export interface DashboardStats {
  total_clients: number;
  revenue_this_month: number;
  late_clients: number;
  expiring_soon: number;
}
export interface SessionSlot {
  sessionNumber: number;
  date:          Date;
  dateStr:       string;
  isToday:       boolean;
  isPast:        boolean;
}