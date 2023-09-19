import { useQuery } from "@tanstack/react-query";
import { getContract, zeroAddress } from "viem";
import { erc20ABI, useAccount, usePublicClient } from "wagmi";

import { Chain } from "@/context/chains";
import { useSkipClient } from "@/solve";
import { getStargateClientForChainID, isEVMChain } from "@/utils/utils";

export function chainNameToChainlistURL(chainName: string) {
  const idToNameMap: Record<string, string> = {
    kichain: "ki-chain",
    fetchhub: "fetchai",
    mars: "mars-protocol",
    assetmantle: "asset-mantle",
    omniflixhub: "omniflix",
    gravitybridge: "gravity-bridge",
    terra2: "terra",
    cosmoshub: "cosmos",
    cryptoorgchain: "crypto-org",
  };

  const name = idToNameMap[chainName] || chainName;

  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${name}`;
}

export async function getBalancesByChain(address: string, chainID: string) {
  const client = await getStargateClientForChainID(chainID);

  const balances = await client.getAllBalances(address);

  return balances.reduce(
    (acc, balance) => {
      return {
        ...acc,
        [balance.denom]: balance.amount,
      };
    },
    {} as Record<string, string>,
  );
}

const denomsToAddressMap: Record<string, Record<string, `0x${string}`>> = {
  "42161": {
    "arb-wei": "0x912CE59144191C1204E64559FE8253a0e49E6548",
    axlusdc: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
  },
  "43114": {
    "wavax-wei": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
};

export function useBalancesByChain(
  address?: string,
  chain?: Chain,
  enabled: boolean = true,
) {
  const { address: evmAddress } = useAccount();
  const skipClient = useSkipClient();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["balances-by-chain", address, chain?.chainID],
    queryFn: async () => {
      console.log("balances by chain");
      if (!chain || !address) {
        return {};
      }

      if (isEVMChain(chain.chainID)) {
        if (!evmAddress) {
          return {};
        }

        const chainAssets = await skipClient.assets({
          chainID: chain.chainID,
        });

        const balances: Record<string, string> = {};

        for (const chainAsset of chainAssets[chain.chainID]) {
          const assetAddress =
            denomsToAddressMap[chain.chainID][chainAsset.denom];

          console.log(chainAsset);
          console.log(assetAddress);

          if (assetAddress === zeroAddress) {
            const balance = await publicClient.getBalance({
              address: evmAddress,
            });

            balances[chainAsset.denom] = balance.toString();
          } else {
            const contract = getContract({
              abi: erc20ABI,
              address: assetAddress,
              publicClient,
            });

            const balance = await contract.read.balanceOf([evmAddress]);

            balances[chainAsset.denom] = balance.toString();
          }
        }

        return balances;
      }

      const balances = await getBalancesByChain(address, chain.chainID);

      return balances;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
    enabled: !!chain && !!address && enabled,
  });
}
