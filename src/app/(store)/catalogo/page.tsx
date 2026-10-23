"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Filter, Ruler, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { useStore } from "@/store/useStore";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("categoria") || "todos";

  const products = useStore((s) => s.products);

  const [categoryFilter, setCategoryFilter] =
    useState<string>(initialCategoryParam);
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>("all");
  const [routineStepFilter, setRoutineStepFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "featured" | "price_asc" | "price_desc" | "promo"
  >("featured");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Actualizar filtro si cambia el parámetro URL
  React.useEffect(() => {
    const param = searchParams.get("categoria");
    if (param) setCategoryFilter(param);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.is_active)
      .filter((p) => {
        if (categoryFilter === "lenceria") return p.product_type === "lingerie";
        if (categoryFilter === "skincare") return p.product_type === "skincare";
        if (categoryFilter === "kits") return p.product_type === "bundle";
        return true;
      })
      .filter((p) => {
        if (sizeFilter === "all") return true;
        return p.variants.some(
          (v) =>
            v.stock > 0 &&
            v.size.toLowerCase().includes(sizeFilter.toLowerCase())
        );
      })
      .filter((p) => {
        if (skinTypeFilter === "all") return true;
        return p.skin_types?.some(
          (st) => st.toLowerCase() === skinTypeFilter.toLowerCase()
        );
      })
      .filter((p) => {
        if (routineStepFilter === "all") return true;
        return p.routine_step
          ?.toLowerCase()
          .includes(routineStepFilter.toLowerCase());
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.key_ingredients?.some((ing) => ing.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.base_price - b.base_price;
        if (sortBy === "price_desc") return b.base_price - a.base_price;
        if (sortBy === "promo") {
          const aPromo = a.compare_at_price ? 1 : 0;
          const bPromo = b.compare_at_price ? 1 : 0;
          return bPromo - aPromo;
        }
        return Number(b.is_featured) - Number(a.is_featured);
      });
  }, [
    products,
    categoryFilter,
    sizeFilter,
    skinTypeFilter,
    routineStepFilter,
    searchQuery,
    sortBy,
  ]);

  const activeFiltersCount =
    (categoryFilter !== "todos" ? 1 : 0) +
    (sizeFilter !== "all" ? 1 : 0) +
    (skinTypeFilter !== "all" ? 1 : 0) +
    (routineStepFilter !== "all" ? 1 : 0);

  const resetFilters = () => {
    setCategoryFilter("todos");
    setSizeFilter("all");
    setSkinTypeFilter("all");
    setRoutineStepFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Encabezado Editorial del Catálogo */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] p-5 sm:p-8 lg:p-10 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#D4728C] font-semibold">
            Mirta Cosmética · Tienda Oficial
          </span>
          <h1 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] mt-1">
            {categoryFilter === "lenceria"
              ? "Lencería de Autor"
              : categoryFilter === "skincare"
              ? "Skin Care Consciente"
              : categoryFilter === "kits"
              ? "Kits & Rituales en Promoción"
              : "Catálogo Completo"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6568] mt-1.5 sm:mt-2 max-w-xl">
            Filtrá por talle de lencería o por tipo de piel y activos
            dermatológicos. Envíos a todo el país por Correo Argentino.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSizeGuideOpen(true)}
          className="self-stretch sm:self-start md:self-center inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border border-[#111111] text-xs font-semibold text-[#111111] hover:bg-[#FCE7F3] transition cursor-pointer shrink-0"
        >
          <Ruler className="w-4 h-4 text-[#D4728C]" />
          <span>Guía de Talles Interactiva</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6 sm:mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B6568] absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conjunto, body, sérum, crema..."
            className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón Móvil para Colapsar/Expandir Filtros */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-semibold text-[#111111]"
          >
            <Filter className="w-3.5 h-3.5 text-[#D4728C]" />
            <span>Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#6B6568] hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "featured"
                    | "price_asc"
                    | "price_desc"
                    | "promo"
                )
              }
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white border border-[#F4B8C8] text-[11px] sm:text-xs font-semibold text-[#111111] focus:outline-none"
            >
              <option value="featured">Destacados</option>
              <option value="promo">% OFF</option>
              <option value="price_asc">$ Menor a Mayor</option>
              <option value="price_desc">$ Mayor a Menor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Barra Lateral de Filtros (Responsive: toggleable en móvil, fija en desktop) */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]">
                <Filter className="w-3.5 h-3.5 text-[#D4728C]" />
                Filtros Activos
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#D4728C] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Limpiar
              </button>
            </div>

            {/* 1. Categoría */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2 sm:mb-2.5">
                Categoría
              </h3>
              <div className="space-y-1 sm:space-y-1.5">
                {[
                  { id: "todos", label: "Todo el Catálogo" },
                  { id: "lenceria", label: "Lencería de Autor" },
                  { id: "skincare", label: "Skin Care Facial" },
                  { id: "kits", label: "Kits & Rituales" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat.id);
                      if (window.innerWidth < 1024) setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      categoryFilter === cat.id
                        ? "bg-[#111111] text-white font-semibold"
                        : "text-[#6B6568] hover:bg-[#FCE7F3]/50 hover:text-[#111111]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Filtro de Talles (Lencería) */}
            {(categoryFilter === "todos" ||
              categoryFilter === "lenceria" ||
              categoryFilter === "kits") && (
              <div className="pt-3 sm:pt-4 border-t border-[#FCE7F3]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2 sm:mb-2.5">
                  Talle de Lencería
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "85", "90", "95", "100"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSizeFilter(sz);
                        if (window.innerWidth < 1024) setMobileFiltersOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                        sizeFilter === sz
                          ? "bg-[#111111] text-[#F4B8C8] border-[#111111]"
                          : "bg-white text-[#111111] border-[#F4B8C8] hover:bg-[#FCE7F3]"
                      }`}
                    >
                      {sz === "all" ? "Todos" : `Talle ${sz}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Filtro por Tipo de Piel (Skin Care) */}
            {(categoryFilter === "todos" ||
              categoryFilter === "skincare" ||
              categoryFilter === "kits") && (
              <div className="pt-3 sm:pt-4 border-t border-[#FCE7F3]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2 sm:mb-2.5">
                  Tipo de Piel (Skin Care)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "Todo tipo", "Seca", "Mixta", "Sensible", "Grasa"].map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSkinTypeFilter(st);
                          if (window.innerWidth < 1024) setMobileFiltersOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                          skinTypeFilter === st
                            ? "bg-[#111111] text-[#F4B8C8] border-[#111111]"
                            : "bg-white text-[#111111] border-[#FCE7F3] hover:border-[#F4B8C8]"
                        }`}
                      >
                        {st === "all" ? "Todas" : st}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 4. Paso de la Rutina Facial */}
            {(categoryFilter === "todos" || categoryFilter === "skincare") && (
              <div className="pt-3 sm:pt-4 border-t border-[#FCE7F3]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2 sm:mb-2.5">
                  Paso de la Rutina
                </h3>
                <div className="space-y-1 sm:space-y-1.5">
                  {[
                    { id: "all", label: "Todos los pasos" },
                    { id: "Limpieza", label: "1. Limpieza Botánica" },
                    { id: "Sérum", label: "3. Sérums Concentrados" },
                    { id: "Hidratación", label: "4. Hidratación & Barrera" },
                  ].map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setRoutineStepFilter(step.id);
                        if (window.innerWidth < 1024) setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        routineStepFilter === step.id
                          ? "bg-[#FCE7F3] text-[#111111] font-semibold"
                          : "text-[#6B6568] hover:text-[#111111]"
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Grilla de Productos */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-[#FFF9FB] border border-[#FCE7F3] text-center space-y-3">
              <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                No encontramos productos con esos filtros
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6568]">
                Probá limpiando los filtros activos para ver toda la colección
                de Mirta Cosmética.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-[#6B6568]">
          Cargando catálogo de Mirta Cosmética...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
