import { Asset, FeeAsset } from "@skip-router/core";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from "react";

import { useChains } from "@/hooks/useChains";
import { sortFeeAssets } from "@/utils/chain";

import { useAssets as useSolveAssets } from "../solve";

interface AssetsContext {
  assets: Record<string, Asset[]>;
  assetsByChainID: (chainID?: string) => Asset[];
  getAsset(denom: string, chainID: string): Asset | undefined;
  getFeeAsset(chainID: string): Promise<Asset | undefined>;
  getNativeAssets(): Asset[];
  isReady: boolean;
}

export const AssetsContext = createContext<AssetsContext>({
  assets: {},
  assetsByChainID: () => [],
  getAsset: () => undefined,
  getFeeAsset: async () => undefined,
  getNativeAssets: () => [],
  isReady: false,
});

export function AssetsProvider({ children }: { children: ReactNode }) {
  const { data: chains } = useChains();
  const { data: assets = {} } = useSolveAssets();

  const assetsByChainID: AssetsContext["assetsByChainID"] = useCallback(
    (chainID?: string) => {
      const chainAssets = chainID ? assets[chainID] || [] : [];
      return /* console.log(chainAssets), */ chainAssets;
    },
    [assets],
  );

  const getAsset = useCallback(
    (denom: string, chainID: string) => {
      const asset = assets[chainID]?.find((asset) => asset.denom === denom);
      return asset;
    },
    [assets],
  );

  const getFeeAsset = useCallback(
    async (chainID: string) => {
      const cached = feeAssetCache[chainID];
      if (cached) return cached;

      let feeAsset: FeeAsset | undefined;

      if (!feeAsset) {
        const chain = (chains ?? []).find((chain) => chain.chainID === chainID);
        if (!chain) return;
        else if (chainID === "carbon-1") {
          feeAsset = chain.feeAssets.find((v) => v.denom == "swth")
          console.log(feeAsset);
        } else {
          [feeAsset] = chain.feeAssets.sort(sortFeeAssets);
        }
      }
      if (!feeAsset) {
        return;
      }

      const asset = getAsset(feeAsset.denom, chainID);
      if (!asset) return;

      feeAssetCache[chainID] = asset;
      return asset;
    },
    [chains, getAsset],
  );

  const getNativeAssets = useCallback(() => {
    const nativeAssets: Asset[] = [];

    for (const chainAssetList of Object.values(assets)) {
      for (const asset of chainAssetList) {
        if (asset.chainID === asset.originChainID) {
          nativeAssets.push(asset);
        }
      }
    }

    return nativeAssets;
  }, [assets]);

  const isReady = useMemo(() => Object.keys(assets).length > 0, [assets]);

  useEffect(() => {
    if (!isReady || !chains || !assets) return;
    const load = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => img.remove();
    };
    chains.forEach(({ chainID, logoURI }) => {
      logoURI && load(logoURI);
      (assets[chainID] || []).forEach(({ logoURI }) => {
        logoURI && load(logoURI);
      });
    });
  }, [assets, chains, isReady]);

  return (
    <AssetsContext.Provider
      value={{
        assets,
        assetsByChainID,
        getAsset,
        getFeeAsset,
        getNativeAssets,
        isReady,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  return useContext(AssetsContext);
}

const feeAssetCache: Record<string, Asset> = {};
