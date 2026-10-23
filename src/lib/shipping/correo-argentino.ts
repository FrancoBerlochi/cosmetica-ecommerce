import {
  CORREO_ARGENTINO_BRANCHES,
  INITIAL_SHIPPING_ZONES,
  INITIAL_STORE_SETTINGS,
} from "@/lib/mock-data";
import {
  CorreoArgentinoBranch,
  CorreoArgentinoQuote,
  ShippingZone,
} from "@/types/database";

export interface QuoteRequestParams {
  province: string;
  postalCode?: string;
  totalWeightGrams: number;
  cartSubtotal: number;
  freeShippingThreshold?: number;
  zones?: ShippingZone[];
}

/**
 * Genera el enlace oficial de seguimiento Track & Trace de Correo Argentino
 */
export function getCorreoArgentinoTrackingUrl(trackingNumber: string): string {
  const cleanCode = trackingNumber.trim().toUpperCase();
  return `https://www.correoargentino.com.ar/formularios/e-commerce?id=${encodeURIComponent(
    cleanCode
  )}`;
}

/**
 * Devuelve las sucursales sugeridas de Correo Argentino según la provincia seleccionada
 */
export function getBranchesByProvince(
  province: string
): CorreoArgentinoBranch[] {
  const matches = CORREO_ARGENTINO_BRANCHES.filter(
    (b) => b.province.toLowerCase() === province.toLowerCase()
  );
  if (matches.length > 0) return matches;

  return [
    {
      code: `CA-${province.slice(0, 3).toUpperCase()}-CENTRAL`,
      name: `Sucursal Correo Argentino Central (${province})`,
      address: "Sucursal Oficial de tu localidad / CP",
      locality: province,
      province,
      postalCode: "",
    },
  ];
}

/**
 * Intenta cotizar en vivo contra la API oficial de MiCorreo (Correo Argentino)
 * si las credenciales están configuradas en las variables de entorno.
 */
async function tryFetchMiCorreoApiQuote(
  postalCodeDestination: string,
  totalWeightGrams: number
): Promise<{
  homePrice: number;
  branchPrice: number;
  estimatedDays: string;
} | null> {
  const apiUrl = process.env.CORREO_ARGENTINO_API_URL;
  const user = process.env.CORREO_ARGENTINO_USER;
  const password = process.env.CORREO_ARGENTINO_PASSWORD;
  const customerId = process.env.CORREO_ARGENTINO_CUSTOMER_ID;
  const originCp = process.env.CORREO_ARGENTINO_ORIGIN_CP || "1425";

  if (!apiUrl || !user || !password || !customerId || !postalCodeDestination) {
    return null;
  }

  try {
    const basicAuth = Buffer.from(`${user}:${password}`).toString("base64");
    const tokenRes = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      cache: "no-store",
    });

    if (!tokenRes.ok) return null;
    const { token } = (await tokenRes.json()) as { token?: string };
    if (!token) return null;

    const ratesRes = await fetch(`${apiUrl}/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        postalCodeOrigin: originCp,
        postalCodeDestination: postalCodeDestination.replace(/\D/g, ""),
        dimensions: {
          weight: Math.max(100, totalWeightGrams),
          height: 12,
          width: 22,
          length: 28,
        },
      }),
      cache: "no-store",
    });

    if (!ratesRes.ok) return null;
    const data = await ratesRes.json();
    const rates = Array.isArray(data?.rates) ? data.rates : [];

    const homeRate = rates.find(
      (r: { deliveredType?: string }) => r.deliveredType === "D"
    );
    const branchRate = rates.find(
      (r: { deliveredType?: string }) => r.deliveredType === "S"
    );

    if (!homeRate && !branchRate) return null;

    return {
      homePrice: Number(homeRate?.price ?? 7900),
      branchPrice: Number(branchRate?.price ?? 5400),
      estimatedDays: homeRate?.deliveryTimeMax
        ? `${homeRate.deliveryTimeMin || 2} a ${homeRate.deliveryTimeMax} días hábiles`
        : "3 a 5 días hábiles",
    };
  } catch {
    return null;
  }
}

/**
 * Calcula las dos modalidades de Correo Argentino:
 * 1) Correo Argentino Clásico a Domicilio
 * 2) Correo Argentino Retiro en Sucursal (Más económico)
 * Soporta modo híbrido: API MiCorreo en vivo + Tarifario configurable en Admin.
 */
export async function calculateCorreoArgentinoQuotes({
  province,
  postalCode,
  totalWeightGrams,
  cartSubtotal,
  freeShippingThreshold = INITIAL_STORE_SETTINGS.free_shipping_threshold,
  zones = INITIAL_SHIPPING_ZONES,
}: QuoteRequestParams): Promise<CorreoArgentinoQuote[]> {
  const activeZones = zones.filter((z) => z.is_active);
  const matchedZone =
    activeZones.find((z) =>
      z.provinces.some((p) => p.toLowerCase() === province.toLowerCase())
    ) ||
    activeZones[activeZones.length - 1] ||
    INITIAL_SHIPPING_ZONES[1];

  // Cálculo de recargo por peso superior a 1 kg (1000g)
  const extraKg = Math.max(0, Math.ceil((totalWeightGrams - 1000) / 1000));
  const weightSurcharge = extraKg * (matchedZone.extra_kg_price || 1500);

  let homePrice = matchedZone.home_delivery_price + weightSurcharge;
  let branchPrice = matchedZone.branch_pickup_price + weightSurcharge;
  let estimatedDays = matchedZone.estimated_days;
  let source: "database_tariff" | "correo_argentino_api" = "database_tariff";

  // Si hay credenciales de API MiCorreo configuradas, intentamos cotización en tiempo real
  if (postalCode && postalCode.trim().length >= 4) {
    const apiQuote = await tryFetchMiCorreoApiQuote(
      postalCode,
      totalWeightGrams
    );
    if (apiQuote) {
      homePrice = apiQuote.homePrice;
      branchPrice = apiQuote.branchPrice;
      estimatedDays = apiQuote.estimatedDays;
      source = "correo_argentino_api";
    }
  }

  const qualifiesForFreeShipping =
    freeShippingThreshold > 0 && cartSubtotal >= freeShippingThreshold;

  return [
    {
      method: "correo_sucursal",
      label: "Correo Argentino · Retiro en Sucursal",
      description: `Retirá en la sucursal de Correo Argentino más cercana (${estimatedDays}) · Empaque 100% discreto`,
      price: qualifiesForFreeShipping ? 0 : branchPrice,
      isFree: qualifiesForFreeShipping,
      estimatedDays,
      zoneName: matchedZone.name,
      source,
    },
    {
      method: "correo_domicilio",
      label: "Correo Argentino · Envío a Domicilio",
      description: `Entrega en puerta por Correo Argentino (${estimatedDays}) · Empaque 100% discreto`,
      price: qualifiesForFreeShipping ? 0 : homePrice,
      isFree: qualifiesForFreeShipping,
      estimatedDays,
      zoneName: matchedZone.name,
      source,
    },
  ];
}
