import { Chain } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";

import { chainAddresses, useChainAddressesStore } from "@/context/chainAddresses";
import { trackWallet, TrackWalletCtx, useTrackWallet } from "@/context/track-wallet";

import { useMakeWallets } from "./useMakeWallets";

export const useAutoSetAddress = ({
  chain,
  chainID,
  index,
  enabled,
  signRequired,
}: {
  chain?: Chain;
  chainID: string;
  index: number;
  enabled?: boolean;
  signRequired?: boolean;
}) => {
  const trackedWallets = useTrackWallet(chain?.chainType as TrackWalletCtx);
  const addresses = useChainAddressesStore();
  const source = addresses?.[0];
  const destination = addresses?.[Object.values(addresses).length - 1];
  const current = addresses?.[index];
  const currentAcdress = current?.address;
  const isSameAsDestination =
    current?.source !== "input" &&
    destination?.source !== "input" &&
    destination?.source?.walletName === current?.source?.walletName;
  const isSameAsSource =
    current?.source !== "input" &&
    source?.source !== "input" &&
    source?.source?.walletName === current?.source?.walletName;

  const { makeWallets } = useMakeWallets();

  return useQuery({
    queryKey: [
      "auto-set-address",
      { chainID, chainType: chain?.chainType, trackedWallets, index, destination, currentSource: current?.source },
    ],
    queryFn: async () => {
      if (current?.source === "input") {
        return null;
      }
      const wallets = makeWallets(chainID);
      const { cosmos, evm, svm } = trackWallet.get();
      if (chain?.chainType === "cosmos") {
        // intermediary chain need to be signed and the source chain is same as the current chain
        if (index !== 0 && signRequired && source?.chainType === "cosmos" && cosmos) {
          const walletSelected = wallets.find((wallet) => wallet.walletName === cosmos?.walletName);
          const address = await walletSelected?.getAddress?.({ signRequired });
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        }
        // destination chain is cosmos and the source is not input
        if (
          Boolean(destination?.address) &&
          destination?.chainType === "cosmos" &&
          destination?.source !== "input" &&
          index !== 0 &&
          !signRequired
        ) {
          const walletName = destination.source?.walletName;
          const walletSelected = wallets.find((wallet) => wallet.walletName === walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        } else {
          const walletSelected = wallets.find((wallet) => wallet.walletName === cosmos?.walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        }
      }
      if (chain?.chainType === "evm") {
        // intermediary chain need to be signed and the source chain is same as the current chain
        if (index !== 0 && signRequired && source?.chainType === "evm" && evm) {
          const walletSelected = wallets.find((wallet) => wallet.walletName === evm?.walletName);
          const address = await walletSelected?.getAddress?.({ signRequired });
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        }
        // destination chain is evm and the source is not input
        if (
          Boolean(destination?.address) &&
          destination?.chainType === "evm" &&
          destination?.source !== "input" &&
          index !== 0
        ) {
          const walletName = destination.source?.walletName;
          const walletSelected = wallets.find((wallet) => wallet.walletName === walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        } else {
          const walletSelected = wallets.find((wallet) => wallet.walletName === evm?.walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        }
      }
      if (chain?.chainType === "svm") {
        if (
          Boolean(destination?.address) &&
          destination?.chainType === "svm" &&
          destination?.source !== "input" &&
          index !== 0
        ) {
          const walletName = destination.source?.walletName;
          const walletSelected = wallets.find((wallet) => wallet.walletName === walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        } else {
          const walletSelected = wallets.find((wallet) => wallet.walletName === svm?.walletName);
          const address = await walletSelected?.getAddress?.({});
          if (walletSelected && address) {
            chainAddresses.set({
              index,
              chainID,
              chainType: chain.chainType as TrackWalletCtx,
              address,
              source: walletSelected,
            });
          }
        }
      }
      return null;
    },
    enabled:
      enabled && !!chain?.chainType && !!trackedWallets && (!currentAcdress || !isSameAsDestination || !isSameAsSource),
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
