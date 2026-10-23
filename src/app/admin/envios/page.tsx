"use client";

import React from "react";
import { Building2, CheckCircle2, MapPin, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function AdminEnviosPage() {
  const shippingZones = useStore((s) => s.shippingZones);
  const updateShippingZone = useStore((s) => s.updateShippingZone);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold">
          Logística Correo Argentino
        </span>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111] mt-1">
          Tarifario de Correo Argentino (Domicilio y Sucursal)
        </h1>
        <p className="text-xs text-[#6B6568] mt-1">
          Modo Híbrido activo: Podés editar las tarifas por zona y peso aquí
          mismo, y cuando conectes las credenciales de la API de MiCorreo en{" "}
          <code>.env.local</code> cotizará en vivo usando estas tarifas como
          respaldo.
        </p>
      </div>

      {/* Configuración General de Envío Gratis y Modo Correo Argentino */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#F4B8C8] grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-xs font-bold text-[#111111] mb-1.5">
            Monto Mínimo para Envío Gratis (ARS)
          </label>
          <input
            type="number"
            value={settings.free_shipping_threshold}
            onChange={(e) =>
              updateSettings({
                free_shipping_threshold: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-sm font-bold text-[#111111]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#111111] mb-1.5">
            Modo de Cotización Correo Argentino
          </label>
          <select
            value={settings.correo_argentino_mode}
            onChange={(e) =>
              updateSettings({
                correo_argentino_mode: e.target.value as
                  | "database"
                  | "api"
                  | "hybrid",
              })
            }
            className="w-full px-4 py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-semibold text-[#111111]"
          >
            <option value="hybrid">
              Híbrido (API MiCorreo + Tarifario Admin como respaldo)
            </option>
            <option value="database">
              Solo Tarifario editable en Admin (Domicilio y Sucursal)
            </option>
            <option value="api">Priorizar API Oficial MiCorreo / Paq.ar</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            toast.success("Configuración de Correo Argentino guardada")
          }
          className="py-3 px-6 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-[#292526] cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#F4B8C8]" />
          <span>Guardar Umbral</span>
        </button>
      </div>

      {/* Zonas Tarifarias de Correo Argentino */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shippingZones.map((zone) => (
          <div
            key={zone.id}
            className="p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-xs font-bold">
                  <Truck className="w-3.5 h-3.5 text-[#D4728C]" />
                  {zone.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                </span>
              </div>

              <p className="text-xs text-[#6B6568] leading-relaxed">
                <strong>Provincias incluidas:</strong>{" "}
                {zone.provinces.join(", ")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8]">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#D4728C]" />
                    Retiro en Sucursal (ARS)
                  </label>
                  <input
                    type="number"
                    value={zone.branch_pickup_price}
                    onChange={(e) =>
                      updateShippingZone({
                        ...zone,
                        branch_pickup_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#FCE7F3] text-sm font-bold"
                  />
                  <span className="text-[11px] text-[#6B6568] mt-1 block">
                    Actual: {formatARS(zone.branch_pickup_price)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8]">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4728C]" />
                    Envío a Domicilio (ARS)
                  </label>
                  <input
                    type="number"
                    value={zone.home_delivery_price}
                    onChange={(e) =>
                      updateShippingZone({
                        ...zone,
                        home_delivery_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#FCE7F3] text-sm font-bold"
                  />
                  <span className="text-[11px] text-[#6B6568] mt-1 block">
                    Actual: {formatARS(zone.home_delivery_price)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6568] mb-1">
                    Adicional por Kg extra (ARS)
                  </label>
                  <input
                    type="number"
                    value={zone.extra_kg_price}
                    onChange={(e) =>
                      updateShippingZone({
                        ...zone,
                        extra_kg_price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF9FB] border border-[#FCE7F3] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6568] mb-1">
                    Plazo estimado de entrega
                  </label>
                  <input
                    type="text"
                    value={zone.estimated_days}
                    onChange={(e) =>
                      updateShippingZone({
                        ...zone,
                        estimated_days: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF9FB] border border-[#FCE7F3] text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                toast.success(`Tarifas actualizadas para ${zone.name}`)
              }
              className="w-full py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#292526] transition cursor-pointer"
            >
              Guardar Tarifas de Zona
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
