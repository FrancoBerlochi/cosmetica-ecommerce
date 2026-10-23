"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

export function Footer() {
  const settings = useStore((s) => s.settings);
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("¡Bienvenida al Club Mirta Cosmética!", {
      description:
        "Te enviamos tu cupón BIENVENIDA15 para usar en tu primera compra.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-[#111111] text-white border-t border-[#F4B8C8]/30 mt-auto">
      {/* Franja de Confianza y Garantías */}
      <div className="border-b border-white/10 bg-[#181617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F4B8C8]/15 text-[#F4B8C8] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-editorial text-lg font-medium text-white">
                Envíos por Correo Argentino
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                A domicilio o retiro en la sucursal de Correo Argentino más
                cercana con seguimiento Track &amp; Trace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F4B8C8]/15 text-[#F4B8C8] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-editorial text-lg font-medium text-white">
                Empaque 100% Discreto
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Tus prendas íntimas viajan en cajas neutras y selladas sin logos
                ni descripciones externas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F4B8C8]/15 text-[#F4B8C8] shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-editorial text-lg font-medium text-white">
                Mercado Pago &amp; {settings.transfer_discount_percent}% OFF
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Aboná con todas las tarjetas vía Mercado Pago o aprovechá{" "}
                {settings.transfer_discount_percent}% de descuento por
                Transferencia.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F4B8C8]/15 text-[#F4B8C8] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif-editorial text-lg font-medium text-white">
                Fórmulas Dermatológicas
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Skin Care cruelty-free, libre de parabenos y formulado para
                pieles sensibles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal del Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="font-serif-editorial text-3xl font-semibold tracking-wider text-white">
              MIRTA COSMÉTICA
            </span>
            <p className="text-xs uppercase tracking-[0.25em] text-[#F4B8C8] mt-1">
              Lencería de Autor &amp; Skin Care
            </p>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Celebramos el ritual de cuidarte todos los días. Lencería diseñada
            para abrazar tu cuerpo y cosmética botánica de alta eficacia para
            una piel luminosa.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Camera className="w-3.5 h-3.5 text-[#F4B8C8]" />
              {settings.instagram_handle}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#F4B8C8]" />
              Envíos a toda Argentina
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#F4B8C8]">
            Colecciones
          </h5>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            <li>
              <Link
                href="/catalogo?categoria=lenceria"
                className="hover:text-[#F4B8C8] transition"
              >
                Lencería &amp; Conjuntos
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo?categoria=skincare"
                className="hover:text-[#F4B8C8] transition"
              >
                Skin Care Facial
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo?categoria=kits"
                className="hover:text-[#F4B8C8] transition"
              >
                Kits &amp; Rituales en Promo
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo"
                className="hover:text-[#F4B8C8] transition"
              >
                Catálogo Completo
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#F4B8C8]">
            Atención al Cliente
          </h5>
          <ul className="space-y-2.5 text-sm text-neutral-300">
            <li>
              <Link
                href="/seguimiento"
                className="hover:text-[#F4B8C8] transition"
              >
                Seguimiento Correo Argentino
              </Link>
            </li>
            <li>
              <Link href="/cuenta" className="hover:text-[#F4B8C8] transition">
                Mi Cuenta / Mis Pedidos
              </Link>
            </li>
            <li>
              <Link
                href="/cuenta/favoritos"
                className="hover:text-[#F4B8C8] transition"
              >
                Mi Lista de Deseos (Wishlist)
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-[#F4B8C8] transition">
                Acceso Administración (/admin)
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-widest text-[#F4B8C8]">
            Newsletter &amp; 15% OFF
          </h5>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Suscribite para recibir rutinas de skin care, lanzamientos de
            lencería y un cupón de regalo.
          </p>
          <form onSubmit={handleNewsletter} className="space-y-2 pt-1">
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#F4B8C8]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#F4B8C8] text-[#111111] text-xs font-bold uppercase tracking-wider hover:bg-[#FCE7F3] transition cursor-pointer"
            >
              Recibir mi beneficio
            </button>
          </form>
        </div>
      </div>

      {/* Pie legal */}
      <div className="border-t border-white/10 py-6 px-4 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {settings.brand_name}. Todos los
            derechos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-neutral-300">
              <Lock className="w-3 h-3 text-[#F4B8C8]" /> Mercado Pago Oficial
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-neutral-300">
              Correo Argentino Paq.ar / MiCorreo
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-neutral-300">
              Next.js 16 + Supabase + Resend
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
