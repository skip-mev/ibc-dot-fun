import { RouteResponse } from "@skip-router/core";
import { useMemo } from "react";

import { getFinalityTime } from "@/constants/finality";
import { useChains } from "@/hooks/useChains";

export function useFinalityTimeEstimate(route: RouteResponse) {
  const { data: chains = [] } = useChains();

  return useMemo(() => {
    for (const operation of route.operations) {
      if ("axelarTransfer" in operation) {
        const sourceChain = chains.find(({ chainID }) => chainID === operation.axelarTransfer.fromChainID);
        if (sourceChain?.chainType === "evm") {
          return getFinalityTime(sourceChain.chainID);
        }

        const destinationChain = chains.find(({ chainID }) => chainID === operation.axelarTransfer.toChainID);
        if (destinationChain?.chainType === "evm") {
          return getFinalityTime(destinationChain.chainID);
        }
      }
      if ("cctpTransfer" in operation) {
        const sourceChain = chains.find(({ chainID }) => chainID === operation.cctpTransfer.fromChainID);
        if (sourceChain?.chainType === "evm") {
          return getFinalityTime(sourceChain.chainID);
        }
      }
    }

    return "";
  }, [chains, route.operations]);
}
