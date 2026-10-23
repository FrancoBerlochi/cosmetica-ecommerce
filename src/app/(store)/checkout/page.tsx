"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ARGENTINA_PROVINCES } from "@/lib/mock-data";
import { getBranchesByProvince } from "@/lib/shipping/correo-argentino";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import {
  CorreoArgentinoQuote,
  Order,
  PaymentMethodType,
  ShippingMethodType,
} from "@/types/database";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const applyCouponCode = useStore((s) => s.applyCouponCode);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const shippingZones = useStore((s) => s.shippingZones);
  const settings = useStore((s) => s.settings);
  const addOrder = useStore((s) => s.addOrder);
  const clearCart = useStore((s) => s.clearCart);

  // Datos del comprador (Guest Checkout)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDni, setCustomerDni] = useState("");

  // Datos de envío Correo Argentino
  const [province, setProvince] = useState("Ciudad Autónoma de Buenos Aires");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodType>("correo_sucursal");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [discreetPackaging, setDiscreetPackaging] = useState(true);
  const [notes, setNotes] = useState("");

  // Cotizaciones Correo Argentino
  const [quotes, setQuotes] = useState<CorreoArgentinoQuote[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("mercadopago");
  const [couponInput, setCouponInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalWeightGrams = cart.reduce(
    (sum, item) => sum + item.weightGrams * item.quantity,
    0
  );

  const availableBranches = getBranchesByProvince(province);

  useEffect(() => {
    if (availableBranches.length > 0) {
      setSelectedBranch(
        `${availableBranches[0].name} (${availableBranches[0].address})`
      );
    }
  }, [province]);

  // Recalcular cotizaciones de Correo Argentino cuando cambia provincia, CP o subtotal
  useEffect(() => {
    let active = true;
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        province,
        postalCode,
        totalWeightGrams,
        cartSubtotal: subtotal,
        freeShippingThreshold: settings.free_shipping_threshold,
        zones: shippingZones,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [
    province,
    postalCode,
    totalWeightGrams,
    subtotal,
    settings.free_shipping_threshold,
    shippingZones,
  ]);

  const activeQuote =
    quotes.find((q) => q.method === shippingMethod) || quotes[0];
  const shippingCost = activeQuote ? activeQuote.price : 0;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : Math.min(subtotal, appliedCoupon.discount_value)
    : 0;

  const afterCoupon = Math.max(0, subtotal - couponDiscount);
  const transferDiscount =
    paymentMethod === "bank_transfer"
      ? Math.round((afterCoupon * settings.transfer_discount_percent) / 100)
      : 0;

  const finalTotal = Math.max(
    0,
    afterCoupon - transferDiscount + shippingCost
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim() ||
      !customerDni.trim()
    ) {
      toast.error(
        "Por favor completá tus datos de contacto y DNI para Correo Argentino."
      );
      return;
    }

    if (
      shippingMethod === "correo_domicilio" &&
      (!street.trim() || !streetNumber.trim())
    ) {
      toast.error(
        "Por favor ingresá la calle y altura para el envío a domicilio por Correo Argentino."
      );
      return;
    }

    setSubmitting(true);

    const orderNumber = `MC-${Math.floor(1050 + Math.random() * 8900)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_email: customerEmail.trim(),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_dni: customerDni.trim(),
      shipping_method: shippingMethod,
      shipping_address: {
        street:
          shippingMethod === "correo_sucursal"
            ? "Retiro en Sucursal Correo Argentino"
            : street.trim(),
        number: shippingMethod === "correo_sucursal" ? "S/N" : streetNumber.trim(),
        floor: floor.trim() || undefined,
        city: city.trim() || province,
        province,
        postalCode: postalCode.trim() || "1000",
        branchName:
          shippingMethod === "correo_sucursal" ? selectedBranch : undefined,
      },
      shipping_cost: shippingCost,
      tracking_number: null,
      discreet_packaging: discreetPackaging,
      payment_method: paymentMethod,
      payment_status:
        paymentMethod === "mercadopago" ? "approved" : "pending",
      coupon_code: appliedCoupon?.code || null,
      subtotal,
      discount_amount: couponDiscount,
      transfer_discount_amount: transferDiscount,
      total: finalTotal,
      order_status:
        paymentMethod === "mercadopago" ? "paid" : "awaiting_payment",
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
      items: cart.map((item, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.name,
        variant_label: `${item.size} · ${item.colorName}`,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.unitPrice * item.quantity,
        image: item.image,
      })),
    };

    try {
      // Guardar en estado local y descontar stock
      addOrder(newOrder);

      // Llamar al backend para crear preferencia de Mercado Pago, guardar en Supabase y enviar Email con Resend
      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: newOrder,
          settings,
        }),
      });

      const data = await response.json();
      clearCart();

      toast.success(`¡Pedido #${orderNumber} registrado con éxito!`, {
        description:
          "Enviamos el comprobante y detalle a tu correo electrónico vía Resend.",
      });

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push(
          `/checkout/exito?order=${encodeURIComponent(
            orderNumber
          )}&method=${paymentMethod}`
        );
      }
    } catch {
      toast.error("Ocurrió un error al procesar tu pedido. Intentá nuevamente.");
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111]">
          No tenés productos en tu carrito
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6568]">
          Agregá tus favoritos de Lencería o Skin Care antes de pasar por el
          checkout.
        </p>
        <Link
          href="/catalogo"
          className="inline-block px-7 py-3.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
          Checkout Seguro · Mirta Cosmética
        </span>
        <h1 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] mt-1">
          Finalizar Compra
        </h1>
        <p className="text-[11px] sm:text-xs text-[#6B6568] mt-1">
          Compra rápida sin registro obligatorio (Guest Checkout) · Datos
          protegidos
        </p>
      </div>

      <form
        onSubmit={handleSubmitOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10"
      >
        {/* Columna Izquierda: 3 Pasos del Checkout */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* PASO 1: Datos de Contacto y DNI para Correo Argentino */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111111] text-[#F4B8C8] text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                Datos de Contacto y Destinatario
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Nombre y Apellido (DNI) *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Valentina Gómez"
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  DNI (Para Correo Argentino) *
                </label>
                <input
                  type="text"
                  required
                  value={customerDni}
                  onChange={(e) => setCustomerDni(e.target.value)}
                  placeholder="Sin puntos, ej: 40123456"
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Correo Electrónico (Tracking) *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  WhatsApp / Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 11 5678 4321"
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* PASO 2: Envío Exclusivo por Correo Argentino */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111111] text-[#F4B8C8] text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                    Envío por Correo Argentino
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#6B6568]">
                    Retiro en Sucursal Oficial o entrega a Domicilio
                  </p>
                </div>
              </div>
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4728C] shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Provincia *
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                >
                  {ARGENTINA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Código Postal *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ej: 1425"
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            {/* Tarjetas de Modalidad Correo Argentino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {quotes.map((quote) => {
                const selected = shippingMethod === quote.method;
                return (
                  <button
                    key={quote.method}
                    type="button"
                    onClick={() => setShippingMethod(quote.method)}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selected
                        ? "bg-[#111111] text-white border-[#111111] shadow-md"
                        : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FCE7F3]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {quote.method === "correo_sucursal" ? (
                          <Building2 className="w-4 h-4 text-[#F4B8C8] shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#F4B8C8] shrink-0" />
                        )}
                        <span className="text-xs font-bold leading-tight">{quote.label}</span>
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold shrink-0 ${
                          selected ? "text-[#F4B8C8]" : "text-[#111111]"
                        }`}
                      >
                        {quote.isFree ? "GRATIS" : formatARS(quote.price)}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] sm:text-[11px] mt-1.5 leading-relaxed ${
                        selected ? "text-neutral-300" : "text-[#6B6568]"
                      }`}
                    >
                      {quote.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Campos condicionales según Sucursal vs Domicilio */}
            {shippingMethod === "correo_sucursal" ? (
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#F4B8C8] space-y-2.5 sm:space-y-3">
                <label className="block text-xs font-bold text-[#111111]">
                  Seleccioná la Sucursal de Correo Argentino donde retirás:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-medium text-[#111111]"
                >
                  {availableBranches.map((b) => (
                    <option
                      key={b.code}
                      value={`${b.name} (${b.address})`}
                    >
                      {b.name} — {b.address} ({b.locality})
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-[11px] sm:text-xs text-[#6B6568] mb-1">
                    Localidad / Otra sucursal preferida:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Sucursal Correo Argentino de mi localidad"
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#FCE7F3] text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#F4B8C8]">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Calle *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ej: Av. Santa Fe"
                    className="w-full px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Altura / N° *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    placeholder="Ej: 4278"
                    className="w-full px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Piso / Depto
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="Ej: 4° B"
                    className="w-full px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Localidad / Barrio *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Palermo"
                    className="w-full px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
              </div>
            )}

            {/* Garantía de Empaque Discreto */}
            <label className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FCE7F3]/50 border border-[#F4B8C8] cursor-pointer">
              <input
                type="checkbox"
                checked={discreetPackaging}
                onChange={(e) => setDiscreetPackaging(e.target.checked)}
                className="mt-0.5 sm:mt-1 accent-[#111111]"
              />
              <div className="text-[11px] sm:text-xs">
                <span className="font-bold text-[#111111] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4728C] shrink-0" />
                  Empaque 100% Discreto (Sin cargo adicional)
                </span>
                <p className="text-[#6B6568] mt-0.5">
                  Caja cerrada de seguridad sin logos de lencería ni detalle de
                  prendas en la etiqueta exterior.
                </p>
              </div>
            </label>
          </div>

          {/* PASO 3: Método de Pago (Mercado Pago vs Transferencia Bancaria) */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111111] text-[#F4B8C8] text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                Método de Pago
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago")}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === "mercadopago"
                    ? "bg-[#111111] text-white border-[#111111] shadow-md"
                    : "bg-white text-[#111111] border-[#F4B8C8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Mercado Pago Checkout Pro
                  </span>
                  <CreditCard className="w-4 h-4 text-[#F4B8C8]" />
                </div>
                <p
                  className={`text-[11px] sm:text-xs mt-1.5 sm:mt-2 ${
                    paymentMethod === "mercadopago"
                      ? "text-neutral-300"
                      : "text-[#6B6568]"
                  }`}
                >
                  Tarjetas de crédito, débito y dinero en cuenta con
                  acreditación instantánea.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition cursor-pointer ${
                  paymentMethod === "bank_transfer"
                    ? "bg-[#111111] text-white border-[#111111] shadow-md"
                    : "bg-white text-[#111111] border-[#F4B8C8]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Transferencia Bancaria
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F4B8C8] text-[#111111] text-[10px] font-bold">
                    -{settings.transfer_discount_percent}% OFF
                  </span>
                </div>
                <p
                  className={`text-[11px] sm:text-xs mt-1.5 sm:mt-2 ${
                    paymentMethod === "bank_transfer"
                      ? "text-neutral-300"
                      : "text-[#6B6568]"
                  }`}
                >
                  Ahorrás{" "}
                  <strong>
                    {formatARS(
                      Math.round(
                        (afterCoupon * settings.transfer_discount_percent) / 100
                      )
                    )}
                  </strong>{" "}
                  transfiriendo al Alias{" "}
                  <strong className="font-mono">{settings.bank_alias}</strong>.
                </p>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Notas adicionales para tu pedido (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Es para regalo / Timbre 2B..."
                className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen del Pedido */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-4 sm:space-y-6 shadow-sm">
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
              Resumen de tu Compra
            </h3>

            <div className="space-y-2.5 sm:space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between gap-2.5 sm:gap-3 py-1.5 sm:py-2 border-b border-[#FCE7F3]"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="relative w-10 h-12 sm:w-12 sm:h-14 rounded-xl overflow-hidden bg-white shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111111] truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#6B6568] truncate">
                        {item.size} · {item.colorName} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#111111] shrink-0">
                    {formatARS(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cupón de Descuento */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#FCE7F3] text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#111111]">
                  <Tag className="w-3.5 h-3.5 text-[#D4728C]" />
                  {appliedCoupon.code} (-{formatARS(couponDiscount)})
                </span>
                <button
                  type="button"
                  onClick={() => removeCoupon()}
                  className="text-[#D4728C] font-bold hover:underline cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Cupón (ej: MIRTA10)"
                  className="flex-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white border border-[#F4B8C8] text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const res = applyCouponCode(couponInput, subtotal);
                    if (res.ok) {
                      toast.success(res.message);
                      setCouponInput("");
                    } else {
                      toast.error(res.message);
                    }
                  }}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#111111] text-white text-xs font-semibold cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            )}

            {/* Desglose de Costos */}
            <div className="space-y-1.5 text-sm pt-2 border-t border-[#FCE7F3]">
              <div className="flex justify-between text-xs text-[#6B6568]">
                <span>Subtotal productos</span>
                <span>{formatARS(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-[#D4728C] font-semibold">
                  <span>Cupón ({appliedCoupon?.code})</span>
                  <span>-{formatARS(couponDiscount)}</span>
                </div>
              )}

              {transferDiscount > 0 && (
                <div className="flex justify-between text-xs text-[#D4728C] font-semibold">
                  <span>
                    Descuento Transferencia (
                    {settings.transfer_discount_percent}% OFF)
                  </span>
                  <span>-{formatARS(transferDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-[#6B6568]">
                <span>
                  Envío (
                  {shippingMethod === "correo_sucursal"
                    ? "Sucursal"
                    : "Domicilio"}
                  )
                </span>
                <span className="font-semibold text-[#111111]">
                  {shippingCost === 0 ? "GRATIS" : formatARS(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-base sm:text-lg font-bold text-[#111111] pt-2 sm:pt-3 border-t border-[#F4B8C8]">
                <span>Total a Pagar</span>
                <span className="text-xl sm:text-2xl">{formatARS(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#272324] transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F4B8C8]" />
              <span className="truncate">
                {submitting
                  ? "Procesando..."
                  : paymentMethod === "mercadopago"
                  ? `Pagar ${formatARS(finalTotal)} con Mercado Pago`
                  : `Confirmar por Transferencia (${formatARS(finalTotal)})`}
              </span>
            </button>

            <p className="text-[10px] sm:text-[11px] text-center text-[#6B6568] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D4728C] shrink-0" />
              Recibirás la confirmación y tracking de Correo Argentino por
              email.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
