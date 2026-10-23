-- ============================================================================
-- MIRTA COSMÉTICA - ESQUEMA INICIAL DE BASE DE DATOS (SUPABASE POSTGRESQL)
-- Incluye: Lencería + Skin Care + Kits, Correo Argentino, Mercado Pago,
-- Transferencia Bancaria, Cupones, Wishlist, Reseñas, RLS y Storage Bucket.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PERFILES DE USUARIO (Extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  dni TEXT,
  default_address JSONB DEFAULT '{}'::jsonb,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('lingerie', 'skincare', 'bundle')),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRODUCTOS (Soporta Lencería, Skin Care y Kits/Combos)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('lingerie', 'skincare', 'bundle')),
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= base_price),
  weight_grams INT NOT NULL DEFAULT 250,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  low_stock_threshold INT NOT NULL DEFAULT 4,

  -- Atributos específicos de Skin Care
  skin_types TEXT[] DEFAULT '{}',           -- ej. {'Todo tipo', 'Seca', 'Mixta', 'Sensible', 'Grasa'}
  routine_step TEXT,                        -- ej. '1. Limpieza', '2. Tónico', '3. Sérum', '4. Hidratación', '5. Solar'
  benefits TEXT[] DEFAULT '{}',             -- ej. {'Hidratación', 'Luminosidad', 'Calmante', 'Anti-age'}
  key_ingredients TEXT[] DEFAULT '{}',      -- ej. {'Ácido Hialurónico', 'Niacinamida 10%', 'Extracto de Rosa Damascena'}
  net_content TEXT,                         -- ej. '30 ml', '50 g'
  how_to_use TEXT,

  -- Atributos específicos de Lencería
  size_guide_type TEXT DEFAULT 'conjuntos', -- 'conjuntos' | 'bombachas' | 'bodys' | 'none'
  fabric_composition TEXT,                  -- ej. 'Puntilla elastizada importada & Tul suave (88% Poliamida, 12% Elastano)'
  care_instructions TEXT,
  discreet_shipping_badge BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VARIANTES DE PRODUCTO (Talle + Color con Stock independiente)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL DEFAULT 'Único',       -- ej. '85', '90', '95', '100', 'S', 'M', 'L', 'XL' o '30 ml'
  color_name TEXT NOT NULL DEFAULT 'Rosa Pastel',
  color_hex TEXT NOT NULL DEFAULT '#F4B8C8',
  price_override NUMERIC(12, 2),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. IMÁGENES DE PRODUCTOS (Vinculadas con Supabase Storage)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ZONAS Y TARIFAS DE CORREO ARGENTINO
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                       -- ej. 'AMBA y CABA', 'Provincia de Buenos Aires y Centro', 'Resto del País / Patagonia & NOA'
  provinces TEXT[] NOT NULL,                -- Provincias incluidas en la zona
  home_delivery_price NUMERIC(12, 2) NOT NULL,   -- Correo Argentino a Domicilio
  branch_pickup_price NUMERIC(12, 2) NOT NULL,   -- Correo Argentino a Sucursal (más económico)
  extra_kg_price NUMERIC(12, 2) NOT NULL DEFAULT 1500,
  estimated_days TEXT NOT NULL DEFAULT '3 a 5 días hábiles',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CUPONES DE DESCUENTO
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PEDIDOS (Soporta Guest Checkout + Usuarios Registrados)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_dni TEXT NOT NULL,

  -- Logística Correo Argentino
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('correo_domicilio', 'correo_sucursal')),
  shipping_address JSONB NOT NULL,          -- { street, number, floor, city, province, postalCode, branchName }
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tracking_number TEXT,                     -- Código Track & Trace de Correo Argentino (ej. TN123456789AR)
  tracking_sent_at TIMESTAMPTZ,
  discreet_packaging BOOLEAN NOT NULL DEFAULT TRUE,

  -- Pagos (Mercado Pago Checkout Pro o Transferencia Bancaria)
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mercadopago', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'refunded')),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  coupon_code TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  transfer_discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,

  -- Estado Operativo del Pedido
  order_status TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK (order_status IN ('awaiting_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ÍTEMS DEL PEDIDO
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(12, 2) NOT NULL
);

-- 10. WISHLIST (FAVORITOS)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 11. RESEÑAS Y VALORACIONES VERIFICADAS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  skin_type_context TEXT,
  size_purchased TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CONFIGURACIÓN GLOBAL DE LA TIENDA (Mirta Cosmética)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'Mirta Cosmética',
  tagline TEXT NOT NULL DEFAULT 'Lencería de autor & Skin Care consciente',
  transfer_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  free_shipping_threshold NUMERIC(12, 2) NOT NULL DEFAULT 65000.00,
  bank_name TEXT NOT NULL DEFAULT 'Banco Galicia / Mercado Pago',
  bank_holder TEXT NOT NULL DEFAULT 'Mirta Cosmética',
  bank_cbu TEXT NOT NULL DEFAULT '0070000030004012345678',
  bank_alias TEXT NOT NULL DEFAULT 'MIRTA.COSMETICA.MP',
  whatsapp_number TEXT NOT NULL DEFAULT '5491123456789',
  instagram_handle TEXT NOT NULL DEFAULT '@mirtacosmetica',
  correo_argentino_mode TEXT NOT NULL DEFAULT 'hybrid' CHECK (correo_argentino_mode IN ('database', 'api', 'hybrid')),
  discreet_shipping_notice TEXT NOT NULL DEFAULT 'Todos nuestros envíos de lencería se despachan en empaque 100% discreto y sellado, sin logos ni referencias al contenido en el exterior.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función auxiliar para descontar stock de una variante de forma segura
CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.product_variants
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Función para comprobar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas de lectura pública para el catálogo
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public read images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read shipping zones" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR public.is_admin());
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);

-- Políticas de administración total para usuarios con rol 'admin'
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access variants" ON public.product_variants FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access images" ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access shipping" ON public.shipping_zones FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access coupons" ON public.coupons FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access order_items" ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access reviews" ON public.reviews FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access settings" ON public.store_settings FOR ALL USING (public.is_admin());

-- Políticas para clientes (Perfiles, Pedidos y Wishlist)
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can create orders (Guest Checkout)" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can submit review" ON public.reviews FOR INSERT WITH CHECK (true);

-- Bucket de Supabase Storage para imágenes de productos (WebP)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;
