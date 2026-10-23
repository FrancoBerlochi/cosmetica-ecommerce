import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendPaymentApprovedEmail } from "@/lib/email/resend";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

/**
 * Webhook oficial de Mercado Pago para recibir notificaciones de pago (payment.created / payment.updated)
 * Actualiza el estado de la orden en Supabase, descuenta el stock de las variantes y envía el email con Resend.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const queryId =
      url.searchParams.get("id") || url.searchParams.get("data.id");

    const body = await request.json().catch(() => ({}));
    const paymentId = queryId || body?.data?.id || body?.id;
    const actionType = topic || body?.type || body?.action;

    if (!paymentId || !String(actionType).includes("payment")) {
      return NextResponse.json({ received: true });
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    if (!mpAccessToken || mpAccessToken.includes("tu-access-token")) {
      return NextResponse.json({ received: true, mode: "sandbox_unconfigured" });
    }

    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentApi = new Payment(client);
    const paymentInfo = await paymentApi.get({ id: String(paymentId) });

    const externalReference = paymentInfo.external_reference;
    const status = paymentInfo.status; // 'approved' | 'pending' | 'rejected'

    if (externalReference && isSupabaseConfigured()) {
      const supabase = createSupabaseAdminClient();
      const mappedPaymentStatus =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "pending";
      const mappedOrderStatus =
        status === "approved" ? "paid" : "awaiting_payment";

      const { data: updatedOrder } = await supabase
        .from("orders")
        .update({
          payment_status: mappedPaymentStatus,
          order_status: mappedOrderStatus,
          mp_payment_id: String(paymentId),
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", externalReference)
        .select("*, order_items(*)")
        .single();

      if (status === "approved" && updatedOrder) {
        // Descontar stock por variante en Supabase
        const items = Array.isArray(updatedOrder.order_items)
          ? updatedOrder.order_items
          : [];
        for (const item of items) {
          if (item.variant_id) {
            await supabase.rpc("decrement_variant_stock", {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity,
            });
          }
        }

        // Disparar email de pago acreditado vía Resend
        await sendPaymentApprovedEmail({
          ...updatedOrder,
          items,
        });
      }
    }

    return NextResponse.json({ received: true, status });
  } catch (error) {
    console.error("Error en Webhook de Mercado Pago:", error);
    return NextResponse.json(
      { received: false, error: "Webhook processing error" },
      { status: 200 }
    );
  }
}
