"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const settings = useStore((s) => s.settings);
  const setCartOpen = useStore((s) => s.setCartOpen);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo?categoria=lenceria", label: "Lencería" },
    { href: "/catalogo?categoria=skincare", label: "Skin Care" },
    { href: "/catalogo?categoria=kits", label: "Kits & Rituales" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/seguimiento", label: "Seguimiento" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F4B8C8]/40">
      {/* Barra superior de anuncios */}
      <div className="bg-[#111111] text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0">
            <Truck className="w-3.5 h-3.5 text-[#F4B8C8] shrink-0" />
            <span>
              Envíos a todo el país por{" "}
              <strong className="text-[#F4B8C8]">Correo Argentino</strong> ·{" "}
              Envío Gratis desde{" "}
              <strong>{formatARS(settings.free_shipping_threshold)}</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-neutral-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B8C8]" />
              <strong className="text-white">
                {settings.transfer_discount_percent}% OFF
              </strong>{" "}
              abonando por Transferencia
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4B8C8]" />
              Empaque 100% discreto garantizado
            </span>
          </div>
        </div>
      </div>

      {/* Navegación Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Lado Izquierdo: Botón Menú Móvil + Marca / Logo Editorial */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 rounded-full text-[#111111] hover:bg-[#FCE7F3]/60 transition shrink-0 cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          <Link
            href="/"
            className="flex flex-col shrink-0 group select-none"
          >
            <span className="font-serif-editorial text-xl sm:text-2xl lg:text-[25px] xl:text-3xl font-semibold tracking-wider text-[#111111] leading-none whitespace-nowrap group-hover:text-[#D4728C] transition-colors">
              MIRTA COSMÉTICA
            </span>
            <span className="text-[8px] sm:text-[9px] xl:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-[#D4728C] font-semibold mt-0.5 sm:mt-1 whitespace-nowrap">
              Lingerie &amp; Skin Care
            </span>
          </Link>
        </div>

        {/* Centro: Enlaces Desktop con espaciado responsive y sin quiebres de línea */}
        <nav className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-6 2xl:gap-8 mx-2 xl:mx-4">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-medium transition-colors relative py-1.5 whitespace-nowrap tracking-wide ${
                  isActive
                    ? "text-[#111111] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#D4728C]"
                    : "text-[#6B6568] hover:text-[#111111]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Lado Derecho: Acciones de Usuario y Carrito */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <Link
            href="/admin"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF9FB] border border-[#F4B8C8] text-[#111111] hover:bg-[#FCE7F3] transition shrink-0 whitespace-nowrap"
          >
            Panel Admin
          </Link>

          <Link
            href="/seguimiento"
            className="hidden sm:flex p-2 sm:p-2.5 rounded-full text-[#111111] hover:bg-[#FFF9FB] transition"
            title="Seguimiento Correo Argentino"
          >
            <PackageSearch className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />
          </Link>

          <Link
            href="/cuenta/favoritos"
            className="relative p-2 sm:p-2.5 rounded-full text-[#111111] hover:bg-[#FFF9FB] transition"
            title="Mis Favoritos"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#D4728C] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center leading-none">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            href="/cuenta"
            className="hidden sm:flex p-2 sm:p-2.5 rounded-full text-[#111111] hover:bg-[#FFF9FB] transition"
            title="Mi Cuenta y Pedidos"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />
          </Link>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-[#111111] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold hover:bg-[#292526] transition cursor-pointer shrink-0"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F4B8C8]" />
            <span className="hidden sm:inline">Carrito</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#F4B8C8] text-[#111111] text-[10px] sm:text-[11px] font-bold leading-none">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#FCE7F3] px-4 pt-3 pb-6 space-y-1.5 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#111111] hover:bg-[#FFF9FB]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#FCE7F3] space-y-1">
            <Link
              href="/cuenta"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-[#111111] hover:bg-[#FFF9FB]"
            >
              <User className="w-4 h-4 text-[#D4728C]" />
              <span>Mi Cuenta &amp; Pedidos</span>
            </Link>
            <Link
              href="/seguimiento"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-[#111111] hover:bg-[#FFF9FB]"
            >
              <PackageSearch className="w-4 h-4 text-[#D4728C]" />
              <span>Rastrear Envío Correo Argentino</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#D4728C] bg-[#FFF9FB]"
            >
              <span>Acceso Panel Administrador (/admin)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
