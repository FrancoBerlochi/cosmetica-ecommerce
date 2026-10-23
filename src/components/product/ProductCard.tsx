"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { calculateDiscountPercent, formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((s) => s.addToCart);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const settings = useStore((s) => s.settings);

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = calculateDiscountPercent(
    product.base_price,
    product.compare_at_price
  );

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const hasLowStock =
    totalStock > 0 &&
    (totalStock <= product.low_stock_threshold * 2 ||
      product.variants.some(
        (v) => v.stock > 0 && v.stock <= product.low_stock_threshold
      ));

  const firstAvailableVariant =
    product.variants.find((v) => v.stock > 0) || product.variants[0];

  const transferPrice = Math.round(
    product.base_price * (1 - settings.transfer_discount_percent / 100)
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstAvailableVariant || firstAvailableVariant.stock <= 0) {
      toast.error("Producto temporalmente sin stock disponible.");
      return;
    }

    const price = firstAvailableVariant.price_override ?? product.base_price;
    addToCart({
      productId: product.id,
      variantId: firstAvailableVariant.id,
      slug: product.slug,
      name: product.name,
      productType: product.product_type,
      image:
        product.images[0]?.url ||
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      size: firstAvailableVariant.size,
      colorName: firstAvailableVariant.color_name,
      colorHex: firstAvailableVariant.color_hex,
      unitPrice: price,
      compareAtPrice: product.compare_at_price,
      weightGrams: product.weight_grams,
      quantity: 1,
      maxStock: firstAvailableVariant.stock,
    });

    toast.success("Agregado a tu bolsa", {
      description: `${product.name} (${firstAvailableVariant.size} · ${firstAvailableVariant.color_name})`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const added = toggleWishlist(product.id);
    if (added) {
      toast.success("Guardado en tus Favoritos ♥", {
        description: product.name,
      });
    } else {
      toast.info("Quitado de tus Favoritos");
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-[#FCE7F3] hover:border-[#F4B8C8] transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-lg">
      {/* Imagen del Producto + Badges */}
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-4/5 w-full bg-[#FFF9FB] overflow-hidden block"
      >
        <Image
          src={
            product.images[0]?.url ||
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
          }
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Etiquetas Superiores Izquierda */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-full bg-[#111111] text-[#F4B8C8] text-[11px] font-bold tracking-wide">
              -{discountPercent}% OFF
            </span>
          )}
          {hasLowStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF9FB]/95 border border-[#F4B8C8] text-[#111111] text-[10px] font-semibold shadow-xs">
              <Flame className="w-3 h-3 text-[#D4728C] fill-current" />
              ¡Últimas unidades!
            </span>
          )}
          {product.discreet_shipping_badge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#111111] text-[10px] font-medium">
              <ShieldCheck className="w-3 h-3 text-[#D4728C]" />
              Envío discreto
            </span>
          )}
        </div>

        {/* Botón Favoritos (Wishlist) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label="Agregar a favoritos"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
            isWishlisted
              ? "bg-[#111111] text-[#F4B8C8]"
              : "bg-white/90 text-[#111111] hover:bg-[#FCE7F3]"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
          />
        </button>

        {/* Botón Rápido al hacer Hover */}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-4 rounded-full bg-[#111111]/95 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#111111] shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#F4B8C8]" />
            <span>
              Agregar rápido ({firstAvailableVariant?.size || "Único"})
            </span>
          </button>
        </div>
      </Link>

      {/* Información del Producto */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#6B6568] mb-1">
            <span className="uppercase tracking-wider font-semibold text-[#D4728C]">
              {product.product_type === "lingerie"
                ? "Lencería"
                : product.product_type === "skincare"
                ? product.routine_step || "Skin Care"
                : "Kit & Ritual"}
            </span>
            {product.rating_avg && (
              <span className="inline-flex items-center gap-1 font-medium text-[#111111]">
                <Star className="w-3 h-3 text-[#F4B8C8] fill-[#F4B8C8]" />
                {product.rating_avg.toFixed(1)}
              </span>
            )}
          </div>

          <Link
            href={`/producto/${product.slug}`}
            className="font-serif-editorial text-xl font-semibold text-[#111111] group-hover:text-[#D4728C] transition line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          <p className="text-xs text-[#6B6568] line-clamp-2 mt-1">
            {product.short_description}
          </p>

          {/* Píldoras de Talles (Lencería) o Tipo de Piel (Skin Care) */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.product_type === "skincare" &&
              product.skin_types?.slice(0, 3).map((st) => (
                <span
                  key={st}
                  className="px-2 py-0.5 rounded-full bg-[#FFF9FB] border border-[#FCE7F3] text-[10px] font-medium text-[#6B6568]"
                >
                  Piel {st}
                </span>
              ))}
            {product.product_type !== "skincare" &&
              Array.from(new Set(product.variants.map((v) => v.size)))
                .slice(0, 4)
                .map((size) => (
                  <span
                    key={size}
                    className="px-2 py-0.5 rounded-full bg-[#FFF9FB] border border-[#FCE7F3] text-[10px] font-medium text-[#111111]"
                  >
                    {size}
                  </span>
                ))}
          </div>
        </div>

        {/* Precios y Transferencia */}
        <div className="pt-2.5 border-t border-[#FCE7F3]">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#111111]">
              {formatARS(product.base_price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-[#6B6568] line-through">
                {formatARS(product.compare_at_price)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#D4728C] font-semibold flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>
              {formatARS(transferPrice)} con Transferencia (
              {settings.transfer_discount_percent}% OFF)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
