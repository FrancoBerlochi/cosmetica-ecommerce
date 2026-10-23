"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  FileSpreadsheet,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard & Alertas",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/productos",
      label: "Productos & Talles",
      icon: ShoppingBag,
    },
    {
      href: "/admin/pedidos",
      label: "Pedidos & Correo",
      icon: Package,
    },
    {
      href: "/admin/planilla",
      label: "Planilla de Ventas",
      icon: FileSpreadsheet,
    },
    {
      href: "/admin/envios",
      label: "Tarifas Correo",
      icon: Truck,
    },
    {
      href: "/admin/configuracion",
      label: "Cupones & Ajustes",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col lg:flex-row">
      {/* Barra Lateral Admin (Responsive: horizontal scroll en mobile, vertical fija en desktop) */}
      <aside className="w-full lg:w-72 bg-[#111111] text-white shrink-0 flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#F4B8C8]/30">
        <div className="space-y-4 lg:space-y-8">
          <div className="flex items-center justify-between lg:block">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4B8C8]/20 text-[#F4B8C8] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Backoffice
              </span>
              <h1 className="font-serif-editorial text-xl sm:text-2xl font-semibold tracking-wider text-white mt-1">
                MIRTA COSMÉTICA
              </h1>
            </div>

            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition"
            >
              <span>Tienda</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F4B8C8]" />
            </Link>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-semibold transition shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-[#F4B8C8] text-[#111111] shadow-sm"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block pt-6 border-t border-white/10 mt-6">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-between transition"
          >
            <span>Ver Tienda Pública</span>
            <ArrowUpRight className="w-4 h-4 text-[#F4B8C8]" />
          </Link>
        </div>
      </aside>

      {/* Contenido Principal Admin */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}
