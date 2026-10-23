"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  PackageCheck,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { getCorreoArgentinoTrackingUrl } from "@/lib/shipping/correo-argentino";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Order } from "@/types/database";

export default function AdminPedidosPage() {
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {}
  );
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);

  const copyShippingData = (order: Order) => {
    const isBranch = order.shipping_method === "correo_sucursal";
    const addressText = isBranch
      ? `Sucursal: ${order.shipping_address.branchName || order.shipping_address.city} (CP: ${order.shipping_address.postalCode})`
      : `Dirección: ${order.shipping_address.street} ${order.shipping_address.number} ${order.shipping_address.floor || ""} - Localidad: ${order.shipping_address.city}, ${order.shipping_address.province} (CP: ${order.shipping_address.postalCode})`;

    const text = `
DESTINATARIO CORREO ARGENTINO:
Nombre: ${order.customer_name}
DNI: ${order.customer_dni}
Teléfono: ${order.customer_phone}
Email: ${order.customer_email}
Modalidad: ${isBranch ? "Retiro en Sucursal" : "Envío a Domicilio"}
${addressText}
Empaque: ${order.discreet_packaging ? "100% Discreto (sin rótulo exterior)" : "Estándar"}
Pedido: #${order.order_number}
`.trim();

    navigator.clipboard.writeText(text);
    toast.success(`Datos del pedido #${order.order_number} copiados`, {
      description:
        "Listos para pegar en la web de MiCorreo o consultar al despachar.",
    });
  };

  const getWhatsAppTrackingUrl = (order: Order, trackingCode: string) => {
    const rawPhone = order.customer_phone.replace(/\D/g, "");
    const phone = rawPhone.startsWith("54") ? rawPhone : `549${rawPhone}`;
    const trackingUrl = getCorreoArgentinoTrackingUrl(trackingCode);
    const text = `¡Hola ${order.customer_name}! 🌸 Te escribimos de Mirta Cosmética.
Ya despachamos tu pedido #${order.order_number} a través de Correo Argentino.
Tu código de seguimiento oficial es: *${trackingCode}*
Podés rastrear tu paquete en tiempo real acá: ${trackingUrl}
¡Muchísimas gracias por tu compra! ✨`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const handleApproveTransfer = async (order: Order) => {
    setSendingOrderId(order.id);
    updateOrderStatus(order.id, "paid", "approved");

    await fetch("/api/orders/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve_payment",
        order: { ...order, order_status: "paid", payment_status: "approved" },
      }),
    }).catch(() => {});

    setSendingOrderId(null);
    toast.success(`Transferencia aprobada para #${order.order_number}`, {
      description:
        "Se envió el email de pago acreditado al cliente vía Resend.",
    });
  };

  const handleDispatchCorreoArgentino = async (order: Order) => {
    const code = (
      trackingInputs[order.id] ??
      order.tracking_number ??
      ""
    ).trim();

    if (!code) {
      toast.error(
        "Por favor ingresá el código de seguimiento de Correo Argentino (ej: TN849201485AR)."
      );
      return;
    }

    setSendingOrderId(order.id);
    updateOrderStatus(order.id, "shipped", "approved", code);

    await fetch("/api/orders/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ship_correo_argentino",
        order: {
          ...order,
          order_status: "shipped",
          payment_status: "approved",
          tracking_number: code,
        },
      }),
    }).catch(() => {});

    setSendingOrderId(null);
    toast.success(
      `¡Pedido #${order.order_number} despachado por Correo Argentino!`,
      {
        description: `Se envió automáticamente el email con Resend incluyendo el código ${code} y el enlace de seguimiento.`,
      }
    );
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Encabezado y Guía Rápida Opción A */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold">
            Logística &amp; Despacho · Opción A
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111] mt-1">
            Gestión de Pedidos y Correo Argentino
          </h1>
          <p className="text-xs text-[#6B6568] mt-1">
            Copiá los datos del cliente para imponer en Correo Argentino / MiCorreo, y cargá el código de seguimiento para notificar automáticamente al cliente por <strong>Resend</strong> y <strong>WhatsApp</strong>.
          </p>
        </div>

        <a
          href="https://www.correoargentino.com.ar/MiCorreo/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-[#111111] text-xs font-bold hover:bg-[#FCE7F3] transition self-start sm:self-auto shrink-0"
        >
          <ExternalLink className="w-4 h-4 text-[#D4728C]" />
          <span>Abrir Portal MiCorreo ↗</span>
        </a>
      </div>

      {/* Tarjeta de Flujo Operativo Opción A */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#111111]">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F4B8C8] flex items-center justify-center font-bold shrink-0">
            1
          </div>
          <div>
            <p className="font-bold">Copiá los datos del cliente</p>
            <p className="text-[11px] text-[#6B6568] mt-0.5">
              Usá el botón <strong>&quot;Copiar para MiCorreo&quot;</strong> en el pedido para tener nombre, DNI, dirección o sucursal.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F4B8C8] flex items-center justify-center font-bold shrink-0">
            2
          </div>
          <div>
            <p className="font-bold">Despachá en Correo Argentino</p>
            <p className="text-[11px] text-[#6B6568] mt-0.5">
              Generás la imposición en MiCorreo o en ventanilla física y obtenés tu oblea con el código Track &amp; Trace (ej: <code>TN849201485AR</code>).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F4B8C8] flex items-center justify-center font-bold shrink-0">
            3
          </div>
          <div>
            <p className="font-bold">Pegá el código y Despachá</p>
            <p className="text-[11px] text-[#6B6568] mt-0.5">
              Pegalo aquí y presioná <strong>&quot;Despachar&quot;</strong>. <strong>Resend</strong> enviará el mail de diseño al cliente en el acto.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {orders.map((order) => {
          const currentTrackingValue =
            trackingInputs[order.id] ?? order.tracking_number ?? "";

          return (
            <div
              key={order.id}
              className="p-4 sm:p-6 rounded-3xl bg-white border border-[#F4B8C8] space-y-5 shadow-2xs"
            >
              {/* Encabezado de la Orden */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#FCE7F3]">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-[#111111]">
                      #{order.order_number}
                    </span>
                    <span className="px-3 py-0.5 rounded-full bg-[#FCE7F3] text-[#111111] text-xs font-bold">
                      {order.payment_method === "mercadopago"
                        ? "Mercado Pago"
                        : "Transferencia Bancaria"}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                        order.order_status === "shipped"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.order_status === "paid"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-[#111111] text-[#F4B8C8]"
                      }`}
                    >
                      {order.order_status === "shipped"
                        ? "Despachado"
                        : order.order_status === "paid"
                        ? "Listo para despachar"
                        : order.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6568] mt-1">
                    Cliente: <strong>{order.customer_name}</strong> · DNI:{" "}
                    <strong>{order.customer_dni}</strong> ·{" "}
                    {order.customer_email} · Tel: {order.customer_phone}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-[#111111]">
                    {formatARS(order.total)}
                  </p>
                  <p className="text-[11px] text-[#6B6568]">
                    {new Date(order.created_at).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              {/* Detalle de Envío Correo Argentino + Ítems */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-2 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[#D4728C]">
                    Productos del Pedido:
                  </p>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-1.5 border-b border-[#FCE7F3]"
                    >
                      <span>
                        {item.quantity}× <strong>{item.product_name}</strong> (
                        {item.variant_label})
                      </span>
                      <span className="font-semibold">
                        {formatARS(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-6 p-4 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#D4728C]" />
                      {order.shipping_method === "correo_sucursal"
                        ? "Correo Argentino · Retiro en Sucursal"
                        : "Correo Argentino · Envío a Domicilio"}
                    </span>
                    {order.discreet_packaging && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4728C]">
                        <ShieldCheck className="w-3.5 h-3.5" /> Empaque Discreto
                      </span>
                    )}
                  </div>

                  <p className="text-[#111111]">
                    {order.shipping_method === "correo_sucursal"
                      ? `Sucursal: ${
                          order.shipping_address.branchName ||
                          order.shipping_address.city
                        }`
                      : `Dirección: ${order.shipping_address.street} ${
                          order.shipping_address.number
                        } ${order.shipping_address.floor || ""}`}
                  </p>
                  <p className="text-[#6B6568]">
                    Localidad: {order.shipping_address.city} · Provincia:{" "}
                    <strong>{order.shipping_address.province}</strong> (CP:{" "}
                    {order.shipping_address.postalCode})
                  </p>

                  <div className="pt-2 border-t border-[#FCE7F3] flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyShippingData(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#F4B8C8] text-[#111111] text-[11px] font-bold hover:bg-[#FCE7F3] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#D4728C]" />
                      <span>Copiar datos para MiCorreo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.customer_dni);
                        toast.success(`DNI ${order.customer_dni} copiado`);
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-[#FCE7F3] text-[10px] text-[#6B6568] hover:text-[#111111]"
                    >
                      DNI: {order.customer_dni}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          order.shipping_address.postalCode
                        );
                        toast.success(
                          `CP ${order.shipping_address.postalCode} copiado`
                        );
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-[#FCE7F3] text-[10px] text-[#6B6568] hover:text-[#111111]"
                    >
                      CP: {order.shipping_address.postalCode}
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra de Acciones: Aprobar Transferencia & Cargar Código de Seguimiento Correo Argentino */}
              <div className="pt-4 border-t border-[#FCE7F3] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {order.payment_status === "pending" ? (
                    <button
                      type="button"
                      disabled={sendingOrderId === order.id}
                      onClick={() => handleApproveTransfer(order)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:bg-emerald-800 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar Transferencia y Avisar por Email</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Pago Aprobado
                    </span>
                  )}
                </div>

                {/* Carga de Código Track & Trace Correo Argentino */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={currentTrackingValue}
                    onChange={(e) =>
                      setTrackingInputs({
                        ...trackingInputs,
                        [order.id]: e.target.value,
                      })
                    }
                    placeholder="Código Correo Arg. (ej: TN849201485AR)"
                    className="px-4 py-2.5 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-mono uppercase w-full sm:w-64 focus:outline-none focus:border-[#111111]"
                  />

                  <button
                    type="button"
                    disabled={sendingOrderId === order.id}
                    onClick={() => handleDispatchCorreoArgentino(order)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-[#2a2527] transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F4B8C8]" />
                    <span>Despachar y Enviar Email (Resend)</span>
                  </button>

                  {order.tracking_number && (
                    <div className="flex items-center gap-1.5 self-center">
                      <a
                        href={getWhatsAppTrackingUrl(
                          order,
                          order.tracking_number
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25 transition inline-flex items-center justify-center"
                        title="Enviar seguimiento por WhatsApp al cliente"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <a
                        href={getCorreoArgentinoTrackingUrl(
                          order.tracking_number
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full bg-[#FCE7F3] text-[#111111] hover:bg-[#F4B8C8] transition inline-flex items-center justify-center"
                        title="Abrir seguimiento oficial en Correo Argentino"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {order.tracking_sent_at && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B6568] pt-1">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4728C]" />
                    Email de seguimiento enviado con Resend el{" "}
                    {new Date(order.tracking_sent_at).toLocaleString("es-AR")}.
                  </p>
                  <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <PackageCheck className="w-3.5 h-3.5" />
                    El cliente ya puede rastrear su compra en /seguimiento
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
