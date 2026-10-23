import { Resend } from "resend";
import { INITIAL_STORE_SETTINGS } from "@/lib/mock-data";
import { getCorreoArgentinoTrackingUrl } from "@/lib/shipping/correo-argentino";
import { formatARS } from "@/lib/utils";
import { Order, StoreSettings } from "@/types/database";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("tu_api_key")) {
    return null;
  }
  return new Resend(apiKey);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Mirta Cosmética <pedidos@mirtacosmetica.com>";

function buildEmailLayout(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#FFF9FB;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111111;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF9FB;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #F4B8C8;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="background-color:#111111;padding:28px 32px;text-align:center;">
                    <p style="margin:0;color:#F4B8C8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Lencería de Autor &amp; Skin Care</p>
                    <h1 style="margin:6px 0 0;color:#FFFFFF;font-family:Georgia,serif;font-size:28px;font-weight:500;letter-spacing:1px;">MIRTA COSMÉTICA</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    ${bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#FFF9FB;border-top:1px solid #FCE7F3;padding:20px 32px;text-align:center;font-size:12px;color:#6B6568;">
                    <p style="margin:0 0 6px;">📦 Todos nuestros envíos por <strong>Correo Argentino</strong> se despachan en empaque 100% discreto y sellado.</p>
                    <p style="margin:0;">© ${new Date().getFullYear()} Mirta Cosmética · Argentina</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * 1. Email de Confirmación de Pedido (Recibo de compra + Datos de Transferencia si aplica)
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  settings: StoreSettings = INITIAL_STORE_SETTINGS
): Promise<{ sent: boolean; simulated?: boolean; error?: string }> {
  const resend = getResendClient();

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #FCE7F3;">
          <strong style="color:#111111;">${item.product_name}</strong><br/>
          <span style="font-size:12px;color:#6B6568;">Variante: ${item.variant_label} · Cant: ${item.quantity}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #FCE7F3;font-weight:600;">
          ${formatARS(item.line_total)}
        </td>
      </tr>
    `
    )
    .join("");

  const transferBoxHtml =
    order.payment_method === "bank_transfer"
      ? `
      <div style="margin:24px 0;padding:20px;background-color:#FFF9FB;border:1px solid #F4B8C8;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#D4728C;">
          Datos para realizar tu Transferencia (${settings.transfer_discount_percent}% OFF aplicado)
        </p>
        <p style="margin:4px 0;font-size:14px;"><strong>Banco / Entidad:</strong> ${settings.bank_name}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Titular:</strong> ${settings.bank_holder}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Alias:</strong> <span style="background:#FCE7F3;padding:2px 6px;border-radius:4px;font-family:monospace;">${settings.bank_alias}</span></p>
        <p style="margin:4px 0;font-size:14px;"><strong>CBU / CVU:</strong> <span style="font-family:monospace;">${settings.bank_cbu}</span></p>
        <p style="margin:10px 0 0;font-size:12px;color:#6B6568;">
          Una vez realizada la transferencia por <strong>${formatARS(order.total)}</strong>, envianos el comprobante por WhatsApp indicando tu pedido <strong>#${order.order_number}</strong>.
        </p>
      </div>
    `
      : "";

  const shippingLabel =
    order.shipping_method === "correo_sucursal"
      ? `Correo Argentino · Retiro en Sucursal (${order.shipping_address.branchName || order.shipping_address.city})`
      : `Correo Argentino · Envío a Domicilio (${order.shipping_address.street} ${order.shipping_address.number}, ${order.shipping_address.city})`;

  const html = buildEmailLayout(
    `Confirmación de Pedido #${order.order_number} - Mirta Cosmética`,
    `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#111111;">¡Gracias por tu compra, ${order.customer_name}!</h2>
      <p style="margin:0 0 20px;color:#6B6568;font-size:14px;line-height:1.6;">
        Recibimos tu pedido <strong>#${order.order_number}</strong> en <strong>Mirta Cosmética</strong>. A continuación encontrarás el detalle completo:
      </p>
      ${transferBoxHtml}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:14px;">
        ${itemsHtml}
        <tr>
          <td style="padding-top:12px;color:#6B6568;">Subtotal</td>
          <td align="right" style="padding-top:12px;">${formatARS(order.subtotal)}</td>
        </tr>
        ${
          order.discount_amount > 0
            ? `<tr><td style="padding-top:6px;color:#D4728C;">Cupón (${order.coupon_code})</td><td align="right" style="padding-top:6px;color:#D4728C;">-${formatARS(order.discount_amount)}</td></tr>`
            : ""
        }
        ${
          order.transfer_discount_amount > 0
            ? `<tr><td style="padding-top:6px;color:#D4728C;">Descuento por Transferencia</td><td align="right" style="padding-top:6px;color:#D4728C;">-${formatARS(order.transfer_discount_amount)}</td></tr>`
            : ""
        }
        <tr>
          <td style="padding-top:6px;color:#6B6568;">Envío (${shippingLabel})</td>
          <td align="right" style="padding-top:6px;">${order.shipping_cost === 0 ? "GRATIS" : formatARS(order.shipping_cost)}</td>
        </tr>
        <tr>
          <td style="padding-top:12px;font-size:16px;font-weight:700;color:#111111;">Total</td>
          <td align="right" style="padding-top:12px;font-size:18px;font-weight:700;color:#111111;">${formatARS(order.total)}</td>
        </tr>
      </table>
    `
  );

  if (!resend) {
    return { sent: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customer_email],
      subject: `Confirmación de tu pedido #${order.order_number} · Mirta Cosmética`,
      html,
    });
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Error enviando email",
    };
  }
}

/**
 * 2. Email de Pago Aprobado (Disparado por el Webhook de Mercado Pago o Admin)
 */
export async function sendPaymentApprovedEmail(
  order: Order
): Promise<{ sent: boolean; simulated?: boolean; error?: string }> {
  const resend = getResendClient();

  const html = buildEmailLayout(
    `Pago Acreditado · Pedido #${order.order_number}`,
    `
      <div style="display:inline-block;padding:4px 12px;background-color:#FCE7F3;color:#111111;border-radius:99px;font-size:12px;font-weight:600;margin-bottom:12px;">
        PAGO ACREDITADO
      </div>
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;color:#111111;">
        ¡Tu pago fue confirmado, ${order.customer_name}!
      </h2>
      <p style="margin:0 0 18px;color:#6B6568;font-size:14px;line-height:1.6;">
        El pago de tu pedido <strong>#${order.order_number}</strong> por <strong>${formatARS(order.total)}</strong> fue acreditado con éxito. Ya estamos preparando tus productos con empaque 100% discreto para despacharlos por <strong>Correo Argentino</strong>.
      </p>
      <p style="margin:0;color:#6B6568;font-size:13px;">
        Apenas tu paquete ingrese a Correo Argentino, recibirás un nuevo correo con tu código de seguimiento Track &amp; Trace.
      </p>
    `
  );

  if (!resend) {
    return { sent: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customer_email],
      subject: `¡Pago confirmado! Preparamos tu pedido #${order.order_number} · Mirta Cosmética`,
      html,
    });
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Error enviando email",
    };
  }
}

/**
 * 3. Email de Pedido Despachado por Correo Argentino con código Track & Trace
 */
export async function sendOrderShippedEmail(
  order: Order
): Promise<{ sent: boolean; simulated?: boolean; error?: string }> {
  const resend = getResendClient();
  const trackingCode = order.tracking_number || "PENDIENTE";
  const trackingUrl = getCorreoArgentinoTrackingUrl(trackingCode);

  const html = buildEmailLayout(
    `¡Tu pedido #${order.order_number} está en camino por Correo Argentino!`,
    `
      <div style="display:inline-block;padding:4px 12px;background-color:#F4B8C8;color:#111111;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:12px;">
        DESPACHADO POR CORREO ARGENTINO
      </div>
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;color:#111111;">
        ¡Hola ${order.customer_name}, tu pedido ya está en camino!
      </h2>
      <p style="margin:0 0 20px;color:#6B6568;font-size:14px;line-height:1.6;">
        Despachamos tu pedido <strong>#${order.order_number}</strong> a través de <strong>Correo Argentino</strong> (${
          order.shipping_method === "correo_sucursal"
            ? "Retiro en Sucursal"
            : "Envío a Domicilio"
        }).
      </p>
      <div style="margin:24px 0;padding:22px;background-color:#FFF9FB;border:1px solid #F4B8C8;border-radius:12px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#6B6568;">
          Código de Seguimiento (Track &amp; Trace)
        </p>
        <p style="margin:0 0 18px;font-size:22px;font-weight:700;letter-spacing:2px;color:#111111;font-family:monospace;">
          ${trackingCode}
        </p>
        <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#111111;color:#FFFFFF;text-decoration:none;padding:12px 26px;border-radius:99px;font-size:13px;font-weight:600;letter-spacing:0.5px;">
          Seguir mi envío en Correo Argentino →
        </a>
      </div>
      <p style="margin:0;color:#6B6568;font-size:13px;line-height:1.5;">
        Recordá presentar tu DNI (<strong>${order.customer_dni}</strong>) al momento de recibir el paquete o retirarlo en la sucursal de Correo Argentino.
      </p>
    `
  );

  if (!resend) {
    return { sent: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customer_email],
      subject: `¡Tu pedido #${order.order_number} fue enviado por Correo Argentino! (${trackingCode})`,
      html,
    });
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Error enviando email",
    };
  }
}
