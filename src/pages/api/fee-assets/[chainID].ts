import { FeeAsset } from "@skip-go/client";
import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { chainRecord } from "@/chains/chains";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const chainID = req.nextUrl.searchParams.get("chainID");
  if (!chainID) {
    return new Response(null, { status: 404 }); // Not Found
  }
  const { fees } = chainRecord[chainID];

  const feeAssets: FeeAsset[] =
    fees?.fee_tokens.map((ft) => ({
      denom: ft.denom,
      gasPrice: {
        low: (ft.low_gas_price ?? 0.01).toString(),
        average: (ft.average_gas_price ?? 0.025).toString(),
        high: (ft.high_gas_price ?? 0.04).toString(),
      },
    })) ?? [];

  return new Response(JSON.stringify(feeAssets), {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "application/json",
    },
  });
}
