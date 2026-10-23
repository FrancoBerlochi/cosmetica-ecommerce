import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";
import {
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { Order, StoreSettings } from "@/types/database";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      order: Order;
      settings?: StoreSettings;
    };

    const { order, settings } = body;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 1. Si Supabase está configurado, persistimos la orden e ítems en PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseAdminClient();
        const { data: insertedOrder } = await supabase
          .from("orders")
          .insert({
            order_number: order.order_number,
            customer_email: order.customer_email,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_dni: order.customer_dni,
            shipping_method: order.shipping_method,
            shipping_address: order.shipping_address,
            shipping_cost: order.shipping_cost,
            discreet_packaging: order.discreet_packaging,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            coupon_code: order.coupon_code,
            subtotal: order.subtotal,
            discount_amount: order.discount_amount,
            transfer_discount_amount: order.transfer_discount_amount,
            total: order.total,
            order_status: order.order_status,
            notes: order.notes,
          })
          .select("id")
          .single();

        if (insertedOrder?.id) {
          await supabase.from("order_items").insert(
            order.items.map((item) => ({
              order_id: insertedOrder.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              product_name: item.product_name,
              variant_label: item.variant_label,
              unit_price: item.unit_price,
              quantity: item.quantity,
              line_total: item.line_total,
            }))
          );
        }
      } catch (dbErr) {
        console.warn("Aviso al guardar en Supabase:", dbErr);
      }
    }

    // 2. Enviar Email de Confirmación de Orden con Resend
    const emailResult = await sendOrderConfirmationEmail(order, settings);

    // 3. Si el método es Transferencia Bancaria, redirigimos directo a la pantalla de éxito con Alias/CBU
    if (order.payment_method === "bank_transfer") {
      return NextResponse.json({
        ok: true,
        paymentMethod: "bank_transfer",
        emailSent: emailResult.sent,
        emailSimulated: emailResult.simulated,
        redirectUrl: `${siteUrl}/checkout/exito?order=${encodeURIComponent(
          order.order_number
        )}&method=bank_transfer`,
      });
    }

    // 4. Si el método es Mercado Pago Checkout Pro, creamos la Preferencia oficial
    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    const isMpConfigured = Boolean(
      mpAccessToken &&
        !mpAccessToken.includes("tu-access-token") &&
        mpAccessToken.trim().length > 10
    );

    if (isMpConfigured && mpAccessToken) {
      const client = new MercadoPagoConfig({
        accessToken: mpAccessToken,
      });
      const preference = new Preference(client);

      const mpItems = order.items.map((item) => ({
        id: item.variant_id,
        title: `${item.product_name} (${item.variant_label})`,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
      }));

      if (order.shipping_cost > 0) {
        mpItems.push({
          id: "shipping-correo-argentino",
          title:
            order.shipping_method === "correo_sucursal"
              ? "Envío Correo Argentino (Retiro en Sucursal)"
              : "Envío Correo Argentino (A Domicilio)",
          quantity: 1,
          unit_price: Number(order.shipping_cost),
          currency_id: "ARS",
        });
      }

      const prefResponse = await preference.create({
        body: {
          items: mpItems,
          payer: {
            name: order.customer_name,
            email: order.customer_email,
            identification: {
              type: "DNI",
              number: order.customer_dni,
            },
          },
          external_reference: order.order_number,
          statement_descriptor: "MIRTA COSMETICA",
          back_urls: {
            success: `${siteUrl}/checkout/exito?order=${encodeURIComponent(
              order.order_number
            )}&method=mercadopago&status=approved`,
            pending: `${siteUrl}/checkout/exito?order=${encodeURIComponent(
              order.order_number
            )}&method=mercadopago&status=pending`,
            failure: `${siteUrl}/checkout?error=mp_rejected`,
          },
          auto_return: "approved",
          notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        },
      });

      return NextResponse.json({
        ok: true,
        paymentMethod: "mercadopago",
        preferenceId: prefResponse.id,
        initPoint: prefResponse.init_point,
        sandboxInitPoint: prefResponse.sandbox_init_point,
        redirectUrl: prefResponse.init_point || prefResponse.sandbox_init_point,
        emailSent: emailResult.sent,
      });
    }

    // Modo demostración local si aún no se cargó MP_ACCESS_TOKEN en .env.local
    return NextResponse.json({
      ok: true,
      paymentMethod: "mercadopago",
      simulatedMp: true,
      emailSent: emailResult.sent,
      emailSimulated: emailResult.simulated,
      redirectUrl: `${siteUrl}/checkout/exito?order=${encodeURIComponent(
        order.order_number
      )}&method=mercadopago&status=approved&demo=1`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error procesando el checkout con Mercado Pago",
      },
      { status: 500 }
    );
  }
}
