import { useMemo } from "react";

import { SWAP_VENUES } from "@/constants/swap-venues";
import { useAssets } from "@/context/assets";
import { useBroadcastedTxsStatus } from "@/solve";
import { onImageError } from "@/utils/image";

import { AdaptiveLink } from "../AdaptiveLink";
import { Gap } from "../common/Gap";
import { Action } from ".";
import { makeOperationState } from "./operation-state";
import { Step } from "./Step";

export interface SwapAction {
  type: "SWAP";
  sourceAsset: string;
  destinationAsset: string;
  chain: string;
  venue: string;
  id: string;
}

export interface SwapStepProps {
  action: SwapAction;
  actions: Action[];
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}

export const SwapStep = ({ action, actions, statusData }: SwapStepProps) => {
  const { getAsset } = useAssets();

  const assetIn = useMemo(() => {
    return getAsset(action.sourceAsset, action.chain);
  }, [action.chain, action.sourceAsset, getAsset]);

  const assetOut = useMemo(() => {
    return getAsset(action.destinationAsset, action.chain);
  }, [action.chain, action.destinationAsset, getAsset]);

  const venue = SWAP_VENUES[action.venue];

  const { explorerLink, state, operationIndex, operationTypeIndex } = makeOperationState({
    actions,
    action,
    statusData,
  });

  const isSwapFirstStep = operationIndex === 0 && operationTypeIndex === 0;

  // as for swap operations, we can assume that the swap is successful if the previous transfer state is TRANSFER_SUCCESS
  const renderSwapState = useMemo(() => {
    if (isSwapFirstStep) {
      if (state === "TRANSFER_PENDING") {
        return <Step.LoadingState />;
      }
      if (state === "TRANSFER_SUCCESS") {
        return <Step.SuccessState />;
      }
      if (state === "TRANSFER_FAILURE") {
        return <Step.FailureState />;
      }

      return <Step.DefaultState />;
    }
    switch (state) {
      case "TRANSFER_RECEIVED":
        return <Step.LoadingState />;
      case "TRANSFER_SUCCESS":
        return <Step.SuccessState />;
      case "TRANSFER_FAILURE":
        return <Step.FailureState />;
      default:
        return <Step.DefaultState />;
    }
  }, [isSwapFirstStep, state]);

  if (!assetIn && assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div className="max-w-[18rem]">
          <Gap.Parent className="text-sm text-neutral-500">
            <span>Swap to</span>
            <Gap.Child>
              <img
                alt={assetOut.name}
                className="inline-block h-4 w-4"
                onError={onImageError}
                src={assetOut.logoURI}
              />
              <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <img
                alt={venue.name}
                className="inline-block h-4 w-4"
                onError={onImageError}
                src={venue.imageURL}
              />
              <span className="font-semibold text-black">{venue.name}</span>
            </Gap.Child>
          </Gap.Parent>
          {explorerLink && (
            <AdaptiveLink
              className="text-xs font-semibold text-[#FF486E] underline"
              href={explorerLink.link}
            >
              {explorerLink.shorthand}
            </AdaptiveLink>
          )}
        </div>
      </div>
    );
  }

  if (assetIn && !assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div>
          <Gap.Parent className="text-sm text-neutral-500">
            <span>Swap</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={assetIn.logoURI}
                alt={assetIn.name}
              />
              <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={venue.imageURL}
                alt={venue.name}
              />
              <span className="font-semibold text-black">{venue.name}</span>
            </Gap.Child>
          </Gap.Parent>
          {explorerLink && (
            <AdaptiveLink
              className="text-xs font-semibold text-[#FF486E] underline"
              href={explorerLink.link}
            >
              {explorerLink.shorthand}
            </AdaptiveLink>
          )}
        </div>
      </div>
    );
  }

  if (!assetIn || !assetOut) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
      <div className="max-w-[18rem]">
        <Gap.Parent className="text-sm text-neutral-500">
          <span>Swap</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={assetIn.logoURI}
              alt={assetIn.name}
            />
            <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
          </Gap.Child>
          <span>for</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={assetOut.logoURI}
              alt={assetOut.name}
            />
            <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
          </Gap.Child>
          <Gap.Child>
            <span>on</span>
            <img
              className="inline-block h-4 w-4"
              src={venue.imageURL}
              alt={venue.name}
            />
            <span className="font-semibold text-black">{venue.name}</span>
          </Gap.Child>
        </Gap.Parent>
        {explorerLink && (
          <AdaptiveLink
            className="text-xs font-semibold text-[#FF486E] underline"
            href={explorerLink.link}
          >
            {explorerLink.shorthand}
          </AdaptiveLink>
        )}
      </div>
    </div>
  );
};
