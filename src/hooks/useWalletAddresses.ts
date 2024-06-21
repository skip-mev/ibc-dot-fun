import { useManager } from "@cosmos-kit/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount as useWagmiAccount } from "wagmi";

import { useAccount } from "@/hooks/useAccount";
import { useChains } from "@/hooks/useChains";

export function useWalletAddresses(chainIDs: string[]) {
  const { data: chains = [] } = useChains();

  const { address: evmAddress } = useWagmiAccount();
  const { getWalletRepo } = useManager();
  const { wallets } = useWallet();

  const cosmos = useAccount("cosmos");
  const svm = useAccount("svm");

  const queryKey = useMemo(() => ["USE_WALLET_ADDRESSES", chainIDs] as const, [chainIDs]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, chainIDs] }) => {
      const record: Record<string, string> = {};

      const srcChain = chains.find(({ chainID }) => {
        return chainID === chainIDs.at(0);
      });

      for (const currentChainID of chainIDs) {
        const chain = chains.find(({ chainID }) => chainID === currentChainID);
        if (!chain) {
          throw new Error(`useWalletAddresses error: cannot find chain '${currentChainID}'`);
        }

        if (chain.chainType === "cosmos") {
          const { wallets } = getWalletRepo(chain.chainName);

          const currentWalletName = (() => {
            // if `chainID` is the source or destination chain
            if (srcChain?.chainID === currentChainID) {
              return cosmos?.wallet?.walletName;
            }

            // if `chainID` isn't the source or destination chain
            if (srcChain?.chainType === "cosmos") {
              return cosmos?.wallet?.walletName;
            }
          })();

          if (!currentWalletName) {
            throw new Error(`useWalletAddresses error: cannot find wallet for '${chain.chainName}'`);
          }

          const wallet = wallets.find(({ walletName }) => walletName === currentWalletName);
          if (!wallet) {
            throw new Error(`useWalletAddresses error: cannot find wallet for '${chain.chainName}'`);
          }
          if (wallet.isWalletDisconnected || !wallet.isWalletConnected) {
            await wallet.connect();
          }
          if (!wallet.address) {
            throw new Error(`useWalletAddresses error: cannot resolve wallet address for '${chain.chainName}'`);
          }
          record[currentChainID] = wallet.address;
        }

        if (chain.chainType === "evm") {
          if (!evmAddress) {
            throw new Error(`useWalletAddresses error: evm wallet not connected`);
          }
          record[currentChainID] = evmAddress;
        }

        if (chain.chainType === "svm") {
          const solanaWallet = wallets.find((w) => w.adapter.name === svm?.wallet?.walletName);

          if (!solanaWallet?.adapter.publicKey) {
            throw new Error(`useWalletAddresses error: svm wallet not connected`);
          }
          record[currentChainID] = solanaWallet.adapter.publicKey.toBase58();
        }
      }

      return record;
    },
  });
}
