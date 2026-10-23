"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getCorreoArgentinoTrackingUrl } from "@/lib/shipping/correo-argentino";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("order") || "MC-1042";

  const orders = useStore((s) => s.orders);
  const [query, setQuery] = useState(initialQuery);

  const matchedOrder = orders.find(
    (o) =>
      o.order_number.toLowerCase() === query.trim().toLowerCase() ||
      (o.tracking_number &&
        o.tracking_number.toLowerCase() === query.trim().toLowerCase()) ||
      o.customer_email.toLowerCase() === query.trim().toLowerCase()
  );

  const steps = [
    { id: "awaiting_payment", label: "Pedido Recibido" },
    { id: "paid", label: "Pago Confirmado" },
    { id: "preparing", label: "Empaque Discreto" },
    { id: "shipped", label: "Despachado Correo Arg." },
    { id: "delivered", label: "Entregado" },
  ];

  const currentStepIndex = matchedOrder
    ? Math.max(
        0,
        steps.findIndex((s) => s.id === matchedOrder.order_status)
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          Logística Oficial · Correo Argentino
        </span>
        <h1 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111]">
          Seguimiento de tu Pedido
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6568] max-w-xl mx-auto">
          Ingresá tu número de orden (ej. <strong>MC-1042</strong>), código
          Track &amp; Trace de Correo Argentino o tu email de compra.
        </p>
      </div>

      {/* Buscador */}
      <div className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B6568] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: MC-1042 o TN849201485AR"
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {matchedOrder ? (
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-[#FCE7F3]">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#D4728C] font-bold">
                Orden #{matchedOrder.order_number}
              </span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                Destinatario: {matchedOrder.customer_name}
              </h2>
              <p className="text-xs text-[#6B6568] mt-0.5">
                Modalidad:{" "}
                <strong>
                  {matchedOrder.shipping_method === "correo_sucursal"
                    ? `Correo Argentino · Retiro en Sucursal (${
                        matchedOrder.shipping_address.branchName ||
                        matchedOrder.shipping_address.city
                      })`
                    : `Correo Argentino · Envío a Domicilio (${matchedOrder.shipping_address.street} ${matchedOrder.shipping_address.number}, ${matchedOrder.shipping_address.city})`}
                </strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-[#111111] text-[#F4B8C8] text-[11px] sm:text-xs font-bold uppercase">
                {matchedOrder.order_status === "shipped"
                  ? "En Camino por Correo Argentino"
                  : matchedOrder.order_status === "paid"
                  ? "Pago Acreditado · Preparando"
                  : matchedOrder.order_status === "awaiting_payment"
                  ? "Aguardando acreditación"
                  : matchedOrder.order_status}
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#111111] mt-1.5 sm:mt-2">
                Total: {formatARS(matchedOrder.total)}
              </p>
            </div>
          </div>

          {/* Línea de Tiempo de Progreso Responsiva */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {steps.map((step, index) => {
              const completed = index <= currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center space-y-1 ${
                    completed
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-white text-[#6B6568] border-[#FCE7F3]"
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto ${
                      completed ? "text-[#F4B8C8]" : "text-neutral-300"
                    }`}
                  />
                  <p className="text-[11px] sm:text-xs font-semibold leading-tight">{step.label}</p>
                </div>
              );
            })}
          </div>

          {/* Bloque de Código Track & Trace de Correo Argentino */}
          {matchedOrder.tracking_number ? (
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-[#F4B8C8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FCE7F3] text-[#111111] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6B6568] font-semibold">
                    Código Track &amp; Trace · Correo Argentino
                  </p>
                  <p className="text-base sm:text-xl font-mono font-bold text-[#111111] tracking-wider">
                    {matchedOrder.tracking_number}
                  </p>
                </div>
              </div>

              <a
                href={getCorreoArgentinoTrackingUrl(
                  matchedOrder.tracking_number
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-[#262223] transition text-center"
              >
                <span>Ver en Correo Argentino Oficial</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F4B8C8]" />
              </a>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#FCE7F3] flex items-center gap-2.5 text-xs text-[#6B6568]">
              <Package className="w-5 h-5 text-[#D4728C] shrink-0" />
              <span>
                Tu pedido está en preparación. Apenas ingrese a{" "}
                <strong>Correo Argentino</strong> verás aquí tu código Track
                &amp; Trace y lo recibirás por email vía <strong>Resend</strong>.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#6B6568]">
            <ShieldCheck className="w-4 h-4 text-[#D4728C] shrink-0" />
            <span>
              Empaque 100% discreto verificado · Sin logos ni descripción del
              contenido en la etiqueta exterior.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] text-center space-y-2">
          <p className="font-serif-editorial text-xl sm:text-2xl text-[#111111]">
            No encontramos un pedido con &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-[#6B6568]">
            Probá ingresando el pedido de demostración <strong>MC-1042</strong>{" "}
            o <strong>MC-1043</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm">
          Cargando buscador de seguimiento Correo Argentino...
        </div>
      }
    >
      <SeguimientoContent />
    </Suspense>
  );
}
