"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/product/ProductCard";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ARGENTINA_PROVINCES } from "@/lib/mock-data";
import { calculateDiscountPercent, formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const products = useStore((s) => s.products);
  const reviews = useStore((s) => s.reviews);
  const addReview = useStore((s) => s.addReview);
  const addToCart = useStore((s) => s.addToCart);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const shippingZones = useStore((s) => s.shippingZones);
  const settings = useStore((s) => s.settings);

  const product = products.find((p) => p.slug === slug) || products[0];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(
    "Ciudad Autónoma de Buenos Aires"
  );

  // Estado formulario de reseña
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContext, setReviewContext] = useState("");

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif-editorial text-2xl sm:text-3xl">
          Producto no encontrado
        </h1>
        <Link
          href="/catalogo"
          className="mt-4 inline-block underline text-xs sm:text-sm text-[#D4728C]"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const unitPrice = selectedVariant?.price_override ?? product.base_price;
  const transferPrice = Math.round(
    unitPrice * (1 - settings.transfer_discount_percent / 100)
  );
  const discountPercent = calculateDiscountPercent(
    unitPrice,
    product.compare_at_price
  );

  const isWishlisted = wishlist.includes(product.id);
  const isLowStock =
    selectedVariant &&
    selectedVariant.stock > 0 &&
    selectedVariant.stock <= product.low_stock_threshold;

  // Cotización rápida Correo Argentino según provincia elegida
  const matchedZone =
    shippingZones.find((z) =>
      z.provinces.some(
        (p) => p.toLowerCase() === selectedProvince.toLowerCase()
      )
    ) || shippingZones[0];

  const productReviews = reviews.filter(
    (r) => r.product_id === product.id && r.is_approved
  );
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.is_active)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error("Esta variante no tiene stock disponible en este momento.");
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      productType: product.product_type,
      image:
        product.images[0]?.url ||
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      size: selectedVariant.size,
      colorName: selectedVariant.color_name,
      colorHex: selectedVariant.color_hex,
      unitPrice,
      compareAtPrice: product.compare_at_price,
      weightGrams: product.weight_grams,
      quantity,
      maxStock: selectedVariant.stock,
    });

    toast.success("Agregado a tu carrito", {
      description: `${quantity}x ${product.name} (${selectedVariant.size} · ${selectedVariant.color_name})`,
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    addReview({
      id: `rev-${Date.now()}`,
      product_id: product.id,
      author_name: reviewAuthor.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      skin_type_context:
        product.product_type !== "lingerie" ? reviewContext : undefined,
      size_purchased:
        product.product_type !== "skincare" ? selectedVariant?.size : undefined,
      verified_purchase: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    });

    toast.success("¡Gracias por compartir tu reseña en Mirta Cosmética!");
    setReviewAuthor("");
    setReviewComment("");
    setReviewContext("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-16">
      {/* Migas de pan */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6568] hover:text-[#111111]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al catálogo</span>
        </Link>
        <span className="text-[11px] sm:text-xs text-[#6B6568]">
          SKU: <strong className="text-[#111111]">{selectedVariant?.sku}</strong>
        </span>
      </div>

      {/* Grilla Principal del Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Galería de Imágenes */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="relative aspect-4/5 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFF9FB] border border-[#FCE7F3]">
            <Image
              src={
                product.images[selectedImageIdx]?.url ||
                product.images[0]?.url ||
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85"
              }
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {discountPercent && (
              <span className="absolute top-3 sm:top-4 left-3 sm:left-4 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#111111] text-[#F4B8C8] text-[11px] sm:text-xs font-bold">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                    selectedImageIdx === idx
                      ? "border-[#111111]"
                      : "border-[#FCE7F3] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna de Compra y Detalles */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-[11px] sm:text-xs font-semibold">
                {product.category_name}
              </span>
              {product.routine_step && (
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-[#D4728C] text-[11px] sm:text-xs font-semibold">
                  {product.routine_step}
                </span>
              )}
              {product.discreet_shipping_badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#111111] text-[#F4B8C8] text-[10px] sm:text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Empaque 100% Discreto
                </span>
              )}
            </div>

            <h1 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#6B6568] mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Bloque de Precios (Mercado Pago + Transferencia) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-1.5 sm:space-y-2">
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#111111]">
                {formatARS(unitPrice)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm sm:text-base text-[#6B6568] line-through">
                  {formatARS(product.compare_at_price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#D4728C]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {formatARS(transferPrice)} abonando por Transferencia Bancaria (
                {settings.transfer_discount_percent}% OFF)
              </span>
            </div>
            <p className="text-[11px] text-[#6B6568]">
              Aceptamos todas las tarjetas y dinero en cuenta con{" "}
              <strong className="text-[#111111]">
                Mercado Pago Checkout Pro
              </strong>
              .
            </p>
          </div>

          {/* Selector de Variantes (Talle / Color / Formato) */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Seleccioná Talle / Variante:
              </label>
              {product.product_type !== "skincare" && (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4728C] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Guía de Talles</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.variants.map((variant) => {
                const isSelected = variant.id === selectedVariant?.id;
                const outOfStock = variant.stock <= 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity(1);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      outOfStock
                        ? "opacity-40 cursor-not-allowed bg-neutral-100 border-neutral-200"
                        : isSelected
                        ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                        : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FFF9FB]"
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-bold truncate">{variant.size}</p>
                      <p
                        className={`text-[10px] sm:text-[11px] truncate ${
                          isSelected ? "text-[#F4B8C8]" : "text-[#6B6568]"
                        }`}
                      >
                        {variant.color_name}
                      </p>
                    </div>
                    <span
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/40 shrink-0"
                      style={{ backgroundColor: variant.color_hex }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Alerta de Bajo Stock */}
            {isLowStock && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] text-[#111111] text-[11px] sm:text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-[#D4728C] fill-current" />
                <span>
                  ¡Quedan solo {selectedVariant.stock} unidades en{" "}
                  {selectedVariant.size}!
                </span>
              </div>
            )}
          </div>

          {/* Cantidad + Botón Agregar al Carrito + Favoritos */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="inline-flex items-center border border-[#F4B8C8] rounded-full bg-[#FFF9FB] px-2 py-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-[#FCE7F3] cursor-pointer"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="px-3 sm:px-4 text-xs sm:text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedVariant?.stock || 10, quantity + 1)
                    )
                  }
                  className="p-1.5 sm:p-2 rounded-full hover:bg-[#FCE7F3] cursor-pointer"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const added = toggleWishlist(product.id);
                  toast.success(
                    added
                      ? "Agregado a tus Favoritos ♥"
                      : "Quitado de tus Favoritos"
                  );
                }}
                className={`sm:hidden p-3 rounded-full border transition cursor-pointer shrink-0 ${
                  isWishlisted
                    ? "bg-[#111111] text-[#F4B8C8] border-[#111111]"
                    : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FCE7F3]"
                }`}
                title="Guardar en Favoritos"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3.5 sm:py-4 px-5 sm:px-6 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#272324] transition shadow-md cursor-pointer text-center"
            >
              <ShoppingBag className="w-4 h-4 text-[#F4B8C8] shrink-0" />
              <span>Agregar · {formatARS(unitPrice * quantity)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const added = toggleWishlist(product.id);
                toast.success(
                  added
                    ? "Agregado a tus Favoritos ♥"
                    : "Quitado de tus Favoritos"
                );
              }}
              className={`hidden sm:flex p-4 rounded-full border transition cursor-pointer shrink-0 ${
                isWishlisted
                  ? "bg-[#111111] text-[#F4B8C8] border-[#111111]"
                  : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FCE7F3]"
              }`}
              title="Guardar en Favoritos"
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Calculador de Envío por Correo Argentino en Ficha de Producto */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#FCE7F3] space-y-2.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#111111]">
                <Truck className="w-4 h-4 text-[#D4728C]" />
                Calcular Envío Correo Argentino
              </span>
              <span className="text-[11px] font-semibold text-[#D4728C]">
                Gratis desde {formatARS(settings.free_shipping_threshold)}
              </span>
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-medium text-[#111111] focus:outline-none"
            >
              {ARGENTINA_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            {matchedZone && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111111]">Retiro en Sucursal</p>
                    <p className="text-[10px] sm:text-[11px] text-[#6B6568]">
                      {matchedZone.estimated_days}
                    </p>
                  </div>
                  <span className="font-bold text-[#111111]">
                    {unitPrice * quantity >= settings.free_shipping_threshold
                      ? "GRATIS"
                      : formatARS(matchedZone.branch_pickup_price)}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111111]">A Domicilio</p>
                    <p className="text-[10px] sm:text-[11px] text-[#6B6568]">
                      {matchedZone.estimated_days}
                    </p>
                  </div>
                  <span className="font-bold text-[#111111]">
                    {unitPrice * quantity >= settings.free_shipping_threshold
                      ? "GRATIS"
                      : formatARS(matchedZone.home_delivery_price)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Ficha Técnica (Ingredientes Skin Care o Composición Lencería) */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-2.5 text-xs">
            {product.key_ingredients && product.key_ingredients.length > 0 && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[#111111] mb-1">
                  Activos Principales:
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.key_ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2 py-0.5 rounded-full bg-white border border-[#F4B8C8] text-[#111111] text-[11px] font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.how_to_use && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[#111111] mb-0.5">
                  Modo de Uso:
                </p>
                <p className="text-[#6B6568] leading-relaxed text-[11px] sm:text-xs">
                  {product.how_to_use}
                </p>
              </div>
            )}

            {product.fabric_composition && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[#111111] mb-0.5">
                  Composición &amp; Cuidados:
                </p>
                <p className="text-[#6B6568] leading-relaxed text-[11px] sm:text-xs">
                  {product.fabric_composition}. {product.care_instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Reseñas de Clientes */}
      <section className="pt-8 sm:pt-10 border-t border-[#FCE7F3] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#111111]">
            Opiniones Verificadas ({productReviews.length})
          </h2>

          {productReviews.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#6B6568]">
              Sé la primera en dejar tu opinión sobre este producto.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 text-[#D4728C] fill-[#F4B8C8]"
                        />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#111111]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4728C]" />
                      Compra Verificada
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#111111] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-[#6B6568]">
                    <strong className="text-[#111111]">{rev.author_name}</strong>
                    {rev.size_purchased && (
                      <span>· Talle: {rev.size_purchased}</span>
                    )}
                    {rev.skin_type_context && (
                      <span>· {rev.skin_type_context}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para dejar reseña */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmitReview}
            className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#F4B8C8] space-y-3.5 sm:space-y-4"
          >
            <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
              Dejá tu valoración
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Tu nombre y ciudad
              </label>
              <input
                type="text"
                required
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Ej: Martina L. · CABA"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Calificación
                </label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                >
                  <option value={5}>★★★★★ (5/5 Excelente)</option>
                  <option value={4}>★★★★☆ (4/5 Muy bueno)</option>
                  <option value={3}>★★★☆☆ (3/5 Bueno)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Tipo de piel / Talle
                </label>
                <input
                  type="text"
                  value={reviewContext}
                  onChange={(e) => setReviewContext(e.target.value)}
                  placeholder="Ej: Piel mixta / Talle 90"
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Tu experiencia
              </label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Contanos qué te pareció la textura, el calce o el envío..."
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#F4B8C8] text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#292526] transition cursor-pointer"
            >
              Publicar reseña
            </button>
          </form>
        </div>
      </section>

      {/* Productos Relacionados */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-[#111111]">
          Completá tu Ritual Mirta Cosmética
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} />
          ))}
        </div>
      </section>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
