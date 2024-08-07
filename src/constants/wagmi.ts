import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  celo,
  Chain,
  fantom,
  filecoin,
  kava,
  linea,
  mainnet,
  manta,
  moonbeam,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "wagmi/chains";

import { forma, formaTestnet } from "@/lib/viem/chains";

export const EVM_CHAINS: Chain[] = [
  arbitrum,
  avalanche,
  base,
  bsc,
  celo,
  fantom,
  filecoin,
  kava,
  linea,
  mainnet,
  manta,
  moonbeam,
  optimism,
  polygon,
  polygonMumbai,
  sepolia,
  avalancheFuji,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  blast,
  blastSepolia,
  forma,
  formaTestnet,
];
