import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mirta Cosmética | Lencería de Autor & Skin Care Consciente",
    template: "%s | Mirta Cosmética",
  },
  description:
    "Tienda oficial de Mirta Cosmética. Lencería de diseño en puntilla y satén con empaque 100% discreto y fórmulas de Skin Care dermatológico. Envíos a todo el país por Correo Argentino.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${cormorant.variable} ${jakarta.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#F4B8C8]/40 selection:text-[#111111]">
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              background: "#111111",
              color: "#FFFFFF",
              border: "1px solid #F4B8C8",
              borderRadius: "14px",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
