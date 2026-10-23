"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function AdminDashboardPage() {
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const updateVariantStock = useStore((s) => s.updateVariantStock);

  const totalRevenue = orders
    .filter((o) => o.payment_status === "approved" || o.order_status === "paid" || o.order_status === "shipped")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingShipmentCount = orders.filter(
    (o) =>
      (o.order_status === "paid" || o.order_status === "preparing") &&
      !o.tracking_number
  ).length;

  const pendingTransferCount = orders.filter(
    (o) =>
      o.payment_method === "bank_transfer" && o.payment_status === "pending"
  ).length;

  // Detectar variantes con bajo stock
  const lowStockVariants = products.flatMap((product) =>
    product.variants
      .filter((v) => v.stock <= product.low_stock_threshold)
      .map((variant) => ({
        productId: product.id,
        productName: product.name,
        productType: product.product_type,
        variantId: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color_name,
        stock: variant.stock,
      }))
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold">
            Panel de Control · Mirta Cosmética
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111] mt-1">
            Resumen Operativo de la Tienda
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/productos"
            className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#292526] transition text-center"
          >
            + Nuevo Producto
          </Link>
          <Link
            href="/admin/pedidos"
            className="px-5 py-2.5 rounded-full bg-white border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-wider hover:bg-[#FCE7F3] transition text-center"
          >
            Gestionar Pedidos
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#FCE7F3] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6568]">
              Ventas Acreditadas
            </span>
            <div className="p-2.5 rounded-2xl bg-[#FCE7F3] text-[#111111]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111111]">
            {formatARS(totalRevenue)}
          </p>
          <p className="text-[11px] text-[#6B6568]">
            Mercado Pago + Transferencias
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#FCE7F3] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6568]">
              Por Despachar (Correo Arg.)
            </span>
            <div className="p-2.5 rounded-2xl bg-[#FCE7F3] text-[#111111]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111111]">
            {pendingShipmentCount}
          </p>
          <p className="text-[11px] text-[#D4728C] font-semibold">
            Listos para asignar Track &amp; Trace
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#FCE7F3] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6568]">
              Transferencias Pendientes
            </span>
            <div className="p-2.5 rounded-2xl bg-[#FCE7F3] text-[#111111]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111111]">
            {pendingTransferCount}
          </p>
          <p className="text-[11px] text-[#6B6568]">
            Aguardando validación de comprobante
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#FCE7F3] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B6568]">
              Alertas de Bajo Stock
            </span>
            <div className="p-2.5 rounded-2xl bg-[#FCE7F3] text-[#D4728C]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111111]">
            {lowStockVariants.length}
          </p>
          <p className="text-[11px] text-[#6B6568]">
            Variantes con pocas unidades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel de Alertas de Bajo Stock con Reposición Rápida */}
        <div className="lg:col-span-6 p-4 sm:p-6 rounded-3xl bg-white border border-[#F4B8C8] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D4728C]" />
              <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
                Alertas de Bajo Stock por Talle
              </h2>
            </div>
            <Link
              href="/admin/productos"
              className="text-xs font-bold text-[#D4728C] hover:underline"
            >
              Ver inventario →
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#FFF9FB] text-center text-xs text-[#6B6568] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Todas las variantes tienen stock saludable.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockVariants.map((item) => (
                <div
                  key={item.variantId}
                  className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-[#111111]">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-[#6B6568]">
                      Talle: <strong>{item.size}</strong> · {item.color} (SKU:{" "}
                      {item.sku})
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-xs font-bold">
                      {item.stock} u.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateVariantStock(
                          item.productId,
                          item.variantId,
                          item.stock + 5
                        );
                        toast.success(
                          `Se sumaron +5 unidades a ${item.productName} (${item.size})`
                        );
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#111111] text-white text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-[#2a2527] cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#F4B8C8]" />5 u.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Pedidos y Despacho Correo Argentino */}
        <div className="lg:col-span-6 p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
                Últimos Pedidos Recibidos
              </h2>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-bold text-[#D4728C] hover:underline flex items-center gap-1"
            >
              <span>Ir a Pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111111]">
                      #{order.order_number}
                    </span>
                    <span className="text-xs text-[#6B6568]">
                      · {order.customer_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6568] mt-0.5">
                    {order.shipping_method === "correo_sucursal"
                      ? "Correo Argentino (Sucursal)"
                      : "Correo Argentino (Domicilio)"}{" "}
                    ·{" "}
                    {order.tracking_number
                      ? `Track: ${order.tracking_number}`
                      : "Sin código de seguimiento aún"}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <p className="text-xs font-bold text-[#111111]">
                    {formatARS(order.total)}
                  </p>
                  <Link
                    href="/admin/pedidos"
                    className="text-[11px] text-[#D4728C] font-semibold hover:underline"
                  >
                    Gestionar →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
