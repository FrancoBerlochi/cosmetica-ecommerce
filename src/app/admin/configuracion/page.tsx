"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Plus,
  Save,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function AdminConfiguracionPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const coupons = useStore((s) => s.coupons);
  const upsertCoupon = useStore((s) => s.upsertCoupon);
  const deleteCoupon = useStore((s) => s.deleteCoupon);
  const reviews = useStore((s) => s.reviews);
  const toggleReviewApproval = useStore((s) => s.toggleReviewApproval);

  const [newCode, setNewCode] = useState("");
  const [newDiscountValue, setNewDiscountValue] = useState(10);
  const [newMinPurchase, setNewMinPurchase] = useState(25000);
  const [newDescription, setNewDescription] = useState("");

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    upsertCoupon({
      id: `coup-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      description:
        newDescription.trim() || `${newDiscountValue}% OFF en toda la tienda`,
      discount_type: "percentage",
      discount_value: Number(newDiscountValue),
      min_purchase_amount: Number(newMinPurchase),
      max_uses: 100,
      used_count: 0,
      is_active: true,
    });

    toast.success(`Cupón ${newCode.toUpperCase()} creado con éxito`);
    setNewCode("");
    setNewDescription("");
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold">
          Comercial &amp; Marca
        </span>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111] mt-1">
          Cupones, Datos Bancarios y Moderación
        </h1>
      </div>

      {/* 1. Configuración de Transferencia Bancaria, WhatsApp y Discreción */}
      <div className="p-4 sm:p-8 rounded-3xl bg-white border border-[#F4B8C8] space-y-5">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-[#D4728C]" />
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
            Descuento por Transferencia Bancaria y Contacto
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              % de Descuento por Transferencia
            </label>
            <input
              type="number"
              value={settings.transfer_discount_percent}
              onChange={(e) =>
                updateSettings({
                  transfer_discount_percent: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              Alias Bancario / Mercado Pago
            </label>
            <input
              type="text"
              value={settings.bank_alias}
              onChange={(e) => updateSettings({ bank_alias: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              CBU / CVU
            </label>
            <input
              type="text"
              value={settings.bank_cbu}
              onChange={(e) => updateSettings({ bank_cbu: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              Banco / Entidad
            </label>
            <input
              type="text"
              value={settings.bank_name}
              onChange={(e) => updateSettings({ bank_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              Titular de la Cuenta
            </label>
            <input
              type="text"
              value={settings.bank_holder}
              onChange={(e) => updateSettings({ bank_holder: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1">
              WhatsApp de Atención (con código país)
            </label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) =>
                updateSettings({ whatsapp_number: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111] mb-1">
            Aviso de Empaque 100% Discreto (Visible en Lencería y Checkout)
          </label>
          <input
            type="text"
            value={settings.discreet_shipping_notice}
            onChange={(e) =>
              updateSettings({ discreet_shipping_notice: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            toast.success(
              "Configuración de Mirta Cosmética guardada correctamente"
            )
          }
          className="px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#F4B8C8]" />
          <span>Guardar Configuración General</span>
        </button>
      </div>

      {/* 2. Gestión de Cupones de Descuento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4728C]" />
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
              Crear Nuevo Cupón
            </h2>
          </div>

          <form onSubmit={handleAddCoupon} className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1">
                Código del Cupón *
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ej: PRIMAVERA20"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs uppercase font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  required
                  value={newDiscountValue}
                  onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  Compra Mínima (ARS)
                </label>
                <input
                  type="number"
                  value={newMinPurchase}
                  onChange={(e) => setNewMinPurchase(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ej: 20% OFF en Kits de Skin Care"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F4B8C8]" />
              <span>Activar Cupón</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-4">
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
            Cupones Activos ({coupons.length})
          </h2>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#111111] text-[#F4B8C8] font-mono text-xs font-bold">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-[#111111]">
                      -{c.discount_value}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6568] mt-1">
                    {c.description} · Mínimo:{" "}
                    {formatARS(c.min_purchase_amount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteCoupon(c.id);
                    toast.info(`Cupón ${c.code} eliminado`);
                  }}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Moderación de Reseñas de Clientes */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-4">
        <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
          Moderación de Reseñas Verificadas ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {rev.author_name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3.5 h-3.5 text-[#D4728C] fill-[#F4B8C8]"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#6B6568] mt-1.5 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#FCE7F3]">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {rev.is_approved ? "Publicada en tienda" : "Oculta"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    toggleReviewApproval(rev.id);
                    toast.info("Estado de la reseña actualizado");
                  }}
                  className="text-xs font-bold text-[#D4728C] hover:underline cursor-pointer"
                >
                  {rev.is_approved ? "Ocultar" : "Aprobar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
