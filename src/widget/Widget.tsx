import { ChainProvider } from "@cosmos-kit/react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ComponentProps, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { SwapWidget } from "@/components/SwapWidget";
import { WalletModalProvider } from "@/components/WalletModal";
import { metadata } from "@/constants/seo";
import { AssetsProvider } from "@/context/assets";
import { wallets } from "@/lib/cosmos-kit";
import { persister, queryClient } from "@/lib/react-query";
import { solanaWallets } from "@/lib/solana-wallet-adapter";
import { config } from "@/lib/wagmi";
import { SkipProvider } from "@/solve";

type ChainProviderProps = ComponentProps<typeof ChainProvider>;

const assets = getAssetLists() as ChainProviderProps["assetLists"];
const chains = getChains() as ChainProviderProps["chains"];

export const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider
      wallets={solanaWallets}
      localStorageKey="solana-wallet"
      autoConnect
      key="skip-widget-solana-wallet"
    >
      <ChainProvider
        assetLists={assets}
        chains={chains}
        sessionOptions={{
          duration: 1000 * 60 * 60 * 24, // 1 day
        }}
        throwErrors={false}
        walletConnectOptions={
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
            ? {
                signClient: {
                  name: metadata.name,
                  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
                },
              }
            : undefined
        }
        wallets={wallets}
        key={"skip-widget-chain-provider"}
      >
        <WagmiProvider
          config={config}
          key={"skip-widget-wagmi-provider"}
        >
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
            key={"skip-widget"}
          >
            <SkipProvider>
              <AssetsProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{ duration: 1000 * 10 }}
                />
              </AssetsProvider>
            </SkipProvider>
          </PersistQueryClientProvider>
        </WagmiProvider>
      </ChainProvider>
    </WalletProvider>
  );
};

export const Widget = () => {
  return (
    <WalletModalProvider>
      <SwapWidget />
    </WalletModalProvider>
  );
};
