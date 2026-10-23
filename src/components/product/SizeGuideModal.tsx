"use client";

import React, { useState } from "react";
import { CheckCircle2, Ruler, Sparkles, X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [bustCm, setBustCm] = useState<string>("");
  const [underBustCm, setUnderBustCm] = useState<string>("");
  const [hipCm, setHipCm] = useState<string>("");

  if (!isOpen) return null;

  const calculateRecommendedSize = () => {
    const bust = Number(bustCm);
    const hip = Number(hipCm);
    if (!bust && !hip) return null;

    if ((bust > 0 && bust <= 87) || (hip > 0 && hip <= 92)) {
      return {
        size: "85 (Talle S)",
        detail:
          "Ideal para contorno de busto entre 82-87 cm y cadera entre 86-92 cm.",
      };
    }
    if ((bust >= 88 && bust <= 93) || (hip >= 93 && hip <= 98)) {
      return {
        size: "90 (Talle M)",
        detail:
          "Nuestro talle más elegido. Ideal para busto 88-93 cm y cadera 93-98 cm.",
      };
    }
    if ((bust >= 94 && bust <= 99) || (hip >= 99 && hip <= 104)) {
      return {
        size: "95 (Talle L)",
        detail:
          "Calce cómodo para contorno de busto 94-99 cm y cadera 99-104 cm.",
      };
    }
    return {
      size: "100 / 105 (Talle XL)",
      detail:
        "Soporte y elastizado ideal para busto de 100 cm o más y cadera de 105-114 cm.",
    };
  };

  const recommendation = calculateRecommendedSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#F4B8C8] shadow-2xl">
        {/* Encabezado */}
        <div className="p-4 sm:p-6 border-b border-[#FCE7F3] bg-[#FFF9FB] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#111111] text-[#F4B8C8] flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif-editorial text-lg sm:text-2xl font-semibold text-[#111111]">
                Guía de Talles · Mirta Cosmética
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B6568]">
                Lencería de puntilla elastizada, bodys y conjuntos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[#FCE7F3] text-[#111111] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Calculadora Interactiva de Talle */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFF9FB] border border-[#F4B8C8]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4728C] mb-2.5 sm:mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Calculador Rápido de Talle</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Busto (cm)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 90"
                  value={bustCm}
                  onChange={(e) => setBustCm(e.target.value)}
                  className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Bajo Busto (cm)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 75"
                  value={underBustCm}
                  onChange={(e) => setUnderBustCm(e.target.value)}
                  className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Cadera (cm)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 96"
                  value={hipCm}
                  onChange={(e) => setHipCm(e.target.value)}
                  className="w-full px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-[#F4B8C8] text-xs sm:text-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            {recommendation && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-[#111111] text-white flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#F4B8C8] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#F4B8C8] font-semibold">
                    Tu talle recomendado:
                  </p>
                  <p className="text-base sm:text-lg font-serif-editorial font-semibold">
                    {recommendation.size}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                    {recommendation.detail}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Medidas Completa con scroll horizontal */}
          <div>
            <h4 className="font-serif-editorial text-lg sm:text-xl font-semibold text-[#111111] mb-2 sm:mb-3">
              Tabla de Equivalencias (Conjuntos y Bodys)
            </h4>
            <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-[#FCE7F3]">
              <table className="w-full min-w-[480px] text-left text-xs sm:text-sm">
                <thead className="bg-[#111111] text-white text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Talle</th>
                    <th className="py-2.5 px-3 sm:px-4">Equivalencia</th>
                    <th className="py-2.5 px-3 sm:px-4">Busto</th>
                    <th className="py-2.5 px-3 sm:px-4">Bajo Busto</th>
                    <th className="py-2.5 px-3 sm:px-4">Cadera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCE7F3]">
                  <tr className="hover:bg-[#FFF9FB]">
                    <td className="py-2.5 px-3 sm:px-4 font-bold">85</td>
                    <td className="py-2.5 px-3 sm:px-4">Talle S</td>
                    <td className="py-2.5 px-3 sm:px-4">82 – 87 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">68 – 72 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">86 – 93 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FFF9FB] bg-[#FFF9FB]/50">
                    <td className="py-2.5 px-3 sm:px-4 font-bold">90</td>
                    <td className="py-2.5 px-3 sm:px-4">Talle M</td>
                    <td className="py-2.5 px-3 sm:px-4">88 – 93 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">73 – 77 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">94 – 99 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FFF9FB]">
                    <td className="py-2.5 px-3 sm:px-4 font-bold">95</td>
                    <td className="py-2.5 px-3 sm:px-4">Talle L</td>
                    <td className="py-2.5 px-3 sm:px-4">94 – 99 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">78 – 82 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">100 – 106 cm</td>
                  </tr>
                  <tr className="hover:bg-[#FFF9FB] bg-[#FFF9FB]/50">
                    <td className="py-2.5 px-3 sm:px-4 font-bold">100</td>
                    <td className="py-2.5 px-3 sm:px-4">Talle XL</td>
                    <td className="py-2.5 px-3 sm:px-4">100 – 106 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">83 – 88 cm</td>
                    <td className="py-2.5 px-3 sm:px-4">107 – 114 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-[#6B6568] leading-relaxed">
            💡 <strong>Tip de calce Mirta Cosmética:</strong> Todas nuestras
            bombachas y colaless de conjunto cuentan con breteles laterales
            regulables que se adaptan desde un talle S hasta un XL sin marcar.
          </p>
        </div>
      </div>
    </div>
  );
}
