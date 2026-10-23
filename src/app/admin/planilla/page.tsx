"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Copy,
  DollarSign,
  Download,
  Edit3,
  FileSpreadsheet,
  Percent,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { formatARS } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export interface PlanillaRow {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  anticipo: number;
}

const STORAGE_KEY = "mirta_planilla_draft_v1";

function createEmptyRow(): PlanillaRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cliente: "",
    producto: "",
    cantidad: 1,
    precio: 0,
    anticipo: 0,
  };
}

export default function AdminPlanillaPage() {
  const products = useStore((s) => s.products);

  const [rows, setRows] = useState<PlanillaRow[]>([
    {
      id: "row-1",
      cliente: "Valentina Gómez",
      producto: "Conjunto Encaje Rouge - Talle 90 (Rosa Vintage)",
      cantidad: 1,
      precio: 42500,
      anticipo: 20000,
    },
    {
      id: "row-2",
      cliente: "Camila Navarro",
      producto: "Serum Ácido Hialurónico 2% + B5 (30ml)",
      cantidad: 2,
      precio: 21900,
      anticipo: 15000,
    },
  ]);

  const [discountType, setDiscountType] = useState<"fixed" | "percent">("percent");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado para el modal de selección de producto
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"catalog" | "manual">("catalog");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState<number>(0);

  const activeRow = useMemo(
    () => rows.find((r) => r.id === activeRowId),
    [rows, activeRowId]
  );
  const activeRowIndex = useMemo(
    () => rows.findIndex((r) => r.id === activeRowId),
    [rows, activeRowId]
  );

  // Cargar borrador persistido al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
          setRows(parsed.rows);
        }
        if (parsed.discountType) setDiscountType(parsed.discountType);
        if (typeof parsed.discountValue === "number") {
          setDiscountValue(parsed.discountValue);
        }
      }
    } catch {
      // Ignorar errores de localStorage
    }
  }, []);

  // Guardar borrador en localStorage automáticamente
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          rows,
          discountType,
          discountValue,
        })
      );
    } catch {
      // Ignorar errores de cuota de localStorage
    }
  }, [rows, discountType, discountValue]);

  // Cálculos automáticos de subtotal, anticipos y totales
  const { subtotal, totalAnticipos, descuentoMonto, totalFinal, saldoRestante } =
    useMemo(() => {
      const sub = rows.reduce(
        (sum, r) => sum + (Number(r.cantidad) || 0) * (Number(r.precio) || 0),
        0
      );
      const ant = rows.reduce((sum, r) => sum + (Number(r.anticipo) || 0), 0);

      let desc = 0;
      if (discountType === "percent") {
        desc = Math.round((sub * (Number(discountValue) || 0)) / 100);
      } else {
        desc = Math.min(sub, Number(discountValue) || 0);
      }

      const fin = Math.max(0, sub - desc);
      const saldo = Math.max(0, fin - ant);

      return {
        subtotal: sub,
        totalAnticipos: ant,
        descuentoMonto: desc,
        totalFinal: fin,
        saldoRestante: saldo,
      };
    }, [rows, discountType, discountValue]);

  // Manejo de filas
  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleUpdateRow = (
    id: string,
    field: keyof PlanillaRow,
    value: string | number
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          [field]: value,
        };
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      setRows([createEmptyRow()]);
      toast.info("Se vació la última fila");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDuplicateRow = (row: PlanillaRow) => {
    const newRow: PlanillaRow = {
      ...row,
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setRows((prev) => [...prev, newRow]);
    toast.success("Fila duplicada");
  };

  const handleResetPlanilla = () => {
    const empty = [createEmptyRow(), createEmptyRow()];
    setRows(empty);
    setDiscountValue(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    toast.info("Planilla reiniciada en blanco");
  };

  // Abrir y cerrar el modal de selección de producto
  const openProductModal = (row: PlanillaRow) => {
    setActiveRowId(row.id);
    setManualName(row.producto);
    setManualPrice(row.precio || 0);
    setCatalogSearch("");
    setCatalogCategory("all");
    setModalTab("catalog");
    setModalOpen(true);
  };

  const closeProductModal = () => {
    setModalOpen(false);
    setActiveRowId(null);
  };

  // Selección de producto desde el catálogo
  const handleSelectCatalogItem = (
    productName: string,
    variantDetails: string | null,
    price: number
  ) => {
    if (!activeRowId) return;

    const fullProductName = variantDetails
      ? `${productName} (${variantDetails})`
      : productName;

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== activeRowId) return r;
        return {
          ...r,
          producto: fullProductName,
          precio: price > 0 ? price : r.precio,
        };
      })
    );

    toast.success("Producto asignado a la fila", {
      description: `${fullProductName} · ${formatARS(price)}`,
    });

    closeProductModal();
  };

  // Guardado de producto escrito manualmente
  const handleApplyManualProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeRowId) return;

    const trimmed = manualName.trim();
    if (!trimmed) {
      toast.error("Por favor escribí el nombre del producto.");
      return;
    }

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== activeRowId) return r;
        return {
          ...r,
          producto: trimmed,
          precio: manualPrice >= 0 ? manualPrice : r.precio,
        };
      })
    );

    toast.success("Producto manual asignado a la fila");
    closeProductModal();
  };

  // Filtrado de productos en el catálogo
  const filteredCatalogProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        catalogCategory === "all" || p.product_type === catalogCategory;

      const q = catalogSearch.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesName = p.name.toLowerCase().includes(q);
      const matchesDesc = (p.short_description || "")
        .toLowerCase()
        .includes(q);
      const matchesVariants = p.variants.some(
        (v) =>
          v.size.toLowerCase().includes(q) ||
          v.color_name.toLowerCase().includes(q)
      );
      const matchesSkin = (p.skin_types || []).some((st) =>
        st.toLowerCase().includes(q)
      );

      return (
        matchesCategory &&
        (matchesName || matchesDesc || matchesVariants || matchesSkin)
      );
    });
  }, [products, catalogCategory, catalogSearch]);

  // 1. Guardar en Excel (Exportar) y reiniciar la planilla
  const handleExportExcel = () => {
    if (rows.length === 0 || rows.every((r) => !r.cliente && !r.producto)) {
      toast.error("La planilla está vacía. Ingresá al menos una fila con datos.");
      return;
    }

    try {
      const data: (string | number)[][] = [
        ["MIRTA COSMÉTICA - PLANILLA DE VENTAS Y PEDIDOS"],
        [`Fecha de Emisión: ${new Date().toLocaleString("es-AR")}`],
        [],
        [
          "#",
          "Cliente",
          "Producto",
          "Cantidad",
          "Precio Unitario",
          "Anticipo",
          "Total (Cant. * Precio)",
          "Saldo Restante Fila",
        ],
      ];

      rows.forEach((r, idx) => {
        const cant = Number(r.cantidad) || 0;
        const prec = Number(r.precio) || 0;
        const ant = Number(r.anticipo) || 0;
        const total = cant * prec;
        const saldoFila = total - ant;

        data.push([
          idx + 1,
          r.cliente.trim() || "Sin nombre",
          r.producto.trim() || "Sin detalle",
          cant,
          prec,
          ant,
          total,
          saldoFila,
        ]);
      });

      data.push([]);
      data.push(["", "", "", "", "", "SUBTOTAL:", subtotal]);
      data.push(["", "", "", "", "", "TOTAL ANTICIPOS:", totalAnticipos]);
      data.push([
        "",
        "",
        "",
        "",
        "",
        `DESCUENTO APLICADO (${
          discountType === "percent" ? `${discountValue}%` : "Monto Fijo"
        }):`,
        -descuentoMonto,
      ]);
      data.push(["", "", "", "", "", "TOTAL FINAL:", totalFinal]);
      data.push(["", "", "", "", "", "SALDO FINAL A COBRAR:", saldoRestante]);

      const ws = XLSX.utils.aoa_to_sheet(data);

      ws["!cols"] = [
        { wch: 5 },
        { wch: 26 },
        { wch: 40 },
        { wch: 10 },
        { wch: 16 },
        { wch: 15 },
        { wch: 22 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Planilla_Ventas");

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const filename = `Planilla_MirtaCosmetica_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);

      // Requerimiento explícito: "al guardar como excel se reinicia la planilla para escribir otra"
      const freshRows = [createEmptyRow(), createEmptyRow()];
      setRows(freshRows);
      setDiscountValue(0);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      toast.success("¡Planilla guardada y descargada en Excel!", {
        description:
          "La planilla se reinició en blanco para que puedas cargar una nueva venta.",
      });
    } catch (err) {
      toast.error("Ocurrió un error al generar el archivo Excel");
      console.error(err);
    }
  };

  // 2. Importar Excel para corregir o retomar
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
          header: 1,
        });

        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawData.length, 10); i++) {
          const rowStr = (rawData[i] || []).map((c) => String(c).toLowerCase()).join(" ");
          if (rowStr.includes("cliente") && (rowStr.includes("producto") || rowStr.includes("total"))) {
            headerRowIndex = i;
            break;
          }
        }

        const parsedRows: PlanillaRow[] = [];
        let importedDiscount = 0;

        const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;

        for (let i = startIndex; i < rawData.length; i++) {
          const r = rawData[i] || [];
          if (r.length === 0) continue;

          const rowText = r.map((c) => String(c).toLowerCase()).join(" ");

          if (rowText.includes("descuento")) {
            const num = r.find((val) => typeof val === "number" || (!isNaN(Number(val)) && Number(val) !== 0));
            if (num) importedDiscount = Math.abs(Number(num));
            continue;
          }

          if (
            rowText.includes("subtotal") ||
            rowText.includes("total final") ||
            rowText.includes("saldo final") ||
            rowText.includes("total anticipos") ||
            rowText.includes("mirta cosmética")
          ) {
            continue;
          }

          let colCliente = 1;
          let colProducto = 2;
          let colCantidad = 3;
          let colPrecio = 4;
          let colAnticipo = 5;

          if (headerRowIndex !== -1) {
            const headers = (rawData[headerRowIndex] || []).map((c) => String(c).toLowerCase().trim());
            const cIdx = headers.findIndex((h) => h.includes("cliente"));
            const pIdx = headers.findIndex((h) => h.includes("producto"));
            const qIdx = headers.findIndex((h) => h.includes("cant"));
            const prIdx = headers.findIndex((h) => h.includes("precio"));
            const aIdx = headers.findIndex((h) => h.includes("anticipo") || h.includes("seña"));

            if (cIdx !== -1) colCliente = cIdx;
            if (pIdx !== -1) colProducto = pIdx;
            if (qIdx !== -1) colCantidad = qIdx;
            if (prIdx !== -1) colPrecio = prIdx;
            if (aIdx !== -1) colAnticipo = aIdx;
          }

          const clienteVal = String(r[colCliente] ?? "").trim();
          const productoVal = String(r[colProducto] ?? "").trim();
          const cantidadVal = Number(r[colCantidad]) || 1;
          const precioVal = Number(r[colPrecio]) || 0;
          const anticipoVal = Number(r[colAnticipo]) || 0;

          if (clienteVal || productoVal || precioVal > 0) {
            parsedRows.push({
              id: `row-imp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
              cliente: clienteVal,
              producto: productoVal,
              cantidad: cantidadVal,
              precio: precioVal,
              anticipo: anticipoVal,
            });
          }
        }

        if (parsedRows.length > 0) {
          setRows(parsedRows);
          if (importedDiscount > 0) {
            setDiscountType("fixed");
            setDiscountValue(importedDiscount);
          }
          toast.success("¡Planilla importada con éxito!", {
            description: `Se cargaron ${parsedRows.length} fila(s) listas para que puedas modificarlas.`,
          });
        } else {
          toast.warning("No se encontraron filas válidas en el archivo Excel");
        }
      } catch (err) {
        toast.error("Error al procesar el archivo Excel. Verificá el formato.");
        console.error(err);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Input oculto para importación de Excel */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleImportExcel}
      />

      {/* Encabezado y Botones Principales */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4728C] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Herramienta Comercial · Mirta Cosmética
          </span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold text-[#111111] mt-1">
            Planilla de Ventas y Cálculos
          </h1>
          <p className="text-xs text-[#6B6568] mt-1">
            Cargá ventas con <strong>Cliente, Producto (con modal de catálogo o manual), Cantidad, Precio, Anticipo y Total</strong>. Aplicá descuentos al subtotal, exportá a Excel en 1 clic e importá para corregir.
          </p>
        </div>

        {/* Acciones principales: Importar, Exportar y Reiniciar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-full bg-white border border-[#F4B8C8] text-[#111111] text-xs font-bold inline-flex items-center gap-2 hover:bg-[#FCE7F3] transition cursor-pointer shadow-2xs"
            title="Cargar un archivo Excel guardado previamente para modificarlo"
          >
            <Upload className="w-4 h-4 text-[#D4728C]" />
            <span>Importar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#2a2527] transition cursor-pointer shadow-sm"
            title="Descarga el archivo Excel y reinicia la planilla para comenzar otra"
          >
            <Download className="w-4 h-4 text-[#F4B8C8]" />
            <span>Guardar en Excel</span>
          </button>

          <button
            type="button"
            onClick={handleResetPlanilla}
            className="p-2.5 rounded-full bg-white border border-[#FCE7F3] text-[#6B6568] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            title="Reiniciar planilla en blanco"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabla Dinámica de Carga */}
      <div className="bg-white rounded-3xl border border-[#F4B8C8] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#FCE7F3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#D4728C]" />
            <h2 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#111111]">
              Filas de Venta ({rows.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-2 rounded-full bg-[#FFF9FB] border border-[#F4B8C8] text-[#111111] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#FCE7F3] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4728C]" />
            <span>+ Agregar Fila</span>
          </button>
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9FB] border-b border-[#FCE7F3] text-[#6B6568] uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 min-w-[180px]">Cliente</th>
                <th className="py-3 px-3 min-w-[280px]">Producto (Modal / Manual)</th>
                <th className="py-3 px-3 w-24">Cantidad</th>
                <th className="py-3 px-3 w-32">Precio Unit. (ARS)</th>
                <th className="py-3 px-3 w-32">Anticipo (ARS)</th>
                <th className="py-3 px-3 w-36 text-right">Total (Cant × Precio)</th>
                <th className="py-3 px-3 w-32 text-right">Saldo Fila</th>
                <th className="py-3 px-3 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FCE7F3]">
              {rows.map((row, index) => {
                const totalFila =
                  (Number(row.cantidad) || 0) * (Number(row.precio) || 0);
                const saldoFila = totalFila - (Number(row.anticipo) || 0);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#FFF9FB]/60 transition group"
                  >
                    {/* Número de fila */}
                    <td className="py-2.5 px-3 text-center font-bold text-[#6B6568]">
                      {index + 1}
                    </td>

                    {/* Cliente */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.cliente}
                        onChange={(e) =>
                          handleUpdateRow(row.id, "cliente", e.target.value)
                        }
                        placeholder="Nombre de la clienta..."
                        className="w-full px-3 py-2 rounded-xl bg-[#FFF9FB] border border-transparent focus:border-[#F4B8C8] focus:bg-white focus:outline-none text-xs font-semibold text-[#111111]"
                      />
                    </td>

                    {/* Producto: Input con botón integrado para abrir Modal */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={row.producto}
                          onChange={(e) =>
                            handleUpdateRow(row.id, "producto", e.target.value)
                          }
                          placeholder="Elegir o escribir producto..."
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FFF9FB] border border-transparent focus:border-[#F4B8C8] focus:bg-white focus:outline-none text-xs text-[#111111] font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => openProductModal(row)}
                          className="p-2 rounded-xl bg-[#FFF9FB] border border-[#F4B8C8] text-[#D4728C] hover:bg-[#FCE7F3] hover:text-[#111111] transition cursor-pointer shrink-0"
                          title="Abrir buscador del catálogo o escribir producto con modal"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Cantidad */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={row.cantidad}
                        onChange={(e) =>
                          handleUpdateRow(
                            row.id,
                            "cantidad",
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FFF9FB] border border-transparent focus:border-[#F4B8C8] focus:bg-white focus:outline-none text-xs font-bold text-center text-[#111111]"
                      />
                    </td>

                    {/* Precio Unitario */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={row.precio}
                          onChange={(e) =>
                            handleUpdateRow(
                              row.id,
                              "precio",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-3 pr-2 py-2 rounded-xl bg-[#FFF9FB] border border-transparent focus:border-[#F4B8C8] focus:bg-white focus:outline-none text-xs font-bold text-[#111111]"
                        />
                      </div>
                    </td>

                    {/* Anticipo */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={row.anticipo}
                        onChange={(e) =>
                          handleUpdateRow(
                            row.id,
                            "anticipo",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-3 pr-2 py-2 rounded-xl bg-[#FFF9FB] border border-transparent focus:border-[#F4B8C8] focus:bg-white focus:outline-none text-xs font-bold text-[#D4728C]"
                      />
                    </td>

                    {/* Total de Fila (Cantidad * Precio) */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-bold text-sm text-[#111111]">
                        {formatARS(totalFila)}
                      </span>
                    </td>

                    {/* Saldo Restante Fila */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          saldoFila <= 0
                            ? "text-emerald-700"
                            : "text-[#6B6568]"
                        }`}
                      >
                        {saldoFila <= 0 ? "Pagado" : formatARS(saldoFila)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(row)}
                          className="p-1.5 rounded-lg text-[#6B6568] hover:text-[#111111] hover:bg-[#FCE7F3] transition cursor-pointer"
                          title="Duplicar fila"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1.5 rounded-lg text-[#6B6568] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Botón inferior para agregar fila rápido */}
        <div className="p-3 bg-[#FFF9FB] border-t border-[#FCE7F3]">
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2.5 rounded-2xl border border-dashed border-[#F4B8C8] text-[#111111] text-xs font-semibold hover:bg-white hover:border-[#D4728C] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4728C]" />
            <span>Agregar otra fila de venta</span>
          </button>
        </div>
      </div>

      {/* Sección Inferior de Totales y Descuento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel de Configuración de Descuento */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#FCE7F3] space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4728C]" />
            <h3 className="font-serif-editorial text-2xl font-semibold text-[#111111]">
              Descuento sobre Subtotal
            </h3>
          </div>
          <p className="text-xs text-[#6B6568]">
            Ingresá el descuento a aplicar sobre la suma total de las filas. Podés elegir porcentaje o monto fijo en ARS.
          </p>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8]">
            <button
              type="button"
              onClick={() => setDiscountType("percent")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                discountType === "percent"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "text-[#6B6568] hover:text-[#111111]"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Porcentaje (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("fixed")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                discountType === "fixed"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "text-[#6B6568] hover:text-[#111111]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Monto Fijo (ARS)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              {discountType === "percent"
                ? "Porcentaje de Descuento (%)"
                : "Monto de Descuento (ARS)"}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={discountType === "percent" ? 100 : subtotal}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-base font-bold text-[#111111] focus:bg-white focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4728C]">
                {discountType === "percent" ? "%" : "ARS"}
              </span>
            </div>
            {descuentoMonto > 0 && (
              <p className="text-[11px] text-[#D4728C] font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Se descontarán {formatARS(descuentoMonto)} del subtotal.
              </p>
            )}
          </div>
        </div>

        {/* Resumen Final de la Planilla */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#111111] text-white space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#F4B8C8]" />
              <h3 className="font-serif-editorial text-2xl font-semibold text-white">
                Liquidación Final
              </h3>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-[#F4B8C8] font-bold">
              {rows.length} Ítems
            </span>
          </div>

          <div className="space-y-3 text-sm">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-neutral-300">
              <span>Subtotal (Suma de Totales):</span>
              <span className="font-mono font-bold text-base text-white">
                {formatARS(subtotal)}
              </span>
            </div>

            {/* Total Anticipos */}
            <div className="flex items-center justify-between text-neutral-300">
              <span>Total Anticipos Recibidos:</span>
              <span className="font-mono font-bold text-base text-[#F4B8C8]">
                -{formatARS(totalAnticipos)}
              </span>
            </div>

            {/* Descuento */}
            <div className="flex items-center justify-between text-[#F4B8C8]">
              <span>
                Descuento aplicado (
                {discountType === "percent" ? `${discountValue}%` : "Monto"}):
              </span>
              <span className="font-mono font-bold text-base">
                -{formatARS(descuentoMonto)}
              </span>
            </div>

            {/* Total Final */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="font-serif-editorial text-xl sm:text-2xl font-bold text-white block">
                  Total Final
                </span>
                <span className="text-[11px] text-neutral-400">
                  (Subtotal menos Descuento)
                </span>
              </div>
              <span className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#F4B8C8]">
                {formatARS(totalFinal)}
              </span>
            </div>

            {/* Saldo Restante a Cobrar */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs mt-3">
              <div>
                <span className="font-bold text-white block">
                  Saldo Restante a Cobrar
                </span>
                <span className="text-[10px] text-neutral-400">
                  (Total Final menos Anticipos)
                </span>
              </div>
              <span className="font-mono text-lg font-bold text-emerald-400">
                {saldoRestante <= 0 ? "Cubierto con anticipo" : formatARS(saldoRestante)}
              </span>
            </div>
          </div>

          {/* Botón inferior destacado para guardar y reiniciar */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="w-full py-3.5 px-6 rounded-full bg-[#F4B8C8] text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-[#FCE7F3] transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Guardar en Excel y Crear Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Selección / Búsqueda / Carga Manual de Producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-[#F4B8C8] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-[#FCE7F3] flex items-center justify-between gap-3 bg-[#FFF9FB]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D4728C] font-bold">
                  Fila #{activeRowIndex + 1} · {activeRow?.cliente || "Sin cliente asignado"}
                </span>
                <h3 className="font-serif-editorial text-2xl font-semibold text-[#111111] leading-tight">
                  Seleccionar Producto
                </h3>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                className="p-2 rounded-full text-[#6B6568] hover:text-[#111111] hover:bg-[#FCE7F3] transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Pestañas: Buscar en Catálogo vs Escribir Manualmente */}
            <div className="p-3 bg-white border-b border-[#FCE7F3] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalTab("catalog")}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                  modalTab === "catalog"
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-[#FFF9FB] text-[#6B6568] hover:text-[#111111] border border-[#FCE7F3]"
                }`}
              >
                <Search className="w-4 h-4 text-[#F4B8C8]" />
                <span>Buscar en Catálogo ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("manual")}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
                  modalTab === "manual"
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-[#FFF9FB] text-[#6B6568] hover:text-[#111111] border border-[#FCE7F3]"
                }`}
              >
                <Edit3 className="w-4 h-4 text-[#D4728C]" />
                <span>Escribir Manualmente</span>
              </button>
            </div>

            {/* Contenido Pestaña 1: Buscar en Catálogo */}
            {modalTab === "catalog" ? (
              <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden space-y-3.5">
                {/* Barra de Búsqueda */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B6568] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Buscar por nombre, talle (ej: 90), color, fórmula..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-medium text-[#111111] focus:bg-white focus:outline-none"
                    autoFocus
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6568] hover:text-[#111111] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filtros de Categoría */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "lingerie", label: "Lencería" },
                    { id: "skincare", label: "Skin Care" },
                    { id: "kit", label: "Kits & Rituales" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCatalogCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        catalogCategory === cat.id
                          ? "bg-[#111111] text-[#F4B8C8]"
                          : "bg-[#FFF9FB] border border-[#FCE7F3] text-[#6B6568] hover:text-[#111111]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <span className="text-[11px] text-[#6B6568] ml-auto">
                    {filteredCatalogProducts.length} encontrados
                  </span>
                </div>

                {/* Lista de Productos con Scroll */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
                  {filteredCatalogProducts.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-[#D4728C] mx-auto opacity-60" />
                      <p className="text-xs font-bold text-[#111111]">
                        No se encontraron productos con ese filtro
                      </p>
                      <p className="text-[11px] text-[#6B6568]">
                        Probá con otro término o cambiá a la pestaña de &quot;Escribir Manualmente&quot;.
                      </p>
                    </div>
                  ) : (
                    filteredCatalogProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3 rounded-2xl bg-[#FFF9FB] border border-[#FCE7F3] hover:border-[#F4B8C8] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/item"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prod.images?.[0]?.url ? (
                            <img
                              src={prod.images[0].url}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#FCE7F3]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-5 h-5 text-[#D4728C]" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-[#FCE7F3] text-[#D4728C]">
                                {prod.product_type === "lingerie"
                                  ? "Lencería"
                                  : prod.product_type === "skincare"
                                  ? "Skin Care"
                                  : "Kit"}
                              </span>
                              <span className="font-bold text-xs text-[#111111] truncate">
                                {prod.name}
                              </span>
                            </div>

                            <p className="text-[11px] font-mono font-bold text-[#111111] mt-0.5">
                              Base: {formatARS(prod.base_price)}
                            </p>

                            {/* Variantes / Talles disponibles */}
                            {prod.variants?.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                <span className="text-[10px] text-[#6B6568] font-semibold mr-1">
                                  Talles:
                                </span>
                                {prod.variants.map((v) => {
                                  const vPrice = v.price_override ?? prod.base_price;
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() =>
                                        handleSelectCatalogItem(
                                          prod.name,
                                          `${v.size} · ${v.color_name}`,
                                          vPrice
                                        )
                                      }
                                      className="px-2 py-0.5 rounded-md bg-white border border-[#F4B8C8] hover:bg-[#111111] hover:text-[#F4B8C8] text-[10px] font-bold text-[#111111] transition cursor-pointer"
                                      title={`Seleccionar ${v.size} (${v.color_name}) a ${formatARS(vPrice)}`}
                                    >
                                      {v.size} ({v.color_name})
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botón para seleccionar producto genérico */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectCatalogItem(
                              prod.name,
                              null,
                              prod.base_price
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-[#111111] text-white text-[11px] font-bold hover:bg-[#2a2527] transition shrink-0 self-end sm:self-center cursor-pointer"
                        >
                          Elegir Producto
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Contenido Pestaña 2: Escribir Manualmente */
              <form
                onSubmit={handleApplyManualProduct}
                className="p-5 sm:p-6 space-y-4"
              >
                <div className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs text-[#6B6568] space-y-1">
                  <p className="font-bold text-[#111111]">
                    Carga libre y personalizada
                  </p>
                  <p>
                    Escribí cualquier prenda a medida, servicio de compostura, accesorio o descripción libre que no esté en el catálogo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">
                    Nombre o Descripción del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Ej: Conjunto personalizado seda negra con lazo, Talle 95"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-medium text-[#111111] focus:bg-white focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1.5">
                    Precio Unitario (ARS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8] text-xs font-bold text-[#111111] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[11px] text-[#6B6568] mt-1 block">
                    Actual: {formatARS(manualPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#FCE7F3]">
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="px-5 py-2.5 rounded-full border border-[#111111] text-xs font-bold text-[#111111] hover:bg-[#111111] hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2a2527] transition cursor-pointer shadow-xs"
                  >
                    Guardar en la Fila
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
