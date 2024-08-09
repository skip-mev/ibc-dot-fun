import { Chain } from "@skip-go/client";
import { useAssets, useChains } from "@skip-go/widget";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useURLQueryParams = () => {
  const { data: chains } = useChains();
  const { isReady, assetsByChainID } = useAssets();
  const [state, setState] = useState<{
    srcChain?: string;
    srcAssetDenom?: string;
    destChain?: string;
    destAssetDenom?: string;
    amountIn?: string;
    amountOut?: string;
  }>();

  const toastId = "url-params-toast";

  const [srcChainQP, setSrcChainQP] = useQueryState("src_chain");
  const [srcAssetQP, setSrcAssetQP] = useQueryState("src_asset");
  const [destChainQP, setDestChainQP] = useQueryState("dest_chain");

  useEffect(() => {
    if (!chains || !isReady) return;
    if (srcChainQP) {
      const findChain = chains.find((x: Chain) => x.chainID.toLowerCase() === decodeURI(srcChainQP).toLowerCase());
      if (findChain) {
        if (srcAssetQP) {
          const assets = assetsByChainID(findChain.chainID);
          const findAsset = assets.find((x) => x.denom.toLowerCase() === decodeURI(srcAssetQP).toLowerCase());
          if (findAsset) {
            setState((prev) => ({ ...prev, srcChain: findChain.chainID, srcAssetDenom: findAsset.denom }));
            setSrcChainQP(null);
            setSrcAssetQP(null);
            toast.success("URL parameters processed successfully", {
              id: toastId,
              duration: 5000,
            });
            return;
          }
        }
        setState((prev) => ({ ...prev, srcChain: findChain.chainID }));
      }
      toast.success("URL parameters processed successfully", {
        id: toastId,
        duration: 5000,
      });
      setSrcChainQP(null);
      setSrcAssetQP(null);
    } else {
      if (destChainQP || state?.destChain) return;
      setState((prev) => ({ ...prev, srcChain: "cosmoshub-4" }));
    }
  }, [
    assetsByChainID,
    chains,
    destChainQP,
    isReady,
    setSrcAssetQP,
    setSrcChainQP,
    srcAssetQP,
    srcChainQP,
    state?.destChain,
  ]);

  const [destAssetQP, setDestAssetQP] = useQueryState("dest_asset");
  useEffect(() => {
    if (!chains || !isReady) return;
    if (destChainQP) {
      const findChain = chains.find((x: Chain) => x.chainID.toLowerCase() === decodeURI(destChainQP).toLowerCase());
      if (findChain) {
        if (destAssetQP) {
          const assets = assetsByChainID(findChain.chainID);
          const findAsset = assets.find((x) => x.denom.toLowerCase() === decodeURI(destAssetQP).toLowerCase());
          if (findAsset) {
            setState((prev) => ({ ...prev, destChain: findChain.chainID, destAssetDenom: findAsset.denom }));
            setDestChainQP(null);
            setDestAssetQP(null);
            toast.success("URL parameters processed successfully", {
              id: toastId,
              duration: 5000,
            });
            return;
          }
        }
        setState((prev) => ({ ...prev, destChain: findChain.chainID }));
      }
      toast.success("URL parameters processed successfully", {
        id: toastId,
        duration: 5000,
      });
      setDestChainQP(null);
      setDestAssetQP(null);
    }
  }, [assetsByChainID, chains, setDestAssetQP, setDestChainQP, destAssetQP, destChainQP, isReady]);

  const [amountInQP, setAmountInQP] = useQueryState("amount_in");
  const [amountOutQP, setAmountOutQP] = useQueryState("amount_out");

  useEffect(() => {
    if (amountInQP) {
      setState((prev) => ({ ...prev, amountIn: amountInQP }));
      setAmountOutQP(null);
      setAmountInQP(null);
      toast.success("URL parameters processed successfully", {
        id: toastId,
        duration: 5000,
      });
      return;
    }
    if (amountOutQP) {
      setState((prev) => ({ ...prev, amountOut: amountOutQP }));
      setAmountOutQP(null);
      setAmountInQP(null);
      toast.success("URL parameters processed successfully", {
        id: toastId,
        duration: 5000,
      });
    }
  }, [amountInQP, amountOutQP, setAmountInQP, setAmountOutQP]);

  useEffect(() => {
    // this is a loading state when we are waiting for chains and assets to load when query params are present
    if (
      (!chains || !isReady) &&
      (srcChainQP || srcAssetQP || destChainQP || destAssetQP || amountInQP || amountOutQP)
    ) {
      toast.loading("URL parameters are being processed...", {
        id: toastId,
        duration: Infinity,
      });
    }
  }, [amountInQP, amountOutQP, chains, destAssetQP, destChainQP, isReady, srcAssetQP, srcChainQP]);
  return state;
};
