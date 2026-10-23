"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useStore } from "@/store/useStore";

export default function FavoritosPage() {
  const products = useStore((s) => s.products);
  const wishlist = useStore((s) => s.wishlist);

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FCE7F3]">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
            Mirta Cosmética · Wishlist
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-5xl font-semibold text-[#111111] mt-1">
            Mis Favoritos Guardados ({favoriteProducts.length})
          </h1>
        </div>
        <Link
          href="/catalogo"
          className="px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider self-start"
        >
          Explorar más productos
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="p-6 sm:p-14 rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white border border-[#F4B8C8] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-[#D4728C]" />
          </div>
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
            Todavía no guardaste productos en tu Wishlist
          </h2>
          <p className="text-xs text-[#6B6568] max-w-md mx-auto">
            Hacé clic en el ícono del corazón ♥ en cualquier conjunto de
            lencería o fórmula de skin care para guardarlo aquí.
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-6 py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider"
          >
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
