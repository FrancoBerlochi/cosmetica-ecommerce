"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Heart,
  LogOut,
  Mail,
  Package,
  ShieldCheck,
  Truck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getCorreoArgentinoTrackingUrl } from "@/lib/shipping/correo-argentino";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function CuentaPage() {
  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);

  const [email, setEmail] = useState("valentina.gomez@gmail.com");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("Valentina Gómez");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedUser, setLoggedUser] = useState<{
    name: string;
    email: string;
  } | null>({
    name: "Valentina Gómez",
    email: "valentina.gomez@gmail.com",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("¡Cuenta creada en Supabase Auth!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("¡Bienvenida nuevamente a Mirta Cosmética!");
      }
    } else {
      toast.success(
        isRegistering
          ? "¡Cuenta creada con éxito!"
          : "¡Sesión iniciada en Mirta Cosmética!"
      );
    }

    setLoggedUser({
      name: fullName || email.split("@")[0],
      email,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Columna Perfil / Login Opcional */}
        <div className="lg:col-span-4">
          {loggedUser ? (
            <div className="p-4 sm:p-6 rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F4B8C8] flex items-center justify-center font-serif-editorial text-2xl shrink-0">
                  {loggedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-[#D4728C] font-bold">
                    Clienta Mirta Cosmética
                  </span>
                  <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111] truncate">
                    {loggedUser.name}
                  </h2>
                  <p className="text-xs text-[#6B6568] truncate">{loggedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#FCE7F3] text-xs">
                <Link
                  href="/cuenta/favoritos"
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#FCE7F3] hover:border-[#F4B8C8] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D4728C]" />
                    Mis Favoritos (Wishlist)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FCE7F3]">
                    {wishlist.length}
                  </span>
                </Link>

                <Link
                  href="/seguimiento"
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#FCE7F3] hover:border-[#F4B8C8] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D4728C]" />
                    Rastrear Correo Argentino
                  </span>
                  <span>→</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoggedUser(null);
                  toast.info("Cerraste sesión");
                }}
                className="w-full py-2.5 rounded-full border border-[#111111] text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleAuth}
              className="p-4 sm:p-6 rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4728C]">
                <UserCheck className="w-4 h-4" />
                <span>Cuenta Opcional (Supabase Auth)</span>
              </div>
              <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
                {isRegistering ? "Crear mi cuenta" : "Iniciar Sesión"}
              </h2>
              <p className="text-xs text-[#6B6568]">
                Recordá que podés comprar sin registrarte (Guest Checkout), o
                iniciar sesión para guardar tus favoritos y direcciones.
              </p>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Nombre y Apellido
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6568] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isRegistering ? "Registrarme" : "Ingresar"}
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center text-xs text-[#D4728C] font-semibold hover:underline cursor-pointer"
              >
                {isRegistering
                  ? "¿Ya tenés cuenta? Iniciá sesión"
                  : "¿Primera vez? Creá tu cuenta gratis"}
              </button>
            </form>
          )}
        </div>

        {/* Columna Historial de Pedidos */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif-editorial text-3xl font-semibold text-[#111111]">
                Mis Pedidos Recientes
              </h1>
              <p className="text-xs text-[#6B6568]">
                Consultá el estado de tus compras y códigos de seguimiento de
                Correo Argentino
              </p>
            </div>
            <Package className="w-6 h-6 text-[#D4728C]" />
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-6 rounded-3xl bg-white border border-[#FCE7F3] hover:border-[#F4B8C8] transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#FCE7F3]">
                  <div>
                    <span className="text-xs font-bold text-[#D4728C]">
                      Pedido #{order.order_number}
                    </span>
                    <p className="text-xs text-[#6B6568]">
                      {new Date(order.created_at).toLocaleDateString("es-AR")} ·{" "}
                      {order.payment_method === "mercadopago"
                        ? "Mercado Pago"
                        : "Transferencia Bancaria"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-[11px] sm:text-xs font-bold">
                      {order.order_status === "shipped"
                        ? "Enviado por Correo Argentino"
                        : order.order_status === "paid"
                        ? "Pagado · En Preparación"
                        : "Pendiente de Acreditación"}
                    </span>
                    <span className="text-base font-bold text-[#111111]">
                      {formatARS(order.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-[#111111]"
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

                <div className="pt-3 border-t border-[#FCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#6B6568]">
                    <ShieldCheck className="w-4 h-4 text-[#D4728C] shrink-0" />
                    {order.shipping_method === "correo_sucursal"
                      ? `Correo Argentino Sucursal (${
                          order.shipping_address.branchName ||
                          order.shipping_address.city
                        })`
                      : `Correo Argentino Domicilio (${order.shipping_address.city})`}
                  </span>

                  {order.tracking_number ? (
                    <a
                      href={getCorreoArgentinoTrackingUrl(
                        order.tracking_number
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#111111] text-white font-semibold w-full sm:w-auto"
                    >
                      <span className="font-mono text-xs">
                        Track &amp; Trace: {order.tracking_number}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#F4B8C8] shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href={`/seguimiento?order=${encodeURIComponent(
                        order.order_number
                      )}`}
                      className="text-[#D4728C] font-semibold hover:underline"
                    >
                      Ver detalle del envío →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
