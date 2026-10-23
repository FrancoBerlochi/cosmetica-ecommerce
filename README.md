# Mirta Cosmética · E-commerce de Lencería & Skin Care

Plataforma e-commerce oficial de **Mirta Cosmética** desarrollada con **Next.js 16 (App Router)**, **Tailwind CSS**, **Supabase**, **Mercado Pago (Checkout Pro)**, **Correo Argentino (Domicilio y Sucursal)**, **Resend** y **Sonner**.

## Stack Tecnológico y Diseño
- **Framework**: Next.js 16 + React 19 + TypeScript
- **Estilos y Paleta**: Tailwind CSS con paleta Rosa Pastel (`#F4B8C8` / `#FCE7F3`), Blanco Marfil (`#FFF9FB` / `#FFFFFF`) y Negro Editorial (`#111111`)
- **Tipografías**: `Cormorant Garamond` (Títulos editoriales) + `Plus Jakarta Sans` (UI, cuerpo y precios)
- **Notificaciones**: `Sonner`
- **Base de Datos, Auth y Storage**: Supabase (PostgreSQL + Row Level Security + Storage Bucket `products` con compresión automática a WebP)
- **Pagos**: Mercado Pago (`Checkout Pro` + Webhook `/api/webhooks/mercadopago`) y Transferencia Bancaria con `% OFF` configurable
- **Logística**: **Correo Argentino** (Envío a Domicilio y Retiro en Sucursal con tarifario administrable en `/admin/envios`, conector API MiCorreo/Paq.ar y despacho con código Track & Trace)
- **Emails Transaccionales**: `Resend` (Recibo de orden, confirmación de pago acreditado y aviso de envío con link directo al seguimiento de Correo Argentino)

## Inicio Rápido

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar variables de entorno (opcional para probar en local; el sistema funciona de inmediato con datos semilla e integra los servicios en vivo apenas configures tus claves):
   ```bash
   cp .env.example .env.local
   ```
3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   - **Tienda Pública**: `http://localhost:3000`
   - **Catálogo con filtros Lencería / Skin Care**: `http://localhost:3000/catalogo`
   - **Seguimiento Correo Argentino**: `http://localhost:3000/seguimiento`
   - **Panel de Administración (Backoffice)**: `http://localhost:3000/admin`
