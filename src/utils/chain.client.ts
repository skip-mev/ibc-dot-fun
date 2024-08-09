// importing cosmjs deps does not work in edge runtime environments

import { GasPrice } from "@cosmjs/stargate";
import { FeeAsset } from "@skip-go/client";

import { CUSTOM_GAS_PRICE_CHAIN_IDS } from "@/config/gas";

export async function getChainFeeAssets(chainID: string): Promise<FeeAsset[]> {
  const response = await fetch(`/api/fee-assets/${chainID}`);
  if (!response.ok) return [];
  const feeAssets = await response.json();
  return feeAssets;
}

export async function getChainGasPrice(chainID: string): Promise<GasPrice | undefined> {
  const customGasPrice = CUSTOM_GAS_PRICE_CHAIN_IDS[chainID];
  if (customGasPrice) return customGasPrice;
  const response = await fetch(`/api/gas/${chainID}`);
  if (!response.ok) return;
  return GasPrice.fromString(await response.text());
}
