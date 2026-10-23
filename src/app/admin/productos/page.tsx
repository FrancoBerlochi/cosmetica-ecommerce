"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { convertImageToWebP, formatARS, slugify } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Product, ProductType, ProductVariant } from "@/types/database";

export default function AdminProductosPage() {
  const products = useStore((s) => s.products);
  const upsertProduct = useStore((s) => s.upsertProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const updateVariantStock = useStore((s) => s.updateVariantStock);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Campos del formulario de producto
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<ProductType>("lingerie");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(34900);
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [weightGrams, setWeightGrams] = useState<number>(200);
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1000&q=85"
  );
  const [discreetBadge, setDiscreetBadge] = useState(true);
  const [skinTypesInput, setSkinTypesInput] = useState("Todo tipo, Sensible");
  const [routineStep, setRoutineStep] = useState("3. Sérum Tratamiento");
  const [ingredientsInput, setIngredientsInput] = useState(
    "Ácido Hialurónico 2%, Niacinamida 10%"
  );
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "var-new-1",
      product_id: "",
      sku: "MC-NEW-85",
      size: "85 (S)",
      color_name: "Rosa Pastel",
      color_hex: "#F4B8C8",
      stock: 10,
    },
    {
      id: "var-new-2",
      product_id: "",
      sku: "MC-NEW-90",
      size: "90 (M)",
      color_name: "Rosa Pastel",
      color_hex: "#F4B8C8",
      stock: 12,
    },
  ]);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setProductType("lingerie");
    setShortDescription("");
    setDescription("");
    setBasePrice(34900);
    setCompareAtPrice("");
    setWeightGrams(200);
    setImageUrl(
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1000&q=85"
    );
    setDiscreetBadge(true);
    setVariants([
      {
        id: `var-${Date.now()}-1`,
        product_id: "",
        sku: `MC-${Math.floor(100 + Math.random() * 900)}-85`,
        size: "85 (S)",
        color_name: "Rosa Pastel",
        color_hex: "#F4B8C8",
        stock: 8,
      },
      {
        id: `var-${Date.now()}-2`,
        product_id: "",
        sku: `MC-${Math.floor(100 + Math.random() * 900)}-90`,
        size: "90 (M)",
        color_name: "Rosa Pastel",
        color_hex: "#F4B8C8",
        stock: 10,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setProductType(product.product_type);
    setShortDescription(product.short_description);
    setDescription(product.description);
    setBasePrice(product.base_price);
    setCompareAtPrice(
      product.compare_at_price ? String(product.compare_at_price) : ""
    );
    setWeightGrams(product.weight_grams);
    setImageUrl(product.images[0]?.url || "");
    setDiscreetBadge(product.discreet_shipping_badge);
    setSkinTypesInput((product.skin_types || []).join(", "));
    setRoutineStep(product.routine_step || "");
    setIngredientsInput((product.key_ingredients || []).join(", "));
    setVariants(product.variants);
    setIsModalOpen(true);
  };

  const handleWebPImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const webpBlob = await convertImageToWebP(file);
      const fileName = `${Date.now()}-${slugify(
        file.name.replace(/\.[^.]+$/, "")
      )}.webp`;

      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from("products")
          .upload(fileName, webpBlob, {
            contentType: "image/webp",
            upsert: true,
          });

        if (!error) {
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);
          setImageUrl(data.publicUrl);
          toast.success(
            "Imagen optimizada a WebP y subida a Supabase Storage"
          );
          setUploadingImage(false);
          return;
        }
      }

      // Vista previa local en WebP si Supabase aún no tiene credenciales
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
          toast.success("Imagen convertida y optimizada a formato WebP");
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(webpBlob);
    } catch {
      toast.error("No se pudo procesar la imagen.");
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prodId = editingId || `prod-${Date.now()}`;
    const newProduct: Product = {
      id: prodId,
      name: name.trim(),
      slug: slugify(name),
      short_description: shortDescription.trim() || name.trim(),
      description: description.trim() || shortDescription.trim(),
      category_id:
        productType === "lingerie"
          ? "cat-lingerie"
          : productType === "skincare"
          ? "cat-skincare"
          : "cat-bundles",
      category_name:
        productType === "lingerie"
          ? "Lencería de Autor"
          : productType === "skincare"
          ? "Skin Care Consciente"
          : "Kits & Rituales",
      subcategory_slug: productType,
      product_type: productType,
      base_price: Number(basePrice),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      weight_grams: Number(weightGrams) || 200,
      is_active: true,
      is_featured: true,
      low_stock_threshold: 4,
      skin_types:
        productType !== "lingerie"
          ? skinTypesInput
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      routine_step: productType !== "lingerie" ? routineStep : undefined,
      key_ingredients:
        productType !== "lingerie"
          ? ingredientsInput
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      discreet_shipping_badge: discreetBadge,
      rating_avg: 5.0,
      reviews_count: 1,
      created_at: new Date().toISOString(),
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: prodId,
          url: imageUrl,
          alt_text: name.trim(),
          display_order: 1,
        },
      ],
      variants: variants.map((v) => ({
        ...v,
        product_id: prodId,
      })),
    };

    upsertProduct(newProduct);
    setIsModalOpen(false);
    toast.success(
      editingId
        ? `Producto "${newProduct.name}" actualizado`
        : `Producto "${newProduct.name}" creado en el catálogo`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold">
            Catálogo &amp; Variantes
          </span>
          <h1 className="font-serif-editorial text-2xl sm:text-4xl font-semibold text-[#111111] mt-1">
            Productos, Talles y Control de Stock
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="self-start sm:self-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#292526] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F4B8C8]" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Listado de Productos con Control Rápido de Stock por Variante */}
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#FCE7F3] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 shadow-2xs"
          >
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-[#FFF9FB] border border-[#FCE7F3] shrink-0">
                <Image
                  src={
                    product.images[0]?.url ||
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#111111] text-[10px] font-bold uppercase">
                    {product.category_name}
                  </span>
                  {product.discreet_shipping_badge && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#D4728C] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Empaque discreto
                    </span>
                  )}
                </div>
                <h3 className="font-serif-editorial text-lg sm:text-xl font-semibold text-[#111111] truncate">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <strong className="text-[#111111]">
                    {formatARS(product.base_price)}
                  </strong>
                  {product.compare_at_price && (
                    <span className="text-xs text-[#6B6568] line-through">
                      {formatARS(product.compare_at_price)}
                    </span>
                  )}
                  <span className="text-xs text-[#6B6568]">
                    · {product.weight_grams}g
                  </span>
                </div>
              </div>
            </div>

            {/* Variantes y Stock editable en vivo */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs flex items-center gap-1.5 sm:gap-2"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: variant.color_hex }}
                  />
                  <span className="font-semibold text-[#111111] text-[11px] sm:text-xs">
                    {variant.size}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariantStock(
                        product.id,
                        variant.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-12 sm:w-14 px-1.5 sm:px-2 py-0.5 rounded-lg bg-white border border-[#FCE7F3] text-center font-bold text-xs"
                    title="Stock disponible"
                  />
                </div>
              ))}
            </div>

            {/* Botones Editar / Eliminar */}
            <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => openEditModal(product)}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-semibold text-[#111111] hover:bg-[#FCE7F3] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(product.id);
                  toast.info(`Producto "${product.name}" eliminado`);
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                title="Eliminar producto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#F4B8C8] shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-[#FCE7F3] bg-[#FFF9FB] flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
                {editingId ? "Editar Producto" : "Crear Nuevo Producto"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-[#FCE7F3] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Conjunto Brigitte en Puntilla Rosa"
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Vertical / Tipo *
                  </label>
                  <select
                    value={productType}
                    onChange={(e) =>
                      setProductType(e.target.value as ProductType)
                    }
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-semibold"
                  >
                    <option value="lingerie">Lencería</option>
                    <option value="skincare">Skin Care</option>
                    <option value="bundle">Kit / Combo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Precio Venta (ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Precio Tachado (Opcional)
                  </label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="Ej: 42000"
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Peso (gramos · Correo)
                  </label>
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Number(e.target.value))}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                  />
                </div>
              </div>

              {/* Subida de Imagen con Optimización WebP a Supabase Storage */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#111111]">
                    Foto Principal (Supabase WebP)
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111] text-white text-[11px] font-semibold cursor-pointer">
                    <ImagePlus className="w-3.5 h-3.5 text-[#F4B8C8]" />
                    <span>
                      {uploadingImage
                        ? "Optimizando a WebP..."
                        : "Subir foto (Auto WebP)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWebPImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL de la imagen..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                />
              </div>

              {/* Atributos específicos de Skin Care */}
              {productType !== "lingerie" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3]">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Tipos de Piel (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={skinTypesInput}
                      onChange={(e) => setSkinTypesInput(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Ingredientes Activos Clave
                    </label>
                    <input
                      type="text"
                      value={ingredientsInput}
                      onChange={(e) => setIngredientsInput(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">
                  Descripción del Producto
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs"
                />
              </div>

              {/* Variantes de Talle y Color (Responsive 2 cols en móvil, 4 en desktop) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider">
                    Variantes (Talle / Color / Stock)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants([
                        ...variants,
                        {
                          id: `var-${Date.now()}`,
                          product_id: "",
                          sku: `MC-${Math.floor(100 + Math.random() * 900)}`,
                          size: "95 (L)",
                          color_name: "Rosa Pastel",
                          color_hex: "#F4B8C8",
                          stock: 6,
                        },
                      ])
                    }
                    className="text-xs font-bold text-[#D4728C] hover:underline cursor-pointer"
                  >
                    + Agregar Variante
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center p-2.5 sm:p-0 rounded-xl bg-[#FFF9FB] sm:bg-transparent border sm:border-0 border-[#FCE7F3]"
                    >
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx] = { ...v, size: e.target.value };
                          setVariants(copy);
                        }}
                        placeholder="Talle (ej: 90 M)"
                        className="px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                      />
                      <input
                        type="text"
                        value={v.color_name}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx] = { ...v, color_name: e.target.value };
                          setVariants(copy);
                        }}
                        placeholder="Color"
                        className="px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                      />
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx] = { ...v, stock: Number(e.target.value) };
                          setVariants(copy);
                        }}
                        placeholder="Stock"
                        className="px-3 py-1.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariants(variants.filter((_, i) => i !== idx))
                        }
                        className="text-xs text-red-500 hover:underline cursor-pointer text-right sm:text-left py-1"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 sm:pt-4 border-t border-[#FCE7F3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#111111] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
