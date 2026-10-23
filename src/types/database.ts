export type ProductType = "lingerie" | "skincare" | "bundle";

export type SizeGuideType = "conjuntos" | "bombachas" | "bodys" | "none";

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string; // ej. '85', '90', '95', '100', 'S', 'M', 'L', 'XL', '30 ml', '50 g'
  color_name: string;
  color_hex: string;
  price_override?: number | null;
  stock: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  category_name: string;
  subcategory_slug: string;
  product_type: ProductType;
  base_price: number;
  compare_at_price?: number | null;
  weight_grams: number;
  is_active: boolean;
  is_featured: boolean;
  low_stock_threshold: number;

  // Atributos de Skin Care
  skin_types?: string[];
  routine_step?: string | null;
  benefits?: string[];
  key_ingredients?: string[];
  net_content?: string | null;
  how_to_use?: string | null;

  // Atributos de Lencería
  size_guide_type?: SizeGuideType;
  fabric_composition?: string | null;
  care_instructions?: string | null;
  discreet_shipping_badge: boolean;

  images: ProductImage[];
  variants: ProductVariant[];
  rating_avg?: number;
  reviews_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_type: ProductType;
}

export interface CartItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  productType: ProductType;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  weightGrams: number;
  quantity: number;
  maxStock: number;
}

export type ShippingMethodType = "correo_domicilio" | "correo_sucursal";

export interface ShippingZone {
  id: string;
  name: string;
  provinces: string[];
  home_delivery_price: number;
  branch_pickup_price: number;
  extra_kg_price: number;
  estimated_days: string;
  is_active: boolean;
}

export interface CorreoArgentinoBranch {
  code: string;
  name: string;
  address: string;
  locality: string;
  province: string;
  postalCode: string;
}

export interface CorreoArgentinoQuote {
  method: ShippingMethodType;
  label: string;
  description: string;
  price: number;
  isFree: boolean;
  estimatedDays: string;
  zoneName: string;
  source: "database_tariff" | "correo_argentino_api";
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_uses?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
}

export type PaymentMethodType = "mercadopago" | "bank_transfer";
export type PaymentStatusType = "pending" | "approved" | "rejected" | "refunded";
export type OrderStatusType =
  | "awaiting_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  street: string;
  number: string;
  floor?: string;
  city: string;
  province: string;
  postalCode: string;
  branchCode?: string;
  branchName?: string;
  observations?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_dni: string;
  shipping_method: ShippingMethodType;
  shipping_address: ShippingAddress;
  shipping_cost: number;
  tracking_number?: string | null;
  tracking_sent_at?: string | null;
  discreet_packaging: boolean;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatusType;
  mp_preference_id?: string | null;
  mp_payment_id?: string | null;
  coupon_code?: string | null;
  subtotal: number;
  discount_amount: number;
  transfer_discount_amount: number;
  total: number;
  order_status: OrderStatusType;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  skin_type_context?: string;
  size_purchased?: string;
  verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface StoreSettings {
  brand_name: string;
  tagline: string;
  transfer_discount_percent: number;
  free_shipping_threshold: number;
  bank_name: string;
  bank_holder: string;
  bank_cbu: string;
  bank_alias: string;
  whatsapp_number: string;
  instagram_handle: string;
  correo_argentino_mode: "database" | "api" | "hybrid";
  discreet_shipping_notice: string;
}
