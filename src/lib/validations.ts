import { z } from "zod";

export const clientSchema = z.object({
  full_name:         z.string().min(2, "Nom requis (minimum 2 caractères)"),
  phone:             z.string().min(8, "Numéro de téléphone invalide"),
  email:             z.string().email("Email invalide").optional().or(z.literal("")),
  joining_date:      z.string().min(1, "Date d'inscription requise"),
  sessions_per_week: z.coerce.number()
    .transform((v) => v as 3 | 4)
    .pipe(z.union([z.literal(3), z.literal(4)])),
  monthly_price:     z.coerce.number().min(1, "Tarif mensuel requis"),
  notes:             z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;