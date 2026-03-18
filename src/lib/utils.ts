import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMonths, getDaysInMonth,getDay,addDays } from "date-fns";
import { fr } from "date-fns/locale";
import type { ClientStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "dd MMM yyyy") {
  return format(new Date(date), fmt, { locale: fr });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getNextPaymentDate(lastPayment: string): string {
  const date = new Date(lastPayment);
  return addMonths(date, 1).toISOString().split("T")[0];
}

export function getSessionCount(year: number, month: number, sessionsPerWeek: 3 | 4): number {
  // Count weeks in the calendar month then multiply
  const days = getDaysInMonth(new Date(year, month - 1));
  const fullWeeks = Math.floor(days / 7);
  const remainder = days % 7;
  // Approximate: use 4 weeks as base, adjust for months with 5 partial weeks
  const weeks = fullWeeks + (remainder > 0 ? 1 : 0);
  // Cap to realistic monthly sessions
  return Math.min(weeks * sessionsPerWeek, sessionsPerWeek === 3 ? 14 : 18);
}

export function getStatusConfig(status: ClientStatus) {
  const configs = {
    paid: {
      label: "Payé",
      className: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    soon: {
      label: "Bientôt",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    late: {
      label: "En retard",
      className: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };
  return configs[status];
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `EQ-${year}${month}-${random}`;
}
export interface SessionSlot {
  sessionNumber: number;
  date:          Date;
  dateStr:       string;
  isToday:       boolean;
  isPast:        boolean;
}

export function generateSessionSlots(
  year:             number,
  month:            number,
  sessionsPerWeek:  3 | 4
): SessionSlot[] {
  const slots: SessionSlot[] = [];
  const today  = new Date();
  today.setHours(0, 0, 0, 0);

  // Sessions distributed across the month's weeks
  // Week days for 3/week: Mon, Wed, Fri (1, 3, 5)
  // Week days for 4/week: Mon, Tue, Thu, Fri (1, 2, 4, 5)
  const weekDays3 = [1, 3, 5];
  const weekDays4 = [1, 2, 4, 5];
  const targetDays = sessionsPerWeek === 3 ? weekDays3 : weekDays4;

  const totalDays  = getDaysInMonth(new Date(year, month - 1));
  let   sessionNum = 1;

  for (let day = 1; day <= totalDays; day++) {
    const date    = new Date(year, month - 1, day);
    const weekDay = getDay(date); // 0=Sun, 1=Mon...

    if (targetDays.includes(weekDay)) {
      slots.push({
        sessionNumber: sessionNum++,
        date,
        dateStr:  date.toISOString().split("T")[0],
        isToday:  date.getTime() === today.getTime(),
        isPast:   date < today,
      });
    }
  }

  return slots;
}