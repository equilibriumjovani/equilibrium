import { z } from "zod";

// Schema Zod — sessions_per_week reste number simple
export const clientSchema = z.object({
  full_name:         z.string().min(2, "Nom requis (minimum 2 caractères)"),
  phone:             z.string().min(8, "Numéro de téléphone invalide"),
  email:             z.string().email("Email invalide").optional().or(z.literal("")),
  joining_date:      z.string().min(1, "Date d'inscription requise"),
  sessions_per_week: z.coerce.number(),
  monthly_price:     z.coerce.number().min(1, "Tarif mensuel requis"),
  notes:             z.string().optional(),
});

// Type manuel — sessions_per_week est 3 | 4
export type ClientFormData = {
  full_name:         string;
  phone:             string;
  email?:            string;
  joining_date:      string;
  sessions_per_week: 3 | 4;
  monthly_price:     number;
  notes?:            string;
};