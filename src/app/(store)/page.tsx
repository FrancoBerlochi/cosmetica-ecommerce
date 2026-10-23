"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_CATEGORIES } from "@/lib/mock-data";
import { useStore } from "@/store/useStore";

export default function HomePage() {
  const products = useStore((s) => s.products);
  const reviews = useStore((s) => s.reviews);
  const settings = useStore((s) => s.settings);

  const [activeTab, setActiveTab] = useState<
    "all" | "lingerie" | "skincare" | "bundle"
  >("all");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("Sensible");

  const activeProducts = products.filter((p) => p.is_active);
  const filteredProducts =
    activeTab === "all"
      ? activeProducts
      : activeProducts.filter((p) => p.product_type === activeTab);

  const skinRoutineMatches = activeProducts.filter(
    (p) =>
      (p.product_type === "skincare" || p.product_type === "bundle") &&
      p.skin_types?.some(
        (t) =>
          t.toLowerCase() === selectedSkinType.toLowerCase() ||
          t.toLowerCase() === "todo tipo"
      )
  );

  const ugcPhotos = [
    {
      url: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=700&q=80",
      tag: "Conjunto Amélie · Rosa Pastel",
    },
    {
      url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80",
      tag: "Sérum Glow Rosé 30ml",
    },
    {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
      tag: "Body Korset Velour Noir",
    },
    {
      url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
      tag: "Kit Ritual Completo Mirta",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 sm:pb-20">
      {/* 1. HERO EDITORIAL DIVIDIDO */}
      <section className="relative bg-gradient-to-b from-[#FFF9FB] via-[#FCE7F3]/35 to-white border-b border-[#FCE7F3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Columna Texto Editorial */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#F4B8C8] text-[11px] sm:text-xs font-semibold text-[#111111] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4728C]" />
              <span>Colección Exclusiva · Lencería &amp; Skin Care</span>
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-medium text-[#111111] leading-[1.12] sm:leading-[1.08] tracking-tight">
              El ritual de habitar{" "}
              <span className="italic font-normal text-[#D4728C]">
                tu propia piel
              </span>{" "}
              con delicadeza.
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#6B6568] leading-relaxed max-w-xl">
              En <strong className="text-[#111111]">Mirta Cosmética</strong>{" "}
              unimos la sensualidad de la lencería de puntilla francesa con la
              ciencia botánica del cuidado facial. Envíos a toda Argentina por{" "}
              <strong className="text-[#111111]">Correo Argentino</strong> en
              empaque 100% discreto.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href="/catalogo?categoria=lenceria"
                className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2a2527] transition flex items-center justify-center gap-2 shadow-md text-center"
              >
                <span>Descubrir Lencería</span>
                <ArrowRight className="w-4 h-4 text-[#F4B8C8]" />
              </Link>
              <Link
                href="/catalogo?categoria=skincare"
                className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-white border border-[#111111] text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-[#FCE7F3]/50 transition text-center"
              >
                Explorar Skin Care
              </Link>
            </div>

            {/* Píldoras de beneficios clave (Totalmente responsivas) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[#FCE7F3]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4728C] shrink-0" />
                <span className="text-[11px] sm:text-xs text-[#111111] font-medium">
                  Correo Argentino Domicilio y Sucursal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4728C] shrink-0" />
                <span className="text-[11px] sm:text-xs text-[#111111] font-medium">
                  Mercado Pago o {settings.transfer_discount_percent}% OFF
                  Transferencia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4728C] shrink-0" />
                <span className="text-[11px] sm:text-xs text-[#111111] font-medium">
                  Empaque 100% Discreto
                </span>
              </div>
            </div>
          </div>

          {/* Columna Visual Dual (Lencería + Skin Care) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-6 pt-2 lg:pt-0">
            <Link
              href="/catalogo?categoria=lenceria"
              className="group relative aspect-3/4 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F4B8C8] shadow-md sm:shadow-xl sm:translate-y-4"
            >
              <Image
                src="https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=85"
                alt="Lencería de Autor Mirta Cosmética"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-5">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F4B8C8] font-semibold">
                  Talles 85 al 105
                </span>
                <h2 className="font-serif-editorial text-lg sm:text-2xl text-white font-medium">
                  Lencería de Autor →
                </h2>
              </div>
            </Link>

            <Link
              href="/catalogo?categoria=skincare"
              className="group relative aspect-3/4 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F4B8C8] shadow-md sm:shadow-xl sm:-translate-y-4"
            >
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85"
                alt="Skin Care Consciente Mirta Cosmética"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-5">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F4B8C8] font-semibold">
                  Fórmulas Rosé
                </span>
                <h2 className="font-serif-editorial text-lg sm:text-2xl text-white font-medium">
                  Skin Care Facial →
                </h2>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORÍAS PRINCIPALES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
              Universo Mirta Cosmética
            </p>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] mt-1">
              Elegí tu experiencia de cuidado
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#D4728C] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative h-64 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#FCE7F3] hover:border-[#F4B8C8] shadow-sm transition-all"
            >
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/85 via-[#111111]/30 to-transparent p-5 sm:p-6 flex flex-col justify-end">
                <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-200 mt-1 line-clamp-2">
                  {cat.description}
                </p>
                <span className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F4B8C8]">
                  Explorar colección <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CATÁLOGO DESTACADO CON PESTAÑAS INTERACTIVAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
              Favoritos de la Comunidad
            </p>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] mt-1">
              Los más elegidos de la temporada
            </h2>
          </div>

          <div className="flex flex-wrap gap-1 p-1 sm:p-1.5 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] self-start md:self-auto">
            {[
              { id: "all", label: "Todos" },
              { id: "lingerie", label: "Lencería" },
              { id: "skincare", label: "Skin Care" },
              { id: "bundle", label: "Kits en Promo" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id as "all" | "lingerie" | "skincare" | "bundle"
                  )
                }
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#111111] text-white shadow-xs"
                    : "text-[#6B6568] hover:text-[#111111]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. RECOMENDADOR INTERACTIVO DE SKIN CARE SEGÚN TIPO DE PIEL */}
      <section className="bg-[#FFF9FB] border-y border-[#FCE7F3] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
            <span className="px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-xs font-semibold uppercase tracking-wider">
              Diagnóstico Express Skin Care
            </span>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] mt-2 sm:mt-3">
              ¿Cómo sentís tu piel hoy?
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6568] mt-1.5 sm:mt-2">
              Seleccioná tu tipo de piel para filtrar las fórmulas y kits con
              activos ideales para tu rutina diaria.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              {["Sensible", "Seca", "Mixta", "Grasa"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedSkinType(type)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    selectedSkinType === type
                      ? "bg-[#111111] text-[#F4B8C8] border-[#111111]"
                      : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FCE7F3]/50"
                  }`}
                >
                  Piel {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skinRoutineMatches.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BANNER LOGÍSTICA CORREO ARGENTINO & EMPAQUE DISCRETO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-[#111111] text-white p-5 sm:p-10 lg:p-12 border border-[#F4B8C8]/40 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4B8C8]/20 text-[#F4B8C8] text-xs font-semibold">
              <PackageCheck className="w-4 h-4" />
              <span>Logística Oficial · Correo Argentino</span>
            </div>
            <h3 className="font-serif-editorial text-2xl sm:text-4xl font-medium leading-tight">
              Llegamos a cada rincón del país con total discreción y seguimiento
              en vivo.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              {settings.discreet_shipping_notice} Podés elegir recibir tu pedido
              en la puerta de tu casa o retirarlo en la sucursal de{" "}
              <strong className="text-[#F4B8C8]">Correo Argentino</strong> más
              cercana con tarifa reducida.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1 sm:pt-2 text-xs text-neutral-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F4B8C8] shrink-0" />
                Código Track &amp; Trace automático por Email
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F4B8C8] shrink-0" />
                Cajas neutras sin etiquetas de lencería
              </span>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-2.5 sm:gap-3">
            <Link
              href="/seguimiento"
              className="w-full py-3.5 px-6 rounded-full bg-[#F4B8C8] text-[#111111] text-xs font-bold uppercase tracking-wider text-center hover:bg-[#FCE7F3] transition"
            >
              Rastrear mi pedido Correo Argentino
            </Link>
            <Link
              href="/catalogo"
              className="w-full py-3.5 px-6 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider text-center hover:bg-white/20 transition"
            >
              Ver Productos Disponibles
            </Link>
          </div>
        </div>
      </section>

      {/* 6. RESEÑAS VERIFICADAS & GALERÍA COMUNIDAD UGC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        <div>
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
              Experiencias Reales
            </p>
            <h2 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] mt-1">
              Lo que dicen nuestras clientas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {reviews
              .filter((r) => r.is_approved)
              .slice(0, 3)
              .map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] flex flex-col justify-between space-y-3 sm:space-y-4"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 text-[#D4728C] fill-[#F4B8C8]"
                        />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#111111] leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="pt-2.5 sm:pt-3 border-t border-[#FCE7F3] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111] truncate max-w-[180px]">
                      {rev.author_name}
                    </span>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#111111] text-[9px] sm:text-[10px] font-semibold shrink-0">
                      Compra Verificada
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Galería estilo Instagram / UGC */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h3 className="font-serif-editorial text-xl sm:text-3xl font-semibold text-[#111111]">
                Comunidad {settings.instagram_handle}
              </h3>
              <p className="text-xs text-[#6B6568]">
                Etiquetanos en tus rituales de cuidado y noches especiales
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4728C] self-start sm:self-auto">
              <Camera className="w-4 h-4" />
              {settings.instagram_handle}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {ugcPhotos.map((photo, idx) => (
              <Link
                key={idx}
                href="/catalogo"
                className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-[#FCE7F3]"
              >
                <Image
                  src={photo.url}
                  alt={photo.tag}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                  <span className="text-[11px] sm:text-xs font-medium text-white truncate">
                    {photo.tag} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
