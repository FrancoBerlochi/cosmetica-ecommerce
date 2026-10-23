"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SHIPPING_ZONES,
  INITIAL_STORE_SETTINGS,
} from "@/lib/mock-data";
import {
  CartItem,
  Coupon,
  Order,
  OrderStatusType,
  PaymentStatusType,
  Product,
  ProductReview,
  ShippingZone,
  StoreSettings,
} from "@/types/database";

interface StoreState {
  // Carrito de compras
  cart: CartItem[];
  isCartOpen: boolean;
  appliedCoupon: Coupon | null;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (
    code: string,
    subtotal: number
  ) => { ok: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist (Favoritos)
  wishlist: string[]; // IDs de productos
  toggleWishlist: (productId: string) => boolean; // true = agregado, false = quitado

  // Datos Administrables (Sincronizados con Admin y Supabase)
  products: Product[];
  orders: Order[];
  shippingZones: ShippingZone[];
  coupons: Coupon[];
  reviews: ProductReview[];
  settings: StoreSettings;

  // Acciones Admin: Productos y Stock
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateVariantStock: (
    productId: string,
    variantId: string,
    newStock: number
  ) => void;

  // Acciones Admin: Pedidos y Correo Argentino
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    orderStatus: OrderStatusType,
    paymentStatus?: PaymentStatusType,
    trackingNumber?: string
  ) => void;

  // Acciones Admin: Envíos, Cupones, Reseñas y Configuración
  updateShippingZone: (zone: ShippingZone) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  addReview: (review: ProductReview) => void;
  toggleReviewApproval: (reviewId: string) => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      appliedCoupon: null,
      wishlist: ["prod-1", "prod-2"],

      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      shippingZones: INITIAL_SHIPPING_ZONES,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      settings: INITIAL_STORE_SETTINGS,

      setCartOpen: (open) => set({ isCartOpen: open }),

      addToCart: (newItem) =>
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (i) => i.variantId === newItem.variantId
          );
          if (existingIndex > -1) {
            const updated = [...state.cart];
            const nextQty = Math.min(
              updated[existingIndex].maxStock,
              updated[existingIndex].quantity + newItem.quantity
            );
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: nextQty,
            };
            return { cart: updated, isCartOpen: true };
          }
          return { cart: [...state.cart, newItem], isCartOpen: true };
        }),

      removeFromCart: (variantId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.variantId !== variantId),
        })),

      updateCartQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            cart: state.cart.map((item) =>
              item.variantId === variantId
                ? { ...item, quantity: Math.min(item.maxStock, quantity) }
                : item
            ),
          };
        }),

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      applyCouponCode: (code, subtotal) => {
        const clean = code.trim().toUpperCase();
        const found = get().coupons.find(
          (c) => c.code.toUpperCase() === clean && c.is_active
        );
        if (!found) {
          return {
            ok: false,
            message: "El código de cupón no existe o no está activo.",
          };
        }
        if (subtotal < found.min_purchase_amount) {
          return {
            ok: false,
            message: `Este cupón requiere una compra mínima de $${found.min_purchase_amount.toLocaleString("es-AR")}.`,
          };
        }
        set({ appliedCoupon: found });
        return {
          ok: true,
          message: `¡Cupón ${found.code} aplicado correctamente!`,
        };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      toggleWishlist: (productId) => {
        const exists = get().wishlist.includes(productId);
        if (exists) {
          set({
            wishlist: get().wishlist.filter((id) => id !== productId),
          });
          return false;
        } else {
          set({ wishlist: [...get().wishlist, productId] });
          return true;
        }
      },

      upsertProduct: (product) =>
        set((state) => {
          const exists = state.products.some((p) => p.id === product.id);
          if (exists) {
            return {
              products: state.products.map((p) =>
                p.id === product.id ? product : p
              ),
            };
          }
          return { products: [product, ...state.products] };
        }),

      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),

      updateVariantStock: (productId, variantId, newStock) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id !== productId
              ? product
              : {
                  ...product,
                  variants: product.variants.map((v) =>
                    v.id === variantId
                      ? { ...v, stock: Math.max(0, newStock) }
                      : v
                  ),
                }
          ),
        })),

      addOrder: (order) =>
        set((state) => {
          // Descontar stock de cada variante comprada
          const updatedProducts = state.products.map((prod) => {
            const matchingItems = order.items.filter(
              (item) => item.product_id === prod.id
            );
            if (matchingItems.length === 0) return prod;
            return {
              ...prod,
              variants: prod.variants.map((variant) => {
                const bought = matchingItems.find(
                  (i) => i.variant_id === variant.id
                );
                if (!bought) return variant;
                return {
                  ...variant,
                  stock: Math.max(0, variant.stock - bought.quantity),
                };
              }),
            };
          });

          return {
            orders: [order, ...state.orders],
            products: updatedProducts,
          };
        }),

      updateOrderStatus: (orderId, orderStatus, paymentStatus, trackingNumber) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id !== orderId
              ? order
              : {
                  ...order,
                  order_status: orderStatus,
                  payment_status: paymentStatus ?? order.payment_status,
                  tracking_number:
                    trackingNumber !== undefined
                      ? trackingNumber
                      : order.tracking_number,
                  tracking_sent_at:
                    trackingNumber && trackingNumber.trim().length > 0
                      ? new Date().toISOString()
                      : order.tracking_sent_at,
                }
          ),
        })),

      updateShippingZone: (zone) =>
        set((state) => ({
          shippingZones: state.shippingZones.map((z) =>
            z.id === zone.id ? zone : z
          ),
        })),

      upsertCoupon: (coupon) =>
        set((state) => {
          const exists = state.coupons.some((c) => c.id === coupon.id);
          if (exists) {
            return {
              coupons: state.coupons.map((c) =>
                c.id === coupon.id ? coupon : c
              ),
            };
          }
          return { coupons: [coupon, ...state.coupons] };
        }),

      deleteCoupon: (couponId) =>
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== couponId),
        })),

      addReview: (review) =>
        set((state) => ({
          reviews: [review, ...state.reviews],
        })),

      toggleReviewApproval: (reviewId) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, is_approved: !r.is_approved } : r
          ),
        })),

      updateSettings: (partialSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...partialSettings },
        })),
    }),
    {
      name: "mirta-cosmetica-storage-v1",
    }
  )
);
