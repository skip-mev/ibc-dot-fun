import { Asset, SkipRouter } from "@skip-router/core";
import * as token from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, erc20Abi, http, PublicClient } from "viem";

import { multicall3ABI } from "@/constants/abis";
import { appUrl } from "@/constants/api";
import { EVM_CHAINS } from "@/constants/wagmi";
import { Chain } from "@/hooks/useChains";
import { useSkipClient } from "@/solve";
import { getCosmWasmClientForChainID, getStargateClientForChainID } from "@/utils/clients";

interface Args {
  address?: string;
  chain?: Chain;
  assets?: Asset[];
  enabled?: boolean;
}

export function useBalancesByChain({ address, chain, assets, enabled = true }: Args) {
  // const publicClient = usePublicClient({
  //   chainId: chain?.chainType === "evm" ? parseInt(chain.chainID) : undefined,
  // });
  const skipClient = useSkipClient();

  return useQuery({
    queryKey: ["USE_BALANCES_BY_CHAIN", address, chain, assets],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }
      if (chain.chainType === "evm") {
        const publicClient = createPublicClient({
          chain: EVM_CHAINS.find((i) => i.id === Number(chain.chainID)),
          transport: http(),
        });
        return getEvmChainBalances(skipClient, publicClient, address, chain.chainID);
      }
      if (chain.chainType === "cosmos") {
        return getBalancesByChain(address, chain.chainID, assets ?? []);
      }
      if (chain.chainType === "svm") {
        return getSvmChainBalances(address, chain.chainID, assets ?? []);
      }
    },
    enabled: !!chain && !!address && enabled,
  });
}

export async function getBalancesByChain(address: string, chainID: string, assets: Asset[]) {
  const [stargate, cosmwasm] = await Promise.all([
    getStargateClientForChainID(chainID),
    getCosmWasmClientForChainID(chainID),
  ]);

  const balances = await stargate.getAllBalances(address);

  const cw20Assets = assets.filter((asset) => asset.isCW20);
  const _cw20Balances = await Promise.all(
    cw20Assets.map(async (asset) => {
      try {
        return await cosmwasm.queryContractSmart(asset.tokenContract!, {
          balance: { address },
        });
      } catch (e) {
        return e;
      }
    }),
  );
  const cw20Balances = _cw20Balances.filter((result) => !(result instanceof Error));

  const allBalances = balances.reduce<Record<string, string>>(
    (acc, balance) => ({ ...acc, [balance.denom]: balance.amount }),
    {},
  );

  cw20Balances.forEach((balance, index) => {
    const asset = cw20Assets[index];
    if (balance.balance !== "0") {
      allBalances[asset.denom] = balance.balance;
    }
  });

  return allBalances;
}

export async function getEvmChainBalances(
  skipClient: SkipRouter,
  publicClient: PublicClient,
  address: string,
  chainID: string,
) {
  const assets = await skipClient.assets({
    chainID,
    includeEvmAssets: true,
  });

  const chainAssets = assets[chainID];

  if (chainID === "984122") {
    const balances: bigint[] = [];

    for (const asset of chainAssets) {
      if (asset.tokenContract) {
        const balance = await publicClient.readContract({
          address: asset.tokenContract as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        balances.push(balance);
      }

      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      balances.push(balance);
    }

    return chainAssets.reduce<Record<string, string>>(
      (acc, asset, i) => ({
        ...acc,
        [asset.denom]: balances[i].toString() || "0",
      }),
      {},
    );
  }

  const balances = await publicClient.multicall({
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    contracts: chainAssets.map((asset) => {
      if (!asset.tokenContract) {
        return {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`,
          abi: multicall3ABI,
          functionName: "getEthBalance",
          args: [address as `0x${string}`],
        };
      }

      return {
        address: asset.tokenContract as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      };
    }),
  });
  return chainAssets.reduce<Record<string, string>>(
    (acc, asset, i) => ({
      ...acc,
      [asset.denom]: balances[i].result?.toString() || "0",
    }),
    {},
  );
}

export const getSvmChainBalances = async (address: string, chainID: string, assets: Asset[]) => {
  const rpc = `${appUrl}/api/rpc/${chainID}`;
  const connection = new Connection(rpc);
  // get SOL balance
  const solBalance = await connection.getBalance(new PublicKey(address));
  // solana-devnet
  const allBalances: Record<string, string> = {};
  if (chainID === "solana-devnet") {
    allBalances["solana-devnet-native"] = solBalance.toString();
  }
  // solana-mainnet
  if (chainID === "solana") {
    allBalances["solana-native"] = solBalance.toString();
  }

  const _splTokenBalances = await Promise.all(
    assets
      .filter((i) => i.denom !== "solana-devnet-native")
      .map(async (asset) => {
        try {
          const tokenAddress = await token.getAssociatedTokenAddress(
            new PublicKey(asset.denom),
            new PublicKey(address),
          );
          const tokenBalance = await token.getAccount(connection, tokenAddress);
          return {
            denom: asset.denom,
            amount: tokenBalance.amount.toString(),
          };
        } catch (e) {
          return e;
        }
      }),
  );
  const splTokenBalances = _splTokenBalances.filter((result) => !(result instanceof Error)) as {
    denom: string;
    amount: string;
  }[];

  splTokenBalances.forEach((balance) => {
    if (balance instanceof Error) return;
    allBalances[balance.denom] = balance.amount;
  });

  return allBalances;
};
