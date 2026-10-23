"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

function ExitoContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "MC-1050";
  const method = searchParams.get("method") || "mercadopago";

  const orders = useStore((s) => s.orders);
  const settings = useStore((s) => s.settings);

  const order = orders.find((o) => o.order_number === orderNumber) || orders[0];

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado al portapapeles`);
  };

  const whatsappComprobanteUrl = `https://wa.me/${settings.whatsapp_number.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    `¡Hola Mirta Cosmética! Adjunto el comprobante de transferencia de mi pedido #${orderNumber} por ${
      order ? formatARS(order.total) : ""
    }.`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <div className="p-5 sm:p-10 rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-6 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#111111] text-[#F4B8C8] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-xs font-bold uppercase tracking-wider">
            Pedido Confirmado · #{orderNumber}
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-5xl font-semibold text-[#111111] mt-3">
            ¡Muchas gracias por elegir Mirta Cosmética!
          </h1>
          <p className="text-sm text-[#6B6568] mt-2 max-w-xl mx-auto">
            Te enviamos un correo electrónico mediante <strong>Resend</strong>{" "}
            con el resumen de tu compra. Apenas despachemos tu paquete en{" "}
            <strong>Correo Argentino</strong>, recibirás tu código Track &amp;
            Trace.
          </p>
        </div>

        {/* Si eligió Transferencia Bancaria, mostrar Alias y CBU con botón Copiar */}
        {method === "bank_transfer" && (
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#F4B8C8] text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4728C] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                Datos Bancarios para Transferir ({settings.transfer_discount_percent}% OFF Aplicado)
              </span>
              {order && (
                <span className="text-base sm:text-lg font-bold text-[#111111]">
                  Total: {formatARS(order.total)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FFF9FB] border border-[#FCE7F3] flex items-center justify-between">
                <div>
                  <p className="text-[#6B6568]">Alias</p>
                  <p className="font-mono font-bold text-sm text-[#111111]">
                    {settings.bank_alias}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.bank_alias, "Alias")}
                  className="p-2 rounded-lg bg-white border border-[#F4B8C8] hover:bg-[#FCE7F3] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF9FB] border border-[#FCE7F3] flex items-center justify-between">
                <div>
                  <p className="text-[#6B6568]">CBU / CVU</p>
                  <p className="font-mono font-bold text-sm text-[#111111]">
                    {settings.bank_cbu}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.bank_cbu, "CBU")}
                  className="p-2 rounded-lg bg-white border border-[#F4B8C8] hover:bg-[#FCE7F3] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-[#6B6568]">
                Titular: <strong>{settings.bank_holder}</strong> ·{" "}
                {settings.bank_name}
              </p>
              <a
                href={whatsappComprobanteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#262223] transition w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 text-[#F4B8C8]" />
                <span>Enviar comprobante por WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-[#FCE7F3]/50 border border-[#F4B8C8] flex items-center justify-center gap-2 text-xs text-[#111111]">
          <ShieldCheck className="w-4 h-4 text-[#D4728C] shrink-0" />
          <span>
            Tu pedido será preparado en empaque 100% discreto sin logos externos
            para tu tranquilidad.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <Link
            href={`/seguimiento?order=${encodeURIComponent(orderNumber)}`}
            className="px-6 py-3.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center"
          >
            <PackageSearch className="w-4 h-4 text-[#F4B8C8]" />
            <span>Seguir estado del envío</span>
          </Link>
          <Link
            href="/catalogo"
            className="px-6 py-3.5 rounded-full bg-white border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-wider w-full sm:w-auto text-center"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm">
          Cargando confirmación de tu compra...
        </div>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}
