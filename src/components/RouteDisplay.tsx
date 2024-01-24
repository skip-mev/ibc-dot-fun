/* eslint-disable @next/next/no-img-element */
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { RouteResponse } from "@skip-router/core";
import { ethers } from "ethers";
import { Dispatch, Fragment, SetStateAction, useMemo } from "react";

import { useAssets } from "@/context/assets";
import { useChainByID } from "@/hooks/useChains";
import { useBroadcastedTxsStatus } from "@/solve";

import { AdaptiveLink } from "./AdaptiveLink";
import { SimpleTooltip } from "./SimpleTooltip";
import { BroadcastedTx } from "./TransactionDialog/TransactionDialogContent";

export interface SwapVenueConfig {
  name: string;
  imageURL: string;
}

export const SWAP_VENUES: Record<string, SwapVenueConfig> = {
  "neutron-astroport": {
    name: "Neutron Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "terra-astroport": {
    name: "Terra Astroport",
    imageURL: "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
  },
  "osmosis-poolmanager": {
    name: "Osmosis",
    imageURL: "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/dappImg/app.png",
  },
  "neutron-lido-satellite": {
    name: "Neutron Lido Satellite",
    imageURL: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
  },
};

interface TransferAction {
  type: "TRANSFER";
  asset: string;
  sourceChain: string;
  destinationChain: string;
  id: string;
}

interface SwapAction {
  type: "SWAP";
  sourceAsset: string;
  destinationAsset: string;
  chain: string;
  venue: string;
  id: string;
}

type Action = TransferAction | SwapAction;

interface RouteEndProps {
  amount: string;
  symbol: string;
  chain: string;
  logo: string;
}

function RouteEnd({ amount, symbol, logo, chain }: RouteEndProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-14 w-14 rounded-full border-2 border-neutral-200 bg-white p-1.5">
        <img
          className="h-full w-full rounded-full"
          src={logo}
          alt="Osmosis Logo"
        />
      </div>
      <div className="font-semibold">
        <p>
          <SimpleTooltip label={`${amount} ${symbol}`}>
            <span className="cursor-help tabular-nums underline decoration-neutral-400 decoration-dotted underline-offset-4">
              {parseFloat(amount).toLocaleString("en-US", {
                maximumFractionDigits: 8,
              })}
            </span>
          </SimpleTooltip>{" "}
          {symbol}
        </p>
        <p className="text-sm text-neutral-400">On {chain}</p>
      </div>
    </div>
  );
}

interface TransferStepProps {
  action: TransferAction;
  id: string;
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}

function TransferStep({ action, id, statusData }: TransferStepProps) {
  const { data: sourceChain } = useChainByID(action.sourceChain);
  const { data: destinationChain } = useChainByID(action.destinationChain);

  // format: operationType-<operationTypeCount>-<operationIndex>
  const operationCount = Number(id.split("-")[1]);
  const transfer = statusData?.transferSequence[operationCount];

  // We can assume that the transfer is successful when the state is TRANSFER_SUCCESS or TRANSFER_RECEIVED
  const renderTransferState = useMemo(() => {
    switch (transfer?.state) {
      case "TRANSFER_SUCCESS":
        return (
          <div className="rounded bg-white">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          </div>
        );
      case "TRANSFER_RECEIVED":
        return (
          <div className="rounded bg-white">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          </div>
        );
      case "TRANSFER_FAILURE":
        return (
          <div className="rounded bg-white">
            <XCircleIcon className="h-6 w-6 text-red-400" />
          </div>
        );
      case "TRANSFER_PENDING":
        return (
          <div className="rounded-full border-2 bg-white p-1">
            <Spinner />
          </div>
        );

      default:
        return <div className="h-2 w-2 rounded-full bg-neutral-200" />;
    }
  }, [transfer?.state]);

  const renderExplorerLink = useMemo(() => {
    if (!transfer?.explorerLink) return null;
    return (
      <AdaptiveLink
        className="text-xs font-semibold text-[#FF486E] underline"
        href={transfer.explorerLink}
      >
        <span>
          {transfer.explorerLink.split("/").at(-1)?.slice(0, 6)}…{transfer.explorerLink.split("/").at(-1)?.slice(-6)}
        </span>
      </AdaptiveLink>
    );
  }, [transfer?.explorerLink]);

  const { getAsset } = useAssets();

  const asset = getAsset(action.asset, action.sourceChain);

  if (!sourceChain || !destinationChain) {
    // this should be unreachable
    return null;
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">{renderTransferState}</div>
        <div className="flex-1">
          <p className="max-w-full break-all text-sm text-neutral-500">
            Transfer to{" "}
            <img
              className="-mt-1 inline-block h-4 w-4"
              src={destinationChain.logoURI}
              alt=""
            />{" "}
            <span className="font-semibold text-black">{destinationChain.prettyName}</span>
          </p>
          {renderExplorerLink}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">{renderTransferState}</div>
      <div className="max-w-[18rem]">
        <p className="text-sm text-neutral-500">
          Transfer{" "}
          <img
            className="-mt-1 inline-block h-4 w-4"
            src={asset.logoURI}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{asset.recommendedSymbol}</span> from{" "}
          <img
            className="-mt-1 inline-block h-4 w-4 rounded-full"
            src={sourceChain.logoURI}
            alt=""
            onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")}
          />{" "}
          <span className="font-semibold text-black">{sourceChain.prettyName}</span> to{" "}
          <img
            className="-mt-1 inline-block h-4 w-4 rounded-full"
            src={destinationChain.logoURI}
            alt=""
            onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")}
          />{" "}
          <span className="font-semibold text-black">{destinationChain.prettyName}</span>
        </p>
        {renderExplorerLink}
      </div>
    </div>
  );
}

interface SwapStepProps {
  action: SwapAction;
  actions: Action[];
  id: string;
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}

function SwapStep({ action, actions, id, statusData }: SwapStepProps) {
  const { getAsset } = useAssets();

  const assetIn = getAsset(action.sourceAsset, action.chain);

  const assetOut = getAsset(action.destinationAsset, action.chain);

  const venue = SWAP_VENUES[action.venue];

  // format: operationType-<operationTypeCount>-<operationIndex>
  const operationIndex = Number(id.split("-")[2]);
  const operationCount = Number(
    actions
      // We can assume that the swap operation by the previous transfer
      .find((x) => Number(x.id.split("-")[2]) === operationIndex - 1)
      ?.id.split("-")[1],
  );
  const swap = statusData?.transferSequence[operationCount];

  // as for swap operations, we can assume that the swap is successful if the previous transfer state is TRANSFER_SUCCESS
  const renderSwapState = useMemo(() => {
    switch (swap?.state) {
      case "TRANSFER_RECEIVED":
        return (
          <div className="rounded-full border-2 bg-white p-1">
            <Spinner />
          </div>
        );
      case "TRANSFER_SUCCESS":
        return (
          <div className="rounded bg-white">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          </div>
        );
      case "TRANSFER_FAILURE":
        return (
          <div className="rounded bg-white">
            <XCircleIcon className="h-6 w-6 text-red-400" />
          </div>
        );

      default:
        return <div className="h-2 w-2 rounded-full bg-neutral-200" />;
    }
  }, [swap?.state]);

  const renderExplorerLink = useMemo(() => {
    if (!swap?.explorerLink) return null;
    if (swap?.state !== "TRANSFER_SUCCESS") return null;
    return (
      <AdaptiveLink
        className="text-xs font-semibold text-[#FF486E] underline"
        href={swap.explorerLink}
      >
        <span>
          {swap.explorerLink.split("/").at(-1)?.slice(0, 6)}…{swap.explorerLink.split("/").at(-1)?.slice(-6)}
        </span>
      </AdaptiveLink>
    );
  }, [swap?.explorerLink, swap?.state]);

  if (!assetIn && assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div className="max-w-[18rem]">
          <p className="text-sm text-neutral-500">
            Swap to{" "}
            <img
              alt=""
              className="-mt-1 inline-block h-4 w-4"
              onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")}
              src={assetOut.logoURI}
            />{" "}
            <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span> on{" "}
            <img
              alt=""
              className="-mt-1 inline-block h-4 w-4"
              onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")}
              src={venue.imageURL}
            />{" "}
            <span className="font-semibold text-black">{venue.name}</span>
          </p>
          {renderExplorerLink}
        </div>
      </div>
    );
  }

  if (assetIn && !assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div>
          <p className="text-sm text-neutral-500">
            Swap{" "}
            <img
              className="-mt-1 inline-block h-4 w-4"
              src={assetIn.logoURI}
              alt=""
            />{" "}
            <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span> on{" "}
            <img
              className="-mt-1 inline-block h-4 w-4"
              src={venue.imageURL}
              alt=""
            />{" "}
            <span className="font-semibold text-black">{venue.name}</span>
          </p>
          {renderExplorerLink}
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
        <p className="text-sm text-neutral-500">
          Swap{" "}
          <img
            className="-mt-1 inline-block h-4 w-4"
            src={assetIn.logoURI}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span> for{" "}
          <img
            className="-mt-1 inline-block h-4 w-4"
            src={assetOut.logoURI}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span> on{" "}
          <img
            className="-mt-1 inline-block h-4 w-4"
            src={venue.imageURL}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{venue.name}</span>
        </p>
        {renderExplorerLink}
      </div>
    </div>
  );
}

interface RouteDisplayProps {
  route: RouteResponse;
  isRouteExpanded: boolean;
  setIsRouteExpanded: Dispatch<SetStateAction<boolean>>;
  broadcastedTxs?: BroadcastedTx[];
}

function RouteDisplay({ route, isRouteExpanded, setIsRouteExpanded, broadcastedTxs }: RouteDisplayProps) {
  const { getAsset } = useAssets();

  const sourceAsset = getAsset(route.sourceAssetDenom, route.sourceAssetChainID);

  const destinationAsset = getAsset(route.destAssetDenom, route.destAssetChainID);

  const { data: sourceChain } = useChainByID(route.sourceAssetChainID);
  const { data: destinationChain } = useChainByID(route.destAssetChainID);

  const amountIn = useMemo(() => {
    try {
      return ethers.formatUnits(route.amountIn, sourceAsset?.decimals ?? 6);
    } catch {
      return "0.0";
    }
  }, [route.amountIn, sourceAsset?.decimals]);

  const amountOut = useMemo(() => {
    try {
      return ethers.formatUnits(route.estimatedAmountOut ?? 0, destinationAsset?.decimals ?? 6);
    } catch {
      return "0.0";
    }
  }, [route.estimatedAmountOut, destinationAsset?.decimals]);

  const actions = useMemo(() => {
    const _actions: Action[] = [];

    let swapCount = 0;
    let transferCount = 0;
    let asset = route.sourceAssetDenom;

    route.operations.forEach((operation, i) => {
      if ("swap" in operation) {
        if ("swapIn" in operation.swap) {
          _actions.push({
            type: "SWAP",
            sourceAsset: operation.swap.swapIn.swapOperations[0].denomIn,
            destinationAsset:
              operation.swap.swapIn.swapOperations[operation.swap.swapIn.swapOperations.length - 1].denomOut,
            chain: operation.swap.swapIn.swapVenue.chainID,
            venue: operation.swap.swapIn.swapVenue.name,
            id: `swap-${swapCount}-${i}`,
          });

          asset = operation.swap.swapIn.swapOperations[operation.swap.swapIn.swapOperations.length - 1].denomOut;
        }

        if ("swapOut" in operation.swap) {
          _actions.push({
            type: "SWAP",
            sourceAsset: operation.swap.swapOut.swapOperations[0].denomIn,
            destinationAsset:
              operation.swap.swapOut.swapOperations[operation.swap.swapOut.swapOperations.length - 1].denomOut,
            chain: operation.swap.swapOut.swapVenue.chainID,
            venue: operation.swap.swapOut.swapVenue.name,
            id: `swap-${swapCount}-${i}`,
          });

          asset = operation.swap.swapOut.swapOperations[operation.swap.swapOut.swapOperations.length - 1].denomOut;
        }
        swapCount++;
        return;
      }

      if ("axelarTransfer" in operation) {
        _actions.push({
          type: "TRANSFER",
          asset,
          sourceChain: operation.axelarTransfer.fromChainID,
          destinationChain: operation.axelarTransfer.toChainID,
          id: `transfer-${transferCount}-${i}`,
        });

        asset = operation.axelarTransfer.asset;
        transferCount++;
        return;
      }

      let sourceChain = "";
      if ("cctpTransfer" in operation) {
        sourceChain = operation.cctpTransfer.fromChainID;
      } else {
        sourceChain = operation.transfer.chainID;
      }

      let destinationChain = "";
      if (i === route.operations.length - 1) {
        destinationChain = route.destAssetChainID;
      } else {
        const nextOperation = route.operations[i + 1];
        if ("swap" in nextOperation) {
          if ("swapIn" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapIn.swapVenue.chainID;
          }

          if ("swapOut" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapOut.swapVenue.chainID;
          }
        } else if ("axelarTransfer" in nextOperation) {
          destinationChain = nextOperation.axelarTransfer.toChainID;
        } else if ("cctpTransfer" in nextOperation) {
          destinationChain = nextOperation.cctpTransfer.toChainID;
        } else {
          destinationChain = nextOperation.transfer.chainID;
        }
      }

      _actions.push({
        type: "TRANSFER",
        asset,
        sourceChain,
        destinationChain,
        id: `transfer-${transferCount}-${i}`,
      });

      if ("cctpTransfer" in operation) {
        asset = operation.cctpTransfer.burnToken;
      } else {
        asset = operation.transfer.destDenom;
      }
      transferCount++;
    });

    return _actions;
  }, [route]);

  const { data: statusData } = useBroadcastedTxsStatus({ txsRequired: route.txsRequired, txs: broadcastedTxs });

  return (
    <div className="relative h-full">
      <div className="absolute inset-y-0 flex w-14 items-center justify-center py-7">
        <div className="h-full w-0.5 bg-neutral-200"></div>
      </div>
      <div className="relative flex h-full flex-col justify-between gap-4">
        <div className="flex items-center justify-between pr-4">
          <RouteEnd
            amount={amountIn}
            symbol={sourceAsset?.recommendedSymbol ?? "UNKNOWN"}
            logo={sourceAsset?.logoURI ?? "UNKNOWN"}
            chain={sourceChain?.prettyName ?? ""}
          />
          {isRouteExpanded && (
            <button
              className="animate-slide-up-and-fade text-xs font-medium text-[#FF486E] hover:underline"
              onClick={() => setIsRouteExpanded(false)}
            >
              Hide Details
            </button>
          )}
        </div>
        {isRouteExpanded &&
          actions.map((action, i) => (
            <Fragment key={i}>
              {action.type === "SWAP" && (
                <SwapStep
                  action={action}
                  actions={actions}
                  id={action.id}
                  statusData={statusData}
                />
              )}
              {action.type === "TRANSFER" && (
                <TransferStep
                  action={action}
                  id={action.id}
                  statusData={statusData}
                />
              )}
            </Fragment>
          ))}
        {!isRouteExpanded && (
          <div className="flex h-14 w-14 items-center justify-center">
            <button
              className="rounded-full border-2 border-neutral-200 bg-white p-1 text-neutral-400 transition-transform hover:scale-110"
              onClick={() => setIsRouteExpanded(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
        <RouteEnd
          amount={amountOut}
          symbol={destinationAsset?.recommendedSymbol ?? "UNKNOWN"}
          logo={destinationAsset?.logoURI ?? "UNKNOWN"}
          chain={destinationChain?.prettyName ?? ""}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-[#FF486E]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx={12}
        cy={12}
        r={10}
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default RouteDisplay;
