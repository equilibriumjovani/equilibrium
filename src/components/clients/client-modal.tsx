"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validations";
import { MONTHS_FR } from "@/lib/constants";
import type { Client } from "@/types";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientModalProps {
  open:     boolean;
  client?:  Client | null;
  onClose:  () => void;
  onSaved:  () => void;
}

export default function ClientModal({
  open, client, onClose, onSaved,
}: ClientModalProps) {
  const isEdit = !!client;

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
  resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      full_name:         "",
      phone:             "",
      email:             "",
      joining_date:      new Date().toISOString().split("T")[0],
      sessions_per_week: 3,
      monthly_price:     350,
      notes:             "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        client
          ? {
              full_name:         client.full_name,
              phone:             client.phone,
              email:             client.email ?? "",
              joining_date:      client.joining_date,
              sessions_per_week: client.sessions_per_week,
              monthly_price:     client.monthly_price,
              notes:             client.notes ?? "",
            }
          : {
              full_name:         "",
              phone:             "",
              email:             "",
              joining_date:      new Date().toISOString().split("T")[0],
              sessions_per_week: 3,
              monthly_price:     350,
              notes:             "",
            }
      );
    }
  }, [open, client, reset]);

  async function onSubmit(data: ClientFormData) {
    const url    = isEdit ? `/api/clients/${client!.id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      onSaved();
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {isEdit ? "Modifier le client" : "Nouveau client"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Mettre à jour les informations" : "Ajouter un nouveau membre"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nom complet *
            </label>
            <input
              {...register("full_name")}
              placeholder="ex: Karim Benali"
              className={cn(
                "px-4 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all",
                errors.full_name ? "border-red-300" : "border-gray-200"
              )}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Téléphone *
              </label>
              <input
                {...register("phone")}
                placeholder="+212 6XX-XXXXXX"
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all",
                  errors.phone ? "border-red-300" : "border-gray-200"
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="client@email.com"
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all"
              />
            </div>
          </div>

          {/* Joining date + Sessions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date d'inscription *
              </label>
              <input
                {...register("joining_date")}
                type="date"
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all",
                  errors.joining_date ? "border-red-300" : "border-gray-200"
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Séances / semaine *
              </label>
              <select
                {...register("sessions_per_week", { valueAsNumber: true })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all"
              >
                <option value={3}>3 séances / semaine</option>
                <option value={4}>4 séances / semaine</option>
              </select>
            </div>
          </div>

          {/* Monthly price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tarif mensuel (MAD) *
            </label>
            <div className="relative">
              <input
                {...register("monthly_price", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="350"
                className={cn(
                  "w-full px-4 py-2.5 pr-14 rounded-xl border text-sm bg-gray-50 text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all",
                  errors.monthly_price ? "border-red-300" : "border-gray-200"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                MAD
              </span>
            </div>
            {errors.monthly_price && (
              <p className="text-xs text-red-500">{errors.monthly_price.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Objectifs, remarques médicales…"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-eq-blue transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-eq-blue text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-60 shadow-md shadow-blue-100"
            >
              {isSubmitting
                ? "Enregistrement…"
                : isEdit ? "Mettre à jour" : "Ajouter le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}