import React from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppFloatingButton } from "@/components/common/WhatsAppFloatingButton";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
