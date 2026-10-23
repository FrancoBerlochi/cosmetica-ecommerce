"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function CartDrawer() {
  const cart = useStore((s) => s.cart);
  const isCartOpen = useStore((s) => s.isCartOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const applyCouponCode = useStore((s) => s.applyCouponCode);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const settings = useStore((s) => s.settings);

  const [couponInput, setCouponInput] = useState("");

  if (!isCartOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : Math.min(subtotal, appliedCoupon.discount_value)
    : 0;

  const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const transferDiscount = Math.round(
    (totalAfterCoupon * settings.transfer_discount_percent) / 100
  );
  const totalWithTransfer = Math.max(0, totalAfterCoupon - transferDiscount);

  const freeThreshold = settings.free_shipping_threshold || 65000;
  const remainingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeThreshold) * 100)
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput, subtotal);
    if (res.ok) {
      toast.success(res.message);
      setCouponInput("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between max-h-screen overflow-hidden">
          {/* Encabezado del Carrito */}
          <div className="p-4 sm:p-5 border-b border-[#FCE7F3] flex items-center justify-between bg-[#FFF9FB] shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                Tu Carrito
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#F4B8C8] text-[#111111]">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-[#FCE7F3] text-[#111111] transition cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso para Envío Gratis por Correo Argentino */}
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#FFF9FB] border-b border-[#FCE7F3] shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-[#111111] text-[11px] sm:text-xs">
                <Truck className="w-3.5 h-3.5 text-[#D4728C] shrink-0" />
                {remainingForFreeShipping === 0 ? (
                  <span>
                    ¡Tenés <strong>Envío Gratis</strong> (Correo Arg.)!
                  </span>
                ) : (
                  <span>
                    Faltan{" "}
                    <strong className="text-[#D4728C]">
                      {formatARS(remainingForFreeShipping)}
                    </strong>{" "}
                    para <strong>Envío Gratis</strong>
                  </span>
                )}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#6B6568]">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2 rounded-full bg-[#FCE7F3] overflow-hidden">
              <div
                className="h-full bg-[#111111] transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4728C]" />
                </div>
                <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium text-[#111111]">
                  Tu bolsa está vacía
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6568] mt-1 max-w-xs">
                  Descubrí nuestra colección de Lencería de autor y fórmulas de
                  Skin Care consciente.
                </p>
                <Link
                  href="/catalogo"
                  onClick={() => setCartOpen(false)}
                  className="mt-6 px-6 py-2.5 sm:py-3 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#292526] transition"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 p-3 rounded-2xl border border-[#FCE7F3] bg-white hover:border-[#F4B8C8] transition"
                >
                  <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#FFF9FB] shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <Link
                          href={`/producto/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-xs sm:text-sm font-semibold text-[#111111] hover:text-[#D4728C] line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(item.variantId);
                            toast.info(`${item.name} quitado del carrito`);
                          }}
                          className="text-neutral-400 hover:text-red-500 transition p-0.5 cursor-pointer shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#6B6568]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block shrink-0"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span className="truncate">
                          {item.size} · {item.colorName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="inline-flex items-center border border-[#F4B8C8] rounded-full bg-[#FFF9FB]">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="p-1 sm:p-1.5 text-[#111111] hover:bg-[#FCE7F3] rounded-l-full transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 sm:px-2.5 text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity >= item.maxStock) {
                              toast.warning(
                                `Stock máximo disponible: ${item.maxStock} u.`
                              );
                              return;
                            }
                            updateCartQuantity(
                              item.variantId,
                              item.quantity + 1
                            );
                          }}
                          className="p-1 sm:p-1.5 text-[#111111] hover:bg-[#FCE7F3] rounded-r-full transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold text-[#111111]">
                          {formatARS(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie del Carrito: Cupones, Resumen y Botón Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#FCE7F3] bg-[#FFF9FB] space-y-3 sm:space-y-4 shrink-0">
              {/* Campo de Cupón */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#FCE7F3]/70 border border-[#F4B8C8] text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#111111]">
                    <Tag className="w-3.5 h-3.5 text-[#D4728C]" />
                    {appliedCoupon.code} (-{formatARS(couponDiscount)})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      toast.info("Cupón quitado");
                    }}
                    className="text-[#D4728C] font-semibold hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupón (ej: MIRTA10)"
                    className="flex-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white border border-[#F4B8C8] text-xs focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-[#111111] text-[#111111] text-xs font-semibold hover:bg-[#111111] hover:text-white transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {/* Totales comparativos (Mercado Pago vs Transferencia) */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-xs text-[#6B6568]">
                  <span>Subtotal</span>
                  <span>{formatARS(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-[#D4728C] font-medium">
                    <span>Descuento cupón</span>
                    <span>-{formatARS(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-bold text-[#111111] pt-1 border-t border-[#FCE7F3]">
                  <span>Total con Mercado Pago</span>
                  <span>{formatARS(totalAfterCoupon)}</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#FCE7F3]/60 border border-[#F4B8C8]/70 text-[11px] sm:text-xs">
                  <span className="flex items-center gap-1 font-medium text-[#111111]">
                    <Sparkles className="w-3 h-3 text-[#D4728C]" />
                    Transferencia ({settings.transfer_discount_percent}% OFF)
                  </span>
                  <span className="font-bold text-[#111111] text-xs sm:text-sm">
                    {formatARS(totalWithTransfer)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#292526] transition shadow-md"
                >
                  <span>Iniciar Compra Segura</span>
                  <ArrowRight className="w-4 h-4 text-[#F4B8C8]" />
                </Link>
                <p className="text-[10px] sm:text-[11px] text-center text-[#6B6568] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#D4728C]" />
                  Correo Argentino (Domicilio/Sucursal) · Empaque discreto
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
