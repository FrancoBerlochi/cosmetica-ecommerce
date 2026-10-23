import { NextResponse } from "next/server";
import {
  sendOrderShippedEmail,
  sendPaymentApprovedEmail,
} from "@/lib/email/resend";
import { getCorreoArgentinoTrackingUrl } from "@/lib/shipping/correo-argentino";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { Order } from "@/types/database";

/**
 * Endpoint invocado desde /admin/pedidos cuando el administrador:
 * 1) Carga el código Track & Trace de Correo Argentino y despacha el pedido (dispara email con link a Correo Argentino).
 * 2) Aprueba manualmente un comprobante de Transferencia Bancaria (dispara email de pago aprobado).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action: "ship_correo_argentino" | "approve_payment";
      order: Order;
    };

    const { action, order } = body;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseAdminClient();
        await supabase
          .from("orders")
          .update({
            order_status: order.order_status,
            payment_status: order.payment_status,
            tracking_number: order.tracking_number,
            tracking_sent_at:
              action === "ship_correo_argentino"
                ? new Date().toISOString()
                : order.tracking_sent_at,
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", order.order_number);
      } catch (e) {
        console.warn("Aviso al sincronizar estado en Supabase:", e);
      }
    }

    if (action === "ship_correo_argentino") {
      const emailRes = await sendOrderShippedEmail(order);
      return NextResponse.json({
        ok: true,
        emailSent: emailRes.sent,
        emailSimulated: emailRes.simulated,
        trackingUrl: getCorreoArgentinoTrackingUrl(
          order.tracking_number || ""
        ),
      });
    }

    if (action === "approve_payment") {
      const emailRes = await sendPaymentApprovedEmail(order);
      return NextResponse.json({
        ok: true,
        emailSent: emailRes.sent,
        emailSimulated: emailRes.simulated,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error procesando notificación del pedido",
      },
      { status: 500 }
    );
  }
}
