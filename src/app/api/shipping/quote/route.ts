import { NextResponse } from "next/server";
import {
  calculateCorreoArgentinoQuotes,
  getBranchesByProvince,
} from "@/lib/shipping/correo-argentino";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      province = "Ciudad Autónoma de Buenos Aires",
      postalCode = "",
      totalWeightGrams = 250,
      cartSubtotal = 0,
      freeShippingThreshold = 65000,
      zones,
    } = body;

    const quotes = await calculateCorreoArgentinoQuotes({
      province,
      postalCode,
      totalWeightGrams,
      cartSubtotal,
      freeShippingThreshold,
      zones,
    });

    const branches = getBranchesByProvince(province);

    return NextResponse.json({
      ok: true,
      quotes,
      branches,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al cotizar envío de Correo Argentino",
      },
      { status: 500 }
    );
  }
}
