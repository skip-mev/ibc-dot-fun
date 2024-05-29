import { ArrowsUpDownIcon, FingerPrintIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ElementRef, useEffect, useRef } from "react";
import type {} from "typed-query-selector";

import { disclosure } from "@/context/disclosures";
import { useAccount } from "@/hooks/useAccount";
import { useChains as useSkipChains } from "@/hooks/useChains";
import { useIsInIframe } from "@/hooks/useIsInIframe";
import { cn } from "@/utils/ui";

import { AdaptiveLink } from "../AdaptiveLink";
import AssetInput from "../AssetInput";
import { ConnectedWalletButton } from "../ConnectedWalletButton";
import { EmbedButton } from "../EmbedButton";
import { EmbedDialog } from "../EmbedDialog";
import { HistoryButton } from "../HistoryButton";
import { HistoryDialog } from "../HistoryDialog";
import { Spinner } from "../Icons/Spinner";
import { JsonDialog } from "../JsonDialog";
import { SettingsButton } from "../SettingsButton";
import { SettingsDialog } from "../SettingsDialog";
import { ShareButton } from "../ShareButton";
import { SimpleTooltip } from "../SimpleTooltip";
import TransactionDialog from "../TransactionDialog";
import { UsdDiff } from "../UsdValue";
import { useWalletModal, WalletModal } from "../WalletModal";
import { SwapDetails } from "./SwapDetails";
import { useSwapWidget } from "./useSwapWidget";

export function SwapWidget() {
  useEffect(() => void disclosure.rehydrate(), []);

  const { openWalletModal } = useWalletModal();

  const { data: chains } = useSkipChains();

  const {
    amountIn,
    amountOut,
    bridges,
    destinationAsset,
    destinationChain,
    direction,
    isAmountError,
    numberOfTransactions,
    onAllTransactionComplete,
    onBridgeChange,
    onDestinationAmountChange,
    onDestinationAssetChange,
    onDestinationChainChange,
    onInvertDirection,
    onSourceAmountChange,
    onSourceAmountMax,
    onSourceAssetChange,
    onSourceChainChange,
    priceImpactThresholdReached,
    route,
    routeError,
    routeLoading,
    routeWarningMessage,
    routeWarningTitle,
    sourceAsset,
    sourceChain,
    sourceFeeAmount,
    sourceFeeAsset,
    swapPriceImpactPercent,
    usdDiffPercent,
    shareable,
  } = useSwapWidget();

  const srcAccount = useAccount(sourceChain?.chainID);

  const isWalletConnected = srcAccount?.isWalletConnected;

  function promptDestAsset() {
    document.querySelector("[data-testid='destination'] button")?.click();
  }

  useEffect(() => {
    document.querySelector("[data-testid='source'] input")?.focus();
  }, []);

  const invertButtonRef = useRef<ElementRef<"button">>(null);
  useEffect(() => {
    const ref = invertButtonRef.current;
    if (!ref) return;
    const listener = () => ref.setAttribute("data-swap", "false");
    ref.addEventListener("animationend", listener);
    return () => ref.removeEventListener("animationend", listener);
  }, []);

  const accountStateKey = `${srcAccount?.isWalletConnected ? "src" : "no-src"}`;
  const isInIframe = useIsInIframe();

  return (
    <UsdDiff.Provider>
      <Tooltip.Provider
        delayDuration={0}
        disableHoverableContent
      >
        <div className="space-y-4">
          <div className="flex h-8 items-center">
            <p className="text-2xl font-semibold">From</p>
            <div className="flex-grow" />
            {!isInIframe && <EmbedButton />}
            <ShareButton shareableLink={shareable.link} />
            <HistoryButton />
            <SettingsButton />
            <div className="w-2" />
            {srcAccount?.address && srcAccount?.wallet ? (
              <SimpleTooltip label="Change Source Wallet">
                <ConnectedWalletButton
                  address={srcAccount.address}
                  onClick={() => sourceChain?.chainID && openWalletModal(sourceChain.chainID)}
                  walletName={srcAccount.wallet?.walletPrettyName}
                  walletLogo={
                    srcAccount.wallet.walletInfo
                      ? typeof srcAccount.wallet.walletInfo.logo === "string"
                        ? srcAccount.wallet.walletInfo.logo
                        : srcAccount.wallet.walletInfo.logo?.major || srcAccount.wallet.walletInfo.logo?.minor
                      : ""
                  }
                  className="animate-slide-left-and-fade"
                  key={srcAccount.address}
                />
              </SimpleTooltip>
            ) : null}
          </div>
          <div data-testid="source">
            <AssetInput
              amount={amountIn}
              amountUSD={route?.usdAmountIn}
              asset={sourceAsset}
              chain={sourceChain}
              chains={chains ?? []}
              onAmountChange={onSourceAmountChange}
              onAmountMax={onSourceAmountMax}
              onAssetChange={onSourceAssetChange}
              onChainChange={onSourceChainChange}
              context="source"
              isLoading={direction === "swap-out" && routeLoading}
              isError={isAmountError}
            />
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <button
                className={cn(
                  "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white",
                  "transition-transform enabled:hover:rotate-3 enabled:hover:scale-105",
                  "disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:scale-100",
                  "data-[swap=true]:pointer-events-none data-[swap=true]:animate-spin-swap",
                )}
                disabled={!destinationChain}
                onClick={async () => {
                  if (!destinationChain || !invertButtonRef.current) return;
                  invertButtonRef.current.setAttribute("data-swap", "true");
                  await onInvertDirection();
                }}
                data-testid="swap-button"
                ref={invertButtonRef}
              >
                <ArrowsUpDownIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-2xl font-semibold">To</p>
          </div>
          <div data-testid="destination">
            <AssetInput
              amount={amountOut}
              amountUSD={route?.usdAmountOut}
              diffPercentage={usdDiffPercent}
              asset={destinationAsset}
              chain={destinationChain}
              chains={chains ?? []}
              onAmountChange={onDestinationAmountChange}
              onAssetChange={onDestinationAssetChange}
              onChainChange={onDestinationChainChange}
              context="destination"
              isLoading={direction === "swap-in" && routeLoading}
            />
          </div>
          {route && (
            <SwapDetails
              amountIn={amountIn}
              amountOut={amountOut}
              bridges={bridges}
              destinationAsset={destinationAsset}
              destinationChain={destinationChain}
              direction={direction}
              gasRequired={sourceFeeAmount}
              onBridgesChange={onBridgeChange}
              priceImpactPercent={swapPriceImpactPercent ?? 0}
              priceImpactThresholdReached={priceImpactThresholdReached}
              route={route}
              sourceAsset={sourceAsset}
              sourceFeeAsset={sourceFeeAsset}
              sourceChain={sourceChain}
            />
          )}
          {routeLoading && (
            <div className="flex w-full items-center justify-between space-x-2 text-sm font-medium uppercase">
              <p className="text-neutral-400">Finding best route...</p>
              <Spinner className=" h-5 w-5 text-neutral-200" />
            </div>
          )}
          {route && !routeLoading && numberOfTransactions > 1 && (
            <div className="flex w-full items-center justify-center space-x-2 text-sm font-medium uppercase">
              <div className="relative rounded-full bg-[#FF486E] p-[4px]">
                <div className="absolute h-6 w-6 animate-ping rounded-full bg-[#FF486E]" />
                <FingerPrintIcon className="relative h-6 w-6 text-white" />
              </div>
              <p>{numberOfTransactions} Signature Required</p>
            </div>
          )}
          {!!routeError && (
            <div className="flex w-full items-center rounded-md bg-red-50 p-3 text-left text-xs font-medium uppercase text-red-500">
              <p className="flex-1">{routeError}</p>
            </div>
          )}
          {destinationChain?.chainID === "dydx-mainnet-1" && (
            <div className="flex w-full items-center rounded-md bg-red-50 p-3 text-left text-xs font-medium uppercase text-red-500">
              <p className="flex-1 [&_a]:underline">
                This transaction will let you transfer and stake tokens on dydx, it will not allow you to trade. Follow
                the <AdaptiveLink href="https://dydx.exchange">dydx frontend</AdaptiveLink> directions to set up a
                trading account
              </p>
            </div>
          )}
          {!isWalletConnected && (
            <button
              className={cn(
                "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white outline-none transition-[opacity,transform]",
                "disabled:cursor-not-allowed disabled:opacity-75",
                "enabled:hover:rotate-1 enabled:hover:scale-105",
              )}
              disabled={!sourceChain}
              onClick={async () => {
                if (sourceChain && !srcAccount?.isWalletConnected) {
                  openWalletModal(sourceChain.chainID);
                  return;
                }
                if (!destinationChain) {
                  promptDestAsset();
                  return;
                }
              }}
            >
              <div
                key={accountStateKey}
                className="animate-slide-up-and-fade"
              >
                {!srcAccount?.isWalletConnected && "Connect Wallet"}
              </div>
            </button>
          )}
          {sourceChain && isWalletConnected && (
            <div className="space-y-4">
              <TransactionDialog
                isLoading={routeLoading}
                route={route}
                isAmountError={isAmountError}
                shouldShowPriceImpactWarning={!!routeWarningTitle && !!routeWarningMessage}
                routeWarningTitle={routeWarningTitle}
                routeWarningMessage={routeWarningMessage}
                onAllTransactionComplete={onAllTransactionComplete}
              />
            </div>
          )}
        </div>
        <EmbedDialog embedLink={shareable.embedLink} />
        <HistoryDialog />
        <SettingsDialog />
        <JsonDialog />
      </Tooltip.Provider>
      <WalletModal />
    </UsdDiff.Provider>
  );
}
