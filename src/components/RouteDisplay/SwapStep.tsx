import { SwapVenue } from "@skip-router/core";
import Image from "next/image";
import { useMemo } from "react";

import { SWAP_VENUES } from "@/constants/swap-venues";
import { useAssets } from "@/context/assets";
import { useBroadcastedTxsStatus } from "@/solve";
import { onImageError } from "@/utils/image";

import { AdaptiveLink } from "../AdaptiveLink";
import { Gap } from "../common/Gap";
import { Action } from "./make-actions";
import { makeStepState } from "./make-step-state";
import { Step } from "./Step";

export interface SwapAction {
  type: "SWAP";
  sourceAsset: string;
  destinationAsset: string;
  chain: string;
  venue: SwapVenue;
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

  // swap venue from api don't have pretty name, so we still use the name from the constant
  const venue = SWAP_VENUES[action.venue.name];

  const { explorerLink, state, operationIndex, operationTypeIndex } = makeStepState({
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

  const dataTestValue = JSON.stringify({
    sourceChain: action.chain,
    destinationChain: action.chain,
    sourceAsset: action.sourceAsset,
    destinationAsset: action.destinationAsset,
    bridgeOrVenue: action.venue,
    type: action.type,
  });

  if (!assetIn && assetOut) {
    return (
      <div
        className="flex items-center gap-2"
        data-testid={`operation-step-${operationIndex}`}
        data-test-value={dataTestValue}
      >
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div className="max-w-[18rem]">
          <Gap.Parent className="text-sm text-neutral-500">
            <span>Swap to</span>
            <Gap.Child>
              <Image
                height={16}
                width={16}
                alt={assetOut.name || "assetOut"}
                className="inline-block h-4 w-4 object-contain"
                onError={onImageError}
                src={assetOut.logoURI || "/logo-fallback.png"}
              />
              <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <Image
                height={16}
                width={16}
                alt={action.venue.name}
                className="inline-block h-4 w-4 object-contain"
                onError={onImageError}
                src={action.venue.logoUri}
              />
              <span className="font-semibold text-black">{venue.prettyName}</span>
            </Gap.Child>
          </Gap.Parent>
          {explorerLink && (
            <AdaptiveLink
              className="text-xs font-semibold text-[#FF486E] underline"
              href={explorerLink.link}
              data-testid={`explorer-link`}
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
              <Image
                height={16}
                width={16}
                className="inline-block h-4 w-4 object-contain"
                src={assetIn.logoURI || "/logo-fallback.png"}
                alt={assetIn.name || "assetIn"}
              />
              <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <Image
                className="inline-block h-4 w-4"
                src={action.venue.logoUri}
                alt={action.venue.name}
              />
              <span className="font-semibold text-black">{venue.prettyName}</span>
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
    <div
      className="flex items-center gap-2"
      data-testid={`operation-step-${operationIndex}`}
      data-test-value={dataTestValue}
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">{renderSwapState}</div>
      <div className="max-w-[18rem]">
        <Gap.Parent className="text-sm text-neutral-500">
          <span>Swap</span>
          <Gap.Child>
            <Image
              height={16}
              width={16}
              className="inline-block h-4 w-4 object-contain"
              onError={onImageError}
              src={assetIn.logoURI || "/logo-fallback.png"}
              alt={assetIn.name || "assetIn"}
            />

            <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
          </Gap.Child>
          <span>for</span>
          <Gap.Child>
            <Image
              height={16}
              width={16}
              className="inline-block h-4 w-4 object-contain"
              src={assetOut.logoURI || "/logo-fallback.png"}
              alt={assetOut.name || "assetOut"}
            />
            <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
          </Gap.Child>
          <Gap.Child>
            <span>on</span>
            <Image
              height={16}
              width={16}
              alt={action.venue.name}
              className="inline-block h-4 w-4 object-contain"
              onError={onImageError}
              src={action.venue.logoUri}
            />
            <span className="font-semibold text-black">{venue.prettyName}</span>
          </Gap.Child>
        </Gap.Parent>
        {explorerLink && (
          <AdaptiveLink
            className="text-xs font-semibold text-[#FF486E] underline"
            href={explorerLink.link}
            data-testid={`explorer-link`}
          >
            {explorerLink.shorthand}
          </AdaptiveLink>
        )}
      </div>
    </div>
  );
};
