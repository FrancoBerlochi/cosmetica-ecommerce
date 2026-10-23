"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

export function WhatsAppFloatingButton() {
  const settings = useStore((s) => s.settings);
  const phone = (settings.whatsapp_number || "5491123456789").replace(
    /\D/g,
    ""
  );
  const text = encodeURIComponent(
    "¡Hola Mirta Cosmética! Quisiera hacer una consulta sobre talles de lencería / rutina de skin care:"
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-30 flex items-center gap-2 bg-[#111111] text-white border border-[#F4B8C8] p-3 sm:pl-3.5 sm:pr-4 sm:py-2.5 rounded-full shadow-xl hover:bg-[#262223] hover:scale-105 transition-all group"
    >
      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F4B8C8] text-[#111111] flex items-center justify-center shrink-0">
        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
      </span>
      <span className="text-xs font-semibold tracking-wide hidden sm:inline">
        ¿Dudas con tu talle o piel?
      </span>
    </a>
  );
}
